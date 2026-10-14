import {
  Project,
  Service,
  ProcessStep,
  SkillCategory,
  ExperienceItem,
  Testimonial,
  BlogPost,
  GalleryItem,
  FAQItem
} from '../types';

import heroPortrait from '../assets/images/hero_portrait_1785413008544.jpg';
import aboutPortrait from '../assets/images/about_portrait_1785413022971.jpg';
import projSunglasses1 from '../assets/images/proj_sunglasses_1_1785549548646.jpg';
import projSilhouette2 from '../assets/images/proj_silhouette_2_1785549562035.jpg';
import projChain3 from '../assets/images/proj_chain_3_1785549576796.jpg';
import projModel4 from '../assets/images/proj_model_4_1785549589023.jpg';
import projEyewear5 from '../assets/images/proj_eyewear_5_1785549608139.jpg';
import projManShades6 from '../assets/images/proj_man_shades_6_1785549620013.jpg';

import galleryImageOne from '../components/image/1000009034.jpg';
import galleryImageTwo from '../components/image/1000009035.jpg';
import galleryImageThree from '../components/image/1000009036.jpg';
import galleryImageFour from '../components/image/16337.png';
import galleryImageFive from '../components/image/20251106_112821(1)(1).jpg';
import galleryImageSix from '../components/image/20251106_172421.jpg';
import galleryImageSeven from '../components/image/IMG_20251205_205918_106~2.jpg';
import galleryImageEight from '../components/image/Zenitsu 3.png';

export { heroPortrait, aboutPortrait };

export const PERSONAL_INFO = {
  name: "Nihal . ON",
  title: "Senior Creative Technologist & Design Director",
  tagline: "Building Digital Experiences That Feel Premium.",
  location: "Kochi, Kerala, India",
  status: "🟢 Available for Q3/Q4 Projects",
  yearsExperience: "6+",
  projectsCompleted: "150+",
  clientSatisfaction: "98%",
  happyClients: "50+",
  email: "nihal.graphix@gmail.com",
  phone: "+91 9946001322",
  github: "https://github.com",
  linkedin: "https://linkedin.com",
  twitter: "https://twitter.com",
  instagram: "https://instagram.com",
  dribbble: "https://dribbble.com",
  behance: "https://behance.com",
  calendly: "https://calendly.com",
  blogUrl: "https://medium.com",
};

export const BRANDS = [
  { name: "SupaBlox", logo: "⚡" },
  { name: "HypeBlox", logo: "🔥" },
  { name: "FrameBlox", logo: "📐" },
  { name: "UltraBlox", logo: "💎" },
  { name: "Aetheria AI", logo: "🌐" },
  { name: "Fluxora Cloud", logo: "♾️" },
  { name: "Vortex OS", logo: "🌀" },
  { name: "Luminary Labs", logo: "✨" },
];

export const AWARDS = [
  { year: "2026", title: "Awwwards Site of the Day", category: "Developer & Site of the Month Nominee", project: "Fluxora Cyberpunk Portal" },
  { year: "2025", title: "Framer Template of the Year", category: "Best Luxury Portfolio Category", project: "FolioBlox Framer Template" },
  { year: "2025", title: "CSS Design Awards - Special Kudos", category: "UI, UX & Innovation", project: "Vortex OS Interactive Design" },
  { year: "2024", title: "FWA of the Day", category: "Best Interactive Experience", project: "Aetheria Neural Canvas" },
];

export const PROJECTS: Project[] = [];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "blog-1",
    title: "Architecting 60fps WebGL Motion in React 19",
    excerpt: "How to combine Three.js, GSAP ScrollTrigger, and React 19 concurrent rendering without frame drops.",
    content: "Building high-performance interactive web experiences requires a deep understanding of browser paint loops and React state management...",
    category: "Engineering",
    readTime: "6 min read",
    date: "2026-03-15",
    author: "Nihal . ON",
    image: galleryImageOne,
    tags: ["React 19", "WebGL", "GSAP", "Performance"],
    likes: 142
  },
  {
    id: "blog-2",
    title: "The Death of Generic AI Templates: The Rise of Bespoke Craft",
    excerpt: "Why digital luxury relies on custom spatial typography, mathematical radius systems, and dark aesthetics.",
    content: "When everyone has access to AI tools, the true differentiator becomes human design taste and attention to micro-details...",
    category: "Design",
    readTime: "8 min read",
    date: "2026-02-28",
    author: "Nihal . ON",
    image: galleryImageTwo,
    tags: ["UI/UX", "Design Systems", "AI", "Typography"],
    likes: 98
  },
  {
    id: "blog-3",
    title: "Building Real-Time Visual Content Studio with Firebase & React",
    excerpt: "A complete guide to constructing client-side website builders with live preview, undo history, and offline sync.",
    content: "In this deep dive, we explore how to build a production-ready studio provider in React with local caching and Firestore backup...",
    category: "Tutorial",
    readTime: "10 min read",
    date: "2026-01-10",
    author: "Nihal . ON",
    image: galleryImageThree,
    tags: ["React", "Firebase", "State Management"],
    likes: 215
  }
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "gal-1",
    title: "Cyberpunk Urban Photography",
    category: "Photography",
    image: galleryImageOne,
    aspectRatio: "aspect-[4/5]",
    date: "2026-03-01",
    likes: 89
  },
  {
    id: "gal-2",
    title: "Futuristic Brand Emblem",
    category: "Branding",
    image: galleryImageTwo,
    aspectRatio: "aspect-square",
    date: "2026-02-20",
    likes: 124
  },
  {
    id: "gal-3",
    title: "Spatial Dark Mode UI System",
    category: "UI",
    image: galleryImageThree,
    aspectRatio: "aspect-[16/9]",
    date: "2026-02-14",
    likes: 210
  },
  {
    id: "gal-4",
    title: "Neon Lighting Exploration",
    category: "Photography",
    image: galleryImageFour,
    aspectRatio: "aspect-[3/4]",
    date: "2026-01-28",
    likes: 76
  },
  {
    id: "gal-5",
    title: "3D Geometric Motion Render",
    category: "Motion",
    image: galleryImageFive,
    aspectRatio: "aspect-[4/5]",
    date: "2026-01-15",
    likes: 165
  },
  {
    id: "gal-6",
    title: "Aetheria Cyberpunk Concept",
    category: "Concepts",
    image: galleryImageSix,
    aspectRatio: "aspect-square",
    date: "2026-01-02",
    likes: 190
  }
];

export const SERVICES: Service[] = [
  {
    id: "ui-ux-design",
    iconName: "Layout",
    title: "UI/UX Design",
    subtitle: "User-Centered & High Conversion",
    description: "Designing sleek, intuitive, and conversion-optimized digital interfaces. From wireframes to pixel-perfect design systems.",
    deliverables: ["User Journey Maps", "High-Fidelity Figma Prototypes", "Design Tokens & UI Kit", "Usability Audits"],
    tools: ["Figma", "Rive", "Principle", "UserTesting"],
    estimatedTime: "2 - 4 Weeks"
  },
  {
    id: "web-design",
    iconName: "Monitor",
    title: "Web Design & Direction",
    subtitle: "Awwwards-Winning Quality",
    description: "Art-directed web layouts that command attention. Immersive typography, dark luxury aesthetics, and cinematic layouts.",
    deliverables: ["Full Interactive Website Design", "Mobile-First Design System", "Micro-animations Guide", "Custom Assets"],
    tools: ["Figma", "Photoshop", "Illustrator", "Framer"],
    estimatedTime: "3 - 5 Weeks"
  },
  {
    id: "frontend-dev",
    iconName: "Code",
    title: "Frontend Engineering",
    subtitle: "Performant & Type-Safe Code",
    description: "Building ultra-fast modern web applications using React 19, Next.js, and TypeScript with 60fps animations.",
    deliverables: ["Clean Modular Repository", "SEO & Lighthouse 95+ Optimization", "Responsive Cross-Device Layout", "CI/CD Pipeline"],
    tools: ["React 19", "Next.js", "TypeScript", "Tailwind CSS"],
    estimatedTime: "3 - 6 Weeks"
  },
  {
    id: "brand-identity",
    iconName: "Sparkles",
    title: "Brand Identity",
    subtitle: "Distinctive & Memorable",
    description: "Creating futuristic brand identities, emblem marks, guidelines, typography pairings, and digital design language.",
    deliverables: ["Logo Suite & Emblem", "Brand Style Guide & Token Sheet", "Social Media & Marketing Assets", "Packaging Mockups"],
    tools: ["Illustrator", "Photoshop", "Midjourney", "Figma"],
    estimatedTime: "2 - 4 Weeks"
  },
  {
    id: "motion-gsap",
    iconName: "Zap",
    title: "Motion & GSAP Animations",
    subtitle: "Fluid Physics & Parallax",
    description: "Crafting fluid scroll-driven animations, 3D tilt hover cards, particle fields, and page route transitions.",
    deliverables: ["GSAP ScrollTrigger Setup", "Framer Motion Component Suite", "Custom Loader Animations", "Interactive Canvas Effects"],
    tools: ["GSAP", "Framer Motion", "Three.js", "Lenis"],
    estimatedTime: "2 - 3 Weeks"
  },
  {
    id: "ai-integrations",
    iconName: "Bot",
    title: "AI & Smart Agent Integrations",
    subtitle: "LLM & Generative Workflows",
    description: "Integrating Gemini and AI models directly into your web products for smart chat, auto-generation, and workflow automation.",
    deliverables: ["Server API Proxy Setup", "Interactive AI Chatbot/Concierge", "Prompt Engineering & Guardrails", "Streaming Response UI"],
    tools: ["Gemini API", "Node.js", "Express", "OpenAI"],
    estimatedTime: "2 - 4 Weeks"
  }
];

export const PROCESS_STEPS: ProcessStep[] = [
  {
    step: "01",
    title: "Discovery & Alignment",
    duration: "Week 1",
    summary: "Deep dive into business objectives, brand strategy, target audience, and competitive landscape.",
    details: ["In-depth strategy call & scope mapping", "Competitor & visual moodboard audit", "Project roadmap & milestone definition"]
  },
  {
    step: "02",
    title: "Research & Architecture",
    duration: "Week 1-2",
    summary: "Mapping out user flows, content structure, sitemap, and visual moodboards.",
    details: ["Information architecture & sitemap creation", "User journey mapping & touchpoint definition", "Visual aesthetic direction proposal"]
  },
  {
    step: "03",
    title: "Concept Strategy",
    duration: "Week 2",
    summary: "Developing 2 distinct creative directions with typography, colors, and key screen concepts.",
    details: ["Typography & color token exploration", "Interactive hero section moodboard", "Client review & feedback call"]
  },
  {
    step: "04",
    title: "Wireframes & UX",
    duration: "Week 2-3",
    summary: "Creating high-fidelity wireframes to solidify content layout and structural hierarchy.",
    details: ["Figma wireframe layouts for all viewports", "Copywriting structure & content placement", "UX prototyping & flow testing"]
  },
  {
    step: "05",
    title: "UI Design & Motion",
    duration: "Week 3-4",
    summary: "Transforming wireframes into pixel-perfect, dark-luxury screens with micro-interactions.",
    details: ["Full responsive UI design system", "3D card mockups & visual asset rendering", "Motion design specifications"]
  },
  {
    step: "06",
    title: "Development & Build",
    duration: "Week 4-6",
    summary: "Translating Figma designs into production-ready React / Next.js code with clean architecture.",
    details: ["Component-driven modular frontend build", "GSAP & Framer Motion smooth animations", "API proxy & backend integration"]
  },
  {
    step: "07",
    title: "Testing & Polish",
    duration: "Week 6-7",
    summary: "Rigorous quality assurance across mobile devices, browsers, and Lighthouse performance checks.",
    details: ["Cross-browser & mobile device testing", "Lighthouse 95+ score optimization", "Accessibility & contrast audits"]
  },
  {
    step: "08",
    title: "Launch & Growth",
    duration: "Week 8",
    summary: "Deploying to Cloud Run/Vercel, setting up domain DNS, and providing post-launch support.",
    details: ["Domain configuration & SSL deployment", "Analytics & SEO metadata setup", "30 days post-launch warranty"]
  }
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    category: "Frontend Engineering",
    items: [
      { name: "React 19", level: 98, icon: "Code2", experienceYears: "6 yrs", tag: "Expert" },
      { name: "Next.js 15", level: 95, icon: "Globe", experienceYears: "5 yrs", tag: "Expert" },
      { name: "TypeScript", level: 96, icon: "FileCode", experienceYears: "6 yrs", tag: "Expert" },
      { name: "Tailwind CSS", level: 99, icon: "Palette", experienceYears: "6 yrs", tag: "Master" },
      { name: "HTML5 / CSS3", level: 99, icon: "Layout", experienceYears: "6+ yrs", tag: "Master" }
    ]
  },
  {
    category: "Design & Motion",
    items: [
      { name: "Framer Motion", level: 96, icon: "Zap", experienceYears: "5 yrs", tag: "Expert" },
      { name: "GSAP", level: 92, icon: "Activity", experienceYears: "4 yrs", tag: "Advanced" },
      { name: "Figma & Design Systems", level: 98, icon: "Figma", experienceYears: "6 yrs", tag: "Master" },
      { name: "Three.js / WebGL", level: 85, icon: "Box", experienceYears: "3 yrs", tag: "Advanced" },
      { name: "Photoshop & Illustrator", level: 90, icon: "Image", experienceYears: "6 yrs", tag: "Expert" }
    ]
  },
  {
    category: "Backend & Cloud",
    items: [
      { name: "Node.js & Express", level: 90, icon: "Server", experienceYears: "5 yrs", tag: "Advanced" },
      { name: "MongoDB & Supabase", level: 88, icon: "Database", experienceYears: "4 yrs", tag: "Advanced" },
      { name: "REST & GraphQL APIs", level: 92, icon: "Cpu", experienceYears: "5 yrs", tag: "Expert" },
      { name: "Google Cloud / Vercel", level: 89, icon: "Cloud", experienceYears: "4 yrs", tag: "Advanced" }
    ]
  },
  {
    category: "Creative & AI Tech",
    items: [
      { name: "Gemini API & LLMs", level: 94, icon: "Bot", experienceYears: "2 yrs", tag: "Expert" },
      { name: "Midjourney / Image Gen", level: 95, icon: "Sparkles", experienceYears: "3 yrs", tag: "Expert" },
      { name: "Lenis Smooth Scroll", level: 96, icon: "Layers", experienceYears: "3 yrs", tag: "Expert" },
      { name: "Sound Synthesizers", level: 84, icon: "Volume2", experienceYears: "2 yrs", tag: "Interm." }
    ]
  }
];

export const EXPERIENCE_LIST: ExperienceItem[] = [
  {
    id: "exp-1",
    company: "NIHAL Creative Studio",
    role: "Lead Creative Technologist & Director",
    period: "2023 - Present",
    location: "San Francisco, CA",
    type: "Full-Time / Studio Lead",
    description: "Directing high-end digital design and full-stack engineering for B2B SaaS, Web3 platforms, and luxury brands.",
    achievements: [
      "Built 40+ web products with average 98/100 Lighthouse performance scores.",
      "Received 3 Awwwards Site of the Day and 2 FWA recognitions.",
      "Engineered custom design systems downloaded over 1,200+ times."
    ],
    technologies: ["React 19", "Next.js", "TypeScript", "GSAP", "Tailwind CSS", "Gemini API"],
    isCurrent: true
  },
  {
    id: "exp-2",
    company: "Aetheria AI Labs",
    role: "Senior UI/UX Architect & Staff Engineer",
    period: "2021 - 2023",
    location: "Remote",
    type: "Full-Time",
    description: "Led the design system team for generative 3D creative suite, managing 6 product designers and 8 frontend engineers.",
    achievements: [
      "Redesigned node canvas workspace, reducing customer onboarding time by 45%.",
      "Grew monthly active users from 50K to 320K+ in 18 months.",
      "Architected accessible dark mode theme engine used across all enterprise sub-apps."
    ],
    technologies: ["React", "TypeScript", "Canvas API", "Figma", "Tailwind CSS"]
  },
  {
    id: "exp-3",
    company: "Vortex Digital Agency",
    role: "Senior Motion & Frontend Developer",
    period: "2019 - 2021",
    location: "New York, NY",
    type: "Full-Time",
    description: "Crafted interactive marketing experiences, 3D WebGL portals, and e-commerce flagship stores for Fortune 500 clients.",
    achievements: [
      "Delivered 25+ client sites on schedule with zero critical post-launch bugs.",
      "Mentored junior developers on GSAP ScrollTrigger and CSS performance optimization."
    ],
    technologies: ["Three.js", "GSAP", "Vue/React", "Shopify", "SCSS"]
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "test-1",
    quote: "Nihal . ON is in a league of his own. He took our rough concept and created an Awwwards-worthy portal that immediately established our enterprise credibility.",
    author: "Marcus Thorne",
    role: "Chief Marketing Officer",
    company: "Fluxora Global",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
    rating: 5,
    projectRef: "Fluxora Studio Portal"
  },
  {
    id: "test-2",
    quote: "Rarely do you find a designer who can write rock-solid TypeScript and implement complex WebGL motion smoothly. Nihal . ON delivered beyond all expectations.",
    author: "Dr. Elena Rostova",
    role: "VP of Design",
    company: "Aetheria AI",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
    rating: 5,
    projectRef: "Aetheria Neural Canvas"
  },
  {
    id: "test-3",
    quote: "Working with Nihal . ON felt like having an entire Apple-level design team at our fingertips. Our conversion rate increased by 185% in month one.",
    author: "David Chen",
    role: "Founder & CEO",
    company: "Krypton Web3",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    rating: 5,
    projectRef: "Krypton Exchange"
  },
  {
    id: "test-4",
    quote: "The level of polish, spatial typography, and responsive detail Nihal . ON brings to the table is mind-blowing. Highest recommendation possible.",
    author: "SOPHIA VALENTINA",
    role: "Creative Director",
    company: "Luminary Fashion Paris",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop",
    rating: 5,
    projectRef: "Luminary High Fashion"
  }
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    category: "General",
    question: "What is your typical project timeline?",
    answer: "Most full design & engineering projects take between 4 to 8 weeks depending on scope complexity. Design-only or Framer template customization sprints can be completed in 2 to 3 weeks."
  },
  {
    category: "Pricing",
    question: "What are your pricing structures?",
    answer: "We offer both fixed-scope project pricing and monthly dedicated creative studio retainers. Fixed projects generally start at $5,000 for web design & frontend packages."
  },
  {
    category: "Process",
    question: "How do we collaborate during the project?",
    answer: "We maintain weekly asynchronous video updates via Loom, real-time Slack or Discord channel sync, and Figma design reviews where you can comment directly on active wireframes and UI components."
  },
  {
    category: "Technical",
    question: "Do you build full-stack web applications or just static sites?",
    answer: "I specialize in full-stack web platforms using React 19, Next.js, Node.js, Express, Tailwind CSS, GSAP, and cloud services (GCP, Firebase, Supabase). I also build custom AI integrations using Gemini API."
  },
  {
    category: "General",
    question: "Are you available for long-term contract or agency white-label work?",
    answer: "Yes, I collaborate with select creative agencies and venture-backed tech startups worldwide as an embedded Lead Technologist or Design Advisor."
  }
];

export const CREATIVE_MANIFESTO = [
  {
    title: "01. Design With Purpose, Build With Impact",
    content: "Aesthetics without functional depth is merely decoration. Every line of typography, grid spacing, and micro-animation must solve a real strategic user objective."
  },
  {
    title: "02. Never Settle For Default AI Templates",
    content: "Craftsmanship lies in bespoke typography pairing, custom neon lighting ratios, mathematical border radius calculations, and high-performance code."
  },
  {
    title: "03. Performance Is An Essential Feature",
    content: "Sub-second page loads, 60fps animations, and 95+ Lighthouse scores are non-negotiable standards for modern digital luxury."
  }
];
