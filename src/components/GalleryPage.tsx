import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, X, Maximize2, Download, Heart, Search, Filter, SlidersHorizontal, Image as ImageIcon,
  ArrowDown, Sparkles, Copy, Eye, ArrowRight, Home, Bell, Check, Plus, Minus,
  Trash2, CheckCircle2, Layers, AlertCircle, Zap, ShieldCheck, User, LogIn, LogOut, Mail, MessageSquare, Send
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';

interface GalleryPageProps {
  onBack: () => void;
  onNavigateSection?: (sectionId: string) => void;
}

type PhotoCategory = 'All' | 'Landscapes' | 'Desert Routes' | 'Architecture' | 'Sunset & Stars' | 'Culture';

interface PhotoItem {
  id: string;
  title: string;
  location: string;
  category: 'Landscapes' | 'Desert Routes' | 'Architecture' | 'Sunset & Stars' | 'Culture';
  src: string;
  span?: string;
  heightClass?: string;
  tags: string[];
}

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  plan?: string;
}

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  type: 'update' | 'promo' | 'system';
}

const CATEGORIES: PhotoCategory[] = [
  'All',
  'Landscapes',
  'Desert Routes',
  'Architecture',
  'Sunset & Stars',
  'Culture',
];

const GALLERY_PHOTOS: PhotoItem[] = [];

const ARC_PHOTOS = [
  {
    id: 'photo-arch-1',
    src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
    title: 'Monochrome Halftone Portrait',
    angle: -30,
    rotate: 12,
    yOffset: 24,
    extraClass: 'filter grayscale contrast-125',
  },
  {
    id: 'photo-arch-2',
    src: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=800',
    title: 'Cyberpunk Helmet Suit',
    angle: -20,
    rotate: 7,
    yOffset: 12,
    extraClass: 'brightness-90 contrast-110',
  },
  {
    id: 'photo-arch-3',
    src: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&q=80&w=800',
    title: 'Sci-Fi Corridor Figure',
    angle: -10,
    rotate: 3,
    yOffset: 4,
    extraClass: 'brightness-95',
  },
  {
    id: 'photo-arch-4',
    src: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=800',
    title: 'Neon Green Glow Split',
    angle: 0,
    rotate: 0,
    yOffset: 0,
    isCenter: true,
  },
  {
    id: 'photo-arch-5',
    src: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800',
    title: 'Futuristic White Motorcycle',
    angle: 10,
    rotate: -3,
    yOffset: 4,
    extraClass: '',
  },
  {
    id: 'photo-arch-6',
    src: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=800',
    title: 'Cyberpunk Reflective Visor',
    angle: 20,
    rotate: -7,
    yOffset: 12,
    extraClass: '',
  },
  {
    id: 'photo-arch-7',
    src: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?auto=format&fit=crop&q=80&w=800',
    title: 'Vivid Pink VR Headset',
    angle: 30,
    rotate: -12,
    yOffset: 24,
    extraClass: '',
  },
];

export default function GalleryPage({ onBack, onNavigateSection }: GalleryPageProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [likedPhotos, setLikedPhotos] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('nihal_frames_liked');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [showOnlyLiked, setShowOnlyLiked] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PhotoCategory>('All');

  // Persist liked photos to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nihal_frames_liked', JSON.stringify(likedPhotos));
    } catch (e) {
      console.error('Failed to save liked photos to localStorage', e);
    }
  }, [likedPhotos]);

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('nihal_frames_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInToast, setSignInToast] = useState<string | null>(null);

  // Inquiry State
  const [isInquireOpen, setIsInquireOpen] = useState(false);
  const [inquireFrame, setInquireFrame] = useState<PhotoItem | null>(null);
  const [inquireName, setInquireName] = useState('');
  const [inquireEmail, setInquireEmail] = useState('');
  const [inquireType, setInquireType] = useState('8K High-Res Print');
  const [inquireMessage, setInquireMessage] = useState('');
  const [inquireSuccess, setInquireSuccess] = useState(false);

  // Drawers & Modals state for floating navbar
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  // User Auth Actions
  const handleSignIn = (emailInput?: string, nameInput?: string) => {
    const emailToUse = emailInput || signInEmail || 'creator@nihal.frames';
    const nameToUse = nameInput || (emailToUse.split('@')[0]
      ? emailToUse.split('@')[0].charAt(0).toUpperCase() + emailToUse.split('@')[0].slice(1)
      : 'VIP Collector');

    const userObj: UserProfile = {
      name: nameToUse,
      email: emailToUse,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      plan: 'Pro VIP Member'
    };

    setCurrentUser(userObj);
    try {
      localStorage.setItem('nihal_frames_user', JSON.stringify(userObj));
    } catch (e) {
      console.error('Error saving user profile', e);
    }
    setIsSignInOpen(false);
    setSignInToast(`Welcome back, ${userObj.name}!`);
    setTimeout(() => setSignInToast(null), 3500);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('nihal_frames_user');
    } catch (e) {
      console.error(e);
    }
    setIsSignInOpen(false);
    setSignInToast('Signed out successfully.');
    setTimeout(() => setSignInToast(null), 3500);
  };

  // Inquiry Actions
  const handleOpenInquiry = (frame?: PhotoItem) => {
    if (frame) setInquireFrame(frame);
    else setInquireFrame(null);
    if (currentUser) {
      setInquireName(currentUser.name);
      setInquireEmail(currentUser.email);
    }
    setIsInquireOpen(true);
    setInquireSuccess(false);
  };

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setInquireSuccess(true);
  };

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n-1',
      title: '⚡ 3 New 8K Frames Added',
      desc: 'Exclusive desert monolith captures available in Desert Routes collection.',
      time: '10m ago',
      read: false,
      type: 'update',
    },
    {
      id: 'n-2',
      title: '🎨 AI Render Engine Active',
      desc: 'High-res upscale server running at peak generation speed.',
      time: '1h ago',
      read: false,
      type: 'system',
    },
    {
      id: 'n-3',
      title: '🎟️ Nihal Frames VIP Pass',
      desc: 'You have been granted Commercial License download rights.',
      time: '2h ago',
      read: false,
      type: 'promo',
    },
  ]);

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedPhotos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNavClick = (sectionId: string) => {
    onBack();
    if (onNavigateSection) {
      setTimeout(() => {
        onNavigateSection(sectionId);
      }, 100);
    }
  };

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const likedCount = useMemo(() => {
    return Object.values(likedPhotos).filter(Boolean).length;
  }, [likedPhotos]);

  const { publishedData } = useStudio();
  const activePhotos = useMemo(() => {
    if (publishedData?.galleryItems && publishedData.galleryItems.length > 0) {
      return publishedData.galleryItems.map((item) => ({
        id: item.id,
        title: item.title,
        location: item.category || 'Archive',
        category: (item.category as any) || 'Landscapes',
        src: item.image,
        span: 'xl:col-span-1 lg:col-span-1 md:col-span-1',
        heightClass: 'h-[190px] sm:h-[230px]',
        tags: [item.category || 'photo', item.title],
      }));
    }
    return [];
  }, [publishedData?.galleryItems]);

  const likedPhotosList = useMemo(() => {
    return activePhotos.filter((photo) => likedPhotos[photo.id]);
  }, [likedPhotos, activePhotos]);

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Filter photos by Liked State, Category, and Search Query
  const filteredPhotos = useMemo(() => {
    return activePhotos.filter((photo) => {
      const matchesLiked = !showOnlyLiked || Boolean(likedPhotos[photo.id]);
      const matchesCategory =
        selectedCategory === 'All' || photo.category === selectedCategory;

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        photo.title.toLowerCase().includes(query) ||
        photo.location.toLowerCase().includes(query) ||
        photo.category.toLowerCase().includes(query) ||
        photo.tags.some((tag) => tag.toLowerCase().includes(query));

      return matchesLiked && matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, showOnlyLiked, likedPhotos, activePhotos]);

  // Calculate count for each category
  const categoryCounts = useMemo(() => {
    const counts: Record<PhotoCategory, number> = {
      All: activePhotos.length,
      Landscapes: 0,
      'Desert Routes': 0,
      Architecture: 0,
      'Sunset & Stars': 0,
      Culture: 0,
    };

    activePhotos.forEach((photo) => {
      counts[photo.category] = (counts[photo.category] || 0) + 1;
    });

    return counts;
  }, [activePhotos]);

  // Ensure landing directly at the top hero section of gallery web on open
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const heroEl = document.getElementById('gallery-hero-section');
    if (heroEl) {
      heroEl.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#060606] text-white py-3 sm:py-5 px-3 sm:px-6 lg:px-10 selection:bg-[#FF5A1F] selection:text-black font-sans antialiased w-full relative">
      {/* Top Floating Controls Container (Header Container Removed - Only Divs & Buttons Float Directly) */}
      <header className="sticky top-3 z-50 flex flex-col md:flex-row items-center justify-between gap-4 py-2 px-2 w-full max-w-full mx-auto mb-6 sm:mb-8 pointer-events-none">
        {/* Left Brand - Floating Pill */}
        <div
          onClick={onBack}
          className="pointer-events-auto cursor-pointer group flex items-center gap-3 bg-black/70 backdrop-blur-xl px-4 py-2 rounded-full border border-white/15 shadow-2xl hover:border-[#FF5A1F]/50 transition-all"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FF5A1F] text-black font-syne font-extrabold text-sm shadow-md shadow-[#FF5A1F]/20 group-hover:scale-105 transition-all">
            N
          </div>
          <span className="font-syne font-extrabold text-xl text-white tracking-tight">
            nihal frames.
          </span>
        </div>

        {/* Center Minimal Floating Nav Bar (Floating & Fully Functional) */}
        <div className="pointer-events-auto flex items-center gap-3.5 sm:gap-4 drop-shadow-2xl">
          {/* Main Floating Pill Menu */}
          <div className="flex items-center gap-2 sm:gap-5 p-1.5 sm:p-2 px-3 sm:px-5 rounded-full bg-white text-neutral-900 shadow-2xl shadow-black/80 border border-white/40">
            {/* Active "Home" Pill Badge */}
            <button
              onClick={() => {
                const heroEl = document.getElementById('gallery-hero-section');
                if (heroEl) {
                  heroEl.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full bg-black text-white font-sans font-semibold text-xs sm:text-sm shadow-md hover:bg-neutral-800 active:scale-95 transition-all cursor-pointer"
              title="Home section"
            >
              <Home className="h-4 w-4 fill-current text-white" />
              <span>Home</span>
            </button>

            {/* Expanding Inline Search Input Bar (Matches Video Animation Exactly) */}
            <AnimatePresence mode="wait">
              {isSearchOpen ? (
                <motion.div
                  key="search-expanded"
                  initial={{ width: 38, opacity: 0 }}
                  animate={{ width: 240, opacity: 1 }}
                  exit={{ width: 38, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  className="relative flex items-center bg-black text-white rounded-full px-3 py-1.5 border border-white/20 shadow-inner group"
                >
                  <Search className="h-4 w-4 text-neutral-400 shrink-0 mr-2" />
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const el = document.getElementById('gallery-grid-start');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    placeholder="Search frames..."
                    className="w-full bg-transparent text-xs text-white placeholder-neutral-400 focus:outline-none pr-6"
                  />
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchOpen(false);
                    }}
                    className="absolute right-2 p-1 text-neutral-400 hover:text-white hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                    title="Close search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>

                  {/* Live Search Quick Results Popup Dropdown */}
                  {searchQuery.trim() !== '' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-0 right-0 mt-3 p-3 bg-[#0d0d12] border border-white/20 rounded-2xl shadow-2xl text-white z-50 w-[300px] -left-10 sm:left-0"
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[11px] text-neutral-400">
                        <span>Found {filteredPhotos.length} matches</span>
                        <button
                          onClick={() => {
                            const el = document.getElementById('gallery-grid-start');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="text-[#FF5A1F] hover:underline font-bold"
                        >
                          View All
                        </button>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {filteredPhotos.length > 0 ? (
                          filteredPhotos.slice(0, 4).map((photo) => (
                            <div
                              key={photo.id}
                              onClick={() => {
                                setSelectedPhoto(photo);
                              }}
                              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
                            >
                              <img
                                src={photo.src}
                                alt={photo.title}
                                className="w-9 h-9 rounded-lg object-cover"
                              />
                              <div className="overflow-hidden">
                                <p className="text-xs font-syne font-bold truncate text-white hover:text-[#FF5A1F]">
                                  {photo.title}
                                </p>
                                <p className="text-[10px] text-neutral-400 truncate">{photo.location}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-4 text-center text-xs text-neutral-500">
                            No frames found matching "{searchQuery}"
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.button
                  key="search-icon"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setIsSearchOpen(true)}
                  className="p-1.5 sm:p-2 rounded-full text-neutral-600 hover:text-black hover:bg-neutral-100 active:scale-95 transition-all cursor-pointer relative"
                  title="Search AI Frames"
                >
                  <Search className="h-4 sm:h-5 w-4 sm:w-5 stroke-[2]" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Heart / Wishlist Icon */}
            <button
              onClick={() => {
                setShowOnlyLiked((prev) => !prev);
                const el = document.getElementById('gallery-grid-start');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`p-1.5 sm:p-2 rounded-full transition-all cursor-pointer relative ${
                showOnlyLiked
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-105'
                  : 'text-neutral-600 hover:text-black hover:bg-neutral-100 active:scale-95'
              }`}
              title={showOnlyLiked ? "Show all frames" : "Show liked frames only"}
            >
              <Heart className={`h-4 sm:h-5 w-4 sm:w-5 stroke-[2] ${showOnlyLiked ? 'fill-current' : ''}`} />
              {likedCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF5A1F] text-black text-[10px] font-extrabold flex items-center justify-center border-2 border-white shadow-sm">
                  {likedCount}
                </span>
              )}
            </button>

            {/* Notification Bell Icon */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="p-1.5 sm:p-2 rounded-full text-neutral-600 hover:text-black hover:bg-neutral-100 active:scale-95 transition-all cursor-pointer relative"
              title="Notifications"
            >
              <Bell className="h-4 sm:h-5 w-4 sm:w-5 stroke-[2]" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#FF5A1F] ring-2 ring-white animate-pulse" />
              )}
            </button>
          </div>

          {/* Standalone Inquire Button */}
          <button
            onClick={() => handleOpenInquiry()}
            className="h-11 sm:h-12 px-4 sm:px-5 rounded-full bg-white text-black shadow-2xl shadow-black/80 border border-white/40 flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95 transition-all group font-sans font-bold text-sm"
            title="Inquire about custom frames, prints, or licensing"
          >
            <MessageSquare className="h-4 sm:h-5 w-4 sm:w-5 text-neutral-900 group-hover:scale-110 transition-transform" />
            <span>Inquire</span>
          </button>
        </div>

        {/* Right Action Button & Return Back */}
        <div className="pointer-events-auto flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="p-2.5 rounded-full bg-black/70 backdrop-blur-xl text-white hover:bg-white/20 transition-all border border-white/15 cursor-pointer shadow-xl"
            title="Return Home"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Dark Card Hero Showcase - nihal frames Staircase Grid */}
      <div id="gallery-hero-section" className="relative w-full max-w-full mx-auto rounded-[28px] sm:rounded-[36px] lg:rounded-[40px] bg-[#09090c] text-white p-5 sm:p-8 lg:p-10 xl:p-12 flex flex-col justify-center shadow-2xl overflow-hidden border border-white/10 mb-8 min-h-[780px] lg:h-[780px]">
        {/* Subtle Ambient Top-Left Orange Glow */}
        <div className="absolute top-0 left-0 w-[500px] h-[350px] bg-gradient-to-br from-[#FF5A1F]/12 via-amber-500/5 to-transparent blur-[120px] pointer-events-none rounded-full" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-10 items-center relative z-10 my-auto">
          {/* Left Hero Text Content Area */}
          <div className="lg:col-span-5 pt-2 lg:pt-0 space-y-4 sm:space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="font-syne text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-[1.06] tracking-tight"
            >
              No More Boring <br />
              <span className="text-white">Stock Images</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed max-w-md"
            >
              Generate high-quality images with prompt assistance, custom styles, and instant high-res visual output.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="pt-1"
            >
              <button
                onClick={() => {
                  document.getElementById('gallery-grid-start')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FF5A1F] text-black font-sans font-extrabold text-xs sm:text-sm hover:bg-[#ff723f] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#FF5A1F]/25 cursor-pointer"
              >
                <span>Join the Beta Version</span>
              </button>
            </motion.div>
          </div>

          {/* Right Cascading Staircase Bento Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 lg:gap-3.5 items-end pt-2 lg:pt-0">
            {/* Column 1 (Leftmost - Lowest step) */}
            <div className="flex flex-col gap-2.5 sm:gap-3 justify-end pt-12 sm:pt-16 lg:pt-20">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="h-[140px] sm:h-[180px] lg:h-[210px] xl:h-[240px] rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 group relative shadow-lg cursor-pointer"
                onClick={() => setSelectedPhoto(GALLERY_PHOTOS[0])}
              >
                <img
                  src="https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=800"
                  alt="Flower"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-2.5 sm:gap-3 justify-end pt-8 sm:pt-12 lg:pt-14">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="h-[120px] sm:h-[150px] lg:h-[180px] xl:h-[210px] rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 group relative shadow-lg cursor-pointer"
                onClick={() => setSelectedPhoto(GALLERY_PHOTOS[1])}
              >
                <img
                  src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800"
                  alt="Cat on Taxi Hood"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="h-[80px] sm:h-[100px] lg:h-[120px] xl:h-[140px] rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 group relative shadow-lg cursor-pointer"
              >
                <img
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800"
                  alt="Sage Mint Palette"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />
              </motion.div>
            </div>

            {/* Column 3 */}
            <div className="flex flex-col gap-2.5 sm:gap-3 justify-end pt-5 sm:pt-8 lg:pt-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="h-[110px] sm:h-[140px] lg:h-[170px] xl:h-[195px] rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 group relative shadow-lg cursor-pointer"
                onClick={() => setSelectedPhoto(GALLERY_PHOTOS[2])}
              >
                <img
                  src="https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=800"
                  alt="Minimal Plant"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="h-[100px] sm:h-[130px] lg:h-[160px] xl:h-[185px] rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 group relative shadow-lg cursor-pointer"
                onClick={() => setSelectedPhoto(GALLERY_PHOTOS[3])}
              >
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800"
                  alt="Golden Sunset Portrait"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />
              </motion.div>
            </div>

            {/* Column 4 */}
            <div className="flex flex-col gap-2.5 sm:gap-3 justify-end pt-2 sm:pt-4 lg:pt-5">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="h-[100px] sm:h-[125px] lg:h-[150px] xl:h-[175px] rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 group relative shadow-lg cursor-pointer"
              >
                <img
                  src="https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=800"
                  alt="Cat in Red Hoodie"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="h-[110px] sm:h-[135px] lg:h-[160px] xl:h-[185px] rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 group relative shadow-lg cursor-pointer"
                onClick={() => setSelectedPhoto(GALLERY_PHOTOS[4])}
              >
                <img
                  src="https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&q=80&w=800"
                  alt="Green Citrus Leaves in Blue Sky"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="h-[75px] sm:h-[90px] lg:h-[110px] xl:h-[130px] rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 group relative shadow-lg cursor-pointer"
                onClick={() => setSelectedPhoto(GALLERY_PHOTOS[5])}
              >
                <img
                  src="https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&q=80&w=800"
                  alt="Ancient Stone Canyon Ruins"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />
              </motion.div>
            </div>

            {/* Column 5 (Highest - Reaches Top Right) */}
            <div className="flex flex-col gap-2.5 sm:gap-3 justify-end pt-0">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="h-[115px] sm:h-[145px] lg:h-[175px] xl:h-[200px] rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 group relative shadow-lg cursor-pointer"
              >
                <img
                  src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800"
                  alt="Modern Chair with Oranges"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.55 }}
                className="h-[110px] sm:h-[135px] lg:h-[160px] xl:h-[185px] rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 group relative shadow-lg cursor-pointer"
              >
                <img
                  src="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=800"
                  alt="Iridescent 3D Sculpture"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="h-[75px] sm:h-[90px] lg:h-[110px] xl:h-[130px] rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 group relative shadow-lg cursor-pointer"
              >
                <img
                  src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800"
                  alt="Blue Vintage Car on Desert Road"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Trusted Partners Section */}
      <div className="w-full max-w-full mx-auto my-10 sm:my-14 px-4 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-1.5 mb-6 text-left"
        >
          <h2 className="font-syne text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
            Our Trusted Partners
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-neutral-400 font-sans max-w-2xl">
            We collaborate with industry leaders, creators & studios, combining cutting-edge technology and seamless experiences.
          </p>
        </motion.div>

        {/* Partner Logos Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5 items-center">
          {[
            { name: 'OpenAI', badge: 'AI Models' },
            { name: 'Midjourney', badge: 'Generative' },
            { name: 'Stability AI', badge: 'Diffusion' },
            { name: 'Runway', badge: 'Video AI' },
            { name: 'Adobe', badge: 'Creative' },
            { name: 'Figma', badge: 'UI & Design' },
          ].map((brand, idx) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
              className="h-16 rounded-2xl bg-[#0e0e13] border border-white/10 flex flex-col items-center justify-center p-3 hover:border-[#FF5A1F]/50 hover:bg-[#14141c] transition-all cursor-pointer group shadow-md"
            >
              <span className="font-syne font-bold text-sm sm:text-base text-neutral-300 group-hover:text-white transition-colors">
                {brand.name}
              </span>
              <span className="text-[9px] font-mono text-neutral-500 group-hover:text-[#FF5A1F] transition-colors">
                {brand.badge}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      <div id="gallery-grid-start" className="pt-2" />

      {/* Active Search/Category/Liked Results Indicator */}
      {(searchQuery || selectedCategory !== 'All' || showOnlyLiked) && (
        <div className="mb-4 flex items-center justify-between text-xs text-neutral-400 px-3 py-2.5 rounded-2xl bg-white/5 border border-white/10 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-white">
              Showing {filteredPhotos.length} of {GALLERY_PHOTOS.length} frames
            </span>
            {showOnlyLiked && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-syne font-bold">
                <Heart className="h-3.5 w-3.5 fill-current" />
                Liked Frames Only ({likedCount})
              </span>
            )}
            {selectedCategory !== 'All' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF5A1F]/20 text-[#FF5A1F] border border-[#FF5A1F]/30 text-xs">
                Category: {selectedCategory}
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-white text-xs">
                Query: "{searchQuery}"
              </span>
            )}
          </div>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
              setShowOnlyLiked(false);
            }}
            className="text-xs text-[#FF5A1F] hover:underline font-bold cursor-pointer"
          >
            Show All Frames
          </button>
        </div>
      )}

      {/* Photos Grid - 3 to 4 Column Responsive Grid Layout */}
      {filteredPhotos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 w-full">
          {filteredPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                delay: index * 0.03,
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
              onClick={() => setSelectedPhoto(photo)}
              className={`group relative ${photo.span || ''} ${photo.heightClass || 'h-[190px] sm:h-[220px]'} rounded-[18px] sm:rounded-[22px] overflow-hidden bg-[#111116] border border-white/10 cursor-pointer shadow-xl hover:border-[#FF5A1F]/50 hover:shadow-[#FF5A1F]/20 transition-all duration-300 transform hover:-translate-y-1`}
            >
              <img
                src={photo.src}
                alt={photo.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Category Pill Tag in Top-Left */}
              <div className="absolute top-3 left-3 z-10">
                <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-mono text-neutral-300 uppercase tracking-wider">
                  {photo.category}
                </span>
              </div>

              {/* Gradient Overlay & Hover Controls */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-5 flex flex-col justify-between">
                <div className="flex justify-end">
                  <button
                    onClick={(e) => toggleLike(photo.id, e)}
                    className={`p-2.5 rounded-full backdrop-blur-md transition-all ${
                      likedPhotos[photo.id]
                        ? 'bg-red-500 text-white'
                        : 'bg-black/60 text-white hover:bg-[#FF5A1F] hover:text-black border border-white/20'
                    }`}
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        likedPhotos[photo.id] ? 'fill-current' : ''
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-end justify-between text-white">
                  <div className="pr-2">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#FF5A1F]">
                      {photo.location}
                    </p>
                    <h3 className="font-syne font-bold text-xs sm:text-sm leading-tight mt-0.5 text-white line-clamp-2">
                      {photo.title}
                    </h3>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-[#FF5A1F] text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0">
                    <Maximize2 className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Empty Search / Liked Results State */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="my-16 py-16 px-6 text-center rounded-3xl bg-[#0d0d12] border border-white/10 flex flex-col items-center max-w-md mx-auto"
        >
          <div className="h-14 w-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
            <Heart className="h-6 w-6 fill-current" />
          </div>
          <h3 className="font-syne font-bold text-lg text-white mb-2">
            {showOnlyLiked ? 'No liked frames yet' : 'No photos found'}
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed mb-6">
            {showOnlyLiked
              ? 'Click the heart icon on any frame in the gallery to save it to your liked collection.'
              : `We couldn't find any shots matching "${searchQuery}" in category "${selectedCategory}".`}
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
              setShowOnlyLiked(false);
            }}
            className="px-5 py-2.5 rounded-full bg-[#FF5A1F] text-black text-xs font-syne font-bold hover:bg-orange-500 transition-colors shadow-lg cursor-pointer"
          >
            Show All Gallery Frames
          </button>
        </motion.div>
      )}

      {/* Footer Info Bar */}
      <div className="mt-12 sm:mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-4 w-full">
        <p>© {new Date().getFullYear()} NIHAL / AlUla Scenic Route Archive.</p>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[#FF5A1F]">
            {filteredPhotos.length} HIGH-RES SHOTS
          </span>
          <button
            onClick={onBack}
            className="font-bold text-white hover:text-[#FF5A1F] transition-colors cursor-pointer"
          >
            Return Home →
          </button>
        </div>
      </div>

      {/* Lightbox Modal & Floating Drawers/Modals */}
      <AnimatePresence>
        {/* Favorites Drawer / Modal */}
        {isFavoritesOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsFavoritesOpen(false)}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl bg-[#0e0e13] border border-white/20 rounded-3xl p-6 shadow-2xl text-white relative max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-red-500/20 text-red-500">
                    <Heart className="h-5 w-5 fill-current" />
                  </div>
                  <div>
                    <h3 className="font-syne font-bold text-lg text-white">Liked Frames ({likedCount})</h3>
                    <p className="text-xs text-neutral-400">Your curated favorite shots</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFavoritesOpen(false)}
                  className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto my-4 space-y-3 pr-1">
                {likedPhotosList.length > 0 ? (
                  likedPhotosList.map((photo) => (
                    <div
                      key={photo.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                    >
                      <div
                        onClick={() => {
                          setSelectedPhoto(photo);
                          setIsFavoritesOpen(false);
                        }}
                        className="flex items-center gap-3 cursor-pointer flex-1"
                      >
                        <img
                          src={photo.src}
                          alt={photo.title}
                          className="w-14 h-14 rounded-xl object-cover"
                        />
                        <div>
                          <h4 className="font-syne font-bold text-sm text-white hover:text-[#FF5A1F] transition-colors">
                            {photo.title}
                          </h4>
                          <p className="text-xs text-neutral-400">{photo.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenInquiry(photo)}
                          className="p-2 rounded-xl bg-[#FF5A1F] text-black hover:bg-orange-500 transition-colors cursor-pointer"
                          title="Inquire about this frame"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => toggleLike(photo.id, e)}
                          className="p-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                          title="Remove from favorites"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-neutral-400">
                    <Heart className="h-10 w-10 mx-auto text-neutral-600 mb-2" />
                    <p className="text-sm">No favorite frames saved yet.</p>
                    <p className="text-xs text-neutral-500 mt-1">Click the heart icon on any photo to save it here.</p>
                  </div>
                )}
              </div>

              {likedPhotosList.length > 0 && (
                <div className="pt-3 border-t border-white/10 flex justify-end">
                  <button
                    onClick={() => {
                      setIsFavoritesOpen(false);
                      setShowOnlyLiked(true);
                      const el = document.getElementById('gallery-grid-start');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-6 py-2.5 rounded-full bg-[#FF5A1F] text-black font-syne font-bold text-xs hover:bg-orange-500 transition-colors cursor-pointer"
                  >
                    View Liked Frames Grid
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Notifications Modal */}
        {isNotificationsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsNotificationsOpen(false)}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#0e0e13] border border-white/20 rounded-3xl p-6 shadow-2xl text-white relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[#FF5A1F]/20 text-[#FF5A1F]">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-syne font-bold text-lg text-white">Notifications</h3>
                    <p className="text-xs text-neutral-400">Updates & new frame drops</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="my-4 space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      n.read ? 'bg-white/5 border-white/5 opacity-70' : 'bg-[#FF5A1F]/10 border-[#FF5A1F]/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-syne font-bold text-xs text-white">{n.title}</h4>
                      <span className="text-[10px] text-neutral-400 font-mono">{n.time}</span>
                    </div>
                    <p className="text-xs text-neutral-300 mt-1 leading-relaxed">{n.desc}</p>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={handleMarkAllNotificationsRead}
                  className="text-xs text-[#FF5A1F] font-bold hover:underline cursor-pointer"
                >
                  Mark all as read
                </button>
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  className="px-5 py-2 rounded-full bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Inquire Modal / Drawer */}
        {isInquireOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsInquireOpen(false)}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[#0e0e13] border border-white/20 rounded-3xl p-6 shadow-2xl text-white relative max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-[#FF5A1F] text-black">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-syne font-bold text-lg text-white">
                      {inquireFrame ? `Inquire: ${inquireFrame.title}` : 'Inquire & Licensing Request'}
                    </h3>
                    <p className="text-xs text-neutral-400">Request high-res prints, 8K downloads, or commercial rights</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsInquireOpen(false)}
                  className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {inquireSuccess ? (
                <div className="py-10 text-center text-white space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h4 className="font-syne font-extrabold text-xl text-white">Inquiry Sent!</h4>
                  <p className="text-xs text-neutral-300 max-w-xs mx-auto leading-relaxed">
                    Thank you for your interest. Nihal will review your inquiry and email you at <span className="text-[#FF5A1F] font-bold">{inquireEmail || 'your email'}</span> within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setInquireSuccess(false);
                      setIsInquireOpen(false);
                    }}
                    className="px-6 py-2.5 rounded-full bg-[#FF5A1F] text-black text-xs font-bold hover:bg-orange-500 transition-colors cursor-pointer mt-4"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitInquiry} className="my-4 space-y-4">
                  {/* Selected Frame Preview if any */}
                  {inquireFrame && (
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                      <img
                        src={inquireFrame.src}
                        alt={inquireFrame.title}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div className="overflow-hidden">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-[#FF5A1F]">Selected Frame</span>
                        <h4 className="font-syne font-bold text-xs text-white truncate">{inquireFrame.title}</h4>
                        <p className="text-[11px] text-neutral-400">{inquireFrame.location}</p>
                      </div>
                    </div>
                  )}

                  {/* Name Input */}
                  <div>
                    <label className="text-xs font-mono text-neutral-300 block mb-1.5">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={inquireName}
                      onChange={(e) => setInquireName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF5A1F]"
                    />
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="text-xs font-mono text-neutral-300 block mb-1.5">Your Email Address *</label>
                    <input
                      type="email"
                      required
                      value={inquireEmail}
                      onChange={(e) => setInquireEmail(e.target.value)}
                      placeholder="e.g. alex@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF5A1F]"
                    />
                  </div>

                  {/* Inquiry Type */}
                  <div>
                    <label className="text-xs font-mono text-neutral-300 block mb-1.5">Inquiry Category</label>
                    <select
                      value={inquireType}
                      onChange={(e) => setInquireType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#14141d] border border-white/15 text-xs text-white focus:outline-none focus:border-[#FF5A1F]"
                    >
                      <option value="8K High-Res Print">8K High-Res Canvas / Print Licensing</option>
                      <option value="Commercial Rights">Commercial Advertising & Broadcast Rights</option>
                      <option value="Fine Art Exhibition">Fine Art Exhibition & Gallery Purchase</option>
                      <option value="Custom Commission">Custom Photography Commission</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="text-xs font-mono text-neutral-300 block mb-1.5">Message / Requirements</label>
                    <textarea
                      rows={3}
                      value={inquireMessage}
                      onChange={(e) => setInquireMessage(e.target.value)}
                      placeholder="Describe your project, print size preferences, or usage details..."
                      className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF5A1F] resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 rounded-full bg-[#FF5A1F] text-black font-syne font-extrabold text-xs sm:text-sm hover:bg-orange-500 transition-all shadow-xl shadow-[#FF5A1F]/20 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      <span>Submit Inquiry</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Sign In / Account Profile Modal */}
        {isSignInOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSignInOpen(false)}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#0e0e13] border border-white/20 rounded-3xl p-6 shadow-2xl text-white relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-[#FF5A1F] text-black">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-syne font-bold text-lg text-white">
                      {currentUser ? 'Collector Profile' : 'Sign In'}
                    </h3>
                    <p className="text-xs text-neutral-400">
                      {currentUser ? 'Manage your account & licenses' : 'Access high-res frames & VIP perks'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSignInOpen(false)}
                  className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {currentUser ? (
                /* Logged In Profile View */
                <div className="my-5 space-y-5">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="w-14 h-14 rounded-full bg-[#FF5A1F] text-black flex items-center justify-center font-extrabold text-xl shadow-lg border-2 border-white/30">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-syne font-bold text-base text-white">{currentUser.name}</h4>
                      <p className="text-xs text-neutral-400">{currentUser.email}</p>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-[#FF5A1F]/20 text-[#FF5A1F] text-[10px] font-mono font-bold border border-[#FF5A1F]/30">
                        {currentUser.plan || 'VIP Collector Pass'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                      <p className="text-xs text-neutral-400">Liked Frames</p>
                      <p className="text-lg font-syne font-extrabold text-[#FF5A1F]">{likedCount}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                      <p className="text-xs text-neutral-400">Account Access</p>
                      <p className="text-xs font-syne font-bold text-emerald-400 mt-1 flex items-center justify-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Active 8K Rights</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleSignOut}
                      className="w-full py-2.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-syne font-bold text-xs hover:bg-red-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Sign In Form View */
                <div className="my-5 space-y-4">
                  <div>
                    <label className="text-xs font-mono text-neutral-300 block mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      placeholder="e.g. collector@nihal.frames"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF5A1F]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-neutral-300 block mb-1.5">Password</label>
                    <input
                      type="password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF5A1F]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSignIn()}
                    className="w-full py-3 rounded-full bg-[#FF5A1F] text-black font-syne font-extrabold text-xs sm:text-sm hover:bg-orange-500 transition-all shadow-xl shadow-[#FF5A1F]/20 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Sign In</span>
                  </button>

                  <div className="relative my-4 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10" />
                    </div>
                    <span className="relative bg-[#0e0e13] px-3 text-[10px] text-neutral-500 font-mono uppercase">
                      Or Quick Login
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSignIn('nihal.collector@gmail.com', 'Nihal Collector')}
                    className="w-full py-2.5 rounded-full bg-white/10 text-white font-syne font-bold text-xs hover:bg-white/20 transition-all cursor-pointer border border-white/15 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="h-4 w-4 text-[#FF5A1F]" />
                    <span>Demo Sign In as Collector</span>
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Toast Notification */}
        {(addedToast || signInToast) && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[150] px-5 py-3 rounded-2xl bg-black text-white border border-[#FF5A1F] shadow-2xl flex items-center gap-3"
          >
            <div className="p-1.5 rounded-full bg-[#FF5A1F] text-black">
              <Check className="h-4 w-4" />
            </div>
            <span className="text-xs font-syne font-bold">{addedToast || signInToast}</span>
          </motion.div>
        )}

        {/* Lightbox Modal for Selected Photo */}
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-4 backdrop-blur-xl"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center bg-[#0d0d11] rounded-3xl p-4 sm:p-6 border border-white/15 shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-[#FF5A1F] hover:text-black transition-colors cursor-pointer border border-white/10"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="w-full max-h-[72vh] flex items-center justify-center rounded-2xl overflow-hidden bg-black border border-white/10">
                <img
                  src={selectedPhoto.src}
                  alt={selectedPhoto.title}
                  referrerPolicy="no-referrer"
                  className="max-h-[72vh] max-w-full object-contain"
                />
              </div>

              <div className="mt-4 w-full flex flex-col sm:flex-row items-start sm:items-center justify-between text-white gap-3 px-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#FF5A1F]/20 text-[#FF5A1F] border border-[#FF5A1F]/30">
                      {selectedPhoto.category}
                    </span>
                    <span className="text-xs font-mono text-neutral-400">
                      {selectedPhoto.location}
                    </span>
                  </div>
                  <h2 className="font-syne font-bold text-lg sm:text-xl text-white">
                    {selectedPhoto.title}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => toggleLike(selectedPhoto.id, e)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors cursor-pointer border border-white/15"
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        likedPhotos[selectedPhoto.id]
                          ? 'fill-red-500 text-red-500'
                          : ''
                      }`}
                    />
                    <span>
                      {likedPhotos[selectedPhoto.id] ? 'Liked' : 'Like'}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      const photoToInquire = selectedPhoto;
                      setSelectedPhoto(null);
                      handleOpenInquiry(photoToInquire);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FF5A1F] text-black text-xs font-bold hover:bg-orange-500 transition-colors cursor-pointer shadow-md"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Inquire Frame</span>
                  </button>
                  <a
                    href={selectedPhoto.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-colors cursor-pointer border border-white/15"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Original</span>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


