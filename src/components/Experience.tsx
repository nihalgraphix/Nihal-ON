import { motion } from 'motion/react';
import { EXPERIENCE_LIST } from '../data/portfolioData';
import { containerVariants, itemVariants } from './AnimatedSection';
import { Briefcase, Calendar, MapPin, CheckCircle2 } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import EditableText from './EditableText';

export default function Experience() {
  const { publishedData, draftData, isStudioOpen } = useStudio();
  const activeData = isStudioOpen ? draftData : publishedData;
  const elements = activeData?.elements || {};

  return (
    <section id="experience" className="relative py-28 bg-[#090909] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          data-editable-id="experience-heading"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 cursor-pointer"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-space uppercase tracking-widest text-[#FF5A1F] mb-3">
              <span className="h-2 w-2 rounded-full bg-[#FF5A1F]" />
              <EditableText id="experience-tag" as="span" defaultText="Career Trajectory" />
            </div>
            <EditableText
              id="experience-heading-title"
              as="h2"
              className="font-syne text-3xl sm:text-5xl font-extrabold text-white tracking-tight"
              defaultText="Professional Experience"
            />
          </div>
          <EditableText
            id="experience-heading-desc"
            as="p"
            className="text-neutral-400 max-w-md text-sm font-sans leading-relaxed"
            defaultText="Leading high-stakes creative direction and technical teams across top design agencies and venture-backed Silicon Valley startups."
          />
        </motion.div>

        {/* Vertical Timeline */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
          className="relative border-l-2 border-white/10 ml-4 lg:ml-8 space-y-12"
        >
          {EXPERIENCE_LIST.map((exp) => {
            const elId = `experience-${exp.id}`;
            const customEl = elements[elId];
            return (
              <motion.div
                key={exp.id}
                data-editable-id={elId}
                variants={itemVariants}
                style={{
                  transform: (customEl?.spacing?.transformX || customEl?.spacing?.transformY)
                    ? `translate(${customEl?.spacing?.transformX || 0}px, ${customEl?.spacing?.transformY || 0}px)`
                    : undefined,
                }}
                className="relative pl-8 sm:pl-12 group cursor-pointer"
              >
                {/* Timeline Indicator Node */}
                <div
                  className={`absolute -left-[17px] top-1.5 h-8 w-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                    exp.isCurrent
                      ? 'border-[#FF5A1F] bg-[#090909] text-[#FF5A1F] shadow-lg shadow-[#FF5A1F]/50'
                      : 'border-white/20 bg-[#111111] text-neutral-400 group-hover:border-[#FF5A1F]'
                  }`}
                >
                  <Briefcase className="h-3.5 w-3.5" />
                </div>

                {/* Experience Card */}
                <div className="glass-card glass-card-hover p-8 rounded-3xl border border-white/10 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <EditableText
                          id={`exp-role-${exp.id}`}
                          as="h3"
                          className="font-syne text-xl font-bold text-white group-hover:text-[#FF5A1F] transition-colors"
                          defaultText={exp.role}
                        />
                        {exp.isCurrent && (
                          <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-space text-emerald-400 font-bold">
                            Present Role
                          </span>
                        )}
                      </div>
                      <EditableText
                        id={`exp-company-${exp.id}`}
                        as="p"
                        className="text-sm font-space text-[#FF5A1F] font-semibold mt-0.5"
                        defaultText={exp.company}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-space text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-[#FF5A1F]" />
                        {exp.period}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-neutral-500" />
                        {exp.location}
                      </span>
                    </div>
                  </div>

                  <EditableText
                    id={`exp-desc-${exp.id}`}
                    as="p"
                    className="text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed"
                    defaultText={exp.description}
                  />

                {/* Achievements */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] uppercase font-space text-neutral-500 font-bold block">
                    Key Contributions & Impact
                  </span>
                  {exp.achievements.map((ach, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-neutral-300">
                      <CheckCircle2 className="h-4 w-4 text-[#FF5A1F] flex-shrink-0 mt-0.5" />
                      <span>{ach}</span>
                    </div>
                  ))}
                </div>

                {/* Tech Stack Tags */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                  {exp.technologies.map((tech, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] font-space text-neutral-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
        </motion.div>
      </div>
    </section>
  );
}
