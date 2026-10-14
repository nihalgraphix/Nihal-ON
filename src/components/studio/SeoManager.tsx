import { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { SectionSeoMap, SectionSeoMetadata } from '../../types/studio';
import { DEFAULT_SECTION_SEO, SECTION_METADATA_DEFINITIONS } from '../../data/defaultSeoData';
import { setFirestoreDocument } from '../../lib/firebaseStore';
import { 
  Globe, 
  Share2, 
  Search, 
  CheckCircle2, 
  Save, 
  Sparkles, 
  ExternalLink, 
  Eye, 
  RotateCcw, 
  AlertCircle,
  Copy,
  Check,
  ImageIcon
} from 'lucide-react';

export default function SeoManager() {
  const { draftData, updateSiteSettings, publish } = useStudio();
  const initialSeoMap: SectionSeoMap = {
    ...DEFAULT_SECTION_SEO,
    ...(draftData?.siteSettings?.sectionSeo || {})
  };

  const [seoData, setSeoData] = useState<SectionSeoMap>(initialSeoMap);
  const [selectedSectionKey, setSelectedSectionKey] = useState<string>('global');
  const [previewTab, setPreviewTab] = useState<'google' | 'social'>('google');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const currentSectionMeta = seoData[selectedSectionKey] || DEFAULT_SECTION_SEO[selectedSectionKey] || DEFAULT_SECTION_SEO.global;
  const sectionDef = SECTION_METADATA_DEFINITIONS[selectedSectionKey] || {
    label: selectedSectionKey.toUpperCase(),
    routeHash: `#${selectedSectionKey}`,
    icon: 'Globe',
    description: 'Section specific search engine and social graph tags.'
  };

  const handleFieldChange = (field: keyof SectionSeoMetadata, value: string) => {
    setSeoData((prev) => {
      const updatedSection = {
        ...(prev[selectedSectionKey] || DEFAULT_SECTION_SEO[selectedSectionKey] || {}),
        [field]: value
      };
      return {
        ...prev,
        [selectedSectionKey]: updatedSection
      };
    });
  };

  const handleSaveToFirestore = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      // 1. Save directly to Firestore under 'settings/seo_metadata'
      const firestoreSuccess = await setFirestoreDocument('settings', 'seo_metadata', {
        sections: seoData,
        lastUpdatedBy: 'Admin Studio',
      });

      // 2. Also persist to site_config document in settings
      await setFirestoreDocument('settings', 'site_config', {
        sectionSeo: seoData,
      });

      // 3. Update studio context state & publish revision
      updateSiteSettings({ sectionSeo: seoData });
      await publish();

      setStatusMessage({
        type: 'success',
        text: firestoreSuccess 
          ? 'SEO & OpenGraph tags saved directly to Firestore and published live!' 
          : 'SEO tags updated locally and synced with studio context.'
      });

      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      console.error('Failed to save SEO to Firestore:', err);
      setStatusMessage({
        type: 'error',
        text: `Error saving to Firestore: ${err.message || 'Unknown error'}`
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSectionToDefault = () => {
    const defaultVal = DEFAULT_SECTION_SEO[selectedSectionKey] || DEFAULT_SECTION_SEO.global;
    setSeoData((prev) => ({
      ...prev,
      [selectedSectionKey]: { ...defaultVal }
    }));
    setStatusMessage({
      type: 'success',
      text: `Reset ${sectionDef.label} to verified SEO defaults.`
    });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleResetAllToDefaults = () => {
    setSeoData({ ...DEFAULT_SECTION_SEO });
    setStatusMessage({
      type: 'success',
      text: 'All sections reset to verified SEO defaults. Click "Save to Firestore" to commit.'
    });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Metrics calculation
  const titleLen = currentSectionMeta.metaTitle?.length || 0;
  const descLen = currentSectionMeta.metaDescription?.length || 0;
  const isTitleOptimal = titleLen >= 30 && titleLen <= 60;
  const isDescOptimal = descLen >= 120 && descLen <= 160;

  // Generate HTML snippet
  const generatedHtmlSnippet = `<!-- Section SEO: ${sectionDef.label} -->
<title>${currentSectionMeta.metaTitle || ''}</title>
<meta name="description" content="${currentSectionMeta.metaDescription || ''}" />
${currentSectionMeta.keywords ? `<meta name="keywords" content="${currentSectionMeta.keywords}" />\n` : ''}<meta property="og:type" content="${currentSectionMeta.ogType || 'website'}" />
<meta property="og:title" content="${currentSectionMeta.ogTitle || currentSectionMeta.metaTitle || ''}" />
<meta property="og:description" content="${currentSectionMeta.ogDescription || currentSectionMeta.metaDescription || ''}" />
<meta property="og:image" content="${currentSectionMeta.ogImage || ''}" />
<meta property="og:url" content="${currentSectionMeta.canonicalUrl || 'https://nihal-on.vercel.app/'}" />
<meta name="twitter:card" content="${currentSectionMeta.twitterCard || 'summary_large_image'}" />
<meta name="twitter:title" content="${currentSectionMeta.ogTitle || currentSectionMeta.metaTitle || ''}" />
<meta name="twitter:description" content="${currentSectionMeta.ogDescription || currentSectionMeta.metaDescription || ''}" />
<meta name="twitter:image" content="${currentSectionMeta.ogImage || ''}" />`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedHtmlSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#111214] overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2C2E34] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#FF5A1F] mb-1">
            <Share2 className="w-4 h-4" />
            <span>Search Engine Optimization & Social Graph</span>
          </div>
          <h1 className="font-syne text-2xl font-bold text-white">Section SEO & OpenGraph Studio</h1>
          <p className="text-xs font-space text-neutral-400 mt-1 max-w-2xl">
            Update meta titles, meta descriptions, and OpenGraph social share cards for every section. Changes persist directly to Firestore and dynamically inject into the document head.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetAllToDefaults}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#17181B] border border-[#2C2E34] hover:border-white/20 text-neutral-300 hover:text-white text-xs font-space transition-all cursor-pointer"
            title="Reset all sections to recommended SEO defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <button
            onClick={handleSaveToFirestore}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5A1F] to-[#FF8A00] text-black font-space font-bold text-xs shadow-lg shadow-[#FF5A1F]/30 hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving to Firestore...' : 'Save to Firestore'}</span>
          </button>
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div className={`flex items-center gap-2.5 p-4 rounded-xl border text-xs font-space transition-all ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' 
            : 'bg-red-500/15 border-red-500/30 text-red-300'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Grid: Section Selector (Left) + Form Editor & Live Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sections List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
              PORTFOLIO SECTIONS ({Object.keys(SECTION_METADATA_DEFINITIONS).length})
            </span>
            <span className="text-[10px] font-mono text-[#FF5A1F] bg-[#FF5A1F]/10 px-2 py-0.5 rounded-full border border-[#FF5A1F]/20">
              Firestore Synced
            </span>
          </div>

          <div className="bg-[#17181B] border border-[#2C2E34] rounded-2xl p-2 space-y-1 max-h-[750px] overflow-y-auto">
            {Object.entries(SECTION_METADATA_DEFINITIONS).map(([key, def]) => {
              const secData = seoData[key] || DEFAULT_SECTION_SEO[key] || {};
              const isSelected = selectedSectionKey === key;
              const hasCustomTitle = !!secData.metaTitle;
              const hasOgImage = !!secData.ogImage;

              return (
                <button
                  key={key}
                  onClick={() => setSelectedSectionKey(key)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#24262B] border border-[#FF5A1F]/40 shadow-md text-white'
                      : 'hover:bg-[#1F2024] text-neutral-400 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${isSelected ? 'bg-[#FF5A1F]' : 'bg-neutral-600'}`} />
                      <span className={`text-xs font-syne font-bold truncate ${isSelected ? 'text-white' : 'text-neutral-300'}`}>
                        {def.label}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-neutral-500 truncate mt-0.5 pl-4">
                      {def.routeHash}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    {hasOgImage && (
                      <span title="OpenGraph Image Configured" className="text-[10px] text-emerald-400">
                        <ImageIcon className="w-3.5 h-3.5" />
                      </span>
                    )}
                    {hasCustomTitle && (
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-400">
                        SEO
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Form Editor & Live Visualizer */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Section Header Card */}
          <div className="bg-[#17181B] border border-[#2C2E34] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-syne text-lg font-bold text-white">{sectionDef.label}</h2>
                <span className="px-2 py-0.5 rounded-md bg-[#111214] border border-[#2C2E34] text-[10px] font-mono text-[#FF5A1F]">
                  {sectionDef.routeHash}
                </span>
              </div>
              <p className="text-xs font-space text-neutral-400 mt-1">
                {sectionDef.description}
              </p>
            </div>

            <button
              onClick={handleResetSectionToDefault}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111214] border border-[#2C2E34] text-xs font-space text-neutral-400 hover:text-white transition-all cursor-pointer self-start sm:self-center"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Section</span>
            </button>
          </div>

          {/* Live Preview Switcher (Google Search Result vs Social Card) */}
          <div className="bg-[#17181B] border border-[#2C2E34] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#2C2E34] pb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#FF5A1F]" />
                <span>Live Ranking & Social Card Preview</span>
              </span>

              <div className="flex items-center gap-1 bg-[#111214] p-1 rounded-xl border border-[#2C2E34]">
                <button
                  onClick={() => setPreviewTab('google')}
                  className={`px-3 py-1 rounded-lg text-xs font-space font-medium transition-all cursor-pointer ${
                    previewTab === 'google'
                      ? 'bg-[#FF5A1F] text-black font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Google Snippet
                </button>
                <button
                  onClick={() => setPreviewTab('social')}
                  className={`px-3 py-1 rounded-lg text-xs font-space font-medium transition-all cursor-pointer ${
                    previewTab === 'social'
                      ? 'bg-[#FF5A1F] text-black font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Social Card (OG)
                </button>
              </div>
            </div>

            {/* Google Search Snippet Preview */}
            {previewTab === 'google' && (
              <div className="p-4 rounded-xl bg-[#202124] border border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-[#bdc1c6]">
                  <div className="w-4 h-4 rounded-full bg-[#303134] flex items-center justify-center text-[9px] font-bold text-white">
                    N
                  </div>
                  <span className="text-[11px] truncate">https://nihal-on.vercel.app{sectionDef.routeHash !== '#home' ? sectionDef.routeHash : ''}</span>
                </div>
                <h3 className="text-base font-medium text-[#8ab4f8] hover:underline cursor-pointer truncate">
                  {currentSectionMeta.metaTitle || 'Default Page Title'}
                </h3>
                <p className="text-xs text-[#bdc1c6] line-clamp-2 leading-relaxed">
                  {currentSectionMeta.metaDescription || 'Add a compelling meta description between 120-160 characters to optimize click-through rate in search engine results.'}
                </p>
              </div>
            )}

            {/* Social Share Card Preview (Facebook, LinkedIn, X, Slack, Discord) */}
            {previewTab === 'social' && (
              <div className="max-w-lg mx-auto rounded-xl bg-[#1d1f23] border border-[#2C2E34] overflow-hidden shadow-xl">
                {currentSectionMeta.ogImage ? (
                  <div className="relative aspect-[1.91/1] w-full bg-black/40 overflow-hidden">
                    <img
                      src={currentSectionMeta.ogImage}
                      alt={currentSectionMeta.ogTitle || 'Social share banner'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-white/90">
                      1200 x 630
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[1.91/1] w-full bg-[#111214] flex flex-col items-center justify-center text-neutral-500 gap-2">
                    <ImageIcon className="w-8 h-8 opacity-40" />
                    <span className="text-xs font-space">No OpenGraph Image Specified</span>
                  </div>
                )}
                <div className="p-3.5 space-y-1 bg-[#17181b]">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#A1A1AA]">
                    nihal-on.vercel.app
                  </span>
                  <h4 className="text-sm font-bold text-white font-syne truncate">
                    {currentSectionMeta.ogTitle || currentSectionMeta.metaTitle || 'Social Share Title'}
                  </h4>
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed font-space">
                    {currentSectionMeta.ogDescription || currentSectionMeta.metaDescription || 'Social card description preview.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Form Fields: Meta Title & Description */}
          <div className="bg-[#17181B] border border-[#2C2E34] rounded-2xl p-6 space-y-5">
            <h3 className="font-syne text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Search className="w-4 h-4 text-[#FF5A1F]" />
              <span>Primary Search Engine Meta Tags</span>
            </h3>

            {/* Meta Title Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-space">
                <label className="text-neutral-300 font-bold uppercase text-[11px] font-mono">
                  Meta Title (<code className="text-[#FF5A1F]">&lt;title&gt;</code>)
                </label>
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className={isTitleOptimal ? 'text-emerald-400 font-bold' : titleLen > 60 ? 'text-amber-400' : 'text-neutral-400'}>
                    {titleLen}/60 chars
                  </span>
                  {isTitleOptimal ? (
                    <span className="text-emerald-400">✓ Optimal</span>
                  ) : titleLen > 60 ? (
                    <span className="text-amber-400">May be truncated</span>
                  ) : (
                    <span className="text-neutral-500">Rec: 30-60</span>
                  )}
                </div>
              </div>
              <input
                type="text"
                value={currentSectionMeta.metaTitle || ''}
                onChange={(e) => handleFieldChange('metaTitle', e.target.value)}
                placeholder="e.g. Selected Projects & Case Studies — Nihal . ON"
                className="w-full bg-[#111214] border border-[#2C2E34] rounded-xl px-4 py-2.5 text-xs text-white font-space focus:border-[#FF5A1F] outline-none"
              />
            </div>

            {/* Meta Description Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-space">
                <label className="text-neutral-300 font-bold uppercase text-[11px] font-mono">
                  Meta Description (<code className="text-[#FF5A1F]">&lt;meta name="description"&gt;</code>)
                </label>
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className={isDescOptimal ? 'text-emerald-400 font-bold' : descLen > 160 ? 'text-amber-400' : 'text-neutral-400'}>
                    {descLen}/160 chars
                  </span>
                  {isDescOptimal ? (
                    <span className="text-emerald-400">✓ Optimal</span>
                  ) : descLen > 160 ? (
                    <span className="text-amber-400">May be truncated</span>
                  ) : (
                    <span className="text-neutral-500">Rec: 120-160</span>
                  )}
                </div>
              </div>
              <textarea
                rows={3}
                value={currentSectionMeta.metaDescription || ''}
                onChange={(e) => handleFieldChange('metaDescription', e.target.value)}
                placeholder="Compelling 1-2 sentences summarizing the core offerings and inviting user exploration..."
                className="w-full bg-[#111214] border border-[#2C2E34] rounded-xl p-3.5 text-xs text-white font-space focus:border-[#FF5A1F] outline-none leading-relaxed"
              />
            </div>

            {/* Keywords */}
            <div className="space-y-1.5">
              <label className="text-neutral-300 font-bold uppercase text-[11px] font-mono">
                Keywords & Topic Tags (Comma-Separated)
              </label>
              <input
                type="text"
                value={currentSectionMeta.keywords || ''}
                onChange={(e) => handleFieldChange('keywords', e.target.value)}
                placeholder="e.g. React 19, UX Architecture, Case Studies, Creative Technologist"
                className="w-full bg-[#111214] border border-[#2C2E34] rounded-xl px-4 py-2 text-xs text-white font-space focus:border-[#FF5A1F] outline-none"
              />
            </div>
          </div>

          {/* Form Fields: OpenGraph & Social Cards */}
          <div className="bg-[#17181B] border border-[#2C2E34] rounded-2xl p-6 space-y-5">
            <h3 className="font-syne text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#FF5A1F]" />
              <span>OpenGraph & Social Sharing Cards (Facebook, LinkedIn, X/Twitter, Slack)</span>
            </h3>

            {/* OG Title & Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-neutral-300 font-bold uppercase text-[11px] font-mono">
                  OG Title (<code className="text-[#FF5A1F]">og:title</code>)
                </label>
                <input
                  type="text"
                  value={currentSectionMeta.ogTitle || ''}
                  onChange={(e) => handleFieldChange('ogTitle', e.target.value)}
                  placeholder="Defaults to Meta Title if blank"
                  className="w-full bg-[#111214] border border-[#2C2E34] rounded-xl px-4 py-2 text-xs text-white font-space focus:border-[#FF5A1F] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-neutral-300 font-bold uppercase text-[11px] font-mono">
                  OG Type (<code className="text-[#FF5A1F]">og:type</code>)
                </label>
                <select
                  value={currentSectionMeta.ogType || 'website'}
                  onChange={(e) => handleFieldChange('ogType', e.target.value as any)}
                  className="w-full bg-[#111214] border border-[#2C2E34] rounded-xl px-4 py-2 text-xs text-white font-space focus:border-[#FF5A1F] outline-none"
                >
                  <option value="website">website (Standard Pages & Sections)</option>
                  <option value="article">article (Blog Posts & Case Studies)</option>
                  <option value="profile">profile (About & Author Bio)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-neutral-300 font-bold uppercase text-[11px] font-mono">
                OG Description (<code className="text-[#FF5A1F]">og:description</code>)
              </label>
              <textarea
                rows={2}
                value={currentSectionMeta.ogDescription || ''}
                onChange={(e) => handleFieldChange('ogDescription', e.target.value)}
                placeholder="Defaults to Meta Description if blank"
                className="w-full bg-[#111214] border border-[#2C2E34] rounded-xl p-3 text-xs text-white font-space focus:border-[#FF5A1F] outline-none leading-relaxed"
              />
            </div>

            {/* OG Image URL */}
            <div className="space-y-1.5">
              <label className="text-neutral-300 font-bold uppercase text-[11px] font-mono flex items-center justify-between">
                <span>OpenGraph Image URL (<code className="text-[#FF5A1F]">og:image</code> & <code className="text-[#FF5A1F]">twitter:image</code>)</span>
                <span className="text-[10px] text-neutral-400 font-normal">Recommended: 1200 x 630 px</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentSectionMeta.ogImage || ''}
                  onChange={(e) => handleFieldChange('ogImage', e.target.value)}
                  placeholder="https://... image URL for social preview"
                  className="flex-1 bg-[#111214] border border-[#2C2E34] rounded-xl px-4 py-2 text-xs text-white font-space focus:border-[#FF5A1F] outline-none"
                />
              </div>

              {/* Quick Image Presets */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className="text-[10px] font-mono text-neutral-500">Preset Banners:</span>
                {[
                  { label: 'Cyberpunk Banner', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop' },
                  { label: 'Minimal Studio', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop' },
                  { label: 'Tech Workspace', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop' },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleFieldChange('ogImage', preset.url)}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#111214] border border-[#2C2E34] text-neutral-400 hover:text-[#FF5A1F] hover:border-[#FF5A1F]/30 transition-all cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Twitter Card & Canonical URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-neutral-300 font-bold uppercase text-[11px] font-mono">
                  Twitter Card Format (<code className="text-[#FF5A1F]">twitter:card</code>)
                </label>
                <select
                  value={currentSectionMeta.twitterCard || 'summary_large_image'}
                  onChange={(e) => handleFieldChange('twitterCard', e.target.value as any)}
                  className="w-full bg-[#111214] border border-[#2C2E34] rounded-xl px-4 py-2 text-xs text-white font-space focus:border-[#FF5A1F] outline-none"
                >
                  <option value="summary_large_image">summary_large_image (High Impact Large Banner)</option>
                  <option value="summary">summary (Standard Square Thumbnail)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-neutral-300 font-bold uppercase text-[11px] font-mono">
                  Canonical URL (<code className="text-[#FF5A1F]">rel="canonical"</code>)
                </label>
                <input
                  type="text"
                  value={currentSectionMeta.canonicalUrl || `https://nihal-on.vercel.app/${sectionDef.routeHash !== '#home' ? sectionDef.routeHash : ''}`}
                  onChange={(e) => handleFieldChange('canonicalUrl', e.target.value)}
                  placeholder="https://nihal-on.vercel.app/#..."
                  className="w-full bg-[#111214] border border-[#2C2E34] rounded-xl px-4 py-2 text-xs text-white font-space focus:border-[#FF5A1F] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Quick HTML Snippet Inspector */}
          <div className="bg-[#17181B] border border-[#2C2E34] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FF5A1F]" />
                <span>Generated HTML Output For Document Head</span>
              </span>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 text-[11px] font-mono text-[#FF5A1F] hover:underline cursor-pointer"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Tags'}</span>
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-[#111214] border border-[#2C2E34] text-[11px] font-mono text-neutral-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {generatedHtmlSnippet}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
