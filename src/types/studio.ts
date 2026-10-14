import { Project, BlogPost, GalleryItem } from '../types';

export type ElementType = 'heading' | 'text' | 'button' | 'container' | 'card' | 'image' | 'badge' | 'section';

export interface ElementTypography {
  fontSize?: string; // e.g. "48px"
  fontWeight?: string; // e.g. "700"
  fontFamily?: string;
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  lineHeight?: string;
  letterSpacing?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textColor?: string;
  textHighlight?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textShadow?: string;
  textGradient?: string;
}

export interface ElementSpacing {
  marginTop?: string;
  marginBottom?: string;
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  gap?: string;
  transformX?: number;
  transformY?: number;
}

export interface ElementDimensions {
  width?: string;
  maxWidth?: string;
  height?: string;
  minHeight?: string;
}

export interface ElementAlignment {
  display?: 'flex' | 'block' | 'inline-block' | 'grid';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  gap?: string;
}

export interface ElementAppearance {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  boxShadow?: string;
  opacity?: number;
  backgroundImage?: string;
}

export interface ElementResponsiveOverrides {
  mobile?: {
    typography?: ElementTypography;
    spacing?: ElementSpacing;
    dimensions?: ElementDimensions;
    appearance?: ElementAppearance;
    visible?: boolean;
  };
  tablet?: {
    typography?: ElementTypography;
    spacing?: ElementSpacing;
    dimensions?: ElementDimensions;
    appearance?: ElementAppearance;
    visible?: boolean;
  };
}

export interface EditableElement {
  id: string;
  label: string;
  section: string;
  type: ElementType;
  parentId?: string;
  order?: number;
  content?: {
    text?: string;
    subtext?: string;
    link?: string;
    imageUrl?: string;
    alt?: string;
    icon?: string;
  };
  typography?: ElementTypography;
  spacing?: ElementSpacing;
  dimensions?: ElementDimensions;
  alignment?: ElementAlignment;
  appearance?: ElementAppearance;
  responsive?: ElementResponsiveOverrides;
  visible?: boolean;
  isCustom?: boolean;
}

export interface DesignTokens {
  primaryAccent: string; // e.g. "#FF5A1F"
  secondaryAccent: string;
  backgroundDark: string; // e.g. "#060606"
  surfaceDark: string; // e.g. "#111214"
  panelDark: string; // e.g. "#17181B"
  borderDark: string; // e.g. "#2C2E34"
  textPrimary: string;
  textSecondary: string;
  borderRadius: string; // e.g. "8px"
}

export interface SiteSettings {
  siteTitle?: string;
  siteDescription?: string;
  authorName?: string;
  authorTitle?: string;
  authorTagline?: string;
  location?: string;
  status?: string;
  email?: string;
  phone?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  behance?: string;
  dribbble?: string;
  calendly?: string;
  showAdminButton?: boolean;
  adminButtonLabel?: string;
  adminButtonPosition?: 'bottom-left' | 'bottom-right';
  ogImage?: string;
  accentColor?: string;
  secondaryColor?: string;
  themeMode?: string;
  fontFamily?: string;
  cardRadius?: string;
  glowIntensity?: string;
  parallaxEnabled?: boolean;
  heroHeading?: string;
  heroSubheading?: string;
  heroTagline?: string;
  heroTestimonialText?: string;
  heroMetricNumber?: string;
  heroMetricLabel?: string;
  watermarkText?: string;
  availabilityStatus?: string;
  primaryCtaText?: string;
  secondaryCtaText?: string;
  aboutHeading?: string;
  aboutSubtitle?: string;
  aboutBio?: string;
  aboutYearsExperience?: string;
  aboutProjectsCount?: string;
  aboutClientSatisfaction?: string;
  aboutImage?: string;
  navBrandText?: string;
  footerCopyright?: string;
  resumeUrl?: string;
  authorRole?: string;
  authorEmail?: string;
  authorLocation?: string;
  sectionsVisibility?: Record<string, boolean>;
  sectionsOrder?: string[];
  sectionStyles?: Record<string, any>;
  socialLinks?: Record<string, string> | any;
}

export interface StudioData {
  siteSettings: SiteSettings;
  designTokens: DesignTokens;
  elements: Record<string, EditableElement>;
  projects: Project[];
  blogPosts: BlogPost[];
  galleryItems: GalleryItem[];
  galleryCategories?: string[];
}

export interface StudioRevision {
  id: string;
  timestamp: string;
  note: string;
  publishedBy: string;
  dataSnapshot?: StudioData;
}

export interface MediaAsset {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  alt?: string;
  category: string;
  format?: string;
  size?: string;
  dimensions?: string;
  createdAt: string;
}
