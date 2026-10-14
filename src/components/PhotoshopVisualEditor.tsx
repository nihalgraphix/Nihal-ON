import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MousePointer,
  Type,
  Maximize2,
  Palette,
  Save,
  RotateCcw,
  X,
  Check,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Layers,
  Sliders,
  CheckCircle2,
  ChevronRight,
  Minimize2,
  Grid,
  Ruler,
  Crosshair,
  Zap,
  Move,
  Monitor,
  Loader2,
  Plus,
  Image as ImageIcon,
  Edit3,
  Code
} from 'lucide-react';
import { useCustomization, DEFAULT_SECTIONS_ORDER } from '../context/CustomizationContext';
import { SectionId, SectionStyleConfig, SpacingConfig } from '../types';
import { SECTION_DEFAULTS_META, getSectionEffectiveContent } from '../lib/sectionDefaults';

interface TextEditTarget {
  secId?: SectionId;
  field: 'badgeText' | 'customTitle' | 'customSubtitle' | 'customDescription' | 'heroHeading' | 'heroSubheading' | 'authorName' | 'primaryCtaText' | 'secondaryCtaText' | 'navBrandText' | 'heroTestimonialText' | 'heroMetricNumber';
  label: string;
  currentValue: string;
  elementRect?: DOMRect;
}

export default function PhotoshopVisualEditor() {
  const {
    settings,
    updateSettings,
    updateSectionStyle,
    updateComponentStyle,
    moveSectionOrder,
    isVisualEditMode,
    setIsVisualEditMode,
    activePhotoshopTool,
    setActivePhotoshopTool,
    selectedComponentId,
    setSelectedComponentId,
    activePreviewSection,
    setActivePreviewSection,
    previewDevice,
    setPreviewDevice,
    isSaving,
    lastSavedTime,
  } = useCustomization();

  const [selectedSecId, setSelectedSecId] = useState<SectionId>('hero');
  const [activeTextTarget, setActiveTextTarget] = useState<TextEditTarget | null>(null);
  const [tempTextValue, setTempTextValue] = useState<string>('');
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'inspector' | 'layers' | 'assets'>('inspector');
  const [isCssEditorOpen, setIsCssEditorOpen] = useState<boolean>(false);
  const [tempCssValue, setTempCssValue] = useState<string>('');

  // Snap-to-Grid & Alignment Guide Overlay States
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showGuides, setShowGuides] = useState<boolean>(true);
  const [snapToGridEnabled, setSnapToGridEnabled] = useState<boolean>(true);
  const [gridMode, setGridMode] = useState<'12-col' | 'pixel-16' | 'golden-thirds'>('12-col');
  const [gridColor, setGridColor] = useState<string>('#31A8FF');
  const [gridOpacity, setGridOpacity] = useState<number>(0.35);

  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);

  const sectionsOrder = (settings.sectionsOrder && settings.sectionsOrder.length > 0)
    ? settings.sectionsOrder
    : DEFAULT_SECTIONS_ORDER;

  const currentSecStyle: SectionStyleConfig = settings.sectionStyles?.[selectedSecId] || {
    paddingY: 'normal',
    bgStyle: 'default',
    borderTopGlow: false,
    borderBottomGlow: false,
    containerWidth: 'standard',
    alignment: 'left',
  };

  // Keyboard shortcut listener for Photoshop tools & Grid toggles
  useEffect(() => {
    if (!isVisualEditMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        if (e.key === 'Escape') {
          setActiveTextTarget(null);
        }
        return;
      }

      if (e.key.toLowerCase() === 'v') setActivePhotoshopTool('select');
      if (e.key.toLowerCase() === 't') setActivePhotoshopTool('type');
      if (e.key.toLowerCase() === 's' && !e.shiftKey && !e.ctrlKey && !e.metaKey) setActivePhotoshopTool('size');
      if (e.key.toLowerCase() === 'c') setActivePhotoshopTool('color');
      if (e.key.toLowerCase() === 'g') setShowGrid((prev) => !prev);
      if (e.key.toLowerCase() === 'a') setShowGuides((prev) => !prev);
      if (e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setSnapToGridEnabled((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setActiveTextTarget(null);
        setSelectedComponentId(null);
        setSelectedElement(null);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveToFirebase();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisualEditMode]);

  // Global click interceptor for element selection
  useEffect(() => {
    if (!isVisualEditMode) return;

    const handleClick = (e: MouseEvent) => {
      // Ignore clicks on the editor UI itself
      const target = e.target as HTMLElement;
      if (target.closest('.visual-editor-ui')) return;

      e.preventDefault();
      e.stopPropagation();

      // Find the closest meaningful element
      const sectionEl = target.closest('[data-section]');
      if (sectionEl) {
        const secId = sectionEl.getAttribute('data-section') as SectionId;
        setSelectedSecId(secId);
        setActivePreviewSection(secId);
      }

      const compId = target.getAttribute('data-component-id') || target.closest('[data-component-id]')?.getAttribute('data-component-id');
      if (compId) {
        setSelectedComponentId(compId);
      } else {
        // If no component ID, still allow selecting the element for basic inspection
        setSelectedComponentId(null);
      }

      setSelectedElement(target);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.visual-editor-ui')) {
        setHoveredElement(null);
        return;
      }
      setHoveredElement(target);
    };

    window.addEventListener('click', handleClick, true);
    window.addEventListener('mouseover', handleMouseOver, true);
    
    return () => {
      window.removeEventListener('click', handleClick, true);
      window.removeEventListener('mouseover', handleMouseOver, true);
    };
  }, [isVisualEditMode]);

  const handleSaveToFirebase = async () => {
    try {
      await updateSettings({
        sectionsOrder,
        sectionStyles: settings.sectionStyles,
        sectionsVisibility: settings.sectionsVisibility,
      });
      setSaveToast('Saved live to Cloud Firestore!');
      setTimeout(() => setSaveToast(null), 3500);
    } catch (err: any) {
      setSaveToast(`Error saving: ${err.message}`);
      setTimeout(() => setSaveToast(null), 4000);
    }
  };

  const handleApplyTextEdit = async () => {
    if (!activeTextTarget) return;

    if (activeTextTarget.secId) {
      await updateSectionStyle(activeTextTarget.secId, {
        [activeTextTarget.field]: tempTextValue,
      });
    } else {
      await updateSettings({
        [activeTextTarget.field]: tempTextValue,
      });
    }

    setSaveToast(`Updated "${activeTextTarget.label}"!`);
    setTimeout(() => setSaveToast(null), 2500);
    setActiveTextTarget(null);
  };

  const handleApplyCssEdit = async () => {
    if (!selectedComponentId) return;

    await updateComponentStyle(selectedSecId, selectedComponentId, {
      customCss: tempCssValue
    });

    setSaveToast('Custom CSS Applied!');
    setTimeout(() => setSaveToast(null), 2500);
    setIsCssEditorOpen(false);
  };

  // One-click Snap All Sections to Blueprint Grid
  const handleSnapAllSectionsToGrid = async () => {
    const updatedStyles: Record<string, SectionStyleConfig> = { ...settings.sectionStyles };
    sectionsOrder.forEach((secId) => {
      updatedStyles[secId] = {
        paddingY: 'normal',
        containerWidth: 'standard',
        alignment: 'left',
        bgStyle: updatedStyles[secId]?.bgStyle || 'default',
        borderTopGlow: updatedStyles[secId]?.borderTopGlow || false,
        borderBottomGlow: updatedStyles[secId]?.borderBottomGlow || false,
      };
    });
    await updateSettings({ sectionStyles: updatedStyles });
    setSaveToast('Snapped all sections to standard 12-col grid!');
    setTimeout(() => setSaveToast(null), 3000);
  };

  if (!isVisualEditMode) return null;

  const currentContent = getSectionEffectiveContent(selectedSecId, currentSecStyle);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex flex-col visual-editor-ui">
      {/* Photoshop Canvas Overlay Styles */}
      <style>{`
        body {
          user-select: ${isVisualEditMode ? 'none' : 'text'};
          overflow: ${isVisualEditMode ? 'hidden' : 'auto'};
        }
        [data-section] {
          cursor: crosshair !important;
          transition: outline 0.2s ease, box-shadow 0.2s ease;
        }
        [data-section]:hover {
          outline: 2px dashed ${gridColor}88 !important;
          outline-offset: 2px;
        }
        [data-section="${selectedSecId}"] {
          outline: 3px solid ${gridColor} !important;
          outline-offset: 4px;
          box-shadow: 0 0 50px ${gridColor}33 !important;
        }
        [data-component-id] {
          cursor: pointer !important;
          position: relative;
        }
        [data-component-id]:hover::after {
          content: '';
          position: absolute;
          inset: -4px;
          border: 2px solid ${gridColor}88;
          border-radius: 4px;
          pointer-events: none;
          z-index: 50;
        }
        [data-component-id="${selectedComponentId}"]::after {
          content: '' !important;
          position: absolute;
          inset: -4px;
          border: 2px solid ${gridColor} !important;
          border-radius: 4px;
          pointer-events: none;
          z-index: 51;
          box-shadow: 0 0 15px ${gridColor}66;
        }
      `}</style>

      {/* ================= TOP TOOLBAR ================= */}
      <div className="h-16 w-full bg-[#0e0e14] border-b border-white/10 pointer-events-auto flex items-center justify-between px-6 shadow-xl relative z-[110]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10">
            <span className="h-7 w-7 rounded-lg bg-[#001E36] text-[#31A8FF] flex items-center justify-center font-mono font-black text-sm border border-[#31A8FF]/40 shadow-inner">
              Ps
            </span>
            <span className="font-syne font-bold text-sm text-white hidden md:inline">
              Visual Studio <span className="text-neutral-500 font-mono text-xs ml-1">v2.0</span>
            </span>
          </div>

          <div className="h-6 w-px bg-white/10 hidden sm:block" />

          {/* Device Previews */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
            {[
              { id: 'desktop', icon: Monitor, label: 'Desktop' },
              { id: 'tablet', icon: Layers, label: 'Tablet' },
              { id: 'mobile', icon: Zap, label: 'Mobile' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setPreviewDevice(d.id as any)}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  previewDevice === d.id ? 'bg-white/10 text-[#31A8FF]' : 'text-neutral-500 hover:text-white'
                }`}
                title={d.label}
              >
                <d.icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Center: Active Selection Info */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
          {selectedElement ? (
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono">
              <span className="text-neutral-500">Selected:</span>
              <span className="text-[#31A8FF] font-bold">
                {selectedComponentId ? `#${selectedComponentId}` : `<${selectedElement.tagName.toLowerCase()}>`}
              </span>
              <div className="h-3 w-px bg-white/10" />
              <span className="text-emerald-400">
                {selectedElement.offsetWidth} × {selectedElement.offsetHeight} px
              </span>
            </div>
          ) : (
            <span className="text-[11px] font-mono text-neutral-500 italic">Select an element to edit</span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-neutral-500">{lastSavedTime ? `Last saved: ${lastSavedTime}` : 'Unsaved changes'}</span>
            <button
              onClick={handleSaveToFirebase}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#31A8FF] hover:bg-[#2596e6] text-black font-space font-bold text-xs shadow-lg shadow-[#31A8FF]/20 active:scale-95 transition-all cursor-pointer"
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              <span>Publish Live</span>
            </button>
          </div>

          <div className="h-6 w-px bg-white/10" />

          <button
            onClick={() => setIsVisualEditMode(false)}
            className="p-2 rounded-xl bg-white/5 hover:bg-rose-500 hover:text-black text-neutral-400 transition-all cursor-pointer"
            title="Exit Studio"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* ================= LEFT SIDEBAR: LAYERS & HIERARCHY ================= */}
        <div className="w-64 bg-[#0e0e14] border-r border-white/10 pointer-events-auto flex flex-col shadow-2xl relative z-[105]">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <span className="text-[11px] font-space font-bold uppercase tracking-widest text-neutral-400">Layers / Sections</span>
            <Layers className="h-3.5 w-3.5 text-neutral-500" />
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {sectionsOrder.map((secId, idx) => {
              const meta = SECTION_DEFAULTS_META[secId];
              const isSelected = selectedSecId === secId;
              const isVisible = settings.sectionsVisibility[secId];

              return (
                <div key={secId} className="group">
                  <div
                    onClick={() => {
                      setSelectedSecId(secId);
                      setActivePreviewSection(secId);
                      const el = document.getElementById(`section-wrapper-${secId}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all ${
                      isSelected ? 'bg-[#31A8FF]/10 border border-[#31A8FF]/30' : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <span className="text-[10px] font-mono text-neutral-600 font-bold w-4">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-space font-bold truncate ${isSelected ? 'text-[#31A8FF]' : 'text-neutral-300'}`}>
                          {meta?.name || secId}
                        </span>
                        {!isVisible && <EyeOff className="h-3 w-3 text-neutral-600" />}
                      </div>
                      <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-tighter">
                        {secId}
                      </span>
                    </div>
                  </div>
                  
                  {/* Quick Sub-layers (Hardcoded for demo, could be dynamic) */}
                  {isSelected && (
                    <div className="ml-7 mt-1 pl-2 border-l border-white/10 space-y-1">
                      <div className="flex items-center gap-2 px-2 py-1 rounded-lg text-[10px] text-neutral-500 hover:text-white cursor-pointer hover:bg-white/5">
                        <Type className="h-2.5 w-2.5" />
                        <span>Title Block</span>
                      </div>
                      <div className="flex items-center gap-2 px-2 py-1 rounded-lg text-[10px] text-neutral-500 hover:text-white cursor-pointer hover:bg-white/5">
                        <Grid className="h-2.5 w-2.5" />
                        <span>Container</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t border-white/10 bg-black/20">
            <button className="w-full py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-[11px] font-space font-bold text-neutral-300 flex items-center justify-center gap-2 transition-all cursor-pointer">
              <Plus className="h-3.5 w-3.5" />
              <span>Add New Section</span>
            </button>
          </div>
        </div>

        {/* ================= CENTRAL CANVAS AREA (EMPTY, WEBSITE RENDERS BEHIND) ================= */}
        <div className="flex-1 relative flex flex-col">
          {/* Overlay Grid/Guides */}
          {showGrid && (
            <div className="absolute inset-0 pointer-events-none z-10" style={{ opacity: gridOpacity }}>
              {gridMode === '12-col' && (
                <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 grid grid-cols-12 gap-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="h-full border-x bg-[#31A8FF]/[0.03] border-[#31A8FF]/[0.1]" />
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Selection HUD on the element itself */}
          {selectedElement && (
            <div 
              className="absolute pointer-events-none z-50 border-2 border-[#31A8FF] shadow-[0_0_20px_rgba(49,168,255,0.4)] transition-all duration-200"
              style={{
                top: selectedElement.getBoundingClientRect().top + window.scrollY,
                left: selectedElement.getBoundingClientRect().left + window.scrollX,
                width: selectedElement.offsetWidth,
                height: selectedElement.offsetHeight,
              }}
            >
              <div className="absolute -top-6 left-0 bg-[#31A8FF] text-black text-[10px] font-mono font-black px-1.5 py-0.5 rounded-sm whitespace-nowrap">
                {selectedComponentId ? `#${selectedComponentId}` : selectedElement.tagName.toLowerCase()}
              </div>
            </div>
          )}
        </div>

        {/* ================= RIGHT SIDEBAR: INSPECTOR ================= */}
        <div className="w-80 bg-[#0e0e14] border-l border-white/10 pointer-events-auto flex flex-col shadow-2xl relative z-[105]">
          <div className="flex items-center border-b border-white/10 bg-black/40">
            {[
              { id: 'inspector', icon: Sliders, label: 'Inspect' },
              { id: 'layers', icon: Layers, label: 'Tree' },
              { id: 'assets', icon: ImageIcon, label: 'Assets' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSidebarTab(tab.id as any)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all cursor-pointer ${
                  sidebarTab === tab.id ? 'bg-white/5 text-[#31A8FF] border-b-2 border-[#31A8FF]' : 'text-neutral-500 hover:text-white'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="text-[9px] font-space font-bold uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-8">
            {sidebarTab === 'inspector' && (
              <>
                {/* Element Information */}
                <div>
                  <h4 className="text-[11px] font-space font-bold text-neutral-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Monitor className="h-3.5 w-3.5 text-[#31A8FF]" />
                    <span>Element Identity</span>
                  </h4>
                  <div className="p-3 rounded-2xl bg-black/60 border border-white/10 space-y-3">
                    <div>
                      <label className="text-[9px] font-mono text-neutral-500 uppercase block mb-1">HTML Tag / Role</label>
                      <div className="text-xs font-mono text-white bg-white/5 px-2 py-1.5 rounded-lg border border-white/5">
                        {selectedElement?.tagName.toLowerCase() || 'div'}
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-mono text-neutral-500 uppercase block mb-1">Component ID</label>
                      <div className="text-xs font-mono text-[#31A8FF] bg-[#31A8FF]/10 px-2 py-1.5 rounded-lg border border-[#31A8FF]/20">
                        {selectedComponentId || 'None (System Default)'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Component Style Overrides */}
                {selectedComponentId && (
                  <div>
                    <h4 className="text-[11px] font-space font-bold text-[#31A8FF] uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5" />
                      <span>Component Styles</span>
                    </h4>
                    <div className="space-y-4">
                      {/* Color & Background */}
                      <div className="p-3 rounded-2xl bg-black/60 border border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-space text-neutral-400">Text Color</label>
                          <input 
                            type="color"
                            value={settings.sectionStyles?.[selectedSecId]?.componentStyles?.[selectedComponentId]?.typography?.color || '#ffffff'}
                            onChange={(e) => updateComponentStyle(selectedSecId, selectedComponentId, { 
                              typography: { ...settings.sectionStyles?.[selectedSecId]?.componentStyles?.[selectedComponentId]?.typography, color: e.target.value } 
                            })}
                            className="h-6 w-8 bg-transparent border-0 cursor-pointer"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-space text-neutral-400">Background</label>
                          <input 
                            type="color"
                            value={settings.sectionStyles?.[selectedSecId]?.componentStyles?.[selectedComponentId]?.backgroundColor || 'transparent'}
                            onChange={(e) => updateComponentStyle(selectedSecId, selectedComponentId, { 
                              backgroundColor: e.target.value 
                            })}
                            className="h-6 w-8 bg-transparent border-0 cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Spacing (Padding) */}
                      <div className="p-3 rounded-2xl bg-black/60 border border-white/10">
                        <label className="text-[10px] font-space text-neutral-400 block mb-3 uppercase tracking-tighter">Padding (px)</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['top', 'right', 'bottom', 'left'].map(side => (
                            <div key={side} className="flex flex-col gap-1">
                              <span className="text-[8px] font-mono text-neutral-600 uppercase">{side}</span>
                              <input 
                                type="text"
                                placeholder="0px"
                                value={settings.sectionStyles?.[selectedSecId]?.componentStyles?.[selectedComponentId]?.spacing?.[`padding${side.charAt(0).toUpperCase() + side.slice(1)}` as keyof SpacingConfig] || ''}
                                onChange={(e) => updateComponentStyle(selectedSecId, selectedComponentId, { 
                                  spacing: { 
                                    ...settings.sectionStyles?.[selectedSecId]?.componentStyles?.[selectedComponentId]?.spacing,
                                    [`padding${side.charAt(0).toUpperCase() + side.slice(1)}`]: e.target.value 
                                  } 
                                })}
                                className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white outline-none focus:border-[#31A8FF]"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Layout & Positioning */}
                      <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-4">
                        <label className="text-[10px] font-space text-neutral-400 block uppercase tracking-tighter mb-2">Position & Size</label>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[8px] font-mono text-neutral-600 uppercase">Width</label>
                            <input 
                              type="text"
                              placeholder="auto"
                              value={settings.sectionStyles?.[selectedSecId]?.componentStyles?.[selectedComponentId]?.layout?.width || ''}
                              onChange={(e) => updateComponentStyle(selectedSecId, selectedComponentId, { 
                                layout: { ...settings.sectionStyles?.[selectedSecId]?.componentStyles?.[selectedComponentId]?.layout, width: e.target.value } 
                              })}
                              className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white outline-none focus:border-[#31A8FF]"
                            />
                          </div>
                          <div>
                            <label className="text-[8px] font-mono text-neutral-600 uppercase">Height</label>
                            <input 
                              type="text"
                              placeholder="auto"
                              value={settings.sectionStyles?.[selectedSecId]?.componentStyles?.[selectedComponentId]?.layout?.height || ''}
                              onChange={(e) => updateComponentStyle(selectedSecId, selectedComponentId, { 
                                layout: { ...settings.sectionStyles?.[selectedSecId]?.componentStyles?.[selectedComponentId]?.layout, height: e.target.value } 
                              })}
                              className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white outline-none focus:border-[#31A8FF]"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                          <label className="text-[9px] font-mono text-neutral-500 uppercase">Display</label>
                          <select 
                            value={settings.sectionStyles?.[selectedSecId]?.componentStyles?.[selectedComponentId]?.layout?.display || 'block'}
                            onChange={(e) => updateComponentStyle(selectedSecId, selectedComponentId, { 
                              layout: { ...settings.sectionStyles?.[selectedSecId]?.componentStyles?.[selectedComponentId]?.layout, display: e.target.value as any } 
                            })}
                            className="bg-transparent text-[10px] text-[#31A8FF] font-bold outline-none"
                          >
                            <option value="block">Block</option>
                            <option value="flex">Flex</option>
                            <option value="grid">Grid</option>
                            <option value="none">None</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                          <label className="text-[9px] font-mono text-neutral-500 uppercase">Position</label>
                          <select 
                            value={settings.sectionStyles?.[selectedSecId]?.componentStyles?.[selectedComponentId]?.layout?.position || 'static'}
                            onChange={(e) => updateComponentStyle(selectedSecId, selectedComponentId, { 
                              layout: { ...settings.sectionStyles?.[selectedSecId]?.componentStyles?.[selectedComponentId]?.layout, position: e.target.value as any } 
                            })}
                            className="bg-transparent text-[10px] text-[#31A8FF] font-bold outline-none"
                          >
                            <option value="static">Static</option>
                            <option value="relative">Relative</option>
                            <option value="absolute">Absolute</option>
                            <option value="fixed">Fixed</option>
                            <option value="sticky">Sticky</option>
                          </select>
                        </div>

                        {settings.sectionStyles?.[selectedSecId]?.componentStyles?.[selectedComponentId]?.layout?.position !== 'static' && (
                          <div className="grid grid-cols-2 gap-3 pt-2">
                            {['top', 'left', 'right', 'bottom'].map(pos => (
                              <div key={pos}>
                                <label className="text-[8px] font-mono text-neutral-600 uppercase">{pos}</label>
                                <input 
                                  type="text"
                                  placeholder="0px"
                                  value={(settings.sectionStyles?.[selectedSecId]?.componentStyles?.[selectedComponentId]?.layout as any)?.[pos] || ''}
                                  onChange={(e) => updateComponentStyle(selectedSecId, selectedComponentId, { 
                                    layout: { ...settings.sectionStyles?.[selectedSecId]?.componentStyles?.[selectedComponentId]?.layout, [pos]: e.target.value } 
                                  })}
                                  className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white outline-none focus:border-[#31A8FF]"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Border Radius */}
                      <div className="p-3 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-between">
                        <label className="text-[10px] font-space text-neutral-400">Border Radius</label>
                        <input 
                          type="text"
                          placeholder="0px"
                          value={settings.sectionStyles?.[selectedSecId]?.componentStyles?.[selectedComponentId]?.border?.borderRadius || ''}
                          onChange={(e) => updateComponentStyle(selectedSecId, selectedComponentId, { 
                            border: { ...settings.sectionStyles?.[selectedSecId]?.componentStyles?.[selectedComponentId]?.border, borderRadius: e.target.value } 
                          })}
                          className="w-16 bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white outline-none focus:border-[#31A8FF] text-right"
                        />
                      </div>

                      {/* Image Source (if element is an img) */}
                      {selectedElement?.tagName.toLowerCase() === 'img' && (
                        <div className="p-3 rounded-2xl bg-black/60 border border-white/10 space-y-2">
                          <label className="text-[10px] font-space text-neutral-400 block uppercase tracking-tighter">Image Source URL</label>
                          <div className="flex flex-col gap-2">
                            <input 
                              type="text"
                              placeholder="https://images.unsplash.com/..."
                              value={(selectedElement as HTMLImageElement).src}
                              onChange={(e) => {
                                (selectedElement as HTMLImageElement).src = e.target.value;
                                // We should also store this in settings if we want it to persist properly
                                // For now, this is a live DOM change. 
                                // Ideally we'd have a 'src' field in ComponentStyleConfig.
                              }}
                              className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-[#31A8FF] outline-none focus:border-[#31A8FF]"
                            />
                            <p className="text-[8px] font-mono text-neutral-600">Note: Use a public URL or upload to a CDN.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Typography Controls */}
                <div>
                  <h4 className="text-[11px] font-space font-bold text-neutral-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Type className="h-3.5 w-3.5 text-[#FF5A1F]" />
                    <span>Typography</span>
                  </h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-space text-neutral-500 block mb-1.5">Size (Scale)</label>
                        <select 
                          value={currentSecStyle.fontSizeScale || 'normal'}
                          onChange={(e) => updateSectionStyle(selectedSecId, { fontSizeScale: e.target.value as any })}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#31A8FF]"
                        >
                          <option value="compact">Compact</option>
                          <option value="normal">Normal</option>
                          <option value="large">Large</option>
                          <option value="huge">Huge</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-space text-neutral-500 block mb-1.5">Transform</label>
                        <select 
                          value={currentSecStyle.fontTransform || 'normal'}
                          onChange={(e) => updateSectionStyle(selectedSecId, { fontTransform: e.target.value as any })}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#31A8FF]"
                        >
                          <option value="normal">Normal</option>
                          <option value="uppercase">Uppercase</option>
                          <option value="capitalize">Capitalize</option>
                        </select>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setActiveTextTarget({
                          secId: selectedSecId,
                          field: 'customTitle',
                          label: 'Section Title',
                          currentValue: currentContent.title
                        });
                        setTempTextValue(currentContent.title);
                      }}
                      className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-space font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit Text Content</span>
                    </button>
                  </div>
                </div>

                {/* Layout & Box Model */}
                <div>
                  <h4 className="text-[11px] font-space font-bold text-neutral-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Maximize2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Layout & Spacing</span>
                  </h4>
                  <div className="space-y-5">
                    <div className="p-3 rounded-2xl bg-black/60 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-space text-neutral-400">Alignment</label>
                        <div className="flex items-center gap-1">
                          {[
                            { id: 'left', icon: AlignLeft },
                            { id: 'center', icon: AlignCenter },
                            { id: 'right', icon: AlignRight },
                          ].map((a) => (
                            <button
                              key={a.id}
                              onClick={() => updateSectionStyle(selectedSecId, { alignment: a.id as any })}
                              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                (currentSecStyle.alignment || 'left') === a.id ? 'bg-[#31A8FF] text-black' : 'text-neutral-500 hover:text-white'
                              }`}
                            >
                              <a.icon className="h-3 w-3" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-space text-neutral-400">Width</label>
                        <select 
                          value={currentSecStyle.containerWidth || 'standard'}
                          onChange={(e) => updateSectionStyle(selectedSecId, { containerWidth: e.target.value as any })}
                          className="bg-transparent text-xs text-[#31A8FF] font-bold outline-none cursor-pointer"
                        >
                          <option value="compact">Compact</option>
                          <option value="standard">Standard</option>
                          <option value="wide">Wide</option>
                          <option value="full">Full</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                       <div className="p-3 rounded-2xl bg-black/60 border border-white/10">
                        <label className="text-[10px] font-space text-neutral-500 block mb-1">Padding Y</label>
                        <select 
                          value={currentSecStyle.paddingY || 'normal'}
                          onChange={(e) => updateSectionStyle(selectedSecId, { paddingY: e.target.value as any })}
                          className="w-full bg-transparent text-xs text-white font-bold outline-none cursor-pointer"
                        >
                          <option value="compact">Compact</option>
                          <option value="normal">Normal</option>
                          <option value="spacious">Spacious</option>
                          <option value="extra-spacious">Grand</option>
                        </select>
                      </div>
                      <div className="p-3 rounded-2xl bg-black/60 border border-white/10">
                        <label className="text-[10px] font-space text-neutral-500 block mb-1">Div Scale</label>
                        <select 
                          value={currentSecStyle.divSizing || 'standard'}
                          onChange={(e) => updateSectionStyle(selectedSecId, { divSizing: e.target.value as any })}
                          className="w-full bg-transparent text-xs text-white font-bold outline-none cursor-pointer"
                        >
                          <option value="compact">Compact</option>
                          <option value="standard">Standard</option>
                          <option value="expanded">Expanded</option>
                          <option value="full-width">Full Width</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appearance & Effects */}
                <div>
                  <h4 className="text-[11px] font-space font-bold text-neutral-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Palette className="h-3.5 w-3.5 text-purple-400" />
                    <span>Appearance</span>
                  </h4>
                  <div className="space-y-4">
                    <div className="p-3 rounded-2xl bg-black/60 border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-space text-neutral-400">Background</label>
                        <select 
                          value={currentSecStyle.bgStyle || 'default'}
                          onChange={(e) => updateSectionStyle(selectedSecId, { bgStyle: e.target.value as any })}
                          className="bg-transparent text-xs text-white font-bold outline-none cursor-pointer"
                        >
                          <option value="default">Default</option>
                          <option value="pitch-black">Pitch Black</option>
                          <option value="charcoal">Charcoal</option>
                          <option value="gradient-glow">Gradient Glow</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-space text-neutral-400">Top Divider Glow</label>
                        <button 
                          onClick={() => updateSectionStyle(selectedSecId, { borderTopGlow: !currentSecStyle.borderTopGlow })}
                          className={`w-10 h-5 rounded-full p-1 transition-all ${currentSecStyle.borderTopGlow ? 'bg-[#31A8FF]' : 'bg-neutral-800'}`}
                        >
                          <div className={`w-3 h-3 rounded-full bg-white transition-all ${currentSecStyle.borderTopGlow ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-space text-neutral-400">Bottom Divider Glow</label>
                        <button 
                          onClick={() => updateSectionStyle(selectedSecId, { borderBottomGlow: !currentSecStyle.borderBottomGlow })}
                          className={`w-10 h-5 rounded-full p-1 transition-all ${currentSecStyle.borderBottomGlow ? 'bg-[#31A8FF]' : 'bg-neutral-800'}`}
                        >
                          <div className={`w-3 h-3 rounded-full bg-white transition-all ${currentSecStyle.borderBottomGlow ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-[10px] font-space text-neutral-500 block mb-1.5">Accent Color</label>
                        <div className="flex items-center gap-2 bg-black/60 p-2 rounded-xl border border-white/10">
                          <div className="h-6 w-6 rounded-lg shadow-inner" style={{ backgroundColor: settings.accentColor }} />
                          <input 
                            type="text" 
                            value={settings.accentColor}
                            onChange={(e) => updateSettings({ accentColor: e.target.value })}
                            className="flex-1 bg-transparent text-xs font-mono text-white outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced CSS */}
                <div>
                  <h4 className="text-[11px] font-space font-bold text-neutral-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
                    <span>Advanced Overrides</span>
                  </h4>
                  <button 
                    disabled={!selectedComponentId}
                    onClick={() => {
                      if (!selectedComponentId) return;
                      const currentCss = settings.sectionStyles?.[selectedSecId]?.componentStyles?.[selectedComponentId]?.customCss || '';
                      setTempCssValue(currentCss);
                      setIsCssEditorOpen(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-space font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    <span>Open Code Editor</span>
                  </button>
                </div>
              </>
            )}

            {sidebarTab === 'layers' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-space font-bold text-neutral-400 uppercase tracking-widest">Element Tree</span>
                  <span className="text-[9px] font-mono text-[#31A8FF]">{selectedSecId}</span>
                </div>
                
                <div className="space-y-1">
                  {/* Root Section Element */}
                  <div 
                    onClick={() => {
                      setSelectedComponentId(null);
                      const el = document.getElementById(`section-wrapper-${selectedSecId}`);
                      if (el) setSelectedElement(el);
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                      !selectedComponentId ? 'bg-[#31A8FF]/10 text-[#31A8FF]' : 'text-neutral-400 hover:bg-white/5'
                    }`}
                  >
                    <Grid className="h-3 w-3" />
                    <span className="text-xs font-mono font-bold capitalize">{selectedSecId} Section</span>
                  </div>

                  {/* Children elements with data-component-id */}
                  <div className="ml-4 pl-3 border-l border-white/5 space-y-1 mt-1">
                    {(() => {
                      const sectionEl = document.getElementById(`section-wrapper-${selectedSecId}`);
                      if (!sectionEl) return null;
                      
                      const editableElements = Array.from(sectionEl.querySelectorAll('[data-component-id]'));
                      
                      return editableElements.map((el) => {
                        const compId = el.getAttribute('data-component-id');
                        const isSelected = selectedComponentId === compId;
                        
                        return (
                          <div 
                            key={compId}
                            onClick={() => {
                              setSelectedComponentId(compId);
                              setSelectedElement(el as HTMLElement);
                            }}
                            className={`flex items-center gap-2 px-3 py-1 rounded-lg cursor-pointer transition-all ${
                              isSelected ? 'bg-[#31A8FF]/10 text-[#31A8FF]' : 'text-neutral-500 hover:bg-white/5'
                            }`}
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-current opacity-40" />
                            <span className="text-[11px] font-mono truncate">{compId}</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            )}
            
            {sidebarTab === 'assets' && (
              <div className="space-y-4">
                <span className="text-[10px] font-mono text-neutral-500">Asset Manager (Coming Soon)</span>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-white/10 bg-black/40 text-[9px] font-mono text-neutral-600 flex justify-between">
            <span>X: {hoveredElement?.offsetLeft || 0} Y: {hoveredElement?.offsetTop || 0}</span>
            <span>Viewport: {window.innerWidth}px</span>
          </div>
        </div>
      </div>

      {/* Grid Overlay Controls Toolbar Strip (Bottom Floating) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto flex items-center gap-2 bg-[#0e0e14]/90 backdrop-blur-xl border border-white/15 px-4 py-2 rounded-2xl shadow-2xl z-[120]">
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-space text-[11px] font-bold transition-all cursor-pointer ${
            showGrid ? 'bg-[#31A8FF] text-black' : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Grid className="h-3.5 w-3.5" />
          <span>Grid [G]</span>
        </button>
        <div className="h-4 w-px bg-white/10 mx-1" />
        <button
          onClick={() => setSnapToGridEnabled(!snapToGridEnabled)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-space text-[11px] font-bold transition-all cursor-pointer ${
            snapToGridEnabled ? 'bg-emerald-400 text-black' : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Zap className="h-3.5 w-3.5" />
          <span>Snap [Shift+S]</span>
        </button>
        <div className="h-4 w-px bg-white/10 mx-1" />
        <div className="flex items-center gap-1">
          {['12-col', 'pixel-16', 'golden-thirds'].map((m) => (
            <button
              key={m}
              onClick={() => setGridMode(m as any)}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                gridMode === m ? 'bg-white/10 text-white font-bold' : 'text-neutral-600 hover:text-neutral-400'
              }`}
            >
              {m.split('-')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Save Notification Toast */}
      {saveToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-3 rounded-2xl bg-emerald-500 text-black font-space font-bold text-sm shadow-[0_20px_50px_rgba(16,185,129,0.3)] animate-fadeIn">
          <CheckCircle2 className="h-5 w-5" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Photoshop Typography HUD (Popup when editing text directly) */}
      <AnimatePresence>
        {activeTextTarget && (
          <div className="fixed inset-0 z-[210] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#121218] border-2 border-[#31A8FF] rounded-3xl p-6 max-w-lg w-full shadow-[0_40px_100px_rgba(0,0,0,0.9)] space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-xl bg-[#001E36] text-[#31A8FF] flex items-center justify-center font-mono font-bold text-sm border border-[#31A8FF]/30">
                    T
                  </span>
                  <div>
                    <span className="font-syne font-bold text-white block">Text Content Editor</span>
                    <span className="text-[10px] font-mono text-[#31A8FF] uppercase tracking-wider">{activeTextTarget.label}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTextTarget(null)}
                  className="p-2 rounded-xl text-neutral-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-space uppercase text-neutral-500 block mb-2 font-bold tracking-widest">
                    Content Value
                  </label>
                  <textarea
                    rows={4}
                    value={tempTextValue}
                    onChange={(e) => setTempTextValue(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-black/80 border border-white/10 text-sm text-white font-sans focus:border-[#31A8FF] focus:ring-1 focus:ring-[#31A8FF] outline-none transition-all"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] font-mono text-neutral-600">
                  Real-time rendering enabled
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTextTarget(null)}
                    className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs font-space font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyTextEdit}
                    className="px-6 py-2 rounded-xl bg-[#31A8FF] text-black font-space font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    Apply Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Advanced CSS Code Editor Modal */}
      <AnimatePresence>
        {isCssEditorOpen && (
          <div className="fixed inset-0 z-[220] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#0b0b0f] border border-white/20 rounded-[32px] w-full max-w-2xl h-[600px] flex flex-col overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)]"
            >
              {/* Header */}
              <div className="px-8 py-5 border-b border-white/10 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-500">
                    <Code className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-syne font-bold text-white text-lg">Custom CSS Engine</h3>
                    <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Applying to: <span className="text-[#31A8FF]">#{selectedComponentId}</span></p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsCssEditorOpen(false)}
                  className="p-2 rounded-xl bg-white/5 text-neutral-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Editor Area */}
              <div className="flex-1 p-6 bg-[#060608] relative">
                <div className="absolute left-6 top-6 bottom-6 w-10 bg-black/40 rounded-l-xl border-r border-white/5 flex flex-col items-center py-4 font-mono text-[10px] text-neutral-700 select-none">
                  {Array.from({ length: 20 }).map((_, i) => <span key={i}>{i + 1}</span>)}
                </div>
                <textarea
                  spellCheck={false}
                  value={tempCssValue}
                  onChange={(e) => setTempCssValue(e.target.value)}
                  placeholder="/* Enter your CSS rules here */&#10;color: #FF5A1F;&#10;border: 1px solid rgba(255,255,255,0.1);&#10;transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);"
                  className="w-full h-full bg-transparent pl-14 font-mono text-sm text-emerald-400 outline-none resize-none leading-relaxed placeholder:opacity-20"
                  autoFocus
                />
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/10 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-mono text-neutral-400 italic">Global style injection active</span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsCssEditorOpen(false)}
                    className="px-6 py-2.5 rounded-xl text-neutral-400 font-space font-bold text-xs hover:text-white transition-all"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleApplyCssEdit}
                    className="px-8 py-2.5 rounded-xl bg-white text-black font-space font-bold text-xs shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    Compile & Inject
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
