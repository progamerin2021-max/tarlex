import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Post } from '../../types';
import { useSocialStore } from '../../store/socialStore';
import { Avatar } from '../common/Avatar';
import { PostMediaCarousel } from './PostMediaCarousel';
import { CommentItem } from '../comments/CommentItem';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Smile, X } from 'lucide-react';
import { PostMenuModal } from './PostMenuModal';
import { ShareModal } from './ShareModal';

interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
  onNavigateUser: (username: string) => void;
  onNavigateHashtag?: (tag: string) => void;
}

const QUICK_EMOJIS = ['❤️', '🔥', '👏', '😍', '✨', '🙌'];

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  isOpen,
  onClose,
  post,
  onNavigateUser,
  onNavigateHashtag,
}) => {
  const { users, comments, currentUser, actions } = useSocialStore();
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ commentId: string; username: string } | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showShare, setShowShare] = useState(false);

  if (!post) return null;

  const author = users.find(u => u.id === post.userId) || {
    id: post.userId,
    username: 'creator',
    displayName: 'Creator',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: '',
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    createdAt: '',
  };

  const postComments = comments.filter(c => c.postId === post.id);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (replyingTo) {
      actions.addCommentReply(replyingTo.commentId, commentText);
      setReplyingTo(null);
    } else {
      actions.addComment(post.id, commentText);
    }
    setCommentText('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="full" showCloseButton={true}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 -m-5 min-h-[500px] max-h-[85vh] bg-[#0d111a]">
        {/* Media side */}
        <div className="bg-black flex items-center justify-center overflow-hidden">
          <PostMediaCarousel media={post.media} />
        </div>

        {/* Info & Comments side */}
        <div className="flex flex-col h-full bg-[#10141e] border-l border-white/5">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/5 shrink-0">
            <div
              onClick={() => {
                onClose();
                onNavigateUser(author.username);
              }}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <Avatar src={author.avatar} size="sm" isVerified={author.isVerified} />
              <div>
                <p className="text-xs font-bold text-white hover:text-indigo-300">
                  {author.displayName}
                </p>
                <p className="text-[11px] text-slate-400">@{author.username}</p>
              </div>
            </div>

            <button
              onClick={() => setShowMenu(true)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Caption & Comments scroll area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar divide-y divide-white/5">
            {/* Caption item */}
            <div className="flex items-start gap-3 pb-3">
              <Avatar src={author.avatar} size="xs" />
              <div className="text-xs text-slate-200 leading-relaxed">
                <span className="font-bold text-white mr-2">{author.username}</span>
                <span>{post.caption}</span>
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-1 pt-2">
              {postComments.map(comment => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onNavigateUser={onNavigateUser}
                  onStartReply={(commentId, replyUser) => {
                    setReplyingTo({ commentId, username: replyUser });
                    setCommentText(`@${replyUser} `);
                  }}
                />
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="p-4 border-t border-white/5 space-y-3 shrink-0 bg-[#0d111a]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => actions.toggleLikePost(post.id)}
                  className="text-slate-300 hover:text-white"
                >
                  <Heart
                    className={`w-6 h-6 ${
                      post.isLiked ? 'text-rose-500 fill-rose-500' : ''
                    }`}
                  />
                </button>
                <button
                  onClick={() => setShowShare(true)}
                  className="text-slate-300 hover:text-white"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>

              <button
                onClick={() => actions.toggleSavePost(post.id)}
                className="text-slate-300 hover:text-white"
              >
                <Bookmark
                  className={`w-6 h-6 ${
                    post.isSaved ? 'text-amber-400 fill-amber-400' : ''
                  }`}
                />
              </button>
            </div>

            <p className="text-xs font-bold text-white">
              {post.likesCount.toLocaleString()} {post.likesCount === 1 ? 'like' : 'likes'}
            </p>

            {/* Quick emoji pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
              {QUICK_EMOJIS.map(em => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setCommentText(prev => prev + em)}
                  className="text-sm hover:scale-125 transition-transform"
                >
                  {em}
                </button>
              ))}
            </div>

            {/* Replying Banner */}
            {replyingTo && (
              <div className="flex items-center justify-between px-2.5 py-1 bg-indigo-950/60 rounded-lg text-xs text-indigo-300">
                <span>Replying to @{replyingTo.username}</span>
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setCommentText('');
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Comment Form */}
            <form onSubmit={handleSubmitComment} className="flex items-center gap-2">
              <input
                type="text"
                placeholder={replyingTo ? `Reply to @${replyingTo.username}...` : 'Add a comment...'}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              {commentText.trim() && (
                <button
                  type="submit"
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 px-2"
                >
                  Post
                </button>
              )}
            </form>
          </div>
        </div>
      </div>

      <PostMenuModal
        isOpen={showMenu}
        onClose={() => setShowMenu(false)}
        post={post}
        author={author}
        onOpenShare={() => setShowShare(true)}
      />

      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        post={post}
      />
    </Modal>
  );
};
