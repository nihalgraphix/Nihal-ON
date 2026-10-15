export * from '../types';
export * from './studio';

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
  | 'contact';

export type SectionsVisibility = Record<SectionId, boolean>;

export interface ComponentStyleConfig {
  id?: string;
  customCss?: string;
  fontSize?: string;
  textColor?: string;
  backgroundColor?: string;
}

export interface SectionStyleConfig {
  badgeText?: string;
  customTitle?: string;
  customSubtitle?: string;
  customDescription?: string;
  alignment?: 'left' | 'center' | 'right';
  divSizing?: 'standard' | 'wide' | 'full';
  containerWidth?: 'standard' | 'wide' | 'full';
  paddingY?: 'compact' | 'normal' | 'relaxed';
  bgStyle?: 'default' | 'card' | 'gradient' | 'glass';
  borderTopGlow?: boolean;
  borderBottomGlow?: boolean;
  fontSizeScale?: 'small' | 'normal' | 'large';
  fontTransform?: 'normal' | 'uppercase' | 'capitalize';
  componentStyles?: Record<string, ComponentStyleConfig>;
}

export interface SpacingConfig {
  paddingTop?: string;
  paddingBottom?: string;
  marginTop?: string;
  marginBottom?: string;
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  behance?: string;
  dribbble?: string;
}

export interface MessageReply {
  id: string;
  timestamp: string;
  text: string;
  sentBy: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  subject?: string;
  message: string;
  createdAt: string;
  read?: boolean;
  phone?: string;
  country?: string;
  replies?: MessageReply[];
  isStarred?: boolean;
  isArchived?: boolean;
  isPinned?: boolean;
  category?: 'focused' | 'other';
}

export interface SkillItem {
  name: string;
  level: number;
  icon: string;
  experienceYears: string;
  tag: string;
}

export interface SkillCategory {
  category: string;
  items: SkillItem[];
}

