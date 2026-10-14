import { StudioData, EditableElement } from '../types/studio';
import { PROJECTS, BLOG_POSTS, GALLERY_ITEMS, PERSONAL_INFO, aboutPortrait, SKILL_CATEGORIES } from './portfolioData';
import { DEFAULT_SECTION_SEO } from './defaultSeoData';
import aiSprintLeaderImage from '../components/image/3ebaca72-c048-4ad3-ace0-649046417171.png';

export const INITIAL_ELEMENTS: Record<string, EditableElement> = {
  // Hero section elements
  'hero-section': {
    id: 'hero-section',
    label: 'Hero Section Wrapper',
    section: 'hero',
    type: 'section',
    appearance: {
      backgroundColor: '#FF5A1F',
      borderRadius: '60px',
    },
    visible: true,
  },
  'hero-badge': {
    id: 'hero-badge',
    label: 'Hero Badge Pill',
    section: 'hero',
    parentId: 'hero-section',
    type: 'badge',
    content: {
      text: 'AI-Driven Agency',
    },
    typography: {
      fontSize: '12px',
      fontWeight: '700',
      textColor: '#000000',
    },
    appearance: {
      backgroundColor: '#FFFFFF',
      borderRadius: '9999px',
    },
    visible: true,
  },
  'hero-headline': {
    id: 'hero-headline',
    label: 'Main Headline',
    section: 'hero',
    parentId: 'hero-section',
    type: 'heading',
    content: {
      text: "I'm Nihal ON",
      subtext: "Creative Designer & Technologist",
    },
    typography: {
      fontSize: '48px',
      fontWeight: '900',
      textColor: '#FFFFFF',
      lineHeight: '1.05',
      textAlign: 'left',
    },
    spacing: {
      marginBottom: '16px',
    },
    visible: true,
  },
  'hero-subtext': {
    id: 'hero-subtext',
    label: 'Hero Subtext',
    section: 'hero',
    parentId: 'hero-section',
    type: 'text',
    content: {
      text: 'From discovery to deployment, we plug into your stack to prototype, validate, and launch AI experiences your users actually love.',
    },
    typography: {
      fontSize: '16px',
      fontWeight: '400',
      textColor: '#FFFFFFE6',
      lineHeight: '1.6',
    },
    spacing: {
      marginBottom: '24px',
    },
    visible: true,
  },
  'hero-btn-primary': {
    id: 'hero-btn-primary',
    label: 'Explore Services CTA',
    section: 'hero',
    parentId: 'hero-section',
    type: 'button',
    content: {
      text: 'Explore Services',
      link: '#services',
    },
    typography: {
      fontSize: '14px',
      fontWeight: '700',
      textColor: '#FFFFFF',
    },
    appearance: {
      backgroundColor: '#090909',
      borderRadius: '9999px',
      borderColor: '#FFFFFF1A',
      borderWidth: '1px',
    },
    spacing: {
      paddingTop: '14px',
      paddingBottom: '14px',
      paddingLeft: '32px',
      paddingRight: '32px',
    },
    visible: true,
  },
  'hero-btn-secondary': {
    id: 'hero-btn-secondary',
    label: 'Download CV CTA',
    section: 'hero',
    parentId: 'hero-section',
    type: 'button',
    content: {
      text: 'Download CV',
      link: '#resume',
    },
    typography: {
      fontSize: '14px',
      fontWeight: '700',
      textColor: '#000000',
    },
    appearance: {
      backgroundColor: '#FFFFFF',
      borderRadius: '9999px',
    },
    spacing: {
      paddingTop: '14px',
      paddingBottom: '14px',
      paddingLeft: '32px',
      paddingRight: '32px',
    },
    visible: true,
  },
  'hero-model-image': {
    id: 'hero-model-image',
    label: 'Hero Model Photo',
    section: 'hero',
    parentId: 'hero-section',
    type: 'image',
    content: {
      imageUrl: aiSprintLeaderImage,
      alt: 'Hero Model Portrait',
    },
    appearance: {
      borderRadius: '24px',
    },
    visible: true,
  },
  'hero-quote': {
    id: 'hero-quote',
    label: 'Hero Case Study Quote',
    section: 'hero',
    parentId: 'hero-section',
    type: 'text',
    content: {
      text: 'We shipped our first copilot in 7 weeks and cut support tickets by 31%. The eval dashboards made every decision obvious.',
    },
    typography: {
      fontSize: '13px',
      textColor: '#FFFFFF',
      lineHeight: '1.6',
    },
    visible: true,
  },
  'hero-growth-label': {
    id: 'hero-growth-label',
    label: 'Hero Growth Label',
    section: 'hero',
    parentId: 'hero-section',
    type: 'text',
    content: {
      text: 'OUR GROWTH',
    },
    typography: {
      fontSize: '10px',
      textColor: '#FFFFFFCC',
      fontWeight: '800',
    },
    visible: true,
  },
  'hero-growth-value': {
    id: 'hero-growth-value',
    label: 'Hero Growth Counter',
    section: 'hero',
    parentId: 'hero-section',
    type: 'text',
    content: {
      text: '150+',
    },
    typography: {
      fontSize: '64px',
      textColor: '#FFFFFF',
      fontWeight: '800',
    },
    visible: true,
  },
  'hero-client-logos': {
    id: 'hero-client-logos',
    label: 'Hero Client Logos Bar',
    section: 'hero',
    parentId: 'hero-section',
    type: 'text',
    content: {
      text: 'Calendly • classpass • GitHub • Basecamp • attentive • GUMROAD',
    },
    typography: {
      fontSize: '13px',
      textColor: '#FFFFFF',
      fontWeight: '700',
    },
    visible: true,
  },

  // Marquee & Awards Section
  'marquee-headline': {
    id: 'marquee-headline',
    label: 'Marquee Brands Headline',
    section: 'home',
    type: 'heading',
    content: {
      text: 'Trusted By Industry Pioneers & Next-Gen Brands',
    },
    typography: {
      fontSize: '12px',
      textColor: '#A1A1AA',
      fontWeight: '600',
    },
    visible: true,
  },
  'marquee-brands': {
    id: 'marquee-brands',
    label: 'Marquee Brands Ticker',
    section: 'home',
    type: 'text',
    content: {
      text: 'SupaBlox • HypeBlox • FrameBlox • UltraBlox • Aetheria AI • Fluxora Cloud • Vortex OS • Luminary Labs',
    },
    typography: {
      fontSize: '14px',
      textColor: '#E4E4E7',
    },
    visible: true,
  },
  'awards-highlight-1': {
    id: 'awards-highlight-1',
    label: 'Award 1: Awwwards Site of the Day',
    section: 'home',
    type: 'text',
    content: {
      text: 'Awwwards Site of the Day (2026) — Fluxora Cyberpunk Portal',
      subtext: 'Developer & Site of the Month Nominee',
    },
    visible: true,
  },
  'awards-highlight-2': {
    id: 'awards-highlight-2',
    label: 'Award 2: Framer Template of the Year',
    section: 'home',
    type: 'text',
    content: {
      text: 'Framer Template of the Year (2025) — FolioBlox Framer Template',
      subtext: 'Best Luxury Portfolio Category',
    },
    visible: true,
  },

  // About section elements
  'about-section': {
    id: 'about-section',
    label: 'About Section Container',
    section: 'about',
    type: 'section',
    visible: true,
  },
  'about-portrait-image': {
    id: 'about-portrait-image',
    label: 'About Portrait Photo',
    section: 'about',
    parentId: 'about-section',
    type: 'image',
    content: {
      imageUrl: aboutPortrait,
      alt: 'Nihal Portrait Photo',
    },
    appearance: {
      borderRadius: '24px',
    },
    visible: true,
  },
  'about-credentials': {
    id: 'about-credentials',
    label: 'About Credentials Card',
    section: 'about',
    type: 'text',
    content: {
      text: '6+ years\nof making things move.',
    },
    typography: {
      fontSize: '20px',
      textColor: '#FFFFFF',
      fontWeight: '700',
    },
    visible: true,
  },
  'about-selected-work': {
    id: 'about-selected-work',
    label: 'About Selected Work Card',
    section: 'about',
    type: 'text',
    content: {
      text: 'Product systems,\nwebsites & AI tools.',
    },
    typography: {
      fontSize: '20px',
      textColor: '#FFFFFF',
      fontWeight: '700',
    },
    visible: true,
  },
  'about-projects-completed': {
    id: 'about-projects-completed',
    label: 'About Projects Completed',
    section: 'about',
    type: 'text',
    content: {
      text: '150+ Projects completed\nAcross product, brand, and digital experience.',
    },
    typography: {
      fontSize: '14px',
      textColor: '#D4D4D8',
    },
    visible: true,
  },
  'about-client-satisfaction': {
    id: 'about-client-satisfaction',
    label: 'About Client Satisfaction',
    section: 'about',
    type: 'text',
    content: {
      text: '98% Client satisfaction\nBuilt through clarity, craft, and direct collaboration.',
    },
    typography: {
      fontSize: '14px',
      textColor: '#D4D4D8',
    },
    visible: true,
  },
  'about-story-title': {
    id: 'about-story-title',
    label: 'About Story Headline',
    section: 'about',
    type: 'heading',
    content: {
      text: 'From visual craft to useful code.',
    },
    typography: {
      fontSize: '20px',
      textColor: '#FFFFFF',
      fontWeight: '700',
    },
    visible: true,
  },
  'about-story-p1': {
    id: 'about-story-p1',
    label: 'About Story Paragraph 1',
    section: 'about',
    type: 'text',
    content: {
      text: 'I am a creative technologist based in Kochi, combining editorial instincts with modern full-stack engineering.',
    },
    typography: {
      fontSize: '14px',
      textColor: '#D4D4D8',
    },
    visible: true,
  },
  'about-story-p2': {
    id: 'about-story-p2',
    label: 'About Story Paragraph 2',
    section: 'about',
    type: 'text',
    content: {
      text: 'Every project is shaped around less friction, stronger storytelling, and a product people want to return to.',
    },
    typography: {
      fontSize: '14px',
      textColor: '#A1A1AA',
    },
    visible: true,
  },
  'about-work-together': {
    id: 'about-work-together',
    label: 'About Work Together Card',
    section: 'about',
    type: 'heading',
    content: {
      text: "Let's work together.",
    },
    typography: {
      fontSize: '32px',
      textColor: '#FFFFFF',
      fontWeight: '800',
    },
    visible: true,
  },
  'about-creative-direction': {
    id: 'about-creative-direction',
    label: 'About Creative Direction Card',
    section: 'about',
    type: 'heading',
    content: {
      text: 'Creative direction with technical depth.',
    },
    typography: {
      fontSize: '24px',
      textColor: '#FFFFFF',
      fontWeight: '800',
    },
    visible: true,
  },
  'about-experience-1': {
    id: 'about-experience-1',
    label: 'About Experience Role 1',
    section: 'about',
    type: 'text',
    content: {
      text: 'Lead Creative Technologist & Director\nNIHAL Creative Studio (2023 - PRESENT)',
    },
    visible: true,
  },
  'about-experience-2': {
    id: 'about-experience-2',
    label: 'About Experience Role 2',
    section: 'about',
    type: 'text',
    content: {
      text: 'Senior UI/UX Architect & Staff Engineer\nAetheria AI Labs (2021 - 2023)',
    },
    visible: true,
  },
  'about-education-1': {
    id: 'about-education-1',
    label: 'About Education 1',
    section: 'about',
    type: 'text',
    content: {
      text: 'Bachelor Degree in Computer Science & Interactive Media\nUniversity of California, Berkeley (2018 - 2022)',
    },
    visible: true,
  },
  'about-education-2': {
    id: 'about-education-2',
    label: 'About Education 2',
    section: 'about',
    type: 'text',
    content: {
      text: 'Master Degree in Human-Computer Interaction\nStanford University Center for Design Research (2022 - 2024)',
    },
    visible: true,
  },
  'about-stay-with-me': {
    id: 'about-stay-with-me',
    label: 'About Stay With Me / Profiles',
    section: 'about',
    type: 'text',
    content: {
      text: 'Stay with me\nProfiles',
    },
    visible: true,
  },
  'about-heading': {
    id: 'about-heading',
    label: 'About Section Title',
    section: 'about',
    type: 'heading',
    content: {
      text: 'Bridging Imagination & Code',
    },
    typography: {
      fontSize: '36px',
      fontWeight: '700',
      textColor: '#FFFFFF',
    },
    alignment: {
      textAlign: 'left',
    },
    visible: true,
  },
  'about-bio': {
    id: 'about-bio',
    label: 'About Narrative Bio',
    section: 'about',
    type: 'text',
    content: {
      text: 'Creative Technologist & Design Director with 6+ years transforming ambitious visions into award-winning digital experiences that feel distinctly premium.',
    },
    typography: {
      fontSize: '16px',
      fontWeight: '400',
      textColor: '#A1A1AA',
      lineHeight: '1.7',
    },
    visible: true,
  },

  // Projects section elements
  'projects-heading': {
    id: 'projects-heading',
    label: 'Projects Section Title',
    section: 'projects',
    type: 'heading',
    content: {
      text: 'Selected Works & Case Studies',
    },
    typography: {
      fontSize: '36px',
      fontWeight: '700',
      textColor: '#FFFFFF',
    },
    visible: true,
  },
  'projects-subtext': {
    id: 'projects-subtext',
    label: 'Projects Section Subtext',
    section: 'projects',
    type: 'text',
    content: {
      text: 'Obsession over micro-interactions, editorial aesthetic, and high-conversion engineering.',
    },
    typography: {
      fontSize: '16px',
      textColor: '#A1A1AA',
    },
    visible: true,
  },

  // Services section elements
  'services-heading': {
    id: 'services-heading',
    label: 'Services Section Title',
    section: 'services',
    type: 'heading',
    content: {
      text: 'High-Impact Capabilities',
    },
    typography: {
      fontSize: '36px',
      fontWeight: '700',
      textColor: '#FFFFFF',
    },
    visible: true,
  },

  // Skills section elements
  'skills-heading': {
    id: 'skills-heading',
    label: 'Skills Section Title',
    section: 'skills',
    type: 'heading',
    content: {
      text: 'Technical & Creative Arsenal',
    },
    typography: {
      fontSize: '36px',
      fontWeight: '700',
      textColor: '#FFFFFF',
    },
    visible: true,
  },

  // Blog section elements
  'blog-heading': {
    id: 'blog-heading',
    label: 'Blog Section Title',
    section: 'blog',
    type: 'heading',
    content: {
      text: 'Insights & Engineering Notes',
    },
    typography: {
      fontSize: '36px',
      fontWeight: '700',
      textColor: '#FFFFFF',
    },
    visible: true,
  },

  // Gallery section elements
  'gallery-heading': {
    id: 'gallery-heading',
    label: 'Gallery Section Title',
    section: 'gallery',
    type: 'heading',
    content: {
      text: 'Visual Archive & Exploration',
    },
    typography: {
      fontSize: '36px',
      fontWeight: '700',
      textColor: '#FFFFFF',
    },
    visible: true,
  },

  // Contact section elements
  'contact-heading': {
    id: 'contact-heading',
    label: 'Contact Section Title',
    section: 'contact',
    type: 'heading',
    content: {
      text: "Let's Engineer Something Remarkable",
    },
    typography: {
      fontSize: '36px',
      fontWeight: '700',
      textColor: '#FFFFFF',
    },
    visible: true,
  },
  'contact-subtext': {
    id: 'contact-subtext',
    label: 'Contact Subtext',
    section: 'contact',
    type: 'text',
    content: {
      text: 'Available for global advisory, design direction, and high-performance bespoke platforms.',
    },
    typography: {
      fontSize: '16px',
      textColor: '#A1A1AA',
    },
    visible: true,
  },

  // Footer elements
  'footer-tagline': {
    id: 'footer-tagline',
    label: 'Footer Tagline',
    section: 'footer',
    type: 'text',
    content: {
      text: 'Designed with obsession. Engineered for eternity.',
    },
    typography: {
      fontSize: '14px',
      textColor: '#71717A',
    },
    visible: true,
  },
  'footer-cta-call': {
    id: 'footer-cta-call',
    label: 'Footer Call Nihal CTA',
    section: 'footer',
    type: 'text',
    content: {
      text: "Call Nihal\nLet's work together",
    },
    typography: {
      fontSize: '16px',
      fontWeight: '700',
      textColor: '#FFFFFF',
    },
    visible: true,
  },
  'footer-cta-tools': {
    id: 'footer-cta-tools',
    label: 'Footer Courses & Tools CTA',
    section: 'footer',
    type: 'text',
    content: {
      text: 'Courses & Tools\nCreative tools & templates',
    },
    typography: {
      fontSize: '16px',
      fontWeight: '700',
      textColor: '#FFFFFF',
    },
    visible: true,
  },
  'footer-brand-display': {
    id: 'footer-brand-display',
    label: 'Footer Brand Title Display',
    section: 'footer',
    type: 'heading',
    content: {
      text: 'n i h a l . o n',
    },
    typography: {
      fontSize: '96px',
      fontWeight: '900',
      textColor: '#FFFFFF',
    },
    visible: true,
  },

  // Experience section
  'experience-heading': {
    id: 'experience-heading',
    label: 'Experience Section Heading',
    section: 'experience',
    type: 'heading',
    content: {
      text: 'Professional Experience',
    },
    typography: {
      fontSize: '36px',
      fontWeight: '700',
      textColor: '#FFFFFF',
    },
    visible: true,
  },
  'experience-1': {
    id: 'experience-1',
    label: 'Lead Creative Technologist Role',
    section: 'experience',
    type: 'text',
    content: {
      text: 'Lead Creative Technologist & Director\nNIHAL Creative Studio\nDirecting high-end digital design and full-stack engineering for B2B SaaS, Web3 platforms, and luxury brands.',
    },
    typography: {
      fontSize: '16px',
      textColor: '#FFFFFF',
    },
    visible: true,
  },
  'experience-2': {
    id: 'experience-2',
    label: 'Senior UI/UX Architect Role',
    section: 'experience',
    type: 'text',
    content: {
      text: 'Senior UI/UX Architect & Staff Engineer\nAetheria AI Labs\nLed the design system team for generative 3D creative suite, managing 6 product designers and 8 frontend engineers.',
    },
    typography: {
      fontSize: '16px',
      textColor: '#FFFFFF',
    },
    visible: true,
  },
  'experience-3': {
    id: 'experience-3',
    label: 'Senior Motion Developer Role',
    section: 'experience',
    type: 'text',
    content: {
      text: 'Senior Motion & Frontend Developer\nVortex Digital Agency\nCrafted interactive marketing experiences, 3D WebGL portals, and e-commerce flagship stores for Fortune 500 clients.',
    },
    typography: {
      fontSize: '16px',
      textColor: '#FFFFFF',
    },
    visible: true,
  },

  // Testimonials section
  'testimonials-heading': {
    id: 'testimonials-heading',
    label: 'Testimonials Section Heading',
    section: 'testimonials',
    type: 'heading',
    content: {
      text: 'What Founders & Leaders Say',
    },
    typography: {
      fontSize: '36px',
      fontWeight: '700',
      textColor: '#FFFFFF',
    },
    visible: true,
  },
  'testimonial-1': {
    id: 'testimonial-1',
    label: 'Marcus Thorne Endorsement',
    section: 'testimonials',
    type: 'text',
    content: {
      text: 'Marcus Thorne\nChief Marketing Officer // Fluxora Global\n"Nihal . ON is in a league of his own. He took our rough concept and created an Awwwards-worthy portal that immediately established our enterprise credibility."',
    },
    typography: {
      fontSize: '14px',
      textColor: '#E4E4E7',
    },
    visible: true,
  },
  'testimonial-2': {
    id: 'testimonial-2',
    label: 'Dr. Elena Rostova Endorsement',
    section: 'testimonials',
    type: 'text',
    content: {
      text: 'Dr. Elena Rostova\nVP of Design // Aetheria AI\n"Rarely do you find a designer who can write rock-solid TypeScript and implement complex WebGL motion smoothly. Nihal . ON delivered beyond all expectations."',
    },
    typography: {
      fontSize: '14px',
      textColor: '#E4E4E7',
    },
    visible: true,
  },
  'testimonial-3': {
    id: 'testimonial-3',
    label: 'David Chen Endorsement',
    section: 'testimonials',
    type: 'text',
    content: {
      text: 'David Chen\nFounder & CEO // Krypton Web3\n"Working with Nihal . ON felt like having an entire Apple-level design team at our fingertips. Our conversion rate increased by 185% in month one."',
    },
    typography: {
      fontSize: '14px',
      textColor: '#E4E4E7',
    },
    visible: true,
  },

  // Stats section
  'stats-card-1': {
    id: 'stats-card-1',
    label: 'Stats Metric 150+ Projects',
    section: 'stats',
    type: 'text',
    content: {
      text: '150+\nProjects Completed\nWeb apps, design systems & mobile',
    },
    typography: {
      fontSize: '28px',
      fontWeight: '800',
      textColor: '#FFFFFF',
    },
    visible: true,
  },
  'stats-card-2': {
    id: 'stats-card-2',
    label: 'Stats Metric 98% Satisfaction',
    section: 'stats',
    type: 'text',
    content: {
      text: '98%\nClient Satisfaction\n5-star rating on all case studies',
    },
    typography: {
      fontSize: '28px',
      fontWeight: '800',
      textColor: '#FF5A1F',
    },
    visible: true,
  },
  'stats-card-3': {
    id: 'stats-card-3',
    label: 'Stats Metric 50+ Clients',
    section: 'stats',
    type: 'text',
    content: {
      text: '50+\nGlobal Clients\nSilicon Valley, London, Paris, Tokyo',
    },
    typography: {
      fontSize: '28px',
      fontWeight: '800',
      textColor: '#FFFFFF',
    },
    visible: true,
  },
  'stats-card-4': {
    id: 'stats-card-4',
    label: 'Stats Metric 6+ Years Experience',
    section: 'stats',
    type: 'text',
    content: {
      text: '6+\nYears Experience\nSenior creative & full-stack role',
    },
    typography: {
      fontSize: '28px',
      fontWeight: '800',
      textColor: '#FFFFFF',
    },
    visible: true,
  },
  'stats-pulse-heading': {
    id: 'stats-pulse-heading',
    label: 'GitHub Pulse & Rhythm',
    section: 'stats',
    type: 'text',
    content: {
      text: 'Live Open Source Pulse\nContinuous Commit & Innovation Rhythm\n1,840 Commits in 2026 • 2.4k GitHub Stars',
    },
    typography: {
      fontSize: '16px',
      fontWeight: '600',
      textColor: '#FFFFFF',
    },
    visible: true,
  },

  // FAQ section
  'faq-heading': {
    id: 'faq-heading',
    label: 'FAQ Section Heading',
    section: 'faq',
    type: 'heading',
    content: {
      text: 'Frequently Asked Questions',
    },
    typography: {
      fontSize: '36px',
      fontWeight: '700',
      textColor: '#FFFFFF',
    },
    visible: true,
  },

  // Process section
  'process-heading': {
    id: 'process-heading',
    label: 'Process Section Heading',
    section: 'process',
    type: 'heading',
    content: {
      text: 'An 8-Step Blueprint For Digital Excellence',
    },
    typography: {
      fontSize: '36px',
      fontWeight: '700',
      textColor: '#FFFFFF',
    },
    visible: true,
  },
  'process-step-01': {
    id: 'process-step-01',
    label: 'Process Step 01 Discovery',
    section: 'process',
    type: 'text',
    content: {
      text: '01 Discovery & Alignment\nPhase Horizon: Week 1\nDeep dive into business objectives, brand strategy, target audience, and competitive landscape.\nDeliverables: In-depth strategy call & scope mapping, Competitor & visual moodboard audit, Project roadmap & milestone definition',
    },
    typography: {
      fontSize: '16px',
      textColor: '#FFFFFF',
    },
    visible: true,
  },
};

export const DEFAULT_STUDIO_DATA: StudioData = {
  siteSettings: {
    siteTitle: `${PERSONAL_INFO.name} // Portfolio`,
    siteDescription: "Award-winning dark futuristic portfolio website featuring editorial layouts, glassmorphism, interactive case studies, and visual builder.",
    authorName: PERSONAL_INFO.name,
    authorTitle: PERSONAL_INFO.title,
    authorTagline: PERSONAL_INFO.tagline,
    location: PERSONAL_INFO.location,
    status: PERSONAL_INFO.status,
    email: PERSONAL_INFO.email,
    phone: PERSONAL_INFO.phone,
    github: PERSONAL_INFO.github,
    linkedin: PERSONAL_INFO.linkedin,
    twitter: PERSONAL_INFO.twitter,
    instagram: PERSONAL_INFO.instagram,
    behance: PERSONAL_INFO.behance,
    dribbble: PERSONAL_INFO.dribbble,
    calendly: PERSONAL_INFO.calendly,
    showAdminButton: true,
    adminButtonLabel: "Admin",
    adminButtonPosition: "bottom-left",
    ogImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
    sectionSeo: DEFAULT_SECTION_SEO,
  },
  designTokens: {
    primaryAccent: "#FF5A1F",
    secondaryAccent: "#FF8A00",
    backgroundDark: "#060606",
    surfaceDark: "#111214",
    panelDark: "#17181B",
    borderDark: "#2C2E34",
    textPrimary: "#F4F4F5",
    textSecondary: "#A1A1AA",
    borderRadius: "8px",
  },
  elements: INITIAL_ELEMENTS,
  projects: PROJECTS,
  blogPosts: BLOG_POSTS,
  galleryItems: GALLERY_ITEMS,
  skillCategories: SKILL_CATEGORIES,
};

