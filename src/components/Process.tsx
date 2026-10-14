import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PROCESS_STEPS } from '../data/portfolioData';
import { CheckCircle2, ChevronRight, Sparkles, Layers } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import EditableText from './EditableText';

export default function Process() {
  const { publishedData, draftData, isStudioOpen } = useStudio();
  const activeData = isStudioOpen ? draftData : publishedData;
  const elements = activeData?.elements || {};
  const headingEl = elements['process-heading'];
  const [activeStep, setActiveStep] = useState<string>('01');

  const selectedStepObj = PROCESS_STEPS.find(s => s.step === activeStep) || PROCESS_STEPS[0];
  const stepElId = `process-step-${selectedStepObj.step}`;
  const customStepEl = elements[stepElId];

  return (
    <section id="process" className="relative py-28 bg-[#090909] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          data-editable-id="process-heading"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-16 cursor-pointer"
        >
          <div className="inline-flex items-center gap-2 text-xs font-space uppercase tracking-widest text-[#FF5A1F] mb-3">
            <span className="h-2 w-2 rounded-full bg-[#FF5A1F]" />
            <EditableText id="process-tag" as="span" defaultText="Methodology" />
          </div>
          <EditableText
            id="process-heading-title"
            as="h2"
            className="font-syne text-3xl sm:text-5xl font-extrabold text-white tracking-tight"
            defaultText="An 8-Step Blueprint For Digital Excellence"
          />
          <EditableText
            id="process-heading-subtitle"
            as="p"
            className="text-neutral-400 text-sm font-sans mt-3"
            defaultText="A transparent, predictable process refined over 150+ successful deployments worldwide."
          />
        </motion.div>

        {/* Horizontal / Grid Step Selectors with staggered scroll reveal */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.06 }
            }
          }}
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-10"
        >
          {PROCESS_STEPS.map((s) => (
            <motion.button
              key={s.step}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
              }}
              onClick={() => setActiveStep(s.step)}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                activeStep === s.step
                  ? 'bg-[#FF5A1F] text-black border-[#FF5A1F] shadow-lg shadow-[#FF5A1F]/30 scale-105'
                  : 'bg-[#111111] text-neutral-300 border-white/10 hover:border-white/30'
              }`}
            >
              <span className={`font-syne text-xl font-black ${activeStep === s.step ? 'text-black' : 'text-[#FF5A1F]'}`}>
                {s.step}
              </span>
              <span className="font-syne text-xs font-bold truncate mt-2">
                {s.title.split(' ')[0]}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Selected Step Expanded Drawer Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            data-editable-id={stepElId}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            style={{
              transform: (customStepEl?.spacing?.transformX || customStepEl?.spacing?.transformY)
                ? `translate(${customStepEl?.spacing?.transformX || 0}px, ${customStepEl?.spacing?.transformY || 0}px)`
                : undefined,
            }}
            className="glass-card p-8 sm:p-12 rounded-3xl border border-[#FF5A1F]/40 relative overflow-hidden cursor-pointer"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-4 max-w-xl">
                <div className="flex items-center gap-3">
                  <EditableText
                    id={`process-num-${selectedStepObj.step}`}
                    as="span"
                    className="font-syne text-4xl font-extrabold text-[#FF5A1F]"
                    defaultText={selectedStepObj.step}
                  />
                  <div>
                    <EditableText
                      id={`process-title-${selectedStepObj.step}`}
                      as="h3"
                      className="font-syne text-2xl font-bold text-white"
                      defaultText={selectedStepObj.title}
                    />
                    <EditableText
                      id={`process-[#FF5A1F]time-${selectedStepObj.step}`}
                      as="span"
                      className="text-xs font-space text-neutral-400 block mt-0.5"
                      defaultText={`Phase Horizon: ${selectedStepObj.duration}`}
                    />
                  </div>
                </div>

                <EditableText
                  id={`process-desc-${selectedStepObj.step}`}
                  as="p"
                  className="text-base text-neutral-200 font-sans leading-relaxed"
                  defaultText={selectedStepObj.summary}
                />
              </div>

              {/* Details Checklist */}
              <div className="p-6 rounded-2xl bg-[#111111] border border-white/10 min-w-[300px] space-y-3">
                <EditableText
                  id={`process-deliv-title-${selectedStepObj.step}`}
                  as="span"
                  className="text-xs uppercase font-space text-[#FF5A1F] font-bold block"
                  defaultText="Phase Milestone Deliverables"
                />
                {selectedStepObj.details.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-300">
                    <CheckCircle2 className="h-4 w-4 text-[#FF5A1F] flex-shrink-0 mt-0.5" />
                    <EditableText
                      id={`process-deliv-${selectedStepObj.step}-${idx}`}
                      as="span"
                      defaultText={detail}
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
