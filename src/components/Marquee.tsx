import { BRANDS, AWARDS } from '../data/portfolioData';
import { Award, Trophy, Star } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import EditableText from './EditableText';

export default function Marquee() {
  const { publishedData, draftData, isStudioOpen } = useStudio();
  const activeData = isStudioOpen ? draftData : publishedData;
  const elements = activeData?.elements || {};

  const headlineEl = elements['marquee-headline'];
  const brandsEl = elements['marquee-brands'];

  return (
    <section id="marquee" className="relative py-12 border-y border-white/10 bg-[#090909] overflow-hidden">
      {/* Brands Ticker */}
      <div 
        data-editable-id="marquee-headline"
        style={{
          transform: (headlineEl?.spacing?.transformX || headlineEl?.spacing?.transformY)
            ? `translate(${headlineEl?.spacing?.transformX || 0}px, ${headlineEl?.spacing?.transformY || 0}px)`
            : undefined,
          textAlign: (headlineEl?.typography?.textAlign || 'center') as any,
          color: headlineEl?.typography?.textColor || undefined,
        }}
        className="mb-8 text-center cursor-pointer"
      >
        <p className="text-xs font-space uppercase tracking-widest text-neutral-400">
          {headlineEl?.content?.text || 'Trusted By Industry Pioneers & Next-Gen Brands'}
        </p>
      </div>

      <div 
        data-editable-id="marquee-brands"
        style={{
          transform: (brandsEl?.spacing?.transformX || brandsEl?.spacing?.transformY)
            ? `translate(${brandsEl?.spacing?.transformX || 0}px, ${brandsEl?.spacing?.transformY || 0}px)`
            : undefined,
        }}
        className="relative flex overflow-x-hidden cursor-pointer"
      >
        <div className="animate-marquee flex items-center gap-12 whitespace-nowrap py-2">
          {[...BRANDS, ...BRANDS, ...BRANDS].map((brand, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-full border border-white/10 bg-[#111111]/80 px-6 py-2.5 backdrop-blur-md hover:border-[#FF5A1F]/50 transition-colors"
            >
              <span className="text-lg">{brand.logo}</span>
              <span className="font-syne text-sm font-bold tracking-wider text-neutral-300">
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Awards Highlights */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {AWARDS.map((award, i) => (
            <div
              key={i}
              data-editable-id={`awards-highlight-${i + 1}`}
              style={{
                transform: (elements[`awards-highlight-${i + 1}`]?.spacing?.transformX || elements[`awards-highlight-${i + 1}`]?.spacing?.transformY)
                  ? `translate(${elements[`awards-highlight-${i + 1}`]?.spacing?.transformX || 0}px, ${elements[`awards-highlight-${i + 1}`]?.spacing?.transformY || 0}px)`
                  : undefined,
              }}
              className="glass-card flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md transition-all hover:bg-white/[0.06] hover:border-[#FF5A1F]/30"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#FF5A1F]/10 text-[#FF5A1F] border border-[#FF5A1F]/30">
                  <Trophy className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between text-[11px] font-space text-[#FF5A1F]">
                    <EditableText id={`award-${i + 1}-title`} as="span" defaultText={award.title}>{award.title}</EditableText>
                    <EditableText id={`award-${i + 1}-year`} as="span" defaultText={award.year}>{award.year}</EditableText>
                  </div>
                  <EditableText id={`award-${i + 1}-project`} as="h4" className="text-xs font-syne font-bold text-white truncate" defaultText={award.project}>{award.project}</EditableText>
                  <EditableText id={`award-${i + 1}-category`} as="p" className="text-[10px] text-neutral-400 truncate" defaultText={award.category}>{award.category}</EditableText>
                </div>
              </div>
          ))}
        </div>
      </div>
    </section>
  );
}
