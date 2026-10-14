import { ElementConfig, GlobalDesignTokens } from './types';

export const DEFAULT_DESIGN_TOKENS: GlobalDesignTokens = {
  colors: {
    primary: '#FF5A1F',
    primaryGlow: 'rgba(255, 90, 31, 0.4)',
    secondary: '#FF8A00',
    accent: '#B02800',
    background: '#060606',
    surface: '#111111',
    surfaceHover: '#181818',
    text: '#E0E0E0',
    textMuted: '#94A3B8',
    border: 'rgba(255, 255, 255, 0.08)'
  },
  fonts: {
    heading: 'Syne, sans-serif',
    body: 'Plus Jakarta Sans, sans-serif',
    mono: 'Space Grotesk, sans-serif'
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2.5rem',
    xl: '4rem'
  },
  radius: {
    sm: '0.375rem',
    md: '0.75rem',
    lg: '1.5rem',
    full: '9999px'
  },
  shadows: {
    card: '0 10px 30px -10px rgba(0,0,0,0.5)',
    glow: '0 0 35px -5px rgba(255, 90, 31, 0.4)',
    modal: '0 25px 50px -12px rgba(0,0,0,0.8)'
  }
};

export const DEFAULT_ELEMENTS: Record<string, ElementConfig> = {
  // 1. NAVBAR
  'navbar-container': {
    id: 'navbar-container',
    type: 'section',
    name: 'Navbar Bar',
    parentId: null,
    children: ['navbar-logo', 'navbar-links', 'navbar-cta-btn'],
    styles: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: { top: '1rem', right: '2rem', bottom: '1rem', left: '2rem' },
      backgroundColor: 'rgba(6, 6, 6, 0.85)',
      backdropBlur: '12px',
      position: 'sticky',
      top: '0px',
      zIndex: 90,
      borderColor: 'rgba(255, 255, 255, 0.08)',
      borderWidth: '0 0 1px 0',
      borderStyle: 'solid'
    }
  },
  'navbar-logo': {
    id: 'navbar-logo',
    type: 'heading',
    name: 'Navbar Logo Text',
    parentId: 'navbar-container',
    children: [],
    content: 'Nihal . ON',
    styles: {
      fontFamily: 'Syne, sans-serif',
      fontSize: '1.5rem',
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: '-0.02em'
    }
  },
  'navbar-links': {
    id: 'navbar-links',
    type: 'flex',
    name: 'Navbar Menu Links',
    parentId: 'navbar-container',
    children: ['nav-link-home', 'nav-link-projects', 'nav-link-about', 'nav-link-services', 'nav-link-skills', 'nav-link-contact'],
    styles: {
      display: 'flex',
      gap: '1.5rem',
      alignItems: 'center',
      responsiveOverrides: {
        mobile: { display: 'none' }
      }
    }
  },
  'nav-link-home': {
    id: 'nav-link-home',
    type: 'link',
    name: 'Nav Item - Home',
    parentId: 'navbar-links',
    children: [],
    content: 'Home',
    href: '#home',
    styles: {
      color: '#FF5A1F',
      fontSize: '0.875rem',
      fontWeight: '600'
    }
  },
  'nav-link-projects': {
    id: 'nav-link-projects',
    type: 'link',
    name: 'Nav Item - Work',
    parentId: 'navbar-links',
    children: [],
    content: 'Work',
    href: '#projects',
    styles: {
      color: '#94A3B8',
      fontSize: '0.875rem',
      fontWeight: '500',
      hoverStyles: { color: '#FF5A1F' }
    }
  },
  'nav-link-about': {
    id: 'nav-link-about',
    type: 'link',
    name: 'Nav Item - About',
    parentId: 'navbar-links',
    children: [],
    content: 'About',
    href: '#about',
    styles: {
      color: '#94A3B8',
      fontSize: '0.875rem',
      fontWeight: '500',
      hoverStyles: { color: '#FF5A1F' }
    }
  },
  'nav-link-services': {
    id: 'nav-link-services',
    type: 'link',
    name: 'Nav Item - Services',
    parentId: 'navbar-links',
    children: [],
    content: 'Services',
    href: '#services',
    styles: {
      color: '#94A3B8',
      fontSize: '0.875rem',
      fontWeight: '500',
      hoverStyles: { color: '#FF5A1F' }
    }
  },
  'nav-link-skills': {
    id: 'nav-link-skills',
    type: 'link',
    name: 'Nav Item - Skills',
    parentId: 'navbar-links',
    children: [],
    content: 'Skills',
    href: '#skills',
    styles: {
      color: '#94A3B8',
      fontSize: '0.875rem',
      fontWeight: '500',
      hoverStyles: { color: '#FF5A1F' }
    }
  },
  'nav-link-contact': {
    id: 'nav-link-contact',
    type: 'link',
    name: 'Nav Item - Contact',
    parentId: 'navbar-links',
    children: [],
    content: 'Contact',
    href: '#contact',
    styles: {
      color: '#94A3B8',
      fontSize: '0.875rem',
      fontWeight: '500',
      hoverStyles: { color: '#FF5A1F' }
    }
  },
  'navbar-cta-btn': {
    id: 'navbar-cta-btn',
    type: 'button',
    name: 'Header Contact Button',
    parentId: 'navbar-container',
    children: [],
    content: 'Let\'s Connect ✦',
    href: '#contact',
    styles: {
      backgroundColor: '#FF5A1F',
      color: '#000000',
      fontWeight: '700',
      fontSize: '0.875rem',
      padding: { top: '0.5rem', right: '1.25rem', bottom: '0.5rem', left: '1.25rem' },
      borderRadius: { topLeft: '9999px', topRight: '9999px', bottomLeft: '9999px', bottomRight: '9999px' },
      hoverStyles: { backgroundColor: '#FFFFFF', scale: '1.05' }
    }
  },

  // 2. HERO SECTION
  'hero-section': {
    id: 'hero-section',
    type: 'section',
    name: 'Hero Section Wrapper',
    parentId: null,
    children: ['hero-inner-container'],
    styles: {
      position: 'relative',
      padding: { top: '5rem', right: '2rem', bottom: '4rem', left: '2rem' },
      gradientBackground: 'linear-gradient(180deg, #FF5A1F 0%, #E84A10 50%, #C83600 100%)',
      borderRadius: { bottomLeft: '48px', bottomRight: '48px' },
      overflow: 'hidden',
      boxShadow: '0 20px 50px -10px rgba(255, 90, 31, 0.3)'
    }
  },
  'hero-inner-container': {
    id: 'hero-inner-container',
    type: 'container',
    name: 'Hero Content Grid',
    parentId: 'hero-section',
    children: ['hero-left-column', 'hero-badge-pill'],
    styles: {
      maxWidth: '1280px',
      margin: { top: '0', right: 'auto', bottom: '0', left: 'auto' },
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '2.5rem',
      alignItems: 'center'
    }
  },
  'hero-left-column': {
    id: 'hero-left-column',
    type: 'inner-container',
    name: 'Hero Headline Block',
    parentId: 'hero-inner-container',
    children: ['hero-pill-tag', 'hero-title-heading', 'hero-subtitle-paragraph', 'hero-cta-group'],
    styles: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    }
  },
  'hero-pill-tag': {
    id: 'hero-pill-tag',
    type: 'badge',
    name: 'Hero Top Pill Badge',
    parentId: 'hero-left-column',
    children: [],
    content: '✨ AI-Driven Creative Director',
    styles: {
      display: 'inline-block',
      backgroundColor: '#FFFFFF',
      color: '#000000',
      fontSize: '0.75rem',
      fontWeight: '800',
      padding: { top: '0.375rem', right: '1rem', bottom: '0.375rem', left: '1rem' },
      borderRadius: { topLeft: '9999px', topRight: '9999px', bottomLeft: '9999px', bottomRight: '9999px' },
      maxWidth: 'fit-content'
    }
  },
  'hero-title-heading': {
    id: 'hero-title-heading',
    type: 'heading',
    name: 'Hero Main Headline',
    parentId: 'hero-left-column',
    children: [],
    content: 'I\'m Nihal ON\nSenior Creative Technologist',
    styles: {
      fontFamily: 'Syne, sans-serif',
      fontSize: '3.75rem',
      fontWeight: '800',
      color: '#FFFFFF',
      lineHeight: '1.05',
      letterSpacing: '-0.03em',
      responsiveOverrides: {
        mobile: { fontSize: '2.5rem' }
      }
    }
  },
  'hero-subtitle-paragraph': {
    id: 'hero-subtitle-paragraph',
    type: 'paragraph',
    name: 'Hero Subtitle Text',
    parentId: 'hero-left-column',
    children: [],
    content: 'From discovery to deployment, we plug into your stack to prototype, validate, and launch AI experiences your users actually love.',
    styles: {
      fontSize: '1.125rem',
      color: 'rgba(255, 255, 255, 0.95)',
      lineHeight: '1.6',
      maxWidth: '520px'
    }
  },
  'hero-cta-group': {
    id: 'hero-cta-group',
    type: 'flex',
    name: 'Hero Action Buttons Container',
    parentId: 'hero-left-column',
    children: ['hero-btn-primary', 'hero-btn-secondary'],
    styles: {
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap'
    }
  },
  'hero-btn-primary': {
    id: 'hero-btn-primary',
    type: 'button',
    name: 'Hero Primary CTA (Explore Services)',
    parentId: 'hero-cta-group',
    children: [],
    content: 'Explore Services',
    href: '#services',
    styles: {
      backgroundColor: '#090909',
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: '0.875rem',
      padding: { top: '0.875rem', right: '2rem', bottom: '0.875rem', left: '2rem' },
      borderRadius: { topLeft: '9999px', topRight: '9999px', bottomLeft: '9999px', bottomRight: '9999px' },
      hoverStyles: { backgroundColor: '#000000', scale: '1.05' }
    }
  },
  'hero-btn-secondary': {
    id: 'hero-btn-secondary',
    type: 'button',
    name: 'Hero Secondary CTA (Download CV)',
    parentId: 'hero-cta-group',
    children: [],
    content: 'Download CV',
    href: '#resume',
    styles: {
      backgroundColor: '#FFFFFF',
      color: '#000000',
      fontWeight: '700',
      fontSize: '0.875rem',
      padding: { top: '0.875rem', right: '2rem', bottom: '0.875rem', left: '2rem' },
      borderRadius: { topLeft: '9999px', topRight: '9999px', bottomLeft: '9999px', bottomRight: '9999px' },
      hoverStyles: { backgroundColor: '#F1F5F9', scale: '1.05' }
    }
  },

  // 3. ABOUT SECTION
  'about-section': {
    id: 'about-section',
    type: 'section',
    name: 'About Me Section',
    parentId: null,
    children: ['about-container'],
    styles: {
      padding: { top: '6rem', right: '2rem', bottom: '6rem', left: '2rem' },
      backgroundColor: '#060606'
    }
  },
  'about-container': {
    id: 'about-container',
    type: 'container',
    name: 'About Content Wrapper',
    parentId: 'about-section',
    children: ['about-title', 'about-bio-text', 'about-stats-flex'],
    styles: {
      maxWidth: '1280px',
      margin: { top: '0', right: 'auto', bottom: '0', left: 'auto' },
      display: 'flex',
      flexDirection: 'column',
      gap: '2.5rem'
    }
  },
  'about-title': {
    id: 'about-title',
    type: 'heading',
    name: 'About Section Title',
    parentId: 'about-container',
    children: [],
    content: 'Architecting Digital Products With Precision & Passion',
    styles: {
      fontFamily: 'Syne, sans-serif',
      fontSize: '2.5rem',
      fontWeight: '800',
      color: '#FFFFFF'
    }
  },
  'about-bio-text': {
    id: 'about-bio-text',
    type: 'paragraph',
    name: 'About Bio Description',
    parentId: 'about-container',
    children: [],
    content: 'Based in Kochi, India, with 6+ years of international design & engineering experience. Specializing in high-octane WebGL experiences, dark cyberpunk branding, React 19 architecture, and AI-powered product design.',
    styles: {
      fontSize: '1.125rem',
      color: '#94A3B8',
      lineHeight: '1.7',
      maxWidth: '800px'
    }
  },
  'about-stats-flex': {
    id: 'about-stats-flex',
    type: 'flex',
    name: 'About Metrics Row',
    parentId: 'about-container',
    children: ['about-stat-1', 'about-stat-2', 'about-stat-3', 'about-stat-4'],
    styles: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1.5rem'
    }
  },
  'about-stat-1': {
    id: 'about-stat-1',
    type: 'card',
    name: 'Stat Card 1 (Years)',
    parentId: 'about-stats-flex',
    children: [],
    content: '6+\nYears Experience',
    styles: {
      backgroundColor: '#111111',
      padding: { top: '1.5rem', right: '1.5rem', bottom: '1.5rem', left: '1.5rem' },
      borderRadius: { topLeft: '1rem', topRight: '1rem', bottomLeft: '1rem', bottomRight: '1rem' },
      borderColor: 'rgba(255, 90, 31, 0.2)',
      borderWidth: '1px',
      borderStyle: 'solid'
    }
  },
  'about-stat-2': {
    id: 'about-stat-2',
    type: 'card',
    name: 'Stat Card 2 (Projects)',
    parentId: 'about-stats-flex',
    children: [],
    content: '150+\nProjects Completed',
    styles: {
      backgroundColor: '#111111',
      padding: { top: '1.5rem', right: '1.5rem', bottom: '1.5rem', left: '1.5rem' },
      borderRadius: { topLeft: '1rem', topRight: '1rem', bottomLeft: '1rem', bottomRight: '1rem' },
      borderColor: 'rgba(255, 90, 31, 0.2)',
      borderWidth: '1px',
      borderStyle: 'solid'
    }
  },
  'about-stat-3': {
    id: 'about-stat-3',
    type: 'card',
    name: 'Stat Card 3 (Satisfaction)',
    parentId: 'about-stats-flex',
    children: [],
    content: '98%\nClient Satisfaction',
    styles: {
      backgroundColor: '#111111',
      padding: { top: '1.5rem', right: '1.5rem', bottom: '1.5rem', left: '1.5rem' },
      borderRadius: { topLeft: '1rem', topRight: '1rem', bottomLeft: '1rem', bottomRight: '1rem' },
      borderColor: 'rgba(255, 90, 31, 0.2)',
      borderWidth: '1px',
      borderStyle: 'solid'
    }
  },
  'about-stat-4': {
    id: 'about-stat-4',
    type: 'card',
    name: 'Stat Card 4 (Happy Clients)',
    parentId: 'about-stats-flex',
    children: [],
    content: '50+\nGlobal Clients',
    styles: {
      backgroundColor: '#111111',
      padding: { top: '1.5rem', right: '1.5rem', bottom: '1.5rem', left: '1.5rem' },
      borderRadius: { topLeft: '1rem', topRight: '1rem', bottomLeft: '1rem', bottomRight: '1rem' },
      borderColor: 'rgba(255, 90, 31, 0.2)',
      borderWidth: '1px',
      borderStyle: 'solid'
    }
  },

  // 4. PROJECTS SECTION
  'projects-section': {
    id: 'projects-section',
    type: 'section',
    name: 'Featured Works Section',
    parentId: null,
    children: ['projects-container'],
    styles: {
      padding: { top: '6rem', right: '2rem', bottom: '6rem', left: '2rem' },
      backgroundColor: '#0A0A0A'
    }
  },
  'projects-container': {
    id: 'projects-container',
    type: 'container',
    name: 'Projects Header Container',
    parentId: 'projects-section',
    children: ['projects-title', 'projects-subtitle'],
    styles: {
      maxWidth: '1280px',
      margin: { top: '0', right: 'auto', bottom: '0', left: 'auto' },
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }
  },
  'projects-title': {
    id: 'projects-title',
    type: 'heading',
    name: 'Projects Main Header',
    parentId: 'projects-container',
    children: [],
    content: 'Featured Case Studies & Selected Work',
    styles: {
      fontFamily: 'Syne, sans-serif',
      fontSize: '2.5rem',
      fontWeight: '800',
      color: '#FFFFFF'
    }
  },
  'projects-subtitle': {
    id: 'projects-subtitle',
    type: 'paragraph',
    name: 'Projects Section Subtitle',
    parentId: 'projects-container',
    children: [],
    content: 'Explore digital products built with extreme fidelity, micro-interactions, and conversion-focused architectures.',
    styles: {
      fontSize: '1rem',
      color: '#94A3B8',
      margin: { bottom: '2rem' }
    }
  },

  // 5. CONTACT SECTION
  'contact-section': {
    id: 'contact-section',
    type: 'section',
    name: 'Contact & Inquiries Section',
    parentId: null,
    children: ['contact-container'],
    styles: {
      padding: { top: '6rem', right: '2rem', bottom: '6rem', left: '2rem' },
      backgroundColor: '#060606'
    }
  },
  'contact-container': {
    id: 'contact-container',
    type: 'container',
    name: 'Contact Section Wrapper',
    parentId: 'contact-section',
    children: ['contact-title', 'contact-subtitle', 'contact-email-link', 'contact-phone-link'],
    styles: {
      maxWidth: '1280px',
      margin: { top: '0', right: 'auto', bottom: '0', left: 'auto' },
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      alignItems: 'center',
      textAlign: 'center'
    }
  },
  'contact-title': {
    id: 'contact-title',
    type: 'heading',
    name: 'Contact Headline',
    parentId: 'contact-container',
    children: [],
    content: 'Have A Visionary Project In Mind?',
    styles: {
      fontFamily: 'Syne, sans-serif',
      fontSize: '3rem',
      fontWeight: '800',
      color: '#FFFFFF'
    }
  },
  'contact-subtitle': {
    id: 'contact-subtitle',
    type: 'paragraph',
    name: 'Contact Subtitle Text',
    parentId: 'contact-container',
    children: [],
    content: 'Let\'s collaborate and bring your digital brand or Web3/AI application to life with award-winning creative engineering.',
    styles: {
      fontSize: '1.125rem',
      color: '#94A3B8',
      maxWidth: '600px'
    }
  },
  'contact-email-link': {
    id: 'contact-email-link',
    type: 'link',
    name: 'Direct Email Address Link',
    parentId: 'contact-container',
    children: [],
    content: 'nihal.graphix@gmail.com',
    href: 'mailto:nihal.graphix@gmail.com',
    styles: {
      fontFamily: 'Syne, sans-serif',
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#FF5A1F',
      hoverStyles: { color: '#FFFFFF' }
    }
  },
  'contact-phone-link': {
    id: 'contact-phone-link',
    type: 'link',
    name: 'Direct Phone Number Link',
    parentId: 'contact-container',
    children: [],
    content: '+91 9946001322',
    href: 'tel:+919946001322',
    styles: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#E0E0E0'
    }
  },

  // 6. FOOTER SECTION
  'footer-section': {
    id: 'footer-section',
    type: 'section',
    name: 'Footer Bar',
    parentId: null,
    children: ['footer-container'],
    styles: {
      padding: { top: '3rem', right: '2rem', bottom: '3rem', left: '2rem' },
      backgroundColor: '#040404',
      borderColor: 'rgba(255, 255, 255, 0.08)',
      borderWidth: '1px 0 0 0',
      borderStyle: 'solid'
    }
  },
  'footer-container': {
    id: 'footer-container',
    type: 'container',
    name: 'Footer Content Grid',
    parentId: 'footer-section',
    children: ['footer-text', 'footer-copyright'],
    styles: {
      maxWidth: '1280px',
      margin: { top: '0', right: 'auto', bottom: '0', left: 'auto' },
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1rem'
    }
  },
  'footer-text': {
    id: 'footer-text',
    type: 'text',
    name: 'Footer Brand Title',
    parentId: 'footer-container',
    children: [],
    content: 'Nihal . ON — Senior Creative Technologist & Director',
    styles: {
      fontFamily: 'Syne, sans-serif',
      fontSize: '0.875rem',
      fontWeight: '700',
      color: '#FFFFFF'
    }
  },
  'footer-copyright': {
    id: 'footer-copyright',
    type: 'text',
    name: 'Footer Copyright Notice',
    parentId: 'footer-container',
    children: [],
    content: '© 2026 Nihal . ON. All rights reserved. Managed via Visual Studio.',
    styles: {
      fontSize: '0.75rem',
      color: '#64748B'
    }
  }
};

export const DEFAULT_ROOT_ELEMENT_IDS = [
  'navbar-container',
  'hero-section',
  'about-section',
  'projects-section',
  'contact-section',
  'footer-section'
];
