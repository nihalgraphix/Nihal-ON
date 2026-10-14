import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ArrowRight,
  ExternalLink,
  Github,
  Award,
  Flame,
  Layers,
  CheckCircle2,
  Quote,
  Clock,
  UserCheck
} from 'lucide-react';
import { Project } from '../types';
import { PROJECTS } from '../data/portfolioData';

interface CaseStudyModalProps {
  project: Project | null;
  onClose: () => void;
  onSelectNextProject: (id: string) => void;
}

export default function CaseStudyModal({
  project,
  onClose,
  onSelectNextProject
}: CaseStudyModalProps) {
  if (!project) return null;

  // Find next project in array
  const currentIndex = PROJECTS.findIndex(p => p.id === project.id);
  const nextProject = PROJECTS[(currentIndex + 1) % PROJECTS.length];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-2xl p-4 sm:p-6 lg:p-12"
      >
        <div className="mx-auto max-w-5xl rounded-3xl bg-[#090909] border border-white/15 shadow-2xl overflow-hidden relative my-6">
          {/* Top Sticky Close Bar */}
          <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#090909]/90 px-6 py-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-2 w-2 rounded-full bg-[#FF5A1F]" />
              <span className="text-xs font-space uppercase tracking-widest text-neutral-400">
                Case Study Breakdown // {project.year}
              </span>
            </div>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-[#FF5A1F] hover:text-black transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Hero Banner */}
          <div className="relative aspect-[21/9] w-full overflow-hidden bg-[#111111]">
            <img
              src={project.heroImage || project.coverImage}
              alt={project.title}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover filter saturate-[1.1]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-[#090909]/50 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 lg:bottom-10 lg:left-10 lg:right-10">
              <span className="inline-block rounded-full bg-[#FF5A1F] px-3.5 py-1 text-xs font-space font-bold text-black mb-3">
                {project.category}
              </span>
              <h1 className="font-syne text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                {project.title}
              </h1>
              <p className="text-base sm:text-lg text-neutral-300 font-sans mt-2 max-w-2xl">
                {project.subtitle}
              </p>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-6 sm:p-10 space-y-12">
            {/* Meta Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-2xl bg-[#111111] border border-white/10">
              <div>
                <span className="text-[11px] font-space text-neutral-500 uppercase block">Client</span>
                <span className="font-syne font-bold text-white text-sm">{project.client}</span>
              </div>
              <div>
                <span className="text-[11px] font-space text-neutral-500 uppercase block">Role</span>
                <span className="font-syne font-bold text-white text-sm">{project.role}</span>
              </div>
              <div>
                <span className="text-[11px] font-space text-neutral-500 uppercase block">Duration</span>
                <span className="font-syne font-bold text-white text-sm">{project.duration}</span>
              </div>
              <div>
                <span className="text-[11px] font-space text-neutral-500 uppercase block">Year</span>
                <span className="font-syne font-bold text-[#FF5A1F] text-sm">{project.year}</span>
              </div>
            </div>

            {/* Overview & Core Challenge */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-card p-6 rounded-2xl space-y-3">
                <h3 className="font-syne text-xl font-bold text-white flex items-center gap-2">
                  <Layers className="h-5 w-5 text-[#FF5A1F]" /> Project Overview
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed font-sans">
                  {project.description}
                </p>
              </div>

              <div className="glass-card p-6 rounded-2xl space-y-3 border-l-4 border-l-[#FF5A1F]">
                <h3 className="font-syne text-xl font-bold text-white flex items-center gap-2">
                  <Flame className="h-5 w-5 text-[#FF5A1F]" /> The Core Challenge
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed font-sans">
                  {project.challenge}
                </p>
              </div>
            </div>

            {/* Strategic Solution */}
            <div className="p-8 rounded-3xl bg-gradient-to-r from-[#111111] via-[#181818] to-[#111111] border border-white/10 space-y-4">
              <h3 className="font-syne text-2xl font-bold text-white">The Design & Engineering Solution</h3>
              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-sans">
                {project.solution}
              </p>
            </div>

            {/* Impact Metrics */}
            {project.impactMetrics && project.impactMetrics.length > 0 && (
              <div>
                <h3 className="font-syne text-xl font-bold text-white mb-6">Quantifiable Results</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {project.impactMetrics.map((metric, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-[#111111] border border-[#FF5A1F]/30 text-center">
                      <div className="font-syne text-3xl font-black text-[#FF5A1F] mb-1">{metric.value}</div>
                      <div className="text-xs text-neutral-400 font-space">{metric.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technologies Used */}
            <div>
              <h3 className="font-syne text-xl font-bold text-white mb-4">Tech Stack & Tools</h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-space text-neutral-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Gallery Images */}
            {project.galleryImages && project.galleryImages.length > 0 && (
              <div className="space-y-6">
                <h3 className="font-syne text-xl font-bold text-white">Interface & Visual Artifacts</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {project.galleryImages.map((img, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden border border-white/10 aspect-[4/3] bg-[#111111]">
                      <img
                        src={img}
                        alt={`${project.title} Artifact ${i + 1}`}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover filter saturate-[1.05]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Client Testimonial */}
            {project.clientFeedback && (
              <div className="p-8 rounded-3xl glass-card border border-[#FF5A1F]/40 relative">
                <Quote className="h-10 w-10 text-[#FF5A1F]/30 absolute top-6 right-6" />
                <p className="text-base sm:text-lg italic text-neutral-200 font-sans mb-6 max-w-3xl">
                  "{project.clientFeedback.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src={project.clientFeedback.avatar}
                    alt={project.clientFeedback.author}
                    referrerPolicy="no-referrer"
                    className="h-12 w-12 rounded-full object-cover border border-[#FF5A1F]"
                  />
                  <div>
                    <h4 className="font-syne font-bold text-white text-sm">{project.clientFeedback.author}</h4>
                    <p className="text-xs text-neutral-400 font-space">
                      {project.clientFeedback.role} // {project.clientFeedback.company}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Next Project Footer */}
            <div className="pt-8 border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-space uppercase text-neutral-500 block">Up Next</span>
                <h4 className="font-syne font-bold text-white text-lg">{nextProject.title}</h4>
              </div>
              <button
                onClick={() => onSelectNextProject(nextProject.id)}
                className="flex items-center gap-2 rounded-full bg-[#FF5A1F] px-6 py-3 text-xs font-bold text-black hover:bg-orange-500 transition-colors"
              >
                <span>Next Case Study</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
