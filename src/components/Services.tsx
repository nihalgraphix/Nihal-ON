import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SERVICES } from '../data/portfolioData';
import { containerVariants, itemVariants } from './AnimatedSection';
import {
  Layout,
  Monitor,
  Code,
  Sparkles,
  Zap,
  Bot,
  CheckCircle2,
  Clock,
  ArrowRight,
  X,
  Send,
  Calendar,
  Check
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import EditableText from './EditableText';
import { useCustomization } from '../context/CustomizationContext';

export default function Services() {
  const { publishedData } = useStudio();
  const { saveContactMessage } = useCustomization();
  const elements = publishedData?.elements || {};
  const [selectedService, setSelectedService] = useState<any | null>(null);

  // Inquiry Form state
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryBudget, setInquiryBudget] = useState('$10,000 - $25,000');
  const [inquiryTimeline, setInquiryTimeline] = useState('3 - 5 Weeks');
  const [inquiryDetails, setInquiryDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Layout': return <Layout className="h-6 w-6 text-[#FF5A1F] group-hover:text-black transition-colors" />;
      case 'Monitor': return <Monitor className="h-6 w-6 text-[#FF5A1F] group-hover:text-black transition-colors" />;
      case 'Code': return <Code className="h-6 w-6 text-[#FF5A1F] group-hover:text-black transition-colors" />;
      case 'Sparkles': return <Sparkles className="h-6 w-6 text-[#FF5A1F] group-hover:text-black transition-colors" />;
      case 'Zap': return <Zap className="h-6 w-6 text-[#FF5A1F] group-hover:text-black transition-colors" />;
      case 'Bot': return <Bot className="h-6 w-6 text-[#FF5A1F] group-hover:text-black transition-colors" />;
      default: return <Sparkles className="h-6 w-6 text-[#FF5A1F] group-hover:text-black transition-colors" />;
    }
  };

  const handleOpenInquiry = (service: any) => {
    setSelectedService(service);
    setInquiryTimeline(service.estimatedTime || '3 - 5 Weeks');
    setSubmitted(false);
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryEmail.trim()) return;
    setIsSubmitting(true);
    try {
      if (saveContactMessage) {
        await saveContactMessage({
          firstName: inquiryName || 'Prospective Client',
          lastName: `[${selectedService?.title || 'Service'}]`,
          email: inquiryEmail,
          phone: inquiryBudget || '',
          country: inquiryTimeline || '',
          message: `[SERVICE INQUIRY: ${selectedService?.title || 'General'}]\nTimeline/Scope: ${inquiryTimeline}\nBudget: ${inquiryBudget}\n\nClient Details:\n${inquiryDetails}`,
        });
      }
      await fetch('/api/services/inquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceTitle: selectedService?.title,
          scope: inquiryTimeline,
          budget: inquiryBudget,
          name: inquiryName,
          email: inquiryEmail,
          details: inquiryDetails,
        }),
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="services" className="relative py-28 bg-[#060606] overflow-hidden">
      {/* Background Ambient Orbs */}
      <div className="pointer-events-none absolute bottom-1/4 right-0 h-96 w-96 rounded-full bg-[#FF5A1F]/10 blur-[150px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          data-editable-id="services-heading"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 cursor-pointer"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-space uppercase tracking-widest text-[#FF5A1F] mb-3">
              <span className="h-2 w-2 rounded-full bg-[#FF5A1F]" />
              <EditableText id="services-tag" as="span" defaultText="Core Capabilities" />
            </div>
            <EditableText
              id="services-heading-title"
              as="h2"
              className="font-syne text-3xl sm:text-5xl font-extrabold text-white tracking-tight"
              defaultText="Design & Engineering Services"
            />
          </div>
          <EditableText
            id="services-heading-desc"
            as="p"
            className="text-neutral-400 max-w-md text-sm font-sans leading-relaxed"
            defaultText="Combining creative design with modern web technologies to build clean, functional, and visually appealing digital products."
          />
        </motion.div>

        {/* Services Grid with Staggered Scroll Animation */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {SERVICES.map((service) => {
            const elId = `service-${service.id}`;
            const customEl = elements[elId];
            return (
              <motion.div
                key={service.id}
                data-editable-id={elId}
                variants={itemVariants}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                style={{
                  transform: (customEl?.spacing?.transformX || customEl?.spacing?.transformY)
                    ? `translate(${customEl?.spacing?.transformX || 0}px, ${customEl?.spacing?.transformY || 0}px)`
                    : undefined,
                }}
                className="group glass-card glass-card-hover p-8 rounded-3xl border border-white/10 flex flex-col justify-between transition-all cursor-pointer"
              >
                <div>
                  {/* Icon & Timeframe */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 group-hover:bg-[#FF5A1F] group-hover:text-black transition-colors">
                      {getIcon(service.iconName)}
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[11px] font-space text-neutral-300">
                      <Clock className="h-3 w-3 text-[#FF5A1F]" />
                      <span>{service.estimatedTime}</span>
                    </div>
                  </div>

                  <EditableText
                    id={`service-title-${service.id}`}
                    as="h3"
                    className="font-syne text-2xl font-bold text-white mb-1 group-hover:text-[#FF5A1F] transition-colors"
                    defaultText={service.title}
                  />
                  <EditableText
                    id={`service-subtitle-${service.id}`}
                    as="p"
                    className="text-xs font-space text-[#FF5A1F] mb-4 font-semibold"
                    defaultText={service.subtitle}
                  />
                  <EditableText
                    id={`service-desc-${service.id}`}
                    as="p"
                    className="text-xs text-neutral-300 font-sans leading-relaxed mb-6"
                    defaultText={service.description}
                  />

                  {/* Deliverables List */}
                  <div className="space-y-2 mb-6 pt-4 border-t border-white/10">
                    <span className="text-[10px] uppercase font-space text-neutral-500 font-bold block mb-2">
                      Key Deliverables
                    </span>
                    {service.deliverables.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-neutral-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#FF5A1F] flex-shrink-0" />
                        <EditableText
                          id={`service-deliv-${service.id}-${idx}`}
                          as="span"
                          defaultText={item}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tools & CTA */}
                <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1 max-w-[180px]">
                    {service.tools.slice(0, 3).map((tool, i) => (
                      <EditableText
                        key={i}
                        id={`service-tool-${service.id}-${i}`}
                        as="span"
                        className="text-[10px] font-space text-neutral-400 bg-white/5 px-2 py-0.5 rounded-md"
                        defaultText={tool}
                      />
                    ))}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenInquiry(service);
                    }}
                    className="flex items-center gap-1.5 rounded-full bg-[#FF5A1F] hover:bg-[#FF7A00] px-4 py-2 text-xs font-bold text-black transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#FF5A1F]/20 cursor-pointer"
                  >
                    <span>Inquire</span>
                    <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* SERVICE INQUIRY MODAL */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl"
            onClick={() => setSelectedService(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xl rounded-3xl bg-[#101114] border border-white/15 p-6 sm:p-8 shadow-2xl space-y-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-space font-bold uppercase tracking-wider text-[#FF5A1F]">
                    Direct Project Inquiry
                  </span>
                  <h3 className="font-syne text-2xl font-extrabold text-white mt-0.5">
                    {selectedService.title}
                  </h3>
                  <p className="text-xs text-neutral-400 font-sans mt-0.5">
                    {selectedService.subtitle} • {selectedService.estimatedTime}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedService(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {submitted ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#FF5A1F]/20 text-[#FF5A1F] border border-[#FF5A1F]/40 flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  <h4 className="font-syne text-xl font-bold text-white">Inquiry Dispatched!</h4>
                  <p className="text-xs text-neutral-300 max-w-sm mx-auto leading-relaxed">
                    Thank you, {inquiryName || 'founder'}! Your inquiry for <strong>{selectedService.title}</strong> has been directly delivered to Nihal&apos;s executive inbox.
                  </p>
                  <div className="pt-2 flex justify-center gap-3">
                    <button
                      onClick={() => setSelectedService(null)}
                      className="px-5 py-2.5 rounded-full bg-[#FF5A1F] text-black font-bold text-xs hover:bg-[#FF7A00] transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                    <a
                      href="https://calendly.com"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-white/20 text-white font-medium text-xs hover:bg-white/10 transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#FF5A1F]" />
                      <span>Book Quick Discovery Call</span>
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitInquiry} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-space text-neutral-400 block mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Elena Vance"
                        value={inquiryName}
                        onChange={(e) => setInquiryName(e.target.value)}
                        className="w-full bg-[#18191D] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5A1F]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-space text-neutral-400 block mb-1">Your Email</label>
                      <input
                        type="email"
                        required
                        placeholder="elena@company.com"
                        value={inquiryEmail}
                        onChange={(e) => setInquiryEmail(e.target.value)}
                        className="w-full bg-[#18191D] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5A1F]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-space text-neutral-400 block mb-1">Expected Timeline</label>
                      <select
                        value={inquiryTimeline}
                        onChange={(e) => setInquiryTimeline(e.target.value)}
                        className="w-full bg-[#18191D] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5A1F]"
                      >
                        <option value="2 - 3 Weeks">Fast Sprint (2 - 3 Weeks)</option>
                        <option value="3 - 5 Weeks">Standard Project (3 - 5 Weeks)</option>
                        <option value="6 - 8 Weeks">Comprehensive System (6 - 8 Weeks)</option>
                        <option value="Ongoing Retainer">Ongoing Strategic Retainer</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-space text-neutral-400 block mb-1">Estimated Budget</label>
                      <select
                        value={inquiryBudget}
                        onChange={(e) => setInquiryBudget(e.target.value)}
                        className="w-full bg-[#18191D] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5A1F]"
                      >
                        <option value="$5,000 - $10,000">$5,000 – $10,000</option>
                        <option value="$10,000 - $25,000">$10,000 – $25,000</option>
                        <option value="$25,000 - $50,000">$25,000 – $50,000</option>
                        <option value="$50,000+">$50,000+</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-space text-neutral-400 block mb-1">Project Details & Objective</label>
                    <textarea
                      rows={3}
                      placeholder="Briefly describe what you are looking to build or redesign..."
                      value={inquiryDetails}
                      onChange={(e) => setInquiryDetails(e.target.value)}
                      className="w-full bg-[#18191D] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FF5A1F]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] text-neutral-500 font-space">
                      Guaranteed response within 24 business hours.
                    </span>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FF5A1F] hover:bg-[#FF7A00] text-black font-space font-bold text-xs transition-all cursor-pointer shadow-lg shadow-[#FF5A1F]/30"
                    >
                      <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{isSubmitting ? 'Dispatching...' : 'Submit Inquiry'}</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
