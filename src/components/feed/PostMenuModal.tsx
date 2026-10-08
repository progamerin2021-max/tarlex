import React from 'react';
import { Modal } from '../common/Modal';
import { Trash2, UserX, EyeOff, Share2, Flag, Copy } from 'lucide-react';
import { Post, User } from '../../types';
import { useSocialStore } from '../../store/socialStore';
import { useToast } from '../common/Toast';

interface PostMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  author?: User;
  onOpenShare: () => void;
}

export const PostMenuModal: React.FC<PostMenuModalProps> = ({
  isOpen,
  onClose,
  post,
  author,
  onOpenShare,
}) => {
  const { currentUser, followingIds, actions } = useSocialStore();
  const { toast } = useToast();

  const isOwner = post.userId === currentUser?.id;
  const isFollowingAuthor = author ? followingIds.includes(author.id) : false;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(window.location.origin + `/post/${post.id}`);
    toast('Link Copied', 'Post link copied to your clipboard', 'success');
    onClose();
  };

  const handleHide = () => {
    actions.hidePost(post.id);
    toast('Post Hidden', 'You will see fewer posts like this', 'info');
    onClose();
  };

  const handleUnfollow = () => {
    if (author) {
      actions.unfollowUser(author.id);
      toast('Unfollowed', `You unfollowed @${author.username}`, 'info');
    }
    onClose();
  };

  const handleBlock = () => {
    if (author) {
      actions.blockUser(author.id);
      toast('User Blocked', `@${author.username} has been blocked`, 'info');
    }
    onClose();
  };

  const handleReport = () => {
    actions.reportPost(post.id, 'Inappropriate content');
    toast('Report Submitted', 'Thank you for keeping TarleX safe', 'success');
    onClose();
  };

  const handleDelete = () => {
    actions.deletePost(post.id);
    toast('Post Deleted', 'Your post was removed', 'info');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm" showCloseButton={false}>
      <div className="flex flex-col divide-y divide-white/5 text-sm font-medium">
        {isOwner ? (
          <button
            onClick={handleDelete}
            className="flex items-center gap-3 p-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors font-semibold"
          >
            <Trash2 className="w-5 h-5" />
            Delete Post
          </button>
        ) : (
          <>
            <button
              onClick={handleReport}
              className="flex items-center gap-3 p-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors font-semibold"
            >
              <Flag className="w-5 h-5" />
              Report Post
            </button>

            {isFollowingAuthor && (
              <button
                onClick={handleUnfollow}
                className="flex items-center gap-3 p-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
              >
                <UserX className="w-5 h-5" />
                Unfollow @{author?.username}
              </button>
            )}

            <button
              onClick={handleBlock}
              className="flex items-center gap-3 p-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
            >
              <UserX className="w-5 h-5" />
              Block @{author?.username}
            </button>
          </>
        )}

        <button
          onClick={handleHide}
          className="flex items-center gap-3 p-3 text-slate-200 hover:bg-white/5 rounded-xl transition-colors"
        >
          <EyeOff className="w-5 h-5 text-slate-400" />
          Hide Post
        </button>

        <button
          onClick={() => {
            onClose();
            onOpenShare();
          }}
          className="flex items-center gap-3 p-3 text-slate-200 hover:bg-white/5 rounded-xl transition-colors"
        >
          <Share2 className="w-5 h-5 text-slate-400" />
          Share to...
        </button>

        <button
          onClick={handleCopyLink}
          className="flex items-center gap-3 p-3 text-slate-200 hover:bg-white/5 rounded-xl transition-colors"
        >
          <Copy className="w-5 h-5 text-slate-400" />
          Copy Link
        </button>

        <button
          onClick={onClose}
          className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors text-center font-normal mt-1"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
};
