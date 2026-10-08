import React, { useState } from 'react';
import { Heart, Trash2, CornerDownRight } from 'lucide-react';
import { Comment, CommentReply } from '../../types';
import { useSocialStore } from '../../store/socialStore';
import { Avatar } from '../common/Avatar';

interface CommentItemProps {
  comment: Comment;
  onNavigateUser: (username: string) => void;
  onStartReply: (commentId: string, replyToUsername: string) => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onNavigateUser,
  onStartReply,
}) => {
  const { users, currentUser, actions } = useSocialStore();
  const [showReplies, setShowReplies] = useState(false);

  const author = users.find(u => u.id === comment.userId) || {
    id: comment.userId,
    username: 'user',
    displayName: 'User',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: '',
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    createdAt: '',
  };

  const isOwner = comment.userId === currentUser?.id;

  const formatTime = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${Math.max(1, mins)}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <div className="flex flex-col gap-2 py-3 border-b border-white/5 last:border-0">
      <div className="flex items-start justify-between gap-3 group">
        <div className="flex items-start gap-2.5 min-w-0">
          <Avatar
            src={author.avatar}
            alt={author.displayName}
            size="sm"
            onClick={() => onNavigateUser(author.username)}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                onClick={() => onNavigateUser(author.username)}
                className="text-xs font-bold text-white hover:text-indigo-300 cursor-pointer"
              >
                {author.username}
              </span>
              <span className="text-[11px] text-slate-500">{formatTime(comment.createdAt)}</span>
            </div>
            <p className="text-xs text-slate-200 mt-0.5 break-words whitespace-pre-wrap leading-relaxed">
              {comment.text}
            </p>
            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400 font-semibold">
              <button
                onClick={() => onStartReply(comment.id, author.username)}
                className="hover:text-white transition-colors"
              >
                Reply
              </button>
              {isOwner && (
                <button
                  onClick={() => actions.deleteComment(comment.id)}
                  className="text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Like comment button */}
        <button
          onClick={() => actions.toggleLikeComment(comment.id)}
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-white p-1"
          aria-label="Like comment"
        >
          <Heart
            className={`w-3.5 h-3.5 ${
              comment.isLiked ? 'text-rose-500 fill-rose-500' : ''
            }`}
          />
          {comment.likesCount > 0 && (
            <span className="text-[10px] text-slate-400 font-medium">
              {comment.likesCount}
            </span>
          )}
        </button>
      </div>

      {/* Nested Replies accordion */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-9 mt-1">
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <CornerDownRight className="w-3 h-3" />
            {showReplies
              ? 'Hide replies'
              : `View ${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}`}
          </button>

          {showReplies && (
            <div className="mt-2 space-y-2.5 border-l-2 border-white/5 pl-3">
              {comment.replies.map(reply => {
                const replyAuthor = users.find(u => u.id === reply.userId) || {
                  id: reply.userId,
                  username: 'user',
                  displayName: 'User',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                  bio: '',
                  followersCount: 0,
                  followingCount: 0,
                  postsCount: 0,
                  createdAt: '',
                };

                return (
                  <div key={reply.id} className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <Avatar
                        src={replyAuthor.avatar}
                        size="xs"
                        onClick={() => onNavigateUser(replyAuthor.username)}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            onClick={() => onNavigateUser(replyAuthor.username)}
                            className="text-xs font-bold text-white hover:text-indigo-300 cursor-pointer"
                          >
                            {replyAuthor.username}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {formatTime(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 mt-0.5 break-words">
                          {reply.text}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
