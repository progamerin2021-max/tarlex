import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Post } from '../../types';
import { useSocialStore } from '../../store/socialStore';
import { Avatar } from '../common/Avatar';
import { Search, Send, Check, Copy } from 'lucide-react';
import { useToast } from '../common/Toast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  post,
}) => {
  const { users, currentUser, actions } = useSocialStore();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [sentUserIds, setSentUserIds] = useState<string[]>([]);

  const filteredUsers = users.filter(
    u =>
      u.id !== currentUser?.id &&
      (u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.displayName.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSendToUser = (targetUserId: string) => {
    const conv = actions.getOrCreateConversation(targetUserId);
    const mediaPreview = post.media[0]?.url;
    actions.sendMessage(
      conv.id,
      `Shared post from TarleX: "${post.caption.slice(0, 80)}..."`,
      mediaPreview
    );
    actions.sharePost(post.id);
    setSentUserIds(prev => [...prev, targetUserId]);
    toast('Sent!', 'Post shared in direct message', 'success');
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(window.location.origin + `/post/${post.id}`);
    actions.sharePost(post.id);
    toast('Link Copied!', 'Post URL copied to clipboard', 'success');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Post" maxWidth="sm">
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search creators..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Users list */}
        <div className="max-h-56 overflow-y-auto space-y-2 no-scrollbar">
          {filteredUsers.map(user => {
            const hasSent = sentUserIds.includes(user.id);
            return (
              <div
                key={user.id}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar src={user.avatar} size="sm" isVerified={user.isVerified} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{user.displayName}</p>
                    <p className="text-[11px] text-slate-400 truncate">@{user.username}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleSendToUser(user.id)}
                  disabled={hasSent}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    hasSent
                      ? 'bg-slate-800 text-slate-400 cursor-default'
                      : 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95'
                  }`}
                >
                  {hasSent ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Sent
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Send
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Copy link button */}
        <div className="pt-2 border-t border-white/5">
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-white transition-colors"
          >
            <Copy className="w-4 h-4 text-indigo-400" />
            Copy Post Link
          </button>
        </div>
      </div>
    </Modal>
  );
};
