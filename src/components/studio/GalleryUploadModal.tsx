import React, { useState, useRef, useEffect } from 'react';
import {
  Film,
  Upload,
  X,
  FolderOpen,
  ExternalLink,
  ChevronDown,
  Loader2,
  Check,
  Sparkles,
  Globe,
  Image as ImageIcon,
  Play
} from 'lucide-react';
import { GalleryItem } from '../../types';
import { compressImageDataUrlTo200KB, uploadMediaAsset } from '../../lib/firebaseStore';

interface GalleryUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: GalleryItem | null;
  isAdding: boolean;
  onSave: (item: GalleryItem) => Promise<void>;
  accentColor?: string;
}

export default function GalleryUploadModal({
  isOpen,
  onClose,
  item,
  isAdding,
  onSave,
  accentColor = '#3b82f6'
}: GalleryUploadModalProps) {
  const [sourceType, setSourceType] = useState<'upload' | 'url'>('upload');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Cinematic Reels');
  const [description, setDescription] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'aspect-[3/4]' | 'aspect-[4/5]' | 'aspect-square' | 'aspect-[16/9]'>('aspect-[3/4]');
  const [likes, setLikes] = useState(500);
  const [previewUrl, setPreviewUrl] = useState('');
  const [webUrl, setWebUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (item) {
      setTitle(item.title || '');
      setCategory(item.category || 'Cinematic Reels');
      setDescription((item as any).description || '');
      setAspectRatio((item.aspectRatio as any) || 'aspect-[3/4]');
      setLikes(item.likes || 500);
      setPreviewUrl(item.image || '');
      setWebUrl(item.image && item.image.startsWith('http') ? item.image : '');
      if (item.image && item.image.startsWith('http') && !item.image.startsWith('data:')) {
        setSourceType('url');
      } else {
        setSourceType('upload');
      }
    } else {
      setTitle('');
      setCategory('Cinematic Reels');
      setDescription('');
      setAspectRatio('aspect-[3/4]');
      setLikes(500);
      setPreviewUrl('');
      setWebUrl('');
      setSourceType('upload');
    }
    setErrorMessage(null);
  }, [item, isOpen]);

  if (!isOpen) return null;

  // Process image or video file
  const handleProcessFile = async (file: File) => {
    setIsUploading(true);
    setErrorMessage(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const rawData = (e.target?.result as string) || '';
        if (file.type.startsWith('video/')) {
          setPreviewUrl(rawData);
          setIsUploading(false);
        } else {
          // Compress image to < 200KB for Firebase Firestore compatibility
          try {
            const compressed = await compressImageDataUrlTo200KB(rawData, 1200, 200);
            setPreviewUrl(compressed);
            // Background asset upload
            uploadMediaAsset(compressed, file.name, title || file.name.split('.')[0], category).catch(() => {});
          } catch {
            setPreviewUrl(rawData);
          } finally {
            setIsUploading(false);
          }
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error('File process error:', err);
      setErrorMessage('Could not process file. Please try a different asset.');
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalMedia = sourceType === 'url' ? webUrl.trim() : previewUrl;

    if (!finalMedia) {
      setErrorMessage('Please select a file or enter an asset URL.');
      return;
    }

    if (!title.trim()) {
      setErrorMessage('Please provide a title for the master asset.');
      return;
    }

    setIsUploading(true);
    try {
      const payload: GalleryItem = {
        id: item?.id || `gal-${Date.now()}`,
        title: title.trim(),
        category: category as any,
        image: finalMedia,
        aspectRatio: aspectRatio,
        date: '2026',
        likes: likes || 500,
        description: description.trim(),
      } as any;

      await onSave(payload);
      onClose();
    } catch (err) {
      console.error('Save error:', err);
      setErrorMessage('Failed to save gallery item. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const isVideo = previewUrl.startsWith('data:video') || previewUrl.endsWith('.mp4') || previewUrl.includes('drive.google.com') || previewUrl.includes('youtube') || previewUrl.includes('vimeo');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 sm:p-6 overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-[#090b12] border border-blue-500/20 rounded-3xl shadow-2xl shadow-blue-950/50 p-6 sm:p-8 space-y-6 my-auto max-h-[92vh] overflow-y-auto text-neutral-200"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#3b82f6 #0c0e18' }}
      >
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#121626] border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/10 shrink-0">
              <Film className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-syne text-lg sm:text-xl font-bold tracking-wider text-white uppercase">
                VIDEO MASTER UPLOAD
              </h3>
              <p className="text-xs font-space text-neutral-400 mt-0.5">
                Direct reel upload with live timeline cover extraction & Drive preview
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="Close popup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Concentric Glow Indicator (from reference image) */}
        <div className="flex items-center">
          <div className="w-5 h-5 rounded-full border-2 border-blue-500/60 bg-blue-500/20 flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.6)]">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-space flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. SOURCE FILE SECTION WITH PILL TOGGLE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                <label className="text-xs font-mono font-bold tracking-wider text-neutral-200 uppercase">
                  VIDEO SOURCE FILE <span className="text-blue-400">*</span>
                </label>
              </div>

              {/* Segmented Switcher (from reference image: From Gallery / Drive URL) */}
              <div className="flex items-center p-1 rounded-full bg-[#111422] border border-white/10 text-xs font-space font-semibold">
                <button
                  type="button"
                  onClick={() => setSourceType('upload')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                    sourceType === 'upload'
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 text-white shadow-md shadow-blue-500/30'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>From Gallery</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSourceType('url')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                    sourceType === 'url'
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 text-white shadow-md shadow-blue-500/30'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Drive URL</span>
                </button>
              </div>
            </div>

            {/* DROPZONE / FILE SELECTOR (matches dashed container from reference image) */}
            {sourceType === 'upload' ? (
              <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center cursor-pointer transition-all bg-[#070912]/70 hover:bg-[#0c0f1c] flex flex-col items-center justify-center group relative overflow-hidden ${
                  isDragging
                    ? 'border-blue-500 bg-blue-950/20'
                    : 'border-white/15 hover:border-blue-400/60'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {isUploading ? (
                  <div className="py-6 space-y-3 flex flex-col items-center">
                    <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
                    <p className="font-space font-bold text-xs text-white">
                      Processing & Compressing Master Asset...
                    </p>
                    <p className="text-[10px] font-mono text-neutral-400">
                      Optimizing frame rates and cloud payload
                    </p>
                  </div>
                ) : previewUrl ? (
                  <div className="space-y-4 w-full flex flex-col items-center">
                    <div className="relative group/preview rounded-2xl overflow-hidden border border-white/20 shadow-2xl max-h-56 max-w-sm bg-black">
                      {isVideo ? (
                        <video src={previewUrl} className="max-h-56 w-auto object-cover" controls autoPlay muted loop />
                      ) : (
                        <img
                          src={previewUrl}
                          alt="Master Preview"
                          className="max-h-56 w-auto object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';
                          }}
                        />
                      )}
                      <div className="absolute top-2 right-2 bg-emerald-500/90 text-black font-space font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                        ✓ Ready
                      </div>
                    </div>
                    <p className="text-xs font-space font-bold text-blue-400 group-hover:underline flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Click or drop another file to replace</span>
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-[#141828] border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/10 group-hover:scale-110 transition-transform">
                      <Film className="w-7 h-7" />
                    </div>
                    <h4 className="font-syne font-bold text-sm sm:text-base text-white mt-4 uppercase tracking-wider">
                      SELECT OR DROP MASTER REEL
                    </h4>
                    <p className="text-xs font-space text-neutral-400 max-w-md mt-1.5 leading-relaxed">
                      Upload 4K cinematic video from your device for instant frame extraction and smooth playback
                    </p>
                  </>
                )}
              </div>
            ) : (
              /* DRIVE / WEB URL INPUT */
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={webUrl}
                    onChange={(e) => {
                      setWebUrl(e.target.value);
                      setPreviewUrl(e.target.value);
                    }}
                    placeholder="Paste Google Drive link, Unsplash URL, or MP4/WebP CDN link..."
                    className="w-full bg-[#070912] border border-white/10 hover:border-white/20 focus:border-blue-500 rounded-2xl px-4 py-3.5 text-xs text-white placeholder-neutral-600 focus:outline-none transition-all font-space"
                  />
                  {webUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setWebUrl('');
                        setPreviewUrl('');
                      }}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {webUrl && (
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-center space-y-2">
                    <p className="text-[10px] font-space text-neutral-400 uppercase tracking-wider font-bold">
                      Live URL Preview
                    </p>
                    <img
                      src={webUrl}
                      alt="URL Preview"
                      className="max-h-36 mx-auto rounded-xl object-cover border border-white/10"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. TITLE FIELD */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
              <label className="text-xs font-mono font-bold tracking-wider text-neutral-200 uppercase">
                VIDEO TITLE <span className="text-blue-400">*</span>
              </label>
            </div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cinematic Highlights & Aftermovie"
              className="w-full bg-[#070912] border border-white/10 hover:border-white/20 focus:border-blue-500 rounded-2xl px-4 py-3.5 text-xs text-white placeholder-neutral-600 focus:outline-none transition-all font-space"
            />
          </div>

          {/* 3. CATEGORY FIELD */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
              <label className="text-xs font-mono font-bold tracking-wider text-neutral-200 uppercase">
                CATEGORY
              </label>
            </div>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full appearance-none bg-[#070912] border border-white/10 hover:border-white/20 focus:border-blue-500 rounded-2xl px-4 py-3.5 text-xs text-white focus:outline-none transition-all font-space cursor-pointer"
              >
                <option value="Cinematic Reels">Cinematic Reels</option>
                <option value="Photography">Photography</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Motion Graphics">Motion Graphics</option>
                <option value="Branding">Branding</option>
                <option value="3D Concepts">3D Concepts & Spatial Art</option>
              </select>
              <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 4. DESCRIPTION (OPTIONAL) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-neutral-600" />
              <label className="text-xs font-mono font-bold tracking-wider text-neutral-400 uppercase">
                DESCRIPTION (OPTIONAL)
              </label>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Master grade 4K export with dynamic color correction and 24fps film cadence..."
              className="w-full bg-[#070912] border border-white/10 hover:border-white/20 focus:border-blue-500 rounded-2xl p-4 text-xs text-white placeholder-neutral-600 focus:outline-none transition-all font-space resize-none"
            />
          </div>

          {/* 5. ASPECT RATIO PILLS */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono text-neutral-400 block uppercase tracking-wider">
              DISPLAY ASPECT RATIO
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'aspect-[3/4]', label: 'Vertical (3:4)' },
                { id: 'aspect-[4/5]', label: 'Portrait (4:5)' },
                { id: 'aspect-square', label: 'Square (1:1)' },
                { id: 'aspect-[16/9]', label: 'Cinematic (16:9)' },
              ].map((ratio) => (
                <button
                  key={ratio.id}
                  type="button"
                  onClick={() => setAspectRatio(ratio.id as any)}
                  className={`py-2 px-3 rounded-xl text-xs font-space font-medium border transition-all cursor-pointer text-center ${
                    aspectRatio === ratio.id
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold'
                      : 'bg-[#070912] border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          </div>

          {/* 6. MODAL ACTIONS FOOTER */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-space font-semibold text-neutral-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-7 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:brightness-110 active:scale-98 text-white font-space font-bold text-xs shadow-xl shadow-blue-500/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading Asset...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload & Publish Asset</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
