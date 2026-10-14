import { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { FileText, Save, CheckCircle2, Search, Layers, Globe } from 'lucide-react';

export default function TextContentManager() {
  const { draftData, updateTextNode, updateSiteSettings, publish } = useStudio();
  const elements = draftData?.elements || {};
  const settings = draftData?.siteSettings || {};

  const [searchTerm, setSearchTerm] = useState('');
  const [activeSectionFilter, setActiveSectionFilter] = useState<string>('all');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Group elements by section
  const sectionsList = [
    'hero',
    'about',
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
    'footer',
    'text_node'
  ];

  const filteredElements = Object.values(elements).filter((el) => {
    const matchesSearch = 
      el.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      el.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (el.content?.text && el.content.text.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSection = activeSectionFilter === 'all' || el.section === activeSectionFilter;
    return matchesSearch && matchesSection;
  });

  const handleSaveAndPublish = async () => {
    await publish();
    setSuccessMessage('All text changes saved and published in real-time across the web!');
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#111214] overflow-y-auto p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2C2E34] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#FF5A1F] mb-1">
            <FileText className="w-4 h-4" />
            <span>Complete Website Text Editor</span>
          </div>
          <h1 className="font-syne text-2xl font-bold text-white">Advanced Content & Text Manager</h1>
          <p className="text-xs font-space text-neutral-400 mt-1">
            Edit headlines, taglines, bios, and copy across every section of your web application. Changes sync in real-time.
          </p>
        </div>

        <button
          onClick={handleSaveAndPublish}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5A1F] to-[#FF8A00] text-black font-space font-bold text-xs shadow-lg shadow-[#FF5A1F]/30 hover:brightness-110 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save & Publish All</span>
        </button>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-space">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Search & Section Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#17181B] p-4 rounded-2xl border border-[#2C2E34]">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search text IDs or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111214] border border-[#2C2E34] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-[#FF5A1F] outline-none font-space"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveSectionFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-space font-medium transition-all cursor-pointer ${
              activeSectionFilter === 'all'
                ? 'bg-[#FF5A1F] text-black font-bold'
                : 'text-neutral-400 hover:text-white bg-[#111214]'
            }`}
          >
            All Sections
          </button>
          {sectionsList.map((sec) => (
            <button
              key={sec}
              onClick={() => setActiveSectionFilter(sec)}
              className={`px-3 py-1.5 rounded-lg text-xs font-space font-medium uppercase transition-all cursor-pointer ${
                activeSectionFilter === sec
                  ? 'bg-[#FF5A1F] text-black font-bold'
                  : 'text-neutral-400 hover:text-white bg-[#111214]'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Global Settings Text Fields */}
      <div className="bg-[#17181B] border border-[#2C2E34] rounded-2xl p-6 space-y-4">
        <h3 className="font-syne text-base font-bold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#FF5A1F]" />
          <span>Global Brand & Hero Core Texts</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-mono text-neutral-400 uppercase block mb-1">Site Title</label>
            <input
              type="text"
              value={settings.siteTitle || ''}
              onChange={(e) => updateSiteSettings({ siteTitle: e.target.value })}
              className="w-full bg-[#111214] border border-[#2C2E34] rounded-xl px-3.5 py-2 text-xs text-white font-space focus:border-[#FF5A1F] outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-neutral-400 uppercase block mb-1">Hero Main Heading</label>
            <input
              type="text"
              value={settings.heroHeading || ''}
              onChange={(e) => updateSiteSettings({ heroHeading: e.target.value })}
              className="w-full bg-[#111214] border border-[#2C2E34] rounded-xl px-3.5 py-2 text-xs text-white font-space focus:border-[#FF5A1F] outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-neutral-400 uppercase block mb-1">Hero Subheading</label>
            <input
              type="text"
              value={settings.heroSubheading || ''}
              onChange={(e) => updateSiteSettings({ heroSubheading: e.target.value })}
              className="w-full bg-[#111214] border border-[#2C2E34] rounded-xl px-3.5 py-2 text-xs text-white font-space focus:border-[#FF5A1F] outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-neutral-400 uppercase block mb-1">About Section Heading</label>
            <input
              type="text"
              value={settings.aboutHeading || ''}
              onChange={(e) => updateSiteSettings({ aboutHeading: e.target.value })}
              className="w-full bg-[#111214] border border-[#2C2E34] rounded-xl px-3.5 py-2 text-xs text-white font-space focus:border-[#FF5A1F] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Elements Text Editor Grid */}
      <div className="space-y-4">
        <h3 className="font-syne text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#FF5A1F]" />
          <span>Section Elements & Text Nodes ({filteredElements.length})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredElements.map((el) => {
            const currentText = el.content?.text || '';
            const isLong = currentText.length > 80 || currentText.includes('\n');
            return (
              <div
                key={el.id}
                className="p-5 rounded-2xl bg-[#17181B] border border-[#2C2E34] space-y-3 hover:border-[#FF5A1F]/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-syne font-bold text-white">{el.label}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#111214] border border-[#2C2E34] text-[10px] font-mono text-[#FF5A1F] uppercase">
                    {el.section}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-neutral-500">ID: {el.id}</span>
                  {isLong ? (
                    <textarea
                      rows={3}
                      value={currentText}
                      onChange={(e) => updateTextNode(el.id, e.target.value)}
                      className="w-full bg-[#111214] border border-[#2C2E34] rounded-xl p-3 text-xs text-white font-space focus:border-[#FF5A1F] outline-none leading-relaxed"
                    />
                  ) : (
                    <input
                      type="text"
                      value={currentText}
                      onChange={(e) => updateTextNode(el.id, e.target.value)}
                      className="w-full bg-[#111214] border border-[#2C2E34] rounded-xl px-3 py-2 text-xs text-white font-space focus:border-[#FF5A1F] outline-none"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
