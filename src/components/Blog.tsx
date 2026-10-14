import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BLOG_POSTS, PERSONAL_INFO } from '../data/portfolioData';
import { BlogPost } from '../types';
import { 
  ArrowUpRight, 
  Clock, 
  X, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  User,
  Heart,
  Share2,
  MessageSquare,
  Check,
  Send,
  Copy,
  Twitter,
  Linkedin
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';

export default function Blog() {
  const { publishedData } = useStudio();
  const currentBlogPosts = publishedData?.blogPosts || [];
  const elements = publishedData?.elements || {};
  const blogHeadingEl = elements['blog-heading'];

  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const scrollRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Likes state
  const [likesMap, setLikesMap] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem('nihal_blog_likes') || '{}');
    } catch {
      return {};
    }
  });

  // Comments state
  const [commentsMap, setCommentsMap] = useState<Record<string, any[]>>({});
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  // Track articles liked by this user
  const [userLikedPosts, setUserLikedPosts] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('nihal_blog_user_liked') || '[]');
    } catch {
      return [];
    }
  });

  // Lock body scroll when blog post modal is open
  useEffect(() => {
    if (selectedPost) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedPost]);

  useEffect(() => {
    fetch('/api/blog/likes')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.likes) {
          setLikesMap(prev => ({ ...prev, ...data.likes }));
        }
      })
      .catch(() => {});
  }, []);

  const handleLikePost = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();

    const isAlreadyLiked = userLikedPosts.includes(postId);

    if (isAlreadyLiked) {
      // Toggle off / unlike: user clicked like twice, so like disappears
      const updatedUserLiked = userLikedPosts.filter(id => id !== postId);
      setUserLikedPosts(updatedUserLiked);
      localStorage.setItem('nihal_blog_user_liked', JSON.stringify(updatedUserLiked));

      setLikesMap(prev => {
        const current = prev[postId] || 0;
        const updated = { ...prev, [postId]: Math.max(0, current - 1) };
        localStorage.setItem('nihal_blog_likes', JSON.stringify(updated));
        return updated;
      });

      try {
        await fetch(`/api/blog/${postId}/unlike`, { method: 'POST' });
      } catch (err) {
        console.error(err);
      }
    } else {
      // First click: add like
      const updatedUserLiked = [...userLikedPosts, postId];
      setUserLikedPosts(updatedUserLiked);
      localStorage.setItem('nihal_blog_user_liked', JSON.stringify(updatedUserLiked));

      setLikesMap(prev => {
        const current = prev[postId] || 0;
        const updated = { ...prev, [postId]: current + 1 };
        localStorage.setItem('nihal_blog_likes', JSON.stringify(updated));
        return updated;
      });

      try {
        await fetch(`/api/blog/${postId}/like`, { method: 'POST' });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const loadComments = (postId: string) => {
    fetch(`/api/blog/${postId}/comments`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.comments) {
          setCommentsMap(prev => ({ ...prev, [postId]: data.comments }));
        }
      })
      .catch(() => {});
  };

  const handleSelectPost = (post: BlogPost) => {
    setSelectedPost(post);
    loadComments(post.id);
  };

  const handleAddComment = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);

    try {
      const res = await fetch(`/api/blog/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: commentName || 'Creative Technologist',
          text: commentText.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.comment) {
        setCommentsMap(prev => ({
          ...prev,
          [postId]: [data.comment, ...(prev[postId] || [])],
        }));
        setCommentText('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = async (post: BlogPost) => {
    const shareData = {
      title: post.title,
      text: post.excerpt,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {}
    }
    navigator.clipboard?.writeText(window.location.href);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2400);
  };

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Mouse drag-to-scroll support
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const scrollStartX = useRef(0);
  const hasDragged = useRef(false);

  const tags = ['All', 'UI/UX', 'Dark Mode', 'React 19', 'GSAP', 'AI', 'Full-Stack'];

  const filteredPosts = selectedTag === 'All'
    ? currentBlogPosts
    : currentBlogPosts.filter(p => (p.tags || []).includes(selectedTag));

  // Update scroll metrics: button disabled state, active index, and progress
  const updateScrollMetrics = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const maxScroll = Math.max(0, scrollWidth - clientWidth);

    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft < maxScroll - 8);

    const progress = maxScroll > 0 ? scrollLeft / maxScroll : 0;
    setScrollProgress(progress);

    // Calculate active slide index
    const firstCard = container.querySelector('[data-blog-card]') as HTMLElement;
    const step = firstCard ? firstCard.offsetWidth + 24 : 420;
    const index = Math.round(scrollLeft / step);
    setActiveSlideIndex(Math.min(Math.max(0, index), filteredPosts.length - 1));
  }, [filteredPosts.length]);

  // Refined smooth slide animation with cubic-bezier easing
  const smoothScrollToTarget = useCallback((targetScrollLeft: number, duration = 520) => {
    const container = scrollRef.current;
    if (!container) return;

    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
    }

    const start = container.scrollLeft;
    const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth);
    const clampedTarget = Math.max(0, Math.min(targetScrollLeft, maxScroll));
    const distance = clampedTarget - start;

    if (Math.abs(distance) < 2) return;

    const startTime = performance.now();

    // Natural deceleration curve (easeOutQuart)
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);

      container.scrollLeft = start + distance * eased;

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        animFrameRef.current = null;
        updateScrollMetrics();
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  }, [updateScrollMetrics]);

  // Handle slide button click with intelligent wrapping and refined motion
  const handleSlide = (direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (!container) return;

    const firstCard = container.querySelector('[data-blog-card]') as HTMLElement;
    const step = firstCard ? firstCard.offsetWidth + 24 : 440;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    const maxScroll = Math.max(0, scrollWidth - clientWidth);

    let targetLeft: number;

    if (direction === 'right') {
      if (scrollLeft >= maxScroll - 12) {
        // Smooth loop back to the beginning
        targetLeft = 0;
      } else {
        targetLeft = scrollLeft + step;
      }
    } else {
      if (scrollLeft <= 12) {
        // Smooth loop to the very end
        targetLeft = maxScroll;
      } else {
        targetLeft = scrollLeft - step;
      }
    }

    smoothScrollToTarget(targetLeft);
  };

  // Jump to specific slide
  const handleDotClick = (index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const firstCard = container.querySelector('[data-blog-card]') as HTMLElement;
    const step = firstCard ? firstCard.offsetWidth + 24 : 440;
    smoothScrollToTarget(index * step);
  };

  // Drag-to-scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const container = scrollRef.current;
    if (!container) return;
    setIsDragging(true);
    hasDragged.current = false;
    dragStartX.current = e.pageX - container.offsetLeft;
    scrollStartX.current = container.scrollLeft;

    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const container = scrollRef.current;
    if (!container) return;

    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - dragStartX.current) * 1.3;
    if (Math.abs(walk) > 6) {
      hasDragged.current = true;
    }
    container.scrollLeft = scrollStartX.current - walk;
    updateScrollMetrics();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Reset scroll and update metrics on tag change or resize
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
    updateScrollMetrics();
  }, [selectedTag, updateScrollMetrics]);

  useEffect(() => {
    const handleResize = () => updateScrollMetrics();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [updateScrollMetrics]);

  return (
    <section id="blog" className="relative py-24 bg-[#060606] overflow-hidden select-none">
      {/* Background Subtle Gradient Glows */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-[#FF5A1F]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-[#FF5A1F]/8 rounded-full blur-[160px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-5"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-space uppercase tracking-widest text-[#FF5A1F] mb-2">
              <span className="h-2 w-2 rounded-full bg-[#FF5A1F] animate-pulse" />
              <span>Editorial Journal</span>
            </div>
            <h2 className="font-syne text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Thoughts On Design & Tech
            </h2>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-between md:justify-end">
            {/* Tag Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-space font-semibold transition-all cursor-pointer ${
                    selectedTag === tag
                      ? 'bg-[#FF5A1F] text-black font-bold shadow-md shadow-[#FF5A1F]/30 scale-105'
                      : 'bg-[#121216] text-neutral-400 hover:text-white border border-white/10 hover:border-white/20'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Scroll Navigation Buttons and Counter Indicator */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Slide Counter & Progress Bar */}
              <div className="hidden sm:flex items-center gap-2.5 mr-1 bg-[#121216]/80 border border-white/10 px-3 py-1.5 rounded-full">
                <span className="font-space text-xs font-semibold text-neutral-400">
                  <span className="text-[#FF5A1F] font-bold">
                    {String(activeSlideIndex + 1).padStart(2, '0')}
                  </span>
                  {' '}/ {String(filteredPosts.length).padStart(2, '0')}
                </span>
                <div className="w-14 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF5A1F] to-orange-400 transition-all duration-300 rounded-full"
                    style={{
                      width: `${Math.max(15, (scrollProgress * 100))}%`,
                    }}
                  />
                </div>
              </div>

              {/* Prev Slide Button */}
              <button
                onClick={() => handleSlide('left')}
                className={`group flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[#121216]/90 backdrop-blur-md text-white hover:border-[#FF5A1F] hover:bg-[#FF5A1F] hover:text-black transition-all duration-300 shadow-md active:scale-90 cursor-pointer ${
                  !canScrollLeft ? 'opacity-70 hover:opacity-100' : 'opacity-100'
                }`}
                aria-label="Previous Blog Post"
                title="Slide to previous article"
              >
                <ChevronLeft className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
              </button>

              {/* Next Slide Button */}
              <button
                onClick={() => handleSlide('right')}
                className={`group flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[#121216]/90 backdrop-blur-md text-white hover:border-[#FF5A1F] hover:bg-[#FF5A1F] hover:text-black transition-all duration-300 shadow-md active:scale-90 cursor-pointer ${
                  !canScrollRight ? 'opacity-70 hover:opacity-100' : 'opacity-100'
                }`}
                aria-label="Next Blog Post"
                title="Slide to next article"
              >
                <ChevronRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Horizontal Blog Posts Slider Track */}
        {filteredPosts.length === 0 ? (
          <div className="w-full py-16 px-6 text-center rounded-3xl bg-[#0e0e12] border border-white/10 flex flex-col items-center justify-center space-y-3 my-4">
            <BookOpen className="w-10 h-10 text-[#FF5A1F]/60" />
            <h3 className="font-syne text-xl font-bold text-white">No Journal Articles Published Yet</h3>
            <p className="text-xs text-neutral-400 max-w-md font-sans">
              Articles created and published through the Admin Dashboard will appear here.
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Subtle edge fade indicators */}
            <div
              className={`pointer-events-none absolute left-0 top-0 bottom-6 w-12 z-20 bg-gradient-to-r from-[#060606] to-transparent transition-opacity duration-300 ${
                canScrollLeft ? 'opacity-100' : 'opacity-0'
              }`}
            />
            <div
              className={`pointer-events-none absolute right-0 top-0 bottom-6 w-16 z-20 bg-gradient-to-l from-[#060606] to-transparent transition-opacity duration-300 ${
                canScrollRight ? 'opacity-100' : 'opacity-0'
              }`}
            />

            <div
              ref={scrollRef}
              onScroll={updateScrollMetrics}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className={`overflow-x-auto overflow-y-hidden pb-6 pt-2 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            >
              <div className="flex gap-5 sm:gap-6 w-max pr-6 pl-0.5">
              {filteredPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  data-blog-card="true"
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.45, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => {
                    if (!hasDragged.current) {
                      setSelectedPost(post);
                    }
                  }}
                  className="group relative w-[310px] sm:w-[370px] md:w-[410px] lg:w-[430px] h-[450px] sm:h-[470px] shrink-0 rounded-3xl overflow-hidden cursor-pointer border border-white/10 hover:border-[#FF5A1F]/70 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-[#FF5A1F]/20 flex flex-col justify-between bg-[#0e0e12]"
                >
                  {/* Card Background Image & Dark Luxury Overlay */}
                  <div className="absolute inset-0 z-0 bg-[#0d0d10] overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                    />
                    {/* Gradient Overlay for high-contrast reading */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/65 to-black/35 group-hover:from-black/90 group-hover:via-black/55 transition-colors duration-500" />
                    {/* Neon Orange ambient glow layer */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#FF5A1F]/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </div>

                  {/* Card Top: Badges & Category */}
                  <div className="relative z-10 p-5 sm:p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-space font-bold uppercase tracking-wider text-white bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#FF5A1F] animate-pulse" />
                        {post.category}
                      </span>
                      <span className="text-[10px] font-space font-medium text-white/70 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                        {post.date}
                      </span>
                    </div>

                    <h3 className="font-syne text-lg sm:text-xl font-bold text-white leading-snug tracking-tight drop-shadow-md group-hover:text-[#FF5A1F] transition-colors duration-300 line-clamp-2 pt-1">
                      {post.title}
                    </h3>

                    <p className="text-xs sm:text-sm font-sans text-neutral-300/80 line-clamp-3 leading-relaxed drop-shadow">
                      {post.excerpt}
                    </p>
                  </div>

                  {/* Card Bottom: Metadata & Action CTA */}
                  <div className="relative z-10 p-5 sm:p-6 mt-auto pt-3 space-y-4">
                    {/* Tag Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-space text-white/60 bg-white/5 px-2 py-0.5 rounded-md border border-white/5"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      {/* Read Article Pill Button */}
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-white text-black font-space font-bold text-xs px-3.5 py-1.5 shadow-lg group-hover:bg-[#FF5A1F] group-hover:text-black transition-all duration-300 transform group-hover:translate-x-1">
                        <span>Read</span>
                        <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
                      </div>

                      {/* Interactive Like & Share buttons on card */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleLikePost(e, post.id)}
                          className={`flex items-center gap-1 text-[11px] font-space px-2.5 py-1 rounded-full border transition-all cursor-pointer active:scale-90 ${
                            userLikedPosts.includes(post.id)
                              ? 'bg-[#FF5A1F] text-black border-[#FF5A1F] font-bold shadow-md shadow-[#FF5A1F]/30'
                              : 'text-white/90 hover:text-[#FF5A1F] bg-black/60 backdrop-blur-md border-white/10'
                          }`}
                          title={userLikedPosts.includes(post.id) ? "Liked! Click again to remove like" : "Like post"}
                        >
                          <Heart className={`h-3 w-3 ${userLikedPosts.includes(post.id) ? 'fill-current text-black' : 'text-[#FF5A1F]'}`} />
                          <span>{(post.likes || 18) + (likesMap[post.id] || 0)}</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(post);
                          }}
                          className="flex items-center text-[11px] font-space text-white/80 hover:text-[#FF5A1F] bg-black/60 backdrop-blur-md p-1.5 rounded-full border border-white/10 transition-colors cursor-pointer"
                          title="Share post"
                        >
                          <Share2 className="h-3 w-3 text-neutral-300 hover:text-[#FF5A1F]" />
                        </button>

                        <div className="flex items-center gap-1 text-[11px] font-space text-neutral-400 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                          <Clock className="h-3 w-3 text-[#FF5A1F]" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      )}

        {/* Toast for copy link */}
        {copiedToast && (
          <div className="fixed bottom-8 right-8 z-[9999] bg-[#FF5A1F] text-black font-space font-bold text-xs px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>Article Link Copied to Clipboard!</span>
          </div>
        )}

        {/* Carousel Pagination Dots & Read More Action */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Slide Indicator Dots */}
          <div className="flex items-center gap-1.5">
            {filteredPosts.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleDotClick(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  activeSlideIndex === idx
                    ? 'w-8 bg-[#FF5A1F]'
                    : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Read More on Blog Action Button */}
          <a
            href={PERSONAL_INFO.blogUrl || "https://medium.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF5A1F] to-[#FF7A00] text-black font-space font-extrabold text-xs sm:text-sm px-6 py-2.5 shadow-xl shadow-[#FF5A1F]/20 hover:shadow-[#FF5A1F]/40 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          >
            <BookOpen className="h-4 w-4 stroke-[2.5]" />
            <span>Read More on Blog</span>
            <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
          </a>
        </div>
      </div>

      {/* Article Reader Modal with Like, Share, and Comments */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99995] overflow-y-auto overscroll-contain touch-pan-y bg-black/90 backdrop-blur-2xl p-4 sm:p-6 lg:p-12"
          >
            <div className="mx-auto max-w-3xl rounded-3xl bg-[#090909] border border-white/15 p-6 sm:p-10 shadow-2xl relative my-8 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 text-xs font-space text-[#FF5A1F] font-bold">
                  <BookOpen className="h-4 w-4" /> {selectedPost.category} // {selectedPost.readTime}
                </div>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-[#FF5A1F] hover:text-black transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <h1 className="font-syne text-2xl sm:text-4xl font-extrabold text-white">
                {selectedPost.title}
              </h1>

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-space text-neutral-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-[#FF5A1F]" />
                    {selectedPost.author}
                  </span>
                  <span>•</span>
                  <span>{selectedPost.date}</span>
                </div>

                {/* Article Top Actions: Like & Share */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleLikePost(e, selectedPost.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer font-bold active:scale-90 ${
                      userLikedPosts.includes(selectedPost.id)
                        ? 'bg-[#FF5A1F] text-black border-[#FF5A1F] shadow-md shadow-[#FF5A1F]/30'
                        : 'bg-[#FF5A1F]/20 hover:bg-[#FF5A1F] text-[#FF5A1F] hover:text-black border-[#FF5A1F]/30'
                    }`}
                    title={userLikedPosts.includes(selectedPost.id) ? "Liked! Click again to remove like" : "Like article"}
                  >
                    <Heart className={`w-3.5 h-3.5 ${userLikedPosts.includes(selectedPost.id) ? 'fill-current text-black' : 'fill-current'}`} />
                    <span>{(selectedPost.likes || 0) + (likesMap[selectedPost.id] || 0)}</span>
                  </button>

                  <button
                    onClick={() => handleShare(selectedPost)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all cursor-pointer"
                    title="Share article"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#FF5A1F]" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#111111]">
                <img
                  src={selectedPost.image}
                  alt={selectedPost.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="prose prose-invert max-w-none text-neutral-300 text-sm font-sans whitespace-pre-line leading-relaxed space-y-4">
                {selectedPost.content}
              </div>

              {/* INTERACTIVE COMMENTS SECTION */}
              <div className="pt-8 border-t border-white/10 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-syne text-lg font-bold text-white">
                    <MessageSquare className="w-5 h-5 text-[#FF5A1F]" />
                    <span>Discussion ({(commentsMap[selectedPost.id] || []).length})</span>
                  </div>
                  <span className="text-[11px] font-space text-neutral-500">
                    Thoughts from developers & designers
                  </span>
                </div>

                {/* Leave a Comment Form */}
                <form
                  onSubmit={(e) => handleAddComment(e, selectedPost.id)}
                  className="bg-[#121316] border border-white/10 rounded-2xl p-4 space-y-3"
                >
                  <h4 className="text-xs font-bold font-space uppercase tracking-wider text-[#FF5A1F]">
                    Join the Discussion
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Your Name (e.g. Marcus Thorne)"
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      className="bg-[#17181C] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5A1F]"
                    />
                  </div>
                  <textarea
                    rows={2}
                    required
                    placeholder="Share your perspective, feedback, or technical insight..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full bg-[#17181C] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FF5A1F]"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingComment}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FF5A1F] hover:bg-[#FF7A00] text-black font-space font-bold text-xs cursor-pointer transition-all shadow-md active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{submittingComment ? 'Posting...' : 'Post Comment'}</span>
                    </button>
                  </div>
                </form>

                {/* Comments Thread List */}
                <div className="space-y-3">
                  {(commentsMap[selectedPost.id] || []).length === 0 ? (
                    <p className="text-xs text-neutral-500 italic font-space py-2">
                      No comments yet. Be the first to share your thoughts!
                    </p>
                  ) : (
                    (commentsMap[selectedPost.id] || []).map((comm: any) => (
                    <div
                      key={comm.id}
                      className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <img
                            src={comm.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop'}
                            alt={comm.name}
                            className="w-6 h-6 rounded-full object-cover border border-[#FF5A1F]/30"
                          />
                          <span className="font-bold text-white font-syne">{comm.name}</span>
                        </div>
                        <span className="text-[10px] text-neutral-500 font-mono">{comm.timestamp}</span>
                      </div>
                      <p className="text-xs text-neutral-300 font-sans pl-8 leading-relaxed">
                        {comm.text}
                      </p>
                    </div>
                  ))
                )}
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleShare(selectedPost)}
                    className="flex items-center gap-1.5 text-xs font-space text-neutral-400 hover:text-[#FF5A1F] cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </button>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(selectedPost.title)}&url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-space text-neutral-400 hover:text-white"
                  >
                    <Twitter className="w-3.5 h-3.5" />
                    <span>Tweet</span>
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-space text-neutral-400 hover:text-white"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </a>
                </div>

                <button
                  onClick={() => setSelectedPost(null)}
                  className="rounded-full bg-[#FF5A1F] px-6 py-2.5 text-xs font-bold text-black hover:bg-orange-500 transition-colors cursor-pointer"
                >
                  Close Article
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
