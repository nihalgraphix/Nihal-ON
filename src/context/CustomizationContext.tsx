import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  getDocs,
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import { db, ensureAdminAuth, testFirestoreConnection } from '../lib/firebase';
import { 
  PROJECTS as INITIAL_PROJECTS, 
  BLOG_POSTS as INITIAL_BLOG_POSTS, 
  GALLERY_ITEMS as INITIAL_GALLERY_ITEMS, 
  PERSONAL_INFO,
  aboutPortrait
} from '../data/portfolioData';
import { SiteSettings, Project, BlogPost, GalleryItem, ContactMessage, SectionsVisibility, SectionId, SectionStyleConfig, ComponentStyleConfig, SocialLinks } from '../types';

export const DEFAULT_SECTIONS_VISIBILITY: SectionsVisibility = {
  hero: true,
  marquee: true,
  about: true,
  projects: true,
  services: true,
  process: true,
  skills: true,
  experience: true,
  testimonials: true,
  blog: true,
  gallery: true,
  stats: true,
  faq: true,
  contact: true,
};

export const DEFAULT_SECTIONS_ORDER: SectionId[] = [
  'hero',
  'marquee',
  'about',
  'projects',
  'services',
  'process',
  'skills',
  'experience',
  'testimonials',
  'blog',
  'gallery',
  'stats',
  'faq',
  'contact',
];

export const DEFAULT_SOCIAL_LINKS: SocialLinks = {
  github: PERSONAL_INFO.github || 'https://github.com',
  twitter: PERSONAL_INFO.twitter || 'https://twitter.com',
  linkedin: PERSONAL_INFO.linkedin || 'https://linkedin.com',
  dribbble: PERSONAL_INFO.dribbble || 'https://dribbble.com',
  email: PERSONAL_INFO.email || 'nihal.graphix@gmail.com',
  instagram: PERSONAL_INFO.instagram || 'https://instagram.com',
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  accentColor: '#FF5A1F',
  secondaryColor: '#FF7A00',
  themeMode: 'luxury-black',
  siteTitle: 'Nihal . ON — Principal Designer & Creative Developer',
  heroHeading: 'Crafting Spatial & High-Impact Digital Experiences',
  heroSubheading: 'Principal UX Architect & Creative Technologist',
  heroTagline: 'Available for Q3/Q4 Enterprise Projects & Advisory',
  availabilityStatus: 'Available For Q3/Q4 Projects',
  primaryCtaText: 'Explore Selected Works',
  secondaryCtaText: 'Schedule Discovery Call',
  aboutHeading: 'Crafting Digital Legacies at the Intersection of Art & Code',
  aboutSubtitle: 'About',
  aboutBio: 'With over 8 years at the vanguard of digital product architecture, I transform ambitious venture visions into award-winning interfaces. Guided by obsessive attention to micro-typography, fluid spring physics, and high-performance engineering.',
  aboutYearsExperience: '8+',
  aboutProjectsCount: '45+',
  aboutClientSatisfaction: '100%',
  aboutImage: aboutPortrait || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
  authorName: PERSONAL_INFO.name,
  authorRole: PERSONAL_INFO.title,
  authorEmail: PERSONAL_INFO.email,
  authorLocation: PERSONAL_INFO.location,
  resumeUrl: '#resume',
  sectionsVisibility: DEFAULT_SECTIONS_VISIBILITY,
  sectionsOrder: DEFAULT_SECTIONS_ORDER,
  sectionStyles: {},
  fontFamily: 'syne',
  cardRadius: 'rounded-2xl',
  glowIntensity: 'vibrant',
  parallaxEnabled: true,
  navBrandText: 'Nihal . ON',
  footerCopyright: '© 2026 Nihal . ON — All Rights Reserved.',
  socialLinks: DEFAULT_SOCIAL_LINKS,
  heroTestimonialText: 'We shipped our first copilot in 7 weeks and cut support tickets by 31%. The eval dashboards made every decision obvious.',
  heroMetricNumber: '230K',
  heroMetricLabel: 'OUR GROWTH',
  watermarkText: 'ActionAi',
  showAdminButton: true,
};

interface CustomizationContextType {
  settings: SiteSettings;
  projects: Project[];
  blogPosts: BlogPost[];
  galleryItems: GalleryItem[];
  contactMessages: ContactMessage[];
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  isAdminAuthenticated: boolean;
  setIsAdminAuthenticated: (auth: boolean) => void;
  firestoreConnected: boolean;
  loading: boolean;
  isSaving: boolean;
  lastSavedTime: string | null;
  activePreviewSection: SectionId | null;
  setActivePreviewSection: (id: SectionId | null) => void;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  setPreviewDevice: (device: 'desktop' | 'tablet' | 'mobile') => void;
  previewZoom: number;
  setPreviewZoom: (zoom: number) => void;
  isVisualEditMode: boolean;
  setIsVisualEditMode: (val: boolean) => void;
  activePhotoshopTool: 'select' | 'type' | 'size' | 'color';
  setActivePhotoshopTool: (tool: 'select' | 'type' | 'size' | 'color') => void;
  selectedComponentId: string | null;
  setSelectedComponentId: (id: string | null) => void;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
  moveSectionOrder: (sectionId: SectionId, direction: 'up' | 'down') => Promise<void>;
  reorderSections: (newOrder: SectionId[]) => Promise<void>;
  updateSectionStyle: (sectionId: SectionId, styles: Partial<SectionStyleConfig>) => Promise<void>;
  updateComponentStyle: (sectionId: SectionId, componentId: string, styles: Partial<ComponentStyleConfig>) => Promise<void>;
  saveProject: (project: Project) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  saveBlogPost: (post: BlogPost) => Promise<void>;
  deleteBlogPost: (postId: string) => Promise<void>;
  saveGalleryItem: (item: GalleryItem) => Promise<void>;
  deleteGalleryItem: (itemId: string) => Promise<void>;
  saveContactMessage: (msg: Omit<ContactMessage, 'id' | 'createdAt' | 'read'>) => Promise<void>;
  markContactMessageRead: (msgId: string) => Promise<void>;
  deleteContactMessage: (msgId: string) => Promise<void>;
  seedDatabase: () => Promise<void>;
  resetToDefaults: () => Promise<void>;
  clearFirebaseExceptDefaults: () => Promise<void>;
  resetLayoutOnly: () => Promise<void>;
  resetThemeOnly: () => Promise<void>;
  resetContentOnly: () => Promise<void>;
}

const CustomizationContext = createContext<CustomizationContextType | undefined>(undefined);

export const CustomizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem('portfolio_site_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SITE_SETTINGS,
          ...parsed,
          sectionsVisibility: {
            ...DEFAULT_SITE_SETTINGS.sectionsVisibility,
            ...(parsed.sectionsVisibility || {}),
            hero: parsed.sectionsVisibility?.hero ?? true,
          },
          sectionsOrder: (() => {
            const list = Array.isArray(parsed.sectionsOrder) && parsed.sectionsOrder.length > 0
              ? parsed.sectionsOrder
              : DEFAULT_SECTIONS_ORDER;
            return list.includes('hero') ? list : ['hero', ...list];
          })(),
          sectionStyles: {
            ...DEFAULT_SITE_SETTINGS.sectionStyles,
            ...(parsed.sectionStyles || {}),
          },
          socialLinks: {
            ...DEFAULT_SITE_SETTINGS.socialLinks,
            ...(parsed.socialLinks || {}),
          },
        };
      }
    } catch {
      // ignore
    }
    return DEFAULT_SITE_SETTINGS;
  });
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const cached = localStorage.getItem('portfolio_projects');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_PROJECTS;
  });
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => {
    try {
      const cached = localStorage.getItem('portfolio_blog_posts');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_BLOG_POSTS;
  });
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() => {
    try {
      const cached = localStorage.getItem('portfolio_gallery_items');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_GALLERY_ITEMS;
  });
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [firestoreConnected, setFirestoreConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Live interactive preview & Photoshop Visual Editor states
  const [activePreviewSection, setActivePreviewSection] = useState<SectionId | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewZoom, setPreviewZoom] = useState<number>(100);
  const [isVisualEditMode, setIsVisualEditMode] = useState<boolean>(false);
  const [activePhotoshopTool, setActivePhotoshopTool] = useState<'select' | 'type' | 'size' | 'color'>('select');
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);

  // Apply dynamic color theme variables to root document
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-brand', settings.accentColor);
    root.style.setProperty('--color-brand-secondary', settings.secondaryColor);

    // Collect and apply custom CSS
    let customCss = '';
    if (settings.sectionStyles) {
      Object.entries(settings.sectionStyles).forEach(([_secId, secStyle]) => {
        const styleConfig = secStyle as SectionStyleConfig;
        if (styleConfig.componentStyles) {
          Object.entries(styleConfig.componentStyles).forEach(([compId, compStyle]) => {
            if (compStyle.customCss) {
              customCss += `[data-component-id="${compId}"] { ${compStyle.customCss} }\n`;
            }
          });
        }
      });
    }

    const styleId = 'visual-editor-custom-css';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = customCss;
  }, [settings]);

  // Check connection on boot
  useEffect(() => {
    testFirestoreConnection().then((connected) => {
      setFirestoreConnected(connected);
    });
  }, []);

  // Listen to Firestore real-time updates
  useEffect(() => {
    // 1. Settings listener
    const unsubscribeSettings = onSnapshot(
      doc(db, 'settings', 'site_config'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Partial<SiteSettings>;
          setSettings((prev) => ({
            ...prev,
            ...data,
            sectionsVisibility: {
              ...prev.sectionsVisibility,
              ...(data.sectionsVisibility || {}),
              hero: data.sectionsVisibility?.hero ?? prev.sectionsVisibility?.hero ?? true,
            },
            sectionsOrder: (() => {
              const list = (data.sectionsOrder && Array.isArray(data.sectionsOrder) && data.sectionsOrder.length > 0)
                ? data.sectionsOrder
                : (prev.sectionsOrder || DEFAULT_SECTIONS_ORDER);
              return list.includes('hero') ? list : ['hero', ...list];
            })(),
            sectionStyles: {
              ...(prev.sectionStyles || {}),
              ...(data.sectionStyles || {}),
            },
            socialLinks: {
              ...prev.socialLinks,
              ...(data.socialLinks || {}),
            },
          }));
        }
        setLoading(false);
      },
      (error) => {
        console.warn('Error reading settings from Firestore:', error.message);
        setLoading(false);
      }
    );

    // 2. Projects listener
    const unsubscribeProjects = onSnapshot(
      collection(db, 'projects'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedProjects: Project[] = [];
          snapshot.forEach((doc) => {
            loadedProjects.push({ ...doc.data(), id: doc.id } as Project);
          });
          setProjects(loadedProjects);
          try { localStorage.setItem('portfolio_projects', JSON.stringify(loadedProjects)); } catch {}
        }
      },
      (error) => {
        console.warn('Error reading projects from Firestore:', error.message);
      }
    );

    // 3. Blog Posts listener
    const unsubscribeBlog = onSnapshot(
      collection(db, 'blog_posts'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedPosts: BlogPost[] = [];
          snapshot.forEach((doc) => {
            loadedPosts.push({ ...doc.data(), id: doc.id } as BlogPost);
          });
          setBlogPosts(loadedPosts);
          try { localStorage.setItem('portfolio_blog_posts', JSON.stringify(loadedPosts)); } catch {}
        }
      },
      (error) => {
        console.warn('Error reading blog posts from Firestore:', error.message);
      }
    );

    // 4. Gallery Items listener
    const unsubscribeGallery = onSnapshot(
      collection(db, 'gallery_items'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedItems: GalleryItem[] = [];
          snapshot.forEach((doc) => {
            loadedItems.push({ ...doc.data(), id: doc.id } as GalleryItem);
          });
          setGalleryItems(loadedItems);
          try { localStorage.setItem('portfolio_gallery_items', JSON.stringify(loadedItems)); } catch {}
        }
      },
      (error) => {
        console.warn('Error reading gallery items from Firestore:', error.message);
      }
    );

    // 5. Contact Messages listener
    const unsubscribeContact = onSnapshot(
      collection(db, 'contact_messages'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedMsgs: ContactMessage[] = [];
          snapshot.forEach((docSnap) => {
            loadedMsgs.push({ ...docSnap.data(), id: docSnap.id } as ContactMessage);
          });
          // Sort newest first
          loadedMsgs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setContactMessages(loadedMsgs);
        }
      },
      (error) => {
        console.warn('Error reading contact messages from Firestore:', error.message);
      }
    );

    return () => {
      unsubscribeSettings();
      unsubscribeProjects();
      unsubscribeBlog();
      unsubscribeGallery();
      unsubscribeContact();
    };
  }, []);

  // Mutation Handlers
  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    setIsSaving(true);
    const updated = {
      ...settings,
      ...newSettings,
      updatedAt: new Date().toISOString(),
    };
    setSettings(updated);
    try {
      localStorage.setItem('portfolio_site_settings', JSON.stringify(updated));
    } catch {
      // ignore local storage errors
    }

    try {
      await ensureAdminAuth();
      await setDoc(doc(db, 'settings', 'site_config'), updated, { merge: true });
      setLastSavedTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.warn('Could not sync settings to Firestore, saved locally:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const moveSectionOrder = async (sectionId: SectionId, direction: 'up' | 'down') => {
    const currentOrder = [...(settings.sectionsOrder || DEFAULT_SECTIONS_ORDER)];
    const index = currentOrder.indexOf(sectionId);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      const temp = currentOrder[index];
      currentOrder[index] = currentOrder[index - 1];
      currentOrder[index - 1] = temp;
    } else if (direction === 'down' && index < currentOrder.length - 1) {
      const temp = currentOrder[index];
      currentOrder[index] = currentOrder[index + 1];
      currentOrder[index + 1] = temp;
    } else {
      return;
    }

    await updateSettings({ sectionsOrder: currentOrder });
  };

  const reorderSections = async (newOrder: SectionId[]) => {
    await updateSettings({ sectionsOrder: newOrder });
  };

  const updateSectionStyle = async (sectionId: SectionId, styles: Partial<SectionStyleConfig>) => {
    const currentStyles = { ...(settings.sectionStyles || {}) };
    currentStyles[sectionId] = {
      ...(currentStyles[sectionId] || {
        paddingY: 'normal',
        bgStyle: 'default',
        borderTopGlow: false,
        borderBottomGlow: false,
        containerWidth: 'standard',
        alignment: 'left',
        divSizing: 'standard',
      }),
      ...styles,
    };
    await updateSettings({ sectionStyles: currentStyles });
  };

  const updateComponentStyle = async (sectionId: SectionId, componentId: string, styles: Partial<ComponentStyleConfig>) => {
    const sectionStyles = settings.sectionStyles?.[sectionId] || {
      paddingY: 'normal',
      bgStyle: 'default',
      borderTopGlow: false,
      borderBottomGlow: false,
      containerWidth: 'standard',
      alignment: 'left',
      divSizing: 'standard',
    };

    const componentStyles = { ...(sectionStyles.componentStyles || {}) };
    componentStyles[componentId] = {
      ...(componentStyles[componentId] || {}),
      ...styles,
    };

    await updateSectionStyle(sectionId, { componentStyles });
  };

  const saveProject = async (project: Project) => {
    const projId = project.id || `proj-${Date.now()}`;
    const payload = { ...project, id: projId, updatedAt: new Date().toISOString() };
    setProjects((prev) => {
      const idx = prev.findIndex((p) => p.id === projId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = payload;
        return copy;
      }
      return [payload, ...prev];
    });

    try {
      await ensureAdminAuth();
      await setDoc(doc(db, 'projects', projId), payload, { merge: true });
    } catch (err) {
      console.warn('Could not sync project to Firestore:', err);
    }
  };

  const deleteProject = async (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    try {
      await ensureAdminAuth();
      await deleteDoc(doc(db, 'projects', projectId));
    } catch (err) {
      console.warn('Could not delete project from Firestore:', err);
    }
  };

  const saveBlogPost = async (post: BlogPost) => {
    const blogId = post.id || `blog-${Date.now()}`;
    const payload = { ...post, id: blogId, updatedAt: new Date().toISOString() };
    setBlogPosts((prev) => {
      const idx = prev.findIndex((b) => b.id === blogId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = payload;
        return copy;
      }
      return [payload, ...prev];
    });

    try {
      await ensureAdminAuth();
      await setDoc(doc(db, 'blog_posts', blogId), payload, { merge: true });
    } catch (err) {
      console.warn('Could not sync blog post to Firestore:', err);
    }
  };

  const deleteBlogPost = async (postId: string) => {
    setBlogPosts((prev) => prev.filter((b) => b.id !== postId));
    try {
      await ensureAdminAuth();
      await deleteDoc(doc(db, 'blog_posts', postId));
    } catch (err) {
      console.warn('Could not delete blog post from Firestore:', err);
    }
  };

  const saveGalleryItem = async (item: GalleryItem) => {
    const galId = item.id || `gal-${Date.now()}`;
    const payload = { ...item, id: galId, updatedAt: new Date().toISOString() };
    setGalleryItems((prev) => {
      const idx = prev.findIndex((g) => g.id === galId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = payload;
        return copy;
      }
      return [payload, ...prev];
    });

    try {
      await ensureAdminAuth();
      await setDoc(doc(db, 'gallery_items', galId), payload, { merge: true });
    } catch (err) {
      console.warn('Could not sync gallery item to Firestore:', err);
    }
  };

  const deleteGalleryItem = async (itemId: string) => {
    setGalleryItems((prev) => prev.filter((g) => g.id !== itemId));
    try {
      await ensureAdminAuth();
      await deleteDoc(doc(db, 'gallery_items', itemId));
    } catch (err) {
      console.warn('Could not delete gallery item from Firestore:', err);
    }
  };

  const saveContactMessage = async (msg: Omit<ContactMessage, 'id' | 'createdAt' | 'read'>) => {
    const msgId = `msg-${Date.now()}`;
    const payload: ContactMessage = {
      ...msg,
      id: msgId,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setContactMessages((prev) => [payload, ...prev]);

    try {
      await setDoc(doc(db, 'contact_messages', msgId), payload);
    } catch (err) {
      console.warn('Could not save contact message to Firestore:', err);
    }
  };

  const markContactMessageRead = async (msgId: string) => {
    setContactMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, read: true } : m))
    );
    try {
      await setDoc(doc(db, 'contact_messages', msgId), { read: true }, { merge: true });
    } catch (err) {
      console.warn('Could not mark message as read:', err);
    }
  };

  const deleteContactMessage = async (msgId: string) => {
    setContactMessages((prev) => prev.filter((m) => m.id !== msgId));
    try {
      await ensureAdminAuth();
      await deleteDoc(doc(db, 'contact_messages', msgId));
    } catch (err) {
      console.warn('Could not delete contact message:', err);
    }
  };

  // Seed default data to Firestore for one-click populated CMS
  const seedDatabase = async () => {
    try {
      await ensureAdminAuth();
      const batch = writeBatch(db);

      // 1. Settings
      const settingsRef = doc(db, 'settings', 'site_config');
      batch.set(settingsRef, {
        ...DEFAULT_SITE_SETTINGS,
        updatedAt: new Date().toISOString(),
      });

      // 2. Projects
      INITIAL_PROJECTS.forEach((p) => {
        const pRef = doc(db, 'projects', p.id);
        batch.set(pRef, { ...p, updatedAt: new Date().toISOString() });
      });

      // 3. Blog Posts
      INITIAL_BLOG_POSTS.forEach((b) => {
        const bRef = doc(db, 'blog_posts', b.id);
        batch.set(bRef, { ...b, updatedAt: new Date().toISOString() });
      });

      // 4. Gallery Items
      INITIAL_GALLERY_ITEMS.forEach((g) => {
        const gRef = doc(db, 'gallery_items', g.id);
        batch.set(gRef, { ...g, updatedAt: new Date().toISOString() });
      });

      await batch.commit();
    } catch (err) {
      console.warn('Could not seed database to Firestore:', err);
    }
  };

  const resetToDefaults = async () => {
    setIsSaving(true);
    setSettings(DEFAULT_SITE_SETTINGS);
    setProjects(INITIAL_PROJECTS);
    setBlogPosts(INITIAL_BLOG_POSTS);
    setGalleryItems(INITIAL_GALLERY_ITEMS);
    try {
      localStorage.setItem('portfolio_site_settings', JSON.stringify(DEFAULT_SITE_SETTINGS));
    } catch {
      // ignore
    }
    try {
      await ensureAdminAuth();

      // Wipe extra Firestore collections
      const batch1 = writeBatch(db);
      const projSnap = await getDocs(collection(db, 'projects'));
      projSnap.forEach((docSnap) => batch1.delete(doc(db, 'projects', docSnap.id)));

      const blogSnap = await getDocs(collection(db, 'blog_posts'));
      blogSnap.forEach((docSnap) => batch1.delete(doc(db, 'blog_posts', docSnap.id)));

      const galSnap = await getDocs(collection(db, 'gallery_items'));
      galSnap.forEach((docSnap) => batch1.delete(doc(db, 'gallery_items', docSnap.id)));

      await batch1.commit();

      // Write default settings & initial baseline records
      await setDoc(doc(db, 'settings', 'site_config'), DEFAULT_SITE_SETTINGS);
      const batch2 = writeBatch(db);
      INITIAL_PROJECTS.forEach((p) => {
        batch2.set(doc(db, 'projects', p.id), { ...p, updatedAt: new Date().toISOString() });
      });
      INITIAL_BLOG_POSTS.forEach((b) => {
        batch2.set(doc(db, 'blog_posts', b.id), { ...b, updatedAt: new Date().toISOString() });
      });
      INITIAL_GALLERY_ITEMS.forEach((g) => {
        batch2.set(doc(db, 'gallery_items', g.id), { ...g, updatedAt: new Date().toISOString() });
      });
      await batch2.commit();
      setLastSavedTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.warn('Could not reset Firestore to defaults:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const clearFirebaseExceptDefaults = async () => {
    await resetToDefaults();
  };

  const resetLayoutOnly = async () => {
    const updated = {
      ...settings,
      sectionsOrder: DEFAULT_SECTIONS_ORDER,
      sectionStyles: {},
      sectionsVisibility: DEFAULT_SECTIONS_VISIBILITY,
    };
    await updateSettings(updated);
  };

  const resetThemeOnly = async () => {
    const updated = {
      ...settings,
      accentColor: DEFAULT_SITE_SETTINGS.accentColor,
      secondaryColor: DEFAULT_SITE_SETTINGS.secondaryColor,
      themeMode: DEFAULT_SITE_SETTINGS.themeMode,
      fontFamily: DEFAULT_SITE_SETTINGS.fontFamily,
      cardRadius: DEFAULT_SITE_SETTINGS.cardRadius,
      glowIntensity: DEFAULT_SITE_SETTINGS.glowIntensity,
      parallaxEnabled: DEFAULT_SITE_SETTINGS.parallaxEnabled,
    };
    await updateSettings(updated);
  };

  const resetContentOnly = async () => {
    // Clear section text overrides in sectionStyles while preserving styling
    const updatedStyles: Record<string, SectionStyleConfig> = {};
    if (settings.sectionStyles) {
      Object.entries(settings.sectionStyles).forEach(([key, val]) => {
        const secVal = val as SectionStyleConfig;
        updatedStyles[key] = {
          ...secVal,
          badgeText: undefined,
          customTitle: undefined,
          customSubtitle: undefined,
          customDescription: undefined,
        };
      });
    }

    const updated = {
      ...settings,
      sectionStyles: updatedStyles,
      heroHeading: DEFAULT_SITE_SETTINGS.heroHeading,
      heroSubheading: DEFAULT_SITE_SETTINGS.heroSubheading,
      heroTagline: DEFAULT_SITE_SETTINGS.heroTagline,
      availabilityStatus: DEFAULT_SITE_SETTINGS.availabilityStatus,
      primaryCtaText: DEFAULT_SITE_SETTINGS.primaryCtaText,
      secondaryCtaText: DEFAULT_SITE_SETTINGS.secondaryCtaText,
      aboutHeading: DEFAULT_SITE_SETTINGS.aboutHeading,
      aboutSubtitle: DEFAULT_SITE_SETTINGS.aboutSubtitle,
      aboutBio: DEFAULT_SITE_SETTINGS.aboutBio,
      aboutYearsExperience: DEFAULT_SITE_SETTINGS.aboutYearsExperience,
      aboutProjectsCount: DEFAULT_SITE_SETTINGS.aboutProjectsCount,
      aboutClientSatisfaction: DEFAULT_SITE_SETTINGS.aboutClientSatisfaction,
      authorName: DEFAULT_SITE_SETTINGS.authorName,
      authorRole: DEFAULT_SITE_SETTINGS.authorRole,
      authorEmail: DEFAULT_SITE_SETTINGS.authorEmail,
      authorLocation: DEFAULT_SITE_SETTINGS.authorLocation,
    };
    await updateSettings(updated);
  };

  return (
    <CustomizationContext.Provider
      value={{
        settings,
        projects,
        blogPosts,
        galleryItems,
        contactMessages,
        isAdminOpen,
        setIsAdminOpen,
        isAdminAuthenticated,
        setIsAdminAuthenticated,
        firestoreConnected,
        loading,
        isSaving,
        lastSavedTime,
        activePreviewSection,
        setActivePreviewSection,
        previewDevice,
        setPreviewDevice,
        previewZoom,
        setPreviewZoom,
        isVisualEditMode,
        setIsVisualEditMode,
        activePhotoshopTool,
        setActivePhotoshopTool,
        selectedComponentId,
        setSelectedComponentId,
        updateSettings,
        moveSectionOrder,
        reorderSections,
        updateSectionStyle,
        updateComponentStyle,
        saveProject,
        deleteProject,
        saveBlogPost,
        deleteBlogPost,
        saveGalleryItem,
        deleteGalleryItem,
        saveContactMessage,
        markContactMessageRead,
        deleteContactMessage,
        seedDatabase,
        resetToDefaults,
        clearFirebaseExceptDefaults,
        resetLayoutOnly,
        resetThemeOnly,
        resetContentOnly,
      }}
    >
      {children}
    </CustomizationContext.Provider>
  );
};

export const useCustomization = () => {
  const context = useContext(CustomizationContext);
  if (!context) {
    console.warn('useCustomization was called outside CustomizationProvider; returning default fallback context.');
    return {
      settings: DEFAULT_SITE_SETTINGS,
      updateSettings: async () => {},
      projects: INITIAL_PROJECTS,
      blogPosts: INITIAL_BLOG_POSTS,
      galleryItems: INITIAL_GALLERY_ITEMS,
      contactMessages: [],
      addProject: async () => {},
      updateProject: async () => {},
      deleteProject: async () => {},
      addBlogPost: async () => {},
      updateBlogPost: async () => {},
      deleteBlogPost: async () => {},
      addGalleryItem: async () => {},
      deleteGalleryItem: async () => {},
      addContactMessage: async () => {},
      markMessageAsRead: async () => {},
      deleteContactMessage: async () => {},
      resetToDefaults: async () => {},
      clearFirebaseExceptDefaults: async () => {},
      resetLayoutOnly: async () => {},
      resetThemeOnly: async () => {},
      resetContentOnly: async () => {},
      resetAnalyticsData: async () => {},
      isSaving: false,
      lastSavedTime: null,
      firestoreConnected: false,
      updateSectionVisibility: async () => {},
      updateSectionsOrder: async () => {},
      updateSectionStyles: async () => {},
      updateComponentStyle: async () => {},
      getComponentStyles: () => ({}),
      getSectionStyles: () => ({}),
    } as any;
  }
  return context;
};

export const getComponentStyles = (
  sectionId: SectionId,
  componentId: string,
  settings: SiteSettings
): React.CSSProperties => {
  const compStyle = settings.sectionStyles?.[sectionId]?.componentStyles?.[componentId];
  if (!compStyle) return {};

  const styles: React.CSSProperties = {};

  if (compStyle.backgroundColor) styles.backgroundColor = compStyle.backgroundColor;
  if (compStyle.backgroundImage) styles.backgroundImage = compStyle.backgroundImage;
  if (compStyle.boxShadow) styles.boxShadow = compStyle.boxShadow;
  if (compStyle.opacity !== undefined) styles.opacity = compStyle.opacity;
  if (compStyle.transition) styles.transition = compStyle.transition;

  if (compStyle.typography) {
    const { typography } = compStyle;
    if (typography.fontFamily) styles.fontFamily = typography.fontFamily;
    if (typography.fontSize) styles.fontSize = typography.fontSize;
    if (typography.fontWeight) styles.fontWeight = typography.fontWeight;
    if (typography.lineHeight) styles.lineHeight = typography.lineHeight;
    if (typography.letterSpacing) styles.letterSpacing = typography.letterSpacing;
    if (typography.textAlign) styles.textAlign = typography.textAlign;
    if (typography.textTransform) styles.textTransform = typography.textTransform;
    if (typography.color) styles.color = typography.color;
  }

  if (compStyle.spacing) {
    const { spacing } = compStyle;
    if (spacing.marginTop) styles.marginTop = spacing.marginTop;
    if (spacing.marginRight) styles.marginRight = spacing.marginRight;
    if (spacing.marginBottom) styles.marginBottom = spacing.marginBottom;
    if (spacing.marginLeft) styles.marginLeft = spacing.marginLeft;
    if (spacing.paddingTop) styles.paddingTop = spacing.paddingTop;
    if (spacing.paddingRight) styles.paddingRight = spacing.paddingRight;
    if (spacing.paddingBottom) styles.paddingBottom = spacing.paddingBottom;
    if (spacing.paddingLeft) styles.paddingLeft = spacing.paddingLeft;
    if (spacing.gap) styles.gap = spacing.gap;
  }

  if (compStyle.layout) {
    const { layout } = compStyle;
    if (layout.display) styles.display = layout.display;
    if (layout.flexDirection) styles.flexDirection = layout.flexDirection;
    if (layout.justifyContent) styles.justifyContent = layout.justifyContent;
    if (layout.alignItems) styles.alignItems = layout.alignItems;
    if (layout.width) styles.width = layout.width;
    if (layout.height) styles.height = layout.height;
    if (layout.maxWidth) styles.maxWidth = layout.maxWidth;
    if (layout.maxHeight) styles.maxHeight = layout.maxHeight;
    if (layout.position) styles.position = layout.position;
    if (layout.top) styles.top = layout.top;
    if (layout.right) styles.right = layout.right;
    if (layout.bottom) styles.bottom = layout.bottom;
    if (layout.left) styles.left = layout.left;
    if (layout.zIndex !== undefined) styles.zIndex = layout.zIndex;
  }

  if (compStyle.border) {
    const { border } = compStyle;
    if (border.borderWidth) styles.borderWidth = border.borderWidth;
    if (border.borderColor) styles.borderColor = border.borderColor;
    if (border.borderStyle) styles.borderStyle = border.borderStyle;
    if (border.borderRadius) styles.borderRadius = border.borderRadius;
  }

  return styles;
};
