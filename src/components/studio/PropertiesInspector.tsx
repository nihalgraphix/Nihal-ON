import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { 
  ChevronDown, 
  ChevronRight, 
  Type, 
  Eye,
  EyeOff,
  Move, 
  Layout, 
  Trash2, 
  Copy, 
  Upload, 
  Image as ImageIcon,
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Sliders,
  Maximize2
} from 'lucide-react';
import { uploadMediaAsset } from '../../lib/firebaseStore';

export default function PropertiesInspector() {
  const {
    selectedElement,
    updateElement,
    updateElementContent,
    updateElementTypography,
    updateElementAppearance,
    updateElementSpacing,
    updateElementDimensions,
    updateElementAlignment,
    deleteElement,
    duplicateElement,
    selectElement,
  } = useStudio();

  // Collapsible accordion states
  const [openSections, setOpenSections] = useState({
    photo: true,
    content: true,
    alignment: true,
    typography: true,
    appearance: true,
    layout: true,
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedElement) return;
    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const asset = await uploadMediaAsset(dataUrl, file.name, selectedElement.label, 'Section Photo');
        updateElementContent(selectedElement.id, { imageUrl: asset.url });
      } catch (err) {
        console.error('Failed to upload image:', err);
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!selectedElement) {
    return (
      <aside className="w-80 bg-[#17181B] border-l border-[#2C2E34] flex flex-col p-4 select-none h-full shrink-0">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4F4F5] mb-4 font-mono">
          PROPERTIES
        </h3>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-[#71717A]">
          <Type className="w-8 h-8 mb-2 opacity-40 text-[#A1A1AA]" />
          <p className="text-xs text-[#A1A1AA] font-medium">No element selected</p>
          <p className="text-[11px] mt-1 text-[#71717A]">
            Click any section, heading, text, button, or photo on the live canvas to inspect and edit.
          </p>
        </div>
      </aside>
    );
  }

  const { id, label, type, content, typography, appearance, spacing, dimensions, alignment, parentId } = selectedElement;
  const isImageOrPhoto = type === 'image' || id.includes('image') || id.includes('photo') || id.includes('portrait') || id.includes('cover');

  return (
    <aside className="w-80 bg-[#17181B] border-l border-[#2C2E34] flex flex-col h-full shrink-0 overflow-y-auto min-h-0">
      {/* Header matching PROPERTIES in screenshot */}
      <div className="p-4 border-b border-[#2C2E34] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4F4F5] font-mono">
              PROPERTIES
            </h3>
            <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-[#202126] text-[#FF5A1F] border border-[#2C2E34] font-mono">
              {type}
            </span>
          </div>
          <p className="text-[11px] text-[#A1A1AA] truncate mt-0.5">{label || id}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => updateElement(id, { visible: selectedElement.visible === false ? true : false })}
            className={`p-1 rounded transition-colors cursor-pointer ${
              selectedElement.visible !== false ? 'text-[#A1A1AA] hover:text-white' : 'text-[#EF4444] bg-[#EF4444]/10'
            }`}
            title={selectedElement.visible !== false ? 'Hide element on web' : 'Unhide element on web'}
          >
            {selectedElement.visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => duplicateElement(id)}
            className="p-1 text-[#71717A] hover:text-[#F4F4F5] hover:bg-[#202126] rounded transition-colors cursor-pointer"
            title="Duplicate Element"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              deleteElement(id);
            }}
            className="p-1 text-[#71717A] hover:text-[#EF4444] hover:bg-[#202126] rounded transition-colors cursor-pointer"
            title="Delete / Remove Element"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-4">
        {/* 1. PHOTO & IMAGE REPLACEMENT */}
        {isImageOrPhoto && (
          <div className="space-y-2">
            <button
              onClick={() => toggleSection('photo')}
              className="w-full flex items-center justify-between text-xs font-semibold text-[#A1A1AA] hover:text-[#F4F4F5] cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#FF5A1F]" />
                <span>Replace Photo & Media</span>
              </span>
              {openSections.photo ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {openSections.photo && (
              <div className="space-y-2 bg-[#202126] p-3 rounded-lg border border-[#2C2E34]">
                {content?.imageUrl && (
                  <div className="relative aspect-video rounded-md overflow-hidden bg-[#111214] border border-[#2C2E34] mb-2">
                    <img src={content.imageUrl} alt={content.alt || label} className="w-full h-full object-cover" />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] text-[#71717A] uppercase font-mono mb-1">Upload New Photo</label>
                  <label className="w-full flex items-center justify-center gap-2 bg-[#FF5A1F] hover:bg-[#FF723F] text-white py-2 rounded-md font-semibold text-xs transition-colors cursor-pointer shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? 'Uploading photo...' : 'Choose File to Replace'}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>

                <div className="pt-2">
                  <label className="block text-[10px] text-[#71717A] uppercase font-mono mb-1">Or Paste Image URL</label>
                  <input
                    type="text"
                    value={content?.imageUrl || ''}
                    onChange={(e) => updateElementContent(id, { imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-[#111214] border border-[#2C2E34] rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>

                {/* Hero / About Instant Presets */}
                {(id.includes('hero') || id.includes('about')) && (
                  <div className="pt-2 border-t border-[#2C2E34]">
                    <span className="block text-[10px] text-[#71717A] uppercase font-mono mb-1.5">
                      Curated Presets:
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => updateElementContent(id, { imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop' })}
                        className="p-1 rounded bg-[#111214] hover:bg-[#25272D] text-[10px] font-mono text-[#A1A1AA] hover:text-white truncate border border-[#2C2E34]"
                      >
                        Studio Model
                      </button>
                      <button
                        onClick={() => updateElementContent(id, { imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop' })}
                        className="p-1 rounded bg-[#111214] hover:bg-[#25272D] text-[10px] font-mono text-[#A1A1AA] hover:text-white truncate border border-[#2C2E34]"
                      >
                        Modern Portrait
                      </button>
                      <button
                        onClick={() => updateElementContent(id, { imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=1200&auto=format&fit=crop' })}
                        className="p-1 rounded bg-[#111214] hover:bg-[#25272D] text-[10px] font-mono text-[#A1A1AA] hover:text-white truncate border border-[#2C2E34]"
                      >
                        Monochrome Art
                      </button>
                      <button
                        onClick={() => updateElementContent(id, { imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1200&auto=format&fit=crop' })}
                        className="p-1 rounded bg-[#111214] hover:bg-[#25272D] text-[10px] font-mono text-[#A1A1AA] hover:text-white truncate border border-[#2C2E34]"
                      >
                        Dark Aesthetic
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. CONTENT & TEXT */}
        {content && (
          <div className="space-y-2">
            <button
              onClick={() => toggleSection('content')}
              className="w-full flex items-center justify-between text-xs font-semibold text-[#A1A1AA] hover:text-[#F4F4F5] cursor-pointer"
            >
              <span>Content & Text</span>
              {openSections.content ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {openSections.content && (
              <div className="space-y-2">
                {content.text !== undefined && (
                  <div className="bg-[#202126] p-2.5 rounded-md border border-[#2C2E34]">
                    <label className="block text-[10px] text-[#71717A] mb-1 uppercase font-mono">
                      Text Value
                    </label>
                    <textarea
                      rows={2}
                      value={content.text || ''}
                      onChange={(e) => updateElementContent(id, { text: e.target.value })}
                      className="w-full bg-[#111214] border border-[#2C2E34] rounded px-2 py-1 text-xs text-[#F4F4F5] focus:outline-none focus:border-[#FF5A1F] resize-none"
                    />
                  </div>
                )}

                {content.subtext !== undefined && (
                  <div className="bg-[#202126] p-2.5 rounded-md border border-[#2C2E34]">
                    <label className="block text-[10px] text-[#71717A] mb-1 uppercase font-mono">
                      Subtext / Caption
                    </label>
                    <textarea
                      rows={2}
                      value={content.subtext || ''}
                      onChange={(e) => updateElementContent(id, { subtext: e.target.value })}
                      className="w-full bg-[#111214] border border-[#2C2E34] rounded px-2 py-1 text-xs text-[#F4F4F5] focus:outline-none focus:border-[#FF5A1F] resize-none"
                    />
                  </div>
                )}

                {content.link !== undefined && (
                  <div className="bg-[#202126] p-2.5 rounded-md border border-[#2C2E34]">
                    <label className="block text-[10px] text-[#71717A] mb-1 uppercase font-mono">
                      Button Link / Action Destination
                    </label>
                    <input
                      type="text"
                      value={content.link || ''}
                      onChange={(e) => updateElementContent(id, { link: e.target.value })}
                      placeholder="#services, #contact, https://..."
                      className="w-full bg-[#111214] border border-[#2C2E34] rounded px-2 py-1 text-xs text-[#F4F4F5] focus:outline-none focus:border-[#FF5A1F]"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}



        {/* 4. TYPOGRAPHY & TEXT STYLES */}
        <div className="space-y-2">
          <button
            onClick={() => toggleSection('typography')}
            className="w-full flex items-center justify-between text-xs font-semibold text-[#A1A1AA] hover:text-[#F4F4F5] cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-[#FF5A1F]" />
              <span>Typography & Styling</span>
            </span>
            {openSections.typography ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {openSections.typography && (
            <div className="space-y-2">
              {/* Font Family */}
              <div className="bg-[#202126] p-2.5 rounded-md border border-[#2C2E34]">
                <label className="block text-[11px] text-[#A1A1AA] mb-1 font-mono uppercase text-[10px]">Font Family</label>
                <select
                  value={typography?.fontFamily || "'Plus Jakarta Sans', sans-serif"}
                  onChange={(e) => updateElementTypography(id, { fontFamily: e.target.value })}
                  className="w-full bg-[#111214] border border-[#2C2E34] rounded px-2.5 py-1 text-xs text-[#F4F4F5] font-mono focus:outline-none focus:border-[#FF5A1F]"
                >
                  <option value="'Syne', sans-serif">Syne (Display Bold)</option>
                  <option value="'Space Grotesk', sans-serif">Space Grotesk (Tech)</option>
                  <option value="'Inter', sans-serif">Inter (Clean Sans)</option>
                  <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans</option>
                  <option value="'Outfit', sans-serif">Outfit (Modern)</option>
                  <option value="'Playfair Display', serif">Playfair Display (Serif)</option>
                  <option value="'Fira Code', monospace">Fira Code (Code Mono)</option>
                  <option value="'Montserrat', sans-serif">Montserrat (Punchy)</option>
                </select>
              </div>

              {/* Font Size & Weight */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#202126] p-2.5 rounded-md border border-[#2C2E34]">
                  <label className="block text-[10px] text-[#A1A1AA] mb-1 font-mono uppercase">Font Size</label>
                  <input
                    type="text"
                    value={typography?.fontSize || '32px'}
                    onChange={(e) => updateElementTypography(id, { fontSize: e.target.value })}
                    placeholder="e.g. 48px, 2.5rem"
                    className="w-full bg-[#111214] border border-[#2C2E34] rounded px-2 py-1 text-xs text-[#F4F4F5] font-mono focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>

                <div className="bg-[#202126] p-2.5 rounded-md border border-[#2C2E34]">
                  <label className="block text-[10px] text-[#A1A1AA] mb-1 font-mono uppercase">Font Weight</label>
                  <select
                    value={typography?.fontWeight || '700'}
                    onChange={(e) => updateElementTypography(id, { fontWeight: e.target.value })}
                    className="w-full bg-[#111214] border border-[#2C2E34] rounded px-2 py-1 text-xs text-[#F4F4F5] font-mono focus:outline-none focus:border-[#FF5A1F]"
                  >
                    <option value="300">300 Light</option>
                    <option value="400">400 Regular</option>
                    <option value="500">500 Medium</option>
                    <option value="600">600 Semibold</option>
                    <option value="700">700 Bold</option>
                    <option value="800">800 Extrabold</option>
                    <option value="900">900 Black</option>
                  </select>
                </div>
              </div>

              {/* Format Toggles: Bold, Italic, Underline, Strikethrough */}
              <div className="bg-[#202126] p-2.5 rounded-md border border-[#2C2E34]">
                <label className="block text-[10px] text-[#A1A1AA] mb-1 font-mono uppercase">Font Style & Decoration</label>
                <div className="grid grid-cols-4 gap-1">
                  <button
                    onClick={() => updateElementTypography(id, {
                      fontWeight: typography?.fontWeight === '700' ? '400' : '700'
                    })}
                    className={`py-1 rounded text-xs font-bold ${
                      typography?.fontWeight === '700' || typography?.fontWeight === '800' || typography?.fontWeight === '900'
                        ? 'bg-[#FF5A1F] text-white'
                        : 'bg-[#111214] text-[#A1A1AA] hover:text-white'
                    }`}
                    title="Bold"
                  >
                    B
                  </button>
                  <button
                    onClick={() => updateElementTypography(id, {
                      fontStyle: typography?.fontStyle === 'italic' ? 'normal' : 'italic'
                    })}
                    className={`py-1 rounded text-xs italic ${
                      typography?.fontStyle === 'italic'
                        ? 'bg-[#FF5A1F] text-white'
                        : 'bg-[#111214] text-[#A1A1AA] hover:text-white'
                    }`}
                    title="Italic"
                  >
                    I
                  </button>
                  <button
                    onClick={() => updateElementTypography(id, {
                      textDecoration: typography?.textDecoration === 'underline' ? 'none' : 'underline'
                    })}
                    className={`py-1 rounded text-xs underline ${
                      typography?.textDecoration === 'underline'
                        ? 'bg-[#FF5A1F] text-white'
                        : 'bg-[#111214] text-[#A1A1AA] hover:text-white'
                    }`}
                    title="Underline"
                  >
                    U
                  </button>
                  <button
                    onClick={() => updateElementTypography(id, {
                      textDecoration: typography?.textDecoration === 'line-through' ? 'none' : 'line-through'
                    })}
                    className={`py-1 rounded text-xs line-through ${
                      typography?.textDecoration === 'line-through'
                        ? 'bg-[#FF5A1F] text-white'
                        : 'bg-[#111214] text-[#A1A1AA] hover:text-white'
                    }`}
                    title="Strikethrough"
                  >
                    S
                  </button>
                </div>
              </div>

              {/* Text Transform */}
              <div className="bg-[#202126] p-2.5 rounded-md border border-[#2C2E34]">
                <label className="block text-[10px] text-[#A1A1AA] mb-1 font-mono uppercase">Text Transform</label>
                <div className="grid grid-cols-4 gap-1">
                  {(['none', 'uppercase', 'lowercase', 'capitalize'] as const).map(tf => (
                    <button
                      key={tf}
                      onClick={() => updateElementTypography(id, { textTransform: tf })}
                      className={`py-1 rounded text-[10px] font-mono capitalize ${
                        (typography?.textTransform || 'none') === tf
                          ? 'bg-[#FF5A1F] text-white font-medium'
                          : 'bg-[#111214] text-[#A1A1AA] hover:text-white'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Letter Spacing & Line Height */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#202126] p-2.5 rounded-md border border-[#2C2E34]">
                  <label className="block text-[10px] text-[#A1A1AA] mb-1 font-mono uppercase">Letter Spacing</label>
                  <select
                    value={typography?.letterSpacing || '0em'}
                    onChange={(e) => updateElementTypography(id, { letterSpacing: e.target.value })}
                    className="w-full bg-[#111214] border border-[#2C2E34] rounded px-2 py-1 text-xs text-[#F4F4F5] font-mono focus:outline-none focus:border-[#FF5A1F]"
                  >
                    <option value="-0.05em">Tight (-0.05em)</option>
                    <option value="0em">Normal (0em)</option>
                    <option value="0.05em">Wide (0.05em)</option>
                    <option value="0.1em">Wider (0.1em)</option>
                    <option value="0.2em">Widest (0.2em)</option>
                  </select>
                </div>

                <div className="bg-[#202126] p-2.5 rounded-md border border-[#2C2E34]">
                  <label className="block text-[10px] text-[#A1A1AA] mb-1 font-mono uppercase">Line Height</label>
                  <select
                    value={typography?.lineHeight || '1.4'}
                    onChange={(e) => updateElementTypography(id, { lineHeight: e.target.value })}
                    className="w-full bg-[#111214] border border-[#2C2E34] rounded px-2 py-1 text-xs text-[#F4F4F5] font-mono focus:outline-none focus:border-[#FF5A1F]"
                  >
                    <option value="1">Tight (1.0)</option>
                    <option value="1.2">Compact (1.2)</option>
                    <option value="1.4">Normal (1.4)</option>
                    <option value="1.6">Relaxed (1.6)</option>
                    <option value="1.8">Loose (1.8)</option>
                    <option value="2.2">Double Space (2.2)</option>
                  </select>
                </div>
              </div>

              {/* Enter & Paragraph Spacing */}
              <div className="bg-[#202126] p-2.5 rounded-md border border-[#2C2E34]">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] text-[#A1A1AA] font-mono uppercase">Enter / Paragraph Spacing</label>
                  <span className="text-[10px] text-[#FF5A1F] font-mono font-bold">Line Breaks Allowed</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const currentText = selectedElement?.content?.text || '';
                      updateElementContent(id, { text: currentText + '\n\n' });
                    }}
                    className="w-full bg-[#111214] hover:bg-[#18191E] border border-[#2C2E34] hover:border-[#FF5A1F] text-[#F4F4F5] py-1 px-2 rounded text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>↵ Add Paragraph Break (\n)</span>
                  </button>
                </div>
              </div>

              {/* Text Shadows & Glow */}
              <div className="bg-[#202126] p-2.5 rounded-md border border-[#2C2E34]">
                <label className="block text-[10px] text-[#A1A1AA] mb-1 font-mono uppercase">Text Shadow & Glow</label>
                <select
                  value={typography?.textShadow || ''}
                  onChange={(e) => updateElementTypography(id, { textShadow: e.target.value })}
                  className="w-full bg-[#111214] border border-[#2C2E34] rounded px-2 py-1 text-xs text-[#F4F4F5] font-mono focus:outline-none focus:border-[#FF5A1F]"
                >
                  <option value="">None (Flat Text)</option>
                  <option value="0 2px 4px rgba(0,0,0,0.8)">Drop Shadow Dark</option>
                  <option value="0 0 15px rgba(255,90,31,0.7)">Flame Glow Orange</option>
                  <option value="0 0 12px rgba(255,255,255,0.8)">Soft White Glow</option>
                  <option value="0 0 15px rgba(6,182,212,0.8)">Cyber Cyan Glow</option>
                </select>
              </div>

              {/* Text Gradient FX */}
              <div className="bg-[#202126] p-2.5 rounded-md border border-[#2C2E34]">
                <label className="block text-[10px] text-[#A1A1AA] mb-1 font-mono uppercase">Text Gradient Effect</label>
                <select
                  value={typography?.textGradient || ''}
                  onChange={(e) => updateElementTypography(id, { textGradient: e.target.value })}
                  className="w-full bg-[#111214] border border-[#2C2E34] rounded px-2 py-1 text-xs text-[#F4F4F5] font-mono focus:outline-none focus:border-[#FF5A1F]"
                >
                  <option value="">Solid Color (No Gradient)</option>
                  <option value="linear-gradient(to right, #FF5A1F, #FF8A00)">Flame Gradient (Orange-Yellow)</option>
                  <option value="linear-gradient(to right, #06B6D4, #3B82F6)">Cyber Cyan (Cyan-Blue)</option>
                  <option value="linear-gradient(to right, #A855F7, #EC4899)">Neon Purple (Purple-Pink)</option>
                  <option value="linear-gradient(to right, #F59E0B, #FDE047)">Gold Shine (Gold-Yellow)</option>
                  <option value="linear-gradient(to right, #FFFFFF, #9CA3AF)">Silver Chrome (White-Gray)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 5. APPEARANCE */}
        <div className="space-y-2">
          <button
            onClick={() => toggleSection('appearance')}
            className="w-full flex items-center justify-between text-xs font-semibold text-[#A1A1AA] hover:text-[#F4F4F5] cursor-pointer"
          >
            <span>Appearance & Colors</span>
            {openSections.appearance ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {openSections.appearance && (
            <div className="space-y-2">
              <div className="bg-[#202126] p-2.5 rounded-md border border-[#2C2E34] flex items-center justify-between">
                <label className="text-[11px] text-[#A1A1AA]">Text color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={typography?.textColor?.startsWith('#') ? typography.textColor.slice(0, 7) : '#FFFFFF'}
                    onChange={(e) => updateElementTypography(id, { textColor: e.target.value })}
                    className="w-5 h-5 rounded cursor-pointer border border-[#2C2E34] bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={typography?.textColor || '#FFFFFF'}
                    onChange={(e) => updateElementTypography(id, { textColor: e.target.value })}
                    className="w-20 bg-[#111214] border border-[#2C2E34] rounded px-1.5 py-0.5 text-[11px] text-[#F4F4F5] font-mono text-center"
                  />
                </div>
              </div>

              <div className="bg-[#202126] p-2.5 rounded-md border border-[#2C2E34] flex items-center justify-between">
                <label className="text-[11px] text-[#A1A1AA]">Background</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={appearance?.backgroundColor?.startsWith('#') ? appearance.backgroundColor.slice(0, 7) : '#090909'}
                    onChange={(e) => updateElementAppearance(id, { backgroundColor: e.target.value })}
                    className="w-5 h-5 rounded cursor-pointer border border-[#2C2E34] bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={appearance?.backgroundColor || 'transparent'}
                    onChange={(e) => updateElementAppearance(id, { backgroundColor: e.target.value })}
                    className="w-20 bg-[#111214] border border-[#2C2E34] rounded px-1.5 py-0.5 text-[11px] text-[#F4F4F5] font-mono text-center"
                  />
                </div>
              </div>

              <div className="bg-[#202126] p-2.5 rounded-md border border-[#2C2E34]">
                <label className="block text-[11px] text-[#A1A1AA] mb-1">Border Radius</label>
                <input
                  type="text"
                  value={appearance?.borderRadius || '8px'}
                  onChange={(e) => updateElementAppearance(id, { borderRadius: e.target.value })}
                  className="w-full bg-[#111214] border border-[#2C2E34] rounded px-2.5 py-1 text-xs text-[#F4F4F5] font-mono focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>
            </div>
          )}
        </div>

        {/* 6. SPACING */}
        <div className="space-y-2">
          <button
            onClick={() => toggleSection('layout')}
            className="w-full flex items-center justify-between text-xs font-semibold text-[#A1A1AA] hover:text-[#F4F4F5] cursor-pointer"
          >
            <span>Dimensions & Spacing</span>
            {openSections.layout ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {openSections.layout && (
            <div className="space-y-2">


              {/* Element Dimensions (Width & Height) */}
              <div className="bg-[#202126] p-2.5 rounded-md border border-[#2C2E34] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-[#A1A1AA] uppercase font-mono">Dimensions (Size)</label>
                  <button
                    onClick={() => updateElementDimensions(id, { width: undefined, height: undefined })}
                    className="text-[9px] font-mono text-[#A1A1AA] hover:text-white px-1.5 py-0.5 rounded bg-[#111214] border border-[#2C2E34]"
                  >
                    Auto Size
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-[#71717A] uppercase font-mono">Width</label>
                    <input
                      type="text"
                      placeholder="e.g. 100%, 380px"
                      value={dimensions?.width || ''}
                      onChange={(e) => updateElementDimensions(id, { width: e.target.value })}
                      className="w-full bg-[#111214] border border-[#2C2E34] rounded px-2 py-1 text-xs text-[#F4F4F5] font-mono mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#71717A] uppercase font-mono">Height</label>
                    <input
                      type="text"
                      placeholder="e.g. 520px, auto"
                      value={dimensions?.height || ''}
                      onChange={(e) => updateElementDimensions(id, { height: e.target.value })}
                      className="w-full bg-[#111214] border border-[#2C2E34] rounded px-2 py-1 text-xs text-[#F4F4F5] font-mono mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Padding & Margin */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#202126] p-2 rounded-md border border-[#2C2E34]">
                  <label className="block text-[10px] text-[#71717A] uppercase font-mono">Padding</label>
                  <input
                    type="text"
                    value={spacing?.paddingTop || '14px'}
                    onChange={(e) => updateElementSpacing(id, { paddingTop: e.target.value, paddingBottom: e.target.value })}
                    className="w-full bg-[#111214] border border-[#2C2E34] rounded px-1.5 py-0.5 text-xs text-[#F4F4F5] font-mono mt-1"
                  />
                </div>
                <div className="bg-[#202126] p-2 rounded-md border border-[#2C2E34]">
                  <label className="block text-[10px] text-[#71717A] uppercase font-mono">Margin</label>
                  <input
                    type="text"
                    value={spacing?.marginBottom || '16px'}
                    onChange={(e) => updateElementSpacing(id, { marginBottom: e.target.value })}
                    className="w-full bg-[#111214] border border-[#2C2E34] rounded px-1.5 py-0.5 text-xs text-[#F4F4F5] font-mono mt-1"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Breadcrumb Hierarchy matching Illustrative Layout */}
      <div className="mt-auto p-4 border-t border-[#2C2E34] text-center bg-[#141518]">
        <div className="text-[10px] text-[#71717A] font-mono truncate">
          {parentId ? `${parentId} > ${id}` : id}
        </div>
        <p className="text-[9px] text-[#555861] mt-0.5 font-mono">
          Illustrative layout & blueprint inspector
        </p>
      </div>
    </aside>
  );
}
