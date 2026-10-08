import React, { useState } from 'react';
import {
  Heart, MessageCircle, Send, Bookmark, MoreHorizontal,
  MapPin, Smile
} from 'lucide-react';
import { Post } from '../../types';
import { useSocialStore } from '../../store/socialStore';
import { Avatar } from '../common/Avatar';
import { PostMediaCarousel } from './PostMediaCarousel';
import { PostMenuModal } from './PostMenuModal';
import { ShareModal } from './ShareModal';

interface PostCardProps {
  post: Post;
  onOpenComments: (postId: string) => void;
  onNavigateUser: (username: string) => void;
  onNavigateHashtag?: (tag: string) => void;
  onOpenStory?: (username: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onOpenComments,
  onNavigateUser,
  onNavigateHashtag,
  onOpenStory,
}) => {
  const { users, currentUser, followingIds, stories, actions } = useSocialStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [quickComment, setQuickComment] = useState('');
  const [showHeartBurst, setShowHeartBurst] = useState(false);

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

  const isOwner = post.userId === currentUser?.id;
  const isFollowing = followingIds.includes(author.id);
  const hasStory = stories.some(s => s.userId === author.id);

  // Time format
  const formatTime = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return `${Math.max(1, Math.floor(diff / 60000))}m`;
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const handleDoubleTap = () => {
    if (!post.isLiked) {
      actions.toggleLikePost(post.id);
    }
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 900);
  };

  const handleQuickCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickComment.trim()) return;
    actions.addComment(post.id, quickComment);
    setQuickComment('');
  };

  // Render clickable hashtags & mentions
  const renderCaption = (text: string) => {
    const tokens = text.split(/(\s+)/);
    return tokens.map((token, index) => {
      if (token.startsWith('#')) {
        return (
          <span
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              onNavigateHashtag?.(token.replace('#', ''));
            }}
            className="text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer font-medium"
          >
            {token}
          </span>
        );
      }
      if (token.startsWith('@')) {
        return (
          <span
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              onNavigateUser(token.replace('@', ''));
            }}
            className="text-rose-400 hover:text-rose-300 hover:underline cursor-pointer font-semibold"
          >
            {token}
          </span>
        );
      }
      return token;
    });
  };

  return (
    <article className="w-full bg-[#10141e] border border-white/5 rounded-2xl overflow-hidden mb-6 shadow-sm hover:border-white/10 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 sm:p-4">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar
            src={author.avatar}
            alt={author.displayName}
            size="md"
            hasStory={hasStory}
            isVerified={author.isVerified}
            onClick={() => {
              if (hasStory && onOpenStory) onOpenStory(author.username);
              else onNavigateUser(author.username);
            }}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                onClick={() => onNavigateUser(author.username)}
                className="text-xs sm:text-sm font-bold text-white hover:text-indigo-300 cursor-pointer truncate"
              >
                {author.displayName}
              </span>
              <span className="text-slate-500 text-xs hidden sm:inline">·</span>
              <span className="text-slate-500 text-xs">{formatTime(post.createdAt)}</span>
            </div>
            {post.location && (
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="truncate">{post.location}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isOwner && (
            <button
              onClick={() => {
                if (isFollowing) actions.unfollowUser(author.id);
                else actions.followUser(author.id);
              }}
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                isFollowing
                  ? 'text-slate-400 hover:text-white bg-white/5'
                  : 'text-indigo-400 hover:text-white hover:bg-indigo-600/20'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}

          <button
            onClick={() => setShowMenu(true)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Post options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Media Carousel / Video */}
      <div className="relative">
        <PostMediaCarousel media={post.media} onDoubleClick={handleDoubleTap} />

        {/* Floating Heart Burst animation on double tap */}
        {showHeartBurst && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <Heart className="w-24 h-24 text-rose-500 fill-rose-500 animate-ping opacity-90 drop-shadow-2xl" />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-3.5 sm:p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Like */}
            <button
              onClick={() => actions.toggleLikePost(post.id)}
              className="group flex items-center gap-1.5 focus:outline-none"
              aria-label="Like post"
            >
              <Heart
                className={`w-6 h-6 transition-all active:scale-125 ${
                  post.isLiked
                    ? 'text-rose-500 fill-rose-500'
                    : 'text-slate-300 group-hover:text-white'
                }`}
              />
            </button>

            {/* Comment */}
            <button
              onClick={() => onOpenComments(post.id)}
              className="text-slate-300 hover:text-white transition-colors"
              aria-label="Comment"
            >
              <MessageCircle className="w-6 h-6" />
            </button>

            {/* Share */}
            <button
              onClick={() => setShowShare(true)}
              className="text-slate-300 hover:text-white transition-colors"
              aria-label="Share"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>

          {/* Bookmark */}
          <button
            onClick={() => actions.toggleSavePost(post.id)}
            className="text-slate-300 hover:text-white transition-colors"
            aria-label="Save post"
          >
            <Bookmark
              className={`w-6 h-6 ${
                post.isSaved
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-300 hover:text-white'
              }`}
            />
          </button>
        </div>

        {/* Likes Count */}
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <span>{post.likesCount.toLocaleString()} {post.likesCount === 1 ? 'like' : 'likes'}</span>
          {post.savesCount > 0 && (
            <>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400 font-normal">{post.savesCount} saved</span>
            </>
          )}
        </div>

        {/* Caption */}
        <div className="text-xs sm:text-sm text-slate-200 leading-relaxed break-words">
          <span
            onClick={() => onNavigateUser(author.username)}
            className="font-bold text-white mr-2 cursor-pointer hover:underline"
          >
            {author.username}
          </span>
          {renderCaption(post.caption)}
        </div>

        {/* View all comments button */}
        {post.commentsCount > 0 && (
          <button
            onClick={() => onOpenComments(post.id)}
            className="text-xs text-slate-400 hover:text-slate-200 font-medium block"
          >
            View all {post.commentsCount} comments
          </button>
        )}

        {/* Inline Quick Comment Input */}
        <form
          onSubmit={handleQuickCommentSubmit}
          className="flex items-center gap-2 pt-2 border-t border-white/5"
        >
          <div className="text-slate-400 hover:text-white cursor-pointer">
            <Smile className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Add a comment on TarleX..."
            value={quickComment}
            onChange={e => setQuickComment(e.target.value)}
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          {quickComment.trim() && (
            <button
              type="submit"
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Post
            </button>
          )}
        </form>
      </div>

      {/* Modals */}
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
    </article>
  );
};
