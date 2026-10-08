import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { User } from '../../types';
import { useSocialStore } from '../../store/socialStore';
import { Avatar } from '../common/Avatar';
import { Upload, Check } from 'lucide-react';
import { useToast } from '../common/Toast';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const { actions } = useSocialStore();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState(user.displayName);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio || '');
  const [website, setWebsite] = useState(user.website || '');
  const [avatar, setAvatar] = useState(user.avatar);
  const [isPrivate, setIsPrivate] = useState(!!user.isPrivate);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    actions.updateProfile({
      displayName: displayName.trim(),
      username: username.trim().toLowerCase().replace(/\s+/g, '_'),
      bio: bio.trim(),
      website: website.trim(),
      avatar,
      isPrivate,
    });

    toast('Profile Updated', 'Your profile details have been saved', 'success');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" maxWidth="md">
      <form onSubmit={handleSave} className="space-y-4">
        {/* Avatar change */}
        <div className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5">
          <Avatar src={avatar} size="lg" />
          <div className="flex-1">
            <p className="text-xs font-bold text-white mb-1">Change Profile Photo</p>
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 text-xs font-semibold rounded-xl cursor-pointer transition-colors border border-indigo-500/30">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload New Picture</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFile}
              />
            </label>
          </div>
        </div>

        {/* Display Name */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            required
          />
        </div>

        {/* Username */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            required
          />
        </div>

        {/* Bio */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Bio
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={e => setBio(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
            placeholder="Tell your story, aesthetic interests, or location..."
          />
        </div>

        {/* Website */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Website Link
          </label>
          <input
            type="text"
            value={website}
            onChange={e => setWebsite(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            placeholder="https://yourdomain.com"
          />
        </div>

        {/* Private Account toggle */}
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
          <div>
            <p className="text-xs font-bold text-white">Private Account</p>
            <p className="text-[11px] text-slate-400">
              When private, only people you approve can see your posts and stories.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsPrivate(!isPrivate)}
            className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${
              isPrivate ? 'bg-indigo-600' : 'bg-slate-700'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                isPrivate ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Submit */}
        <div className="pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-md shadow-indigo-600/30"
          >
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
};
