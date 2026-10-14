import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { Layers, Eye, EyeOff, ChevronRight, ChevronDown, Hash, Type, Square, Layout, Search, Sparkles } from 'lucide-react';

export default function LayersPanel() {
  const { draftData, selectedElementId, selectElement, updateElement } = useStudio();
  const [search, setSearch] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSectionCollapse = (id: string) => {
    setCollapsedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Pre-configured essential sections and their constituent editable element nodes
  const sections = [
    {
      id: 'hero',
      name: 'Hero Section',
      defaultElements: [
        { id: 'hero-status-tag', label: 'Availability Badge', type: 'text' },
        { id: 'hero-headline', label: 'Hero Main Headline', type: 'heading' },
        { id: 'hero-subhead', label: 'Hero Subtitle Paragraph', type: 'text' },
        { id: 'hero-portrait-image', label: 'Hero Portrait Photo', type: 'image' },
        { id: 'hero-cta-primary', label: 'Primary CTA Button', type: 'button' },
      ],
    },
    {
      id: 'growth',
      name: 'Growth & Brands Marquee',
      defaultElements: [
        { id: 'marquee-quote', label: 'Client Testimonial Quote', type: 'text' },
        { id: 'marquee-brands-title', label: 'Trusted By Heading', type: 'heading' },
      ],
    },
    {
      id: 'about',
      name: 'About Section',
      defaultElements: [
        { id: 'about-tag', label: 'About Tagline', type: 'text' },
        { id: 'about-heading', label: 'About Main Heading', type: 'heading' },
        { id: 'about-bio', label: 'Biography Paragraph', type: 'text' },
      ],
    },
    {
      id: 'experience',
      name: 'Experience & Credentials',
      defaultElements: [
        { id: 'experience-tag', label: 'Experience Tag', type: 'text' },
        { id: 'experience-title', label: 'Experience Section Title', type: 'heading' },
      ],
    },
    {
      id: 'projects',
      name: 'Selected Projects',
      defaultElements: [
        { id: 'projects-tag', label: 'Projects Tag', type: 'text' },
        { id: 'projects-heading', label: 'Projects Heading', type: 'heading' },
        { id: 'projects-subhead', label: 'Projects Subtitle', type: 'text' },
      ],
    },
    {
      id: 'services',
      name: 'Services & Capabilities',
      defaultElements: [
        { id: 'services-tag', label: 'Services Tag', type: 'text' },
        { id: 'services-heading-title', label: 'Services Heading Title', type: 'heading' },
        { id: 'services-heading-desc', label: 'Services Description', type: 'text' },
      ],
    },
    {
      id: 'skills',
      name: 'Technical Proficiency',
      defaultElements: [
        { id: 'skills-tag', label: 'Skills Tag', type: 'text' },
        { id: 'skills-title', label: 'Skills Main Title', type: 'heading' },
      ],
    },
    {
      id: 'blog',
      name: 'Blog & Editorial Journal',
      defaultElements: [
        { id: 'blog-tag', label: 'Editorial Journal Tag', type: 'text' },
        { id: 'blog-title', label: 'Journal Title', type: 'heading' },
      ],
    },
    {
      id: 'gallery',
      name: 'Gallery & Visual Archive',
      defaultElements: [
        { id: 'gallery-tag', label: 'Archive Tag', type: 'text' },
        { id: 'gallery-title', label: 'Gallery Heading', type: 'heading' },
      ],
    },
    {
      id: 'contact',
      name: 'Contact & Inquiries',
      defaultElements: [
        { id: 'contact-tag', label: 'Contact Tag', type: 'text' },
        { id: 'contact-title', label: 'Contact Heading', type: 'heading' },
        { id: 'contact-subtitle', label: 'Contact Subtitle', type: 'text' },
      ],
    },
    {
      id: 'footer',
      name: 'Footer & Credits',
      defaultElements: [
        { id: 'footer-headline', label: 'Footer CTA Headline', type: 'heading' },
        { id: 'footer-copyright', label: 'Copyright Notice', type: 'text' },
      ],
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'heading':
      case 'text':
        return <Type className="w-3.5 h-3.5 text-[#A1A1AA]" />;
      case 'button':
        return <Square className="w-3.5 h-3.5 text-[#FF5A1F]" />;
      case 'image':
        return <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />;
      case 'section':
      case 'container':
        return <Layout className="w-3.5 h-3.5 text-[#3B82F6]" />;
      default:
        return <Hash className="w-3.5 h-3.5 text-[#71717A]" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#17181B] border-r border-[#2C2E34] select-none text-xs">
      {/* Header & Filter */}
      <div className="p-3 border-b border-[#2C2E34] space-y-2">
        <div className="flex items-center justify-between font-mono uppercase text-[10px] font-bold text-[#71717A]">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#FF5A1F]" />
            <span>Page Hierarchy</span>
          </div>
          <span className="text-[9px] bg-[#202126] text-[#A1A1AA] px-1.5 py-0.5 rounded border border-[#2C2E34]">
            {sections.length} Sections
          </span>
        </div>

        <div className="relative">
          <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
          <input
            type="text"
            placeholder="Search layers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111214] border border-[#2C2E34] rounded pl-7 pr-2 py-1 text-[11px] text-white focus:outline-none focus:border-[#FF5A1F]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {sections.map(sec => {
          // Find custom elements from StudioContext draftData matching this section
          const elementsFromState = Object.values(draftData.elements || {}).filter(
            el => el.section === sec.id
          );

          // Merge default elements and state elements
          const combinedElementsMap = new Map<string, { id: string; label: string; type: string; visible?: boolean }>();

          sec.defaultElements.forEach(item => {
            const stateEl = draftData.elements?.[item.id];
            combinedElementsMap.set(item.id, {
              id: item.id,
              label: stateEl?.label || item.label,
              type: stateEl?.type || item.type,
              visible: stateEl?.visible,
            });
          });

          elementsFromState.forEach(el => {
            combinedElementsMap.set(el.id, {
              id: el.id,
              label: el.label || el.id,
              type: el.type || 'text',
              visible: el.visible,
            });
          });

          let elementsList = Array.from(combinedElementsMap.values());

          if (search.trim()) {
            elementsList = elementsList.filter(
              item => item.label.toLowerCase().includes(search.toLowerCase()) || item.id.toLowerCase().includes(search.toLowerCase())
            );
            if (elementsList.length === 0 && !sec.name.toLowerCase().includes(search.toLowerCase())) {
              return null;
            }
          }

          const isCollapsed = collapsedSections[sec.id] || false;

          return (
            <div key={sec.id} className="space-y-1 bg-[#111214]/50 rounded-lg p-1.5 border border-[#2C2E34]/50">
              <div
                onClick={() => toggleSectionCollapse(sec.id)}
                className="text-[11px] font-bold text-[#F4F4F5] px-1.5 py-1 flex items-center justify-between uppercase font-mono tracking-wider cursor-pointer hover:text-[#FF5A1F] transition-colors"
              >
                <div className="flex items-center gap-1.5 truncate">
                  {isCollapsed ? <ChevronRight className="w-3 h-3 text-[#71717A]" /> : <ChevronDown className="w-3 h-3 text-[#FF5A1F]" />}
                  <span className="truncate">{sec.name}</span>
                </div>
                <span className="text-[9px] text-[#71717A] font-mono">({elementsList.length})</span>
              </div>

              {!isCollapsed && (
                <div className="pl-2 space-y-0.5 pt-0.5">
                  {elementsList.map(el => {
                    const isSelected = selectedElementId === el.id;
                    const isVisible = el.visible !== false;

                    return (
                      <div
                        key={el.id}
                        onClick={() => selectElement(el.id)}
                        className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer transition-colors text-[11px] ${
                          isSelected
                            ? 'bg-[#FF5A1F]/20 text-white border border-[#FF5A1F] font-semibold'
                            : 'text-[#A1A1AA] hover:bg-[#1F2025] hover:text-[#F4F4F5]'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {getIcon(el.type)}
                          <span className="truncate">{el.label}</span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateElement(el.id, { visible: !isVisible });
                          }}
                          className="text-[#71717A] hover:text-white p-0.5 transition-colors"
                          title={isVisible ? 'Hide on page' : 'Show on page'}
                        >
                          {isVisible ? <Eye className="w-3 h-3 text-[#71717A]" /> : <EyeOff className="w-3 h-3 text-[#EF4444]" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
