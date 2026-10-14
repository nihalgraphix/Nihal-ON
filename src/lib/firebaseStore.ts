import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore, 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  addDoc, 
  serverTimestamp,
  getDocFromServer,
  Firestore
} from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import { StudioData, MediaAsset } from '../types/studio';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const FIRESTORE_DB_ID = "ai-studio-nihalportfolio-d87c5a65-d696-41db-8c1d-800d624328fc";

let dbInstance: Firestore;
try {
  dbInstance = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
  }, FIRESTORE_DB_ID);
} catch (e1) {
  try {
    dbInstance = initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
    });
  } catch (e2) {
    dbInstance = getFirestore(app);
  }
}

export const db = dbInstance;
export const storage = getStorage(app);

// Helper for timing out Firestore requests so local server fallback is immediate if connection stalls
function withTimeout<T>(promise: Promise<T>, timeoutMs = 3000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Firestore request timed out after ${timeoutMs}ms`)), timeoutMs);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// Validate connection on startup as recommended by guidelines
async function testConnection() {
  try {
    await withTimeout(getDocFromServer(doc(db, '_connection', 'health')), 2000);
  } catch (err) {
    // Graceful offline/local mode note
    console.log("Firestore operating with long-polling / local storage sync enabled.");
  }
}
testConnection();

// Direct document operations
export async function deleteFirestoreDocument(collectionName: string, id: string): Promise<boolean> {
  try {
    await withTimeout(deleteDoc(doc(db, collectionName, id)), 3000);
    return true;
  } catch (err) {
    console.warn(`Firestore delete note on ${collectionName}/${id}:`, err);
    return false;
  }
}

export async function setFirestoreDocument(collectionName: string, id: string, data: any): Promise<boolean> {
  try {
    await withTimeout(setDoc(doc(db, collectionName, id), {
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true }), 3000);
    return true;
  } catch (err) {
    console.warn(`Firestore setDoc note on ${collectionName}/${id}:`, err);
    return false;
  }
}

export async function fetchFirestoreCollection<T = any>(collectionName: string): Promise<Record<string, T>> {
  const result: Record<string, T> = {};
  try {
    const querySnapshot = await withTimeout(getDocs(collection(db, collectionName)), 3000);
    querySnapshot.forEach((docSnap) => {
      result[docSnap.id] = docSnap.data() as T;
    });
  } catch (err) {
    console.warn(`Firestore fetch collection note on ${collectionName}:`, err);
  }
  return result;
}

// Save Studio Data: Sync to both Firestore and local server
export async function persistStudioData(data: StudioData, isPublish: boolean = false): Promise<boolean> {
  let firestoreSuccess = false;
  let serverSuccess = false;

  // 1. Attempt Firestore write
  try {
    const docName = isPublish ? 'published' : 'draft';
    await withTimeout(setDoc(doc(db, 'portfolio_studio', docName), {
      ...data,
      updatedAt: serverTimestamp(),
    }), 3000);
    firestoreSuccess = true;
  } catch (err) {
    console.warn('Firestore sync note (will rely on server persistent storage):', err);
  }

  // 2. Server persistent write
  try {
    const endpoint = isPublish ? '/api/studio/publish' : '/api/studio/draft';
    const payload = isPublish ? { data, note: 'Studio Publish' } : { draft: data };
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      serverSuccess = true;
    }
  } catch (err) {
    console.error('Server sync error:', err);
  }

  return firestoreSuccess || serverSuccess;
}

// Load Studio Data (fetches published or draft)
export async function fetchStudioData(isDraft: boolean = false): Promise<StudioData | null> {
  // 1. Try server first (fastest local response)
  try {
    const endpoint = isDraft ? '/api/studio/draft' : '/api/studio/data';
    const res = await fetch(endpoint);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const json = await res.json();
      const loaded = isDraft ? json.draft : json.data;
      if (loaded && loaded.elements) {
        return loaded as StudioData;
      }
    }
  } catch (err) {
    console.warn('Server fetch error:', err);
  }

  // 2. Fallback to Firestore
  try {
    const docName = isDraft ? 'draft' : 'published';
    const docSnap = await withTimeout(getDoc(doc(db, 'portfolio_studio', docName)), 3000);
    if (docSnap.exists()) {
      return docSnap.data() as StudioData;
    }
  } catch (err) {
    console.warn('Firestore fetch error:', err);
  }

  return null;
}

export function compressImageDataUrl(dataUrl: string, maxWidth = 1920, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:image')) {
      return resolve(dataUrl);
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > maxWidth || height > maxWidth) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        return resolve(compressed);
      }
      resolve(dataUrl);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

// Upload Media Asset (Stores in Server Media Uploads with Firebase fallback)
export async function uploadMediaAsset(fileDataUrl: string, filename: string, title?: string, category?: string): Promise<MediaAsset> {
  let downloadUrl = fileDataUrl;

  // 1. Compress image client-side to ensure fast loading
  try {
    downloadUrl = await compressImageDataUrl(fileDataUrl, 1920, 0.85);
  } catch (e) {
    console.warn('Canvas compression note:', e);
  }

  // 2. Upload to server local static storage (/uploads/...)
  try {
    const res = await fetch('/api/studio/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileDataUrl: downloadUrl, filename }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.url) {
        downloadUrl = json.url;
      }
    }
  } catch (err) {
    console.warn('Server upload note:', err);
  }

  // 3. Fallback to Firebase Storage if still dataUrl
  if (downloadUrl.startsWith('data:image')) {
    try {
      const storagePath = `portfolio_assets/${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const storageRef = ref(storage, storagePath);
      await uploadString(storageRef, downloadUrl, 'data_url');
      downloadUrl = await getDownloadURL(storageRef);
    } catch (err) {
      console.warn('Firebase Storage upload note:', err);
    }
  }

  const mediaItem: MediaAsset = {
    id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: title || filename.split('.')[0] || 'Uploaded Media',
    url: downloadUrl,
    thumbnailUrl: downloadUrl,
    caption: '',
    alt: title || 'Portfolio asset',
    category: category || 'General',
    format: filename.split('.').pop() || 'image',
    size: `${Math.round((downloadUrl.length * 0.75) / 1024)} KB`,
    dimensions: '1920x1080',
    createdAt: new Date().toISOString(),
  };

  // Record on server media registry
  try {
    await fetch('/api/studio/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item: mediaItem }),
    });
  } catch (err) {
    console.warn('Server media registration note:', err);
  }

  // Record in Firestore mediaAssets collection if safe size
  if (!mediaItem.url.startsWith('data:image') || mediaItem.url.length < 900000) {
    try {
      await withTimeout(addDoc(collection(db, 'mediaAssets'), mediaItem), 3000);
    } catch (err) {
      // Ignore if offline
    }
  }

  return mediaItem;
}
