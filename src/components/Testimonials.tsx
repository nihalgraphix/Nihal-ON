import { motion } from 'motion/react';
import { TESTIMONIALS } from '../data/portfolioData';
import { Star, Quote } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import EditableText from './EditableText';
import LazyImage from './LazyImage';

export default function Testimonials() {
  const { publishedData, draftData, isStudioOpen } = useStudio();
  const activeData = isStudioOpen ? draftData : publishedData;
  const elements = activeData?.elements || {};

  return (
    <section id="testimonials" className="relative py-28 bg-[#060606] overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute top-1/2 right-0 h-96 w-96 rounded-full bg-[#FF5A1F]/10 blur-[160px]" />

      <motion.div
        data-editable-id="testimonials-heading"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 mb-16 cursor-pointer"
      >
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-space uppercase tracking-widest text-[#FF5A1F] mb-3">
            <span className="h-2 w-2 rounded-full bg-[#FF5A1F]" />
            <EditableText id="testimonials-tag" as="span" defaultText="Client Endorsements" />
          </div>
          <EditableText
            id="testimonials-heading-title"
            as="h2"
            className="font-syne text-3xl sm:text-5xl font-extrabold text-white tracking-tight"
            defaultText="What Founders & Leaders Say"
          />
        </div>
      </motion.div>

      {/* Infinite Testimonial Slider */}
      <div className="relative flex overflow-x-hidden">
        <div className="animate-marquee flex items-center gap-8 whitespace-normal py-4">
          {[...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS].map((t, idx) => {
            const elId = `testimonial-${t.id}`;
            const customEl = elements[elId];
            return (
              <div
                key={idx}
                data-editable-id={elId}
                style={{
                  transform: (customEl?.spacing?.transformX || customEl?.spacing?.transformY)
                    ? `translate(${customEl?.spacing?.transformX || 0}px, ${customEl?.spacing?.transformY || 0}px)`
                    : undefined,
                }}
                className="glass-card glass-card-hover p-8 rounded-3xl border border-white/10 w-[380px] sm:w-[450px] flex-shrink-0 flex flex-col justify-between space-y-6 cursor-pointer"
              >
              <div className="space-y-4">
                {/* Rating & Quote Icon */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 text-[#FF5A1F]">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-[#FF5A1F]" />
                    ))}
                  </div>
                  <Quote className="h-6 w-6 text-white/20" />
                </div>

                <EditableText
                  id={`testimonial-quote-${t.id}`}
                  as="p"
                  className="text-xs sm:text-sm text-neutral-200 font-sans leading-relaxed italic"
                  defaultText={`"${t.quote}"`}
                />
              </div>

              {/* Author Footer */}
              <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                <LazyImage
                  src={t.avatar}
                  alt={t.author}
                  wrapperClassName="h-11 w-11 rounded-full overflow-hidden shrink-0 border border-[#FF5A1F]"
                  className="h-full w-full object-cover"
                />
                <div>
                  <EditableText
                    id={`testimonial-author-${t.id}`}
                    as="h4"
                    className="font-syne font-bold text-white text-sm"
                    defaultText={t.author}
                  />
                  <EditableText
                    id={`testimonial-role-${t.id}`}
                    as="p"
                    className="text-[11px] text-neutral-400 font-space"
                    defaultText={`${t.role} // ${t.company}`}
                  />
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </section>
  );
}
