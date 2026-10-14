import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore with specific database ID if configured
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Validate Connection to Firestore on startup
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is offline or unreachable:', error.message);
      return false;
    }
    // Any permission error still means connection to the server was established
    return true;
  }
}

// Ensure an authenticated session exists for Admin operations if available
export async function ensureAdminAuth(): Promise<void> {
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      // Anonymous authentication may be disabled in the Firebase project console.
      // Log as warning and continue gracefully so dashboard operations proceed uninterrupted.
      console.warn('Firebase anonymous authentication unavailable or restricted:', error);
    }
  }
}

export { app };
