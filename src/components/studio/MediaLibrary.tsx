import React, { useState, useEffect } from 'react';
import { MediaAsset } from '../../types/studio';
import { uploadMediaAsset } from '../../lib/firebaseStore';
import { Upload, Copy, Check, Trash2, Search, ExternalLink, HardDrive } from 'lucide-react';

export default function MediaLibrary() {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchMedia = () => {
    fetch('/api/studio/media')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.media) {
          setMedia(data.media);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchMedia();
  }, []);

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
            await uploadMediaAsset(dataUrl, file.name, file.name.split('.')[0], 'Media');
          } catch (err) {
            console.error('Upload error:', err);
          }
          resolve();
        };
        reader.onerror = () => resolve();
        reader.readAsDataURL(file);
      });
    }

    if (targetInput) targetInput.value = '';
    setUploading(false);
    fetchMedia();
  };

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteItem = async (id: string) => {
    try {
      await fetch(`/api/studio/media/${id}`, { method: 'DELETE' });
      setMedia(m => m.filter(item => item.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filtered = media.filter(m => m.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-1 bg-[#111214] overflow-y-auto p-6 sm:p-8 min-h-0">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2C2E34] pb-5">
          <div>
            <h1 className="text-xl font-bold text-[#F4F4F5] tracking-tight">
              Central Media Library
            </h1>
            <p className="text-xs text-[#71717A] mt-1">
              Store, search, and reuse images across projects, blog posts, and website sections.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
              <input
                type="text"
                placeholder="Search assets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#17181B] border border-[#2C2E34] rounded-md pl-8 pr-3 py-1.5 text-xs text-[#F4F4F5] focus:outline-none focus:border-[#FF5A1F] w-48"
              />
            </div>
            <label className="flex items-center gap-2 bg-[#FF5A1F] hover:bg-[#FF723F] text-white px-3.5 py-1.5 rounded-md text-xs font-semibold shadow-xs cursor-pointer transition-all">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploading ? 'Uploading...' : 'Upload Asset'}</span>
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

        {filtered.length === 0 ? (
          <div className="p-12 border border-[#2C2E34] rounded-xl bg-[#17181B] text-center text-[#71717A]">
            <HardDrive className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#A1A1AA]" />
            <p className="text-xs font-medium text-[#F4F4F5]">Media library empty</p>
            <p className="text-[11px] mt-1">Upload images or photos to reuse them anywhere in your studio.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filtered.map(item => (
              <div
                key={item.id}
                className="bg-[#17181B] border border-[#2C2E34] hover:border-[#3E4048] rounded-lg overflow-hidden flex flex-col group transition-all"
              >
                <div className="relative aspect-video bg-[#111214] overflow-hidden">
                  <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => copyUrl(item.id, item.url)}
                      className="p-1 bg-black/70 hover:bg-black text-white rounded text-[10px]"
                      title="Copy URL"
                    >
                      {copiedId === item.id ? <Check className="w-3 h-3 text-[#22C55E]" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-1 bg-black/70 hover:bg-[#EF4444] text-white rounded text-[10px]"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="p-2.5">
                  <p className="text-xs font-medium text-[#F4F4F5] truncate">{item.title}</p>
                  <div className="flex items-center justify-between text-[10px] text-[#71717A] mt-1 font-mono">
                    <span>{item.category}</span>
                    <span>{item.size}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
