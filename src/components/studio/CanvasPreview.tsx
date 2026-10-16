import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useStudio } from '../../context/StudioContext';
import { 
  Monitor, 
  Maximize2, 
  Minimize2, 
  Smartphone, 
  Tablet, 
  Sparkles, 
  Layout, 
  Compass, 
  Upload, 
  Layers, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  ChevronRight,
  Eye,
  Type,
  Square,
  Image as ImageIcon,
  Move,
  RotateCcw,
  Check,
  X,
  Edit3,
  Link as LinkIcon,
  Plus,
  Trash2,
  Copy,
  Briefcase
} from 'lucide-react';
import Hero from '../Hero';
import Marquee from '../Marquee';
import About from '../About';
import Projects from '../Projects';
import Services from '../Services';
import Process from '../Process';
import Skills from '../Skills';
import Experience from '../Experience';
import Testimonials from '../Testimonials';
import Blog from '../Blog';
import Gallery from '../Gallery';
import Stats from '../Stats';
import FAQ from '../FAQ';
import Contact from '../Contact';
import Footer from '../Footer';
import { uploadMediaAsset } from '../../lib/firebaseStore';

// Preset photo replacements for quick 1-click replacement
const PHOTO_PRESETS: Record<string, { label: string; url: string }[]> = {
  'hero-model-image': [
    { label: 'Hooded Model Original', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop' },
    { label: 'Minimalist Portrait', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop' },
    { label: 'Creative Direction Subject', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200&auto=format&fit=crop' },
    { label: 'Dark Aesthetic Studio', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1200&auto=format&fit=crop' },
  ],
  'about-portrait-image': [
    { label: 'Studio Technologist', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop' },
    { label: 'Editorial Monochrome', url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=1200&auto=format&fit=crop' },
    { label: 'Product Architect', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1200&auto=format&fit=crop' },
    { label: 'Warm Creative Portrait', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1200&auto=format&fit=crop' },
  ],
};

interface CanvasPreviewProps {
  onToggleFloatLeft?: () => void;
  onToggleFloatRight?: () => void;
}

export default function CanvasPreview({ onToggleFloatLeft, onToggleFloatRight }: CanvasPreviewProps) {
  const {
    draftData,
    selectedElementId,
    selectElement,
    previewDevice,
    setPreviewDevice,
    updateElementContent,
    updateElementAlignment,
    updateElementTypography,
    updateElementAppearance,
    updateElementSpacing,
    updateElementDimensions,
    addElement,
    deleteElement,
    duplicateElement,
  } = useStudio();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFullViewMode, setIsFullViewMode] = useState(true);
  const [editorMode, setEditorMode] = useState<'full-web' | 'blueprint'>('full-web');
  const [blueprintSection, setBlueprintSection] = useState<string>('hero');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [showInlineTextModal, setShowInlineTextModal] = useState(false);
  const [inlineTextVal, setInlineTextVal] = useState('');

  // Active element bounding box & dragging states
  const canvasFrameRef = useRef<HTMLDivElement>(null);
  const [targetBox, setTargetBox] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [isDraggingMove, setIsDraggingMove] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);

  const moveStartRef = useRef<{ startX: number; startY: number; initTransformX: number; initTransformY: number }>({
    startX: 0,
    startY: 0,
    initTransformX: 0,
    initTransformY: 0,
  });

  const resizeStartRef = useRef<{ startX: number; startY: number; initWidth: number; initHeight: number }>({
    startX: 0,
    startY: 0,
    initWidth: 0,
    initHeight: 0,
  });

  const elements = draftData.elements;
  const selectedElement = selectedElementId ? elements[selectedElementId] : null;

  const sectionsList = [
    { id: 'hero', name: 'Hero Section' },
    { id: 'marquee', name: 'Marquee Brands' },
    { id: 'about', name: 'About Studio' },
    { id: 'projects', name: 'Selected Projects' },
    { id: 'services', name: 'Services & Scope' },
    { id: 'process', name: 'Workflow Process' },
    { id: 'skills', name: 'Technical Skills' },
    { id: 'experience', name: 'Experience Timeline' },
    { id: 'testimonials', name: 'Testimonials' },
    { id: 'blog', name: 'Articles & Blog' },
    { id: 'gallery', name: 'Gallery Archive' },
    { id: 'stats', name: 'Statistics' },
    { id: 'faq', name: 'FAQ' },
    { id: 'contact', name: 'Contact Form' },
    { id: 'footer', name: 'Footer' },
  ];

  // Device width styling
  const getDeviceWidth = () => {
    switch (previewDevice) {
      case 'mobile':
        return 'w-[375px] max-w-full';
      case 'tablet':
        return 'w-[768px] max-w-full';
      default:
        return 'w-full';
    }
  };

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Update target bounding box when selectedElement changes or scroll occurs
  const updateTargetBox = useCallback(() => {
    if (!selectedElementId || !canvasFrameRef.current) {
      setTargetBox(null);
      return;
    }

    const domEl = canvasFrameRef.current.querySelector(`[data-editable-id="${selectedElementId}"]`) as HTMLElement;
    if (domEl) {
      const containerRect = canvasFrameRef.current.getBoundingClientRect();
      const elRect = domEl.getBoundingClientRect();

      setTargetBox({
        top: elRect.top - containerRect.top,
        left: elRect.left - containerRect.left,
        width: elRect.width,
        height: elRect.height,
      });
    } else {
      setTargetBox(null);
    }
  }, [selectedElementId]);

  useEffect(() => {
    updateTargetBox();
    const interval = setInterval(updateTargetBox, 300);
    window.addEventListener('resize', updateTargetBox);
    const scrollEl = scrollContainerRef.current;
    if (scrollEl) {
      scrollEl.addEventListener('scroll', updateTargetBox, { passive: true });
    }
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updateTargetBox);
      if (scrollEl) {
        scrollEl.removeEventListener('scroll', updateTargetBox);
      }
    };
  }, [updateTargetBox]);

  // Live synchronization of edited element properties directly to DOM
  useEffect(() => {
    if (!canvasFrameRef.current) return;
    Object.entries(elements).forEach(([elId, elData]) => {
      const dom = canvasFrameRef.current?.querySelector(`[data-editable-id="${elId}"]`) as HTMLElement;
      if (dom) {
        if (elData.content?.text !== undefined && !dom.querySelector('textarea')) {
          if (dom.children.length === 0 || dom.getAttribute('data-is-text-leaf') === 'true') {
            dom.innerText = elData.content.text;
          } else {
            const leaf = dom.querySelector('span, p, h1, h2, h3, h4, h5, h6') as HTMLElement;
            if (leaf) {
              leaf.innerText = elData.content.text;
            } else {
              dom.innerText = elData.content.text;
            }
          }
        }
        if (elData.typography?.textColor) {
          dom.style.color = elData.typography.textColor;
        }
        if (elData.typography?.fontSize) {
          dom.style.fontSize = elData.typography.fontSize;
        }
        if (elData.typography?.fontWeight) {
          dom.style.fontWeight = elData.typography.fontWeight;
        }
        if (elData.typography?.fontFamily) {
          dom.style.fontFamily = elData.typography.fontFamily;
        }
        if (elData.typography?.fontStyle) {
          dom.style.fontStyle = elData.typography.fontStyle;
        }
        if (elData.typography?.textDecoration) {
          dom.style.textDecoration = elData.typography.textDecoration;
        }
        if (elData.typography?.textTransform) {
          dom.style.textTransform = elData.typography.textTransform;
        }
        if (elData.typography?.letterSpacing) {
          dom.style.letterSpacing = elData.typography.letterSpacing;
        }
        if (elData.typography?.lineHeight) {
          dom.style.lineHeight = elData.typography.lineHeight;
        }
        if (elData.typography?.textShadow) {
          dom.style.textShadow = elData.typography.textShadow;
        }
        if (elData.appearance?.backgroundColor) {
          dom.style.backgroundColor = elData.appearance.backgroundColor;
        }
        if (elData.appearance?.borderRadius) {
          dom.style.borderRadius = elData.appearance.borderRadius;
        }
        if (elData.appearance?.opacity !== undefined) {
          dom.style.opacity = String(elData.appearance.opacity);
        }
        if (elData.dimensions?.width) {
          dom.style.width = elData.dimensions.width;
        }
        if (elData.dimensions?.height) {
          dom.style.height = elData.dimensions.height;
        }
      }
    });
  }, [elements]);

  // Handle Photo File Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetElementId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const asset = await uploadMediaAsset(dataUrl, file.name, selectedElement?.label || 'Photo', 'Website Photo');
        updateElementContent(targetElementId, { imageUrl: asset.url });
      } catch (err) {
        console.error('Photo upload failed:', err);
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Mouse Drag to Move logic
  const handleMoveMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedElement) return;

    setIsDraggingMove(true);
    const currentX = selectedElement.spacing?.transformX || 0;
    const currentY = selectedElement.spacing?.transformY || 0;

    moveStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initTransformX: currentX,
      initTransformY: currentY,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - moveStartRef.current.startX;
      const deltaY = moveEvent.clientY - moveStartRef.current.startY;
      const nextX = Math.round(moveStartRef.current.initTransformX + deltaX);
      const nextY = Math.round(moveStartRef.current.initTransformY + deltaY);

      updateElementSpacing(selectedElement.id, {
        transformX: nextX,
        transformY: nextY,
      });
      updateTargetBox();
    };

    const handleMouseUp = () => {
      setIsDraggingMove(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Mouse Drag to Resize logic (handles corners and edges)
  const handleResizeMouseDown = (e: React.MouseEvent, handleDirection: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedElement || !targetBox) return;

    setIsResizing(handleDirection);
    resizeStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initWidth: targetBox.width,
      initHeight: targetBox.height,
    };

    const handleResizeMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - resizeStartRef.current.startX;
      const deltaY = moveEvent.clientY - resizeStartRef.current.startY;

      let newWidth = resizeStartRef.current.initWidth;
      let newHeight = resizeStartRef.current.initHeight;

      if (handleDirection.includes('e') || handleDirection.includes('se') || handleDirection.includes('ne')) {
        newWidth = Math.max(40, resizeStartRef.current.initWidth + deltaX);
      } else if (handleDirection.includes('w') || handleDirection.includes('sw') || handleDirection.includes('nw')) {
        newWidth = Math.max(40, resizeStartRef.current.initWidth - deltaX);
      }

      if (handleDirection.includes('s') || handleDirection.includes('se') || handleDirection.includes('sw')) {
        newHeight = Math.max(24, resizeStartRef.current.initHeight + deltaY);
      } else if (handleDirection.includes('n') || handleDirection.includes('ne') || handleDirection.includes('nw')) {
        newHeight = Math.max(24, resizeStartRef.current.initHeight - deltaY);
      }

      updateElementDimensions(selectedElement.id, {
        width: `${Math.round(newWidth)}px`,
        height: `${Math.round(newHeight)}px`,
      });
      updateTargetBox();
    };

    const handleResizeUp = () => {
      setIsResizing(null);
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeUp);
    };

    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeUp);
  };

  const isImageOrPhoto = selectedElement && (
    selectedElement.type === 'image' ||
    selectedElement.id.includes('image') ||
    selectedElement.id.includes('photo') ||
    selectedElement.id.includes('model') ||
    selectedElement.id.includes('portrait')
  );

  // Smooth and guaranteed section jumping in live canvas & blueprint mode
  const handleJumpToSection = (sec: string) => {
    setBlueprintSection(sec);
    if (editorMode !== 'full-web') {
      setEditorMode('full-web');
    }

    const doJump = () => {
      let el: HTMLElement | null = null;
      if (canvasFrameRef.current) {
        el = (canvasFrameRef.current.querySelector(`#${sec}`) as HTMLElement) ||
             (canvasFrameRef.current.querySelector(`[data-section="${sec}"]`) as HTMLElement) ||
             (canvasFrameRef.current.querySelector(`section#${sec}`) as HTMLElement) ||
             (canvasFrameRef.current.querySelector(`[data-editable-id^="${sec}"]`) as HTMLElement) ||
             (sec === 'hero' ? (canvasFrameRef.current.querySelector('#home') as HTMLElement) : null) ||
             (sec === 'footer' ? (canvasFrameRef.current.querySelector('footer') as HTMLElement) : null);
      }
      if (!el) {
        el = document.getElementById(sec) ||
             (document.querySelector(`[data-section="${sec}"]`) as HTMLElement) ||
             (sec === 'hero' ? document.getElementById('home') : null);
      }

      if (el) {
        // Direct native scroll
        try {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch {}

        // Container scroll calculation
        if (scrollContainerRef.current) {
          const containerRect = scrollContainerRef.current.getBoundingClientRect();
          const elRect = el.getBoundingClientRect();
          const targetScrollTop = scrollContainerRef.current.scrollTop + (elRect.top - containerRect.top) - 15;
          scrollContainerRef.current.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth'
          });
        }

        // Visual feedback highlight
        el.style.transition = 'outline 0.3s ease, box-shadow 0.3s ease';
        el.style.outline = '3px solid #FF5A1F';
        el.style.boxShadow = '0 0 35px rgba(255, 90, 31, 0.6)';
        setTimeout(() => {
          if (el) {
            el.style.outline = '';
            el.style.boxShadow = '';
          }
        }, 2500);

        // Select the heading in Properties Inspector for immediate text editing
        if (sec === 'experience') {
          const expKeys = ['experience-heading-title', 'experience-heading', 'experience-tag', 'exp-role-1', 'experience-1'];
          for (const k of expKeys) {
            if (elements[k]) {
              selectElement(k);
              break;
            }
          }
        } else {
          const firstEl = Object.values(elements).find(e => e.section === sec);
          if (firstEl) {
            selectElement(firstEl.id);
          }
        }
      }
    };

    doJump();
    setTimeout(doJump, 80);
    setTimeout(doJump, 250);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#111214] overflow-hidden min-h-0">
      {/* Top Breadcrumb & Canvas Controls Bar */}
      <div className="h-11 px-4 flex items-center justify-between border-b border-[#2C2E34] bg-[#141518] text-xs shrink-0 gap-2">
        {/* Left: View Mode Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center bg-[#1A1C20] p-0.5 rounded-md border border-[#2C2E34] shrink-0">
            <button
              onClick={() => setEditorMode('full-web')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
                editorMode === 'full-web'
                  ? 'bg-[#25272D] text-white shadow-xs font-medium'
                  : 'text-[#71717A] hover:text-[#A1A1AA]'
              }`}
            >
              <Compass className="w-3 h-3 text-[#FF5A1F]" />
              <span>Exact Live Web Canvas</span>
            </button>
            <button
              onClick={() => setEditorMode('blueprint')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
                editorMode === 'blueprint'
                  ? 'bg-[#25272D] text-white shadow-xs font-medium'
                  : 'text-[#71717A] hover:text-[#A1A1AA]'
              }`}
            >
              <Layout className="w-3 h-3 text-[#3B82F6]" />
              <span>Section Blueprint Mode</span>
            </button>
          </div>

          {/* 100% Full View Web Canvas Toggle */}
          <button
            onClick={() => setIsFullViewMode(!isFullViewMode)}
            className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1.5 border shrink-0 ${
              isFullViewMode
                ? 'bg-[#FF5A1F] text-black border-[#FF5A1F] font-bold shadow-sm'
                : 'bg-[#1A1C20] text-[#A1A1AA] border-[#2C2E34] hover:text-white'
            }`}
            title="Toggle 100% Edge-to-Edge Full View Web Canvas without gutters"
          >
            <Maximize2 className="w-3 h-3" />
            <span>{isFullViewMode ? '100% Full View' : 'Frame View'}</span>
          </button>

          {/* Quick Jump Direct Button for Experience Timeline */}
          <button
            type="button"
            onClick={() => handleJumpToSection('experience')}
            className="px-2.5 py-1 rounded text-[11px] font-mono cursor-pointer flex items-center gap-1.5 bg-[#FF5A1F]/15 hover:bg-[#FF5A1F]/25 text-[#FF5A1F] border border-[#FF5A1F]/40 font-semibold transition-colors shrink-0 shadow-xs"
            title="Jump directly to Career Experience Timeline section"
          >
            <Briefcase className="w-3 h-3" />
            <span>Jump to: Experience Timeline</span>
          </button>

          {/* Section Jump Dropdown */}
          <select
            value={blueprintSection}
            onChange={(e) => {
              const sec = e.target.value;
              if (sec) handleJumpToSection(sec);
            }}
            className="bg-[#1A1C20] border border-[#2C2E34] text-[#F4F4F5] text-[11px] font-mono rounded px-2.5 py-1 focus:outline-none focus:border-[#FF5A1F] cursor-pointer shrink-0"
          >
            {sectionsList.map(s => (
              <option key={s.id} value={s.id}>
                Jump to: {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Device switch & Fullscreen */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#1A1C20] p-0.5 rounded border border-[#2C2E34]">
            <button
              onClick={() => {
                setPreviewDevice('desktop');
                setIsFullViewMode(true);
              }}
              className={`p-1 rounded text-xs transition-colors ${previewDevice === 'desktop' && isFullViewMode ? 'bg-[#25272D] text-white' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}
              title="Desktop 100% Full View"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setPreviewDevice('tablet');
                setIsFullViewMode(false);
              }}
              className={`p-1 rounded text-xs transition-colors ${previewDevice === 'tablet' ? 'bg-[#25272D] text-white' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}
              title="Tablet (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setPreviewDevice('mobile');
                setIsFullViewMode(false);
              }}
              className={`p-1 rounded text-xs transition-colors ${previewDevice === 'mobile' ? 'bg-[#25272D] text-white' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}
              title="Mobile (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 rounded text-[#71717A] hover:text-white hover:bg-[#202126] transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Canvas'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div
        ref={scrollContainerRef}
        data-lenis-prevent="true"
        className={`flex-1 overflow-y-auto bg-[#0C0D0F] flex flex-col items-center justify-start min-h-0 overscroll-contain touch-auto ${
          isFullViewMode ? 'p-0 w-full' : 'p-4 sm:p-6'
        }`}
      >
        <div
          className={`${
            isFullViewMode ? 'w-full border-0 rounded-none shadow-none' : `${getDeviceWidth()} border border-[#2C2E34] rounded-xl shadow-2xl`
          } transition-all duration-300 overflow-hidden bg-[#060606] relative min-h-full`}
        >
          
          {/* Top Frame Status Bar */}
          <div className="h-7 bg-[#141518] border-b border-[#2C2E34] px-3 flex items-center justify-between text-[10px] text-[#71717A] font-mono shrink-0">
            <span className="flex items-center gap-1.5 text-[#A1A1AA]">
              <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
              {editorMode === 'full-web'
                ? 'ACCURATE WEB CANVAS — DOUBLE CLICK ANY TEXT TO EDIT INLINE'
                : `SECTION BLUEPRINT: ${blueprintSection.toUpperCase()}`}
            </span>
            <div className="flex items-center gap-3">
              {selectedElement && (
                <span className="text-cyan-400 font-medium">
                  Selected: {selectedElement.label}
                </span>
              )}
              <span>{isFullViewMode ? '100% ACCURATE WEB VIEW' : `${previewDevice.toUpperCase()} PREVIEW`}</span>
            </div>
          </div>

          {/* MODE 1: EXACT FULL WEBSITE EMBEDDED IN CANVAS */}
          {editorMode === 'full-web' && (
            <div
              ref={canvasFrameRef}
              className="relative w-full min-h-screen text-[#E0E0E0] font-sans antialiased selection:bg-[#FF5A1F] selection:text-black overflow-x-hidden"
              onClickCapture={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest('a')) {
                  e.preventDefault();
                }

                const editableEl = target.closest('[data-editable-id]') as HTMLElement;
                if (editableEl) {
                  const elId = editableEl.getAttribute('data-editable-id');
                  if (elId) {
                    selectElement(elId);
                    return;
                  }
                }

                // If user clicked any element without data-editable-id: div, p, span, h*, button, a, img, etc.
                const tagName = target.tagName.toLowerCase();
                const closestSection = (target.closest('section') as HTMLElement) || (target.closest('footer') as HTMLElement);
                const secId = closestSection?.id || 'general';

                if (tagName === 'img') {
                  if (secId === 'home' || secId === 'hero') {
                    selectElement('hero-model-image');
                    return;
                  }
                  if (secId === 'about') {
                    selectElement('about-portrait-image');
                    return;
                  }
                }

                // Generate or retrieve persistent dynamic id on the element
                let dynamicId = target.getAttribute('data-dynamic-id');
                if (!dynamicId) {
                  dynamicId = `${secId}-${tagName}-${Math.random().toString(36).substring(2, 7)}`;
                  target.setAttribute('data-dynamic-id', dynamicId);
                  target.setAttribute('data-editable-id', dynamicId);
                }

                const computedStyle = window.getComputedStyle(target);
                const textVal = target.innerText?.trim() || '';

                if (!elements[dynamicId]) {
                  addElement({
                    id: dynamicId,
                    label: `${secId.toUpperCase()} ${tagName.toUpperCase()}: ${textVal ? textVal.slice(0, 24) : 'Div Element'}`,
                    section: secId,
                    type: tagName.startsWith('h') ? 'heading' : (tagName === 'button' || tagName === 'a') ? 'button' : tagName === 'img' ? 'image' : 'text',
                    content: { text: textVal },
                    typography: {
                      fontSize: computedStyle.fontSize,
                      fontWeight: computedStyle.fontWeight,
                      textColor: computedStyle.color,
                      fontFamily: computedStyle.fontFamily,
                      lineHeight: computedStyle.lineHeight !== 'normal' ? computedStyle.lineHeight : undefined,
                      letterSpacing: computedStyle.letterSpacing !== 'normal' ? computedStyle.letterSpacing : undefined,
                    },
                    appearance: {
                      backgroundColor: computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' ? computedStyle.backgroundColor : undefined,
                      borderRadius: computedStyle.borderRadius !== '0px' ? computedStyle.borderRadius : undefined,
                      opacity: computedStyle.opacity ? parseFloat(computedStyle.opacity) : 1,
                    },
                    dimensions: {
                      width: `${target.offsetWidth}px`,
                      height: `${target.offsetHeight}px`,
                    },
                    visible: true,
                    isCustom: true,
                  });
                }
                selectElement(dynamicId);
              }}
            >
              {/* CLEAN SELECTION INDICATOR OVER SELECTED ELEMENT FOR TEXT EDITING */}
              {targetBox && selectedElement && (
                <div
                  style={{
                    position: 'absolute',
                    top: `${targetBox.top}px`,
                    left: `${targetBox.left}px`,
                    width: `${targetBox.width}px`,
                    height: `${targetBox.height}px`,
                    pointerEvents: 'none',
                    zIndex: 50,
                  }}
                  className="ring-2 ring-cyan-400/80 rounded-sm transition-all duration-75"
                >
                  {/* Top Floating Text Editing Label */}
                  <div
                    className="absolute -top-7 left-0 bg-[#17181B] border border-cyan-500/80 text-white rounded px-2 py-0.5 text-[10px] font-mono flex items-center gap-1.5 shadow-xl select-none"
                  >
                    <Edit3 className="w-3 h-3 text-cyan-400" />
                    <span className="font-bold text-cyan-300 uppercase">{selectedElement.type}</span>
                    <span className="text-[#A1A1AA] truncate max-w-[120px]">{selectedElement.label}</span>
                  </div>
                </div>
              )}



              {/* URL Input Dropdown Popover */}
              {showUrlInput && selectedElement && (
                <div className="fixed top-28 right-82 z-40 bg-[#17181B] border border-[#2C2E34] shadow-2xl rounded-lg p-3 text-xs w-80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-white text-[11px] font-bold">Paste Image URL</span>
                    <button onClick={() => setShowUrlInput(false)} className="text-[#71717A] hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    className="w-full bg-[#111214] border border-[#2C2E34] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF5A1F]"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => {
                        if (customImageUrl.trim()) {
                          updateElementContent(selectedElement.id, { imageUrl: customImageUrl.trim() });
                          setShowUrlInput(false);
                          setCustomImageUrl('');
                        }
                      }}
                      className="bg-[#FF5A1F] text-black font-bold px-3 py-1 rounded text-xs cursor-pointer"
                    >
                      Apply Photo
                    </button>
                  </div>

                  {/* Preset Suggestions */}
                  {PHOTO_PRESETS[selectedElement.id] && (
                    <div className="pt-2 border-t border-[#2C2E34]">
                      <span className="text-[10px] text-[#71717A] font-mono uppercase block mb-1.5">
                        Or Pick Preset Photo:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {PHOTO_PRESETS[selectedElement.id].map(preset => (
                          <button
                            key={preset.label}
                            onClick={() => {
                              updateElementContent(selectedElement.id, { imageUrl: preset.url });
                              setShowUrlInput(false);
                            }}
                            className="text-left text-[10px] font-mono p-1 rounded bg-[#202126] hover:bg-[#2A2C33] text-[#A1A1AA] hover:text-white truncate"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Inline Rich Text Edit Modal (Disabled) */}
              {false && showInlineTextModal && selectedElement && (
                <div className="fixed top-28 right-82 z-40 bg-[#17181B] border-2 border-[#FF5A1F] shadow-2xl rounded-xl p-4 text-xs w-[420px] space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-[#2C2E34] pb-2">
                    <span className="font-mono text-white text-xs font-bold flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5 text-[#FF5A1F]" />
                      <span>Rich Inline Text Editor</span>
                    </span>
                    <button onClick={() => setShowInlineTextModal(false)} className="text-[#71717A] hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Text Input Area with Enter Spacing Helper */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] text-[#71717A] uppercase font-mono">
                        Text Content (Press Enter for line break / paragraph spacing)
                      </label>
                      <button
                        type="button"
                        onClick={() => setInlineTextVal(prev => prev + '\n\n')}
                        className="text-[10px] text-[#FF5A1F] hover:underline font-mono cursor-pointer"
                      >
                        + Add Line Break (↵)
                      </button>
                    </div>
                    <textarea
                      rows={5}
                      value={inlineTextVal}
                      onChange={(e) => setInlineTextVal(e.target.value)}
                      placeholder="Type your copy here... Press Enter for paragraph spacing"
                      className="w-full bg-[#111214] border border-[#2C2E34] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#FF5A1F] resize-y whitespace-pre-line"
                    />
                  </div>

                  {/* AI Copy Enhancers & Helpers */}
                  <div>
                    <label className="block text-[10px] text-[#71717A] uppercase font-mono mb-1">
                      Quick Copy Enhancers
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const cleaned = inlineTextVal.trim();
                          setInlineTextVal(cleaned ? `${cleaned} — High impact & precision engineered.` : inlineTextVal);
                        }}
                        className="px-2 py-1 bg-[#111214] hover:bg-[#202126] border border-[#2C2E34] hover:border-[#FF5A1F] text-[10px] font-mono text-[#A1A1AA] hover:text-white rounded cursor-pointer transition-colors"
                      >
                        ✨ Polish
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInlineTextVal(prev => prev.toUpperCase());
                        }}
                        className="px-2 py-1 bg-[#111214] hover:bg-[#202126] border border-[#2C2E34] hover:border-[#FF5A1F] text-[10px] font-mono text-[#A1A1AA] hover:text-white rounded cursor-pointer transition-colors"
                      >
                        🔠 ALL CAPS
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInlineTextVal(prev => prev.replace(/\n\s*\n/g, '\n\n'));
                        }}
                        className="px-2 py-1 bg-[#111214] hover:bg-[#202126] border border-[#2C2E34] hover:border-[#FF5A1F] text-[10px] font-mono text-[#A1A1AA] hover:text-white rounded cursor-pointer transition-colors"
                      >
                        ↵ Clean Paragraph Spacing
                      </button>
                    </div>
                  </div>

                  {/* Quick Customization Options */}
                  <div className="grid grid-cols-2 gap-2 bg-[#111214] p-2.5 rounded-lg border border-[#2C2E34]">
                    <div>
                      <label className="block text-[10px] text-[#71717A] uppercase font-mono mb-1">Font Family</label>
                      <select
                        value={selectedElement.typography?.fontFamily || "'Plus Jakarta Sans', sans-serif"}
                        onChange={(e) => updateElementTypography(selectedElement.id, { fontFamily: e.target.value })}
                        className="w-full bg-[#17181B] border border-[#2C2E34] text-white text-[11px] font-mono rounded px-2 py-1 focus:outline-none focus:border-[#FF5A1F]"
                      >
                        <option value="'Syne', sans-serif">Syne (Display)</option>
                        <option value="'Space Grotesk', sans-serif">Space Grotesk</option>
                        <option value="'Inter', sans-serif">Inter</option>
                        <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans</option>
                        <option value="'Outfit', sans-serif">Outfit</option>
                        <option value="'Playfair Display', serif">Playfair Display</option>
                        <option value="'Fira Code', monospace">Fira Code</option>
                        <option value="'Montserrat', sans-serif">Montserrat</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-[#71717A] uppercase font-mono mb-1">Font Size</label>
                      <input
                        type="text"
                        value={selectedElement.typography?.fontSize || '24px'}
                        onChange={(e) => updateElementTypography(selectedElement.id, { fontSize: e.target.value })}
                        placeholder="24px, 3rem"
                        className="w-full bg-[#17181B] border border-[#2C2E34] text-white text-[11px] font-mono rounded px-2 py-1 focus:outline-none focus:border-[#FF5A1F]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-[#71717A] uppercase font-mono mb-1">Glow Effect</label>
                      <select
                        value={selectedElement.typography?.textShadow || ''}
                        onChange={(e) => updateElementTypography(selectedElement.id, { textShadow: e.target.value })}
                        className="w-full bg-[#17181B] border border-[#2C2E34] text-white text-[11px] font-mono rounded px-2 py-1 focus:outline-none focus:border-[#FF5A1F]"
                      >
                        <option value="">None</option>
                        <option value="0 0 15px rgba(255,90,31,0.7)">Flame Orange Glow</option>
                        <option value="0 0 12px rgba(255,255,255,0.8)">Soft White Glow</option>
                        <option value="0 0 15px rgba(6,182,212,0.8)">Cyber Cyan Glow</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-[#71717A] uppercase font-mono mb-1">Gradient FX</label>
                      <select
                        value={selectedElement.typography?.textGradient || ''}
                        onChange={(e) => updateElementTypography(selectedElement.id, { textGradient: e.target.value })}
                        className="w-full bg-[#17181B] border border-[#2C2E34] text-white text-[11px] font-mono rounded px-2 py-1 focus:outline-none focus:border-[#FF5A1F]"
                      >
                        <option value="">Solid Color</option>
                        <option value="linear-gradient(to right, #FF5A1F, #FF8A00)">Flame Gradient</option>
                        <option value="linear-gradient(to right, #06B6D4, #3B82F6)">Cyber Cyan</option>
                        <option value="linear-gradient(to right, #A855F7, #EC4899)">Neon Purple</option>
                        <option value="linear-gradient(to right, #F59E0B, #FDE047)">Gold Shine</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-[#71717A] font-mono">Tip: Double-click any text directly on canvas</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowInlineTextModal(false)}
                        className="bg-[#202126] text-[#A1A1AA] hover:text-white px-3 py-1.5 rounded-lg text-xs font-mono"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          updateElementContent(selectedElement.id, { text: inlineTextVal });
                          setShowInlineTextModal(false);
                        }}
                        className="bg-[#FF5A1F] hover:bg-[#FF723F] text-black font-bold px-4 py-1.5 rounded-lg text-xs font-mono cursor-pointer shadow-md"
                      >
                        Save Text Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Exact Website Sections */}
              <div className="pointer-events-auto">
                <Hero onSelectProject={() => {}} onOpenResumeModal={() => {}} />
                <Marquee />
                <About onOpenResumeModal={() => {}} />
                <Projects onSelectProject={() => {}} />
                <Services />
                <Process />
                <Skills />
                <Experience />
                <Testimonials />
                <Blog />
                <Gallery onOpenGalleryPage={() => {}} />
                <Stats />
                <FAQ />
                <Contact />
                <Footer setActiveSection={() => {}} />
              </div>
            </div>
          )}

          {/* MODE 2: SECTION BLUEPRINT SCHEMATIC */}
          {editorMode === 'blueprint' && (
            <div className="p-6 sm:p-10 space-y-8 bg-[#141518] min-h-[500px]">
              <div className="flex items-center justify-between border-b border-[#2C2E34] pb-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                    <Layout className="w-4 h-4 text-[#3B82F6]" />
                    <span>Section Blueprint: {blueprintSection.toUpperCase()}</span>
                  </h3>
                  <p className="text-xs text-[#71717A] mt-0.5">
                    Structural schematic of every div, container, text element, and photo in this section.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-[#A1A1AA] bg-[#202126] px-2.5 py-1 rounded border border-[#2C2E34]">
                    Elements registered: {Object.values(elements).filter(e => e.section === blueprintSection).length}
                  </span>
                </div>
              </div>

              {/* Blueprint Elements Tree & Quick Edit Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(elements)
                  .filter(e => e.section === blueprintSection)
                  .map(el => {
                    const isSelected = selectedElementId === el.id;
                    const isElPhoto = el.type === 'image' || el.id.includes('image') || el.id.includes('photo') || el.id.includes('model') || el.id.includes('portrait');

                    return (
                      <div
                        key={el.id}
                        onClick={() => selectElement(el.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                          isSelected
                            ? 'border-[#FF5A1F] bg-[#1C1E24] shadow-lg shadow-[#FF5A1F]/5'
                            : 'border-[#2C2E34] bg-[#18191E] hover:border-[#3E4048]'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#111214] text-[#FF5A1F] border border-[#2C2E34]">
                                {el.type}
                              </span>
                              <span className="text-xs font-bold text-white">{el.label}</span>
                            </div>
                            <p className="text-[11px] text-[#71717A] font-mono">ID: {el.id}</p>
                          </div>

                          {/* Quick alignment icons */}
                          <div className="flex items-center gap-1 bg-[#111214] p-1 rounded border border-[#2C2E34]">
                            <button
                              onClick={(ev) => {
                                ev.stopPropagation();
                                updateElementAlignment(el.id, { textAlign: 'left' });
                              }}
                              className="p-1 text-[#71717A] hover:text-white"
                              title="Align Left"
                            >
                              <AlignLeft className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(ev) => {
                                ev.stopPropagation();
                                updateElementAlignment(el.id, { textAlign: 'center' });
                              }}
                              className="p-1 text-[#71717A] hover:text-white"
                              title="Align Center"
                            >
                              <AlignCenter className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(ev) => {
                                ev.stopPropagation();
                                updateElementAlignment(el.id, { textAlign: 'right' });
                              }}
                              className="p-1 text-[#71717A] hover:text-white"
                              title="Align Right"
                            >
                              <AlignRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Text preview or editable input */}
                        {el.content?.text !== undefined && (
                          <div>
                            <label className="text-[10px] text-[#71717A] font-mono uppercase block mb-1">
                              Text Content
                            </label>
                            <input
                              type="text"
                              value={el.content.text || ''}
                              onChange={(ev) => updateElementContent(el.id, { text: ev.target.value })}
                              className="w-full bg-[#111214] border border-[#2C2E34] rounded px-2.5 py-1 text-xs text-[#F4F4F5] focus:outline-none focus:border-[#FF5A1F]"
                            />
                          </div>
                        )}

                        {/* Position / Spacing details */}
                        <div className="flex items-center justify-between text-[10px] font-mono text-[#71717A] bg-[#111214] px-2 py-1 rounded">
                          <span>Transform: X:{el.spacing?.transformX || 0}px Y:{el.spacing?.transformY || 0}px</span>
                          <span>Size: {el.dimensions?.width || 'auto'} x {el.dimensions?.height || 'auto'}</span>
                        </div>

                        {/* Image replacement preview if photo element */}
                        {isElPhoto && (
                          <div className="pt-2 border-t border-[#2C2E34] flex items-center justify-between">
                            <span className="text-[11px] text-[#A1A1AA]">Replace photo:</span>
                            <label className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#25272D] hover:bg-[#32353D] text-xs font-mono text-[#FF5A1F] cursor-pointer">
                              <Upload className="w-3 h-3" />
                              <span>{uploadingImage ? 'Uploading...' : 'Upload New Photo'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(ev) => handlePhotoUpload(ev, el.id)}
                                className="hidden"
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
