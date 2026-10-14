import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { GalleryItem } from '../../types';
import { 
  Plus, 
  Upload, 
  Trash2, 
  Edit2, 
  Search, 
  Filter, 
  Image as ImageIcon, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  X,
  Tag,
  CheckSquare,
  Square,
  Layers
} from 'lucide-react';
import { uploadMediaAsset } from '../../lib/firebaseStore';

export default function GalleryManager() {
  const { 
    draftData, 
    addGalleryItem, 
    updateGalleryItem, 
    deleteGalleryItem, 
    reorderGalleryItem,
    addGalleryCategory,
    deleteGalleryCategory
  } = useStudio();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // New category creation
  const [newCatInput, setNewCatInput] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState(false);

  const galleryItems = draftData.galleryItems || [];
  const defaultCategories = ['All', 'Photography', 'Branding', 'UI', 'Motion', 'Concepts'];
  const categories = draftData.galleryCategories && draftData.galleryCategories.length > 0 
    ? ['All', ...draftData.galleryCategories]
    : defaultCategories;

  const filteredItems = galleryItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleFileUpload = async (files: FileList | null, targetInput?: HTMLInputElement | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      await new Promise<void>((resolve) => {
        reader.onload = async () => {
          const dataUrl = reader.result as string;
          try {
            const asset = await uploadMediaAsset(dataUrl, file.name, file.name.split('.')[0], 'Gallery');
            const newItem: GalleryItem = {
              id: `gal_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 5)}`,
              title: file.name.split('.')[0] || 'Gallery Asset',
              category: (selectedCategory !== 'All' ? selectedCategory : 'Photography') as any,
              image: asset.url,
              aspectRatio: 'aspect-square',
              date: new Date().getFullYear().toString(),
              likes: 0,
            };
            addGalleryItem(newItem);
            setSelectedPhoto(newItem);
          } catch (err) {
            console.error('Failed to upload gallery image:', err);
          }
          resolve();
        };
        reader.onerror = () => resolve();
        reader.readAsDataURL(file);
      });
    }

    if (targetInput) targetInput.value = '';
    setUploading(false);
  };

  const handleReplacePhotoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetInput = e.target;
    if (!file || !selectedPhoto) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const asset = await uploadMediaAsset(dataUrl, file.name, selectedPhoto.title, 'Gallery');
        const updated = { ...selectedPhoto, image: asset.url };
        setSelectedPhoto(updated);
        updateGalleryItem(selectedPhoto.id, { image: asset.url });
      } catch (err) {
        console.error('Photo replacement error:', err);
      } finally {
        if (targetInput) targetInput.value = '';
        setUploading(false);
      }
    };
    reader.onerror = () => {
      if (targetInput) targetInput.value = '';
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatInput.trim()) {
      addGalleryCategory(newCatInput.trim());
      setNewCatInput('');
      setIsAddingCategory(false);
    }
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < galleryItems.length) {
      reorderGalleryItem(index, targetIndex);
    }
  };

  const toggleSelectId = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    for (const id of selectedIds) {
      deleteGalleryItem(id);
    }
    setSelectedIds([]);
    setBulkMode(false);
    if (selectedPhoto && selectedIds.includes(selectedPhoto.id)) {
      setSelectedPhoto(null);
    }
  };

  return (
    <div className="flex-1 bg-[#111214] flex overflow-hidden min-h-0">
      {/* Main Grid View */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 min-h-0">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2C2E34] pb-5">
            <div>
              <h1 className="text-xl font-bold text-[#F4F4F5] tracking-tight">
                Gallery Photo Studio & Asset Manager
              </h1>
              <p className="text-xs text-[#71717A] mt-1">
                {galleryItems.length} Photographs &bull; Organize, arrange order, replace photos, and manage categories.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setBulkMode(!bulkMode)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors cursor-pointer border ${
                  bulkMode
                    ? 'bg-[#25272D] text-white border-[#FF5A1F]'
                    : 'bg-[#17181B] text-[#A1A1AA] border-[#2C2E34] hover:text-white'
                }`}
              >
                {bulkMode ? 'Cancel Selection' : 'Bulk Select'}
              </button>

              {bulkMode && selectedIds.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1.5 bg-[#EF4444] hover:bg-[#DC2626] text-white px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete ({selectedIds.length})</span>
                </button>
              )}

              <label className="flex items-center gap-2 bg-[#FF5A1F] hover:bg-[#FF723F] text-white px-3.5 py-1.5 rounded-md text-xs font-semibold shadow-xs cursor-pointer transition-all">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading ? 'Uploading...' : 'Upload Photos'}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files, e.target)}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Categories Bar & Management */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {categories.map(cat => (
                <div key={cat} className="flex items-center group">
                  <button
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#24262B] text-white font-medium border border-[#3E4048]'
                        : 'text-[#71717A] hover:text-[#A1A1AA] hover:bg-[#17181B]'
                    }`}
                  >
                    {cat}
                  </button>
                  {cat !== 'All' && !['Photography', 'Branding', 'UI', 'Motion', 'Concepts'].includes(cat) && (
                    <button
                      onClick={() => deleteGalleryCategory(cat)}
                      className="text-[#71717A] hover:text-[#EF4444] text-[10px] ml-1 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete category"
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}

              {/* Add category button / form */}
              {isAddingCategory ? (
                <form onSubmit={handleAddCategorySubmit} className="flex items-center gap-1">
                  <input
                    type="text"
                    autoFocus
                    placeholder="New category..."
                    value={newCatInput}
                    onChange={(e) => setNewCatInput(e.target.value)}
                    className="bg-[#17181B] border border-[#FF5A1F] rounded px-2 py-0.5 text-xs text-white font-mono focus:outline-none w-28"
                  />
                  <button type="submit" className="text-[#22C55E] text-xs font-bold px-1">&check;</button>
                  <button type="button" onClick={() => setIsAddingCategory(false)} className="text-[#71717A] text-xs px-1">&times;</button>
                </form>
              ) : (
                <button
                  onClick={() => setIsAddingCategory(true)}
                  className="px-2.5 py-1 rounded-md text-xs font-mono text-[#FF5A1F] hover:bg-[#17181B] border border-dashed border-[#FF5A1F]/30 hover:border-[#FF5A1F] cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Category</span>
                </button>
              )}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
              <input
                type="text"
                placeholder="Search photos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#17181B] border border-[#2C2E34] rounded-md pl-8 pr-3 py-1 text-xs text-[#F4F4F5] focus:outline-none focus:border-[#FF5A1F] w-48"
              />
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFileUpload(e.dataTransfer.files);
            }}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
              dragOver
                ? 'border-[#FF5A1F] bg-[#FF5A1F]/5'
                : 'border-[#2C2E34] hover:border-[#3E4048] bg-[#17181B]/40'
            }`}
          >
            <ImageIcon className="w-6 h-6 mx-auto mb-2 text-[#71717A]" />
            <p className="text-xs font-medium text-[#F4F4F5]">
              Drag & drop photos here to add to gallery archive
            </p>
            <p className="text-[10px] text-[#71717A] mt-0.5">
              Supports JPG, PNG, WEBP, GIF. Photos automatically optimize for 60fps gallery grid.
            </p>
          </div>

          {/* Photo Grid with Arrangement Controls */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {filteredItems.map((item, index) => {
              const isSelected = selectedPhoto?.id === item.id;
              const isChecked = selectedIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (bulkMode) {
                      toggleSelectId(item.id);
                    } else {
                      setSelectedPhoto(item);
                    }
                  }}
                  className={`group relative rounded-xl overflow-hidden border cursor-pointer transition-all aspect-square bg-[#202126] flex flex-col justify-between ${
                    isSelected && !bulkMode
                      ? 'border-[#FF5A1F] ring-2 ring-[#FF5A1F]/40 shadow-lg'
                      : isChecked
                      ? 'border-[#3B82F6] ring-2 ring-[#3B82F6]/40'
                      : 'border-[#2C2E34] hover:border-[#4B4E58]'
                  }`}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Bulk Select Checkbox overlay */}
                  {bulkMode && (
                    <div className="absolute top-2 left-2 z-10">
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5 text-[#3B82F6] bg-black/60 rounded" />
                      ) : (
                        <Square className="w-5 h-5 text-white/70 bg-black/40 rounded" />
                      )}
                    </div>
                  )}

                  {/* Top Order Badge & Rearrange Controls */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMove(index, 'left');
                      }}
                      disabled={index === 0}
                      className="p-1 rounded bg-black/75 hover:bg-black text-white disabled:opacity-30 cursor-pointer"
                      title="Move backward"
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMove(index, 'right');
                      }}
                      disabled={index === filteredItems.length - 1}
                      className="p-1 rounded bg-black/75 hover:bg-black text-white disabled:opacity-30 cursor-pointer"
                      title="Move forward"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Bottom title pill */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2.5 pt-6 flex flex-col justify-end">
                    <p className="text-[11px] font-semibold text-white truncate">{item.title}</p>
                    <div className="flex items-center justify-between text-[9px] text-[#A1A1AA] font-mono mt-0.5">
                      <span>{item.category}</span>
                      <span>#{index + 1}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Details & Edit Panel for Selected Photo */}
      {selectedPhoto && !bulkMode && (
        <aside className="w-84 bg-[#17181B] border-l border-[#2C2E34] flex flex-col p-5 select-none h-full shrink-0 overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-[#2C2E34]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4F4F5] font-mono">
              PHOTO EDITOR & DETAILS
            </h3>
            <button
              onClick={() => setSelectedPhoto(null)}
              className="text-[#71717A] hover:text-white p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-4 space-y-4 text-xs">
            {/* Preview image */}
            <div className="rounded-xl overflow-hidden border border-[#2C2E34] bg-[#111214] aspect-square flex items-center justify-center relative group">
              <img src={selectedPhoto.image} alt={selectedPhoto.title} className="w-full h-full object-cover" />
            </div>

            {/* Replace Photo Button */}
            <div>
              <label className="block text-[10px] text-[#A1A1AA] uppercase font-mono mb-1">Replace Image File</label>
              <label className="w-full flex items-center justify-center gap-2 bg-[#24262B] hover:bg-[#2F323A] border border-[#2C2E34] text-white py-2 rounded-md font-medium text-xs transition-colors cursor-pointer shadow-xs">
                <Upload className="w-3.5 h-3.5 text-[#FF5A1F]" />
                <span>{uploading ? 'Uploading new photo...' : 'Upload Replacement Photo'}</span>
                <input type="file" accept="image/*" onChange={handleReplacePhotoFile} className="hidden" />
              </label>
            </div>

            {/* Direct Image URL input */}
            <div>
              <label className="block text-[10px] text-[#A1A1AA] uppercase font-mono mb-1">Image URL</label>
              <input
                type="text"
                value={selectedPhoto.image}
                onChange={(e) => {
                  const updated = { ...selectedPhoto, image: e.target.value };
                  setSelectedPhoto(updated);
                  updateGalleryItem(selectedPhoto.id, { image: e.target.value });
                }}
                className="w-full bg-[#111214] border border-[#2C2E34] rounded px-2.5 py-1 text-white font-mono text-xs focus:outline-none focus:border-[#FF5A1F]"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-[10px] text-[#A1A1AA] uppercase font-mono mb-1">Title</label>
              <input
                type="text"
                value={selectedPhoto.title}
                onChange={(e) => {
                  const updated = { ...selectedPhoto, title: e.target.value };
                  setSelectedPhoto(updated);
                  updateGalleryItem(selectedPhoto.id, { title: e.target.value });
                }}
                className="w-full bg-[#111214] border border-[#2C2E34] rounded px-2.5 py-1 text-white focus:outline-none focus:border-[#FF5A1F]"
              />
            </div>

            {/* Category dropdown */}
            <div>
              <label className="block text-[10px] text-[#A1A1AA] uppercase font-mono mb-1">Category</label>
              <select
                value={selectedPhoto.category}
                onChange={(e) => {
                  const val = e.target.value as any;
                  const updated = { ...selectedPhoto, category: val };
                  setSelectedPhoto(updated);
                  updateGalleryItem(selectedPhoto.id, { category: val });
                }}
                className="w-full bg-[#111214] border border-[#2C2E34] rounded px-2.5 py-1 text-white focus:outline-none focus:border-[#FF5A1F]"
              >
                {categories.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="block text-[10px] text-[#A1A1AA] uppercase font-mono mb-1">Aspect Ratio</label>
              <select
                value={selectedPhoto.aspectRatio}
                onChange={(e) => {
                  const val = e.target.value as GalleryItem['aspectRatio'];
                  const updated = { ...selectedPhoto, aspectRatio: val };
                  setSelectedPhoto(updated);
                  updateGalleryItem(selectedPhoto.id, { aspectRatio: val });
                }}
                className="w-full bg-[#111214] border border-[#2C2E34] rounded px-2.5 py-1 text-white focus:outline-none focus:border-[#FF5A1F]"
              >
                <option value="aspect-square">Square (1:1)</option>
                <option value="aspect-[4/5]">Portrait (4:5)</option>
                <option value="aspect-[3/4]">Portrait (3:4)</option>
                <option value="aspect-[16/9]">Landscape (16:9)</option>
              </select>
            </div>

            {/* Delete button */}
            <div className="pt-4 border-t border-[#2C2E34]">
              <button
                onClick={() => {
                  deleteGalleryItem(selectedPhoto.id);
                  setSelectedPhoto(null);
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30 py-2 rounded-md font-medium transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Photo</span>
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
