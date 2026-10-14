import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PROJECTS } from '../data/portfolioData';
import { ChevronLeft, ChevronRight, ArrowUpRight, Sparkles, Circle, Crosshair } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import EditableText from './EditableText';

import projSunglasses1 from '../assets/images/proj_sunglasses_1_1785549548646.jpg';
import projSilhouette2 from '../assets/images/proj_silhouette_2_1785549562035.jpg';
import projChain3 from '../assets/images/proj_chain_3_1785549576796.jpg';
import projModel4 from '../assets/images/proj_model_4_1785549589023.jpg';
import projEyewear5 from '../assets/images/proj_eyewear_5_1785549608139.jpg';
import projManShades6 from '../assets/images/proj_man_shades_6_1785549620013.jpg';

interface ProjectsProps {
  onSelectProject: (id: string) => void;
}

export default function Projects({ onSelectProject }: ProjectsProps) {
  const { publishedData } = useStudio();
  const currentProjects = publishedData?.projects && publishedData.projects.length > 0 ? publishedData.projects : [];
  const [currentPage, setCurrentPage] = useState<number>(0);

  const fallbackImages = [projSunglasses1, projSilhouette2, projChain3, projModel4, projEyewear5, projManShades6];
  const cardTypes = ["sunglasses-1", "silhouette-2", "chain-3", "model-4", "eyewear-5", "man-shades-6"];

  const projectSets: Array<Array<{
    id: string;
    cardType: string;
    title: string;
    category: string;
    image: string;
    projectRef: any;
  }>> = [];

  const pageSize = 6;
  for (let i = 0; i < currentProjects.length; i += pageSize) {
    const chunk = currentProjects.slice(i, i + pageSize);
    projectSets.push(
      chunk.map((proj, idx) => ({
        id: proj.id,
        cardType: cardTypes[idx % cardTypes.length],
        title: proj.title,
        category: proj.category,
        image: proj.coverImage || fallbackImages[idx % fallbackImages.length],
        projectRef: proj,
      }))
    );
  }

  const totalPages = Math.max(1, projectSets.length);

  const handlePrev = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  const currentCards = projectSets[currentPage] || [];

  return (
    <section id="projects" className="relative py-20 sm:py-28 bg-[#000000] text-white overflow-hidden">
      {/* Subtle background ambient orange glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] rounded-full bg-[#FF5A1F]/5 blur-[180px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header & Top Navigation with Scrolling Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 sm:mb-14">
          <div className="flex items-center gap-6">
            <span className="text-xs font-space text-neutral-400 uppercase tracking-widest flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#FF5A1F] animate-pulse" />
              • Social Media
            </span>
            <span className="text-xs font-space text-neutral-400 uppercase tracking-widest hidden sm:inline">
              • Stories
            </span>
          </div>

          {/* Scrolling Controls Bar */}
          <div className="flex items-center gap-4 self-end sm:self-auto">
            <span className="text-xs font-space font-mono text-neutral-400 uppercase tracking-widest">
              PAGE 0{currentPage + 1} / 0{totalPages}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                aria-label="Previous Projects"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#121212] text-white hover:bg-[#FF5A1F] hover:text-black hover:border-[#FF5A1F] transition-all active:scale-95 shadow-lg cursor-pointer"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                onClick={handleNext}
                aria-label="Next Projects"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#121212] text-white hover:bg-[#FF5A1F] hover:text-black hover:border-[#FF5A1F] transition-all active:scale-95 shadow-lg cursor-pointer"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 2x3 Grid Container */}
        {currentCards.length === 0 ? (
          <div className="w-full py-20 px-6 text-center rounded-3xl bg-[#0a0a0d] border border-white/10 flex flex-col items-center justify-center space-y-3 my-4 min-h-[300px]">
            <Sparkles className="w-10 h-10 text-[#FF5A1F]/60" />
            <h3 className="font-syne text-xl font-bold text-white">No Projects Published Yet</h3>
            <p className="text-xs text-neutral-400 max-w-md font-sans">
              Projects and case studies created in the Admin Dashboard will automatically display here.
            </p>
          </div>
        ) : (
          <div className="relative overflow-hidden min-h-[700px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8"
            >
              {currentCards.map((card, index) => (
                <motion.div
                  key={`${card.id}-${index}`}
                  initial={{ opacity: 0, y: 35, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => onSelectProject(card.projectRef.id)}
                  className="group relative cursor-pointer aspect-[2/3] w-full rounded-2xl overflow-hidden bg-[#0A0A0A] border border-white/10 shadow-2xl hover:border-[#FF5A1F]/60 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-between p-5 select-none"
                >
                  {/* Background Image */}
                  <img
                    src={card.image}
                    alt={card.title}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 h-full w-full object-cover object-center filter brightness-95 contrast-105 group-hover:scale-105 transition-transform duration-700 ease-out"
                  />

                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 group-hover:opacity-60 transition-opacity" />

                  {/* Hover Action Highlight Pill */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px] z-30">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#FF5A1F] px-5 py-2.5 text-xs font-bold font-syne text-black shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                      <span>OPEN CASE STUDY</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>

                  {/* CARD 1 OVERLAY (Top Left) */}
                  {card.cardType === "sunglasses-1" && (
                    <>
                      <div className="relative z-10 flex items-center justify-between text-neutral-300 font-mono text-[10px] tracking-wider uppercase">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/30 text-[9px]">⦿</span>
                        <span>SUNGLASSES</span>
                      </div>
                      <div className="relative z-10 pt-4 border-t border-white/10">
                        <span className="text-[10px] font-mono text-neutral-400 block uppercase">Project // 01</span>
                        <h4 className="font-syne text-lg font-extrabold text-white group-hover:text-[#FF5A1F] transition-colors">{card.title}</h4>
                      </div>
                    </>
                  )}

                  {/* CARD 2 OVERLAY (Top Middle) */}
                  {card.cardType === "silhouette-2" && (
                    <>
                      <div className="relative z-10 flex items-center justify-between text-neutral-200 font-mono text-[10px] tracking-wider uppercase">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/30 text-[9px]">⦿</span>
                        <span>SUNGLASSES</span>
                      </div>

                      {/* HUD Technical Crosshair Callouts */}
                      <div className="relative z-10 my-auto space-y-4 px-2">
                        <div className="flex items-center gap-2 text-[9px] font-mono text-white/80">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#FF5A1F]" />
                          <span>+ ARTWORK</span>
                          <span className="h-[1px] flex-grow bg-white/20" />
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-mono text-white/80 justify-end">
                          <span className="h-[1px] flex-grow bg-white/20" />
                          <span>+ SPECS</span>
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        </div>
                      </div>

                      <div className="relative z-10 flex items-center justify-between text-[9px] font-mono text-neutral-300 tracking-widest uppercase border-t border-white/10 pt-3">
                        <span>PHOTO BY</span>
                        <span className="font-bold text-white">DEAN GIFFIN</span>
                      </div>
                    </>
                  )}

                  {/* CARD 3 OVERLAY (Top Right) */}
                  {card.cardType === "chain-3" && (
                    <>
                      <div className="relative z-10 text-center pt-2">
                        <span className="font-syne text-sm font-extrabold tracking-widest text-white uppercase block">
                          NEW ACCESSORIES
                        </span>
                      </div>

                      <div className="relative z-10 text-center space-y-2 pb-2">
                        <div className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-[#FF5A1F] mx-auto bg-black/30 backdrop-blur-md">
                          ✦
                        </div>
                        <span className="font-mono text-[10px] font-bold tracking-widest text-white uppercase block">
                          COMING SOON
                        </span>
                      </div>
                    </>
                  )}

                  {/* CARD 4 OVERLAY (Bottom Left) */}
                  {card.cardType === "model-4" && (
                    <>
                      {/* Left Side Vertical Text */}
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 transform -rotate-90 origin-left text-[10px] font-mono tracking-widest text-neutral-300 uppercase whitespace-nowrap">
                        NEW COLLECTION // 13.03
                      </div>

                      <div className="relative z-10 flex items-center justify-between text-neutral-300 font-mono text-[10px] tracking-wider uppercase">
                        <span className="ml-auto">26</span>
                      </div>

                      <div className="relative z-10">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/40 text-white text-[10px]">⦿</span>
                      </div>
                    </>
                  )}

                  {/* CARD 5 OVERLAY (Bottom Middle) */}
                  {card.cardType === "eyewear-5" && (
                    <>
                      <div className="relative z-10 flex items-center justify-between text-neutral-300 font-mono text-[10px] tracking-wider uppercase">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/30 text-[9px]">⦿</span>
                        <span>SUNGLASSES</span>
                      </div>

                      <div className="relative z-10 space-y-3">
                        <h3 className="font-syne text-xl font-black uppercase text-white leading-tight">
                          SUN'S OUT,<br />SHADES ON
                        </h3>
                      </div>

                      <div className="relative z-10 border-t border-white/10 pt-3">
                        <p className="font-sans text-[10px] text-neutral-300 leading-relaxed uppercase tracking-wider font-medium">
                          DISCOVER OUR PERMANENT COLLECTION IN OUR STORES AND ON OUBA.COM
                        </p>
                      </div>
                    </>
                  )}

                  {/* CARD 6 OVERLAY (Bottom Right) */}
                  {card.cardType === "man-shades-6" && (
                    <>
                      <div className="relative z-10 flex items-center justify-between text-neutral-300 font-mono text-[10px] tracking-wider uppercase">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/30 text-[9px]">⦿</span>
                        <span>SUNGLASSES</span>
                      </div>

                      <div className="relative z-10 space-y-2 mt-auto pb-4">
                        <h3 className="font-syne text-xl font-black uppercase text-white tracking-wide">
                          FOWLER 4
                        </h3>
                        <p className="font-sans text-[10px] text-neutral-300 leading-normal max-w-[220px]">
                          Sunglasses in monochrome orange acetate. Cat eye shape. Brown gradient tint 2-base lenses with anti-reflective treatment.
                        </p>
                      </div>

                      <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-2 font-mono text-[10px] text-neutral-400">
                        <span>FW 26</span>
                        <span className="text-white font-bold">HANDMADE</span>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

        {/* Bottom Scroll / Pagination Bar */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
          <div className="text-xs font-mono text-neutral-400">
            • Img by pinterest / Editorial Portfolio Series
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              className="px-5 py-2.5 rounded-full border border-white/15 bg-[#121212] text-xs font-space font-bold text-white hover:bg-[#FF5A1F] hover:text-black hover:border-[#FF5A1F] transition-all cursor-pointer"
            >
              ← Previous Set
            </button>
            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-full border border-white/15 bg-[#FF5A1F] text-xs font-space font-bold text-black hover:bg-white transition-all cursor-pointer shadow-lg shadow-[#FF5A1F]/20"
            >
              Next Set →
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}

