import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useSocialStore } from '../../store/socialStore';
import {
  Upload, Image, Video, Sparkles, MapPin, Tag, Globe,
  Lock, Users, Trash2, Check, RefreshCw, Bookmark
} from 'lucide-react';
import { useToast } from '../common/Toast';
import { generateAiCaption } from '../../services/geminiService';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_MEDIA_PRESETS = [
  {
    name: 'Cyberpunk Tokyo',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    type: 'image' as const,
  },
  {
    name: 'Nordic Interior',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    type: 'image' as const,
  },
  {
    name: 'Studio Ceramics',
    url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80',
    type: 'image' as const,
  },
  {
    name: 'Alpine Peak',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    type: 'image' as const,
  },
  {
    name: 'Golden Skyline',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    type: 'image' as const,
  },
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { actions } = useSocialStore();
  const { toast } = useToast();

  const [mediaList, setMediaList] = useState<{
    url: string;
    type: 'image' | 'video';
    aspectRatio: '1:1' | '4:5' | '16:9';
  }[]>([
    {
      url: SAMPLE_MEDIA_PRESETS[0].url,
      type: 'image',
      aspectRatio: '4:5',
    },
  ]);
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:5' | '16:9'>('4:5');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [taggedPeople, setTaggedPeople] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'private'>('public');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiHelper, setShowAiHelper] = useState(false);

  // File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const isVideo = file.type.startsWith('video');
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setMediaList(prev => [
            ...prev,
            {
              url: reader.result as string,
              type: isVideo ? 'video' : 'image',
              aspectRatio,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveMedia = (index: number) => {
    setMediaList(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddPreset = (url: string, type: 'image' | 'video') => {
    setMediaList(prev => [...prev, { url, type, aspectRatio }]);
  };

  // Draft Support
  const handleSaveDraft = () => {
    const draft = { mediaList, caption, location, visibility };
    localStorage.setItem('tarlex_post_draft', JSON.stringify(draft));
    toast('Draft Saved', 'You can resume this post anytime', 'info');
  };

  const handleRestoreDraft = () => {
    try {
      const saved = localStorage.getItem('tarlex_post_draft');
      if (saved) {
        const d = JSON.parse(saved);
        if (d.mediaList) setMediaList(d.mediaList);
        if (d.caption) setCaption(d.caption);
        if (d.location) setLocation(d.location);
        if (d.visibility) setVisibility(d.visibility);
        toast('Draft Restored', 'Loaded your previously saved draft', 'success');
      }
    } catch (e) {
      console.warn(e);
    }
  };

  // AI Caption Generator
  const handleGenerateCaption = async () => {
    setIsGeneratingAi(true);
    try {
      const result = await generateAiCaption({
        prompt: aiPrompt || caption || 'Aesthetic modern moment capturing creative craft and light',
        tone: 'aesthetic',
      });
      setCaption(result.caption + '\n\n' + result.hashtags.join(' '));
      setShowAiHelper(false);
      toast('AI Generated!', 'Refined caption and hashtags added', 'success');
    } catch (e) {
      toast('Generation failed', 'Could not generate caption', 'error');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handlePublish = () => {
    if (mediaList.length === 0) {
      toast('Media Required', 'Please add at least one image or video', 'error');
      return;
    }

    const tags = taggedPeople
      .split(',')
      .map(t => t.trim().replace('@', ''))
      .filter(t => t.length > 0);

    actions.createPost({
      caption,
      mediaUrls: mediaList.map(m => ({
        url: m.url,
        type: m.type,
        aspectRatio,
      })),
      location: location.trim() || undefined,
      visibility,
      taggedUsers: tags,
    });

    localStorage.removeItem('tarlex_post_draft');
    toast('Post Published! 🚀', 'Your post is now live on the TarleX feed', 'success');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Post" maxWidth="2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: Media Preview & Selectors */}
        <div className="space-y-4">
          <div
            className={`relative w-full bg-[#0b0e14] rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center transition-all ${
              aspectRatio === '1:1'
                ? 'aspect-square'
                : aspectRatio === '16:9'
                ? 'aspect-video'
                : 'aspect-[4/5]'
            }`}
          >
            {mediaList.length > 0 ? (
              mediaList[0].type === 'video' ? (
                <video
                  src={mediaList[0].url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={mediaList[0].url}
                  alt="Post preview"
                  className="w-full h-full object-cover"
                />
              )
            ) : (
              <div className="p-6 text-center text-slate-500">
                <Upload className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No media selected</p>
              </div>
            )}

            {mediaList.length > 1 && (
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold">
                +{mediaList.length - 1} more
              </div>
            )}
          </div>

          {/* Aspect Ratio Fit Switcher */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 bg-white/5 p-1 rounded-xl">
            <span className="px-2 text-slate-400">Aspect Fit:</span>
            <div className="flex items-center gap-1">
              {(['4:5', '1:1', '16:9'] as const).map(ratio => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    aspectRatio === ratio
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Thumbnails rail if multiple */}
          {mediaList.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {mediaList.map((m, idx) => (
                <div
                  key={idx}
                  className="relative w-14 h-14 rounded-xl overflow-hidden border border-white/20 shrink-0 group"
                >
                  <img src={m.url} alt="thumb" className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleRemoveMedia(idx)}
                    className="absolute top-1 right-1 p-0.5 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload or Preset buttons */}
          <div className="space-y-2">
            <label className="flex items-center justify-center gap-2 py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer text-xs font-semibold text-slate-200 transition-colors">
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>Upload Images or Videos</span>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>

            {/* Quick Presets */}
            <p className="text-[11px] font-semibold text-slate-400 pt-1">
              Quick Aesthetic Presets:
            </p>
            <div className="grid grid-cols-5 gap-1.5">
              {SAMPLE_MEDIA_PRESETS.map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleAddPreset(preset.url, preset.type)}
                  className="relative aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-indigo-400 transition-all opacity-80 hover:opacity-100"
                  title={preset.name}
                >
                  <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Details, AI helper, Metadata */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Caption & AI Button */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Write Caption
                </label>
                <button
                  type="button"
                  onClick={() => setShowAiHelper(!showAiHelper)}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gemini AI Assist</span>
                </button>
              </div>

              {/* AI Helper Drawer */}
              {showAiHelper && (
                <div className="mb-2 p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl space-y-2 animate-in fade-in">
                  <p className="text-[11px] text-indigo-200">
                    What is this post about? Gemini will generate a polished caption and high-reach hashtags:
                  </p>
                  <input
                    type="text"
                    placeholder="e.g. Minimalist Tokyo architecture shot at sunrise..."
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    className="w-full px-3 py-1.5 bg-black/40 border border-indigo-500/30 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateCaption}
                    disabled={isGeneratingAi}
                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isGeneratingAi ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating with Gemini...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" /> Generate Caption & Hashtags
                      </>
                    )}
                  </button>
                </div>
              )}

              <textarea
                rows={4}
                placeholder="Share the story behind this moment... #TarleX"
                value={caption}
                onChange={e => setCaption(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
              />
            </div>

            {/* Location */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Location
              </label>
              <input
                type="text"
                placeholder="e.g. Kyoto, Japan or Copenhagen"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Tag people */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" /> Tag People
              </label>
              <input
                type="text"
                placeholder="e.g. @elena_v, @kaichen"
                value={taggedPeople}
                onChange={e => setTaggedPeople(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Privacy selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Who can view this post?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'public', label: 'Public', icon: Globe },
                  { id: 'followers', label: 'Followers', icon: Users },
                  { id: 'private', label: 'Only Me', icon: Lock },
                ].map(opt => {
                  const Icon = opt.icon;
                  const isSel = visibility === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setVisibility(opt.id as any)}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-semibold border transition-all ${
                        isSel
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="space-y-2 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <Bookmark className="w-3.5 h-3.5" /> Save Draft
              </button>
              <button
                type="button"
                onClick={handleRestoreDraft}
                className="hover:text-indigo-400 transition-colors"
              >
                Restore Draft
              </button>
            </div>

            <button
              type="button"
              onClick={handlePublish}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-rose-500 hover:opacity-95 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-500/25 active:scale-[0.99] transition-all"
            >
              Share Post to TarleX
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
