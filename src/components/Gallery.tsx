import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GALLERY_ITEMS, PERSONAL_INFO } from '../data/portfolioData';
import { GalleryItem } from '../types';
import { ChevronLeft, ChevronRight, ArrowUpRight, Maximize2, Heart, X, Sparkles } from 'lucide-react';
import { useStudio } from '../context/StudioContext';

interface GalleryProps {
  onOpenGalleryPage?: () => void;
}

export default function Gallery({ onOpenGalleryPage }: GalleryProps = {}) {
  const { publishedData } = useStudio();
  const currentGalleryItems = publishedData?.galleryItems || [];
  const elements = publishedData?.elements || {};
  const galleryHeadingEl = elements['gallery-heading'];

  const [activeIndex, setActiveIndex] = useState<number>(1);
  const [showAllGrid, setShowAllGrid] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  // Real-time Gallery Likes
  const [likesMap, setLikesMap] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem('nihal_gallery_likes') || '{}');
    } catch {
      return {};
    }
  });

  // Single-like tracking for gallery images
  const [userLikedItems, setUserLikedItems] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('nihal_gallery_user_liked') || '[]');
    } catch {
      return [];
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

    // Restrict: user can only like one time
    if (userLikedItems.includes(itemId)) {
      return;
    }

    const updatedUserLiked = [...userLikedItems, itemId];
    setUserLikedItems(updatedUserLiked);
    localStorage.setItem('nihal_gallery_user_liked', JSON.stringify(updatedUserLiked));

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

  const categories = ['All', 'Photography', 'Concepts', 'Motion', 'Branding', 'UI'];

  const filteredItems = selectedCategory === 'All'
    ? currentGalleryItems
    : currentGalleryItems.filter(item => item.category === selectedCategory);

  const totalItems = currentGalleryItems.length;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + totalItems) % totalItems);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % totalItems);
  };

  return (
    <section id="gallery" className="relative py-28 bg-[#050505] overflow-hidden selection:bg-[#FF5A1F] selection:text-black">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-[#FF5A1F]/5 blur-[180px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-14 space-y-3"
        >
          <div className="inline-flex items-center gap-2 text-xs font-space uppercase tracking-widest text-[#FF5A1F] px-3.5 py-1.5 rounded-full bg-[#FF5A1F]/10 border border-[#FF5A1F]/20">
            <Sparkles className="h-3.5 w-3.5 text-[#FF5A1F]" />
            <span>Visual Archive & Showcase</span>
          </div>
          <h2 className="font-syne text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Photography & Creative Showcase
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 font-sans max-w-xl mx-auto">
            Selected and popular creative posts, spatial visual concepts, and art direction highlights.
          </p>
        </motion.div>

        {/* 3D Cover Flow Perspective Carousel */}
        {currentGalleryItems.length === 0 ? (
          <div className="w-full py-16 px-6 text-center rounded-3xl bg-[#0b0b0e] border border-white/10 flex flex-col items-center justify-center space-y-3 my-4 min-h-[260px]">
            <Sparkles className="w-10 h-10 text-[#FF5A1F]/60" />
            <h3 className="font-syne text-xl font-bold text-white">Gallery Archive Empty</h3>
            <p className="text-xs text-neutral-400 max-w-md font-sans">
              Photos uploaded and published through the Admin Gallery Studio will automatically display here.
            </p>
          </div>
        ) : (
          <div className="relative w-full h-[420px] sm:h-[500px] flex items-center justify-center [perspective:1200px] select-none my-4">
            <div className="relative w-full h-full flex items-center justify-center">
            {currentGalleryItems.map((item, index) => {
              // Calculate relative offset around active index
              let diff = index - activeIndex;
              if (diff < -Math.floor(totalItems / 2)) diff += totalItems;
              if (diff > Math.floor(totalItems / 2)) diff -= totalItems;

              const absDiff = Math.abs(diff);

              // Position calculations for 3D layout
              let translateX = 0;
              let rotateY = 0;
              let scale = 1;
              let zIndex = 0;
              let opacity = 0;
              let brightness = 1;

              if (diff === 0) {
                translateX = 0;
                rotateY = 0;
                scale = 1;
                zIndex = 30;
                opacity = 1;
                brightness = 1;
              } else if (diff === -1) {
                translateX = -250;
                rotateY = 28;
                scale = 0.82;
                zIndex = 20;
                opacity = 0.85;
                brightness = 0.75;
              } else if (diff === 1) {
                translateX = 250;
                rotateY = -28;
                scale = 0.82;
                zIndex = 20;
                opacity = 0.85;
                brightness = 0.75;
              } else if (diff === -2) {
                translateX = -430;
                rotateY = 45;
                scale = 0.65;
                zIndex = 10;
                opacity = 0.45;
                brightness = 0.5;
              } else if (diff === 2) {
                translateX = 430;
                rotateY = -45;
                scale = 0.65;
                zIndex = 10;
                opacity = 0.45;
                brightness = 0.5;
              } else {
                opacity = 0;
                translateX = diff < 0 ? -600 : 600;
                scale = 0.5;
              }

              return (
                <motion.div
                  key={item.id}
                  onClick={() => {
                    if (diff !== 0) setActiveIndex(index);
                    else setLightboxItem(item);
                  }}
                  animate={{
                    x: translateX,
                    rotateY: rotateY,
                    scale: scale,
                    opacity: opacity,
                    zIndex: zIndex,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 26,
                  }}
                  style={{
                    filter: `brightness(${brightness})`,
                    transformStyle: 'preserve-3d',
                  }}
                  className={`absolute w-[260px] sm:w-[320px] lg:w-[360px] h-[360px] sm:h-[440px] rounded-[28px] sm:rounded-[36px] overflow-hidden cursor-pointer border border-white/15 bg-[#111113] shadow-2xl shadow-black/80 group ${
                    diff === 0 ? 'ring-2 ring-[#FF5A1F]/50' : ''
                  }`}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Dark Vignette Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

                  {/* Top Badge */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                    <span className="rounded-full bg-[#000000]/70 backdrop-blur-md px-3 py-1 text-[10px] font-space font-bold text-[#FF5A1F] border border-white/10">
                      {item.category}
                    </span>
                  </div>

                  {/* Title Overlay in Middle/Bottom matching screenshot */}
                  <div className="absolute bottom-6 left-6 right-6 z-10 space-y-2">
                    <h3 className="font-syne font-extrabold text-lg sm:text-2xl text-white leading-tight drop-shadow-md group-hover:text-[#FF5A1F] transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px] font-space text-neutral-400">
                      <span>{item.date} Archive</span>
                      <button
                        onClick={(e) => handleLike(e, item.id)}
                        className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-[#FF5A1F] text-[#FF5A1F] hover:text-black transition-all cursor-pointer border border-white/10 active:scale-95 group/like"
                        title="Like this photo"
                      >
                        <Heart className="h-3 w-3 fill-current group-hover/like:scale-125 transition-transform" />
                        <span className="font-bold">{(item.likes || 0) + (likesMap[item.id] || 0)}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

        {/* Sliding Buttons in Middle */}
        <div className="flex flex-col items-center justify-center gap-5 mt-4 z-30 relative">
          <div className="flex items-center justify-center gap-4">
            {/* Left Button */}
            <button
              onClick={handlePrev}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-[#111114] text-white hover:border-[#FF5A1F] hover:bg-[#FF5A1F] hover:text-black transition-all shadow-xl active:scale-90 cursor-pointer group"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6 text-neutral-300 group-hover:text-black transition-colors" />
            </button>

            {/* Active dots/slide indicator */}
            <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#111114]/90 border border-white/15 backdrop-blur-xl shadow-inner">
              {GALLERY_ITEMS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    activeIndex === idx
                      ? 'w-8 bg-[#FF5A1F] shadow-md shadow-[#FF5A1F]/50'
                      : 'w-2.5 bg-neutral-600 hover:bg-neutral-400'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Right Button */}
            <button
              onClick={handleNext}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-[#111114] text-white hover:border-[#FF5A1F] hover:bg-[#FF5A1F] hover:text-black transition-all shadow-xl active:scale-90 cursor-pointer group"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6 text-neutral-300 group-hover:text-black transition-colors" />
            </button>
          </div>

          {/* "See More" Button Below Sliding Button */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (onOpenGalleryPage) {
                  onOpenGalleryPage();
                  window.scrollTo({ top: 0, behavior: 'instant' });
                } else {
                  setShowAllGrid(!showAllGrid);
                }
              }}
              className="group flex items-center gap-2.5 rounded-full border border-white/25 bg-[#16161a] px-9 py-4 text-xs font-syne font-bold uppercase tracking-wider text-white hover:border-[#FF5A1F] hover:bg-[#FF5A1F] hover:text-black transition-all duration-300 shadow-2xl active:scale-95 cursor-pointer"
            >
              <span>See More</span>
              <ArrowUpRight className="h-4 w-4 text-[#FF5A1F] group-hover:text-black transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>

        {/* Expandable Grid Section when "See More" is Clicked */}
        <AnimatePresence>
          {showAllGrid && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-16 pt-12 border-t border-white/10 space-y-8"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h3 className="font-syne text-2xl font-bold text-white">Full Creative Archive</h3>

                {/* Category Filters */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full text-xs font-space font-semibold transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-[#FF5A1F] text-black shadow-lg shadow-[#FF5A1F]/30'
                          : 'bg-[#111111] text-neutral-400 hover:text-white border border-white/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setLightboxItem(item)}
                    className="group cursor-pointer relative rounded-3xl overflow-hidden glass-card border border-white/10 bg-[#111111] transition-all hover:border-[#FF5A1F]/50"
                  >
                    <div className="w-full aspect-[3/4] overflow-hidden relative">
                      <img
                        src={item.image}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 filter saturate-[1.05]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                        <div>
                          <h4 className="font-syne font-bold text-sm text-white">{item.title}</h4>
                          <span className="text-[10px] font-space text-[#FF5A1F]">{item.category}</span>
                        </div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF5A1F] text-black shadow-lg">
                          <Maximize2 className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-2xl"
          >
            <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
              <button
                onClick={() => setLightboxItem(null)}
                className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-[#FF5A1F] hover:text-black transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="rounded-3xl overflow-hidden border border-white/20 max-h-[80vh] w-full flex items-center justify-center bg-[#111111]">
                <img
                  src={lightboxItem.image}
                  alt={lightboxItem.title}
                  referrerPolicy="no-referrer"
                  className="max-h-[80vh] max-w-full object-contain"
                />
              </div>

              <div className="mt-4 flex items-center justify-between w-full max-w-2xl px-4 text-white">
                <div>
                  <h3 className="font-syne font-bold text-lg">{lightboxItem.title}</h3>
                  <span className="text-xs font-space text-[#FF5A1F]">{lightboxItem.category} // {lightboxItem.date}</span>
                </div>
                <button
                  onClick={(e) => handleLike(e, lightboxItem.id)}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-[#FF5A1F] text-[#FF5A1F] hover:text-black transition-all cursor-pointer border border-white/10 active:scale-95 group/like text-xs font-space"
                  title="Like this photo"
                >
                  <Heart className="h-4 w-4 fill-current group-hover/like:scale-125 transition-transform" />
                  <span>{(lightboxItem.likes || 0) + (likesMap[lightboxItem.id] || 0)} appreciations</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
