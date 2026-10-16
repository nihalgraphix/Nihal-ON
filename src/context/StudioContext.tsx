import React, { createContext, useContext, useState, useEffect, useCallback, useTransition } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, googleSignIn, logoutGoogle } from '../lib/firebaseAuth';
import { StudioData, EditableElement, ElementTypography, ElementAppearance, ElementSpacing, ElementDimensions, SiteSettings, DesignTokens, SectionSeoMap, SectionSeoMetadata } from '../types/studio';
import { DEFAULT_STUDIO_DATA } from '../data/defaultStudioData';
import { DEFAULT_SECTION_SEO } from '../data/defaultSeoData';
import { PROJECTS } from '../data/portfolioData';
import { SITE_TEXTS } from '../data/siteTexts';
import { persistStudioData, fetchStudioData, deleteFirestoreDocument, setFirestoreDocument, fetchFirestoreCollection, revokeAllAdminSessionsFirestore, fetchAdminSessionRevocationTime } from '../lib/firebaseStore';
import { Project, BlogPost, GalleryItem, SkillCategory } from '../types';

export type StudioTab = 
  | 'overview' 
  | 'editor' 
  | 'projects' 
  | 'blog' 
  | 'gallery' 
  | 'skills'
  | 'text'
  | 'seo'
  | 'media' 
  | 'analytics' 
  | 'inbox' 
  | 'design-system' 
  | 'settings';



export type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

interface StudioContextType {
  user: User | null;
  isAdmin: boolean;
  isStudioOpen: boolean;
  activeTab: StudioTab;
  selectedElementId: string | null;
  hoveredElementId: string | null;
  previewDevice: PreviewDevice;
  canvasZoom: number;
  interactMode: boolean;
  draftData: StudioData;
  publishedData: StudioData;
  saveStatus: 'saved' | 'saving' | 'unsaved' | 'error';
  isDirty: boolean;
  selectedElement: EditableElement | null;
  
  // Navigation & UI controls
  isAdminButtonVisible: boolean;
  setIsAdminButtonVisible: (val: boolean | ((prev: boolean) => boolean)) => void;
  toggleAdminButton: () => void;
  openStudio: (tab?: StudioTab) => void;
  closeStudio: () => void;
  setActiveTab: (tab: StudioTab) => void;
  setPreviewDevice: (device: PreviewDevice) => void;
  setCanvasZoom: (zoom: number | ((prev: number) => number)) => void;
  setInteractMode: (mode: boolean) => void;
  selectElement: (id: string | null) => void;
  setHoveredElement: (id: string | null) => void;

  // Visual Element Updates
  getTextNode: (id: string, defaultText?: string) => string;
  updateTextNode: (id: string, text: string) => Promise<void>;
  updateElement: (id: string, updates: Partial<EditableElement>) => void;
  updateElementTypography: (id: string, typography: Partial<ElementTypography>) => void;
  updateElementAppearance: (id: string, appearance: Partial<ElementAppearance>) => void;
  updateElementSpacing: (id: string, spacing: Partial<ElementSpacing>) => void;
  updateElementDimensions: (id: string, dimensions: Partial<ElementDimensions>) => void;
  updateElementAlignment: (id: string, alignment: Partial<import('../types/studio').ElementAlignment>) => void;
  updateElementContent: (id: string, content: Partial<NonNullable<EditableElement['content']>>) => void;
  addElement: (element: EditableElement) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;

  // Publishing & History
  saveDraft: () => Promise<void>;
  publish: () => Promise<void>;
  discardDraft: () => void;
  resetToDefault: () => Promise<void>;
  resetAllTextToOriginal: () => Promise<void>;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Content Operations
  updateSiteSettings: (settings: Partial<SiteSettings>) => void;
  updateDesignTokens: (tokens: Partial<DesignTokens>) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addBlogPost: (post: BlogPost) => void;
  updateBlogPost: (id: string, post: Partial<BlogPost>) => void;
  deleteBlogPost: (id: string) => void;
  addGalleryItem: (item: GalleryItem) => void;
  updateGalleryItem: (id: string, item: Partial<GalleryItem>) => void;
  deleteGalleryItem: (id: string) => void;
  reorderGalleryItem: (fromIndex: number, toIndex: number) => void;
  addGalleryCategory: (category: string) => void;
  deleteGalleryCategory: (category: string) => void;
  updateSkillCategories: (categories: SkillCategory[]) => void;
  updateSectionSeo: (sectionKey: string, seo: Partial<SectionSeoMetadata>) => Promise<void>;
  saveAllSectionSeo: (seoMap: SectionSeoMap) => Promise<void>;

  // Auth
  loginCredentials: (username: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  signOutAllDevices: () => Promise<void>;
  trackEvent: (type: 'pageview' | 'project_click' | 'contact_submit' | 'cv_download' | 'section_view', label?: string) => void;
}

export const ADMIN_USERNAME = 'nihalmunnusalmanizar2244';
export const ADMIN_PASSWORD = 'nihalbilalsalmanizar001322';

const LOCAL_STORAGE_PUB_KEY = 'nihal_studio_pub_data_v5';
const LOCAL_STORAGE_DRAFT_KEY = 'nihal_studio_draft_data_v5';

function sanitizeStudioData(data: StudioData): StudioData {
  if (!data || !data.elements) return data;
  const elements = { ...data.elements };
  
  // Ensure hero model image is valid and not pointing to the old N logo
  if (elements['hero-model-image']) {
    const imgUrl = elements['hero-model-image'].content?.imageUrl;
    if (!imgUrl || imgUrl.includes('regenerated_image_1785757234835') || imgUrl === 'none' || imgUrl === '') {
      elements['hero-model-image'] = {
        ...elements['hero-model-image'],
        content: {
          ...elements['hero-model-image'].content,
          imageUrl: DEFAULT_STUDIO_DATA.elements['hero-model-image'].content?.imageUrl || '',
          alt: 'Nihal — 16-Year-Old Developer & Graphic Designer Portrait',
        },
        visible: true,
      };
    }
  }

  // Force pristine texts from SITE_TEXTS for all Hero section elements & text nodes
  elements['hero-badge'] = {
    ...elements['hero-badge'],
    content: { ...(elements['hero-badge']?.content || {}), text: SITE_TEXTS.hero.badge }
  };
  elements['hero-badge-text'] = {
    ...elements['hero-badge-text'],
    content: { ...(elements['hero-badge-text']?.content || {}), text: SITE_TEXTS.hero.badge }
  };
  elements['hero-headline'] = {
    ...elements['hero-headline'],
    content: { text: SITE_TEXTS.hero.headline, subtext: SITE_TEXTS.hero.headlineSubtext }
  };
  elements['hero-headline-text'] = {
    ...elements['hero-headline-text'],
    content: { text: SITE_TEXTS.hero.headline }
  };
  elements['hero-subtext'] = {
    ...elements['hero-subtext'],
    content: { text: SITE_TEXTS.hero.subtext }
  };
  elements['hero-subtext-para'] = {
    ...elements['hero-subtext-para'],
    content: { text: SITE_TEXTS.hero.subtext }
  };
  elements['hero-btn-primary'] = {
    ...elements['hero-btn-primary'],
    content: { text: SITE_TEXTS.hero.btnPrimary, link: '#about' }
  };
  elements['hero-btn-secondary'] = {
    ...elements['hero-btn-secondary'],
    content: { text: SITE_TEXTS.hero.btnSecondary, link: '#contact' }
  };
  elements['hero-quote'] = {
    ...elements['hero-quote'],
    content: { text: SITE_TEXTS.hero.quote }
  };
  elements['hero-quote-text'] = {
    ...elements['hero-quote-text'],
    content: { text: SITE_TEXTS.hero.quote }
  };
  elements['hero-growth-label'] = {
    ...elements['hero-growth-label'],
    content: { text: SITE_TEXTS.hero.growthLabel }
  };
  elements['hero-growth-label-text'] = {
    ...elements['hero-growth-label-text'],
    content: { text: SITE_TEXTS.hero.growthLabel }
  };
  elements['hero-growth-value'] = {
    ...elements['hero-growth-value'],
    content: { text: SITE_TEXTS.hero.growthValue }
  };
  elements['hero-growth-value-text'] = {
    ...elements['hero-growth-value-text'],
    content: { text: SITE_TEXTS.hero.growthValue }
  };
  elements['hero-scroll-pill-text'] = {
    ...elements['hero-scroll-pill-text'],
    content: { text: SITE_TEXTS.hero.scrollPill }
  };
  if (elements['about-heading']?.content?.text?.includes('Bridging Imagination') || elements['about-heading']?.content?.text?.includes('A small studio')) {
    elements['about-heading'] = {
      ...elements['about-heading'],
      content: { text: "Turning ideas into meaningful digital experiences." }
    };
  }
  if (elements['about-bio']?.content?.text?.includes('6+ years') || elements['about-bio']?.content?.text?.includes('Design direction, product thinking')) {
    elements['about-bio'] = {
      ...elements['about-bio'],
      content: { text: "Nihal — a 16-year-old Developer & Graphic Designer from Kochi, Kerala, India. From developing interactive web apps to designing graphics and experimenting with AI tools, always exploring new ways to bring ideas to life." }
    };
  }
  if (elements['about-credentials']?.content?.text?.includes('6+ years')) {
    elements['about-credentials'] = {
      ...elements['about-credentials'],
      content: { text: "Age is no barrier\nto innovation." }
    };
  }
  if (elements['about-selected-work']?.content?.text?.includes('Product systems')) {
    elements['about-selected-work'] = {
      ...elements['about-selected-work'],
      content: { text: "Web apps, UI/UX,\ngraphics & AI tools." }
    };
  }
  if (elements['about-story-title']?.content?.text?.includes('From visual craft')) {
    elements['about-story-title'] = {
      ...elements['about-story-title'],
      content: { text: "16-Year-Old Developer & Graphic Designer" }
    };
  }
  if (elements['about-education-1']?.content?.text?.includes('University of California')) {
    elements['about-education-1'] = {
      ...elements['about-education-1'],
      content: { text: "High School Student & Tech Enthusiast\nKochi, Kerala, India (FOUNDATIONS)" }
    };
  }
  if (elements['about-education-2']?.content?.text?.includes('Stanford University')) {
    elements['about-education-2'] = {
      ...elements['about-education-2'],
      content: { text: "Frontend, UI/UX, AI Tools & Game Graphics\nAlways learning. Always building. Always creating. (FOCUS)" }
    };
  }
  if (elements['footer-creator-bio']?.content?.text?.includes('Nihal is independent creative director')) {
    elements['footer-creator-bio'] = {
      ...elements['footer-creator-bio'],
      content: { text: "Hi, I'm Nihal — 16-Year-Old Developer & Graphic Designer\nFrom Kochi, Kerala, India. Passionate about technology, creativity, and turning ideas into meaningful digital experiences." }
    };
  }

  return { ...data, elements };
}

const getInitialPubData = (): StudioData => {
  try {
    localStorage.removeItem(LOCAL_STORAGE_PUB_KEY);
    localStorage.removeItem(LOCAL_STORAGE_DRAFT_KEY);
  } catch (e) {}
  return DEFAULT_STUDIO_DATA;
};

const getInitialDraftData = (): StudioData => {
  return DEFAULT_STUDIO_DATA;
};

const StudioContext = createContext<StudioContextType | null>(null);

export function StudioProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('nihal_portfolio_admin_auth') === 'true';
  });
  const [isStudioOpen, setIsStudioOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<StudioTab>('overview');
  const [selectedElementId, setSelectedElementId] = useState<string | null>('hero-headline');
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [canvasZoom, setCanvasZoom] = useState<number>(100);
  const [interactMode, setInteractMode] = useState<boolean>(false);

  const [isAdminButtonVisible, setIsAdminButtonVisible] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem('nihal_admin_button_visible') === 'true' ||
        sessionStorage.getItem('nihal_admin_button_visible') === 'true'
      );
    } catch {
      return false;
    }
  });

  const toggleAdminButton = useCallback(() => {
    setIsAdminButtonVisible((prev) => {
      const next = !prev;
      try {
        if (next) {
          localStorage.setItem('nihal_admin_button_visible', 'true');
          sessionStorage.setItem('nihal_admin_button_visible', 'true');
        } else {
          localStorage.removeItem('nihal_admin_button_visible');
          sessionStorage.removeItem('nihal_admin_button_visible');
        }
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const [publishedData, setPublishedData] = useState<StudioData>(getInitialPubData);
  const [draftData, setDraftData] = useState<StudioData>(getInitialDraftData);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved');

  const [undoStack, setUndoStack] = useState<StudioData[]>([]);
  const [redoStack, setRedoStack] = useState<StudioData[]>([]);
  const [, startTransition] = useTransition();

  // Keep local storage synced for ultra-fast instant rendering
  const cacheDraftData = useCallback((data: StudioData) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_DRAFT_KEY, JSON.stringify(data));
    } catch (e) {
      // Storage quota safety
    }
  }, []);

  const cachePubData = useCallback((data: StudioData) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PUB_KEY, JSON.stringify(data));
    } catch (e) {
      // Storage quota safety
    }
  }, []);

  // Periodic, Startup & Visibility check to enforce global device session revocation
  useEffect(() => {
    let isMounted = true;

    const verifySessionValidity = async () => {
      const savedAuth = localStorage.getItem('nihal_portfolio_admin_auth');
      if (savedAuth !== 'true') return;

      const sessionTimeStr = localStorage.getItem('nihal_admin_session_time');
      const sessionTime = sessionTimeStr ? parseInt(sessionTimeStr, 10) : 0;

      try {
        const [serverStatus, firestoreEpoch] = await Promise.allSettled([
          fetch('/api/studio/auth/session-status').then((r) => r.json()).catch(() => null),
          fetchAdminSessionRevocationTime().catch(() => 0),
        ]);

        const serverRevokedBefore = (serverStatus.status === 'fulfilled' && serverStatus.value?.revokedBefore) || 0;
        const firestoreRevokedBefore = (firestoreEpoch.status === 'fulfilled' && firestoreEpoch.value) || 0;
        const latestRevocationEpoch = Math.max(serverRevokedBefore, firestoreRevokedBefore);

        // If a global sign-out was requested, or this session was created before the revocation time, invalidate immediately!
        if (latestRevocationEpoch > 0 && sessionTime < latestRevocationEpoch) {
          console.warn('Admin session was revoked globally across all devices. Logging out.');
          if (isMounted) {
            setIsAdmin(false);
            setUser(null);
            setIsStudioOpen(false);
            localStorage.removeItem('nihal_portfolio_admin_auth');
            localStorage.removeItem('nihal_admin_session_time');
          }
        }
      } catch (err) {
        // network resilience
      }
    };

    verifySessionValidity();
    const interval = setInterval(verifySessionValidity, 8000);
    window.addEventListener('focus', verifySessionValidity);
    document.addEventListener('visibilitychange', verifySessionValidity);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', verifySessionValidity);
      document.removeEventListener('visibilitychange', verifySessionValidity);
    };
  }, []);

  // Restore authenticated session strictly from verified username/password session
  useEffect(() => {
    const savedAuth = localStorage.getItem('nihal_portfolio_admin_auth');
    const sessionTimeStr = localStorage.getItem('nihal_admin_session_time');

    if (savedAuth === 'true' && sessionTimeStr) {
      setIsAdmin(true);
      setUser({
        uid: 'admin-nihal-verified',
        email: ADMIN_USERNAME,
        displayName: 'Muhammed Nihal (Admin)',
        emailVerified: true,
        isAnonymous: false,
      } as unknown as User);
    } else {
      setIsAdmin(false);
      setUser(null);
    }
  }, []);

  // High-performance parallel initial data load
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [pubRes, draftRes, textNodesRes, projectsRes, blogRes, galleryRes, settingsRes] = await Promise.allSettled([
          fetchStudioData(false),
          fetchStudioData(true),
          fetchFirestoreCollection<{ id: string; text: string }>('textNodes'),
          fetchFirestoreCollection<Project>('projects'),
          fetchFirestoreCollection<BlogPost>('blogPosts'),
          fetchFirestoreCollection<GalleryItem>('galleryItems'),
          fetchFirestoreCollection('settings'),
        ]);

        if (!isMounted) return;

        const fetchedPub = pubRes.status === 'fulfilled' && pubRes.value ? pubRes.value : null;
        const fetchedDraft = draftRes.status === 'fulfilled' && draftRes.value ? draftRes.value : null;

        let basePub = fetchedPub || getInitialPubData();
        let baseDraft = fetchedDraft || (fetchedPub ? fetchedPub : getInitialDraftData());

        // Ensure projects fallback to default if empty
        if (!basePub.projects || basePub.projects.length === 0) {
          basePub = { ...basePub, projects: PROJECTS };
        }
        if (!baseDraft.projects || baseDraft.projects.length === 0) {
          baseDraft = { ...baseDraft, projects: PROJECTS };
        }

        // Merge textNodes if available
        if (textNodesRes.status === 'fulfilled' && textNodesRes.value && typeof textNodesRes.value === 'object') {
          const textNodes = textNodesRes.value;
          const updatedElementsDraft = { ...(baseDraft?.elements || {}) };
          const updatedElementsPub = { ...(basePub?.elements || {}) };

          Object.entries(textNodes).forEach(([id, nodeData]) => {
            if (nodeData && nodeData.text !== undefined) {
              const existingDraft = updatedElementsDraft[id] || { id, label: id, section: 'text_node', type: 'text', visible: true };
              updatedElementsDraft[id] = {
                ...existingDraft,
                content: { ...(existingDraft.content || {}), text: nodeData.text },
              };

              const existingPub = updatedElementsPub[id] || { id, label: id, section: 'text_node', type: 'text', visible: true };
              updatedElementsPub[id] = {
                ...existingPub,
                content: { ...(existingPub.content || {}), text: nodeData.text },
              };
            }
          });

          baseDraft = { ...baseDraft, elements: updatedElementsDraft };
          basePub = { ...basePub, elements: updatedElementsPub };
        }

        // Merge projects, blogPosts, galleryItems safely
        if (projectsRes.status === 'fulfilled' && projectsRes.value && typeof projectsRes.value === 'object') {
          const projectList = Object.values(projectsRes.value).filter(Boolean);
          if (projectList.length > 0) {
            baseDraft = { ...baseDraft, projects: projectList };
            basePub = { ...basePub, projects: projectList };
          }
        }

        if (blogRes.status === 'fulfilled' && blogRes.value && typeof blogRes.value === 'object') {
          const blogList = Object.values(blogRes.value).filter(Boolean);
          if (blogList.length > 0) {
            baseDraft = { ...baseDraft, blogPosts: blogList };
            basePub = { ...basePub, blogPosts: blogList };
          }
        }

        if (galleryRes.status === 'fulfilled' && galleryRes.value && typeof galleryRes.value === 'object') {
          const galleryList = Object.values(galleryRes.value).filter(Boolean);
          if (galleryList.length > 0) {
            baseDraft = { ...baseDraft, galleryItems: galleryList };
            basePub = { ...basePub, galleryItems: galleryList };
          }
        }

        // Merge SEO metadata if available directly from Firestore
        if (settingsRes.status === 'fulfilled' && settingsRes.value && typeof settingsRes.value === 'object') {
          const seoDoc = settingsRes.value['seo_metadata'] as any;
          const siteConfigDoc = settingsRes.value['site_config'] as any;
          const mergedSeo = seoDoc?.sections || siteConfigDoc?.sectionSeo;
          if (mergedSeo && typeof mergedSeo === 'object') {
            baseDraft = {
              ...baseDraft,
              siteSettings: {
                ...baseDraft.siteSettings,
                sectionSeo: {
                  ...DEFAULT_SECTION_SEO,
                  ...(baseDraft.siteSettings?.sectionSeo || {}),
                  ...mergedSeo,
                },
              },
            };
            basePub = {
              ...basePub,
              siteSettings: {
                ...basePub.siteSettings,
                sectionSeo: {
                  ...DEFAULT_SECTION_SEO,
                  ...(basePub.siteSettings?.sectionSeo || {}),
                  ...mergedSeo,
                },
              },
            };
          }
        }

        basePub = sanitizeStudioData(basePub);
        baseDraft = sanitizeStudioData(baseDraft);

        startTransition(() => {
          setPublishedData(basePub);
          setDraftData(baseDraft);
        });

        cachePubData(basePub);
        cacheDraftData(baseDraft);
      } catch (err) {
        console.warn('Fast data loading note:', err);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [cacheDraftData, cachePubData]);

  // Debounced auto-save draft when dirty
  useEffect(() => {
    if (!isDirty) return;
    setSaveStatus('unsaved');
    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await persistStudioData(draftData, false);
        setSaveStatus('saved');
        setIsDirty(false);
      } catch (err) {
        console.error('Auto-save error:', err);
        setSaveStatus('error');
      }
    }, 1800);
    return () => clearTimeout(timer);
  }, [draftData, isDirty]);

  // Helper to record history before state updates
  const pushUndoState = useCallback((prev: StudioData) => {
    setUndoStack(s => [...s.slice(-25), JSON.parse(JSON.stringify(prev))]);
    setRedoStack([]);
  }, []);

  // Text Node Operations - Always serves original default text from SITE_TEXTS
  const getTextNode = useCallback((id: string, defaultText: string = ''): string => {
    // Explicit baseline overrides for hero text nodes derived directly from SITE_TEXTS
    if (id === 'hero-headline-text' || id === 'hero-headline') return SITE_TEXTS.hero.headline;
    if (id === 'hero-badge-text' || id === 'hero-badge') return SITE_TEXTS.hero.badge;
    if (id === 'hero-subtext-para' || id === 'hero-subtext') return SITE_TEXTS.hero.subtext;
    if (id === 'hero-quote-text' || id === 'hero-quote') return SITE_TEXTS.hero.quote;
    if (id === 'hero-growth-label-text' || id === 'hero-growth-label') return SITE_TEXTS.hero.growthLabel;
    if (id === 'hero-growth-value-text' || id === 'hero-growth-value') return SITE_TEXTS.hero.growthValue;
    if (id === 'hero-scroll-pill-text') return SITE_TEXTS.hero.scrollPill;

    const origElem = DEFAULT_STUDIO_DATA?.elements?.[id];
    if (origElem?.content?.text) {
      return origElem.content.text;
    }
    const elem = draftData?.elements?.[id];
    if (elem?.content?.text) {
      return elem.content.text;
    }
    return defaultText;
  }, [draftData?.elements]);

  const updateTextNode = useCallback(async (id: string, text: string) => {
    setDraftData(prev => {
      pushUndoState(prev);
      const existing = prev.elements[id] || {
        id,
        label: id,
        section: 'text_node',
        type: 'text',
        visible: true,
      };
      const updatedElements = {
        ...prev.elements,
        [id]: {
          ...existing,
          content: {
            ...(existing.content || {}),
            text,
          },
        },
      };
      const nextData = { ...prev, elements: updatedElements };
      cacheDraftData(nextData);
      return nextData;
    });
    setIsDirty(true);

    try {
      setFirestoreDocument('textNodes', id, { id, text }).catch(() => {});
    } catch (err) {
      console.warn(`Firestore textNodes sync note for ${id}:`, err);
    }
  }, [pushUndoState, cacheDraftData]);

  // Visual element manipulation
  const updateElement = useCallback((id: string, updates: Partial<EditableElement>) => {
    setDraftData(prev => {
      pushUndoState(prev);
      const existing = prev.elements[id] || {
        id,
        label: id,
        section: 'custom',
        type: 'container',
        visible: true,
      };
      const updatedElements = {
        ...prev.elements,
        [id]: {
          ...existing,
          ...updates,
        },
      };
      const nextData = { ...prev, elements: updatedElements };
      cacheDraftData(nextData);
      return nextData;
    });
    setIsDirty(true);
  }, [pushUndoState, cacheDraftData]);

  const updateElementTypography = useCallback((id: string, typo: Partial<ElementTypography>) => {
    setDraftData(prev => {
      pushUndoState(prev);
      const existing = prev.elements[id] || { id, label: id, section: 'custom', type: 'text', visible: true };
      const updatedElements = {
        ...prev.elements,
        [id]: {
          ...existing,
          typography: {
            ...(existing.typography || {}),
            ...typo,
          },
        },
      };
      const nextData = { ...prev, elements: updatedElements };
      cacheDraftData(nextData);
      return nextData;
    });
    setIsDirty(true);
  }, [pushUndoState, cacheDraftData]);

  const updateElementAppearance = useCallback((id: string, app: Partial<ElementAppearance>) => {
    setDraftData(prev => {
      pushUndoState(prev);
      const existing = prev.elements[id] || { id, label: id, section: 'custom', type: 'container', visible: true };
      const updatedElements = {
        ...prev.elements,
        [id]: {
          ...existing,
          appearance: {
            ...(existing.appearance || {}),
            ...app,
          },
        },
      };
      const nextData = { ...prev, elements: updatedElements };
      cacheDraftData(nextData);
      return nextData;
    });
    setIsDirty(true);
  }, [pushUndoState, cacheDraftData]);

  const updateElementSpacing = useCallback((id: string, sp: Partial<ElementSpacing>) => {
    setDraftData(prev => {
      pushUndoState(prev);
      const existing = prev.elements[id] || { id, label: id, section: 'custom', type: 'container', visible: true };
      const updatedElements = {
        ...prev.elements,
        [id]: {
          ...existing,
          spacing: {
            ...(existing.spacing || {}),
            ...sp,
          },
        },
      };
      const nextData = { ...prev, elements: updatedElements };
      cacheDraftData(nextData);
      return nextData;
    });
    setIsDirty(true);
  }, [pushUndoState, cacheDraftData]);

  const updateElementDimensions = useCallback((id: string, dim: Partial<ElementDimensions>) => {
    setDraftData(prev => {
      pushUndoState(prev);
      const existing = prev.elements[id] || { id, label: id, section: 'custom', type: 'container', visible: true };
      const updatedElements = {
        ...prev.elements,
        [id]: {
          ...existing,
          dimensions: {
            ...(existing.dimensions || {}),
            ...dim,
          },
        },
      };
      const nextData = { ...prev, elements: updatedElements };
      cacheDraftData(nextData);
      return nextData;
    });
    setIsDirty(true);
  }, [pushUndoState, cacheDraftData]);

  const updateElementAlignment = useCallback((id: string, align: Partial<import('../types/studio').ElementAlignment>) => {
    setDraftData(prev => {
      pushUndoState(prev);
      const existing = prev.elements[id] || { id, label: id, section: 'custom', type: 'container', visible: true };
      const updatedElements = {
        ...prev.elements,
        [id]: {
          ...existing,
          alignment: {
            ...(existing.alignment || {}),
            ...align,
          },
        },
      };
      const nextData = { ...prev, elements: updatedElements };
      cacheDraftData(nextData);
      return nextData;
    });
    setIsDirty(true);
  }, [pushUndoState, cacheDraftData]);

  const updateElementContent = useCallback((id: string, contentUpdates: Partial<NonNullable<EditableElement['content']>>) => {
    setDraftData(prev => {
      pushUndoState(prev);
      const existing = prev.elements[id] || { id, label: id, section: 'custom', type: 'text', visible: true };
      const updatedElements = {
        ...prev.elements,
        [id]: {
          ...existing,
          content: {
            ...(existing.content || {}),
            ...contentUpdates,
          },
        },
      };
      const nextData = { ...prev, elements: updatedElements };
      cacheDraftData(nextData);
      return nextData;
    });
    if (contentUpdates.text !== undefined) {
      setFirestoreDocument('textNodes', id, { id, text: contentUpdates.text }).catch(() => {});
    }
    setIsDirty(true);
  }, [pushUndoState, cacheDraftData]);

  const addElement = useCallback((element: EditableElement) => {
    setDraftData(prev => {
      pushUndoState(prev);
      const nextData = {
        ...prev,
        elements: {
          ...prev.elements,
          [element.id]: element,
        },
      };
      cacheDraftData(nextData);
      return nextData;
    });
    setSelectedElementId(element.id);
    setIsDirty(true);
  }, [pushUndoState, cacheDraftData]);

  const deleteElement = useCallback((id: string) => {
    setDraftData(prev => {
      pushUndoState(prev);
      const existing = prev.elements[id] || { id, label: id, section: 'custom', type: 'container', visible: true };
      const nextData = {
        ...prev,
        elements: {
          ...prev.elements,
          [id]: {
            ...existing,
            visible: false,
          },
        },
      };
      cacheDraftData(nextData);
      return nextData;
    });
    if (selectedElementId === id) setSelectedElementId(null);
    setIsDirty(true);
  }, [pushUndoState, selectedElementId, cacheDraftData]);

  const duplicateElement = useCallback((id: string) => {
    const existing = draftData.elements[id];
    if (!existing) return;
    const newId = `${existing.id}_copy_${Date.now()}`;
    const duplicated: EditableElement = {
      ...JSON.parse(JSON.stringify(existing)),
      id: newId,
      label: `${existing.label} (Copy)`,
      isCustom: true,
    };
    addElement(duplicated);
  }, [draftData.elements, addElement]);

  // Undo / Redo
  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack(s => s.slice(0, -1));
    setRedoStack(s => [...s, JSON.parse(JSON.stringify(draftData))]);
    setDraftData(previous);
    cacheDraftData(previous);
    setIsDirty(true);
  }, [undoStack, draftData, cacheDraftData]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack(s => s.slice(0, -1));
    setUndoStack(s => [...s, JSON.parse(JSON.stringify(draftData))]);
    setDraftData(next);
    cacheDraftData(next);
    setIsDirty(true);
  }, [redoStack, draftData, cacheDraftData]);

  // Save & Publish
  const saveDraft = useCallback(async () => {
    setSaveStatus('saving');
    cacheDraftData(draftData);
    try {
      await persistStudioData(draftData, false);
      setSaveStatus('saved');
      setIsDirty(false);
    } catch (e) {
      console.error('Failed to save draft:', e);
      setSaveStatus('error');
    }
  }, [draftData, cacheDraftData]);

  const publish = useCallback(async () => {
    setSaveStatus('saving');
    const pubCopy = JSON.parse(JSON.stringify(draftData));
    cacheDraftData(draftData);
    cachePubData(pubCopy);
    setPublishedData(pubCopy);
    try {
      await persistStudioData(draftData, true);
      setSaveStatus('saved');
      setIsDirty(false);
    } catch (e) {
      console.error('Failed to publish changes:', e);
      setSaveStatus('error');
    }
  }, [draftData, cacheDraftData, cachePubData]);

  const discardDraft = useCallback(() => {
    setDraftData(JSON.parse(JSON.stringify(publishedData)));
    setIsDirty(false);
    setSaveStatus('saved');
  }, [publishedData]);

  const resetToDefault = useCallback(async () => {
    const cleanDefault = JSON.parse(JSON.stringify(DEFAULT_STUDIO_DATA));
    setDraftData(cleanDefault);
    setPublishedData(cleanDefault);
    setUndoStack([]);
    setRedoStack([]);
    setIsDirty(false);
    setSaveStatus('saved');
    try {
      localStorage.removeItem(LOCAL_STORAGE_PUB_KEY);
      localStorage.removeItem(LOCAL_STORAGE_DRAFT_KEY);
      localStorage.removeItem('portfolio_site_settings');
      localStorage.removeItem('portfolio_projects');
      localStorage.removeItem('portfolio_blog_posts');
      localStorage.removeItem('portfolio_gallery_items');
      localStorage.removeItem('nihal_portfolio_text_overrides');
    } catch {}

    try {
      const textNodes = await fetchFirestoreCollection<{ id: string; text: string }>('textNodes');
      if (textNodes && typeof textNodes === 'object') {
        const deletePromises = Object.keys(textNodes).map(id => deleteFirestoreDocument('textNodes', id));
        await Promise.allSettled(deletePromises);
      }
    } catch (err) {
      console.warn('Could not clear Firestore textNodes collection:', err);
    }

    try {
      await persistStudioData(cleanDefault, true);
      await persistStudioData(cleanDefault, false);
    } catch (e) {
      console.error('Failed to reset studio data to defaults:', e);
    }
  }, []);

  const resetAllTextToOriginal = useCallback(async () => {
    await resetToDefault();
    window.dispatchEvent(new CustomEvent('text-content-reset-to-original'));
  }, [resetToDefault]);

  // Content collections
  const updateSiteSettings = useCallback((settings: Partial<SiteSettings>) => {
    setDraftData(prev => {
      pushUndoState(prev);
      return {
        ...prev,
        siteSettings: {
          ...prev.siteSettings,
          ...settings,
        },
      };
    });
    setIsDirty(true);
  }, [pushUndoState]);

  const updateDesignTokens = useCallback((tokens: Partial<DesignTokens>) => {
    setDraftData(prev => {
      pushUndoState(prev);
      return {
        ...prev,
        designTokens: {
          ...prev.designTokens,
          ...tokens,
        },
      };
    });
    setIsDirty(true);
  }, [pushUndoState]);

  // Projects
  const addProject = useCallback((project: Project) => {
    setDraftData(prev => {
      pushUndoState(prev);
      return {
        ...prev,
        projects: [project, ...prev.projects],
      };
    });
    setIsDirty(true);
    setFirestoreDocument('projects', project.id, project).catch(() => {});
  }, [pushUndoState]);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setDraftData(prev => {
      pushUndoState(prev);
      const updated = prev.projects.map(p => p.id === id ? { ...p, ...updates } : p);
      const target = updated.find(p => p.id === id);
      if (target) {
        setFirestoreDocument('projects', id, target).catch(() => {});
      }
      return {
        ...prev,
        projects: updated,
      };
    });
    setIsDirty(true);
  }, [pushUndoState]);

  const deleteProject = useCallback((id: string) => {
    setDraftData(prev => {
      pushUndoState(prev);
      return {
        ...prev,
        projects: prev.projects.filter(p => p.id !== id),
      };
    });
    setPublishedData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id),
    }));
    setIsDirty(true);
    deleteFirestoreDocument('projects', id).catch(() => {});
  }, [pushUndoState]);

  // Blog Posts
  const addBlogPost = useCallback((post: BlogPost) => {
    setDraftData(prev => {
      pushUndoState(prev);
      return {
        ...prev,
        blogPosts: [post, ...prev.blogPosts],
      };
    });
    setIsDirty(true);
    setFirestoreDocument('blogPosts', post.id, post).catch(() => {});
  }, [pushUndoState]);

  const updateBlogPost = useCallback((id: string, updates: Partial<BlogPost>) => {
    setDraftData(prev => {
      pushUndoState(prev);
      const updated = prev.blogPosts.map(b => b.id === id ? { ...b, ...updates } : b);
      const target = updated.find(b => b.id === id);
      if (target) {
        setFirestoreDocument('blogPosts', id, target).catch(() => {});
      }
      return {
        ...prev,
        blogPosts: updated,
      };
    });
    setIsDirty(true);
  }, [pushUndoState]);

  const deleteBlogPost = useCallback((id: string) => {
    setDraftData(prev => {
      pushUndoState(prev);
      return {
        ...prev,
        blogPosts: prev.blogPosts.filter(b => b.id !== id),
      };
    });
    setPublishedData(prev => ({
      ...prev,
      blogPosts: prev.blogPosts.filter(b => b.id !== id),
    }));
    setIsDirty(true);
    deleteFirestoreDocument('blogPosts', id).catch(() => {});
  }, [pushUndoState]);

  // Gallery Items
  const addGalleryItem = useCallback((item: GalleryItem) => {
    setDraftData(prev => {
      pushUndoState(prev);
      return {
        ...prev,
        galleryItems: [item, ...prev.galleryItems],
      };
    });
    setIsDirty(true);
    setFirestoreDocument('galleryItems', item.id, item).catch(() => {});
  }, [pushUndoState]);

  const updateGalleryItem = useCallback((id: string, updates: Partial<GalleryItem>) => {
    setDraftData(prev => {
      pushUndoState(prev);
      const updated = prev.galleryItems.map(g => g.id === id ? { ...g, ...updates } : g);
      const target = updated.find(g => g.id === id);
      if (target) {
        setFirestoreDocument('galleryItems', id, target).catch(() => {});
      }
      return {
        ...prev,
        galleryItems: updated,
      };
    });
    setIsDirty(true);
  }, [pushUndoState]);

  const deleteGalleryItem = useCallback((id: string) => {
    setDraftData(prev => {
      pushUndoState(prev);
      return {
        ...prev,
        galleryItems: prev.galleryItems.filter(g => g.id !== id),
      };
    });
    setPublishedData(prev => ({
      ...prev,
      galleryItems: prev.galleryItems.filter(g => g.id !== id),
    }));
    setIsDirty(true);
    deleteFirestoreDocument('galleryItems', id).catch(() => {});
  }, [pushUndoState]);

  const reorderGalleryItem = useCallback((fromIndex: number, toIndex: number) => {
    setDraftData(prev => {
      pushUndoState(prev);
      const items = [...prev.galleryItems];
      if (fromIndex < 0 || fromIndex >= items.length || toIndex < 0 || toIndex >= items.length) {
        return prev;
      }
      const [moved] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, moved);
      return { ...prev, galleryItems: items };
    });
    setIsDirty(true);
  }, [pushUndoState]);

  const updateSkillCategories = useCallback((categories: SkillCategory[]) => {
    setDraftData(prev => {
      pushUndoState(prev);
      const updated = {
        ...prev,
        skillCategories: categories,
      };
      setFirestoreDocument('settings', 'skill_categories', { categories }).catch(() => {});
      return updated;
    });
    setIsDirty(true);
  }, [pushUndoState]);

  const addGalleryCategory = useCallback((category: string) => {
    if (!category.trim()) return;
    setDraftData(prev => {
      pushUndoState(prev);
      const currentCats = prev.galleryCategories || ['Photography', 'Branding', 'UI', 'Motion', 'Concepts'];
      if (currentCats.includes(category.trim())) return prev;
      return { ...prev, galleryCategories: [...currentCats, category.trim()] };
    });
    setIsDirty(true);
  }, [pushUndoState]);

  const deleteGalleryCategory = useCallback((category: string) => {
    setDraftData(prev => {
      pushUndoState(prev);
      const currentCats = prev.galleryCategories || ['Photography', 'Branding', 'UI', 'Motion', 'Concepts'];
      return { ...prev, galleryCategories: currentCats.filter(c => c !== category) };
    });
    setIsDirty(true);
  }, [pushUndoState]);

  // Section SEO operations
  const updateSectionSeo = useCallback(async (sectionKey: string, seo: Partial<SectionSeoMetadata>) => {
    setDraftData(prev => {
      pushUndoState(prev);
      const currentSeoMap = {
        ...DEFAULT_SECTION_SEO,
        ...(prev.siteSettings.sectionSeo || {}),
      };
      const updatedSection = {
        ...(currentSeoMap[sectionKey] || DEFAULT_SECTION_SEO[sectionKey] || {}),
        ...seo,
      };
      const updatedMap = {
        ...currentSeoMap,
        [sectionKey]: updatedSection,
      };

      setFirestoreDocument('settings', 'seo_metadata', { sections: updatedMap }).catch(() => {});
      setFirestoreDocument('settings', 'site_config', { sectionSeo: updatedMap }).catch(() => {});

      return {
        ...prev,
        siteSettings: {
          ...prev.siteSettings,
          sectionSeo: updatedMap,
        },
      };
    });
    setIsDirty(true);
  }, [pushUndoState]);

  const saveAllSectionSeo = useCallback(async (seoMap: SectionSeoMap) => {
    setDraftData(prev => {
      pushUndoState(prev);
      return {
        ...prev,
        siteSettings: {
          ...prev.siteSettings,
          sectionSeo: seoMap,
        },
      };
    });
    setPublishedData(prev => ({
      ...prev,
      siteSettings: {
        ...prev.siteSettings,
        sectionSeo: seoMap,
      },
    }));

    await setFirestoreDocument('settings', 'seo_metadata', { sections: seoMap });
    await setFirestoreDocument('settings', 'site_config', { sectionSeo: seoMap });
    await persistStudioData({
      ...draftData,
      siteSettings: {
        ...draftData.siteSettings,
        sectionSeo: seoMap,
      },
    }, true);

    setIsDirty(false);
  }, [pushUndoState, draftData]);

  // Auth operations - Credentials (Username & Password)
  const loginCredentials = useCallback(async (username: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanUser = username.trim();
    const cleanPass = pass.trim();

    if (cleanUser === ADMIN_USERNAME && cleanPass === ADMIN_PASSWORD) {
      const now = Date.now();
      const adminUser = {
        uid: 'admin-nihal-verified',
        email: ADMIN_USERNAME,
        displayName: 'Muhammed Nihal (Admin)',
        emailVerified: true,
        isAnonymous: false,
      } as unknown as User;

      setUser(adminUser);
      setIsAdmin(true);
      localStorage.setItem('nihal_portfolio_admin_auth', 'true');
      localStorage.setItem('nihal_admin_session_time', now.toString());
      return { success: true };
    }

    if (cleanUser.toLowerCase() === 'nihal.graphix@gmail.com' || cleanPass.toLowerCase() === 'nihal.graphix@gmail.com') {
      return {
        success: false,
        error: 'Google authentication has been replaced with Admin Username and Password. Please log in using username "nihalmunnusalmanizar2244" and your admin password.',
      };
    }

    return { 
      success: false, 
      error: 'Invalid username or password. Access Denied.' 
    };
  }, []);

  const loginEmail = useCallback(async (userOrEmail: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    return loginCredentials(userOrEmail, pass);
  }, [loginCredentials]);

  const loginWithGoogle = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    return {
      success: false,
      error: 'Google authentication has been disabled. Please authenticate with username "nihalmunnusalmanizar2244" and your admin password.',
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutGoogle();
    } catch (e) {
      // ignore
    }
    await signOut(auth).catch(() => {});
    setUser(null);
    setIsAdmin(false);
    setIsStudioOpen(false);
    localStorage.removeItem('nihal_portfolio_admin_auth');
    localStorage.removeItem('nihal_admin_session_time');
  }, []);

  const signOutAllDevices = useCallback(async () => {
    try {
      await Promise.allSettled([
        fetch('/api/studio/auth/revoke-all-devices', { method: 'POST' }),
        revokeAllAdminSessionsFirestore(),
      ]);
    } catch (e) {
      console.warn('Revocation note:', e);
    }
    await logout();
    window.dispatchEvent(new CustomEvent('admin-signed-out-all-devices'));
  }, [logout]);

  // Real Analytics Tracker (doesn't count when studio is open)
  const trackEvent = useCallback((type: 'pageview' | 'project_click' | 'contact_submit' | 'cv_download' | 'section_view', label?: string) => {
    if (isStudioOpen) return; // Never count admin preview as visitor traffic
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    const device = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

    fetch('/api/studio/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        path: window.location.pathname + window.location.hash,
        label: label || '',
        device,
        referrer: document.referrer || 'direct',
      }),
    }).catch(() => {});
  }, [isStudioOpen]);

  const selectedElement = selectedElementId ? draftData.elements[selectedElementId] || null : null;

  return (
    <StudioContext.Provider
      value={{
        user,
        isAdmin,
        isStudioOpen,
        activeTab,
        selectedElementId,
        hoveredElementId,
        previewDevice,
        canvasZoom,
        interactMode,
        draftData,
        publishedData,
        saveStatus,
        isDirty,
        selectedElement,
        isAdminButtonVisible,
        setIsAdminButtonVisible,
        toggleAdminButton,
        openStudio: (tab) => {
          if (tab) setActiveTab(tab);
          setIsStudioOpen(true);
        },
        closeStudio: () => setIsStudioOpen(false),
        setActiveTab,
        setPreviewDevice,
        setCanvasZoom,
        setInteractMode,
        selectElement: setSelectedElementId,
        setHoveredElement: setHoveredElementId,
        getTextNode,
        updateTextNode,
        updateElement,
        updateElementTypography,
        updateElementAppearance,
        updateElementSpacing,
        updateElementDimensions,
        updateElementAlignment,
        updateElementContent,
        addElement,
        deleteElement,
        duplicateElement,
        saveDraft,
        publish,
        discardDraft,
        resetToDefault,
        resetAllTextToOriginal,
        undo,
        redo,
        canUndo: undoStack.length > 0,
        canRedo: redoStack.length > 0,
        updateSiteSettings,
        updateDesignTokens,
        addProject,
        updateProject,
        deleteProject,
        addBlogPost,
        updateBlogPost,
        deleteBlogPost,
        addGalleryItem,
        updateGalleryItem,
        deleteGalleryItem,
        reorderGalleryItem,
        addGalleryCategory,
        deleteGalleryCategory,
        updateSkillCategories,
        updateSectionSeo,
        saveAllSectionSeo,
        loginCredentials,
        loginEmail,
        loginWithGoogle,
        logout,
        signOutAllDevices,
        trackEvent,
      }}
    >
      {children}
    </StudioContext.Provider>
  );
}

export function useStudio() {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return context;
}
