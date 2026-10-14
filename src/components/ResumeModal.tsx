import { motion, AnimatePresence } from 'motion/react';
import { X, Download, FileText, CheckCircle2, Sparkles, ExternalLink } from 'lucide-react';
import { PERSONAL_INFO, EXPERIENCE_LIST, SKILL_CATEGORIES } from '../data/portfolioData';
import Logo from './Logo';

export default function ResumeModal({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-2xl p-4 sm:p-6 lg:p-12"
      >
        <div className="mx-auto max-w-4xl rounded-3xl bg-[#090909] border border-white/15 p-6 sm:p-10 shadow-2xl relative my-6 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black border border-white/20 p-2 shadow-lg shadow-[#FF5A1F]/30">
                <Logo className="h-full w-full" />
              </div>
              <div>
                <h2 className="font-syne text-2xl font-bold text-white">{PERSONAL_INFO.name}</h2>
                <p className="text-xs font-space text-[#FF5A1F]">{PERSONAL_INFO.title} // {PERSONAL_INFO.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => alert("Resume PDF downloaded successfully.")}
                className="flex items-center gap-2 rounded-full bg-[#FF5A1F] px-4 py-2 text-xs font-bold text-black hover:bg-orange-500 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Download PDF</span>
              </button>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-[#FF5A1F] hover:text-black transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-2">
            <span className="text-xs uppercase font-space text-[#FF5A1F] font-bold block">Executive Summary</span>
            <p className="text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed">
              Senior Creative Technologist with 6+ years of experience leading UI/UX architecture and full-stack web engineering. Proven track record deploying 150+ web platforms with 98% client satisfaction and multiple Awwwards recognitions.
            </p>
          </div>

          {/* Work History */}
          <div className="space-y-6">
            <h3 className="font-syne text-xl font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#FF5A1F]" /> Experience History
            </h3>
            <div className="space-y-6">
              {EXPERIENCE_LIST.map((exp) => (
                <div key={exp.id} className="p-6 rounded-2xl bg-[#111111] border border-white/10 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="font-syne font-bold text-white text-base">{exp.role} <span className="text-[#FF5A1F]">@ {exp.company}</span></h4>
                    <span className="text-xs font-space text-neutral-400">{exp.period}</span>
                  </div>
                  <p className="text-xs text-neutral-300 font-sans">{exp.description}</p>
                  <div className="space-y-1">
                    {exp.achievements.map((ach, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-neutral-400">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#FF5A1F] flex-shrink-0 mt-0.5" />
                        <span>{ach}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Matrix Summary */}
          <div className="space-y-4">
            <h3 className="font-syne text-xl font-bold text-white">Technical Stack & Proficiency</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {SKILL_CATEGORIES.flatMap(c => c.items).slice(0, 8).map((sk, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-[#111111] border border-white/10 text-center">
                  <div className="font-syne font-bold text-white text-xs">{sk.name}</div>
                  <div className="text-[10px] font-space text-[#FF5A1F] mt-1">{sk.level}% Proficiency</div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Close */}
          <div className="pt-6 border-t border-white/10 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-full bg-white/10 px-6 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-colors"
            >
              Close Resume
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
