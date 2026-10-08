import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useSocialStore } from '../../store/socialStore';
import { Upload, Sparkles, Check } from 'lucide-react';
import { useToast } from '../common/Toast';

interface StoryCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_STORIES = [
  {
    name: 'Neon Tokyo',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
    type: 'image' as const,
  },
  {
    name: 'Coffee & Sun',
    url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    type: 'image' as const,
  },
  {
    name: 'Alpine Mist',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    type: 'image' as const,
  },
  {
    name: 'Studio Pottery',
    url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
    type: 'image' as const,
  },
];

export const StoryCreatorModal: React.FC<StoryCreatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { actions } = useSocialStore();
  const { toast } = useToast();

  const [selectedUrl, setSelectedUrl] = useState(PRESET_STORIES[0].url);
  const [caption, setCaption] = useState('');
  const [customUrl, setCustomUrl] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSelectedUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = () => {
    if (!selectedUrl) return;

    actions.addStory({
      mediaUrl: selectedUrl,
      mediaType: 'image',
      caption: caption.trim() || undefined,
    });

    toast('Story Published!', 'Your story is live for 24 hours on TarleX', 'success');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add to Your Story" maxWidth="md">
      <div className="space-y-4">
        {/* Preview Frame */}
        <div className="relative w-full aspect-[9/16] max-h-80 bg-slate-950 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
          <img
            src={selectedUrl}
            alt="Story preview"
            className="w-full h-full object-cover"
          />
          {caption && (
            <div className="absolute bottom-4 left-4 right-4 p-2.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-semibold text-center border border-white/10">
              {caption}
            </div>
          )}
        </div>

        {/* Upload or Choose Preset */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2">
            Select Visual or Upload
          </label>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {PRESET_STORIES.map((preset, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedUrl(preset.url)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  selectedUrl === preset.url
                    ? 'border-indigo-500 scale-95 shadow-md'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                {selectedUrl === preset.url && (
                  <div className="absolute inset-0 bg-indigo-500/30 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <label className="flex items-center justify-center gap-2 py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer text-xs font-medium text-slate-300 hover:text-white transition-colors">
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Upload Photo / Media</span>
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {/* Optional caption */}
        <div>
          <input
            type="text"
            placeholder="Add story text or caption..."
            value={caption}
            onChange={e => setCaption(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handlePublish}
          className="w-full py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-rose-500 hover:opacity-95 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-500/25 active:scale-[0.99] transition-all"
        >
          Share to Story
        </button>
      </div>
    </Modal>
  );
};
