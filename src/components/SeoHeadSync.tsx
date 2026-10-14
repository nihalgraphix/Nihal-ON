import { useEffect, useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { DEFAULT_SECTION_SEO } from '../data/defaultSeoData';
import { SectionSeoMetadata } from '../types/studio';

export default function SeoHeadSync() {
  const { publishedData, draftData, isStudioOpen } = useStudio();
  const [currentSection, setCurrentSection] = useState<string>('global');

  // Determine active section via URL hash or scroll position
  useEffect(() => {
    const handleHashOrScroll = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash && DEFAULT_SECTION_SEO[hash]) {
        setCurrentSection(hash);
        return;
      }

      // Check viewport scroll position for active section
      const sections = [
        'hero',
        'about',
        'projects',
        'services',
        'process',
        'skills',
        'experience',
        'testimonials',
        'blog',
        'gallery',
        'stats',
        'faq',
        'contact',
      ];

      const scrollPos = window.scrollY + 250;
      let matched = false;
      for (const sec of sections) {
        const el = document.getElementById(sec);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setCurrentSection(sec);
            matched = true;
            break;
          }
        }
      }

      if (!matched && window.scrollY < 300) {
        setCurrentSection('hero');
      }
    };

    handleHashOrScroll();
    window.addEventListener('scroll', handleHashOrScroll, { passive: true });
    window.addEventListener('hashchange', handleHashOrScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleHashOrScroll);
      window.removeEventListener('hashchange', handleHashOrScroll);
    };
  }, []);

  // Sync document head meta tags dynamically based on active section
  useEffect(() => {
    const activeData = isStudioOpen ? draftData : publishedData;
    const customSeoMap = activeData?.siteSettings?.sectionSeo || {};
    const sectionSeo: SectionSeoMetadata = customSeoMap[currentSection] 
      || DEFAULT_SECTION_SEO[currentSection] 
      || customSeoMap.global 
      || DEFAULT_SECTION_SEO.global;

    const metaTitle = sectionSeo.metaTitle || 'Nihal . ON — Principal UX Architect & Creative Technologist';
    const metaDesc = sectionSeo.metaDescription || 'Award-winning dark luxury portfolio of Nihal . ON. Crafting spatial digital experiences, high-performance web applications, and AI-driven interfaces.';
    const ogTitle = sectionSeo.ogTitle || metaTitle;
    const ogDesc = sectionSeo.ogDescription || metaDesc;
    const ogImage = sectionSeo.ogImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop';
    const ogType = sectionSeo.ogType || 'website';
    const twitterCard = sectionSeo.twitterCard || 'summary_large_image';
    const keywords = sectionSeo.keywords || 'Nihal ON, Creative Developer, UX Architect, React 19, Next.js, Three.js, Portfolio';
    const canonicalUrl = sectionSeo.canonicalUrl || `${window.location.origin}${window.location.pathname}${window.location.hash || ''}`;

    // 1. Title
    document.title = metaTitle;

    // Helper to safely set or update a meta tag
    const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Helper to set or update link tag
    const setLinkTag = (rel: string, href: string) => {
      if (!href) return;
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    // 2. Standard Meta
    setMetaTag('name', 'description', metaDesc);
    setMetaTag('name', 'keywords', keywords);

    // 3. OpenGraph
    setMetaTag('property', 'og:title', ogTitle);
    setMetaTag('property', 'og:description', ogDesc);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:site_name', 'Nihal . ON');

    // 4. Twitter / X Card
    setMetaTag('name', 'twitter:card', twitterCard);
    setMetaTag('name', 'twitter:title', ogTitle);
    setMetaTag('name', 'twitter:description', ogDesc);
    setMetaTag('name', 'twitter:image', ogImage);

    // 5. Canonical
    setLinkTag('canonical', canonicalUrl);

    // 6. Schema.org JSON-LD Structured Data
    const structuredDataId = 'section-seo-structured-data';
    let scriptEl = document.getElementById(structuredDataId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = structuredDataId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    const structuredDataPayload = {
      "@context": "https://schema.org",
      "@type": sectionSeo.structuredDataType || (currentSection === 'about' ? 'Person' : 'WebApplication'),
      "name": ogTitle,
      "description": metaDesc,
      "url": canonicalUrl,
      "image": ogImage,
      "author": {
        "@type": "Person",
        "name": "Nihal . ON",
        "jobTitle": "Principal UX Architect & Creative Technologist",
        "url": "https://nihal-on.vercel.app/"
      }
    };

    scriptEl.textContent = JSON.stringify(structuredDataPayload);
  }, [currentSection, publishedData, draftData, isStudioOpen]);

  return null; // Head-only reactive controller
}
