import React, { useState, useEffect } from 'react';
import { useStudio } from '../../context/StudioContext';
import { Settings, Save, History, RotateCcw, Shield, Check, Globe } from 'lucide-react';
import { StudioRevision } from '../../types/studio';

export default function SiteSettingsView() {
  const { draftData, updateSiteSettings, publish } = useStudio();
  const settings = draftData.siteSettings;

  const [revisions, setRevisions] = useState<StudioRevision[]>([]);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/studio/revisions')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.revisions) {
          setRevisions(data.revisions);
        }
      })
      .catch(() => {});
  }, []);

  const handleRestore = async (id: string) => {
    setRestoringId(id);
    try {
      const res = await fetch(`/api/studio/restore/${id}`, { method: 'POST' });
      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to restore revision:', err);
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="flex-1 bg-[#111214] overflow-y-auto p-6 sm:p-8 min-h-0">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="border-b border-[#2C2E34] pb-5">
          <h1 className="text-xl font-bold text-[#F4F4F5] tracking-tight">
            Site Settings & SEO
          </h1>
          <p className="text-xs text-[#71717A] mt-1">
            Global portfolio meta tags, author profiles, floating admin button, and version snapshots.
          </p>
        </div>

        {/* Floating Admin Button Settings */}
        <div className="bg-[#17181B] border border-[#2C2E34] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4F4F5] font-mono">
                FLOATING ADMIN BUTTON (BOTTOM-LEFT)
              </h3>
              <p className="text-xs text-[#71717A] mt-0.5">
                Fixed entrance button displayed on the public portfolio website.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showAdminButton}
                onChange={(e) => updateSiteSettings({ showAdminButton: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[#202126] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF5A1F]"></div>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="block text-[11px] text-[#A1A1AA] uppercase font-mono mb-1">Button Label</label>
              <input
                type="text"
                value={settings.adminButtonLabel || 'Admin'}
                onChange={(e) => updateSiteSettings({ adminButtonLabel: e.target.value })}
                className="w-full bg-[#111214] border border-[#2C2E34] rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#FF5A1F]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#A1A1AA] uppercase font-mono mb-1">Fixed Viewport Position</label>
              <select
                value={settings.adminButtonPosition || 'bottom-left'}
                onChange={(e) => updateSiteSettings({ adminButtonPosition: e.target.value as any })}
                className="w-full bg-[#111214] border border-[#2C2E34] rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#FF5A1F]"
              >
                <option value="bottom-left">Bottom-Left Corner (Default / Recommended)</option>
                <option value="bottom-right">Bottom-Right Corner</option>
              </select>
            </div>
          </div>
        </div>

        {/* General Site Metadata & SEO */}
        <div className="bg-[#17181B] border border-[#2C2E34] rounded-xl p-5 space-y-4 text-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4F4F5] font-mono">
            PORTFOLIO IDENTITY & METADATA
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] text-[#A1A1AA] uppercase font-mono mb-1">Site Title</label>
              <input
                type="text"
                value={settings.siteTitle}
                onChange={(e) => updateSiteSettings({ siteTitle: e.target.value })}
                className="w-full bg-[#111214] border border-[#2C2E34] rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#FF5A1F]"
              />
            </div>

            <div>
              <label className="block text-[11px] text-[#A1A1AA] uppercase font-mono mb-1">Meta Description</label>
              <textarea
                rows={2}
                value={settings.siteDescription}
                onChange={(e) => updateSiteSettings({ siteDescription: e.target.value })}
                className="w-full bg-[#111214] border border-[#2C2E34] rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#FF5A1F]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-[#A1A1AA] uppercase font-mono mb-1">Author Name</label>
                <input
                  type="text"
                  value={settings.authorName}
                  onChange={(e) => updateSiteSettings({ authorName: e.target.value })}
                  className="w-full bg-[#111214] border border-[#2C2E34] rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#A1A1AA] uppercase font-mono mb-1">Location</label>
                <input
                  type="text"
                  value={settings.location}
                  onChange={(e) => updateSiteSettings({ location: e.target.value })}
                  className="w-full bg-[#111214] border border-[#2C2E34] rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-[#A1A1AA] uppercase font-mono mb-1">Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => updateSiteSettings({ email: e.target.value })}
                  className="w-full bg-[#111214] border border-[#2C2E34] rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#A1A1AA] uppercase font-mono mb-1">Availability Status</label>
                <input
                  type="text"
                  value={settings.status}
                  onChange={(e) => updateSiteSettings({ status: e.target.value })}
                  className="w-full bg-[#111214] border border-[#2C2E34] rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-[#17181B] border border-[#2C2E34] rounded-xl p-5 space-y-4 text-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4F4F5] font-mono">
            SOCIAL PROFILES
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-[#71717A] uppercase font-mono mb-1">GitHub</label>
              <input
                type="text"
                value={settings.github}
                onChange={(e) => updateSiteSettings({ github: e.target.value })}
                className="w-full bg-[#111214] border border-[#2C2E34] rounded px-2.5 py-1 text-white focus:outline-none focus:border-[#FF5A1F]"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#71717A] uppercase font-mono mb-1">LinkedIn</label>
              <input
                type="text"
                value={settings.linkedin}
                onChange={(e) => updateSiteSettings({ linkedin: e.target.value })}
                className="w-full bg-[#111214] border border-[#2C2E34] rounded px-2.5 py-1 text-white focus:outline-none focus:border-[#FF5A1F]"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#71717A] uppercase font-mono mb-1">Twitter / X</label>
              <input
                type="text"
                value={settings.twitter}
                onChange={(e) => updateSiteSettings({ twitter: e.target.value })}
                className="w-full bg-[#111214] border border-[#2C2E34] rounded px-2.5 py-1 text-white focus:outline-none focus:border-[#FF5A1F]"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#71717A] uppercase font-mono mb-1">Instagram</label>
              <input
                type="text"
                value={settings.instagram}
                onChange={(e) => updateSiteSettings({ instagram: e.target.value })}
                className="w-full bg-[#111214] border border-[#2C2E34] rounded px-2.5 py-1 text-white focus:outline-none focus:border-[#FF5A1F]"
              />
            </div>
          </div>
        </div>

        {/* Database JSON Backup & Import Manager */}
        <div className="bg-[#17181B] border border-[#2C2E34] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4F4F5] font-mono flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-[#FF5A1F]" />
                <span>DATABASE BACKUP & DATA IMPORT / EXPORT</span>
              </h3>
              <p className="text-xs text-[#71717A] mt-0.5">
                Download a complete JSON snapshot of all your database elements, projects, gallery, and blog posts, or restore from file.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(draftData, null, 2));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", `portfolio_database_backup_${new Date().toISOString().slice(0, 10)}.json`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#FF5A1F] hover:bg-[#FF723F] text-black font-bold text-xs font-mono transition-colors cursor-pointer shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Export Full JSON Database</span>
            </button>

            <label className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#202126] hover:bg-[#2A2C33] text-white font-medium text-xs font-mono border border-[#2C2E34] hover:border-[#FF5A1F] transition-colors cursor-pointer">
              <Globe className="w-4 h-4 text-[#06B6D4]" />
              <span>Import Database JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const parsed = JSON.parse(event.target?.result as string);
                        if (parsed && typeof parsed === 'object') {
                          if (confirm('Importing this database backup will update your current portfolio draft. Continue?')) {
                            if (parsed.siteSettings) updateSiteSettings(parsed.siteSettings);
                            alert('Database backup JSON successfully loaded!');
                            window.location.reload();
                          }
                        }
                      } catch (err) {
                        alert('Invalid JSON database backup file.');
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Live SEO Search Snippet & Social Card Preview */}
        <div className="bg-[#17181B] border border-[#2C2E34] rounded-xl p-5 space-y-4 text-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4F4F5] font-mono flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span>LIVE SEO GOOGLE SEARCH & SOCIAL SHARE PREVIEW</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Google Search Card Preview */}
            <div className="bg-[#111214] border border-[#2C2E34] rounded-lg p-3.5 space-y-1.5">
              <span className="text-[10px] text-[#71717A] uppercase font-mono block">Google Search Result Preview</span>
              <p className="text-xs text-[#8AB4F8] font-medium hover:underline truncate cursor-pointer">
                {settings.siteTitle || 'Nihal | Senior Designer & Developer Portfolio'}
              </p>
              <p className="text-[11px] text-[#202124] bg-white/10 px-1.5 py-0.5 rounded inline-block font-mono text-[#BDC1C6] truncate max-w-full">
                https://yourdomain.com
              </p>
              <p className="text-[11px] text-[#BDC1C6] line-clamp-2 leading-relaxed">
                {settings.siteDescription || 'Explore interactive portfolio featuring custom web applications, digital product design, and software engineering.'}
              </p>
            </div>

            {/* Social OpenGraph Card Preview */}
            <div className="bg-[#111214] border border-[#2C2E34] rounded-lg p-3.5 space-y-2">
              <span className="text-[10px] text-[#71717A] uppercase font-mono block">Social Media Share Card Preview</span>
              <div className="bg-[#1D1E22] border border-[#2C2E34] rounded overflow-hidden">
                <div className="h-20 bg-gradient-to-r from-[#FF5A1F]/30 via-purple-900/30 to-[#06B6D4]/30 flex items-center justify-center text-white/40 font-mono text-xs">
                  Portfolio Social Preview Card
                </div>
                <div className="p-2 space-y-0.5">
                  <p className="text-[10px] text-[#A1A1AA] uppercase font-mono">yourdomain.com</p>
                  <p className="text-xs font-bold text-white truncate">{settings.siteTitle}</p>
                  <p className="text-[10px] text-[#71717A] line-clamp-1">{settings.siteDescription}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revisions & Rollback */}
        <div className="bg-[#17181B] border border-[#2C2E34] rounded-xl p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4F4F5] font-mono flex items-center gap-2">
                <History className="w-3.5 h-3.5 text-[#FF5A1F]" />
                <span>PUBLISHED REVISION HISTORY</span>
              </h3>
              <p className="text-xs text-[#71717A] mt-0.5">
                Every published deployment creates a snapshot. You can roll back anytime.
              </p>
            </div>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto">
            {revisions.length === 0 ? (
              <p className="text-xs text-[#71717A] py-2">No revisions logged yet. Revisions are created upon publishing.</p>
            ) : (
              revisions.map(rev => (
                <div
                  key={rev.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#111214] border border-[#2C2E34]"
                >
                  <div>
                    <p className="text-xs font-medium text-white">{rev.note}</p>
                    <p className="text-[10px] text-[#71717A] font-mono mt-0.5">{rev.timestamp}</p>
                  </div>
                  <button
                    onClick={() => handleRestore(rev.id)}
                    disabled={restoringId === rev.id}
                    className="flex items-center gap-1.5 bg-[#202126] hover:bg-[#25272D] text-[#A1A1AA] hover:text-white px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer border border-[#2C2E34]"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{restoringId === rev.id ? 'Restoring...' : 'Roll Back'}</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
