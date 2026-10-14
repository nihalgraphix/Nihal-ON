import { SectionSeoMap } from '../types/studio';

export const SECTION_METADATA_DEFINITIONS: Record<string, { label: string; routeHash: string; icon: string; description: string }> = {
  global: {
    label: "Global / Home Default",
    routeHash: "#home",
    icon: "Globe",
    description: "Default fallback meta tags and social card displayed when no specific section hash is active."
  },
  hero: {
    label: "Hero Section",
    routeHash: "#home",
    icon: "Sparkles",
    description: "Main above-the-fold introductory showcase, headline, value proposition, and primary CTAs."
  },
  about: {
    label: "About Section",
    routeHash: "#about",
    icon: "User",
    description: "Executive biography, design philosophy, years of experience, and leadership track record."
  },
  projects: {
    label: "Selected Projects & Works",
    routeHash: "#projects",
    icon: "FolderKanban",
    description: "Case studies, interactive prototypes, client outcomes, and architectural breakthroughs."
  },
  services: {
    label: "Capabilities & Services",
    routeHash: "#services",
    icon: "Sliders",
    description: "Core technical capabilities: UX/UI design, full-stack web engineering, 3D WebGL, and AI copilot development."
  },
  process: {
    label: "8-Step Blueprint Process",
    routeHash: "#process",
    icon: "Workflow",
    description: "Methodology from discovery and sprint planning to zero-bug deployment and warranty."
  },
  skills: {
    label: "Tools & Skills Matrix",
    routeHash: "#skills",
    icon: "BarChart3",
    description: "Proficiency levels across React 19, Next.js, Three.js, GSAP, Tailwind, and Cloud services."
  },
  experience: {
    label: "Career Experience & Milestones",
    routeHash: "#experience",
    icon: "Briefcase",
    description: "Chronological history of leadership positions, startup exits, and key contributions."
  },
  testimonials: {
    label: "Client Endorsements & Trust",
    routeHash: "#testimonials",
    icon: "MessageSquareQuote",
    description: "Social proof, verified client testimonials from founders and engineering leaders."
  },
  blog: {
    label: "Journal & Engineering Insights",
    routeHash: "#blog",
    icon: "BookOpen",
    description: "Technical essays on modern frontend engineering, animation physics, and interface design."
  },
  gallery: {
    label: "Visual Gallery & Archive",
    routeHash: "#gallery",
    icon: "Image",
    description: "Visual experiments, high-resolution renders, branding artifacts, and conceptual typography."
  },
  stats: {
    label: "Performance & Impact Metrics",
    routeHash: "#stats",
    icon: "TrendingUp",
    description: "Quantifiable project metrics, user scale figures, and international design awards."
  },
  faq: {
    label: "FAQ & Collaboration",
    routeHash: "#faq",
    icon: "HelpCircle",
    description: "Answers to questions on contract terms, time zones, pricing models, and tech stack compatibility."
  },
  contact: {
    label: "Contact & Discovery Booking",
    routeHash: "#contact",
    icon: "Mail",
    description: "Inquiry channel, calendar scheduling, and direct communication for enterprise partnerships."
  }
};

export const DEFAULT_SECTION_SEO: SectionSeoMap = {
  global: {
    metaTitle: "Nihal . ON — Principal Designer & Creative Developer",
    metaDescription: "Award-winning dark luxury portfolio of Nihal . ON. Crafting spatial digital experiences, high-performance web applications, and AI-driven interfaces.",
    ogTitle: "Nihal . ON — Principal UX Architect & Creative Technologist",
    ogDescription: "Explore selected works, interactive case studies, design systems, and digital engineering by Nihal . ON.",
    ogImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
    ogType: "website",
    twitterCard: "summary_large_image",
    keywords: "Nihal on, muhaammed nihalon, nihal, on, nihal chakkaraparambu, nihal, othalakuzhy, nihal2010, nihal on 2010, nihaldeveloper, nihal.graphix, Creative Developer, UX Architect, React 19, Next.js, Three.js, Portfolio, AI Engineer",
    canonicalUrl: "https://nihal-on.vercel.app/",
    structuredDataType: "WebApplication"
  },
  hero: {
    metaTitle: "Nihal . ON — Creative Technologist & Spatial UI Engineer",
    metaDescription: "From concept to deployment, building award-winning web products, fluid spring animations, and high-impact digital experiences.",
    ogTitle: "Nihal . ON — Spatial & High-Impact Digital Experiences",
    ogDescription: "Available for Q3/Q4 Enterprise Projects & Advisory. Discover cutting-edge frontend engineering and design systems.",
    ogImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
    ogType: "website",
    twitterCard: "summary_large_image",
    keywords: "Nihal ON, Spatial UI, WebGL, Creative Engineering, Hero Section",
    canonicalUrl: "https://nihal-on.vercel.app/#home",
    structuredDataType: "WebApplication"
  },
  about: {
    metaTitle: "About Nihal . ON — Philosophy, Background & Craft",
    metaDescription: "With over 8 years at the vanguard of digital product architecture, transforming ambitious visions into award-winning interfaces.",
    ogTitle: "About Nihal . ON — Design & Engineering Craft",
    ogDescription: "Discover Nihal's design philosophy, engineering stack, and milestones across top-tier digital agencies.",
    ogImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop",
    ogType: "profile",
    twitterCard: "summary_large_image",
    keywords: "About Nihal, UX Philosophy, Creative Director, Full Stack Developer, Bio",
    canonicalUrl: "https://nihal-on.vercel.app/#about",
    structuredDataType: "Person"
  },
  projects: {
    metaTitle: "Selected Projects & Case Studies — Nihal . ON",
    metaDescription: "Explore interactive case studies in AI copilot dashboards, 3D spatial commerce, design systems, and WebGL experiences.",
    ogTitle: "Featured Case Studies & Digital Works — Nihal . ON",
    ogDescription: "Deep dive into architecture, metrics, and interactive prototypes built with React, Three.js, and GSAP.",
    ogImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
    ogType: "website",
    twitterCard: "summary_large_image",
    keywords: "Portfolio Projects, Case Studies, UI Design, React Web Apps, Three.js Demo",
    canonicalUrl: "https://nihal-on.vercel.app/#projects",
    structuredDataType: "ItemList"
  },
  services: {
    metaTitle: "Design & Development Capabilities — Nihal . ON",
    metaDescription: "Full-stack frontend architecture, generative AI interfaces, 3D WebGL motion, and enterprise design system consulting.",
    ogTitle: "Services & Capabilities — Nihal . ON Studio",
    ogDescription: "High-performance web architecture, interaction design, and AI copilot integration for modern digital brands.",
    ogImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop",
    ogType: "website",
    twitterCard: "summary_large_image",
    keywords: "Web Development Services, UI UX Consulting, Creative Technologist For Hire, Design Systems",
    canonicalUrl: "https://nihal-on.vercel.app/#services",
    structuredDataType: "WebApplication"
  },
  process: {
    metaTitle: "8-Step Blueprint For Digital Excellence — Nihal . ON",
    metaDescription: "A structured, transparent engineering process from discovery and wireframing to rapid prototyping and production deployment.",
    ogTitle: "The 8-Step Product Blueprint — Nihal . ON",
    ogDescription: "How we collaborate to build Lighthouse 95+ rated digital products on time and with zero critical bugs.",
    ogImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop",
    ogType: "website",
    twitterCard: "summary_large_image",
    keywords: "Development Process, Agile Sprint, UI/UX Workflow, Software Architecture Blueprint",
    canonicalUrl: "https://nihal-on.vercel.app/#process",
    structuredDataType: "CreativeWork"
  },
  skills: {
    metaTitle: "Tools & Mastery Matrix — Nihal . ON Tech Stack",
    metaDescription: "Comprehensive matrix of frontend technologies: React 19, Next.js 15, TypeScript, Tailwind CSS, Three.js, GSAP, and Gemini API.",
    ogTitle: "Technical Proficiency Matrix — Nihal . ON",
    ogDescription: "Verified mastery across modern web standards, animation physics, and cloud platforms.",
    ogImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
    ogType: "website",
    twitterCard: "summary_large_image",
    keywords: "React 19, Next.js 15, TypeScript, Tailwind CSS, Three.js, GSAP, Technical Skills",
    canonicalUrl: "https://nihal-on.vercel.app/#skills",
    structuredDataType: "WebApplication"
  },
  experience: {
    metaTitle: "Career & Leadership Milestones — Nihal . ON",
    metaDescription: "Proven track record as Lead Creative Technologist and Senior UI/UX Architect across high-growth startups and creative agencies.",
    ogTitle: "Experience & Track Record — Nihal . ON",
    ogDescription: "8+ years delivering enterprise portals, scaling user bases to 320K+, and winning international design awards.",
    ogImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop",
    ogType: "profile",
    twitterCard: "summary_large_image",
    keywords: "Career History, Senior Frontend Engineer, Creative Technologist Experience, Resume",
    canonicalUrl: "https://nihal-on.vercel.app/#experience",
    structuredDataType: "Person"
  },
  testimonials: {
    metaTitle: "Client Reviews & Endorsements — Nihal . ON",
    metaDescription: "What founders, CMOs, and engineering leaders say about collaborating with Nihal on flagship digital products.",
    ogTitle: "Client Endorsements & Proof — Nihal . ON",
    ogDescription: "100% client satisfaction across 45+ enterprise ventures and funded startups worldwide.",
    ogImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop",
    ogType: "website",
    twitterCard: "summary_large_image",
    keywords: "Client Testimonials, Reviews, Enterprise Recommendations, Nihal ON Feedback",
    canonicalUrl: "https://nihal-on.vercel.app/#testimonials",
    structuredDataType: "CreativeWork"
  },
  blog: {
    metaTitle: "Journal & Engineering Insights — Nihal . ON",
    metaDescription: "Articles on modern frontend performance, spring animation physics, AI integration, and design systems.",
    ogTitle: "Journal & Engineering Insights — Nihal . ON",
    ogDescription: "Read the latest essays on web development, UX craft, and generative interface engineering.",
    ogImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1200&auto=format&fit=crop",
    ogType: "article",
    twitterCard: "summary_large_image",
    keywords: "Web Development Blog, Frontend Insights, React Articles, UX Engineering Essays",
    canonicalUrl: "https://nihal-on.vercel.app/#blog",
    structuredDataType: "ItemList"
  },
  gallery: {
    metaTitle: "Visual Archive & Conceptual Renders — Nihal . ON",
    metaDescription: "Curated gallery of editorial photography, branding artifacts, 3D visual explorations, and typography studies.",
    ogTitle: "Visual Gallery & Design Archive — Nihal . ON",
    ogDescription: "A curated collection of visual experiments, motion stills, and high-fidelity product imagery.",
    ogImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
    ogType: "website",
    twitterCard: "summary_large_image",
    keywords: "Design Gallery, 3D Renders, Editorial Photography, Branding Visuals",
    canonicalUrl: "https://nihal-on.vercel.app/#gallery",
    structuredDataType: "CreativeWork"
  },
  stats: {
    metaTitle: "Performance & Impact Metrics — Nihal . ON",
    metaDescription: "Key performance indicators: 40+ products shipped, 98+ Lighthouse scores, 3 Awwwards Site of the Day accolades.",
    ogTitle: "Impact & Performance Metrics — Nihal . ON",
    ogDescription: "Measurable business outcomes and technical achievements across global client engagements.",
    ogImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
    ogType: "website",
    twitterCard: "summary_large_image",
    keywords: "Performance Stats, Lighthouse 98, Awards, Proven Track Record, Metrics",
    canonicalUrl: "https://nihal-on.vercel.app/#stats",
    structuredDataType: "CreativeWork"
  },
  faq: {
    metaTitle: "Frequently Asked Questions — Nihal . ON",
    metaDescription: "Answers to common inquiries regarding project availability, pricing models, tech stacks, and engagement timelines.",
    ogTitle: "FAQ & Collaboration Guidelines — Nihal . ON",
    ogDescription: "Everything you need to know about hiring Nihal for your next flagship digital product.",
    ogImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1200&auto=format&fit=crop",
    ogType: "website",
    twitterCard: "summary_large_image",
    keywords: "FAQ, Freelance Rates, Collaboration Terms, Tech Stack Questions, Availability",
    canonicalUrl: "https://nihal-on.vercel.app/#faq",
    structuredDataType: "FAQPage"
  },
  contact: {
    metaTitle: "Get in Touch & Consultations — Nihal . ON",
    metaDescription: "Ready to elevate your digital experience? Schedule a discovery call or send an inquiry for Q3/Q4 project availability.",
    ogTitle: "Start a Conversation — Nihal . ON",
    ogDescription: "Direct contact channel for new client inquiries, design advisory, and speaking engagements.",
    ogImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop",
    ogType: "website",
    twitterCard: "summary_large_image",
    keywords: "Contact Nihal, Hire Creative Developer, Book Consultation, Project Inquiry",
    canonicalUrl: "https://nihal-on.vercel.app/#contact",
    structuredDataType: "ContactPage" as any
  }
};
