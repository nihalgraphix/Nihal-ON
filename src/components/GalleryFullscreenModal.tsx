import React, { useState, useEffect } from 'react';
import { GalleryItem } from '../types';
import { X, Search, Sparkles, Maximize2, Heart, Download } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { GALLERY_ITEMS } from '../data/portfolioData';

interface GalleryFullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GalleryFullscreenModal({ isOpen, onClose }: GalleryFullscreenModalProps) {
  const { publishedData } = useStudio();
  const galleryItems = publishedData?.galleryItems && publishedData.galleryItems.length > 0 
    ? publishedData.galleryItems 
    : GALLERY_ITEMS;

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  // Gallery Likes
  const [likesMap, setLikesMap] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem('nihal_gallery_likes') || '{}');
    } catch {
      return {};
    }
  });

  useEffect(() => {
    fetch('/api/gallery/likes')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.likes) {
          setLikesMap(prev => ({ ...prev, ...data.likes }));
        }
      })
      .catch(() => {});
  }, []);

  const handleLike = async (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    setLikesMap(prev => {
      const current = prev[itemId] || 0;
      const updated = { ...prev, [itemId]: current + 1 };
      localStorage.setItem('nihal_gallery_likes', JSON.stringify(updated));
      return updated;
    });

    try {
      await fetch(`/api/gallery/${itemId}/like`, { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxItem) setLightboxItem(null);
        else onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, lightboxItem, onClose]);

  if (!isOpen) return null;

  const categories = ['All', 'Photography', 'Branding', 'UI', 'Motion', 'Concepts'];

  const filtered = galleryItems.filter(item => {
    const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-[9990] bg-[#060608]/98 backdrop-blur-2xl text-white flex flex-col overflow-hidden animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <div className="h-20 px-6 sm:px-10 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#0A0A0E]/80 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#FF5A1F] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F] animate-pulse" />
            <span>Complete Visual Archive</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-syne tracking-tight text-white mt-0.5">
            Gallery Showcase
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search archive..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-full pl-8 pr-4 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF5A1F] w-48 font-mono"
            />
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#FF5A1F] hover:text-black border border-white/15 flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
            title="Close Gallery (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="px-6 sm:px-10 py-3 border-b border-white/5 bg-[#08080C] flex items-center justify-between overflow-x-auto shrink-0 gap-4">
        <div className="flex items-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-tight transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#FF5A1F] text-black font-bold shadow-md shadow-[#FF5A1F]/20'
                  : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <span className="text-xs font-mono text-neutral-500 hidden sm:inline">
          {filtered.length} Works Displayed
        </span>
      </div>

      {/* Main Full-Space Gallery Grid */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-10">
        <div className="max-w-[1600px] mx-auto">
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-5 space-y-5">
            {filtered.map((item, idx) => (
              <div
                key={item.id || idx}
                onClick={() => setLightboxItem(item)}
                className="group relative rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 break-inside-avoid cursor-pointer shadow-2xl transition-all duration-300 hover:border-[#FF5A1F]/60 hover:-translate-y-1"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                  <span className="text-[10px] font-mono uppercase text-[#FF5A1F] font-bold tracking-wider mb-1">
                    {item.category}
                  </span>
                  <h4 className="text-sm font-bold font-syne text-white leading-tight">
                    {item.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono mt-2 pt-2 border-t border-white/15">
                    <button
                      onClick={(e) => handleLike(e, item.id)}
                      className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 hover:bg-[#FF5A1F] text-[#FF5A1F] hover:text-black border border-white/10 transition-colors cursor-pointer active:scale-95"
                      title="Like this photo"
                    >
                      <Heart className="w-3 h-3 fill-current" />
                      <span>{(item.likes || 0) + (likesMap[item.id] || 0)}</span>
                    </button>
                    <span className="flex items-center gap-1 text-white">
                      <Maximize2 className="w-3 h-3 text-[#FF5A1F]" />
                      <span>View</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxItem && (
        <div
          onClick={() => setLightboxItem(null)}
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-10"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl max-h-[90vh] bg-[#121216] border border-white/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          >
            <button
              onClick={() => setLightboxItem(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/70 hover:bg-[#FF5A1F] text-white hover:text-black flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <img
              src={lightboxItem.image}
              alt={lightboxItem.title}
              className="max-h-[75vh] w-auto object-contain mx-auto"
            />

            <div className="p-4 sm:p-6 bg-[#0E0E12] border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#FF5A1F] font-mono uppercase font-bold">
                  {lightboxItem.category}
                </span>
                <h3 className="text-base sm:text-lg font-bold font-syne text-white">
                  {lightboxItem.title}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => handleLike(e, lightboxItem.id)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5A1F]/20 hover:bg-[#FF5A1F] text-[#FF5A1F] hover:text-black border border-[#FF5A1F]/30 transition-colors cursor-pointer text-xs font-mono"
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>{(lightboxItem.likes || 0) + (likesMap[lightboxItem.id] || 0)}</span>
                </button>
                <span className="text-xs text-neutral-400 font-mono">
                  {lightboxItem.date}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
