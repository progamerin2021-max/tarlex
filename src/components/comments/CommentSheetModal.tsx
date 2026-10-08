import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { CommentItem } from './CommentItem';
import { useSocialStore } from '../../store/socialStore';
import { Send, X } from 'lucide-react';
import { Avatar } from '../common/Avatar';

interface CommentSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  onNavigateUser: (username: string) => void;
}

const QUICK_EMOJIS = ['❤️', '🔥', '👏', '😍', '✨', '🙌', '💯'];

export const CommentSheetModal: React.FC<CommentSheetModalProps> = ({
  isOpen,
  onClose,
  postId,
  onNavigateUser,
}) => {
  const { posts, comments, currentUser, users, actions } = useSocialStore();
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ commentId: string; username: string } | null>(null);

  const post = posts.find(p => p.id === postId);
  const postComments = comments.filter(c => c.postId === postId);
  const postAuthor = users.find(u => u.id === post?.userId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (replyingTo) {
      actions.addCommentReply(replyingTo.commentId, commentText);
      setReplyingTo(null);
    } else {
      actions.addComment(postId, commentText);
    }
    setCommentText('');
  };

  const handleStartReply = (commentId: string, username: string) => {
    setReplyingTo({ commentId, username });
    setCommentText(`@${username} `);
  };

  const handleInsertEmoji = (emoji: string) => {
    setCommentText(prev => prev + emoji);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Comments (${postComments.length})`}
      maxWidth="md"
    >
      <div className="flex flex-col h-[70vh] max-h-[560px]">
        {/* Post caption teaser at top */}
        {post && postAuthor && (
          <div className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl mb-3 shrink-0">
            <Avatar src={postAuthor.avatar} size="sm" isVerified={postAuthor.isVerified} />
            <div className="min-w-0">
              <span className="text-xs font-bold text-white mr-1.5">{postAuthor.username}</span>
              <span className="text-xs text-slate-300 line-clamp-2">{post.caption}</span>
            </div>
          </div>
        )}

        {/* Comments stream */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-1 pr-1">
          {postComments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <p className="text-sm font-semibold text-slate-200">No comments yet</p>
              <p className="text-xs text-slate-500 mt-1">Start the conversation on this post!</p>
            </div>
          ) : (
            postComments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onNavigateUser={onNavigateUser}
                onStartReply={handleStartReply}
              />
            ))
          )}
        </div>

        {/* Quick Emoji bar */}
        <div className="flex items-center gap-2 py-2 border-t border-white/5 shrink-0 overflow-x-auto no-scrollbar">
          {QUICK_EMOJIS.map(emoji => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleInsertEmoji(emoji)}
              className="text-base p-1 hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Replying banner */}
        {replyingTo && (
          <div className="flex items-center justify-between px-3 py-1.5 bg-indigo-950/60 border border-indigo-500/20 rounded-lg text-xs text-indigo-300 mb-2 shrink-0">
            <span>Replying to @{replyingTo.username}</span>
            <button
              onClick={() => {
                setReplyingTo(null);
                setCommentText('');
              }}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 shrink-0 pt-1">
          <Avatar src={currentUser?.avatar} size="sm" />
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={replyingTo ? `Reply to @${replyingTo.username}...` : 'Add a comment...'}
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              className="w-full pl-3 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
            {commentText.trim() && (
              <button
                type="submit"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-300"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
};
