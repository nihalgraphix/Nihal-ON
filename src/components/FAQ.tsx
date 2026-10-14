import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FAQ_ITEMS } from '../data/portfolioData';
import { ChevronDown, HelpCircle, MessageSquare } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import EditableText from './EditableText';

export default function FAQ() {
  const { publishedData, draftData, isStudioOpen } = useStudio();
  const activeData = isStudioOpen ? draftData : publishedData;
  const elements = activeData?.elements || {};
  const headingEl = elements['faq-heading'];

  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCat, setActiveCat] = useState<string>('All');

  const categories = ['All', 'General', 'Process', 'Pricing', 'Technical'];

  const filteredFaqs = activeCat === 'All'
    ? FAQ_ITEMS
    : FAQ_ITEMS.filter(f => f.category === activeCat);

  return (
    <section id="faq" className="relative py-28 bg-[#060606] overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          data-editable-id="faq-heading"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-12 cursor-pointer"
        >
          <div className="inline-flex items-center gap-2 text-xs font-space uppercase tracking-widest text-[#FF5A1F] mb-3">
            <span className="h-2 w-2 rounded-full bg-[#FF5A1F]" />
            <EditableText id="faq-tag" as="span" defaultText="Got Questions?" />
          </div>
          <EditableText
            id="faq-heading-title"
            as="h2"
            className="font-syne text-3xl sm:text-5xl font-extrabold text-white tracking-tight"
            defaultText="Frequently Asked Questions"
          />
        </motion.div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCat(cat);
                setOpenIndex(null);
              }}
              className={`px-4 py-2 rounded-full text-xs font-space font-semibold transition-all ${
                activeCat === cat
                  ? 'bg-[#FF5A1F] text-black shadow-lg shadow-[#FF5A1F]/30'
                  : 'bg-[#111111] text-neutral-400 hover:text-white border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion List with scroll reveal */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="glass-card rounded-2xl border border-white/10 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between p-6 text-left font-syne font-bold text-base sm:text-lg text-white hover:text-[#FF5A1F] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xs font-space text-[#FF5A1F]">0{idx + 1}</span>
                    <EditableText
                      id={`faq-question-${idx}`}
                      as="span"
                      defaultText={faq.question}
                    />
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-[#FF5A1F] transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed border-t border-white/5">
                        <EditableText
                          id={`faq-answer-${idx}`}
                          as="div"
                          defaultText={faq.answer}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Still Have Questions CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 text-center p-8 rounded-3xl glass-card border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="text-left">
            <EditableText
              id="faq-cta-title"
              as="h4"
              className="font-syne font-bold text-white text-lg"
              defaultText="Have a specific question about your project?"
            />
            <EditableText
              id="faq-cta-desc"
              as="p"
              className="text-xs text-neutral-400 font-sans mt-0.5"
              defaultText="Let's discuss your timeline, tech stack requirements, and custom scope."
            />
          </div>
          <button
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 flex items-center gap-2 rounded-full bg-[#FF5A1F] px-6 py-3 text-xs font-bold text-black hover:bg-orange-500 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <EditableText
              id="faq-cta-btn"
              as="span"
              defaultText="Ask Nihal Directly"
            />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
