import React from 'react';
import { useStudio } from './StudioContext';
import {
  Undo,
  Redo,
  Save,
  Globe,
  Monitor,
  Laptop,
  Tablet,
  Smartphone,
  ZoomIn,
  ZoomOut,
  HelpCircle,
  History,
  X,
  Sparkles,
  Layers,
  PlusSquare,
  FileText,
  Palette,
  Image,
  Settings
} from 'lucide-react';
import { Breakpoint } from './types';

export const StudioTopBar: React.FC = () => {
  const {
    mode,
    setMode,
    activeTab,
    setActiveTab,
    viewport,
    setViewport,
    zoom,
    setZoom,
    canUndo,
    canRedo,
    undo,
    redo,
    saveStatus,
    lastSavedTime,
    saveDraft,
    publishChanges,
    setIsShortcutsOpen,
    setIsRevisionsOpen
  } = useStudio();

  if (mode !== 'edit') return null;

  return (
    <header className="sticky top-0 z-[1000] h-14 bg-[#09090B] border-b border-[#27272A] px-4 flex items-center justify-between text-white font-sans text-xs select-none shadow-xl">
      {/* Left: Studio Branding & Primary Nav Tabs */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 pr-3 border-r border-[#27272A]">
          <span className="h-6 w-6 rounded-md bg-[#FF5A1F] text-black font-black flex items-center justify-center text-xs shadow-[0_0_12px_#FF5A1F]">
            ✦
          </span>
          <span className="font-syne font-bold text-sm tracking-tight text-white">
            Nihal<span className="text-[#FF5A1F]">Studio</span>
          </span>
        </div>

        {/* Studio Sidebar Switcher Tabs */}
        <div className="flex items-center bg-[#18181B] rounded-lg p-1 border border-[#27272A]">
          <button
            onClick={() => setActiveTab('layers')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold transition-all ${
              activeTab === 'layers' ? 'bg-[#FF5A1F] text-black shadow-md' : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Layers</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold transition-all ${
              activeTab === 'add' ? 'bg-[#FF5A1F] text-black shadow-md' : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <PlusSquare className="h-3.5 w-3.5" />
            <span>Add</span>
          </button>

          <button
            onClick={() => setActiveTab('cms')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold transition-all ${
              activeTab === 'cms' ? 'bg-[#FF5A1F] text-black shadow-md' : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>CMS</span>
          </button>

          <button
            onClick={() => setActiveTab('design-tokens')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold transition-all ${
              activeTab === 'design-tokens' ? 'bg-[#FF5A1F] text-black shadow-md' : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <Palette className="h-3.5 w-3.5" />
            <span>Design Tokens</span>
          </button>

          <button
            onClick={() => setActiveTab('assets')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold transition-all ${
              activeTab === 'assets' ? 'bg-[#FF5A1F] text-black shadow-md' : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <Image className="h-3.5 w-3.5" />
            <span>Assets</span>
          </button>
        </div>
      </div>

      {/* Center: Viewport Devices & Zoom Controls */}
      <div className="flex items-center gap-3 bg-[#18181B] rounded-lg p-1 border border-[#27272A]">
        {/* Device Viewport Buttons */}
        <div className="flex items-center gap-1 pr-2 border-r border-[#27272A]">
          <button
            onClick={() => setViewport('desktop')}
            title="Desktop View (1440px)"
            className={`p-1.5 rounded transition-all ${
              viewport === 'desktop' ? 'bg-[#27272A] text-[#FF5A1F]' : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <Monitor className="h-4 w-4" />
          </button>

          <button
            onClick={() => setViewport('laptop')}
            title="Laptop View (1024px)"
            className={`p-1.5 rounded transition-all ${
              viewport === 'laptop' ? 'bg-[#27272A] text-[#FF5A1F]' : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <Laptop className="h-4 w-4" />
          </button>

          <button
            onClick={() => setViewport('tablet')}
            title="Tablet View (768px)"
            className={`p-1.5 rounded transition-all ${
              viewport === 'tablet' ? 'bg-[#27272A] text-[#FF5A1F]' : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <Tablet className="h-4 w-4" />
          </button>

          <button
            onClick={() => setViewport('mobile')}
            title="Mobile View (375px)"
            className={`p-1.5 rounded transition-all ${
              viewport === 'mobile' ? 'bg-[#27272A] text-[#FF5A1F]' : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <Smartphone className="h-4 w-4" />
          </button>
        </div>

        {/* Canvas Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            className="p-1 rounded text-[#A1A1AA] hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="font-mono text-[11px] text-[#A1A1AA] w-10 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom(Math.min(150, zoom + 10))}
            className="p-1 rounded text-[#A1A1AA] hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Right: Actions, Undo/Redo, Save & Publish */}
      <div className="flex items-center gap-3">
        {/* Undo / Redo */}
        <div className="flex items-center gap-1 bg-[#18181B] rounded-lg p-1 border border-[#27272A]">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className={`p-1.5 rounded transition-all ${
              canUndo ? 'text-white hover:bg-[#27272A]' : 'text-[#52525B] cursor-not-allowed'
            }`}
          >
            <Undo className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className={`p-1.5 rounded transition-all ${
              canRedo ? 'text-white hover:bg-[#27272A]' : 'text-[#52525B] cursor-not-allowed'
            }`}
          >
            <Redo className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Revision Checkpoints */}
        <button
          onClick={() => setIsRevisionsOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white transition-all"
          title="Revisions & History"
        >
          <History className="h-3.5 w-3.5" />
          <span>Revisions</span>
        </button>

        {/* Shortcuts Help */}
        <button
          onClick={() => setIsShortcutsOpen(true)}
          className="p-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white transition-all"
          title="Keyboard Shortcuts (?)"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

        {/* Save Draft */}
        <button
          onClick={saveDraft}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] font-semibold text-white transition-all border border-white/10"
        >
          <Save className="h-3.5 w-3.5 text-[#FF5A1F]" />
          <span>Save Draft</span>
        </button>

        {/* Publish Button */}
        <button
          onClick={publishChanges}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#FF5A1F] to-[#FF8A00] hover:brightness-110 font-bold text-black shadow-[0_0_15px_rgba(255,90,31,0.3)] transition-all cursor-pointer"
        >
          <Globe className="h-3.5 w-3.5" />
          <span>Publish</span>
        </button>

        {/* Exit Studio Button */}
        <button
          onClick={() => setMode('view')}
          className="p-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white transition-all"
          title="Exit Studio / Live Preview Mode"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
