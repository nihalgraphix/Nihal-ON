import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  Compass,
  Dribbble,
  Eye,
  Github,
  Layers3,
  Sparkles,
  Target,
  Twitter,
  UserRound,
} from 'lucide-react';
import { PERSONAL_INFO, aboutPortrait } from '../data/portfolioData';
import { useStudio } from '../context/StudioContext';
import EditableText from './EditableText';

function StarburstIcon({ className = 'w-6 h-6 sm:w-8 sm:h-8 text-[#FF5A1F]' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="currentColor">
      <path d="M16 0L17.9 11.2L27.3 4.7L20.8 14.1L32 16L20.8 17.9L27.3 27.3L17.9 20.8L16 32L14.1 20.8L4.7 27.3L11.2 17.9L0 16L11.2 14.1L4.7 4.7L14.1 11.2Z" />
    </svg>
  );
}

function SparkleStar({ className = 'w-7 h-7 text-[#FF5A1F]' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4772 12 22C12 16.4772 16.4772 12 22 12C16.4772 12 12 7.52285 12 2Z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );
}

function SignatureGraphic({ className = 'w-36 h-14 text-white/80' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 240 80"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 50 Q 25 10 35 45 T 55 40 Q 65 20 75 55 T 95 38" />
      <path d="M85 45 Q 110 40 135 46 Q 160 48 185 40" />
      <path d="M45 28 Q 70 20 100 24" />
      <path d="M140 25 Q 155 15 165 42 Q 175 60 190 35 Q 200 20 215 48" />
      <circle cx="225" cy="46" r="2.5" fill="currentColor" />
    </svg>
  );
}

type AboutTab = 'story' | 'mission' | 'manifesto' | 'values';

const tabs: { id: AboutTab; label: string }[] = [
  { id: 'story', label: 'Story' },
  { id: 'mission', label: 'Mission' },
  { id: 'manifesto', label: 'Manifesto' },
  { id: 'values', label: 'Values' },
];

const tabContent = {
  story: (
    <div className="space-y-3">
      <h3 className="font-syne text-xl font-bold text-white">From visual craft to useful code.</h3>
      <p className="text-sm leading-relaxed text-neutral-300">
        I am a creative technologist based in Kochi, combining editorial instincts with modern full-stack engineering.
      </p>
      <p className="text-sm leading-relaxed text-neutral-400">
        Every project is shaped around less friction, stronger storytelling, and a product people want to return to.
      </p>
    </div>
  ),
  mission: (
    <div className="space-y-4">
      <div>
        <h3 className="mb-1 flex items-center gap-2 font-syne text-lg font-bold text-white">
          <Target className="h-4 w-4 text-[#FF5A1F]" /> My mission
        </h3>
        <p className="text-sm leading-relaxed text-neutral-300">
          Bridge sharp artistic direction with dependable engineering so digital products feel as clear as they are beautiful.
        </p>
      </div>
      <div className="border-t border-white/10 pt-4">
        <h3 className="mb-1 flex items-center gap-2 font-syne text-lg font-bold text-white">
          <Eye className="h-4 w-4 text-[#FF5A1F]" /> My vision
        </h3>
        <p className="text-sm leading-relaxed text-neutral-300">
          Make thoughtful motion, intelligent AI, and accessible interfaces feel standard across every digital touchpoint.
        </p>
      </div>
    </div>
  ),
  manifesto: (
    <div className="space-y-2.5">
      {[
        { title: 'Clarity first', content: 'Great systems feel obvious, not overloaded.' },
        { title: 'Intentional motion', content: 'Animation should guide attention without distraction.' },
        { title: 'Crafted precision', content: 'Beautiful work still needs dependable performance and clean logic.' },
      ].map((item) => (
        <div key={item.title} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <h3 className="mb-1 text-xs font-bold text-[#FF5A1F]">{item.title}</h3>
          <p className="text-xs leading-relaxed text-neutral-300">{item.content}</p>
        </div>
      ))}
    </div>
  ),
  values: (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {['Bespoke precision', '60fps motion', 'Type-safe systems', 'Direct collaboration'].map((value) => (
        <div key={value} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-neutral-200">
          <Check className="h-4 w-4 shrink-0 text-[#FF5A1F]" /> {value}
        </div>
      ))}
    </div>
  ),
};

interface AboutProps {
  onOpenResumeModal?: () => void;
}

export default function About({ onOpenResumeModal }: AboutProps) {
  const { publishedData, draftData, isStudioOpen } = useStudio();
  const activeData = isStudioOpen ? draftData : publishedData;
  const elements = activeData?.elements || {};
  const aboutHeadingEl = elements['about-heading'];
  const aboutBioEl = elements['about-bio'];
  const aboutPortraitEl = elements['about-portrait-image'];

  const [activeTab, setActiveTab] = useState<AboutTab>('story');

  const scrollToContact = () => {
    const el = document.getElementById('contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const aboutPortraitImageUrl = aboutPortraitEl?.content?.imageUrl || aboutPortrait;
  const isAboutPortraitVisible = aboutPortraitEl?.visible !== false && aboutPortraitImageUrl !== '' && aboutPortraitImageUrl !== 'none';

  return (
    <section id="about" className="relative overflow-hidden bg-[#060606] py-20 sm:py-28">
      <motion.div
        initial={{ y: -50, opacity: 0.8 }}
        whileInView={{ y: 50, opacity: 1 }}
        transition={{ ease: "linear", duration: 0.8 }}
        viewport={{ once: false }}
        className="pointer-events-none absolute left-1/2 top-1/4 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[#FF5A1F]/10 blur-[180px]"
      />
      <motion.div
        initial={{ y: 30 }}
        whileInView={{ y: -40 }}
        transition={{ ease: "linear", duration: 0.8 }}
        viewport={{ once: false }}
        className="pointer-events-none absolute bottom-10 right-10 h-80 w-80 rounded-full bg-[#FF5A1F]/15 blur-[140px]"
      />
      <motion.div
        initial={{ y: -30 }}
        whileInView={{ y: 40 }}
        transition={{ ease: "linear", duration: 0.8 }}
        viewport={{ once: false }}
        className="pointer-events-none absolute left-10 top-10 h-64 w-64 rounded-full bg-[#E84A10]/10 blur-[140px]"
      />

      <div className="relative z-10 mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:mb-10 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#FF5A1F]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF5A1F]" /> Behind the work
            </div>
            <EditableText
              id="about-heading"
              as="h2"
              style={{
                color: aboutHeadingEl?.typography?.textColor || '#FFFFFF',
                textAlign: aboutHeadingEl?.typography?.textAlign || 'left',
                fontSize: aboutHeadingEl?.typography?.fontSize || undefined,
                transform: (aboutHeadingEl?.spacing?.transformX || aboutHeadingEl?.spacing?.transformY)
                  ? `translate(${aboutHeadingEl.spacing.transformX || 0}px, ${aboutHeadingEl.spacing.transformY || 0}px)`
                  : undefined,
              }}
              className="max-w-2xl font-syne text-3xl font-extrabold tracking-tight sm:text-5xl cursor-pointer"
              defaultText="A small studio with a large point of view."
            />
          </div>
          <EditableText
            id="about-bio"
            as="p"
            style={{
              color: aboutBioEl?.typography?.textColor || undefined,
              fontSize: aboutBioEl?.typography?.fontSize || undefined,
              transform: (aboutBioEl?.spacing?.transformX || aboutBioEl?.spacing?.transformY)
                ? `translate(${aboutBioEl.spacing.transformX || 0}px, ${aboutBioEl.spacing.transformY || 0}px)`
                : undefined,
            }}
            className="max-w-sm text-sm leading-relaxed text-neutral-400 cursor-pointer"
            defaultText="Design direction, product thinking, and production-ready code for ambitious teams."
          />
        </div>

        <div className="space-y-6 sm:space-y-7">
          <div className="grid grid-cols-1 gap-6 sm:gap-7 lg:grid-cols-12 xl:gap-8">
            {isAboutPortraitVisible && (
              <motion.article
                data-editable-id="about-portrait-image"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{
                  transform: (aboutPortraitEl?.spacing?.transformX || aboutPortraitEl?.spacing?.transformY)
                    ? `translate(${aboutPortraitEl.spacing.transformX || 0}px, ${aboutPortraitEl.spacing.transformY || 0}px)`
                    : undefined,
                  width: aboutPortraitEl?.dimensions?.width || undefined,
                  height: aboutPortraitEl?.dimensions?.height || undefined,
                }}
                className="group relative min-h-[360px] overflow-hidden rounded-[26px] border border-white/10 bg-[#111113] sm:col-span-2 lg:col-span-5 lg:row-span-2 xl:col-span-5 cursor-pointer"
              >
                <img
                  src={aboutPortraitImageUrl || aboutPortrait}
                  alt={aboutPortraitEl?.content?.alt || 'Nihal . ON studio portrait'}
                  loading="eager"
                  decoding="async"
                  style={{
                    borderRadius: aboutPortraitEl?.appearance?.borderRadius || undefined,
                  }}
                  className="absolute inset-0 h-full w-full object-cover object-center grayscale-[0.15] transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Available for projects
                </div>
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-neutral-400">Creative technologist</p>
                  <h3 className="font-syne text-3xl font-bold text-white">Nihal . ON</h3>
                  <p className="mt-1 text-sm text-neutral-300">Kochi, Kerala / working worldwide</p>
                </div>
              </motion.article>
            )}

            <motion.article
              data-editable-id="about-credentials"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.08 }}
              style={{
                transform: (elements['about-credentials']?.spacing?.transformX || elements['about-credentials']?.spacing?.transformY)
                  ? `translate(${elements['about-credentials']?.spacing?.transformX || 0}px, ${elements['about-credentials']?.spacing?.transformY || 0}px)`
                  : undefined,
              }}
              className="rounded-[26px] border border-white/10 bg-[#111113] p-5 sm:col-span-1 lg:col-span-3 xl:col-span-3 flex flex-col justify-between cursor-pointer w-full h-full"
            >
              <div className="mb-10 flex items-start justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#FF5A1F]">
                  <BriefcaseBusiness className="h-4 w-4" />
                </span>
                <ArrowUpRight className="h-5 w-5 text-neutral-600" />
              </div>
              <p className="text-[10px] uppercase tracking-widest text-neutral-500">Credentials</p>
              <h3 className="mt-2 font-syne text-xl font-bold text-white whitespace-pre-line">
                {elements['about-credentials']?.content?.text || '6+ years\nof making things move.'}
              </h3>
            </motion.article>

            <motion.article
              data-editable-id="about-selected-work"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.16 }}
              style={{
                transform: (elements['about-selected-work']?.spacing?.transformX || elements['about-selected-work']?.spacing?.transformY)
                  ? `translate(${elements['about-selected-work']?.spacing?.transformX || 0}px, ${elements['about-selected-work']?.spacing?.transformY || 0}px)`
                  : undefined,
              }}
              className="rounded-[26px] border border-white/10 bg-[#111113] p-5 sm:col-span-1 lg:col-span-4 xl:col-span-4 flex flex-col justify-between cursor-pointer w-full h-full"
            >
              <div className="mb-10 flex items-start justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#FF5A1F]">
                  <Layers3 className="h-4 w-4" />
                </span>
                <ArrowUpRight className="h-5 w-5 text-neutral-600" />
              </div>
              <p className="text-[10px] uppercase tracking-widest text-neutral-500">Selected work</p>
              <h3 className="mt-2 font-syne text-xl font-bold text-white whitespace-pre-line">
                {elements['about-selected-work']?.content?.text || 'Product systems,\nwebsites & AI tools.'}
              </h3>
            </motion.article>

            <motion.article
              data-editable-id="about-projects-completed"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.24 }}
              style={{
                transform: (elements['about-projects-completed']?.spacing?.transformX || elements['about-projects-completed']?.spacing?.transformY)
                  ? `translate(${elements['about-projects-completed']?.spacing?.transformX || 0}px, ${elements['about-projects-completed']?.spacing?.transformY || 0}px)`
                  : undefined,
              }}
              className="rounded-[26px] border border-white/10 bg-[#111113] p-5 sm:col-span-1 lg:col-span-3 xl:col-span-3 flex flex-col justify-between cursor-pointer w-full h-full"
            >
              <div className="mb-8 text-4xl font-black text-white">{PERSONAL_INFO.projectsCompleted}</div>
              <p className="text-[10px] uppercase tracking-widest text-neutral-500">Projects completed</p>
              <p className="mt-2 text-sm text-neutral-300">
                {elements['about-projects-completed']?.content?.text?.replace(/.*Projects completed\n?/i, '') || 'Across product, brand, and digital experience.'}
              </p>
            </motion.article>

            <motion.article
              data-editable-id="about-client-satisfaction"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{
                transform: (elements['about-client-satisfaction']?.spacing?.transformX || elements['about-client-satisfaction']?.spacing?.transformY)
                  ? `translate(${elements['about-client-satisfaction']?.spacing?.transformX || 0}px, ${elements['about-client-satisfaction']?.spacing?.transformY || 0}px)`
                  : undefined,
              }}
              className="rounded-[26px] border border-white/10 bg-[#111113] p-5 sm:col-span-1 lg:col-span-4 xl:col-span-4 flex flex-col justify-between cursor-pointer w-full h-full"
            >
              <div className="mb-8 text-4xl font-black text-[#FF5A1F]">{PERSONAL_INFO.clientSatisfaction}</div>
              <p className="text-[10px] uppercase tracking-widest text-neutral-500">Client satisfaction</p>
              <p className="mt-2 text-sm text-neutral-300">
                {elements['about-client-satisfaction']?.content?.text?.replace(/.*Client satisfaction\n?/i, '') || 'Built through clarity, craft, and direct collaboration.'}
              </p>
            </motion.article>

            <motion.article
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.36 }}
              className="rounded-[26px] border border-white/10 bg-[#111113] p-5 sm:col-span-2 lg:col-span-6 xl:col-span-6"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  <UserRound className="h-4 w-4 text-[#FF5A1F]" /> More about me
                </div>
                <Compass className="h-5 w-5 text-neutral-600" />
              </div>

              <div className="mb-5 flex flex-wrap gap-1.5 border-b border-white/10 pb-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                      activeTab === tab.id ? 'bg-white text-black' : 'text-neutral-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'story' ? (
                    <div className="space-y-3">
                      <h3 
                        data-editable-id="about-story-title"
                        className="font-syne text-xl font-bold text-white cursor-pointer hover:text-[#FF5A1F] transition-colors"
                      >
                        {elements['about-story-title']?.content?.text || 'From visual craft to useful code.'}
                      </h3>
                      <p 
                        data-editable-id="about-story-p1"
                        className="text-sm leading-relaxed text-neutral-300 cursor-pointer"
                      >
                        {elements['about-story-p1']?.content?.text || 'I am a creative technologist based in Kochi, combining editorial instincts with modern full-stack engineering.'}
                      </p>
                      <p 
                        data-editable-id="about-story-p2"
                        className="text-sm leading-relaxed text-neutral-400 cursor-pointer"
                      >
                        {elements['about-story-p2']?.content?.text || 'Every project is shaped around less friction, stronger storytelling, and a product people want to return to.'}
                      </p>
                    </div>
                  ) : tabContent[activeTab]}
                </motion.div>
              </AnimatePresence>
            </motion.article>

            <motion.a
              data-editable-id="about-work-together"
              href="#contact"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.42 }}
              style={{
                transform: (elements['about-work-together']?.spacing?.transformX || elements['about-work-together']?.spacing?.transformY)
                  ? `translate(${elements['about-work-together']?.spacing?.transformX || 0}px, ${elements['about-work-together']?.spacing?.transformY || 0}px)`
                  : undefined,
              }}
              className="group relative flex min-h-[190px] flex-col justify-between overflow-hidden rounded-[26px] border border-white/10 bg-[#111113] p-5 sm:col-span-2 lg:col-span-6 xl:col-span-6 cursor-pointer"
            >
              <Sparkles className="h-7 w-7 text-neutral-500 transition-colors group-hover:text-[#FF5A1F]" />
              <div className="flex items-end justify-between gap-4">
                <h3 className="max-w-sm font-syne text-3xl font-bold leading-tight text-white sm:text-4xl">
                  {elements['about-work-together']?.content?.text || (
                    <>Let&apos;s work <span className="text-[#FF5A1F]">together.</span></>
                  )}
                </h3>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 text-white transition-all group-hover:rotate-45 group-hover:bg-[#FF5A1F] group-hover:text-black">
                  <ArrowUpRight className="h-5 w-5" />
                </span>
              </div>
            </motion.a>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:gap-7 md:grid-cols-12">
            <motion.div
              data-editable-id="about-creative-direction"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{
                transform: (elements['about-creative-direction']?.spacing?.transformX || elements['about-creative-direction']?.spacing?.transformY)
                  ? `translate(${elements['about-creative-direction']?.spacing?.transformX || 0}px, ${elements['about-creative-direction']?.spacing?.transformY || 0}px)`
                  : undefined,
              }}
              className="rounded-[32px] bg-gradient-to-br from-[#161619] via-[#0f0f12] to-[#0a0a0c] p-6 sm:p-7 md:col-span-4 cursor-pointer"
            >
              <StarburstIcon className="mb-6 h-8 w-8 text-[#FF5A1F]" />
              <h3 className="font-syne text-2xl font-extrabold text-white">
                {elements['about-creative-direction']?.content?.text || 'Creative direction with technical depth.'}
              </h3>
            </motion.div>

            <motion.div
              data-editable-id="about-experience-1"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-[32px] bg-gradient-to-br from-[#161619] via-[#0f0f12] to-[#0a0a0c] p-8 sm:p-10 md:col-span-4 cursor-pointer"
            >
              <div className="mb-8 flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold tracking-widest text-[#FF5A1F] uppercase">Experience</h4>
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF5A1F]" />
              </div>
              <div className="space-y-7">
                <div>
                  <span className="text-xs font-mono text-[#FF5A1F] font-semibold tracking-wide">2023 - PRESENT</span>
                  <h5 className="mt-1 text-base font-syne font-bold text-white">
                    {elements['about-experience-1']?.content?.text?.split('\n')[0] || 'Lead Creative Technologist & Director'}
                  </h5>
                  <p className="mt-0.5 text-xs text-neutral-400">
                    {elements['about-experience-1']?.content?.text?.split('\n')[1] || 'NIHAL Creative Studio'}
                  </p>
                </div>
                <div 
                  data-editable-id="about-experience-2"
                  className="border-t border-white/5 pt-6 cursor-pointer"
                >
                  <span className="text-xs font-mono text-neutral-500 font-medium tracking-wide">2021 - 2023</span>
                  <h5 className="mt-1 text-base font-syne font-bold text-white">
                    {elements['about-experience-2']?.content?.text?.split('\n')[0] || 'Senior UI/UX Architect & Staff Engineer'}
                  </h5>
                  <p className="mt-0.5 text-xs text-neutral-400">
                    {elements['about-experience-2']?.content?.text?.split('\n')[1] || 'Aetheria AI Labs'}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              data-editable-id="about-education-1"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-[32px] bg-gradient-to-br from-[#161619] via-[#0f0f12] to-[#0a0a0c] p-8 sm:p-10 md:col-span-4 cursor-pointer"
            >
              <div className="mb-8 flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold tracking-widest text-[#FF5A1F] uppercase">Education</h4>
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF5A1F]" />
              </div>
              <div className="space-y-7">
                <div>
                  <span className="text-xs font-mono text-[#FF5A1F] font-semibold tracking-wide">2018 - 2022</span>
                  <h5 className="mt-1 text-base font-syne font-bold text-white">
                    {elements['about-education-1']?.content?.text?.split('\n')[0] || 'Bachelor Degree in Computer Science & Interactive Media'}
                  </h5>
                  <p className="mt-0.5 text-xs text-neutral-400">
                    {elements['about-education-1']?.content?.text?.split('\n')[1] || 'University of California, Berkeley'}
                  </p>
                </div>
                <div 
                  data-editable-id="about-education-2"
                  className="border-t border-white/5 pt-6 cursor-pointer"
                >
                  <span className="text-xs font-mono text-neutral-500 font-medium tracking-wide">2022 - 2024</span>
                  <h5 className="mt-1 text-base font-syne font-bold text-white">
                    {elements['about-education-2']?.content?.text?.split('\n')[0] || 'Master Degree in Human-Computer Interaction'}
                  </h5>
                  <p className="mt-0.5 text-xs text-neutral-400">
                    {elements['about-education-2']?.content?.text?.split('\n')[1] || 'Stanford University Center for Design Research'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:gap-7 md:grid-cols-12">
            <motion.div
              data-editable-id="about-stay-with-me"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="rounded-[32px] bg-gradient-to-br from-[#161619] via-[#0f0f12] to-[#0a0a0c] p-6 sm:p-7 md:col-span-3 cursor-pointer"
            >
              <div className="mb-6 flex items-center justify-center gap-3 rounded-2xl border border-white/5 bg-black/50 p-4">
                <a href={PERSONAL_INFO.dribbble} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-neutral-400 transition-all hover:bg-[#FF5A1F] hover:text-black hover:border-[#FF5A1F]" title="Dribbble"><Dribbble className="h-4 w-4" /></a>
                <a href={PERSONAL_INFO.twitter} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-neutral-400 transition-all hover:bg-[#FF5A1F] hover:text-black hover:border-[#FF5A1F]" title="Twitter / X"><Twitter className="h-4 w-4" /></a>
                <a href={PERSONAL_INFO.github} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-neutral-400 transition-all hover:bg-[#FF5A1F] hover:text-black hover:border-[#FF5A1F]" title="GitHub"><Github className="h-4 w-4" /></a>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-[#FF5A1F]">
                    {elements['about-stay-with-me']?.content?.text?.split('\n')[0] || 'Stay with me'}
                  </span>
                  <h5 className="mt-0.5 text-lg font-syne font-bold text-white">
                    {elements['about-stay-with-me']?.content?.text?.split('\n')[1] || 'Profiles'}
                  </h5>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-neutral-400 transition-all hover:border-[#FF5A1F] hover:bg-[#FF5A1F] hover:text-black">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              onClick={scrollToContact}
              className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-[32px] bg-gradient-to-br from-[#161619] via-[#0f0f12] to-[#0a0a0c] p-7 sm:p-9 md:col-span-6"
            >
              <div className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-[#FF5A1F]/15 blur-3xl transition-all group-hover:bg-[#FF5A1F]/25" />
              <SparkleStar className="mb-6 h-8 w-8 text-[#FF5A1F]" />
              <div className="py-2">
                <h4 className="font-syne text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Let&apos;s <br />
                  <span className="bg-gradient-to-r from-[#FF5A1F] via-[#FF8040] to-[#FFA066] bg-clip-text text-transparent transition-all group-hover:brightness-110">
                    work together.
                  </span>
                </h4>
              </div>
              <div className="mt-4 flex items-center justify-end">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-neutral-400 transition-all group-hover:border-[#FF5A1F] group-hover:bg-[#FF5A1F] group-hover:text-black">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.35 }}
              onClick={onOpenResumeModal}
              className="group cursor-pointer rounded-[32px] bg-gradient-to-br from-[#161619] via-[#0f0f12] to-[#0a0a0c] p-6 sm:p-7 md:col-span-3"
            >
              <div className="flex items-center justify-center py-3">
                <SignatureGraphic className="h-14 w-40 text-white/70 transition-colors duration-300 group-hover:text-[#FF5A1F]" />
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-[#FF5A1F]">More about me</span>
                  <h5 className="mt-0.5 text-lg font-syne font-bold text-white">Credentials</h5>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-neutral-400 transition-all group-hover:border-[#FF5A1F] group-hover:bg-[#FF5A1F] group-hover:text-black">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
