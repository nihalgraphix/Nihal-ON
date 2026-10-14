import { SectionId, SectionStyleConfig } from '../types';

export interface SectionContentMeta {
  id: SectionId;
  name: string;
  defaultBadge: string;
  defaultTitle: string;
  defaultSubtitle: string;
  defaultDescription: string;
}

export const SECTION_DEFAULTS_META: Record<SectionId, SectionContentMeta> = {
  hero: {
    id: 'hero',
    name: 'Hero Header',
    defaultBadge: 'Available For Q3/Q4 Projects',
    defaultTitle: 'Crafting Spatial & High-Impact Digital Experiences',
    defaultSubtitle: 'Principal UX Architect & Creative Technologist',
    defaultDescription: 'Available for Q3/Q4 Enterprise Projects & Advisory',
  },
  marquee: {
    id: 'marquee',
    name: 'Live Tech Marquee',
    defaultBadge: 'Live Tech Engine',
    defaultTitle: 'Architecture & Modern Stack',
    defaultSubtitle: 'Technology Stream',
    defaultDescription: 'High-performance frameworks, spring physics, and 3D spatial renderers.',
  },
  about: {
    id: 'about',
    name: 'About & Self-Summary',
    defaultBadge: 'About',
    defaultTitle: 'Crafting Digital Legacies at the Intersection of Art & Code',
    defaultSubtitle: 'Design Philosophy',
    defaultDescription: 'With over 8 years at the vanguard of digital product architecture, I transform ambitious venture visions into award-winning interfaces.',
  },
  projects: {
    id: 'projects',
    name: 'Projects Showcase',
    defaultBadge: 'Social Media & Stories',
    defaultTitle: 'Featured Project Portfolio',
    defaultSubtitle: 'Interactive Works',
    defaultDescription: 'High-impact interactive case studies, spatial interfaces, and venture web applications.',
  },
  services: {
    id: 'services',
    name: 'Services & Capabilities',
    defaultBadge: 'Core Capabilities',
    defaultTitle: 'Design & Engineering Services',
    defaultSubtitle: 'What I Deliver',
    defaultDescription: 'Tailored execution for venture-backed founders, creative directors, and ambitious enterprises seeking Awwwards-grade digital presence.',
  },
  process: {
    id: 'process',
    name: 'Creation Process',
    defaultBadge: 'Methodology',
    defaultTitle: 'An 8-Step Blueprint For Digital Excellence',
    defaultSubtitle: 'Structured Delivery',
    defaultDescription: 'A transparent, predictable process refined over 150+ successful deployments worldwide.',
  },
  skills: {
    id: 'skills',
    name: 'Technical Skills Matrix',
    defaultBadge: 'Technical Proficiency',
    defaultTitle: 'Tools & Mastery Matrix',
    defaultSubtitle: 'Stack Proficiencies',
    defaultDescription: 'Categorized technical proficiencies, specialized design engineering tools, and modern web architectures.',
  },
  experience: {
    id: 'experience',
    name: 'Career Experience',
    defaultBadge: 'Career Trajectory',
    defaultTitle: 'Professional Experience',
    defaultSubtitle: 'Leadership Journey',
    defaultDescription: 'Leading high-stakes creative direction and technical teams across top design agencies and venture-backed Silicon Valley startups.',
  },
  testimonials: {
    id: 'testimonials',
    name: 'Client Endorsements',
    defaultBadge: 'Client Endorsements',
    defaultTitle: 'What Founders & Leaders Say',
    defaultSubtitle: 'Verified Reviews',
    defaultDescription: 'Direct feedback and testimonials from engineering directors, venture founders, and executive peers.',
  },
  blog: {
    id: 'blog',
    name: 'Editorial Journal',
    defaultBadge: 'Editorial Journal',
    defaultTitle: 'Thoughts On Design & Tech',
    defaultSubtitle: 'Engineering Articles',
    defaultDescription: 'Deep-dives into modern web development, interaction physics, and design engineering.',
  },
  gallery: {
    id: 'gallery',
    name: 'Visual Media Gallery',
    defaultBadge: 'Visual Archive & Showcase',
    defaultTitle: 'Photography & Creative Showcase',
    defaultSubtitle: 'Aesthetic Highlights',
    defaultDescription: 'Selected creative posts, spatial visual concepts, and art direction highlights.',
  },
  stats: {
    id: 'stats',
    name: 'Key Metrics & Numbers',
    defaultBadge: 'Impact Metrics',
    defaultTitle: 'Key Performance Numbers',
    defaultSubtitle: 'Proven Track Record',
    defaultDescription: 'Verified project deliverables, engineering precision, and measurable client results.',
  },
  faq: {
    id: 'faq',
    name: 'Frequently Asked Questions',
    defaultBadge: 'Got Questions?',
    defaultTitle: 'Frequently Asked Questions',
    defaultSubtitle: 'Inquiries & Answers',
    defaultDescription: 'Clear answers to your project scopes, timelines, pricing models, and technical requirements.',
  },
  contact: {
    id: 'contact',
    name: 'Contact & Inquiry',
    defaultBadge: 'Start A Conversation',
    defaultTitle: "Let's Build Something Amazing.",
    defaultSubtitle: 'Direct Booking',
    defaultDescription: 'Have a new venture, product redesign, or Framer motion concept in mind? Fill out the form or reach out directly.',
  },
};

export function getSectionEffectiveContent(
  secId: SectionId,
  styleConfig?: SectionStyleConfig
) {
  const meta = SECTION_DEFAULTS_META[secId] || {
    id: secId,
    name: secId,
    defaultBadge: 'Section',
    defaultTitle: `${secId.toUpperCase()} Section`,
    defaultSubtitle: 'Overview',
    defaultDescription: '',
  };

  return {
    badge: styleConfig?.badgeText || meta.defaultBadge,
    title: styleConfig?.customTitle || meta.defaultTitle,
    subtitle: styleConfig?.customSubtitle || meta.defaultSubtitle,
    description: styleConfig?.customDescription || meta.defaultDescription,
    alignment: styleConfig?.alignment || 'left',
    divSizing: styleConfig?.divSizing || 'standard',
    containerWidth: styleConfig?.containerWidth || 'standard',
    paddingY: styleConfig?.paddingY || 'normal',
    bgStyle: styleConfig?.bgStyle || 'default',
    borderTopGlow: styleConfig?.borderTopGlow || false,
    borderBottomGlow: styleConfig?.borderBottomGlow || false,
    fontSizeScale: styleConfig?.fontSizeScale || 'normal',
    fontTransform: styleConfig?.fontTransform || 'normal',
  };
}
