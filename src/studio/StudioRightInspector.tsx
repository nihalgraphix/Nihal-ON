import React, { useState } from 'react';
import { useStudio } from './StudioContext';
import { ElementStyles, Breakpoint } from './types';
import {
  Sliders,
  Type,
  Layout,
  Maximize2,
  Palette,
  Sparkles,
  Code,
  Link,
  ImageIcon,
  RotateCcw,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  CornerUpLeft,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

export const StudioRightInspector: React.FC = () => {
  const {
    mode,
    elements,
    selectedElementId,
    setSelectedElementId,
    viewport,
    updateElementStyle,
    updateElementContent,
    updateElementHref,
    updateElementImage,
    updateElementAnimation,
    updateElementCustomCss,
    renameElement,
    toggleHideElement,
    toggleLockElement,
    copyStyle,
    pasteStyle,
    resetElementStyles,
    deleteElement,
    designTokens
  } = useStudio();

  const [activeSection, setActiveSection] = useState<'content' | 'dimensions' | 'layout' | 'spacing' | 'typography' | 'appearance' | 'animation' | 'advanced'>('content');

  if (mode !== 'edit') return null;

  const elem = selectedElementId ? elements[selectedElementId] : null;

  if (!elem) {
    return (
      <aside className="w-80 bg-[#09090B] border-l border-[#27272A] h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center p-6 text-center text-[#71717A] select-none shrink-0 z-50">
        <Sliders className="h-8 w-8 mb-3 text-[#3F3F46]" />
        <span className="font-syne font-bold text-sm text-[#A1A1AA]">No Element Selected</span>
        <p className="text-xs text-[#71717A] mt-1">Click any element on the live portfolio canvas or select from the Layers panel to inspect & edit properties.</p>
      </aside>
    );
  }

  // Current active styles based on viewport
  const styles: ElementStyles = viewport === 'desktop'
    ? elem.styles
    : { ...elem.styles, ...(elem.styles.responsiveOverrides?.[viewport as keyof typeof elem.styles.responsiveOverrides] || {}) };

  const handleStyleChange = (key: keyof ElementStyles, value: any) => {
    updateElementStyle(elem.id, { [key]: value }, viewport);
  };

  const handleMarginChange = (side: 'top' | 'right' | 'bottom' | 'left', value: string) => {
    const current = styles.margin || {};
    handleStyleChange('margin', { ...current, [side]: value });
  };

  const handlePaddingChange = (side: 'top' | 'right' | 'bottom' | 'left', value: string) => {
    const current = styles.padding || {};
    handleStyleChange('padding', { ...current, [side]: value });
  };

  const handleBorderRadiusChange = (corner: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight', value: string) => {
    const current = styles.borderRadius || {};
    handleStyleChange('borderRadius', { ...current, [corner]: value });
  };

  return (
    <aside className="w-80 bg-[#09090B] border-l border-[#27272A] h-[calc(100vh-3.5rem)] flex flex-col text-white select-none shrink-0 z-50 font-sans text-xs">
      {/* Element Header & Meta Bar */}
      <div className="p-3 border-b border-[#27272A] bg-[#121215] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="px-1.5 py-0.5 rounded bg-[#FF5A1F] text-black font-black text-[10px] uppercase font-mono">
              {elem.type}
            </span>
            <input
              type="text"
              value={elem.name}
              onChange={(e) => renameElement(elem.id, e.target.value)}
              className="bg-transparent font-bold text-white text-xs outline-none focus:bg-black/50 px-1 rounded truncate max-w-[120px]"
            />
          </div>

          <div className="flex items-center gap-1 text-[#A1A1AA]">
            {elem.parentId && (
              <button
                onClick={() => setSelectedElementId(elem.parentId)}
                title="Select Parent Container"
                className="p-1 hover:text-white"
              >
                <CornerUpLeft className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={() => toggleHideElement(elem.id)}
              title={elem.hidden ? 'Unhide Element' : 'Hide Element'}
              className="p-1 hover:text-white"
            >
              {elem.hidden ? <EyeOff className="h-3.5 w-3.5 text-red-400" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={() => toggleLockElement(elem.id)}
              title={elem.locked ? 'Unlock Element' : 'Lock Element'}
              className="p-1 hover:text-white"
            >
              {elem.locked ? <Lock className="h-3.5 w-3.5 text-amber-400" /> : <Unlock className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={() => copyStyle(elem.id)}
              title="Copy Styles"
              className="p-1 hover:text-white"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => resetElementStyles(elem.id)}
              title="Reset Styles"
              className="p-1 hover:text-amber-400"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => deleteElement(elem.id)}
              title="Delete Element"
              className="p-1 hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-[#A1A1AA] font-mono">
          <span>ID: #{elem.id}</span>
          <span className="text-[#FF5A1F] uppercase font-bold">Breakpoint: {viewport}</span>
        </div>
      </div>

      {/* Inspector Accordions / Tabs */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* 1. CONTENT & LINK INSPECTOR */}
        <div className="space-y-2 border-b border-[#27272A] pb-3">
          <div
            onClick={() => setActiveSection(activeSection === 'content' ? '' as any : 'content')}
            className="flex items-center justify-between font-syne font-bold text-xs uppercase text-[#A1A1AA] cursor-pointer hover:text-white"
          >
            <span className="flex items-center gap-1.5">
              <Type className="h-3.5 w-3.5 text-[#FF5A1F]" /> Content & Destination
            </span>
            {activeSection === 'content' ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </div>

          {activeSection === 'content' && (
            <div className="space-y-2 pt-1">
              {elem.content !== undefined && (
                <div>
                  <label className="text-[10px] text-[#A1A1AA] uppercase">Text Content</label>
                  <textarea
                    value={elem.content}
                    onChange={(e) => updateElementContent(elem.id, e.target.value)}
                    rows={3}
                    className="w-full bg-[#18181B] border border-[#27272A] rounded p-1.5 text-white outline-none focus:border-[#FF5A1F]"
                  />
                </div>
              )}

              {['button', 'link', 'image'].includes(elem.type) && (
                <div>
                  <label className="text-[10px] text-[#A1A1AA] uppercase flex items-center gap-1">
                    <Link className="h-3 w-3 text-emerald-400" /> Link Destination / Action URL
                  </label>
                  <input
                    type="text"
                    value={elem.href || ''}
                    placeholder="#services or https://..."
                    onChange={(e) => updateElementHref(elem.id, e.target.value)}
                    className="w-full bg-[#18181B] border border-[#27272A] rounded p-1.5 text-white outline-none focus:border-[#FF5A1F] font-mono text-[11px]"
                  />
                </div>
              )}

              {elem.type === 'image' && (
                <div>
                  <label className="text-[10px] text-[#A1A1AA] uppercase flex items-center gap-1">
                    <ImageIcon className="h-3 w-3 text-amber-400" /> Image Source URL
                  </label>
                  <input
                    type="text"
                    value={elem.imageSrc || ''}
                    placeholder="https://images.unsplash.com/..."
                    onChange={(e) => updateElementImage(elem.id, e.target.value)}
                    className="w-full bg-[#18181B] border border-[#27272A] rounded p-1.5 text-white outline-none focus:border-[#FF5A1F] font-mono text-[11px]"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. DIMENSIONS INSPECTOR */}
        <div className="space-y-2 border-b border-[#27272A] pb-3">
          <div
            onClick={() => setActiveSection(activeSection === 'dimensions' ? '' as any : 'dimensions')}
            className="flex items-center justify-between font-syne font-bold text-xs uppercase text-[#A1A1AA] cursor-pointer hover:text-white"
          >
            <span className="flex items-center gap-1.5">
              <Maximize2 className="h-3.5 w-3.5 text-sky-400" /> Dimensions
            </span>
            {activeSection === 'dimensions' ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </div>

          {activeSection === 'dimensions' && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="text-[10px] text-[#A1A1AA]">Width</label>
                <input
                  type="text"
                  value={styles.width || ''}
                  placeholder="auto, 100%, 400px"
                  onChange={(e) => handleStyleChange('width', e.target.value)}
                  className="w-full bg-[#18181B] border border-[#27272A] rounded p-1 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#A1A1AA]">Height</label>
                <input
                  type="text"
                  value={styles.height || ''}
                  placeholder="auto, 300px"
                  onChange={(e) => handleStyleChange('height', e.target.value)}
                  className="w-full bg-[#18181B] border border-[#27272A] rounded p-1 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#A1A1AA]">Max Width</label>
                <input
                  type="text"
                  value={styles.maxWidth || ''}
                  placeholder="1280px, 100%"
                  onChange={(e) => handleStyleChange('maxWidth', e.target.value)}
                  className="w-full bg-[#18181B] border border-[#27272A] rounded p-1 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#A1A1AA]">Overflow</label>
                <select
                  value={styles.overflow || 'visible'}
                  onChange={(e) => handleStyleChange('overflow', e.target.value)}
                  className="w-full bg-[#18181B] border border-[#27272A] rounded p-1 text-white"
                >
                  <option value="visible">visible</option>
                  <option value="hidden">hidden</option>
                  <option value="scroll">scroll</option>
                  <option value="auto">auto</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 3. SPACING (MARGIN & PADDING) */}
        <div className="space-y-2 border-b border-[#27272A] pb-3">
          <div
            onClick={() => setActiveSection(activeSection === 'spacing' ? '' as any : 'spacing')}
            className="flex items-center justify-between font-syne font-bold text-xs uppercase text-[#A1A1AA] cursor-pointer hover:text-white"
          >
            <span className="flex items-center gap-1.5">
              <Layout className="h-3.5 w-3.5 text-emerald-400" /> Margin & Padding
            </span>
            {activeSection === 'spacing' ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </div>

          {activeSection === 'spacing' && (
            <div className="space-y-3 pt-1">
              <div>
                <span className="text-[10px] text-[#A1A1AA] font-bold uppercase">Padding</span>
                <div className="grid grid-cols-4 gap-1 mt-1">
                  <input
                    type="text"
                    placeholder="T"
                    value={styles.padding?.top || ''}
                    onChange={(e) => handlePaddingChange('top', e.target.value)}
                    className="bg-[#18181B] border border-[#27272A] rounded p-1 text-center text-white font-mono"
                  />
                  <input
                    type="text"
                    placeholder="R"
                    value={styles.padding?.right || ''}
                    onChange={(e) => handlePaddingChange('right', e.target.value)}
                    className="bg-[#18181B] border border-[#27272A] rounded p-1 text-center text-white font-mono"
                  />
                  <input
                    type="text"
                    placeholder="B"
                    value={styles.padding?.bottom || ''}
                    onChange={(e) => handlePaddingChange('bottom', e.target.value)}
                    className="bg-[#18181B] border border-[#27272A] rounded p-1 text-center text-white font-mono"
                  />
                  <input
                    type="text"
                    placeholder="L"
                    value={styles.padding?.left || ''}
                    onChange={(e) => handlePaddingChange('left', e.target.value)}
                    className="bg-[#18181B] border border-[#27272A] rounded p-1 text-center text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <span className="text-[10px] text-[#A1A1AA] font-bold uppercase">Margin</span>
                <div className="grid grid-cols-4 gap-1 mt-1">
                  <input
                    type="text"
                    placeholder="T"
                    value={styles.margin?.top || ''}
                    onChange={(e) => handleMarginChange('top', e.target.value)}
                    className="bg-[#18181B] border border-[#27272A] rounded p-1 text-center text-white font-mono"
                  />
                  <input
                    type="text"
                    placeholder="R"
                    value={styles.margin?.right || ''}
                    onChange={(e) => handleMarginChange('right', e.target.value)}
                    className="bg-[#18181B] border border-[#27272A] rounded p-1 text-center text-white font-mono"
                  />
                  <input
                    type="text"
                    placeholder="B"
                    value={styles.margin?.bottom || ''}
                    onChange={(e) => handleMarginChange('bottom', e.target.value)}
                    className="bg-[#18181B] border border-[#27272A] rounded p-1 text-center text-white font-mono"
                  />
                  <input
                    type="text"
                    placeholder="L"
                    value={styles.margin?.left || ''}
                    onChange={(e) => handleMarginChange('left', e.target.value)}
                    className="bg-[#18181B] border border-[#27272A] rounded p-1 text-center text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#A1A1AA]">Gap</label>
                <input
                  type="text"
                  value={styles.gap || ''}
                  placeholder="1.5rem, 16px"
                  onChange={(e) => handleStyleChange('gap', e.target.value)}
                  className="w-full bg-[#18181B] border border-[#27272A] rounded p-1 text-white font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* 4. TYPOGRAPHY INSPECTOR */}
        <div className="space-y-2 border-b border-[#27272A] pb-3">
          <div
            onClick={() => setActiveSection(activeSection === 'typography' ? '' as any : 'typography')}
            className="flex items-center justify-between font-syne font-bold text-xs uppercase text-[#A1A1AA] cursor-pointer hover:text-white"
          >
            <span className="flex items-center gap-1.5">
              <Type className="h-3.5 w-3.5 text-indigo-400" /> Typography
            </span>
            {activeSection === 'typography' ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </div>

          {activeSection === 'typography' && (
            <div className="space-y-2 pt-1">
              <div>
                <label className="text-[10px] text-[#A1A1AA]">Font Family</label>
                <select
                  value={styles.fontFamily || 'Syne, sans-serif'}
                  onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                  className="w-full bg-[#18181B] border border-[#27272A] rounded p-1 text-white"
                >
                  <option value="Syne, sans-serif">Syne (Display)</option>
                  <option value="Plus Jakarta Sans, sans-serif">Plus Jakarta Sans (Body)</option>
                  <option value="Space Grotesk, sans-serif">Space Grotesk (Tech)</option>
                  <option value="monospace">Monospace</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[#A1A1AA]">Font Size</label>
                  <input
                    type="text"
                    value={styles.fontSize || ''}
                    placeholder="1rem, 24px"
                    onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                    className="w-full bg-[#18181B] border border-[#27272A] rounded p-1 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#A1A1AA]">Font Weight</label>
                  <select
                    value={styles.fontWeight || '400'}
                    onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
                    className="w-full bg-[#18181B] border border-[#27272A] rounded p-1 text-white"
                  >
                    <option value="300">300 (Light)</option>
                    <option value="400">400 (Normal)</option>
                    <option value="600">600 (Semi-Bold)</option>
                    <option value="700">700 (Bold)</option>
                    <option value="800">800 (Extra-Bold)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#A1A1AA]">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={styles.color?.startsWith('#') ? styles.color : '#FFFFFF'}
                    onChange={(e) => handleStyleChange('color', e.target.value)}
                    className="w-6 h-6 rounded border-none bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={styles.color || ''}
                    onChange={(e) => handleStyleChange('color', e.target.value)}
                    className="flex-1 bg-[#18181B] border border-[#27272A] rounded p-1 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 5. APPEARANCE & BORDERS */}
        <div className="space-y-2 border-b border-[#27272A] pb-3">
          <div
            onClick={() => setActiveSection(activeSection === 'appearance' ? '' as any : 'appearance')}
            className="flex items-center justify-between font-syne font-bold text-xs uppercase text-[#A1A1AA] cursor-pointer hover:text-white"
          >
            <span className="flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5 text-amber-400" /> Background & Border
            </span>
            {activeSection === 'appearance' ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </div>

          {activeSection === 'appearance' && (
            <div className="space-y-2 pt-1">
              <div>
                <label className="text-[10px] text-[#A1A1AA]">Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={styles.backgroundColor?.startsWith('#') ? styles.backgroundColor : '#111111'}
                    onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                    className="w-6 h-6 rounded border-none bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={styles.backgroundColor || ''}
                    placeholder="rgba(0,0,0,0.8)"
                    onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                    className="flex-1 bg-[#18181B] border border-[#27272A] rounded p-1 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#A1A1AA]">Border Radius Corners</label>
                <div className="grid grid-cols-4 gap-1 mt-1">
                  <input
                    type="text"
                    placeholder="TL"
                    value={styles.borderRadius?.topLeft || ''}
                    onChange={(e) => handleBorderRadiusChange('topLeft', e.target.value)}
                    className="bg-[#18181B] border border-[#27272A] rounded p-1 text-center text-white font-mono"
                  />
                  <input
                    type="text"
                    placeholder="TR"
                    value={styles.borderRadius?.topRight || ''}
                    onChange={(e) => handleBorderRadiusChange('topRight', e.target.value)}
                    className="bg-[#18181B] border border-[#27272A] rounded p-1 text-center text-white font-mono"
                  />
                  <input
                    type="text"
                    placeholder="BL"
                    value={styles.borderRadius?.bottomLeft || ''}
                    onChange={(e) => handleBorderRadiusChange('bottomLeft', e.target.value)}
                    className="bg-[#18181B] border border-[#27272A] rounded p-1 text-center text-white font-mono"
                  />
                  <input
                    type="text"
                    placeholder="BR"
                    value={styles.borderRadius?.bottomRight || ''}
                    onChange={(e) => handleBorderRadiusChange('bottomRight', e.target.value)}
                    className="bg-[#18181B] border border-[#27272A] rounded p-1 text-center text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
