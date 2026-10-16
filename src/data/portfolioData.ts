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

import heroPortrait from '../components/image/3ebaca72-c048-4ad3-ace0-649046417171.png';
import aboutPortrait from '../assets/images/regenerated_image_1785750001960.png';

import { SITE_TEXTS } from './siteTexts';

export { heroPortrait, aboutPortrait };

export const PERSONAL_INFO = {
  name: SITE_TEXTS.personal.name,
  title: SITE_TEXTS.personal.title,
  tagline: SITE_TEXTS.personal.tagline,
  location: SITE_TEXTS.personal.location,
  status: `🟢 ${SITE_TEXTS.personal.status}`,
  yearsExperience: SITE_TEXTS.personal.yearsExperience,
  projectsCompleted: SITE_TEXTS.personal.projectsCompleted,
  clientSatisfaction: SITE_TEXTS.personal.clientSatisfaction,
  happyClients: SITE_TEXTS.personal.happyClients,
  email: SITE_TEXTS.personal.email,
  phone: SITE_TEXTS.personal.phone,
  github: SITE_TEXTS.personal.github,
  linkedin: SITE_TEXTS.personal.linkedin,
  twitter: SITE_TEXTS.personal.twitter,
  instagram: SITE_TEXTS.personal.instagram,
  dribbble: SITE_TEXTS.personal.dribbble,
  behance: SITE_TEXTS.personal.behance,
  calendly: SITE_TEXTS.personal.calendly,
  blogUrl: SITE_TEXTS.personal.blogUrl,
  bio: SITE_TEXTS.personal.bio,
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

export const BLOG_POSTS: BlogPost[] = [];

export const GALLERY_ITEMS: GalleryItem[] = [];

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
    company: "Independent & Freelance Projects",
    role: "Developer & Graphic Designer",
    period: "2023 - Present",
    location: "Kochi, Kerala, India",
    type: "Creator & Developer",
    description: "Developing interactive websites, web applications, graphic design, and experimenting with AI-powered tools.",
    achievements: [
      "Engineered full-featured sports fest result management system with real-time updates and leaderboard.",
      "Crafted clean, modern interfaces with smooth animations, thoughtful layouts, glassmorphism, and premium visual feel.",
      "Built interactive dashboards and web-based systems focusing on functional, easy-to-use digital experiences."
    ],
    technologies: ["React", "TypeScript", "Tailwind CSS", "Framer Motion", "Figma", "Photoshop", "AI Tools"],
    isCurrent: true
  },
  {
    id: "exp-2",
    company: "Digital & Web Projects",
    role: "Frontend & UI/UX Designer",
    period: "2022 - 2023",
    location: "Kochi, Kerala",
    type: "Hands-on Projects",
    description: "Turning ideas into meaningful digital experiences by combining creative design with modern web technologies.",
    achievements: [
      "Designed interactive dashboards, web portals, and creative user interfaces.",
      "Explored game graphics, realistic visual effects, and emerging web technologies."
    ],
    technologies: ["React", "JavaScript", "HTML5/CSS3", "Figma", "Illustrator"]
  },
  {
    id: "exp-3",
    company: "Visual & Brand Identity",
    role: "Graphic Designer & Creator",
    period: "2021 - 2022",
    location: "Kochi, Kerala",
    type: "Creative Design",
    description: "Visual identity design, graphics, digital illustrations, and experimenting with design tools.",
    achievements: [
      "Created visual identities, brand graphics, and creative posters for local events and organizations.",
      "Refined foundational craft in digital art, layout theory, and visual storytelling."
    ],
    technologies: ["Photoshop", "Illustrator", "Canva", "UI/UX Basics"]
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "test-1",
    quote: "Nihal's ability to combine clean design with responsive web development at just 16 is astonishing. His work on our interactive system was seamless.",
    author: "Sports Fest Organizing Committee",
    role: "Coordinator",
    company: "Event Management",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
    rating: 5,
    projectRef: "Sports Fest Result Management System"
  },
  {
    id: "test-2",
    quote: "Nihal brings extraordinary passion, glassmorphism aesthetics, and clean code to every project. Age is truly no barrier to innovation.",
    author: "Creative Collaborator",
    role: "Digital Designer",
    company: "Creative Studio",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
    rating: 5,
    projectRef: "Interactive Dashboard"
  }
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    category: "General",
    question: "Who is Nihal?",
    answer: "Hi, I'm Nihal — a 16-year-old Developer & Graphic Designer from Kochi, Kerala, India, passionate about technology, creativity, and building things for the digital world."
  },
  {
    category: "Technical",
    question: "What kind of work do you specialize in?",
    answer: "My work spans front-end development, UI/UX design, graphic design, interactive dashboards, and web-based systems. I focus on clean modern interfaces, smooth animations, glassmorphism, and a premium visual feel."
  },
  {
    category: "Process",
    question: "What are some of your notable projects?",
    answer: "I've built a full sports fest result management system, interactive dashboards, online web platforms, and visual identities, combining modern code with striking graphic design."
  },
  {
    category: "General",
    question: "Are you available for freelance projects or collaborations?",
    answer: "Yes! I am always excited to collaborate on innovative web applications, UI/UX designs, graphic projects, and digital experiments. Reach out via email or Instagram (@nihal.graphix)."
  }
];

export const CREATIVE_MANIFESTO = [
  {
    title: "01. Always Learning",
    content: "Beyond design and development, I enjoy solving technical problems, experimenting with new tools, and learning through hands-on projects."
  },
  {
    title: "02. Always Building",
    content: "Whether building a sports fest result management system, online platforms, or refining visual identities, every build is functional, visually appealing, and easy to use."
  },
  {
    title: "03. Always Creating",
    content: "I believe age is no barrier to creativity, learning, or innovation. Every project is an opportunity to challenge myself and turn new ideas into something real."
  }
];
