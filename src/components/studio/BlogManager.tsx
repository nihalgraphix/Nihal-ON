import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { BlogPost } from '../../types';
import { Plus, Edit2, Trash2, Search, Image as ImageIcon, Calendar, Clock, Tag } from 'lucide-react';
import { uploadMediaAsset } from '../../lib/firebaseStore';

export default function BlogManager() {
  const { draftData, addBlogPost, updateBlogPost, deleteBlogPost } = useStudio();
  const [search, setSearch] = useState('');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const posts = draftData.blogPosts || [];
  const filteredPosts = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenCreate = () => {
    const newPost: BlogPost = {
      id: `post_${Date.now()}`,
      title: 'Crafting High-Conversion Digital Experiences in 2026',
      excerpt: 'How minimal typography, fluid motion systems, and sub-second page performance transform visitor perception.',
      content: `The modern web is shifting towards hyper-refined, editorial aesthetics.
      
Key principles:
1. Spatial pacing: Giving elements sufficient breathing room.
2. Fluid spring curves: Interactive motion that respects physical momentum.
3. Server-side performance: Eliminating client runtime overhead.`,
      category: 'UI/UX',
      readTime: '5 min read',
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      author: draftData.siteSettings.authorName,
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
      tags: ['Design', 'Engineering', 'Aesthetics'],
    };
    setEditingPost(newPost);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingPost) return;
    const exists = posts.some(p => p.id === editingPost.id);
    if (exists) {
      updateBlogPost(editingPost.id, editingPost);
    } else {
      addBlogPost(editingPost);
    }
    setIsModalOpen(false);
    setEditingPost(null);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingPost) return;
    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const asset = await uploadMediaAsset(dataUrl, file.name, editingPost.title, 'Blog');
        setEditingPost({
          ...editingPost,
          image: asset.url,
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2C2E34] pb-5">
          <div>
            <h1 className="text-xl font-bold text-[#F4F4F5] tracking-tight">
              Blog & Article Manager
            </h1>
            <p className="text-xs text-[#71717A] mt-1">
              Write, edit, and publish engineering insights and design essays for your readership.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
              <input
                type="text"
                placeholder="Search articles..."
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
              <span>Write Article</span>
            </button>
          </div>
        </div>

        {/* Blog Posts List */}
        <div className="space-y-3">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-[#17181B] border border-[#2C2E34] hover:border-[#3E4048] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
            >
              <div className="flex items-start sm:items-center gap-4">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg bg-[#202126] shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-[#A1A1AA] font-mono mb-1">
                    <span className="text-[#FF5A1F] font-semibold">{post.category}</span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#71717A]" />
                      {post.readTime}
                    </span>
                    <span>&bull;</span>
                    <span>{post.date}</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#F4F4F5] hover:text-[#FF5A1F] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-xs text-[#71717A] line-clamp-1 mt-0.5">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => {
                    setEditingPost(post);
                    setIsModalOpen(true);
                  }}
                  className="p-1.5 text-[#A1A1AA] hover:text-white hover:bg-[#202126] rounded transition-colors cursor-pointer"
                  title="Edit post"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    deleteBlogPost(post.id);
                  }}
                  className="p-1.5 text-[#A1A1AA] hover:text-[#EF4444] hover:bg-[#202126] rounded transition-colors cursor-pointer"
                  title="Delete post"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor Modal */}
      {isModalOpen && editingPost && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#17181B] border border-[#2C2E34] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2C2E34] flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#F4F4F5] font-mono">
                {posts.some(p => p.id === editingPost.id) ? 'Edit Article' : 'New Article'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#71717A] hover:text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block text-[11px] text-[#A1A1AA] mb-1 font-mono uppercase">Article Title</label>
                <input
                  type="text"
                  value={editingPost.title}
                  onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                  className="w-full bg-[#111214] border border-[#2C2E34] rounded-md px-3 py-2 text-white font-medium focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] text-[#A1A1AA] mb-1 font-mono uppercase">Category</label>
                  <input
                    type="text"
                    value={editingPost.category}
                    onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                    className="w-full bg-[#111214] border border-[#2C2E34] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#A1A1AA] mb-1 font-mono uppercase">Read Time</label>
                  <input
                    type="text"
                    value={editingPost.readTime}
                    onChange={(e) => setEditingPost({ ...editingPost, readTime: e.target.value })}
                    className="w-full bg-[#111214] border border-[#2C2E34] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#A1A1AA] mb-1 font-mono uppercase">Author</label>
                  <input
                    type="text"
                    value={editingPost.author}
                    onChange={(e) => setEditingPost({ ...editingPost, author: e.target.value })}
                    className="w-full bg-[#111214] border border-[#2C2E34] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
              </div>

              {/* Cover Image Upload */}
              <div>
                <label className="block text-[11px] text-[#A1A1AA] mb-1 font-mono uppercase">Cover Image</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={editingPost.image}
                    onChange={(e) => setEditingPost({ ...editingPost, image: e.target.value })}
                    className="flex-1 bg-[#111214] border border-[#2C2E34] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#FF5A1F]"
                    placeholder="URL or upload file"
                  />
                  <label className="bg-[#202126] hover:bg-[#25272D] border border-[#2C2E34] text-[#F4F4F5] px-3 py-2 rounded-md cursor-pointer flex items-center gap-1.5 font-medium shrink-0">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                    <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-[11px] text-[#A1A1AA] mb-1 font-mono uppercase">Excerpt / Summary</label>
                <textarea
                  rows={2}
                  value={editingPost.excerpt}
                  onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                  className="w-full bg-[#111214] border border-[#2C2E34] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-[11px] text-[#A1A1AA] mb-1 font-mono uppercase">Tags / Topics (comma separated)</label>
                <input
                  type="text"
                  value={editingPost.tags ? editingPost.tags.join(', ') : ''}
                  onChange={(e) => setEditingPost({
                    ...editingPost,
                    tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="Design Systems, AI Agents, Motion"
                  className="w-full bg-[#111214] border border-[#2C2E34] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>

              {/* Content body */}
              <div>
                <label className="block text-[11px] text-[#A1A1AA] mb-1 font-mono uppercase">Full Article Content (Markdown / Text)</label>
                <textarea
                  rows={8}
                  value={editingPost.content}
                  onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  className="w-full bg-[#111214] border border-[#2C2E34] rounded-md p-3 text-white font-mono leading-relaxed focus:outline-none focus:border-[#FF5A1F]"
                />
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
                Save Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
