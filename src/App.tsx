import { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { motion, useScroll, useSpring } from 'motion/react';
import { PROJECTS } from './data/portfolioData';
import CustomCursor from './components/CustomCursor';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import About from './components/About';
import Projects from './components/Projects';
import CaseStudyModal from './components/CaseStudyModal';
import Services from './components/Services';
import Process from './components/Process';
import Skills from './components/Skills';
import Experience from './components/Experience';
import Testimonials from './components/Testimonials';
import Blog from './components/Blog';
import Gallery from './components/Gallery';
import Stats from './components/Stats';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AiAssistantModal from './components/AiAssistantModal';
import ResumeModal from './components/ResumeModal';
import GalleryFullscreenModal from './components/GalleryFullscreenModal';
import { StudioProvider, useStudio } from './context/StudioContext';
import { CustomizationProvider } from './context/CustomizationContext';
import StudioShell from './components/studio/StudioShell';
import AdminFloatingButton from './components/studio/AdminFloatingButton';
import AdminDashboard from './components/AdminDashboard';
import SeoHeadSync from './components/SeoHeadSync';
import PortfolioContextMenu from './components/PortfolioContextMenu';

function PortfolioMain() {
  const { publishedData, trackEvent, isStudioOpen, isAdminButtonVisible, toggleAdminButton } = useStudio();
  const [activeSection, setActiveSection] = useState<string>('home');
  const [galleryModalOpen, setGalleryModalOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState<boolean>(false);
  const [resumeModalOpen, setResumeModalOpen] = useState<boolean>(false);

  // Global Key Listener: 'Windows + Shift + A' to toggle Admin button, and deny Inspect / View Source
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const keyLower = e.key?.toLowerCase();
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // 1. DENY Code Inspection & Source Viewing:
      // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S (and Mac Cmd equivalents)
      if (
        e.key === 'F12' ||
        (isCtrlOrMeta && e.shiftKey && (keyLower === 'i' || keyLower === 'j' || keyLower === 'c')) ||
        (isCtrlOrMeta && (keyLower === 'u' || keyLower === 's'))
      ) {
        e.preventDefault();
        e.stopPropagation();
        window.dispatchEvent(new CustomEvent('inspect-denied'));
        return false;
      }

      // 2. 'Windows + Shift + A' Key Combination:
      // Correctly toggles the visibility state of the admin floating button
      const isKeyA = keyLower === 'a' || e.code === 'KeyA';
      const hasShift = e.shiftKey;
      const hasWinOrMeta =
        e.metaKey ||
        (typeof e.getModifierState === 'function' &&
          (e.getModifierState('Meta') || e.getModifierState('OS') || e.getModifierState('Win')));
      const hasModifier = hasWinOrMeta || e.ctrlKey || e.altKey;

      if (isKeyA && hasShift && hasModifier) {
        e.preventDefault();
        e.stopPropagation();
        toggleAdminButton();
      }
    };

    const handleGlobalContextMenu = (e: MouseEvent) => {
      // Completely remove default browser right-click across the entire page
      e.preventDefault();
    };

    window.addEventListener('keydown', handleGlobalKeyDown, { capture: true });
    document.addEventListener('keydown', handleGlobalKeyDown, { capture: true });
    window.addEventListener('contextmenu', handleGlobalContextMenu, { capture: true });
    document.addEventListener('contextmenu', handleGlobalContextMenu, { capture: true });

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown, { capture: true });
      document.removeEventListener('keydown', handleGlobalKeyDown, { capture: true });
      window.removeEventListener('contextmenu', handleGlobalContextMenu, { capture: true });
      document.removeEventListener('contextmenu', handleGlobalContextMenu, { capture: true });
    };
  }, [toggleAdminButton]);

  // Active project object (from live studio data or default)
  const currentProjects = publishedData?.projects && publishedData.projects.length > 0
    ? publishedData.projects
    : PROJECTS;
  const activeProject = currentProjects.find(p => p.id === selectedProjectId) || null;

  // Track initial page view event (skips if admin is editing)
  useEffect(() => {
    trackEvent('pageview');
  }, [trackEvent]);

  const lenisRef = useRef<Lenis | null>(null);

  // Initialize Lenis Smooth Scrolling safely
  useEffect(() => {
    let animationFrameId: number;

    try {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.5,
      });
      lenisRef.current = lenis;

      function raf(time: number) {
        if (lenis) lenis.raf(time);
        animationFrameId = requestAnimationFrame(raf);
      }

      animationFrameId = requestAnimationFrame(raf);
    } catch (err) {
      console.warn('Lenis smooth scroll note:', err);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (lenisRef.current) lenisRef.current.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Pause Lenis when Studio is open so mouse wheel scrolling works inside studio and panels
  useEffect(() => {
    if (lenisRef.current) {
      if (isStudioOpen) {
        lenisRef.current.stop();
      } else {
        lenisRef.current.start();
      }
    }
  }, [isStudioOpen]);

  // Top Progress Bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // ScrollSpy listener to update active nav tab automatically
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        'home',
        'projects',
        'about',
        'services',
        'process',
        'skills',
        'experience',
        'blog',
        'gallery',
        'faq',
        'contact'
      ];

      const scrollPosition = window.scrollY + 250;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Section animation variants for ultra-smooth scroll reveals
  const sectionVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.985,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: 'easeOut' as const,
      },
    },
  };

  return (
    <div className="relative min-h-screen bg-[#060606] text-[#E0E0E0] selection:bg-[#FF5A1F] selection:text-black font-sans antialiased">
      {/* Real-time Dynamic Section SEO & OpenGraph Head Synchronizer */}
      <SeoHeadSync />

      {/* Top Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#FF5A1F] via-[#FF8A00] to-[#FF5A1F] z-[100] origin-left shadow-[0_0_12px_#FF5A1F]"
        style={{ scaleX }}
      />

      {/* Precision Custom Cursor & Glow Follow */}
      <CustomCursor soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />

      {/* Global Right-Click Context Menu */}
      <PortfolioContextMenu
        onOpenResumeModal={() => setResumeModalOpen(true)}
        onOpenAiModal={() => setAiModalOpen(true)}
        onOpenGallery={() => setGalleryModalOpen(true)}
      >
        {/* Sticky Header Navigation */}
        <Navbar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          onOpenAiModal={() => setAiModalOpen(true)}
          onOpenResumeModal={() => setResumeModalOpen(true)}
        />

        {/* Main Page Sections with Scroll Animations */}
        <main>
        <Hero
          onSelectProject={(id) => {
            trackEvent('project_click', id);
            setSelectedProjectId(id);
          }}
          onOpenResumeModal={() => {
            trackEvent('cv_download', 'Hero CV Button');
            setResumeModalOpen(true);
          }}
        />
        <Marquee />
        
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1, margin: "-40px" }}
          variants={sectionVariants}
        >
          <About onOpenResumeModal={() => {
            trackEvent('cv_download', 'About CV Button');
            setResumeModalOpen(true);
          }} />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1, margin: "-40px" }}
          variants={sectionVariants}
        >
          <Projects onSelectProject={(id) => {
            trackEvent('project_click', id);
            setSelectedProjectId(id);
          }} />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1, margin: "-40px" }}
          variants={sectionVariants}
        >
          <Services />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1, margin: "-40px" }}
          variants={sectionVariants}
        >
          <Process />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1, margin: "-40px" }}
          variants={sectionVariants}
        >
          <Skills />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1, margin: "-40px" }}
          variants={sectionVariants}
        >
          <Experience />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1, margin: "-40px" }}
          variants={sectionVariants}
        >
          <Testimonials />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1, margin: "-40px" }}
          variants={sectionVariants}
        >
          <Blog />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1, margin: "-40px" }}
          variants={sectionVariants}
        >
          <Gallery
            onOpenGalleryPage={() => {
              setGalleryModalOpen(true);
            }}
          />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1, margin: "-40px" }}
          variants={sectionVariants}
        >
          <Stats />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1, margin: "-40px" }}
          variants={sectionVariants}
        >
          <FAQ />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1, margin: "-40px" }}
          variants={sectionVariants}
        >
          <Contact />
        </motion.div>
      </main>

      {/* Footer */}
      <Footer setActiveSection={setActiveSection} />
      </PortfolioContextMenu>

      {/* Modals & Fullscreen Overlays */}
      <CaseStudyModal
        project={activeProject}
        onClose={() => setSelectedProjectId(null)}
        onSelectNextProject={(id) => {
          trackEvent('project_click', id);
          setSelectedProjectId(id);
        }}
      />

      <AiAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
      />

      <ResumeModal
        isOpen={resumeModalOpen}
        onClose={() => setResumeModalOpen(false)}
      />

      {/* Fullspace Covering Gallery Modal Popup */}
      <GalleryFullscreenModal
        isOpen={galleryModalOpen}
        onClose={() => setGalleryModalOpen(false)}
      />

      {/* Floating Admin Button in Bottom-Left */}
      <AdminFloatingButton />

      {/* Full Portfolio Admin Studio Shell */}
      <StudioShell />

      {/* Admin Dashboard / Live Div Mover Modal */}
      <AdminDashboard />
    </div>
  );
}

export default function App() {
  return (
    <CustomizationProvider>
      <StudioProvider>
        <PortfolioMain />
      </StudioProvider>
    </CustomizationProvider>
  );
}
