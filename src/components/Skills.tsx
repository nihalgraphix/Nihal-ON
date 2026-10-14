import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SKILL_CATEGORIES } from '../data/portfolioData';
import { containerVariants, itemVariants } from './AnimatedSection';
import { useStudio } from '../context/StudioContext';
import EditableText from './EditableText';
import {
  Code2,
  Globe,
  FileCode,
  Palette,
  Layout,
  Zap,
  Activity,
  Box,
  Image,
  Server,
  Database,
  Cpu,
  Cloud,
  Bot,
  Sparkles,
  Layers
} from 'lucide-react';

export default function Skills() {
  const { publishedData, draftData, isStudioOpen } = useStudio();
  const activeData = isStudioOpen ? draftData : publishedData;
  const elements = activeData?.elements || {};
  const skillsHeadingEl = elements['skills-heading'];
  const [activeCategory, setActiveCategory] = useState<string>('Frontend Engineering');

  const getSkillIcon = (icon: string) => {
    switch (icon) {
      case 'Code2': return <Code2 className="h-5 w-5 text-[#FF5A1F]" />;
      case 'Globe': return <Globe className="h-5 w-5 text-[#FF5A1F]" />;
      case 'FileCode': return <FileCode className="h-5 w-5 text-[#FF5A1F]" />;
      case 'Palette': return <Palette className="h-5 w-5 text-[#FF5A1F]" />;
      case 'Layout': return <Layout className="h-5 w-5 text-[#FF5A1F]" />;
      case 'Zap': return <Zap className="h-5 w-5 text-[#FF5A1F]" />;
      case 'Activity': return <Activity className="h-5 w-5 text-[#FF5A1F]" />;
      case 'Box': return <Box className="h-5 w-5 text-[#FF5A1F]" />;
      case 'Image': return <Image className="h-5 w-5 text-[#FF5A1F]" />;
      case 'Server': return <Server className="h-5 w-5 text-[#FF5A1F]" />;
      case 'Database': return <Database className="h-5 w-5 text-[#FF5A1F]" />;
      case 'Cpu': return <Cpu className="h-5 w-5 text-[#FF5A1F]" />;
      case 'Cloud': return <Cloud className="h-5 w-5 text-[#FF5A1F]" />;
      case 'Bot': return <Bot className="h-5 w-5 text-[#FF5A1F]" />;
      case 'Sparkles': return <Sparkles className="h-5 w-5 text-[#FF5A1F]" />;
      case 'Layers': return <Layers className="h-5 w-5 text-[#FF5A1F]" />;
      default: return <Code2 className="h-5 w-5 text-[#FF5A1F]" />;
    }
  };

  const skillCategories = activeData?.skillCategories && activeData.skillCategories.length > 0
    ? activeData.skillCategories
    : SKILL_CATEGORIES;

  const currentCatObj = skillCategories.find(c => c.category === activeCategory) || skillCategories[0];

  return (
    <section id="skills" className="relative py-28 bg-[#060606] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 cursor-pointer"
        >
          <div data-editable-id="skills-heading">
            <div className="flex items-center gap-2 text-xs font-space uppercase tracking-widest text-[#FF5A1F] mb-3">
              <span className="h-2 w-2 rounded-full bg-[#FF5A1F]" />
              <EditableText id="skills-tag" as="span" defaultText="Technical Proficiency" />
            </div>
            <EditableText
              id="skills-heading-title"
              as="h2"
              className="font-syne text-3xl sm:text-5xl font-extrabold text-white tracking-tight"
              defaultText="Tools & Mastery Matrix"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-[#111111] border border-white/10">
            {skillCategories.map((cat) => (
              <button
                key={cat.category}
                onClick={() => setActiveCategory(cat.category)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold font-space transition-all cursor-pointer ${
                  activeCategory === cat.category
                    ? 'bg-[#FF5A1F] text-black shadow-lg shadow-[#FF5A1F]/30'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {cat.category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Skills Grid with AnimatePresence */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {currentCatObj.items.map((skill, index) => {
              const skillElId = `skill-${activeCategory.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${index}`;
              const customEl = elements[skillElId];
              const skillName = customEl?.content?.text?.split('\n')[0] || skill.name;
              const skillYears = customEl?.content?.text?.split('\n')[1] || skill.experienceYears;
              return (
                <motion.div
                  key={index}
                  data-editable-id={skillElId}
                  variants={itemVariants}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  style={{
                    transform: (customEl?.spacing?.transformX || customEl?.spacing?.transformY)
                      ? `translate(${customEl?.spacing?.transformX || 0}px, ${customEl?.spacing?.transformY || 0}px)`
                      : undefined,
                  }}
                  className="glass-card glass-card-hover p-6 rounded-3xl border border-white/10 space-y-4 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/30">
                        {getSkillIcon(skill.icon)}
                      </div>
                      <div>
                        <EditableText
                          id={`skill-name-${activeCategory.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${index}`}
                          as="h3"
                          className="font-syne font-bold text-white text-base"
                          defaultText={skillName}
                        />
                        <EditableText
                          id={`skill-years-${activeCategory.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${index}`}
                          as="span"
                          className="text-[11px] font-space text-neutral-400"
                          defaultText={skillYears}
                        />
                      </div>
                    </div>

                    <EditableText
                      id={`skill-tag-${activeCategory.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${index}`}
                      as="span"
                      className="rounded-full bg-[#FF5A1F]/15 border border-[#FF5A1F]/40 px-3 py-1 text-[10px] font-space font-bold text-[#FF5A1F]"
                      defaultText={skill.tag || 'Expert'}
                    />
                  </div>

                  {/* Animated Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-space text-neutral-400">
                      <EditableText
                        id={`skill-prof-lbl-${activeCategory.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${index}`}
                        as="span"
                        className="text-neutral-400 font-space"
                        defaultText="Proficiency"
                      />
                      <EditableText
                        id={`skill-level-${activeCategory.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${index}`}
                        as="span"
                        className="text-white font-bold font-mono"
                        defaultText={`${skill.level}%`}
                      />
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: index * 0.08 }}
                        className="h-full rounded-full bg-gradient-to-r from-[#FF5A1F] to-orange-400 shadow-md shadow-[#FF5A1F]/50"
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
