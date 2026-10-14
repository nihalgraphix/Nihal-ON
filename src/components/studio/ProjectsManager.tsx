import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { Project } from '../../types';
import { Plus, Edit2, Trash2, Copy, ExternalLink, Star, Search, Image as ImageIcon, Check } from 'lucide-react';
import { uploadMediaAsset } from '../../lib/firebaseStore';

export default function ProjectsManager() {
  const { draftData, addProject, updateProject, deleteProject } = useStudio();
  const [search, setSearch] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const projects = draftData.projects || [];
  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenCreate = () => {
    const newProject: Project = {
      id: `proj_${Date.now()}`,
      title: 'New Featured Project',
      subtitle: 'Modern Web Design & Engineering',
      category: 'Web Design',
      year: new Date().getFullYear().toString(),
      client: 'Client Studio',
      role: 'Lead Designer & Engineer',
      duration: '4 Weeks',
      featured: false,
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
      heroImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop',
      description: 'Comprehensive project description highlighting the core innovation, visual pacing, and business results.',
      challenge: 'The client required a bold, high-contrast digital identity with sub-second page loads and fluid motion.',
      solution: 'Crafted a bespoke React 19 interface leveraging custom GSAP scroll triggers and modern Tailwind layouts.',
      impactMetrics: [
        { label: 'Conversion Lift', value: '+140%' },
        { label: 'Avg Session Time', value: '3m 45s' },
      ],
      technologies: ['React 19', 'Tailwind CSS', 'Framer Motion', 'TypeScript'],
      liveUrl: 'https://example.com',
      githubUrl: 'https://github.com',
    };
    setEditingProject(newProject);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingProject) return;
    const exists = projects.some(p => p.id === editingProject.id);
    if (exists) {
      updateProject(editingProject.id, editingProject);
    } else {
      addProject(editingProject);
    }
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProject) return;
    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const asset = await uploadMediaAsset(dataUrl, file.name, editingProject.title, 'Projects');
        setEditingProject({
          ...editingProject,
          coverImage: asset.url,
          heroImage: asset.url,
        });
      } catch (err) {
        console.error('Image upload failed:', err);
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-1 bg-[#111214] overflow-y-auto p-6 sm:p-8 min-h-0">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2C2E34] pb-5">
          <div>
            <h1 className="text-xl font-bold text-[#F4F4F5] tracking-tight">
              Projects Manager
            </h1>
            <p className="text-xs text-[#71717A] mt-1">
              Curate, edit, and publish your case studies and client projects across the portfolio.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#17181B] border border-[#2C2E34] rounded-md pl-8 pr-3 py-1.5 text-xs text-[#F4F4F5] focus:outline-none focus:border-[#FF5A1F] w-48"
              />
            </div>
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 bg-[#FF5A1F] hover:bg-[#FF723F] text-white px-3.5 py-1.5 rounded-md text-xs font-semibold shadow-xs cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Project</span>
            </button>
          </div>
        </div>

        {/* Projects Grid / Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              className="bg-[#17181B] border border-[#2C2E34] hover:border-[#3E4048] rounded-xl overflow-hidden flex flex-col transition-all group"
            >
              <div className="relative h-44 bg-[#202126] overflow-hidden">
                <img
                  src={p.coverImage}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                  {p.featured && (
                    <span className="bg-[#FF5A1F] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      Featured
                    </span>
                  )}
                  <span className="bg-black/70 backdrop-blur-md text-[#E4E4E7] text-[10px] px-2 py-0.5 rounded-full font-mono border border-white/10">
                    {p.year}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-[#A1A1AA] font-mono mb-1">
                    <span>{p.category}</span>
                    <span>{p.client}</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#F4F4F5] group-hover:text-[#FF5A1F] transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-xs text-[#71717A] mt-1 line-clamp-2 leading-relaxed">
                    {p.subtitle || p.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#2C2E34] flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingProject(p);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 text-[#A1A1AA] hover:text-white hover:bg-[#202126] rounded transition-colors cursor-pointer"
                      title="Edit project"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        const copy: Project = {
                          ...p,
                          id: `proj_${Date.now()}`,
                          title: `${p.title} (Copy)`,
                        };
                        addProject(copy);
                      }}
                      className="p-1.5 text-[#A1A1AA] hover:text-white hover:bg-[#202126] rounded transition-colors cursor-pointer"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        deleteProject(p.id);
                      }}
                      className="p-1.5 text-[#A1A1AA] hover:text-[#EF4444] hover:bg-[#202126] rounded transition-colors cursor-pointer"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {p.liveUrl && (
                    <a
                      href={p.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-[#71717A] hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <span>Live</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit / Create Project Modal */}
      {isModalOpen && editingProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#17181B] border border-[#2C2E34] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2C2E34] flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#F4F4F5] font-mono">
                {projects.some(p => p.id === editingProject.id) ? 'Edit Project' : 'New Project'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#71717A] hover:text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-[#A1A1AA] mb-1 font-mono uppercase">Title</label>
                  <input
                    type="text"
                    value={editingProject.title}
                    onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                    className="w-full bg-[#111214] border border-[#2C2E34] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#A1A1AA] mb-1 font-mono uppercase">Subtitle</label>
                  <input
                    type="text"
                    value={editingProject.subtitle}
                    onChange={(e) => setEditingProject({ ...editingProject, subtitle: e.target.value })}
                    className="w-full bg-[#111214] border border-[#2C2E34] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] text-[#A1A1AA] mb-1 font-mono uppercase">Category</label>
                  <input
                    type="text"
                    value={editingProject.category}
                    onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                    className="w-full bg-[#111214] border border-[#2C2E34] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#A1A1AA] mb-1 font-mono uppercase">Year</label>
                  <input
                    type="text"
                    value={editingProject.year}
                    onChange={(e) => setEditingProject({ ...editingProject, year: e.target.value })}
                    className="w-full bg-[#111214] border border-[#2C2E34] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#A1A1AA] mb-1 font-mono uppercase">Client</label>
                  <input
                    type="text"
                    value={editingProject.client}
                    onChange={(e) => setEditingProject({ ...editingProject, client: e.target.value })}
                    className="w-full bg-[#111214] border border-[#2C2E34] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
              </div>

              {/* Cover Image Upload & URL */}
              <div>
                <label className="block text-[11px] text-[#A1A1AA] mb-1 font-mono uppercase">Cover Image</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={editingProject.coverImage}
                    onChange={(e) => setEditingProject({ ...editingProject, coverImage: e.target.value })}
                    className="flex-1 bg-[#111214] border border-[#2C2E34] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#FF5A1F]"
                    placeholder="Image URL or upload file"
                  />
                  <label className="bg-[#202126] hover:bg-[#25272D] border border-[#2C2E34] text-[#F4F4F5] px-3 py-2 rounded-md cursor-pointer flex items-center gap-1.5 font-medium shrink-0">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                    <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] text-[#A1A1AA] mb-1 font-mono uppercase">Overview / Description</label>
                <textarea
                  rows={3}
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  className="w-full bg-[#111214] border border-[#2C2E34] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>

              {/* Challenge & Solution */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-[#A1A1AA] mb-1 font-mono uppercase">Challenge</label>
                  <textarea
                    rows={2}
                    value={editingProject.challenge}
                    onChange={(e) => setEditingProject({ ...editingProject, challenge: e.target.value })}
                    className="w-full bg-[#111214] border border-[#2C2E34] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#A1A1AA] mb-1 font-mono uppercase">Solution</label>
                  <textarea
                    rows={2}
                    value={editingProject.solution}
                    onChange={(e) => setEditingProject({ ...editingProject, solution: e.target.value })}
                    className="w-full bg-[#111214] border border-[#2C2E34] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
              </div>

              {/* Links: Live and GitHub */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-[#A1A1AA] mb-1 font-mono uppercase">Live Website URL</label>
                  <input
                    type="text"
                    value={editingProject.liveUrl || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, liveUrl: e.target.value })}
                    placeholder="https://client-project.com"
                    className="w-full bg-[#111214] border border-[#2C2E34] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#A1A1AA] mb-1 font-mono uppercase">GitHub Repository URL</label>
                  <input
                    type="text"
                    value={editingProject.githubUrl || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full bg-[#111214] border border-[#2C2E34] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
              </div>

              {/* Technologies / Tags (comma separated) */}
              <div>
                <label className="block text-[11px] text-[#A1A1AA] mb-1 font-mono uppercase">Technologies & Tech Stack (comma separated)</label>
                <input
                  type="text"
                  value={editingProject.technologies ? editingProject.technologies.join(', ') : ''}
                  onChange={(e) => setEditingProject({ 
                    ...editingProject, 
                    technologies: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="React 19, Tailwind CSS, TypeScript, GSAP"
                  className="w-full bg-[#111214] border border-[#2C2E34] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>

              {/* Featured toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="feat-toggle"
                  checked={editingProject.featured}
                  onChange={(e) => setEditingProject({ ...editingProject, featured: e.target.checked })}
                  className="rounded border-[#2C2E34] text-[#FF5A1F] focus:ring-0"
                />
                <label htmlFor="feat-toggle" className="text-xs text-[#F4F4F5] cursor-pointer">
                  Feature this project on the homepage
                </label>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#2C2E34] flex items-center justify-end gap-3 bg-[#141518]">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-md text-xs text-[#A1A1AA] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-[#FF5A1F] hover:bg-[#FF723F] text-white px-5 py-2 rounded-md text-xs font-semibold cursor-pointer transition-all"
              >
                Save Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
