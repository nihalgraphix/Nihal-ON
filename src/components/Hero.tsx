import { motion } from 'motion/react';
import { Sparkles, ArrowDown, ChevronRight, ChevronLeft } from 'lucide-react';
import aiSprintLeaderImage from './image/3ebaca72-c048-4ad3-ace0-649046417171.png';
import { PERSONAL_INFO } from '../data/portfolioData';
import { useStudio } from '../context/StudioContext';
import EditableText from './EditableText';

interface HeroProps {
  onSelectProject: (id: string) => void;
  onOpenResumeModal: () => void;
}

export default function Hero({ onOpenResumeModal }: HeroProps) {
  const { publishedData, draftData, isStudioOpen } = useStudio();
  const activeData = isStudioOpen ? draftData : publishedData;
  const elements = activeData?.elements || {};
  const badgeEl = elements['hero-badge'];
  const headlineEl = elements['hero-headline'];
  const subtextEl = elements['hero-subtext'];
  const btn1El = elements['hero-btn-primary'];
  const btn2El = elements['hero-btn-secondary'];

  const heroModelEl = elements['hero-model-image'];
  const heroImageUrl = heroModelEl?.content?.imageUrl || aiSprintLeaderImage;
  const isHeroModelVisible = heroModelEl?.visible !== false && heroImageUrl !== '' && heroImageUrl !== 'none';

  return (
    <section id="home" data-section="hero" className="relative pt-20 sm:pt-24 pb-10 sm:pb-14 lg:pb-16 bg-gradient-to-b from-[#FF5A1F] via-[#E84A10] to-[#C83600] w-full overflow-hidden rounded-b-[36px] sm:rounded-b-[48px] lg:rounded-b-[60px] shadow-2xl shadow-[#FF5A1F]/20 border-b border-white/10">
      {/* Full-width Hero Banner Frame matching the website's #FF5A1F color scheme with no black space at top */}
      <div className="relative w-full px-4 sm:px-8 lg:px-16 pb-4 overflow-hidden">
        
        {/* Subtle Ambient Radial Lighting */}
        <div className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-black/30 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[560px] lg:min-h-[620px]">
          
          {/* Left Column: Headline, Pill, Subtitle & Buttons */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6 lg:space-y-8 text-white z-20">
            {/* Top Pill Badge */}
            {badgeEl?.visible !== false && (
              <motion.div
                data-editable-id="hero-badge"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span
                  style={{
                    backgroundColor: badgeEl?.appearance?.backgroundColor || '#FFFFFF',
                    color: badgeEl?.typography?.textColor || '#000000',
                    fontSize: badgeEl?.typography?.fontSize || '12px',
                    fontWeight: badgeEl?.typography?.fontWeight || '700',
                    borderRadius: badgeEl?.appearance?.borderRadius || '9999px',
                  }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 font-space shadow-lg cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#FF5A1F]" />
                  <EditableText id="hero-badge-text" as="span" defaultText="AI-Driven Agency" />
                </span>
              </motion.div>
            )}

            {/* Giant Display Headline */}
            <motion.div
              data-editable-id="hero-headline"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-2 cursor-pointer"
            >
              <EditableText
                id="hero-headline-text"
                as="h1"
                style={{
                  color: headlineEl?.typography?.textColor || '#FFFFFF',
                  fontSize: headlineEl?.typography?.fontSize || undefined,
                  fontWeight: headlineEl?.typography?.fontWeight || '900',
                }}
                className="font-syne text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.02]"
                defaultText="I'm Nihal ON"
              />
            </motion.div>

            {/* Subtext */}
            <motion.div
              data-editable-id="hero-subtext"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <EditableText
                id="hero-subtext-para"
                as="p"
                style={{
                  color: subtextEl?.typography?.textColor || 'rgba(255, 255, 255, 0.95)',
                  fontSize: subtextEl?.typography?.fontSize || undefined,
                }}
                className="text-sm sm:text-base font-sans max-w-md leading-relaxed font-normal cursor-pointer"
                defaultText="From discovery to deployment, we plug into your stack to prototype, validate, and launch AI experiences your users actually love."
              />
            </motion.div>

            {/* CTA Buttons Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <a
                data-editable-id="hero-btn-primary"
                href={btn1El?.content?.link || '#services'}
                style={{
                  backgroundColor: btn1El?.appearance?.backgroundColor || '#090909',
                  color: btn1El?.typography?.textColor || '#FFFFFF',
                  borderRadius: btn1El?.appearance?.borderRadius || '9999px',
                }}
                className="px-8 py-3.5 text-xs sm:text-sm font-bold shadow-2xl hover:bg-black hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer font-syne border border-white/10"
              >
                {btn1El?.content?.text || 'Explore Services'}
              </a>

              <a
                data-editable-id="hero-btn-secondary"
                href={btn2El?.content?.link || '#resume'}
                onClick={(e) => {
                  if ((btn2El?.content?.link || '#resume') === '#resume') {
                    e.preventDefault();
                    onOpenResumeModal();
                  }
                }}
                style={{
                  backgroundColor: btn2El?.appearance?.backgroundColor || '#FFFFFF',
                  color: btn2El?.typography?.textColor || '#000000',
                  borderRadius: btn2El?.appearance?.borderRadius || '9999px',
                }}
                className="px-8 py-3.5 text-xs sm:text-sm font-bold shadow-lg hover:bg-neutral-100 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer font-syne"
              >
                {btn2El?.content?.text || 'Download CV'}
              </a>
            </motion.div>
          </div>

          {/* Center Column: Hooded Model standing seamlessly directly on the orange canvas */}
          {isHeroModelVisible && (
            <div className="lg:col-span-4 relative flex items-end justify-center h-full my-2 lg:my-0 z-10 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.15 }}
                className="relative w-full max-w-[380px] sm:max-w-[440px] h-[520px] sm:h-[580px] lg:h-[640px] flex items-end justify-center"
              >
                {/* Subject image blending seamlessly into orange canvas */}
                <div
                  data-editable-id="hero-model-image"
                  className="relative w-full h-full flex items-end justify-center pointer-events-auto cursor-pointer"
                >
                  <img
                    src={heroImageUrl || aiSprintLeaderImage}
                    alt={heroModelEl?.content?.alt || 'Hero Model Portrait'}
                    referrerPolicy="no-referrer"
                    fetchPriority="high"
                    loading="eager"
                    decoding="async"
                    style={{
                      borderRadius: heroModelEl?.appearance?.borderRadius || '24px',
                    }}
                    className="h-full w-full object-cover object-top filter brightness-105 contrast-105 drop-shadow-2xl"
                  />
                  {/* Smooth bottom transition into client logo bar */}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#C83600] to-transparent pointer-events-none" />
                </div>

                {/* "Scroll for more ↓" pill at bottom center of model */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
                  <a
                    href="#about"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[11px] font-space font-bold text-black shadow-2xl hover:bg-neutral-100 transition-all cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <EditableText
                      id="hero-scroll-pill-text"
                      as="span"
                      defaultText="Scroll for more"
                      className="font-bold"
                    />
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-black text-white text-[10px]">
                      <ArrowDown className="h-2.5 w-2.5" />
                    </span>
                  </a>
                </div>
              </motion.div>
            </div>
          )}

          {/* Right Column: Case study testimonial & Growth metric */}
          <div className="lg:col-span-3 flex flex-col justify-between space-y-10 text-white z-20 lg:pl-4">
            {/* Top Right Testimonial Text */}
            <motion.div
              data-editable-id="hero-quote"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                display: elements['hero-quote']?.visible === false ? 'none' : undefined,
                color: elements['hero-quote']?.typography?.textColor || '#FFFFFF',
              }}
              className="space-y-4 cursor-pointer"
            >
              <EditableText
                id="hero-quote-text"
                as="p"
                className="text-xs sm:text-sm text-white/95 font-sans leading-relaxed"
                defaultText="We shipped our first copilot in 7 weeks and cut support tickets by 31%. The eval dashboards made every decision obvious."
              />
            </motion.div>

            {/* Bottom Right Growth Metric Block */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              style={{
                display: (elements['hero-growth-label']?.visible === false && elements['hero-growth-value']?.visible === false) ? 'none' : undefined,
              }}
              className="space-y-2 pt-6 cursor-pointer"
            >
              <div 
                data-editable-id="hero-growth-label"
                style={{
                  display: elements['hero-growth-label']?.visible === false ? 'none' : undefined,
                  color: elements['hero-growth-label']?.typography?.textColor || undefined,
                }}
                className="flex items-center justify-between"
              >
                <EditableText
                  id="hero-growth-label-text"
                  as="span"
                  className="text-[10px] font-space font-extrabold uppercase tracking-widest text-white/80"
                  defaultText="OUR GROWTH"
                />
                <div className="flex items-center gap-1 text-white/80">
                  <ChevronLeft className="h-3.5 w-3.5 cursor-pointer hover:text-white" />
                  <ChevronRight className="h-3.5 w-3.5 cursor-pointer hover:text-white" />
                </div>
              </div>

              <div 
                data-editable-id="hero-growth-value"
                style={{
                  display: elements['hero-growth-value']?.visible === false ? 'none' : undefined,
                  color: elements['hero-growth-value']?.typography?.textColor || '#FFFFFF',
                }}
              >
                <EditableText
                  id="hero-growth-value-text"
                  as="h3"
                  className="font-syne text-5xl sm:text-7xl font-extrabold tracking-tight text-white leading-none"
                  defaultText="150+"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Large Semi-Transparent Background Watermark Text across bottom */}
        <div className="absolute bottom-6 left-0 right-0 pointer-events-none select-none overflow-hidden opacity-10 text-center">
          <span className="font-syne text-[100px] sm:text-[180px] lg:text-[220px] font-black text-white uppercase tracking-tighter leading-none block">
            Nihal ON
          </span>
        </div>

        {/* Client / Stack Logo Bar across the bottom */}
        <div 
          data-editable-id="hero-client-logos"
          style={{
            display: elements['hero-client-logos']?.visible === false ? 'none' : undefined,
          }}
          className="relative z-20 pt-8 mt-8 border-t border-white/20 mx-auto max-w-7xl cursor-pointer"
        >
          {elements['hero-client-logos']?.content?.text ? (
            <div className="flex flex-wrap items-center justify-center gap-6 opacity-95 text-white font-syne text-xs sm:text-sm font-bold tracking-wider uppercase">
              {elements['hero-client-logos'].content.text.split('•').map((item, idx) => (
                <span key={idx} className="flex items-center gap-1.5"><span className="text-lg">●</span> {item.trim()}</span>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-6 opacity-95 text-white font-syne text-xs sm:text-sm font-bold tracking-wider uppercase">
              <span className="flex items-center gap-1.5"><span className="text-lg">●</span> Calendly</span>
              <span className="flex items-center gap-1.5"><span className="text-lg">☁</span> classpass</span>
              <span className="flex items-center gap-1.5"><span className="text-lg">⚙</span> GitHub</span>
              <span className="flex items-center gap-1.5"><span className="text-lg">⚡</span> Basecamp</span>
              <span className="flex items-center gap-1.5"><span className="text-lg">〰</span> attentive</span>
              <span className="flex items-center gap-1.5"><span className="text-lg">★</span> GUMROAD</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
