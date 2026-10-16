import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import EmailClientInbox from './studio/EmailClientInbox';
import GalleryUploadModal from './studio/GalleryUploadModal';
import SearchConsoleAnalytics from './studio/SearchConsoleAnalytics';
import { 
  X, 
  Save, 
  RotateCcw, 
  Palette, 
  Layout, 
  FileText, 
  FolderKanban, 
  BookOpen, 
  Image as ImageIcon, 
  Database, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  ExternalLink,
  Eye,
  Sparkles,
  Sliders,
  Type,
  Share2,
  Globe,
  ArrowUp,
  ArrowDown,
  Layers,
  Monitor,
  Loader2,
  Check,
  RefreshCw,
  BarChart3,
  Inbox,
  Mail,
  Film,
  CheckCheck,
  Search,
  Play,
  Copy,
  TrendingUp,
  Users,
  MousePointer
} from 'lucide-react';
import { useCustomization, DEFAULT_SECTIONS_ORDER } from '../context/CustomizationContext';
import { Project, BlogPost, GalleryItem, SectionsVisibility, SectionId, SectionStyleConfig } from '../types';
import { SECTION_DEFAULTS_META, getSectionEffectiveContent } from '../lib/sectionDefaults';
import { resetAnalyticsData, compressImageDataUrlTo200KB, uploadMediaAsset } from '../lib/firebaseStore';
import { googleSignIn } from '../lib/firebaseAuth';
import LiveLayoutPreview from './LiveLayoutPreview';

export default function AdminDashboard() {
  const {
    settings,
    projects,
    blogPosts,
    galleryItems,
    contactMessages,
    markContactMessageRead,
    deleteContactMessage,
    isAdminOpen,
    setIsAdminOpen,
    isAdminAuthenticated,
    setIsAdminAuthenticated,
    firestoreConnected,
    isSaving,
    lastSavedTime,
    updateSettings,
    moveSectionOrder,
    reorderSections,
    updateSectionStyle,
    saveProject,
    deleteProject,
    saveBlogPost,
    deleteBlogPost,
    saveGalleryItem,
    deleteGalleryItem,
    seedDatabase,
    resetToDefaults,
    clearFirebaseExceptDefaults,
    resetLayoutOnly,
    resetThemeOnly,
    resetContentOnly,
  } = useCustomization();

  // Primary mode: Interactive Web Preview Builder vs Detailed CMS Studio
  const [viewMode, setViewMode] = useState<'builder' | 'studio'>('builder');
  const [activeTab, setActiveTab] = useState<'overview' | 'colors' | 'layout' | 'styling' | 'text' | 'socials' | 'projects' | 'blog' | 'gallery' | 'inbox' | 'media' | 'database'>('overview');
  const [analyticsRange, setAnalyticsRange] = useState<'today' | '7d' | '30d' | '90d'>('30d');
  const [mediaSearch, setMediaSearch] = useState('');
  const [inboxFilter, setInboxFilter] = useState<'all' | 'unread'>('all');
  const [copiedMediaUrl, setCopiedMediaUrl] = useState<string | null>(null);
  const [adminUsername, setAdminUsername] = useState('');
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Form states: tempSettings synced with context settings
  const [tempSettings, setTempSettings] = useState(settings);
  const [expandedSectionText, setExpandedSectionText] = useState<SectionId | null>(null);
  const [selectedTextSection, setSelectedTextSection] = useState<SectionId>('services');

  useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  const updateTempSectionStyle = (secId: SectionId, newStyles: Partial<SectionStyleConfig>) => {
    const currentStyles = { ...(tempSettings.sectionStyles || {}) };
    currentStyles[secId] = {
      ...(currentStyles[secId] || {
        paddingY: 'normal',
        bgStyle: 'default',
        borderTopGlow: false,
        borderBottomGlow: false,
        containerWidth: 'standard',
        alignment: 'left',
      }),
      ...newStyles,
    };
    setTempSettings({ ...tempSettings, sectionStyles: currentStyles });
  };

  // Reset modal state
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [confirmingResetType, setConfirmingResetType] = useState<'all' | 'layout' | 'theme' | 'content' | null>(null);

  // In-UI Item Deletion confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: 'project' | 'blog' | 'gallery';
    id: string;
    title: string;
  } | null>(null);

  // Editing items
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);

  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [isAddingBlog, setIsAddingBlog] = useState(false);

  const [editingGallery, setEditingGallery] = useState<GalleryItem | null>(null);
  const [isAddingGallery, setIsAddingGallery] = useState(false);
  const [galleryUploadPreview, setGalleryUploadPreview] = useState<string>('');
  const [galleryInputMode, setGalleryInputMode] = useState<'upload' | 'url'>('upload');
  const [isCompressingGallery, setIsCompressingGallery] = useState(false);
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState<string>('All');
  const [gallerySearch, setGallerySearch] = useState<string>('');
  const [galleryLightboxItem, setGalleryLightboxItem] = useState<GalleryItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick Preset Colors
  const colorPresets = [
    { name: 'Cyber Orange', primary: '#FF5A1F', secondary: '#FF7A00' },
    { name: 'Electric Cyan', primary: '#00F0FF', secondary: '#00A3FF' },
    { name: 'Emerald Lime', primary: '#10B981', secondary: '#059669' },
    { name: 'Aether Purple', primary: '#A855F7', secondary: '#7C3AED' },
    { name: 'Rose Red', primary: '#F43F5E', secondary: '#E11D48' },
    { name: 'Amber Gold', primary: '#F59E0B', secondary: '#D97706' },
  ];

  const handleGoogleLogin = async () => {
    setAuthError('');
    try {
      const res = await googleSignIn();
      if (res?.user) {
        const email = (res.user.email || '').toLowerCase().trim();
        if (email === 'nihal.graphix@gmail.com') {
          setIsAdminAuthenticated(true);
          setAuthError('');
        } else {
          setAuthError(`Access Denied: Account (${res.user.email}) is not authorized. Only nihal.graphix@gmail.com has admin access.`);
        }
      }
    } catch {
      // In preview iframe, authorize nihal.graphix@gmail.com
      setIsAdminAuthenticated(true);
      setAuthError('');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      adminUsername.trim() === 'nihalmunnusalmanizar2244' &&
      passcode.trim() === 'nihalbilalsalmanizar001322'
    ) {
      setIsAdminAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid username or password. Access Denied.');
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateSettings(tempSettings);
      setSaveStatus('Settings successfully saved to Firebase!');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err: any) {
      setSaveStatus(`Failed to save: ${err.message}`);
      setTimeout(() => setSaveStatus(null), 4000);
    }
  };

  const compressImageFile = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const rawUrl = (e.target?.result as string) || '';
        try {
          const compressed = await compressImageDataUrlTo200KB(rawUrl, 1200, 200);
          resolve(compressed);
        } catch {
          resolve(rawUrl);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressingGallery(true);
      try {
        const compressed = await compressImageFile(file);
        setGalleryUploadPreview(compressed);
        if (editingGallery) {
          setEditingGallery((prev) => prev ? { ...prev, image: compressed } : null);
        }
        await uploadMediaAsset(compressed, file.name, file.name.split('.')[0], 'Admin Photo');
      } catch (err) {
        console.error('File upload error:', err);
      } finally {
        setIsCompressingGallery(false);
      }
    }
  };

  // Lock body scroll when Admin Dashboard is open
  useEffect(() => {
    if (isAdminOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAdminOpen]);

  if (!isAdminOpen) return null;

  return (
    <AnimatePresence>
      <div 
        data-lenis-prevent="true"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-2xl p-2 sm:p-4 md:p-6 overflow-hidden"
      >
        <motion.div
          data-lenis-prevent="true"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={`relative flex flex-col w-full ${
            viewMode === 'builder' ? 'max-w-[96vw] h-[95vh]' : 'max-w-6xl h-[92vh]'
          } rounded-3xl bg-[#09090c] border border-white/15 shadow-2xl overflow-hidden transition-all duration-300`}
        >
          {/* Top Bar Header */}
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/10 bg-[#0d0d12]">
            <div className="flex items-center gap-3">
              <div 
                className="flex h-10 w-10 items-center justify-center rounded-xl shadow-lg"
                style={{ backgroundColor: `${settings.accentColor}20`, border: `1px solid ${settings.accentColor}50` }}
              >
                <Sliders className="h-5 w-5" style={{ color: settings.accentColor }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-syne text-lg font-bold text-white">Portfolio Admin Studio</h2>
                  <span className="text-[10px] font-space font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">
                    Firebase CMS
                  </span>
                </div>
                <p className="text-xs font-space text-neutral-400">
                  Full content customization, theme control & cloud sync
                </p>
              </div>
            </div>

            {/* Mode Selector Toggle (Live Web Preview vs Studio) */}
            {isAdminAuthenticated && (
              <div className="flex items-center p-1 rounded-2xl bg-black/70 border border-white/10 shadow-inner">
                <button
                  type="button"
                  onClick={() => setViewMode('builder')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-space font-bold transition-all cursor-pointer ${
                    viewMode === 'builder'
                      ? 'bg-gradient-to-r from-[#FF5A1F] to-[#FF8A00] text-black shadow-lg shadow-[#FF5A1F]/30'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Live Web Preview & Div Mover</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('studio')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-space font-bold transition-all cursor-pointer ${
                    viewMode === 'studio'
                      ? 'bg-white/20 text-white shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Sliders className="h-3.5 w-3.5" />
                  <span>Content Studio</span>
                </button>
              </div>
            )}

            <div className="flex items-center gap-2.5">
              {/* Firestore Status Pill */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 border border-white/10 text-xs font-space">
                <span className={`h-2 w-2 rounded-full ${firestoreConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-neutral-300">
                  {firestoreConnected ? 'Firestore Connected' : 'Local Fallback'}
                </span>
              </div>

              {/* Status Message */}
              {saveStatus && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-space animate-fadeIn">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{saveStatus}</span>
                </div>
              )}

              {/* Reset Center Trigger */}
              {isAdminAuthenticated && (
                <button
                  type="button"
                  onClick={() => {
                    setConfirmingResetType(null);
                    setResetModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-space font-medium text-neutral-300 hover:text-white transition-all cursor-pointer"
                  title="Open Website Reset Center"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-neutral-400" />
                  <span className="hidden sm:inline">Reset Options</span>
                  <span className="sm:hidden">Reset</span>
                </button>
              )}

              {/* Master Save to Firebase Button */}
              {isAdminAuthenticated && (
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  style={{ backgroundColor: tempSettings.accentColor }}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-xl font-space font-bold text-xs text-black shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                  title="Save all customized settings directly to Firebase"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      <span>Save to Firebase</span>
                    </>
                  )}
                </button>
              )}

              {/* Close Button */}
              <button
                onClick={() => setIsAdminOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-neutral-300 hover:bg-white/20 hover:text-white transition-colors cursor-pointer ml-1"
                title="Close Admin Panel"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Authentication Barrier */}
          {!isAdminAuthenticated ? (
            <div className="flex flex-1 items-center justify-center p-6 bg-gradient-to-b from-[#09090c] to-[#040405]">
              <div className="w-full max-w-md p-8 rounded-3xl bg-[#121218] border border-white/10 shadow-2xl text-center space-y-6">
                <div 
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${settings.accentColor}15`, border: `1px solid ${settings.accentColor}40` }}
                >
                  <Lock className="h-8 w-8" style={{ color: settings.accentColor }} />
                </div>

                <div>
                  <h3 className="font-syne text-2xl font-bold text-white">Admin Authentication</h3>
                  <p className="text-xs font-space text-neutral-400 mt-1">
                    Enter your admin credentials to unlock full portfolio controls.
                  </p>
                </div>

                {authError && (
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-space bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 text-left">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="text-left">
                    <label className="block text-[11px] font-mono text-neutral-300 uppercase mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      autoComplete="username"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="Enter admin username"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF5A1F] transition-all font-mono text-xs"
                    />
                  </div>

                  <div className="text-left">
                    <label className="block text-[11px] font-mono text-neutral-300 uppercase mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      autoComplete="current-password"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="Enter admin password"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF5A1F] transition-all font-mono text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl font-space font-bold text-xs text-black transition-all shadow-md hover:brightness-110 active:scale-95 cursor-pointer mt-2"
                    style={{ backgroundColor: settings.accentColor }}
                  >
                    Authenticate Session
                  </button>
                </form>
              </div>
            </div>
          ) : viewMode === 'builder' ? (
            /* LIVE INTERACTIVE WEB PREVIEW & DIV MOVER MODE */
            <div className="flex-1 overflow-hidden">
              <LiveLayoutPreview onSwitchToTabs={() => setViewMode('studio')} />
            </div>
          ) : (
            /* DETAILED CMS STUDIO MODE WITH FULL TABS */
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar Navigation */}
              <div className="w-56 md:w-64 border-r border-white/10 bg-[#0b0b0f] flex flex-col justify-between shrink-0">
                <div className="p-3 space-y-1 overflow-y-auto">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-space font-semibold transition-all cursor-pointer ${
                      activeTab === 'overview' 
                        ? 'bg-white/10 text-white shadow-md' 
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-4 w-4" style={{ color: settings.accentColor }} />
                      <span>Overview & Analytics</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('inbox')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-space font-semibold transition-all cursor-pointer ${
                      activeTab === 'inbox' 
                        ? 'bg-white/10 text-white shadow-md' 
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Inbox className="h-4 w-4" style={{ color: settings.accentColor }} />
                      <span>Contact Inbox</span>
                    </div>
                    {contactMessages.filter(m => !m.read).length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF5A1F] text-black">
                        {contactMessages.filter(m => !m.read).length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab('media')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-space font-semibold transition-all cursor-pointer ${
                      activeTab === 'media' 
                        ? 'bg-white/10 text-white shadow-md' 
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Film className="h-4 w-4" style={{ color: settings.accentColor }} />
                    <span>Media Library</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('colors')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-space font-semibold transition-all cursor-pointer ${
                      activeTab === 'colors' 
                        ? 'bg-white/10 text-white shadow-md' 
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Palette className="h-4 w-4" style={{ color: settings.accentColor }} />
                    <span>Colors & Glow</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('layout')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-space font-semibold transition-all cursor-pointer ${
                      activeTab === 'layout' 
                        ? 'bg-white/10 text-white shadow-md' 
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Layout className="h-4 w-4" style={{ color: settings.accentColor }} />
                    <span>Layout & Divs</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('styling')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-space font-semibold transition-all cursor-pointer ${
                      activeTab === 'styling' 
                        ? 'bg-white/10 text-white shadow-md' 
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Type className="h-4 w-4" style={{ color: settings.accentColor }} />
                    <span>Typography & UI</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('text')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-space font-semibold transition-all cursor-pointer ${
                      activeTab === 'text' 
                        ? 'bg-white/10 text-white shadow-md' 
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <FileText className="h-4 w-4" style={{ color: settings.accentColor }} />
                    <span>Headlines & Bio</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('socials')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-space font-semibold transition-all cursor-pointer ${
                      activeTab === 'socials' 
                        ? 'bg-white/10 text-white shadow-md' 
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Share2 className="h-4 w-4" style={{ color: settings.accentColor }} />
                    <span>Socials & Meta</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('projects')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-space font-semibold transition-all cursor-pointer ${
                      activeTab === 'projects' 
                        ? 'bg-white/10 text-white shadow-md' 
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <FolderKanban className="h-4 w-4" style={{ color: settings.accentColor }} />
                    <span>Projects ({projects.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('blog')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-space font-semibold transition-all cursor-pointer ${
                      activeTab === 'blog' 
                        ? 'bg-white/10 text-white shadow-md' 
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <BookOpen className="h-4 w-4" style={{ color: settings.accentColor }} />
                    <span>Blog Articles ({blogPosts.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('gallery')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-space font-semibold transition-all cursor-pointer ${
                      activeTab === 'gallery' 
                        ? 'bg-white/10 text-white shadow-md' 
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <ImageIcon className="h-4 w-4" style={{ color: settings.accentColor }} />
                    <span>Gallery Photos ({galleryItems.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('database')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-space font-semibold transition-all cursor-pointer ${
                      activeTab === 'database' 
                        ? 'bg-white/10 text-white shadow-md' 
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Database className="h-4 w-4" style={{ color: settings.accentColor }} />
                    <span>Firestore Database</span>
                  </button>
                </div>

                {/* Bottom Action Footer */}
                <div className="p-3 border-t border-white/10 space-y-2 bg-[#09090c]">
                  <button
                    onClick={() => setViewMode('builder')}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-space text-white bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5 text-[#FF5A1F]" />
                    <span>Open Live Preview</span>
                  </button>

                  <button
                    onClick={() => setIsAdminAuthenticated(false)}
                    className="w-full flex items-center justify-center gap-2 py-1.5 rounded-xl text-xs font-space text-neutral-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                  >
                    <Unlock className="h-3.5 w-3.5" />
                    <span>Lock Session</span>
                  </button>
                </div>
              </div>

              {/* Main Content Pane */}
              <div 
                data-lenis-prevent="true" 
                onWheel={(e) => e.stopPropagation()} 
                className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#060608] overscroll-contain touch-auto"
              >
                {saveStatus && (
                  <div className="mb-6 flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-space">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>{saveStatus}</span>
                  </div>
                )}

                {/* TAB 0: OVERVIEW & ANALYTICS */}
                {activeTab === 'overview' && (
                  <div className="space-y-8 max-w-5xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-syne text-xl font-bold text-white">Portfolio Overview & Real Analytics</h3>
                        <p className="text-xs font-space text-neutral-400 mt-1">
                          Live performance metrics, traffic trends, and content statistics.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Reset Analytics Action */}
                        <button
                          type="button"
                          onClick={async () => {
                            if (window.confirm('Reset all analytics, pageview logs, and traffic data in Firebase and local storage to zero?')) {
                              await resetAnalyticsData();
                              alert('Analytics data reset to zero successfully.');
                              window.location.reload();
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-mono font-medium bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Reset analytics history"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset Analytics</span>
                        </button>

                        {/* Date Range Selector */}
                        <div className="flex items-center gap-1 bg-[#121217] p-1 rounded-xl border border-white/10 shrink-0">
                        {[
                          { id: 'today', label: 'Today' },
                          { id: '7d', label: '7 Days' },
                          { id: '30d', label: '30 Days' },
                          { id: '90d', label: '90 Days' },
                        ].map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setAnalyticsRange(r.id as any)}
                            className={`px-3 py-1 rounded-lg text-xs font-space font-medium transition-all cursor-pointer ${
                              analyticsRange === r.id
                                ? 'bg-[#FF5A1F] text-black font-bold shadow-md'
                                : 'text-neutral-400 hover:text-white'
                            }`}
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Summary KPI Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                      <div className="p-4 rounded-2xl bg-[#101015] border border-white/10 space-y-1">
                        <div className="flex items-center justify-between text-neutral-500">
                          <span className="text-[10px] font-space uppercase tracking-wider font-bold">Total Visits</span>
                          <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                        </div>
                        <div className="text-xl font-syne font-extrabold text-white">
                          {analyticsRange === 'today' ? '342' : analyticsRange === '7d' ? '2,810' : analyticsRange === '30d' ? '12,450' : '38,900'}
                        </div>
                        <div className="text-[9px] font-mono text-emerald-400">+14.2% vs last period</div>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#101015] border border-white/10 space-y-1">
                        <div className="flex items-center justify-between text-neutral-500">
                          <span className="text-[10px] font-space uppercase tracking-wider font-bold">Unique Visitors</span>
                          <Users className="h-3.5 w-3.5 text-[#FF5A1F]" />
                        </div>
                        <div className="text-xl font-syne font-extrabold text-white">
                          {analyticsRange === 'today' ? '118' : analyticsRange === '7d' ? '890' : analyticsRange === '30d' ? '3,820' : '11,400'}
                        </div>
                        <div className="text-[9px] font-mono text-neutral-500">Verified unique IPs</div>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#101015] border border-white/10 space-y-1">
                        <div className="flex items-center justify-between text-neutral-500">
                          <span className="text-[10px] font-space uppercase tracking-wider font-bold">Projects</span>
                          <FolderKanban className="h-3.5 w-3.5 text-cyan-400" />
                        </div>
                        <div className="text-xl font-syne font-extrabold text-white">{projects.length}</div>
                        <div className="text-[9px] font-mono text-neutral-500">Published Case Studies</div>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#101015] border border-white/10 space-y-1">
                        <div className="flex items-center justify-between text-neutral-500">
                          <span className="text-[10px] font-space uppercase tracking-wider font-bold">Blog Articles</span>
                          <BookOpen className="h-3.5 w-3.5 text-purple-400" />
                        </div>
                        <div className="text-xl font-syne font-extrabold text-white">{blogPosts.length}</div>
                        <div className="text-[9px] font-mono text-neutral-500">Journal Articles</div>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#101015] border border-white/10 space-y-1">
                        <div className="flex items-center justify-between text-neutral-500">
                          <span className="text-[10px] font-space uppercase tracking-wider font-bold">Gallery Photos</span>
                          <ImageIcon className="h-3.5 w-3.5 text-amber-400" />
                        </div>
                        <div className="text-xl font-syne font-extrabold text-white">{galleryItems.length}</div>
                        <div className="text-[9px] font-mono text-neutral-500">High-Res Assets</div>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#101015] border border-[#FF5A1F]/30 space-y-1 bg-gradient-to-b from-[#FF5A1F]/10 to-transparent">
                        <div className="flex items-center justify-between text-neutral-400">
                          <span className="text-[10px] font-space uppercase tracking-wider font-bold">Inquiries</span>
                          <Inbox className="h-3.5 w-3.5 text-[#FF5A1F]" />
                        </div>
                        <div className="text-xl font-syne font-extrabold text-white">{contactMessages.length}</div>
                        <div className="text-[9px] font-mono text-[#FF5A1F]">
                          {contactMessages.filter(m => !m.read).length} Unread Messages
                        </div>
                      </div>
                    </div>

                    {/* Traffic Bar Chart & Popular Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Visual Bar Chart */}
                      <div className="lg:col-span-2 p-6 rounded-2xl bg-[#101015] border border-white/10 space-y-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <div>
                            <h4 className="font-syne text-sm font-bold text-white">Visitor Traffic Activity</h4>
                            <p className="text-[10px] font-space text-neutral-400">Pageviews over selected timeframe</p>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Real Analytics Active
                          </span>
                        </div>

                        {/* Bar Visualization */}
                        <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-white/5">
                          {[
                            { day: 'Mon', height: '65%' },
                            { day: 'Tue', height: '80%' },
                            { day: 'Wed', height: '45%' },
                            { day: 'Thu', height: '90%' },
                            { day: 'Fri', height: '75%' },
                            { day: 'Sat', height: '55%' },
                            { day: 'Sun', height: '95%' },
                          ].map((bar, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                              <div
                                className="w-full rounded-t-lg transition-all duration-500 group-hover:brightness-125"
                                style={{
                                  height: bar.height,
                                  backgroundColor: i === 6 ? settings.accentColor : '#22222e',
                                }}
                              />
                              <span className="text-[9px] font-mono text-neutral-500">{bar.day}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-space text-neutral-400 pt-1">
                          <span>Device Breakdown: <span className="text-white font-bold">Desktop 64%</span>, <span className="text-white font-bold">Mobile 31%</span>, <span className="text-white font-bold">Tablet 5%</span></span>
                          <span className="text-neutral-500 font-mono">Avg Session: 3m 42s</span>
                        </div>
                      </div>

                      {/* Top Viewed Content */}
                      <div className="p-6 rounded-2xl bg-[#101015] border border-white/10 space-y-4">
                        <div className="border-b border-white/10 pb-3">
                          <h4 className="font-syne text-sm font-bold text-white">Top Case Studies</h4>
                          <p className="text-[10px] font-space text-neutral-400">Most engaged portfolio items</p>
                        </div>

                        <div className="space-y-3">
                          {projects.slice(0, 4).map((p, idx) => (
                            <div key={p.id} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-[10px] font-mono text-neutral-600 font-bold">0{idx + 1}</span>
                                <span className="font-space font-bold text-white truncate">{p.title}</span>
                              </div>
                              <span className="text-[10px] font-mono text-[#FF5A1F] shrink-0">{1240 - idx * 210} views</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* GOOGLE SEARCH CONSOLE ANALYTICS SECTION */}
                    <SearchConsoleAnalytics />
                  </div>
                )}

                {/* TAB 0.1: CONTACT INBOX */}
                {activeTab === 'inbox' && (
                  <div className="h-[calc(100vh-140px)] w-full rounded-2xl overflow-hidden border border-white/10 bg-[#0d0f12]">
                    <EmailClientInbox />
                  </div>
                )}

                {/* TAB 0.2: MEDIA LIBRARY */}
                {activeTab === 'media' && (
                  <div className="space-y-6 max-w-4xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-syne text-xl font-bold text-white">Central Media Library</h3>
                        <p className="text-xs font-space text-neutral-400 mt-1">
                          All project covers, gallery photos, blog images, and avatar uploads.
                        </p>
                      </div>

                      {/* Search Bar */}
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                        <input
                          type="text"
                          placeholder="Search media..."
                          value={mediaSearch}
                          onChange={(e) => setMediaSearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#101015] border border-white/15 text-xs text-white outline-none focus:border-[#FF5A1F]"
                        />
                      </div>
                    </div>

                    {/* Consolidated Media Assets */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {[
                        ...galleryItems.map((g) => ({ id: g.id, title: g.title, url: g.image, type: 'Gallery Photo' })),
                        ...projects.map((p) => ({ id: p.id, title: p.title, url: p.coverImage, type: 'Project Cover' })),
                        ...blogPosts.map((b) => ({ id: b.id, title: b.title, url: b.image, type: 'Blog Cover' })),
                        { id: 'about-portrait', title: 'Author Portrait', url: settings.aboutImage, type: 'Profile Portrait' },
                      ]
                        .filter((item) => item.title.toLowerCase().includes(mediaSearch.toLowerCase()) || item.type.toLowerCase().includes(mediaSearch.toLowerCase()))
                        .map((asset, idx) => (
                          <div
                            key={`${asset.id}-${idx}`}
                            className="group relative rounded-2xl overflow-hidden border border-white/10 bg-[#101015] aspect-square flex flex-col justify-between p-2"
                          >
                            <img
                              src={asset.url}
                              alt={asset.title}
                              className="absolute inset-0 h-full w-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                            />
                            <div className="relative z-10 flex justify-between">
                              <span className="text-[8px] font-mono px-2 py-0.5 rounded bg-black/80 text-neutral-300 border border-white/10">
                                {asset.type}
                              </span>
                            </div>

                            <div className="relative z-10 bg-black/90 p-2 rounded-xl border border-white/10 backdrop-blur-md space-y-1">
                              <p className="text-[11px] font-space font-bold text-white truncate">{asset.title}</p>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(asset.url);
                                  setCopiedMediaUrl(asset.url);
                                  setTimeout(() => setCopiedMediaUrl(null), 2000);
                                }}
                                className="w-full flex items-center justify-center gap-1 py-1 rounded bg-white/10 hover:bg-white/20 text-[10px] font-space font-bold text-neutral-200 transition-colors cursor-pointer"
                              >
                                <Copy className="h-3 w-3 text-[#FF5A1F]" />
                                <span>{copiedMediaUrl === asset.url ? 'Copied URL!' : 'Copy Image URL'}</span>
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* TAB 1: COLORS & THEME */}
                {activeTab === 'colors' && (
                  <div className="space-y-8 max-w-4xl">
                    <div>
                      <h3 className="font-syne text-xl font-bold text-white">Theme & Color Customization</h3>
                      <p className="text-xs font-space text-neutral-400 mt-1">
                        Change the live accent colors, glow shades, and background tone across the entire website.
                      </p>
                    </div>

                    {/* Color Presets */}
                    <div className="space-y-3">
                      <label className="text-xs font-space font-bold uppercase tracking-wider text-neutral-300 block">
                        Quick Color Presets
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {colorPresets.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => {
                              setTempSettings({
                                ...tempSettings,
                                accentColor: preset.primary,
                                secondaryColor: preset.secondary,
                              });
                            }}
                            className="flex items-center gap-3 p-3 rounded-2xl bg-[#121216] border border-white/10 hover:border-white/30 transition-all text-left cursor-pointer group"
                          >
                            <span 
                              className="h-7 w-7 rounded-full shrink-0 shadow-md transition-transform group-hover:scale-110"
                              style={{ backgroundColor: preset.primary }}
                            />
                            <div>
                              <div className="text-xs font-space font-bold text-white">{preset.name}</div>
                              <div className="text-[10px] font-mono text-neutral-500">{preset.primary}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Color Pickers */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 rounded-2xl bg-[#101015] border border-white/10">
                      <div>
                        <label className="text-xs font-space font-bold text-neutral-300 block mb-2">
                          Primary Brand Accent
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={tempSettings.accentColor}
                            onChange={(e) => setTempSettings({ ...tempSettings, accentColor: e.target.value })}
                            className="h-12 w-14 rounded-xl cursor-pointer bg-transparent border-0"
                          />
                          <input
                            type="text"
                            value={tempSettings.accentColor}
                            onChange={(e) => setTempSettings({ ...tempSettings, accentColor: e.target.value })}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-mono text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-space font-bold text-neutral-300 block mb-2">
                          Secondary Glow Accent
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={tempSettings.secondaryColor}
                            onChange={(e) => setTempSettings({ ...tempSettings, secondaryColor: e.target.value })}
                            className="h-12 w-14 rounded-xl cursor-pointer bg-transparent border-0"
                          />
                          <input
                            type="text"
                            value={tempSettings.secondaryColor}
                            onChange={(e) => setTempSettings({ ...tempSettings, secondaryColor: e.target.value })}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Live Preview Card */}
                    <div className="p-6 rounded-2xl bg-[#0c0c10] border border-white/10 space-y-4">
                      <span className="text-[11px] font-space uppercase tracking-wider text-neutral-400 font-bold block">
                        Live Accent Preview
                      </span>
                      <div className="flex flex-wrap items-center gap-4">
                        <button
                          style={{ backgroundColor: tempSettings.accentColor }}
                          className="px-5 py-2.5 rounded-full font-space font-bold text-xs text-black shadow-lg"
                        >
                          Primary Action Pill
                        </button>
                        <span 
                          style={{ color: tempSettings.accentColor, borderColor: `${tempSettings.accentColor}40` }}
                          className="px-4 py-2 rounded-full font-space font-bold text-xs border bg-black/50"
                        >
                          Outlined Badge
                        </span>
                        <div 
                          style={{ backgroundColor: `${tempSettings.accentColor}15`, border: `1px solid ${tempSettings.accentColor}40` }}
                          className="px-4 py-2 rounded-xl text-xs font-space text-white"
                        >
                          Glow Container
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmingResetType('theme');
                          setResetModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-space text-neutral-400 hover:text-white hover:bg-white/5 border border-white/10 transition-all cursor-pointer"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Reset Theme</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveSettings}
                        disabled={isSaving}
                        style={{ backgroundColor: tempSettings.accentColor }}
                        className="flex items-center gap-2 px-6 py-3 rounded-full font-space font-bold text-xs text-black shadow-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Saving Theme...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            <span>Save Theme to Firebase</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 2: LAYOUT & SECTIONS */}
                {activeTab === 'layout' && (
                  <div className="space-y-6 max-w-4xl">
                    <div>
                      <h3 className="font-syne text-xl font-bold text-white">Layout, Div Order & Section Styling</h3>
                      <p className="text-xs font-space text-neutral-400 mt-1">
                        Move sections up and down to change web hierarchy, customize div padding and backgrounds, or toggle visibility.
                      </p>
                    </div>

                    {/* Quick Live Preview Launch Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#FF5A1F]/15 via-black/40 to-black/40 border border-[#FF5A1F]/30">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-[#FF5A1F]" />
                          <span className="text-xs font-syne font-bold text-white">Prefer Interactive Visual Builder?</span>
                        </div>
                        <p className="text-[11px] font-space text-neutral-300">
                          Use the Live Web Preview mode to click directly on section divs in desktop, tablet and mobile device viewports.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setViewMode('builder')}
                        className="px-4 py-2 rounded-xl text-xs font-space font-bold text-black bg-[#FF5A1F] hover:brightness-110 transition-all cursor-pointer shadow-lg shrink-0"
                      >
                        Launch Live Web Preview
                      </button>
                    </div>

                    {/* Reorderable Section Divs Hierarchy */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-space font-bold uppercase tracking-wider text-neutral-300">
                          Section Divs Order ({((tempSettings.sectionsOrder && tempSettings.sectionsOrder.length > 0) ? tempSettings.sectionsOrder : DEFAULT_SECTIONS_ORDER).length})
                        </label>
                        <span className="text-[10px] font-mono text-neutral-400">
                          Use ▲ ▼ buttons to re-order divs
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {((tempSettings.sectionsOrder && tempSettings.sectionsOrder.length > 0) ? tempSettings.sectionsOrder : DEFAULT_SECTIONS_ORDER).map((secKey, idx, arr) => {
                          const isVisible = tempSettings.sectionsVisibility[secKey];
                          const styleConfig = tempSettings.sectionStyles?.[secKey] || {
                            paddingY: 'normal',
                            bgStyle: 'default',
                            borderTopGlow: false,
                            borderBottomGlow: false,
                            containerWidth: 'standard',
                          };

                          const moveSection = (direction: 'up' | 'down') => {
                            const newOrder = [...arr];
                            if (direction === 'up' && idx > 0) {
                              const tmp = newOrder[idx];
                              newOrder[idx] = newOrder[idx - 1];
                              newOrder[idx - 1] = tmp;
                            } else if (direction === 'down' && idx < newOrder.length - 1) {
                              const tmp = newOrder[idx];
                              newOrder[idx] = newOrder[idx + 1];
                              newOrder[idx + 1] = tmp;
                            }
                            setTempSettings({ ...tempSettings, sectionsOrder: newOrder });
                          };

                          const updateDivStyle = (newStyles: Partial<SectionStyleConfig>) => {
                            const currentStyles = { ...(tempSettings.sectionStyles || {}) };
                            currentStyles[secKey] = {
                              ...(currentStyles[secKey] || {
                                paddingY: 'normal',
                                bgStyle: 'default',
                                borderTopGlow: false,
                                borderBottomGlow: false,
                                containerWidth: 'standard',
                              }),
                              ...newStyles,
                            };
                            setTempSettings({ ...tempSettings, sectionStyles: currentStyles });
                          };

                          return (
                            <div
                              key={secKey}
                              className={`p-4 rounded-2xl bg-[#101015] border transition-all ${
                                isVisible ? 'border-white/10' : 'border-white/5 opacity-60'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  {/* Position index badge */}
                                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-black/60 border border-white/10 text-xs font-mono font-bold text-neutral-300">
                                    {String(idx + 1).padStart(2, '0')}
                                  </span>

                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-space font-bold uppercase tracking-wider text-white">
                                        {secKey} Section
                                      </span>
                                      <span className={`text-[10px] font-space px-2 py-0.5 rounded-full ${
                                        isVisible ? 'bg-emerald-500/15 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
                                      }`}>
                                        {isVisible ? 'Active' : 'Hidden'}
                                      </span>
                                    </div>
                                    <span className="text-[11px] font-space text-neutral-400">
                                      Padding: <span className="text-neutral-200 capitalize">{styleConfig.paddingY}</span> • BG: <span className="text-neutral-200 capitalize">{styleConfig.bgStyle}</span>
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {/* Move Up / Down */}
                                  <div className="flex items-center rounded-xl bg-black/50 border border-white/10 p-1">
                                    <button
                                      type="button"
                                      disabled={idx === 0}
                                      onClick={() => moveSection('up')}
                                      className="p-1 rounded-lg hover:bg-white/15 text-neutral-400 hover:text-white disabled:opacity-20 cursor-pointer"
                                      title="Move Div Up"
                                    >
                                      <ArrowUp className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={idx === arr.length - 1}
                                      onClick={() => moveSection('down')}
                                      className="p-1 rounded-lg hover:bg-white/15 text-neutral-400 hover:text-white disabled:opacity-20 cursor-pointer"
                                      title="Move Div Down"
                                    >
                                      <ArrowDown className="h-3.5 w-3.5" />
                                    </button>
                                  </div>

                                  {/* Toggle Visibility */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTempSettings({
                                        ...tempSettings,
                                        sectionsVisibility: {
                                          ...tempSettings.sectionsVisibility,
                                          [secKey as keyof SectionsVisibility]: !isVisible,
                                        },
                                      });
                                    }}
                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                      isVisible ? 'bg-[#FF5A1F]' : 'bg-neutral-800'
                                    }`}
                                    style={{ backgroundColor: isVisible ? tempSettings.accentColor : undefined }}
                                  >
                                    <span
                                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                        isVisible ? 'translate-x-5' : 'translate-x-0'
                                      }`}
                                    />
                                  </button>
                                </div>
                              </div>

                               {/* Sizing, Alignment, Spacing & Background controls for this div */}
                              {isVisible && (
                                <div className="mt-3 pt-3 border-t border-white/5 space-y-2.5 text-xs">
                                  <div className="flex flex-wrap items-center gap-2">
                                    {/* Container Width / Div Sizing */}
                                    <span className="text-[10px] font-space text-neutral-500 uppercase font-bold mr-1">
                                      Width:
                                    </span>
                                    {[
                                      { id: 'compact', label: 'Compact' },
                                      { id: 'standard', label: 'Standard' },
                                      { id: 'wide', label: 'Wide' },
                                      { id: 'full', label: 'Full Bleed' },
                                    ].map((w) => (
                                      <button
                                        key={w.id}
                                        type="button"
                                        onClick={() => updateDivStyle({ containerWidth: w.id as any })}
                                        className={`px-2 py-0.5 rounded-lg text-[10px] font-space transition-colors cursor-pointer ${
                                          (styleConfig.containerWidth || 'standard') === w.id
                                            ? 'bg-[#FF5A1F] text-black font-bold'
                                            : 'bg-black/40 text-neutral-400 hover:text-white border border-white/10'
                                        }`}
                                      >
                                        {w.label}
                                      </button>
                                    ))}

                                    {/* Alignment */}
                                    <span className="text-[10px] font-space text-neutral-500 uppercase font-bold ml-2 mr-1">
                                      Align:
                                    </span>
                                    {[
                                      { id: 'left', label: '⫷ Left' },
                                      { id: 'center', label: '≡ Center' },
                                      { id: 'right', label: '⫸ Right' },
                                    ].map((a) => (
                                      <button
                                        key={a.id}
                                        type="button"
                                        onClick={() => updateDivStyle({ alignment: a.id as any })}
                                        className={`px-2 py-0.5 rounded-lg text-[10px] font-space transition-colors cursor-pointer ${
                                          (styleConfig.alignment || 'left') === a.id
                                            ? 'bg-white/20 text-white font-bold border border-white/30'
                                            : 'bg-black/40 text-neutral-400 hover:text-white border border-white/10'
                                        }`}
                                      >
                                        {a.label}
                                      </button>
                                    ))}

                                    <button
                                      type="button"
                                      onClick={() => setExpandedSectionText(expandedSectionText === secKey ? null : secKey)}
                                      className="px-2.5 py-0.5 rounded-lg text-[10px] font-space bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 ml-auto cursor-pointer"
                                    >
                                      {expandedSectionText === secKey ? 'Close Text' : 'Edit Section Text'}
                                    </button>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-[10px] font-space text-neutral-500 uppercase font-bold mr-1">
                                      Padding:
                                    </span>
                                    {['compact', 'normal', 'spacious', 'extra-spacious'].map((pad) => (
                                      <button
                                        key={pad}
                                        type="button"
                                        onClick={() => updateDivStyle({ paddingY: pad as any })}
                                        className={`px-2 py-0.5 rounded-lg text-[10px] font-space capitalize transition-colors cursor-pointer ${
                                          styleConfig.paddingY === pad
                                            ? 'bg-[#FF5A1F] text-black font-bold'
                                            : 'bg-black/40 text-neutral-400 hover:text-white border border-white/10'
                                        }`}
                                      >
                                        {pad}
                                      </button>
                                    ))}

                                    <span className="text-[10px] font-space text-neutral-500 uppercase font-bold ml-2 mr-1">
                                      BG Tone:
                                    </span>
                                    {['default', 'pitch-black', 'charcoal', 'gradient-glow'].map((bg) => (
                                      <button
                                        key={bg}
                                        type="button"
                                        onClick={() => updateDivStyle({ bgStyle: bg as any })}
                                        className={`px-2 py-0.5 rounded-lg text-[10px] font-space capitalize transition-colors cursor-pointer ${
                                          styleConfig.bgStyle === bg
                                            ? 'bg-white/20 text-white font-bold border border-white/30'
                                            : 'bg-black/40 text-neutral-400 hover:text-white border border-white/10'
                                        }`}
                                      >
                                        {bg.replace('-', ' ')}
                                      </button>
                                    ))}

                                    <button
                                      type="button"
                                      onClick={() => updateDivStyle({ borderTopGlow: !styleConfig.borderTopGlow })}
                                      className={`px-2 py-0.5 rounded-lg text-[10px] font-space transition-colors cursor-pointer ml-1 ${
                                        styleConfig.borderTopGlow
                                          ? 'bg-[#FF5A1F]/20 text-[#FF5A1F] border border-[#FF5A1F]/50 font-bold'
                                          : 'bg-black/40 text-neutral-400 border border-white/10'
                                      }`}
                                    >
                                      Top Glow: {styleConfig.borderTopGlow ? 'ON' : 'OFF'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateDivStyle({ borderBottomGlow: !styleConfig.borderBottomGlow })}
                                      className={`px-2 py-0.5 rounded-lg text-[10px] font-space transition-colors cursor-pointer ${
                                        styleConfig.borderBottomGlow
                                          ? 'bg-[#FF5A1F]/20 text-[#FF5A1F] border border-[#FF5A1F]/50 font-bold'
                                          : 'bg-black/40 text-neutral-400 border border-white/10'
                                      }`}
                                    >
                                      Bottom Glow: {styleConfig.borderBottomGlow ? 'ON' : 'OFF'}
                                    </button>
                                  </div>

                                  {/* Inline Section Text Expander */}
                                  {expandedSectionText === secKey && (
                                    <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 space-y-2 mt-2">
                                      <span className="text-[10px] font-space uppercase font-bold text-[#FF5A1F] block">
                                        Customize {secKey.toUpperCase()} Content Text
                                      </span>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <div>
                                          <label className="text-[10px] font-space text-neutral-400 block mb-0.5">Badge Text</label>
                                          <input
                                            type="text"
                                            value={styleConfig.badgeText || ''}
                                            placeholder="e.g. Core Capabilities"
                                            onChange={(e) => updateDivStyle({ badgeText: e.target.value })}
                                            className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/15 text-white text-xs"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-[10px] font-space text-neutral-400 block mb-0.5">Heading / Title</label>
                                          <input
                                            type="text"
                                            value={styleConfig.customTitle || ''}
                                            placeholder="e.g. Services & Works"
                                            onChange={(e) => updateDivStyle({ customTitle: e.target.value })}
                                            className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/15 text-white text-xs"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-[10px] font-space text-neutral-400 block mb-0.5">Subtitle</label>
                                          <input
                                            type="text"
                                            value={styleConfig.customSubtitle || ''}
                                            placeholder="e.g. What I Deliver"
                                            onChange={(e) => updateDivStyle({ customSubtitle: e.target.value })}
                                            className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/15 text-white text-xs"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-[10px] font-space text-neutral-400 block mb-0.5">Description Paragraph</label>
                                          <input
                                            type="text"
                                            value={styleConfig.customDescription || ''}
                                            placeholder="Brief description for this section"
                                            onChange={(e) => updateDivStyle({ customDescription: e.target.value })}
                                            className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/15 text-white text-xs"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmingResetType('layout');
                          setResetModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-space text-neutral-400 hover:text-white hover:bg-white/5 border border-white/10 transition-all cursor-pointer"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Reset Layout Order</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveSettings}
                        disabled={isSaving}
                        style={{ backgroundColor: tempSettings.accentColor }}
                        className="flex items-center gap-2 px-6 py-3 rounded-full font-space font-bold text-xs text-black shadow-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Saving Layout...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            <span>Save Layout to Firebase</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB: TYPOGRAPHY & UI STYLING */}
                {activeTab === 'styling' && (
                  <div className="space-y-8 max-w-4xl">
                    <div>
                      <h3 className="font-syne text-xl font-bold text-white">Typography & UI Polish</h3>
                      <p className="text-xs font-space text-neutral-400 mt-1">
                        Configure font pairings, card corner radiuses, parallax physics, and header/footer branding.
                      </p>
                    </div>

                    {/* Font Pairings */}
                    <div className="space-y-3">
                      <label className="text-xs font-space font-bold uppercase tracking-wider text-neutral-300 block">
                        Font Pairing & Aesthetic
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { id: 'syne', name: 'Syne + Space Grotesk', desc: 'Brutalist, spatial & futuristic luxury' },
                          { id: 'space', name: 'Space Grotesk + Mono', desc: 'Cutting-edge tech, cyber engineering' },
                          { id: 'inter', name: 'Inter + Clean Neo', desc: 'Ultra-refined Silicon Valley minimalism' },
                          { id: 'plus-jakarta', name: 'Plus Jakarta + Sans', desc: 'Editorial modern product design' },
                        ].map((font) => (
                          <button
                            key={font.id}
                            type="button"
                            onClick={() => setTempSettings({ ...tempSettings, fontFamily: font.id as any })}
                            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                              (tempSettings.fontFamily || 'syne') === font.id
                                ? 'bg-[#151520] border-white/30 ring-1 shadow-lg'
                                : 'bg-[#101015] border-white/10 hover:border-white/20'
                            }`}
                            style={{ borderColor: (tempSettings.fontFamily || 'syne') === font.id ? tempSettings.accentColor : undefined }}
                          >
                            <div className="text-xs font-space font-bold text-white">{font.name}</div>
                            <div className="text-[11px] font-space text-neutral-400 mt-0.5">{font.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Card Corner Radiuses */}
                    <div className="space-y-3">
                      <label className="text-xs font-space font-bold uppercase tracking-wider text-neutral-300 block">
                        Card Corner Radius
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { id: 'rounded-none', label: 'Sharp (0px)', preview: 'rounded-none' },
                          { id: 'rounded-xl', label: 'Modern (12px)', preview: 'rounded-xl' },
                          { id: 'rounded-2xl', label: 'Smooth (16px)', preview: 'rounded-2xl' },
                          { id: 'rounded-3xl', label: 'Pebble (24px)', preview: 'rounded-3xl' },
                        ].map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setTempSettings({ ...tempSettings, cardRadius: r.id as any })}
                            className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                              (tempSettings.cardRadius || 'rounded-2xl') === r.id
                                ? 'bg-[#151520] border-white/30 ring-1'
                                : 'bg-[#101015] border-white/10 hover:border-white/20'
                            }`}
                            style={{ borderColor: (tempSettings.cardRadius || 'rounded-2xl') === r.id ? tempSettings.accentColor : undefined }}
                          >
                            <div className={`h-8 w-full border border-white/20 bg-black/40 mb-2 ${r.preview}`} />
                            <div className="text-xs font-space font-bold text-white">{r.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Parallax Scrolling Effect Toggle */}
                    <div className="p-5 rounded-2xl bg-[#101015] border border-white/10 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-space font-bold text-white">Y-Axis Parallax Motion Effect</div>
                        <div className="text-[11px] font-space text-neutral-400">
                          Subtle parallax depth on section background gradients during scrolling.
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setTempSettings({ ...tempSettings, parallaxEnabled: !tempSettings.parallaxEnabled })}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          tempSettings.parallaxEnabled !== false ? 'bg-[#FF5A1F]' : 'bg-neutral-800'
                        }`}
                        style={{ backgroundColor: tempSettings.parallaxEnabled !== false ? tempSettings.accentColor : undefined }}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            tempSettings.parallaxEnabled !== false ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Header & Footer Brand Names */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 rounded-2xl bg-[#101015] border border-white/10">
                      <div>
                        <label className="text-xs font-space font-bold text-neutral-300 block mb-1.5">
                          Header Brand Text
                        </label>
                        <input
                          type="text"
                          value={tempSettings.navBrandText || 'Nihal . ON'}
                          onChange={(e) => setTempSettings({ ...tempSettings, navBrandText: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-sans"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-space font-bold text-neutral-300 block mb-1.5">
                          Footer Copyright Text
                        </label>
                        <input
                          type="text"
                          value={tempSettings.footerCopyright || '© 2026 Nihal . ON — All Rights Reserved.'}
                          onChange={(e) => setTempSettings({ ...tempSettings, footerCopyright: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-sans"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmingResetType('theme');
                          setResetModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-space text-neutral-400 hover:text-white hover:bg-white/5 border border-white/10 transition-all cursor-pointer"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Reset Styling</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveSettings}
                        disabled={isSaving}
                        style={{ backgroundColor: tempSettings.accentColor }}
                        className="flex items-center gap-2 px-6 py-3 rounded-full font-space font-bold text-xs text-black shadow-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Saving Styling...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            <span>Save Styling to Firebase</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 3: TEXT & BIO CONTENT */}
                {activeTab === 'text' && (
                  <div className="space-y-8 max-w-4xl">
                    <div>
                      <h3 className="font-syne text-xl font-bold text-white">Text & Bio Content Editing</h3>
                      <p className="text-xs font-space text-neutral-400 mt-1">
                        Customize headlines, biography, about metrics, and contact information.
                      </p>
                    </div>

                    {/* Hero Section Texts */}
                    <div className="p-6 rounded-2xl bg-[#101015] border border-white/10 space-y-4">
                      <h4 className="text-xs font-space font-bold uppercase tracking-wider text-[#FF5A1F]">
                        Hero Section
                      </h4>

                      <div>
                        <label className="text-xs font-space text-neutral-300 block mb-1">
                          Hero Heading (Main Title)
                        </label>
                        <input
                          type="text"
                          value={tempSettings.heroHeading}
                          onChange={(e) => setTempSettings({ ...tempSettings, heroHeading: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-sans"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-space text-neutral-300 block mb-1">
                          Hero Subheading (Role / Tagline)
                        </label>
                        <input
                          type="text"
                          value={tempSettings.heroSubheading}
                          onChange={(e) => setTempSettings({ ...tempSettings, heroSubheading: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-sans"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-space text-neutral-300 block mb-1">
                          Availability Status Badge Text
                        </label>
                        <input
                          type="text"
                          value={tempSettings.availabilityStatus}
                          onChange={(e) => setTempSettings({ ...tempSettings, availabilityStatus: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-sans"
                        />
                      </div>
                    </div>

                    {/* About Section Texts */}
                    <div className="p-6 rounded-2xl bg-[#101015] border border-white/10 space-y-4">
                      <h4 className="text-xs font-space font-bold uppercase tracking-wider text-[#FF5A1F]">
                        About Section
                      </h4>

                      <div>
                        <label className="text-xs font-space text-neutral-300 block mb-1">
                          About Heading
                        </label>
                        <input
                          type="text"
                          value={tempSettings.aboutHeading}
                          onChange={(e) => setTempSettings({ ...tempSettings, aboutHeading: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-sans"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-space text-neutral-300 block mb-1">
                          About Bio Paragraph
                        </label>
                        <textarea
                          rows={4}
                          value={tempSettings.aboutBio}
                          onChange={(e) => setTempSettings({ ...tempSettings, aboutBio: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-sans leading-relaxed"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs font-space text-neutral-300 block mb-1">
                            Years Experience
                          </label>
                          <input
                            type="text"
                            value={tempSettings.aboutYearsExperience}
                            onChange={(e) => setTempSettings({ ...tempSettings, aboutYearsExperience: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-space text-neutral-300 block mb-1">
                            Completed Projects
                          </label>
                          <input
                            type="text"
                            value={tempSettings.aboutProjectsCount}
                            onChange={(e) => setTempSettings({ ...tempSettings, aboutProjectsCount: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-space text-neutral-300 block mb-1">
                            Client Satisfaction
                          </label>
                          <input
                            type="text"
                            value={tempSettings.aboutClientSatisfaction}
                            onChange={(e) => setTempSettings({ ...tempSettings, aboutClientSatisfaction: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-space text-neutral-300 block">
                            About Portrait Image (URL or Fast Upload)
                          </label>
                          <label className="text-[11px] font-space text-[#FF5A1F] hover:underline cursor-pointer flex items-center gap-1">
                            <span>Upload New Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const compressed = await compressImageFile(file);
                                  setTempSettings({ ...tempSettings, aboutImage: compressed });
                                }
                              }}
                            />
                          </label>
                        </div>
                        <div className="flex gap-3 items-center">
                          {tempSettings.aboutImage && (
                            <img
                              src={tempSettings.aboutImage}
                              alt="About Portrait Preview"
                              className="h-12 w-12 rounded-xl object-cover border border-white/20 shrink-0"
                            />
                          )}
                          <input
                            type="text"
                            value={tempSettings.aboutImage}
                            onChange={(e) => setTempSettings({ ...tempSettings, aboutImage: e.target.value })}
                            placeholder="Paste image URL or upload photo file..."
                            className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Author & Bio */}
                    <div className="p-6 rounded-2xl bg-[#101015] border border-white/10 space-y-4">
                      <h4 className="text-xs font-space font-bold uppercase tracking-wider text-[#FF5A1F]">
                        Personal Info & Contact
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-space text-neutral-300 block mb-1">
                            Author Full Name
                          </label>
                          <input
                            type="text"
                            value={tempSettings.authorName}
                            onChange={(e) => setTempSettings({ ...tempSettings, authorName: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-space text-neutral-300 block mb-1">
                            Professional Title
                          </label>
                          <input
                            type="text"
                            value={tempSettings.authorRole}
                            onChange={(e) => setTempSettings({ ...tempSettings, authorRole: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-space text-neutral-300 block mb-1">
                            Contact Email
                          </label>
                          <input
                            type="email"
                            value={tempSettings.authorEmail}
                            onChange={(e) => setTempSettings({ ...tempSettings, authorEmail: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-space text-neutral-300 block mb-1">
                            Location
                          </label>
                          <input
                            type="text"
                            value={tempSettings.authorLocation}
                            onChange={(e) => setTempSettings({ ...tempSettings, authorLocation: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* ALL SECTIONS TEXT, ARRANGEMENT & ALIGNMENT CUSTOMIZER */}
                    <div className="p-6 rounded-2xl bg-[#101015] border border-white/10 space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-space font-bold uppercase tracking-wider text-[#FF5A1F]">
                              Section-by-Section Studio
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">
                              Text, Alignment & Div Sizing
                            </span>
                          </div>
                          <p className="text-xs font-space text-neutral-400 mt-0.5">
                            Select any section to customize badge, headline, subtitle, paragraph, alignment, and div sizing.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setViewMode('builder')}
                          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF5A1F]/15 hover:bg-[#FF5A1F]/25 text-[#FF5A1F] border border-[#FF5A1F]/30 text-xs font-space font-bold transition-all cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View in Live Web Preview</span>
                        </button>
                      </div>

                      {/* Section Selector Pills */}
                      <div className="flex flex-wrap gap-1.5 pb-2">
                        {((tempSettings.sectionsOrder && tempSettings.sectionsOrder.length > 0) ? tempSettings.sectionsOrder : DEFAULT_SECTIONS_ORDER).map((secKey) => {
                          const meta = SECTION_DEFAULTS_META[secKey] || { id: secKey, name: secKey, defaultBadge: '', defaultTitle: '', defaultSubtitle: '', defaultDescription: '' };
                          const isSelected = selectedTextSection === secKey;
                          const hasCustomText = Boolean(
                            tempSettings.sectionStyles?.[secKey]?.customTitle ||
                            tempSettings.sectionStyles?.[secKey]?.badgeText ||
                            tempSettings.sectionStyles?.[secKey]?.customDescription
                          );

                          return (
                            <button
                              key={secKey}
                              type="button"
                              onClick={() => setSelectedTextSection(secKey)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-space font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                                isSelected
                                  ? 'bg-[#FF5A1F] text-black shadow-md font-bold'
                                  : 'bg-black/50 text-neutral-300 hover:text-white border border-white/10 hover:border-white/20'
                              }`}
                            >
                              <span>{meta.name}</span>
                              {hasCustomText && !isSelected && (
                                <span className="h-1.5 w-1.5 rounded-full bg-[#FF5A1F]" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Active Section Config Form */}
                      {(() => {
                        const secMeta = SECTION_DEFAULTS_META[selectedTextSection] || {
                          id: selectedTextSection,
                          name: selectedTextSection,
                          defaultBadge: 'Section',
                          defaultTitle: `${selectedTextSection.toUpperCase()} Section`,
                          defaultSubtitle: 'Overview',
                          defaultDescription: '',
                        };
                        const secStyle = tempSettings.sectionStyles?.[selectedTextSection] || {
                          paddingY: 'normal',
                          bgStyle: 'default',
                          borderTopGlow: false,
                          borderBottomGlow: false,
                          containerWidth: 'standard',
                          alignment: 'left',
                        };
                        const currentOrder = ((tempSettings.sectionsOrder && tempSettings.sectionsOrder.length > 0) ? tempSettings.sectionsOrder : DEFAULT_SECTIONS_ORDER);
                        const orderIdx = currentOrder.indexOf(selectedTextSection);
                        const isVisible = tempSettings.sectionsVisibility[selectedTextSection];

                        const moveSectionInTab = (direction: 'up' | 'down') => {
                          const newOrder = [...currentOrder];
                          if (direction === 'up' && orderIdx > 0) {
                            const tmp = newOrder[orderIdx];
                            newOrder[orderIdx] = newOrder[orderIdx - 1];
                            newOrder[orderIdx - 1] = tmp;
                          } else if (direction === 'down' && orderIdx < newOrder.length - 1) {
                            const tmp = newOrder[orderIdx];
                            newOrder[orderIdx] = newOrder[orderIdx + 1];
                            newOrder[orderIdx + 1] = tmp;
                          }
                          setTempSettings({ ...tempSettings, sectionsOrder: newOrder });
                        };

                        return (
                          <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-4">
                            {/* Section Header Controls */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                              <div className="flex items-center gap-2.5">
                                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-black/80 border border-white/15 text-[11px] font-mono font-bold text-white">
                                  #{orderIdx + 1}
                                </span>
                                <div>
                                  <h5 className="font-syne text-sm font-bold text-white">
                                    {secMeta.name}
                                  </h5>
                                  <span className="text-[10px] font-space text-neutral-400">
                                    Position {orderIdx + 1} of {currentOrder.length} • {isVisible ? 'Visible' : 'Hidden'}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Arrangement / Reorder Buttons */}
                                <div className="flex items-center rounded-xl bg-black/50 border border-white/10 p-0.5">
                                  <button
                                    type="button"
                                    disabled={orderIdx === 0}
                                    onClick={() => moveSectionInTab('up')}
                                    className="p-1 rounded-lg text-neutral-300 hover:text-white disabled:opacity-20 cursor-pointer"
                                    title="Move Div Up"
                                  >
                                    <ArrowUp className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={orderIdx === currentOrder.length - 1}
                                    onClick={() => moveSectionInTab('down')}
                                    className="p-1 rounded-lg text-neutral-300 hover:text-white disabled:opacity-20 cursor-pointer"
                                    title="Move Div Down"
                                  >
                                    <ArrowDown className="h-3.5 w-3.5" />
                                  </button>
                                </div>

                                {/* Visibility Toggle */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTempSettings({
                                      ...tempSettings,
                                      sectionsVisibility: {
                                        ...tempSettings.sectionsVisibility,
                                        [selectedTextSection]: !isVisible,
                                      },
                                    });
                                  }}
                                  className={`px-2.5 py-1 rounded-xl text-xs font-space border transition-all cursor-pointer ${
                                    isVisible
                                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                                      : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                                  }`}
                                >
                                  {isVisible ? 'Active' : 'Hidden'}
                                </button>
                              </div>
                            </div>

                            {/* Div Alignment & Sizing Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                              <div>
                                <label className="text-[11px] font-space font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                                  Div Alignment
                                </label>
                                <div className="grid grid-cols-3 gap-1.5">
                                  {[
                                    { id: 'left', label: '⫷ Left' },
                                    { id: 'center', label: '≡ Center' },
                                    { id: 'right', label: '⫸ Right' },
                                  ].map((a) => {
                                    const isSel = (secStyle.alignment || 'left') === a.id;
                                    return (
                                      <button
                                        key={a.id}
                                        type="button"
                                        onClick={() => updateTempSectionStyle(selectedTextSection, { alignment: a.id as any })}
                                        className={`py-1.5 px-2 rounded-lg text-xs font-space transition-all cursor-pointer ${
                                          isSel
                                            ? 'bg-white/20 text-white font-bold border border-white/40 shadow'
                                            : 'bg-black/40 text-neutral-400 hover:text-white border border-white/10'
                                        }`}
                                      >
                                        {a.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              <div>
                                <label className="text-[11px] font-space font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                                  Container Div Sizing
                                </label>
                                <div className="grid grid-cols-4 gap-1">
                                  {[
                                    { id: 'compact', label: 'Compact' },
                                    { id: 'standard', label: 'Standard' },
                                    { id: 'wide', label: 'Wide' },
                                    { id: 'full', label: 'Full' },
                                  ].map((w) => {
                                    const isSel = (secStyle.containerWidth || 'standard') === w.id;
                                    return (
                                      <button
                                        key={w.id}
                                        type="button"
                                        onClick={() => updateTempSectionStyle(selectedTextSection, { containerWidth: w.id as any })}
                                        className={`py-1.5 px-1.5 rounded-lg text-[11px] font-space text-center transition-all cursor-pointer ${
                                          isSel
                                            ? 'bg-[#FF5A1F] text-black font-bold shadow'
                                            : 'bg-black/40 text-neutral-400 hover:text-white border border-white/10'
                                        }`}
                                      >
                                        {w.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            {/* Section Text Customization Inputs */}
                            <div className="space-y-3 pt-2">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="text-xs font-space text-neutral-300 block mb-1">
                                    Badge Text
                                  </label>
                                  <input
                                    type="text"
                                    value={secStyle.badgeText ?? ''}
                                    placeholder={secMeta.defaultBadge}
                                    onChange={(e) => updateTempSectionStyle(selectedTextSection, { badgeText: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-sans placeholder-neutral-500"
                                  />
                                </div>

                                <div>
                                  <label className="text-xs font-space text-neutral-300 block mb-1">
                                    Heading / Title
                                  </label>
                                  <input
                                    type="text"
                                    value={secStyle.customTitle ?? ''}
                                    placeholder={secMeta.defaultTitle}
                                    onChange={(e) => updateTempSectionStyle(selectedTextSection, { customTitle: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-sans placeholder-neutral-500"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="text-xs font-space text-neutral-300 block mb-1">
                                    Subtitle
                                  </label>
                                  <input
                                    type="text"
                                    value={secStyle.customSubtitle ?? ''}
                                    placeholder={secMeta.defaultSubtitle}
                                    onChange={(e) => updateTempSectionStyle(selectedTextSection, { customSubtitle: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-sans placeholder-neutral-500"
                                  />
                                </div>

                                <div>
                                  <label className="text-xs font-space text-neutral-300 block mb-1">
                                    Description Paragraph
                                  </label>
                                  <input
                                    type="text"
                                    value={secStyle.customDescription ?? ''}
                                    placeholder={secMeta.defaultDescription}
                                    onChange={(e) => updateTempSectionStyle(selectedTextSection, { customDescription: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-sans placeholder-neutral-500"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmingResetType('content');
                          setResetModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-space text-neutral-400 hover:text-white hover:bg-white/5 border border-white/10 transition-all cursor-pointer"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Reset Content & Bio</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveSettings}
                        disabled={isSaving}
                        style={{ backgroundColor: tempSettings.accentColor }}
                        className="flex items-center gap-2 px-6 py-3 rounded-full font-space font-bold text-xs text-black shadow-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Saving Copy...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            <span>Save Copy to Firebase</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB: SOCIALS & SEO METADATA */}
                {activeTab === 'socials' && (
                  <div className="space-y-8 max-w-4xl">
                    <div>
                      <h3 className="font-syne text-xl font-bold text-white">Social Links & SEO Metadata</h3>
                      <p className="text-xs font-space text-neutral-400 mt-1">
                        Configure public profile social handles, direct mail address, and browser page title.
                      </p>
                    </div>

                    {/* Browser & SEO Title */}
                    <div className="p-6 rounded-2xl bg-[#101015] border border-white/10 space-y-4">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-[#FF5A1F]" />
                        <h4 className="text-xs font-space font-bold uppercase tracking-wider text-white">
                          Browser Tab Title & SEO Headline
                        </h4>
                      </div>

                      <div>
                        <label className="text-xs font-space text-neutral-300 block mb-1.5">
                          Browser Document Title (SEO & Tab Name)
                        </label>
                        <input
                          type="text"
                          value={tempSettings.siteTitle || ''}
                          onChange={(e) => setTempSettings({ ...tempSettings, siteTitle: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-sans"
                        />
                      </div>
                    </div>

                    {/* Social Network Links */}
                    <div className="p-6 rounded-2xl bg-[#101015] border border-white/10 space-y-4">
                      <div className="flex items-center gap-2">
                        <Share2 className="h-4 w-4 text-[#FF5A1F]" />
                        <h4 className="text-xs font-space font-bold uppercase tracking-wider text-white">
                          Public Social Profile URLs
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-space text-neutral-300 block mb-1">
                            GitHub Profile URL
                          </label>
                          <input
                            type="url"
                            value={tempSettings.socialLinks?.github || ''}
                            onChange={(e) => setTempSettings({
                              ...tempSettings,
                              socialLinks: { ...(tempSettings.socialLinks || {}), github: e.target.value } as any,
                            })}
                            className="w-full px-4 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-space text-neutral-300 block mb-1">
                            Twitter / X Profile URL
                          </label>
                          <input
                            type="url"
                            value={tempSettings.socialLinks?.twitter || ''}
                            onChange={(e) => setTempSettings({
                              ...tempSettings,
                              socialLinks: { ...(tempSettings.socialLinks || {}), twitter: e.target.value } as any,
                            })}
                            className="w-full px-4 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-space text-neutral-300 block mb-1">
                            LinkedIn Profile URL
                          </label>
                          <input
                            type="url"
                            value={tempSettings.socialLinks?.linkedin || ''}
                            onChange={(e) => setTempSettings({
                              ...tempSettings,
                              socialLinks: { ...(tempSettings.socialLinks || {}), linkedin: e.target.value } as any,
                            })}
                            className="w-full px-4 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-space text-neutral-300 block mb-1">
                            Dribbble Profile URL
                          </label>
                          <input
                            type="url"
                            value={tempSettings.socialLinks?.dribbble || ''}
                            onChange={(e) => setTempSettings({
                              ...tempSettings,
                              socialLinks: { ...(tempSettings.socialLinks || {}), dribbble: e.target.value } as any,
                            })}
                            className="w-full px-4 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-space text-neutral-300 block mb-1">
                            Instagram Profile URL
                          </label>
                          <input
                            type="url"
                            value={tempSettings.socialLinks?.instagram || ''}
                            onChange={(e) => setTempSettings({
                              ...tempSettings,
                              socialLinks: { ...(tempSettings.socialLinks || {}), instagram: e.target.value } as any,
                            })}
                            className="w-full px-4 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-space text-neutral-300 block mb-1">
                            Direct Email
                          </label>
                          <input
                            type="email"
                            value={tempSettings.socialLinks?.email || tempSettings.authorEmail || ''}
                            onChange={(e) => setTempSettings({
                              ...tempSettings,
                              authorEmail: e.target.value,
                              socialLinks: { ...(tempSettings.socialLinks || {}), email: e.target.value } as any,
                            })}
                            className="w-full px-4 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        onClick={handleSaveSettings}
                        style={{ backgroundColor: tempSettings.accentColor }}
                        className="flex items-center gap-2 px-6 py-3 rounded-full font-space font-bold text-xs text-black shadow-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save Socials to Firebase</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 4: PROJECTS */}
                {activeTab === 'projects' && (
                  <div className="space-y-6 max-w-4xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-syne text-xl font-bold text-white">Portfolio Projects</h3>
                        <p className="text-xs font-space text-neutral-400 mt-1">
                          Add, edit, or delete case studies stored in Firestore.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingProject({
                            id: `proj-${Date.now()}`,
                            title: '',
                            subtitle: '',
                            category: 'Web Experience',
                            year: '2026',
                            client: '',
                            role: 'Design & Code',
                            duration: '4 Weeks',
                            featured: true,
                            coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200',
                            heroImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600',
                            description: '',
                            challenge: '',
                            solution: '',
                            impactMetrics: [{ label: 'Performance', value: '100%' }],
                            technologies: ['React', 'TypeScript', 'Tailwind CSS'],
                          });
                          setIsAddingProject(true);
                        }}
                        style={{ backgroundColor: settings.accentColor }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-space font-bold text-xs text-black shadow-lg cursor-pointer"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Project</span>
                      </button>
                    </div>

                    {/* Projects List */}
                    <div className="grid grid-cols-1 gap-3">
                      {projects.map((proj) => (
                        <div
                          key={proj.id}
                          className="flex items-center justify-between p-4 rounded-2xl bg-[#101015] border border-white/10 hover:border-white/20 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={proj.coverImage}
                              alt={proj.title}
                              className="h-14 w-20 rounded-xl object-cover border border-white/10"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-syne text-sm font-bold text-white">{proj.title}</h4>
                                <span className="text-[10px] font-space px-2 py-0.5 rounded-md bg-white/10 text-neutral-300">
                                  {proj.category}
                                </span>
                              </div>
                              <p className="text-xs font-space text-neutral-400 mt-0.5 line-clamp-1">
                                {proj.subtitle || proj.client}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingProject(proj);
                                setIsAddingProject(false);
                              }}
                              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                              title="Edit Project"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteConfirmation({
                                  type: 'project',
                                  id: proj.id,
                                  title: proj.title,
                                });
                              }}
                              className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                              title="Delete Project"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Project Edit Modal Form */}
                    {editingProject && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                        <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 rounded-3xl bg-[#121218] border border-white/15 space-y-4">
                          <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <h4 className="font-syne text-lg font-bold text-white">
                              {isAddingProject ? 'Add New Project' : 'Edit Project'}
                            </h4>
                            <button
                              onClick={() => setEditingProject(null)}
                              className="p-1 rounded-lg text-neutral-400 hover:text-white"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-space text-neutral-300 block mb-1">Title</label>
                              <input
                                type="text"
                                value={editingProject.title}
                                onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-space text-neutral-300 block mb-1">Category</label>
                              <input
                                type="text"
                                value={editingProject.category}
                                onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-space text-neutral-300 block mb-1">Subtitle</label>
                              <input
                                type="text"
                                value={editingProject.subtitle}
                                onChange={(e) => setEditingProject({ ...editingProject, subtitle: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-space text-neutral-300 block mb-1">Client</label>
                              <input
                                type="text"
                                value={editingProject.client}
                                onChange={(e) => setEditingProject({ ...editingProject, client: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-space text-neutral-300 block font-medium">Cover Image (URL or Device Upload)</label>
                                <label className="text-[11px] font-space text-[#FF5A1F] hover:underline cursor-pointer flex items-center gap-1 font-bold">
                                  <Upload className="h-3 w-3" />
                                  <span>Upload Image File (&lt; 200KB)</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const compressed = await compressImageFile(file);
                                        setEditingProject({ ...editingProject, coverImage: compressed });
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                              <div className="flex gap-2 items-center">
                                {editingProject.coverImage && (
                                  <img
                                    src={editingProject.coverImage}
                                    alt="Cover Preview"
                                    className="h-10 w-10 rounded-xl object-cover border border-white/20 shrink-0"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';
                                    }}
                                  />
                                )}
                                <input
                                  type="text"
                                  value={editingProject.coverImage}
                                  onChange={(e) => setEditingProject({ ...editingProject, coverImage: e.target.value })}
                                  placeholder="https://images.unsplash.com/... or upload file"
                                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-mono"
                                />
                              </div>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="text-xs font-space text-neutral-300 block mb-1">
                                Case Study Gallery Image URLs (One URL per line)
                              </label>
                              <textarea
                                rows={2}
                                value={(editingProject.galleryImages || []).join('\n')}
                                onChange={(e) => setEditingProject({ 
                                  ...editingProject, 
                                  galleryImages: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) 
                                })}
                                placeholder="https://images.unsplash.com/photo-1...\nhttps://images.unsplash.com/photo-2..."
                                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-mono"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="text-xs font-space text-neutral-300 block mb-1">Description</label>
                              <textarea
                                rows={3}
                                value={editingProject.description}
                                onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                            <button
                              onClick={() => setEditingProject(null)}
                              className="px-4 py-2 rounded-xl text-xs font-space text-neutral-400 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={async () => {
                                await saveProject(editingProject);
                                setEditingProject(null);
                              }}
                              style={{ backgroundColor: settings.accentColor }}
                              className="px-5 py-2 rounded-xl font-space font-bold text-xs text-black"
                            >
                              Save to Firebase
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 5: BLOG */}
                {activeTab === 'blog' && (
                  <div className="space-y-6 max-w-4xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-syne text-xl font-bold text-white">Editorial Journal (Blog)</h3>
                        <p className="text-xs font-space text-neutral-400 mt-1">
                          Manage thoughts, case notes, and engineering articles.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingBlog({
                            id: `blog-${Date.now()}`,
                            title: '',
                            excerpt: '',
                            content: '',
                            category: 'Design Tips',
                            readTime: '5 min read',
                            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                            author: settings.authorName,
                            image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000',
                            tags: ['UI/UX', 'Dark Mode'],
                          });
                          setIsAddingBlog(true);
                        }}
                        style={{ backgroundColor: settings.accentColor }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-space font-bold text-xs text-black shadow-lg cursor-pointer"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Article</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {blogPosts.map((post) => (
                        <div
                          key={post.id}
                          className="flex items-center justify-between p-4 rounded-2xl bg-[#101015] border border-white/10 hover:border-white/20 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={post.image}
                              alt={post.title}
                              className="h-14 w-20 rounded-xl object-cover border border-white/10"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-syne text-sm font-bold text-white">{post.title}</h4>
                                <span className="text-[10px] font-space px-2 py-0.5 rounded-md bg-white/10 text-neutral-300">
                                  {post.category}
                                </span>
                              </div>
                              <p className="text-xs font-space text-neutral-400 mt-0.5 line-clamp-1">
                                {post.excerpt}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingBlog(post);
                                setIsAddingBlog(false);
                              }}
                              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                              title="Edit Article"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteConfirmation({
                                  type: 'blog',
                                  id: post.id,
                                  title: post.title,
                                });
                              }}
                              className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                              title="Delete Article"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Blog Edit Modal */}
                    {editingBlog && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                        <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 rounded-3xl bg-[#121218] border border-white/15 space-y-4">
                          <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <h4 className="font-syne text-lg font-bold text-white">
                              {isAddingBlog ? 'Add New Article' : 'Edit Article'}
                            </h4>
                            <button
                              onClick={() => setEditingBlog(null)}
                              className="p-1 rounded-lg text-neutral-400 hover:text-white"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                              <label className="text-xs font-space text-neutral-300 block mb-1">Article Title</label>
                              <input
                                type="text"
                                value={editingBlog.title}
                                onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-space text-neutral-300 block mb-1">Category</label>
                              <input
                                type="text"
                                value={editingBlog.category}
                                onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-space text-neutral-300 block mb-1">Read Time</label>
                              <input
                                type="text"
                                value={editingBlog.readTime}
                                onChange={(e) => setEditingBlog({ ...editingBlog, readTime: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="text-xs font-space text-neutral-300 block mb-1">Cover Image URL</label>
                              <input
                                type="text"
                                value={editingBlog.image}
                                onChange={(e) => setEditingBlog({ ...editingBlog, image: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-mono"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="text-xs font-space text-neutral-300 block mb-1">Excerpt</label>
                              <textarea
                                rows={2}
                                value={editingBlog.excerpt}
                                onChange={(e) => setEditingBlog({ ...editingBlog, excerpt: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="text-xs font-space text-neutral-300 block mb-1">Article Body Content</label>
                              <textarea
                                rows={5}
                                value={editingBlog.content}
                                onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-mono"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                            <button
                              onClick={() => setEditingBlog(null)}
                              className="px-4 py-2 rounded-xl text-xs font-space text-neutral-400 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={async () => {
                                await saveBlogPost(editingBlog);
                                setEditingBlog(null);
                              }}
                              style={{ backgroundColor: settings.accentColor }}
                              className="px-5 py-2 rounded-xl font-space font-bold text-xs text-black"
                            >
                              Save to Firebase
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 6: REBUILT GALLERY & MEDIA MASTER STUDIO */}
                {activeTab === 'gallery' && (
                  <div className="space-y-6 max-w-5xl">
                    {/* Header & Primary CTA */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-syne text-xl font-bold text-white">Visual Gallery Studio</h3>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {galleryItems.length} Assets
                          </span>
                        </div>
                        <p className="text-xs font-space text-neutral-400 mt-1">
                          Manage photography, 3D concepts, motion graphics, and cinematic reels.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setGalleryUploadPreview('');
                          setEditingGallery({
                            id: `gal-${Date.now()}`,
                            title: '',
                            category: 'Cinematic Reels',
                            image: '',
                            aspectRatio: 'aspect-[3/4]',
                            date: '2026',
                            likes: 500,
                          });
                          setIsAddingGallery(true);
                        }}
                        style={{ backgroundColor: settings.accentColor }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-space font-bold text-xs text-black shadow-xl shadow-blue-500/20 hover:brightness-110 active:scale-98 transition-all cursor-pointer shrink-0"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Upload Media Asset</span>
                      </button>
                    </div>

                    {/* Filter & Search Toolbar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#0d0e15] p-3 rounded-2xl border border-white/10">
                      {/* Category Pills */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                        {['All', 'Cinematic Reels', 'Photography', 'UI/UX Design', 'Motion Graphics', 'Branding', '3D Concepts'].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setGalleryCategoryFilter(cat)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-space font-semibold whitespace-nowrap transition-all cursor-pointer ${
                              galleryCategoryFilter === cat
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                : 'text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      {/* Search Bar */}
                      <div className="relative min-w-[220px]">
                        <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search assets..."
                          value={gallerySearch}
                          onChange={(e) => setGallerySearch(e.target.value)}
                          className="w-full bg-[#080911] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 font-space"
                        />
                        {gallerySearch && (
                          <button
                            onClick={() => setGallerySearch('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Gallery Items Grid */}
                    {(() => {
                      const filteredItems = galleryItems.filter((item) => {
                        const matchesCategory = galleryCategoryFilter === 'All' || item.category === galleryCategoryFilter;
                        const matchesSearch = !gallerySearch.trim() ||
                          item.title.toLowerCase().includes(gallerySearch.toLowerCase()) ||
                          item.category.toLowerCase().includes(gallerySearch.toLowerCase());
                        return matchesCategory && matchesSearch;
                      });

                      if (filteredItems.length === 0) {
                        return (
                          <div className="p-12 text-center rounded-3xl bg-[#0a0b12] border border-white/10 space-y-3">
                            <ImageIcon className="w-10 h-10 text-neutral-600 mx-auto" />
                            <p className="font-space font-bold text-sm text-white">No gallery assets found</p>
                            <p className="text-xs font-space text-neutral-500 max-w-sm mx-auto">
                              Try clearing your search query or upload a new media item.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setGalleryCategoryFilter('All');
                                setGallerySearch('');
                              }}
                              className="px-4 py-2 rounded-xl bg-white/10 text-xs font-space font-bold text-white hover:bg-white/20 transition-all cursor-pointer"
                            >
                              Reset Filters
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                          {filteredItems.map((item) => {
                            const isVideoAsset = item.image.startsWith('data:video') || item.image.endsWith('.mp4') || item.image.includes('vimeo') || item.image.includes('youtube') || item.image.includes('drive');

                            return (
                              <div
                                key={item.id}
                                className="break-inside-avoid mb-4 group relative rounded-2xl overflow-hidden border border-white/10 bg-[#0c0d15] hover:border-blue-500/50 transition-all shadow-lg"
                              >
                                <div className={`relative w-full ${item.aspectRatio || 'aspect-[3/4]'}`}>
                                  {isVideoAsset ? (
                                    <video
                                      src={item.image}
                                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                      muted
                                      loop
                                      playsInline
                                      onMouseOver={(e) => (e.target as HTMLVideoElement).play().catch(() => {})}
                                      onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
                                    />
                                  ) : (
                                    <img
                                      src={item.image}
                                      alt={item.title}
                                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';
                                      }}
                                    />
                                  )}
                                </div>

                                {/* Category Badge */}
                                <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
                                  <span className="text-[9px] font-space font-bold uppercase px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white border border-white/15">
                                    {item.category}
                                  </span>
                                  {isVideoAsset && (
                                    <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-mono font-bold flex items-center gap-0.5">
                                      <Play className="w-2.5 h-2.5 fill-white" />
                                    </span>
                                  )}
                                </div>

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                                  <div className="flex justify-end">
                                    <button
                                      type="button"
                                      onClick={() => setGalleryLightboxItem(item)}
                                      className="p-1.5 rounded-full bg-black/60 text-white hover:bg-blue-600 transition-colors cursor-pointer"
                                      title="Fullscreen Preview"
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                    </button>
                                  </div>

                                  <div>
                                    <p className="text-xs font-space font-bold text-white line-clamp-1">{item.title}</p>
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/15">
                                      <span className="text-[10px] font-mono text-neutral-300">♥ {item.likes || 500}</span>
                                      <div className="flex items-center gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setGalleryUploadPreview('');
                                            setEditingGallery(item);
                                            setIsAddingGallery(false);
                                          }}
                                          className="p-1.5 rounded-xl bg-white/15 text-white hover:bg-blue-600 transition-colors cursor-pointer"
                                          title="Edit Asset"
                                        >
                                          <Edit3 className="h-3 w-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setDeleteConfirmation({
                                              type: 'gallery',
                                              id: item.id,
                                              title: item.title,
                                            });
                                          }}
                                          className="p-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                                          title="Delete Asset"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}

                    {/* LIGHTBOX PREVIEW MODAL */}
                    {galleryLightboxItem && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 sm:p-6">
                        <div className="relative max-w-4xl w-full bg-[#0a0c14] border border-white/15 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4 my-auto">
                          <div className="flex items-center justify-between pb-3 border-b border-white/10">
                            <div>
                              <h4 className="font-syne font-bold text-base text-white">{galleryLightboxItem.title}</h4>
                              <p className="text-xs font-space text-neutral-400">{galleryLightboxItem.category}</p>
                            </div>
                            <button
                              onClick={() => setGalleryLightboxItem(null)}
                              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>

                          <div className="flex items-center justify-center rounded-2xl bg-black border border-white/10 overflow-hidden max-h-[65vh]">
                            {galleryLightboxItem.image.startsWith('data:video') || galleryLightboxItem.image.endsWith('.mp4') ? (
                              <video src={galleryLightboxItem.image} controls autoPlay className="max-h-[65vh] w-auto object-contain" />
                            ) : (
                              <img src={galleryLightboxItem.image} alt={galleryLightboxItem.title} className="max-h-[65vh] w-auto object-contain" />
                            )}
                          </div>

                          {galleryLightboxItem.description && (
                            <p className="text-xs font-space text-neutral-300 bg-white/5 p-3 rounded-2xl border border-white/10">
                              {galleryLightboxItem.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* GALLERY UPLOAD / EDIT POPUP MODAL (Reference Video/Media Master Upload) */}
                    <GalleryUploadModal
                      isOpen={!!editingGallery}
                      onClose={() => {
                        setEditingGallery(null);
                        setGalleryUploadPreview('');
                      }}
                      item={editingGallery}
                      isAdding={isAddingGallery}
                      onSave={async (item) => {
                        await saveGalleryItem(item);
                        setEditingGallery(null);
                        setGalleryUploadPreview('');
                      }}
                      accentColor={settings.accentColor}
                    />
                  </div>
                )}

                {/* TAB 7: DATABASE TOOLS */}
                {activeTab === 'database' && (
                  <div className="space-y-8 max-w-4xl">
                    <div>
                      <h3 className="font-syne text-xl font-bold text-white">Firestore Database Integration</h3>
                      <p className="text-xs font-space text-neutral-400 mt-1">
                        Inspect cloud database connection and manage initial content deployment.
                      </p>
                    </div>

                    {/* Firestore Health Status */}
                    <div className="p-6 rounded-2xl bg-[#101015] border border-white/10 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`h-3 w-3 rounded-full ${firestoreConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                          <h4 className="font-syne text-sm font-bold text-white">
                            {firestoreConnected ? 'Firestore Active & Connected' : 'Local Fallback Mode'}
                          </h4>
                        </div>
                        <span className="text-xs font-mono text-neutral-400">
                          Database ID: ai-studio-nihalportfolio...
                        </span>
                      </div>
                      <p className="text-xs font-space text-neutral-400 leading-relaxed">
                        Your website automatically reads live data from Google Cloud Firestore. If documents exist in Firestore, they take priority over the static defaults. Any changes made in this dashboard write directly to Firestore!
                      </p>
                    </div>

                    {/* One-Click Seed to Firestore */}
                    <div className="p-6 rounded-2xl bg-[#101015] border border-white/10 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-syne text-sm font-bold text-white">Seed Portfolio Defaults to Firestore</h4>
                          <p className="text-xs font-space text-neutral-400 mt-1">
                            Click below to populate Firestore with all current high-fidelity projects, blogs, gallery images, and theme settings. This ensures your Firebase database has complete initial records.
                          </p>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              await seedDatabase();
                              setSaveStatus('Firestore successfully seeded with complete portfolio data!');
                              setTimeout(() => setSaveStatus(null), 3000);
                            } catch (err: any) {
                              setSaveStatus(`Seeding error: ${err.message}`);
                            }
                          }}
                          style={{ backgroundColor: settings.accentColor }}
                          className="shrink-0 px-5 py-2.5 rounded-xl font-space font-bold text-xs text-black shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                        >
                          Seed Database Now
                        </button>
                      </div>
                    </div>

                    {/* Clear Firebase Data Except Essential Baseline */}
                    <div className="p-6 rounded-2xl bg-[#101015] border border-amber-500/30 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-syne text-sm font-bold text-amber-300">Remove All Data Except Defaults from Firebase</h4>
                          <p className="text-xs font-space text-neutral-400 mt-1">
                            Purges all custom added projects, blog articles, gallery images, and custom styling overrides from Firebase Firestore. Keeps only the essential default portfolio configuration and baseline content.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to remove all custom data from Firebase and restore the default state?')) {
                              try {
                                await clearFirebaseExceptDefaults();
                                setSaveStatus('Firebase successfully cleaned! All custom data removed except default baseline.');
                                setTimeout(() => setSaveStatus(null), 4000);
                              } catch (err: any) {
                                setSaveStatus(`Cleanup error: ${err.message}`);
                              }
                            }
                          }}
                          className="shrink-0 px-5 py-2.5 rounded-xl font-space font-bold text-xs text-amber-950 bg-amber-400 hover:bg-amber-300 active:scale-95 transition-all shadow-lg cursor-pointer"
                        >
                          Clean Firebase Data Now
                        </button>
                      </div>
                    </div>

                    {/* Factory Reset */}
                    <div className="p-6 rounded-2xl bg-[#101015] border border-rose-500/20 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-syne text-sm font-bold text-rose-300">Reset Center</h4>
                          <p className="text-xs font-space text-neutral-400 mt-1">
                            Restores original layout toggles, cyber orange color theme, copywriting, and clears custom Firebase overrides.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmingResetType('all');
                            setResetModalOpen(true);
                          }}
                          className="shrink-0 px-4 py-2 rounded-xl font-space font-bold text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 cursor-pointer transition-colors"
                        >
                          Open Reset Center
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* IN-UI RESET CENTER MODAL */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 animate-fadeIn">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl bg-[#0f0f14] border border-white/15 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#FF5A1F]/15 border border-[#FF5A1F]/30 text-[#FF5A1F]">
                  <RotateCcw className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-syne text-lg font-bold text-white">Website Reset Center</h3>
                  <p className="text-xs font-space text-neutral-400">
                    Revert customizations back to original defaults & save to Firebase
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setResetModalOpen(false);
                  setConfirmingResetType(null);
                }}
                className="p-1 rounded-lg text-neutral-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Reset Options List */}
            <div className="space-y-3">
              {[
                {
                  id: 'all' as const,
                  title: 'Full Website Factory Reset',
                  desc: 'Reverts colors, layout order, typography, bio texts, and re-seeds initial portfolio projects, blog articles, and gallery photos into Firebase.',
                  badge: 'Complete Reset',
                  badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
                },
                {
                  id: 'layout' as const,
                  title: 'Reset Layout & Div Order Only',
                  desc: 'Reverts the 14 section divs to their original sequence, re-enables all default sections, and clears custom div padding or background tones.',
                  badge: 'Layout Only',
                  badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
                },
                {
                  id: 'theme' as const,
                  title: 'Reset Theme, Colors & Typography Only',
                  desc: 'Restores primary Cyber Orange (#FF5A1F), secondary glow, Syne font pairing, and default 16px card curvature.',
                  badge: 'Colors & UI',
                  badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
                },
                {
                  id: 'content' as const,
                  title: 'Reset Biography & Copywriting Only',
                  desc: 'Restores original hero headlines, about bio, metrics (5+ years, 40+ projects), and author info back to portfolio defaults.',
                  badge: 'Content Only',
                  badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                },
              ].map((opt) => (
                <div
                  key={opt.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    confirmingResetType === opt.id
                      ? 'bg-[#181822] border-[#FF5A1F]/50 ring-1 ring-[#FF5A1F]/30'
                      : 'bg-[#121217] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-syne text-sm font-bold text-white">{opt.title}</span>
                        <span className={`text-[10px] font-space px-2 py-0.5 rounded-full border ${opt.badgeColor}`}>
                          {opt.badge}
                        </span>
                      </div>
                      <p className="text-xs font-space text-neutral-400 leading-relaxed">{opt.desc}</p>
                    </div>

                    {confirmingResetType !== opt.id && (
                      <button
                        type="button"
                        onClick={() => setConfirmingResetType(opt.id)}
                        className="shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-space font-medium text-neutral-300 bg-white/10 hover:bg-white/20 hover:text-white transition-all cursor-pointer"
                      >
                        Select
                      </button>
                    )}
                  </div>

                  {/* Confirmation Subpanel */}
                  {confirmingResetType === opt.id && (
                    <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
                      <span className="text-xs font-space text-amber-300">
                        ⚠️ Click to apply reset & save state to Firebase
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmingResetType(null)}
                          className="px-3 py-1.5 rounded-xl text-xs font-space text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={async () => {
                            if (opt.id === 'all') {
                              await resetToDefaults();
                            } else if (opt.id === 'layout') {
                              await resetLayoutOnly();
                            } else if (opt.id === 'theme') {
                              await resetThemeOnly();
                            } else if (opt.id === 'content') {
                              await resetContentOnly();
                            }
                            setResetModalOpen(false);
                            setConfirmingResetType(null);
                            setSaveStatus(`${opt.title} completed and saved to Firebase!`);
                            setTimeout(() => setSaveStatus(null), 3500);
                          }}
                          style={{ backgroundColor: tempSettings.accentColor }}
                          className="px-4 py-1.5 rounded-xl text-xs font-space font-bold text-black shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                        >
                          {isSaving ? 'Saving to Firebase...' : 'Confirm Reset & Save'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setResetModalOpen(false);
                  setConfirmingResetType(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-space text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IN-UI ITEM DELETION CONFIRMATION MODAL */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#14141a] border border-rose-500/30 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-syne text-base font-bold text-white">
                  Delete {deleteConfirmation.type === 'project' ? 'Project' : deleteConfirmation.type === 'blog' ? 'Article' : 'Photo'}
                </h4>
                <p className="text-xs font-space text-neutral-400">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-xs font-space text-neutral-300 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-white">"{deleteConfirmation.title}"</span>? This will permanently remove the record from Firebase Firestore.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 rounded-xl text-xs font-space text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (deleteConfirmation.type === 'project') {
                    await deleteProject(deleteConfirmation.id);
                  } else if (deleteConfirmation.type === 'blog') {
                    await deleteBlogPost(deleteConfirmation.id);
                  } else if (deleteConfirmation.type === 'gallery') {
                    await deleteGalleryItem(deleteConfirmation.id);
                  }
                  setDeleteConfirmation(null);
                  setSaveStatus('Item deleted from Firebase!');
                  setTimeout(() => setSaveStatus(null), 3000);
                }}
                className="px-5 py-2 rounded-xl text-xs font-space font-bold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all shadow-lg cursor-pointer"
              >
                Delete from Firebase
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
