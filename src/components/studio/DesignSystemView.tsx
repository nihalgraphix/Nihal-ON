import React from 'react';
import { useStudio } from '../../context/StudioContext';
import { Palette, Check, Sparkles, RefreshCcw } from 'lucide-react';

export default function DesignSystemView() {
  const { draftData, updateDesignTokens } = useStudio();
  const tokens = draftData.designTokens;

  const accentPresets = [
    { name: 'Cyber Neon Orange (Default)', value: '#FF5A1F' },
    { name: 'Amber Gold', value: '#F59E0B' },
    { name: 'Electric Emerald', value: '#10B981' },
    { name: 'Ultra Violet', value: '#8B5CF6' },
    { name: 'Cyan Blue', value: '#06B6D4' },
    { name: 'Hot Crimson', value: '#F43F5E' },
  ];

  const themePresets = [
    {
      name: 'Flame Cyber Orange',
      primaryAccent: '#FF5A1F',
      secondaryAccent: '#06B6D4',
      backgroundDark: '#060606',
      surfaceDark: '#111214',
      panelDark: '#17181B',
      borderRadius: '8px',
    },
    {
      name: 'Midnight Neon Cyan',
      primaryAccent: '#06B6D4',
      secondaryAccent: '#3B82F6',
      backgroundDark: '#0B1120',
      surfaceDark: '#0F172A',
      panelDark: '#1E293B',
      borderRadius: '12px',
    },
    {
      name: 'Deep Violet Glow',
      primaryAccent: '#8B5CF6',
      secondaryAccent: '#EC4899',
      backgroundDark: '#0F0E17',
      surfaceDark: '#1A1829',
      panelDark: '#232136',
      borderRadius: '16px',
    },
    {
      name: 'Luxury Gold Monokai',
      primaryAccent: '#EAB308',
      secondaryAccent: '#F59E0B',
      backgroundDark: '#121212',
      surfaceDark: '#1E1E1E',
      panelDark: '#2D2D2D',
      borderRadius: '6px',
    },
    {
      name: 'Emerald Tech',
      primaryAccent: '#10B981',
      secondaryAccent: '#06B6D4',
      backgroundDark: '#091712',
      surfaceDark: '#0E241C',
      panelDark: '#143328',
      borderRadius: '8px',
    },
  ];

  return (
    <div className="flex-1 bg-[#111214] overflow-y-auto p-6 sm:p-8 min-h-0">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="border-b border-[#2C2E34] pb-5">
          <h1 className="text-xl font-bold text-[#F4F4F5] tracking-tight">
            Design System & Global Tokens
          </h1>
          <p className="text-xs text-[#71717A] mt-1">
            Global color tokens, typography scales, surface depth, and border radii applied across your portfolio.
          </p>
        </div>

        {/* 1-Click Global Theme Presets */}
        <div className="bg-[#17181B] border border-[#2C2E34] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4F4F5] font-mono flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#FF5A1F]" />
                <span>1-CLICK GLOBAL THEME PRESETS</span>
              </h3>
              <p className="text-xs text-[#71717A] mt-0.5">
                Transform your portfolio's complete aesthetic instantaneously.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
            {themePresets.map(preset => (
              <button
                key={preset.name}
                onClick={() => updateDesignTokens(preset)}
                className="group text-left p-3 rounded-xl border border-[#2C2E34] hover:border-[#FF5A1F] bg-[#111214] hover:bg-[#18191E] transition-all cursor-pointer shadow-md space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-[#FF5A1F] transition-colors">{preset.name}</span>
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-white/20"
                    style={{ backgroundColor: preset.primaryAccent }}
                  />
                </div>
                <div className="flex items-center gap-1.5 h-4 w-full rounded overflow-hidden border border-[#2C2E34]">
                  <div className="h-full flex-1" style={{ backgroundColor: preset.backgroundDark }} />
                  <div className="h-full flex-1" style={{ backgroundColor: preset.surfaceDark }} />
                  <div className="h-full flex-1" style={{ backgroundColor: preset.panelDark }} />
                  <div className="h-full flex-1" style={{ backgroundColor: preset.primaryAccent }} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Primary Accent Color */}
        <div className="bg-[#17181B] border border-[#2C2E34] rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4F4F5] font-mono">
              BRAND ACCENT COLOR
            </h3>
            <p className="text-xs text-[#71717A] mt-0.5">
              Affects buttons, glows, selection indicators, progress bar, and badge highlights.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {accentPresets.map(preset => (
              <button
                key={preset.value}
                onClick={() => updateDesignTokens({ primaryAccent: preset.value })}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-xs cursor-pointer transition-all ${
                  tokens.primaryAccent.toLowerCase() === preset.value.toLowerCase()
                    ? 'border-[#FF5A1F] bg-[#202126] text-white shadow-xs'
                    : 'border-[#2C2E34] bg-[#141518] text-[#A1A1AA] hover:border-[#3E4048]'
                }`}
              >
                <span
                  style={{ backgroundColor: preset.value }}
                  className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                />
                <span>{preset.name}</span>
              </button>
            ))}
          </div>

          <div className="pt-2 flex items-center gap-3">
            <span className="text-xs text-[#A1A1AA]">Custom Accent:</span>
            <input
              type="color"
              value={tokens.primaryAccent.startsWith('#') ? tokens.primaryAccent.slice(0, 7) : '#FF5A1F'}
              onChange={(e) => updateDesignTokens({ primaryAccent: e.target.value })}
              className="w-8 h-8 rounded border border-[#2C2E34] cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={tokens.primaryAccent}
              onChange={(e) => updateDesignTokens({ primaryAccent: e.target.value })}
              className="w-28 bg-[#111214] border border-[#2C2E34] rounded px-2 py-1 text-xs text-white font-mono"
            />
          </div>
        </div>

        {/* Surface & Background Depths */}
        <div className="bg-[#17181B] border border-[#2C2E34] rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4F4F5] font-mono">
            SURFACE DEPTH & MATTE PALETTE
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg border border-[#2C2E34] bg-[#111214]">
              <span className="text-[10px] text-[#71717A] uppercase font-mono block">Canvas Dark</span>
              <p className="text-xs text-white font-mono mt-1">{tokens.backgroundDark}</p>
              <div style={{ backgroundColor: tokens.backgroundDark }} className="h-6 w-full rounded mt-2 border border-[#2C2E34]" />
            </div>

            <div className="p-3 rounded-lg border border-[#2C2E34] bg-[#141518]">
              <span className="text-[10px] text-[#71717A] uppercase font-mono block">Surface Dark</span>
              <p className="text-xs text-white font-mono mt-1">{tokens.surfaceDark}</p>
              <div style={{ backgroundColor: tokens.surfaceDark }} className="h-6 w-full rounded mt-2 border border-[#2C2E34]" />
            </div>

            <div className="p-3 rounded-lg border border-[#2C2E34] bg-[#17181B]">
              <span className="text-[10px] text-[#71717A] uppercase font-mono block">Card / Panel Depth</span>
              <p className="text-xs text-white font-mono mt-1">{tokens.panelDark}</p>
              <div style={{ backgroundColor: tokens.panelDark }} className="h-6 w-full rounded mt-2 border border-[#2C2E34]" />
            </div>
          </div>
        </div>

        {/* Border Radius Tokens */}
        <div className="bg-[#17181B] border border-[#2C2E34] rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4F4F5] font-mono">
            BORDER RADIUS TOKENS
          </h3>

          <div className="flex items-center gap-3">
            {['4px', '8px', '12px', '16px', '24px'].map(r => (
              <button
                key={r}
                onClick={() => updateDesignTokens({ borderRadius: r })}
                className={`px-4 py-2 rounded border text-xs font-mono transition-all cursor-pointer ${
                  tokens.borderRadius === r
                    ? 'border-[#FF5A1F] bg-[#24262B] text-white'
                    : 'border-[#2C2E34] bg-[#141518] text-[#A1A1AA] hover:border-[#3E4048]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
