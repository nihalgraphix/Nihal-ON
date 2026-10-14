import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  ZoomIn, 
  ZoomOut, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff, 
  Sliders, 
  Save, 
  RotateCcw, 
  Layers, 
  Check, 
  Sparkles, 
  Maximize2, 
  Compass, 
  Palette, 
  Settings2,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  GripVertical
} from 'lucide-react';
import { useCustomization, DEFAULT_SECTIONS_ORDER } from '../context/CustomizationContext';
import { SectionId, SectionStyleConfig, SiteSettings } from '../types';
import { getSectionEffectiveContent } from '../lib/sectionDefaults';

import Hero from './Hero';
import Marquee from './Marquee';
import About from './About';
import Projects from './Projects';
import Services from './Services';
import Process from './Process';
import Skills from './Skills';
import Experience from './Experience';
import Testimonials from './Testimonials';
import Blog from './Blog';
import Gallery from './Gallery';
import Stats from './Stats';
import FAQ from './FAQ';
import Contact from './Contact';
import Footer from './Footer';

// Section presentation definitions
interface SectionMeta {
  id: SectionId;
  name: string;
  category: 'Hero & Intro' | 'Story & Experience' | 'Works & Showcase' | 'Trust & Conversion';
  description: string;
}

const SECTION_METAS: Record<SectionId, SectionMeta> = {
  hero: { id: 'hero', name: 'Hero Header', category: 'Hero & Intro', description: 'Main tagline, 3D title, availability status and primary CTAs' },
  marquee: { id: 'marquee', name: 'Live Tech Marquee', category: 'Hero & Intro', description: 'Infinite scrolling technology ticker & stack badges' },
  about: { id: 'about', name: 'About / Self-Summary', category: 'Story & Experience', description: 'Bio, philosophy tabs, metrics, portrait photo and story' },
  projects: { id: 'projects', name: 'Projects Showcase', category: 'Works & Showcase', description: 'Interactive project gallery, case studies, and live tags' },
  services: { id: 'services', name: 'Services & Capabilities', category: 'Works & Showcase', description: 'Core offerings, design engineering & spatial architecture' },
  process: { id: 'process', name: 'Creation Process', category: 'Story & Experience', description: '4-phase product execution workflow and methodology' },
  skills: { id: 'skills', name: 'Technical Skills Matrix', category: 'Story & Experience', description: 'Categorized technical proficiencies, tools, and stack pills' },
  experience: { id: 'experience', name: 'Career Experience', category: 'Story & Experience', description: 'Interactive career timeline and roles at top organizations' },
  testimonials: { id: 'testimonials', name: 'Client Endorsements', category: 'Trust & Conversion', description: 'Social proof, client reviews, ratings, and avatars' },
  blog: { id: 'blog', name: 'Editorial Journal', category: 'Works & Showcase', description: 'Smooth sliding blog carousel, articles, and reading modals' },
  gallery: { id: 'gallery', name: 'Visual Media Gallery', category: 'Works & Showcase', description: 'Masonry photo gallery with like counters and lightboxes' },
  stats: { id: 'stats', name: 'Key Metrics & Numbers', category: 'Trust & Conversion', description: 'Impact metrics, awards count, and hours of craft' },
  faq: { id: 'faq', name: 'Frequently Asked Questions', category: 'Trust & Conversion', description: 'Interactive accordion addressing client questions' },
  contact: { id: 'contact', name: 'Contact & Inquiry', category: 'Trust & Conversion', description: 'Direct contact form, live email links, and booking CTA' },
};

export default function LiveLayoutPreview({ onSwitchToTabs }: { onSwitchToTabs?: () => void }) {
  const {
    settings,
    updateSettings,
    moveSectionOrder,
    reorderSections,
    updateSectionStyle,
    activePreviewSection,
    setActivePreviewSection,
    previewDevice,
    setPreviewDevice,
    previewZoom,
    setPreviewZoom,
    isSaving,
    resetLayoutOnly,
    isVisualEditMode,
    setIsVisualEditMode,
    activePhotoshopTool,
    setActivePhotoshopTool,
  } = useCustomization();

  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<SectionId>(activePreviewSection || 'hero');
  const [showInspectorDrawer, setShowInspectorDrawer] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<'tree' | 'style'>('tree');
  const [openTextEditSecId, setOpenTextEditSecId] = useState<SectionId | null>(null);
  const previewScrollContainerRef = useRef<HTMLDivElement>(null);

  const sectionsOrder = (settings.sectionsOrder && settings.sectionsOrder.length > 0)
    ? settings.sectionsOrder
    : DEFAULT_SECTIONS_ORDER;

  // Currently inspected section style config
  const currentSectionStyle: SectionStyleConfig = settings.sectionStyles?.[selectedSectionId] || {
    paddingY: 'normal',
    bgStyle: 'default',
    borderTopGlow: false,
    borderBottomGlow: false,
    containerWidth: 'standard',
  };

  const handleSelectSection = (secId: SectionId) => {
    setSelectedSectionId(secId);
    setActivePreviewSection(secId);
    setOpenTextEditSecId(secId);
    setSidebarTab('style');

    // Scroll preview to target section
    const el = document.getElementById(`preview-sec-${secId}`);
    if (el && previewScrollContainerRef.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSaveToFirebase = async () => {
    try {
      await updateSettings({
        sectionsOrder,
        sectionStyles: settings.sectionStyles,
        sectionsVisibility: settings.sectionsVisibility,
      });
      setSaveStatus('Live layout and div styles saved to Firebase!');
      setTimeout(() => setSaveStatus(null), 3500);
    } catch (err: any) {
      setSaveStatus(`Failed to save: ${err.message}`);
      setTimeout(() => setSaveStatus(null), 4000);
    }
  };

  const handleResetLayout = () => {
    setShowResetModal(true);
  };

  // Device width calculation
  const getDeviceWidthClass = () => {
    switch (previewDevice) {
      case 'mobile':
        return 'w-[390px] h-[820px] rounded-[48px] border-[10px] border-[#1e1e24] shadow-[0_0_80px_rgba(0,0,0,0.9)]';
      case 'tablet':
        return 'w-[768px] h-[860px] rounded-[36px] border-[8px] border-[#1e1e24] shadow-[0_0_80px_rgba(0,0,0,0.9)]';
      case 'desktop':
      default:
        return 'w-full h-full rounded-2xl border border-white/10';
    }
  };

  return (
    <div data-lenis-prevent="true" className="flex flex-col h-full bg-[#08080b] text-neutral-200 overflow-hidden">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-[#0c0c11] shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-space font-medium text-neutral-300">
            <Layers className="h-3.5 w-3.5" style={{ color: settings.accentColor }} />
            <span>Interactive Visual Layout Builder</span>
          </div>

          <button
            onClick={() => setIsVisualEditMode(!isVisualEditMode)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-space font-bold text-xs transition-all cursor-pointer ${
              isVisualEditMode
                ? 'bg-[#31A8FF] text-black shadow-[0_0_18px_rgba(49,168,255,0.6)] animate-pulse'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
            }`}
            title="Toggle Visual Edit Pro Mode on Preview Canvas"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Visual Edit Pro {isVisualEditMode ? 'ACTIVE' : 'OFF'}</span>
          </button>

          {/* Quick status notice */}
          {saveStatus && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-space animate-fadeIn">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{saveStatus}</span>
            </div>
          )}
        </div>

        {/* Viewport & Device Toggles */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Device Toggles */}
          <div className="flex items-center p-1 rounded-xl bg-black/60 border border-white/10">
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`p-1.5 sm:px-3 sm:py-1 rounded-lg text-xs font-space font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                previewDevice === 'desktop' ? 'bg-white/20 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
              title="Desktop Viewport (100%)"
            >
              <Monitor className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Desktop</span>
            </button>
            <button
              onClick={() => setPreviewDevice('tablet')}
              className={`p-1.5 sm:px-3 sm:py-1 rounded-lg text-xs font-space font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                previewDevice === 'tablet' ? 'bg-white/20 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
              title="Tablet Viewport (768px)"
            >
              <Tablet className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Tablet</span>
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`p-1.5 sm:px-3 sm:py-1 rounded-lg text-xs font-space font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                previewDevice === 'mobile' ? 'bg-white/20 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
              title="Mobile Viewport (390px)"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Mobile</span>
            </button>
          </div>

          {/* Zoom controls */}
          <div className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-neutral-400">
            <button
              onClick={() => setPreviewZoom(Math.max(70, previewZoom - 10))}
              className="p-1 hover:text-white cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="w-10 text-center">{previewZoom}%</span>
            <button
              onClick={() => setPreviewZoom(Math.min(100, previewZoom + 10))}
              className="p-1 hover:text-white cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Reset button */}
          <button
            onClick={handleResetLayout}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-space text-neutral-300 transition-all cursor-pointer"
            title="Reset to default section order"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Order</span>
          </button>

          {/* Save button */}
          <button
            onClick={handleSaveToFirebase}
            disabled={isSaving}
            style={{ backgroundColor: settings.accentColor }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl font-space font-bold text-xs text-black shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                <span>Saving to Firebase...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="h-3.5 w-3.5" />
                <span>Save to Firebase</span>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Workspace: Split Inspector / Live Preview */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Side: Layout Tree & Div Inspector Panel */}
        <div className={`w-80 lg:w-96 border-r border-white/10 bg-[#0a0a0e] flex flex-col shrink-0 z-20 transition-all duration-300 ${
          showInspectorDrawer ? 'translate-x-0' : '-translate-x-full absolute h-full'
        }`}>
          {/* Panel Header Tabs */}
          <div className="flex border-b border-white/10 bg-[#0d0d12]">
            <button
              onClick={() => setSidebarTab('tree')}
              className={`flex-1 py-3 px-4 text-xs font-space font-semibold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                sidebarTab === 'tree'
                  ? 'border-[#FF5A1F] text-white bg-white/5'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
              style={{ borderColor: sidebarTab === 'tree' ? settings.accentColor : 'transparent' }}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Section Hierarchy ({sectionsOrder.length})</span>
            </button>
            <button
              onClick={() => setSidebarTab('style')}
              className={`flex-1 py-3 px-4 text-xs font-space font-semibold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                sidebarTab === 'style'
                  ? 'border-[#FF5A1F] text-white bg-white/5'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
              style={{ borderColor: sidebarTab === 'style' ? settings.accentColor : 'transparent' }}
            >
              <Settings2 className="h-3.5 w-3.5" />
              <span>Div Style Adjuster</span>
            </button>
          </div>

          {/* TAB 1: SECTION TREE (Reorder & Visibility) */}
          {sidebarTab === 'tree' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-[11px] font-space font-bold uppercase tracking-wider text-neutral-400">
                  Drag / Move Section Divs
                </span>
                <span className="text-[10px] font-mono text-neutral-500">
                  Click to inspect & style
                </span>
              </div>

              {sectionsOrder.map((secId, index) => {
                const meta = SECTION_METAS[secId] || { id: secId, name: secId, category: 'Other', description: '' };
                const isVisible = settings.sectionsVisibility[secId];
                const isSelected = selectedSectionId === secId;

                return (
                  <div
                    key={secId}
                    onClick={() => handleSelectSection(secId)}
                    className={`group relative flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#15151e] border-white/30 shadow-lg ring-1 ring-white/10'
                        : 'bg-[#0f0f14] border-white/5 hover:border-white/20 hover:bg-[#121218]'
                    }`}
                    style={{ borderColor: isSelected ? settings.accentColor : undefined }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Order Index Badge */}
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-black/60 border border-white/10 text-[10px] font-mono font-bold text-neutral-400 group-hover:text-white">
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-space font-bold truncate ${isVisible ? 'text-white' : 'text-neutral-500 line-through'}`}>
                            {meta.name}
                          </span>
                          {!isVisible && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300">
                              Hidden
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-space text-neutral-500 block truncate">
                          {meta.category}
                        </span>
                      </div>
                    </div>

                    {/* Quick Move & Visibility Actions */}
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {/* Move Up */}
                      <button
                        onClick={() => moveSectionOrder(secId, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
                        title="Move Section Up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>

                      {/* Move Down */}
                      <button
                        onClick={() => moveSectionOrder(secId, 'down')}
                        disabled={index === sectionsOrder.length - 1}
                        className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
                        title="Move Section Down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>

                      {/* Visibility Toggle */}
                      <button
                        onClick={() => {
                          updateSettings({
                            sectionsVisibility: {
                              ...settings.sectionsVisibility,
                              [secId]: !isVisible,
                            },
                          });
                        }}
                        className={`p-1 rounded-md transition-colors cursor-pointer ${
                          isVisible ? 'text-neutral-400 hover:text-white hover:bg-white/10' : 'text-rose-400 hover:bg-rose-500/10'
                        }`}
                        title={isVisible ? 'Hide Section' : 'Show Section'}
                      >
                        {isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: DIV STYLE & SPACING INSPECTOR */}
          {sidebarTab === 'style' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Selected Section Header */}
              <div className="p-4 rounded-2xl bg-[#121218] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                    Inspecting Div Container
                  </span>
                  <span 
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold"
                    style={{ backgroundColor: `${settings.accentColor}20`, color: settings.accentColor }}
                  >
                    #{sectionsOrder.indexOf(selectedSectionId) + 1} of {sectionsOrder.length}
                  </span>
                </div>
                <h4 className="font-syne text-base font-bold text-white">
                  {SECTION_METAS[selectedSectionId]?.name || selectedSectionId}
                </h4>
                <p className="text-[11px] font-space text-neutral-400">
                  {SECTION_METAS[selectedSectionId]?.description}
                </p>

                {/* Move Controls inside Inspector */}
                <div className="pt-2 flex items-center gap-2 border-t border-white/10">
                  <button
                    onClick={() => moveSectionOrder(selectedSectionId, 'up')}
                    disabled={sectionsOrder.indexOf(selectedSectionId) === 0}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-25 text-xs font-space font-medium text-neutral-200 transition-all cursor-pointer"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                    <span>Move Up</span>
                  </button>
                  <button
                    onClick={() => moveSectionOrder(selectedSectionId, 'down')}
                    disabled={sectionsOrder.indexOf(selectedSectionId) === sectionsOrder.length - 1}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-25 text-xs font-space font-medium text-neutral-200 transition-all cursor-pointer"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                    <span>Move Down</span>
                  </button>
                </div>
              </div>

              {/* Div Alignment */}
              <div className="space-y-3">
                <label className="text-xs font-space font-bold uppercase tracking-wider text-neutral-300 block">
                  Header & Content Alignment
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'left', label: 'Left', icon: '⫷' },
                    { id: 'center', label: 'Center', icon: '≡' },
                    { id: 'right', label: 'Right', icon: '⫸' },
                  ].map((a) => {
                    const isSelected = (currentSectionStyle.alignment || 'left') === a.id;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => updateSectionStyle(selectedSectionId, { alignment: a.id as any })}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#181824] border-white/40 shadow-md ring-1 ring-white/10'
                            : 'bg-black/40 border-white/10 hover:border-white/20'
                        }`}
                        style={{ borderColor: isSelected ? settings.accentColor : undefined }}
                      >
                        <div className="text-sm mb-1">{a.icon}</div>
                        <div className="text-[11px] font-space font-bold text-white">{a.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Container Width / Div Sizing */}
              <div className="space-y-3">
                <label className="text-xs font-space font-bold uppercase tracking-wider text-neutral-300 block">
                  Div Sizing & Container Width
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'compact', label: 'Compact Box', desc: 'max-w-4xl' },
                    { id: 'standard', label: 'Standard', desc: 'max-w-7xl' },
                    { id: 'wide', label: 'Wide Cinema', desc: 'max-w-[1600px]' },
                    { id: 'full', label: 'Full Width', desc: '100% Bleed' },
                  ].map((w) => {
                    const isSelected = (currentSectionStyle.containerWidth || 'standard') === w.id;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => updateSectionStyle(selectedSectionId, { containerWidth: w.id as any })}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#181824] border-white/40 shadow-md ring-1 ring-white/10'
                            : 'bg-black/40 border-white/10 hover:border-white/20'
                        }`}
                        style={{ borderColor: isSelected ? settings.accentColor : undefined }}
                      >
                        <div className="text-xs font-space font-bold text-white">{w.label}</div>
                        <div className="text-[10px] font-mono text-neutral-400">{w.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section Custom Text Editing */}
              <div className="space-y-3 p-4 rounded-2xl bg-[#121218] border border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-space font-bold uppercase tracking-wider text-neutral-300">
                    Section Text & Headings
                  </label>
                  <span className="text-[10px] font-mono text-[#FF5A1F]">Live Editing</span>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <span className="text-[11px] font-space text-neutral-400 block mb-1">Badge Text</span>
                    <input
                      type="text"
                      placeholder="e.g. Core Capabilities"
                      value={currentSectionStyle.badgeText || ''}
                      onChange={(e) => updateSectionStyle(selectedSectionId, { badgeText: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-white"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-space text-neutral-400 block mb-1">Heading / Title</span>
                    <input
                      type="text"
                      placeholder="e.g. Services & Capabilities"
                      value={currentSectionStyle.customTitle || ''}
                      onChange={(e) => updateSectionStyle(selectedSectionId, { customTitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-white"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-space text-neutral-400 block mb-1">Subtitle</span>
                    <input
                      type="text"
                      placeholder="e.g. What I Deliver"
                      value={currentSectionStyle.customSubtitle || ''}
                      onChange={(e) => updateSectionStyle(selectedSectionId, { customSubtitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-white"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-space text-neutral-400 block mb-1">Description</span>
                    <textarea
                      rows={2}
                      placeholder="Custom section paragraph description..."
                      value={currentSectionStyle.customDescription || ''}
                      onChange={(e) => updateSectionStyle(selectedSectionId, { customDescription: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-white resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Div Vertical Spacing / Padding */}
              <div className="space-y-3">
                <label className="text-xs font-space font-bold uppercase tracking-wider text-neutral-300 block">
                  Vertical Spacing (Padding)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'compact', label: 'Compact', sub: 'py-8' },
                    { id: 'normal', label: 'Normal', sub: 'Default' },
                    { id: 'spacious', label: 'Spacious', sub: 'py-24' },
                    { id: 'extra-spacious', label: 'Grand', sub: 'py-36' },
                  ].map((p) => {
                    const isSelected = currentSectionStyle.paddingY === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => updateSectionStyle(selectedSectionId, { paddingY: p.id as any })}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#181824] border-white/40 shadow-md ring-1 ring-white/10'
                            : 'bg-black/40 border-white/10 hover:border-white/20'
                        }`}
                        style={{ borderColor: isSelected ? settings.accentColor : undefined }}
                      >
                        <div className="text-xs font-space font-bold text-white">{p.label}</div>
                        <div className="text-[10px] font-mono text-neutral-400">{p.sub}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Div Background Tone */}
              <div className="space-y-3">
                <label className="text-xs font-space font-bold uppercase tracking-wider text-neutral-300 block">
                  Background Tone
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'default', label: 'Default', desc: 'Theme default' },
                    { id: 'pitch-black', label: 'Pitch Black', desc: 'OLED #020203' },
                    { id: 'charcoal', label: 'Charcoal', desc: 'Slate #0d0d12' },
                    { id: 'gradient-glow', label: 'Brand Gradient', desc: 'Soft Ambient' },
                  ].map((bg) => {
                    const isSelected = currentSectionStyle.bgStyle === bg.id;
                    return (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => updateSectionStyle(selectedSectionId, { bgStyle: bg.id as any })}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#181824] border-white/40 shadow-md ring-1 ring-white/10'
                            : 'bg-black/40 border-white/10 hover:border-white/20'
                        }`}
                        style={{ borderColor: isSelected ? settings.accentColor : undefined }}
                      >
                        <div className="text-xs font-space font-bold text-white">{bg.label}</div>
                        <div className="text-[10px] font-mono text-neutral-400">{bg.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Glowing Dividers */}
              <div className="space-y-3">
                <label className="text-xs font-space font-bold uppercase tracking-wider text-neutral-300 block">
                  Glowing Divider Borders
                </label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-xs font-space text-neutral-200">Top Border Glow</span>
                    <button
                      type="button"
                      onClick={() => updateSectionStyle(selectedSectionId, { borderTopGlow: !currentSectionStyle.borderTopGlow })}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                        currentSectionStyle.borderTopGlow ? 'bg-[#FF5A1F]' : 'bg-neutral-800'
                      }`}
                      style={{ backgroundColor: currentSectionStyle.borderTopGlow ? settings.accentColor : undefined }}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                        currentSectionStyle.borderTopGlow ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-xs font-space text-neutral-200">Bottom Border Glow</span>
                    <button
                      type="button"
                      onClick={() => updateSectionStyle(selectedSectionId, { borderBottomGlow: !currentSectionStyle.borderBottomGlow })}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                        currentSectionStyle.borderBottomGlow ? 'bg-[#FF5A1F]' : 'bg-neutral-800'
                      }`}
                      style={{ backgroundColor: currentSectionStyle.borderBottomGlow ? settings.accentColor : undefined }}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                        currentSectionStyle.borderBottomGlow ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Jump to Full Text / Content Tab */}
              {onSwitchToTabs && (
                <div className="pt-2">
                  <button
                    onClick={onSwitchToTabs}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-space text-white transition-all cursor-pointer"
                  >
                    <span>Edit Detailed Content in Tabs</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Interactive Live Web Preview Frame */}
        <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 bg-[#040406] overflow-hidden relative">
          {/* Viewport Frame with zoom scaling */}
          <div 
            className={`transition-all duration-300 overflow-hidden flex flex-col bg-[#060606] relative ${getDeviceWidthClass()}`}
            style={{
              transform: previewZoom !== 100 ? `scale(${previewZoom / 100})` : undefined,
              transformOrigin: 'top center',
            }}
          >
            {/* Mobile / Tablet notch mockup if mobile */}
            {previewDevice === 'mobile' && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-6 bg-[#1e1e24] rounded-b-2xl z-40 flex items-center justify-center">
                <span className="h-2.5 w-2.5 rounded-full bg-black/60 mr-2" />
                <span className="h-2 w-10 rounded-full bg-black/60" />
              </div>
            )}

            {/* Live Web Page Stream */}
            <div 
              ref={previewScrollContainerRef}
              data-lenis-prevent="true"
              className="flex-1 overflow-y-auto w-full h-full relative scroll-smooth"
            >
              {/* Web Header Representation */}
              <div className="sticky top-0 z-30 px-4 py-3 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow" style={{ backgroundColor: settings.accentColor }}>
                    N
                  </span>
                  <span className="text-xs font-syne font-bold text-white">{settings.navBrandText || 'Nihal . ON'}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>EXACT PORTFOLIO LIVE PREVIEW</span>
                </div>
              </div>

              {/* Floating Photoshop Tool Dock in Preview Canvas */}
              {isVisualEditMode && (
                <div className="sticky top-12 z-40 mx-4 my-2 p-2 rounded-2xl bg-[#0e121e]/95 backdrop-blur-xl border border-[#31A8FF]/60 shadow-[0_10px_30px_rgba(0,0,0,0.8)] animate-fadeIn">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-white/10">
                      <span className="text-[10px] font-mono font-bold text-[#31A8FF] px-2">Ps Tools:</span>
                      <button
                        type="button"
                        onClick={() => setActivePhotoshopTool('select')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-space font-medium transition-all cursor-pointer ${
                          activePhotoshopTool === 'select' ? 'bg-[#31A8FF] text-black font-bold' : 'text-neutral-300 hover:text-white'
                        }`}
                      >
                        ✦ Select & Reorder
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePhotoshopTool('type')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-space font-medium transition-all cursor-pointer ${
                          activePhotoshopTool === 'type' ? 'bg-[#31A8FF] text-black font-bold' : 'text-neutral-300 hover:text-white'
                        }`}
                      >
                        ✎ Type & Text
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePhotoshopTool('size')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-space font-medium transition-all cursor-pointer ${
                          activePhotoshopTool === 'size' ? 'bg-[#31A8FF] text-black font-bold' : 'text-neutral-300 hover:text-white'
                        }`}
                      >
                        ⤢ Width & Scale
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePhotoshopTool('color')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-space font-medium transition-all cursor-pointer ${
                          activePhotoshopTool === 'color' ? 'bg-[#31A8FF] text-black font-bold' : 'text-neutral-300 hover:text-white'
                        }`}
                      >
                        🎨 Accent Palette
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-neutral-400">
                        Click any section div below to edit text & transform live
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Render Ordered Sections inside the Interactive Web Preview */}
              <div className="space-y-4 p-3 md:p-6">
                {sectionsOrder.map((secId, index) => {
                  const meta = SECTION_METAS[secId] || { id: secId, name: secId, category: 'Other', description: '' };
                  const isVisible = settings.sectionsVisibility[secId];
                  const isSelected = selectedSectionId === secId;
                  const styleConfig = settings.sectionStyles?.[secId] || {
                    paddingY: 'normal',
                    bgStyle: 'default',
                    borderTopGlow: false,
                    borderBottomGlow: false,
                    containerWidth: 'standard',
                  };

                  let paddingClass = 'py-6 px-5';
                  if (styleConfig.paddingY === 'compact') paddingClass = 'py-3 px-4';
                  else if (styleConfig.paddingY === 'spacious') paddingClass = 'py-12 px-6';
                  else if (styleConfig.paddingY === 'extra-spacious') paddingClass = 'py-16 px-8';

                  let bgClass = 'bg-[#0f0f15]';
                  if (styleConfig.bgStyle === 'pitch-black') bgClass = 'bg-[#020203]';
                  else if (styleConfig.bgStyle === 'charcoal') bgClass = 'bg-[#121218]';
                  else if (styleConfig.bgStyle === 'gradient-glow') bgClass = 'bg-gradient-to-r from-[#12101b] via-[#1a1226] to-[#100f17]';

                  return (
                    <div
                      key={secId}
                      id={`preview-sec-${secId}`}
                      onClick={() => handleSelectSection(secId)}
                      className={`relative rounded-2xl transition-all duration-200 border cursor-pointer ${paddingClass} ${bgClass} ${
                        styleConfig.borderTopGlow ? 'border-t-2 border-t-[#FF5A1F] shadow-[0_-8px_20px_-6px_rgba(255,90,31,0.4)]' : ''
                      } ${
                        styleConfig.borderBottomGlow ? 'border-b-2 border-b-[#FF5A1F] shadow-[0_8px_20px_-6px_rgba(255,90,31,0.4)]' : ''
                      } ${
                        isSelected
                          ? 'border-2 border-[#FF5A1F] ring-4 ring-[#FF5A1F]/20 shadow-[0_0_30px_rgba(255,90,31,0.3)]'
                          : 'border-white/10 hover:border-white/30'
                      } ${!isVisible ? 'opacity-40 grayscale' : ''}`}
                    >
                      {/* Section Floating Toolbar Banner */}
                      {isSelected && (
                        <>
                          {/* Photoshop Selection Corner Anchor Handles */}
                          <span className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#31A8FF] rounded-[2px] shadow z-20" />
                          <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#31A8FF] rounded-[2px] shadow z-20" />
                          <span className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#31A8FF] rounded-[2px] shadow z-20" />
                          <span className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#31A8FF] rounded-[2px] shadow z-20" />
                        </>
                      )}

                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <span 
                            className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold"
                            style={{ backgroundColor: `${settings.accentColor}25`, color: settings.accentColor }}
                          >
                            DIV #{index + 1}
                          </span>
                          <span className="font-syne font-bold text-xs text-white">
                            {meta.name}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-mono text-[#31A8FF] bg-[#001E36] px-1.5 py-0.5 rounded border border-[#31A8FF]/40">
                              Ps Transform Active
                            </span>
                          )}
                          {!isVisible && (
                            <span className="text-[10px] font-space text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                              Hidden
                            </span>
                          )}
                        </div>

                        {/* Quick In-Preview Reorder, Alignment & Sizing Buttons */}
                        <div className="flex flex-wrap items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {/* Font Size Scale Toggles */}
                          <div className="flex items-center rounded-lg bg-black/60 border border-white/10 p-0.5" title="Font Scale">
                            {(['compact', 'normal', 'large', 'huge'] as const).map((fs) => (
                              <button
                                key={fs}
                                type="button"
                                onClick={() => updateSectionStyle(secId, { fontSizeScale: fs })}
                                className={`px-1.5 py-0.5 rounded text-[9px] font-mono transition-colors cursor-pointer ${
                                  (styleConfig.fontSizeScale || 'normal') === fs
                                    ? 'bg-[#31A8FF] text-black font-bold'
                                    : 'text-neutral-400 hover:text-white'
                                }`}
                                title={`Font Scale: ${fs}`}
                              >
                                {fs === 'compact' ? 'A-' : fs === 'normal' ? 'A' : fs === 'large' ? 'A+' : 'A++'}
                              </button>
                            ))}
                          </div>
                          {/* Sizing Toggles */}
                          <div className="flex items-center rounded-lg bg-black/60 border border-white/10 p-0.5" title="Container Div Sizing">
                            {(['compact', 'standard', 'wide', 'full'] as const).map((w) => (
                              <button
                                key={w}
                                type="button"
                                onClick={() => updateSectionStyle(secId, { containerWidth: w })}
                                className={`px-1.5 py-0.5 rounded text-[9px] font-mono capitalize transition-colors cursor-pointer ${
                                  (styleConfig.containerWidth || 'standard') === w
                                    ? 'bg-[#FF5A1F] text-black font-bold'
                                    : 'text-neutral-400 hover:text-white'
                                }`}
                                title={`Container Width: ${w}`}
                              >
                                {w === 'compact' ? 'Sm' : w === 'standard' ? 'Md' : w === 'wide' ? 'Lg' : 'Xl'}
                              </button>
                            ))}
                          </div>

                          {/* Alignment Toggles */}
                          <div className="flex items-center rounded-lg bg-black/60 border border-white/10 p-0.5" title="Alignment">
                            {(['left', 'center', 'right'] as const).map((a) => (
                              <button
                                key={a}
                                type="button"
                                onClick={() => updateSectionStyle(secId, { alignment: a })}
                                className={`px-1.5 py-0.5 rounded text-[9px] font-mono transition-colors cursor-pointer ${
                                  (styleConfig.alignment || 'left') === a
                                    ? 'bg-white/20 text-white font-bold'
                                    : 'text-neutral-400 hover:text-white'
                                }`}
                                title={`Align: ${a}`}
                              >
                                {a === 'left' ? '⫷' : a === 'center' ? '≡' : '⫸'}
                              </button>
                            ))}
                          </div>

                          {/* Reorder Buttons */}
                          <div className="flex items-center rounded-lg bg-black/60 border border-white/10 p-0.5">
                            <button
                              onClick={() => moveSectionOrder(secId, 'up')}
                              disabled={index === 0}
                              className="p-1 rounded text-neutral-300 hover:text-white disabled:opacity-20 cursor-pointer"
                              title="Move Div Up"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => moveSectionOrder(secId, 'down')}
                              disabled={index === sectionsOrder.length - 1}
                              className="p-1 rounded text-neutral-300 hover:text-white disabled:opacity-20 cursor-pointer"
                              title="Move Div Down"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                          </div>

                          {/* Visibility Toggle */}
                          <button
                            type="button"
                            onClick={() => {
                              updateSettings({
                                sectionsVisibility: {
                                  ...settings.sectionsVisibility,
                                  [secId]: !isVisible,
                                },
                              });
                            }}
                            className={`p-1 rounded-lg border transition-colors cursor-pointer ${
                              isVisible ? 'border-white/10 text-neutral-400 hover:text-white' : 'border-rose-500/30 text-rose-400 bg-rose-500/10'
                            }`}
                            title={isVisible ? 'Hide Div' : 'Show Div'}
                          >
                            {isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          </button>

                          {/* Direct Text Editor Trigger Button */}
                          <button
                            type="button"
                            onClick={() => {
                              handleSelectSection(secId);
                              setOpenTextEditSecId(openTextEditSecId === secId ? null : secId);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-space font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                              (openTextEditSecId === secId || isSelected)
                                ? 'bg-[#FF5A1F] text-black shadow-[0_0_12px_rgba(255,90,31,0.5)]'
                                : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                            }`}
                            title="Edit section titles, badges, and subheadings directly in preview mover"
                          >
                            <span>✏️</span>
                            <span>{openTextEditSecId === secId ? 'Close Text Editor' : 'Edit Texts'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSelectSection(secId)}
                            className="px-2 py-0.5 rounded text-[10px] font-space font-semibold bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                          >
                            Inspect
                          </button>
                        </div>
                      </div>

                      {/* Photoshop In-Place Quick Text Editor */}
                      {(() => {
                        const secContent = getSectionEffectiveContent(secId, styleConfig);
                        if (!isSelected && !isVisualEditMode && openTextEditSecId !== secId) return null;
                        return (
                          <div 
                            className="mb-3 p-3.5 rounded-2xl bg-[#090d16]/95 border-2 border-[#31A8FF]/60 space-y-3 animate-fadeIn shadow-2xl z-20 relative" 
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-[#31A8FF] animate-ping" />
                                <span className="text-[11px] font-mono font-bold text-[#31A8FF] flex items-center gap-1.5">
                                  <Sparkles className="h-3.5 w-3.5" />
                                  <span>Preview Div Mover Text Editor — {meta.name}</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                  ● Live Portfolio Sync
                                </span>
                                {(styleConfig.badgeText || styleConfig.customTitle || styleConfig.customSubtitle || styleConfig.customDescription) && (
                                  <button
                                    type="button"
                                    onClick={() => updateSectionStyle(secId, {
                                      badgeText: undefined,
                                      customTitle: undefined,
                                      customSubtitle: undefined,
                                      customDescription: undefined,
                                    })}
                                    className="text-[9px] font-mono text-neutral-400 hover:text-white underline cursor-pointer"
                                  >
                                    Reset Texts
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                              <div>
                                <label className="text-[9px] font-mono text-neutral-300 block mb-1 uppercase font-bold flex items-center gap-1">
                                  <span className="text-[#31A8FF]">✦</span> Badge Pill
                                </label>
                                <input
                                  type="text"
                                  placeholder={secContent.badge || "Badge Text..."}
                                  value={styleConfig.badgeText !== undefined ? styleConfig.badgeText : ''}
                                  onChange={(e) => updateSectionStyle(secId, { badgeText: e.target.value })}
                                  className="w-full px-3 py-1.5 rounded-xl bg-black/90 border border-white/20 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#31A8FF] focus:ring-1 focus:ring-[#31A8FF]"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-mono text-neutral-300 block mb-1 uppercase font-bold flex items-center gap-1">
                                  <span className="text-[#FF5A1F]">✦</span> Heading Title
                                </label>
                                <input
                                  type="text"
                                  placeholder={secContent.title || "Section Title..."}
                                  value={styleConfig.customTitle !== undefined ? styleConfig.customTitle : ''}
                                  onChange={(e) => updateSectionStyle(secId, { customTitle: e.target.value })}
                                  className="w-full px-3 py-1.5 rounded-xl bg-black/90 border border-white/20 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#31A8FF] focus:ring-1 focus:ring-[#31A8FF]"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-mono text-neutral-300 block mb-1 uppercase font-bold flex items-center gap-1">
                                  <span className="text-amber-400">✦</span> Subtitle / Tagline
                                </label>
                                <input
                                  type="text"
                                  placeholder={secContent.subtitle || "Section Subtitle..."}
                                  value={styleConfig.customSubtitle !== undefined ? styleConfig.customSubtitle : ''}
                                  onChange={(e) => updateSectionStyle(secId, { customSubtitle: e.target.value })}
                                  className="w-full px-3 py-1.5 rounded-xl bg-black/90 border border-white/20 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#31A8FF] focus:ring-1 focus:ring-[#31A8FF]"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-mono text-neutral-300 block mb-1 uppercase font-bold flex items-center gap-1">
                                  <span className="text-emerald-400">✦</span> Description Text
                                </label>
                                <input
                                  type="text"
                                  placeholder={secContent.description || "Description..."}
                                  value={styleConfig.customDescription !== undefined ? styleConfig.customDescription : ''}
                                  onChange={(e) => updateSectionStyle(secId, { customDescription: e.target.value })}
                                  className="w-full px-3 py-1.5 rounded-xl bg-black/90 border border-white/20 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#31A8FF] focus:ring-1 focus:ring-[#31A8FF]"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Visual Content Representation of each section with sizing & alignment applied */}
                      {(() => {
                        const content = getSectionEffectiveContent(secId, styleConfig);
                        let sectionComponent = null;
                        switch (secId) {
                          case 'hero':
                            sectionComponent = (
                              <Hero
                                onSelectProject={() => {}}
                                onOpenResumeModal={() => {}}
                              />
                            );
                            break;
                          case 'marquee':
                            sectionComponent = <Marquee />;
                            break;
                          case 'about':
                            sectionComponent = <About onOpenResumeModal={() => {}} />;
                            break;
                          case 'projects':
                            sectionComponent = <Projects onSelectProject={() => {}} />;
                            break;
                          case 'services':
                            sectionComponent = <Services />;
                            break;
                          case 'process':
                            sectionComponent = <Process />;
                            break;
                          case 'skills':
                            sectionComponent = <Skills />;
                            break;
                          case 'experience':
                            sectionComponent = <Experience />;
                            break;
                          case 'testimonials':
                            sectionComponent = <Testimonials />;
                            break;
                          case 'blog':
                            sectionComponent = <Blog />;
                            break;
                          case 'gallery':
                            sectionComponent = <Gallery onOpenGalleryPage={() => {}} />;
                            break;
                          case 'stats':
                            sectionComponent = <Stats />;
                            break;
                          case 'faq':
                            sectionComponent = <FAQ />;
                            break;
                          case 'contact':
                            sectionComponent = <Contact />;
                            break;
                          default:
                            sectionComponent = null;
                        }

                        let containerWidthClass = 'w-full';
                        if (styleConfig.containerWidth === 'compact') containerWidthClass = 'max-w-4xl mx-auto px-4 [&_.max-w-7xl]:!max-w-4xl [&_.max-w-5xl]:!max-w-4xl';
                        else if (styleConfig.containerWidth === 'standard') containerWidthClass = 'max-w-7xl mx-auto px-4 sm:px-6';
                        else if (styleConfig.containerWidth === 'wide') containerWidthClass = 'max-w-[1550px] mx-auto px-4 sm:px-6 [&_.max-w-7xl]:!max-w-[1550px] [&_.max-w-5xl]:!max-w-[1550px]';
                        else if (styleConfig.containerWidth === 'full') containerWidthClass = 'w-full px-2 sm:px-4 [&_.max-w-7xl]:!max-w-none [&_.max-w-5xl]:!max-w-none';

                        let alignmentClass = '';
                        if (styleConfig.alignment === 'center') {
                          alignmentClass = 'text-center [&_h1]:text-center [&_h2]:text-center [&_h3]:text-center [&_h4]:text-center [&_p]:text-center [&_p]:mx-auto [&_.flex]:justify-center [&_.inline-flex]:justify-center';
                        } else if (styleConfig.alignment === 'right') {
                          alignmentClass = 'text-right [&_h1]:text-right [&_h2]:text-right [&_h3]:text-right [&_h4]:text-right [&_p]:text-right [&_p]:ml-auto [&_.flex]:justify-end [&_.inline-flex]:justify-end';
                        }

                        let fontScaleClass = '';
                        if (styleConfig.fontSizeScale === 'compact') {
                          fontScaleClass = 'text-xs [&_h1]:!text-2xl sm:[&_h1]:!text-3xl [&_h2]:!text-xl sm:[&_h2]:!text-2xl [&_h3]:!text-lg [&_p]:!text-xs';
                        } else if (styleConfig.fontSizeScale === 'large') {
                          fontScaleClass = '[&_h1]:!text-5xl sm:[&_h1]:!text-6xl [&_h2]:!text-3xl sm:[&_h2]:!text-4xl [&_h3]:!text-2xl [&_p]:!text-base';
                        } else if (styleConfig.fontSizeScale === 'huge') {
                          fontScaleClass = '[&_h1]:!text-6xl sm:[&_h1]:!text-7xl [&_h2]:!text-4xl sm:[&_h2]:!text-5xl [&_h3]:!text-3xl [&_p]:!text-lg';
                        }

                        let transformClass = '';
                        if (styleConfig.fontTransform === 'uppercase') {
                          transformClass = '[&_h1]:uppercase [&_h2]:uppercase [&_h3]:uppercase [&_h4]:uppercase';
                        } else if (styleConfig.fontTransform === 'capitalize') {
                          transformClass = '[&_h1]:capitalize [&_h2]:capitalize [&_h3]:capitalize [&_h4]:capitalize';
                        }

                        return (
                          <div className={`transition-all duration-300 w-full ${containerWidthClass} ${alignmentClass} ${fontScaleClass} ${transformClass}`}>
                            {sectionComponent}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* In-UI Confirmation Modal for Resetting Layout */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#121218] border border-white/15 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#FF5A1F]/15 border border-[#FF5A1F]/30 text-[#FF5A1F]">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-syne text-base font-bold text-white">Reset Layout & Div Order</h4>
                <p className="text-xs font-space text-neutral-400">Revert layout sequence back to initial portfolio setup</p>
              </div>
            </div>
            <p className="text-xs font-space text-neutral-300 leading-relaxed">
              This will restore the 14 section divs to their original order, activate all default sections, and clear custom spacing or background overrides. The reset will be automatically saved to Firebase.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-space text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={async () => {
                  await resetLayoutOnly();
                  setShowResetModal(false);
                  setSaveStatus('Layout successfully reset to default and saved to Firebase!');
                  setTimeout(() => setSaveStatus(null), 3500);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-space font-bold text-black bg-[#FF5A1F] hover:brightness-110 active:scale-95 transition-all shadow-lg cursor-pointer disabled:opacity-60"
              >
                {isSaving ? 'Resetting & Saving...' : 'Confirm Reset & Save to Firebase'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
