export type NavigationSection = 
  | 'home'
  | 'projects'
  | 'about'
  | 'services'
  | 'process'
  | 'skills'
  | 'experience'
  | 'testimonials'
  | 'blog'
  | 'gallery'
  | 'faq'
  | 'contact';

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  year: string;
  client: string;
  role: string;
  duration: string;
  featured: boolean;
  coverImage: string;
  heroImage: string;
  description: string;
  challenge: string;
  solution: string;
  impactMetrics: { label: string; value: string }[];
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  galleryImages?: string[];
  wireframes?: string[];
  clientFeedback?: {
    quote: string;
    author: string;
    role: string;
    company: string;
    avatar: string;
  };
}

export interface Service {
  id: string;
  iconName: string;
  title: string;
  subtitle: string;
  description: string;
  deliverables: string[];
  tools: string[];
  estimatedTime: string;
}

export interface ProcessStep {
  step: string;
  title: string;
  duration: string;
  summary: string;
  details: string[];
}

export interface SkillCategory {
  category: string;
  items: { name: string; level: number; icon: string; experienceYears: string; tag?: string }[];
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  period: string;
  location: string;
  type: string;
  description: string;
  achievements: string[];
  technologies: string[];
  isCurrent?: boolean;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  projectRef?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  image: string;
  tags: string[];
  likes?: number;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Photography' | 'Branding' | 'UI' | 'Motion' | 'Concepts';
  image: string;
  aspectRatio: 'aspect-square' | 'aspect-[4/5]' | 'aspect-[16/9]' | 'aspect-[3/4]';
  date: string;
  likes: number;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: 'General' | 'Process' | 'Pricing' | 'Technical';
}

export * from './types/studio';

export type SectionId = 
  | 'hero'
  | 'marquee'
  | 'about'
  | 'projects'
  | 'services'
  | 'process'
  | 'skills'
  | 'experience'
  | 'testimonials'
  | 'blog'
  | 'gallery'
  | 'stats'
  | 'faq'
  | 'contact'
  | (string & {});

export type SectionsVisibility = Record<string, boolean>;

export interface ComponentStyleConfig {
  id?: string;
  customCss?: string;
  fontSize?: string;
  textColor?: string;
  backgroundColor?: string;
  border?: string;
  borderRadius?: string;
  boxShadow?: string;
  padding?: string;
  margin?: string;
  typography?: any;
  spacing?: any;
  layout?: any;
}

export interface SectionStyleConfig {
  badgeText?: string;
  customTitle?: string;
  customSubtitle?: string;
  customDescription?: string;
  alignment?: 'left' | 'center' | 'right' | string;
  divSizing?: 'standard' | 'wide' | 'full' | string;
  containerWidth?: 'standard' | 'wide' | 'full' | 'compact' | string;
  paddingY?: 'compact' | 'normal' | 'relaxed' | string;
  bgStyle?: 'default' | 'card' | 'gradient' | 'glass' | string;
  borderTopGlow?: boolean;
  borderBottomGlow?: boolean;
  fontSizeScale?: 'small' | 'normal' | 'large' | 'compact' | 'huge' | string;
  fontTransform?: 'normal' | 'uppercase' | 'capitalize' | string;
  componentStyles?: Record<string, ComponentStyleConfig>;
}

export interface SpacingConfig {
  paddingTop?: string;
  paddingBottom?: string;
  marginTop?: string;
  marginBottom?: string;
}

export interface SocialLinks {
  [key: string]: string | undefined;
  github?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  behance?: string;
  dribbble?: string;
  email?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  createdAt: string;
  read?: boolean;
  phone?: string;
  country?: string;
}

