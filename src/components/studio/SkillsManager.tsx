import { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { SkillCategory, SkillItem } from '../../types';
import { SKILL_CATEGORIES } from '../../data/portfolioData';
import { BarChart3, Plus, Trash2, Save, Layers, CheckCircle2 } from 'lucide-react';

export default function SkillsManager() {
  const { draftData, updateSkillCategories, publish } = useStudio();
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>(
    draftData?.skillCategories && draftData.skillCategories.length > 0
      ? draftData.skillCategories
      : SKILL_CATEGORIES
  );
  const [selectedCatIndex, setSelectedCatIndex] = useState<number>(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLevelChange = (catIdx: number, itemIdx: number, newLevel: number) => {
    const updated = JSON.parse(JSON.stringify(skillCategories)) as SkillCategory[];
    updated[catIdx].items[itemIdx].level = Math.max(0, Math.min(100, newLevel));
    setSkillCategories(updated);
    updateSkillCategories(updated);
  };

  const handleFieldChange = (catIdx: number, itemIdx: number, field: keyof SkillItem, val: string) => {
    const updated = JSON.parse(JSON.stringify(skillCategories)) as SkillCategory[];
    (updated[catIdx].items[itemIdx] as any)[field] = val;
    setSkillCategories(updated);
    updateSkillCategories(updated);
  };

  const handleAddSkill = (catIdx: number) => {
    const updated = JSON.parse(JSON.stringify(skillCategories)) as SkillCategory[];
    updated[catIdx].items.push({
      name: 'New Skill',
      level: 85,
      icon: 'Code2',
      experienceYears: '3 yrs',
      tag: 'Advanced'
    });
    setSkillCategories(updated);
    updateSkillCategories(updated);
  };

  const handleDeleteSkill = (catIdx: number, itemIdx: number) => {
    const updated = JSON.parse(JSON.stringify(skillCategories)) as SkillCategory[];
    updated[catIdx].items.splice(itemIdx, 1);
    setSkillCategories(updated);
    updateSkillCategories(updated);
  };

  const handleSaveAll = async () => {
    updateSkillCategories(skillCategories);
    await publish();
    setSuccessMessage('Skills graph & proficiency levels successfully saved and published!');
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const activeCategory = skillCategories[selectedCatIndex] || skillCategories[0];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#111214] overflow-y-auto p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2C2E34] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#FF5A1F] mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Proficiency Matrix & Graph Control</span>
          </div>
          <h1 className="font-syne text-2xl font-bold text-white">Skills & Graph Management</h1>
          <p className="text-xs font-space text-neutral-400 mt-1">
            Control the graph of skill bars, proficiency percentages, experience years, and tags in real time.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5A1F] to-[#FF8A00] text-black font-space font-bold text-xs shadow-lg shadow-[#FF5A1F]/30 hover:brightness-110 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save & Publish Skills</span>
        </button>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-space">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 bg-[#17181B] p-1.5 rounded-2xl border border-[#2C2E34]">
        {skillCategories.map((cat, idx) => (
          <button
            key={cat.category}
            onClick={() => setSelectedCatIndex(idx)}
            className={`px-4 py-2.5 rounded-xl text-xs font-space font-semibold transition-all cursor-pointer ${
              selectedCatIndex === idx
                ? 'bg-[#FF5A1F] text-black shadow-md shadow-[#FF5A1F]/30 font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {cat.category} ({cat.items.length})
          </button>
        ))}
      </div>

      {/* Active Category Skills List & Graph Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-syne text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#FF5A1F]" />
            <span>{activeCategory.category} Skills Graph</span>
          </h3>
          <button
            onClick={() => handleAddSkill(selectedCatIndex)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 text-[#FF5A1F] hover:bg-[#FF5A1F]/20 text-xs font-space font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Skill Item</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeCategory.items.map((skill, itemIdx) => (
            <div 
              key={itemIdx}
              className="p-5 rounded-2xl bg-[#17181B] border border-[#2C2E34] space-y-4 hover:border-[#FF5A1F]/40 transition-all"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase">Skill Name</label>
                  <input
                    type="text"
                    value={skill.name}
                    onChange={(e) => handleFieldChange(selectedCatIndex, itemIdx, 'name', e.target.value)}
                    className="w-full bg-[#111214] border border-[#2C2E34] rounded-lg px-3 py-1.5 text-xs text-white font-syne font-bold focus:border-[#FF5A1F] outline-none"
                  />
                </div>
                <button
                  onClick={() => handleDeleteSkill(selectedCatIndex, itemIdx)}
                  className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer mt-5"
                  title="Delete Skill"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-neutral-400 uppercase">Experience Years</label>
                  <input
                    type="text"
                    value={skill.experienceYears}
                    onChange={(e) => handleFieldChange(selectedCatIndex, itemIdx, 'experienceYears', e.target.value)}
                    className="w-full bg-[#111214] border border-[#2C2E34] rounded-lg px-3 py-1.5 text-xs text-white font-space focus:border-[#FF5A1F] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-neutral-400 uppercase">Badge Tag</label>
                  <input
                    type="text"
                    value={skill.tag}
                    onChange={(e) => handleFieldChange(selectedCatIndex, itemIdx, 'tag', e.target.value)}
                    className="w-full bg-[#111214] border border-[#2C2E34] rounded-lg px-3 py-1.5 text-xs text-white font-space focus:border-[#FF5A1F] outline-none"
                  />
                </div>
              </div>

              {/* Proficiency Level Graph Control Slider */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between text-xs font-space">
                  <span className="text-neutral-400">Proficiency Graph Level</span>
                  <span className="text-[#FF5A1F] font-bold font-mono">{skill.level}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={skill.level}
                    onChange={(e) => handleLevelChange(selectedCatIndex, itemIdx, parseInt(e.target.value) || 0)}
                    className="flex-1 accent-[#FF5A1F] cursor-pointer h-1.5 bg-[#2C2E34] rounded-lg"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={skill.level}
                    onChange={(e) => handleLevelChange(selectedCatIndex, itemIdx, parseInt(e.target.value) || 0)}
                    className="w-16 bg-[#111214] border border-[#2C2E34] rounded-lg px-2 py-1 text-xs text-white text-center font-mono focus:border-[#FF5A1F] outline-none"
                  />
                </div>
                {/* Visual Preview Bar */}
                <div className="h-2 w-full rounded-full bg-[#111214] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#FF5A1F] to-orange-400 transition-all duration-300"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
