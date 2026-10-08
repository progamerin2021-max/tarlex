import React, { useState } from 'react';
import { useSocialStore } from '../../store/socialStore';
import { Post } from '../../types';
import { Hash, Layers, Heart, MessageCircle, ArrowLeft } from 'lucide-react';

interface HashtagViewProps {
  tag: string;
  onBack: () => void;
  onSelectPost: (post: Post) => void;
}

export const HashtagView: React.FC<HashtagViewProps> = ({
  tag,
  onBack,
  onSelectPost,
}) => {
  const { posts } = useSocialStore();
  const [filter, setFilter] = useState<'top' | 'recent'>('top');

  const cleanTag = tag.replace('#', '').toLowerCase();
  const taggedPosts = posts.filter(p =>
    p.hashtags.some(h => h.replace('#', '').toLowerCase() === cleanTag)
  );

  const sortedPosts = [...taggedPosts].sort((a, b) => {
    if (filter === 'top') return b.likesCount - a.likesCount;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-white/5">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-rose-500 flex items-center justify-center text-white shadow-lg">
            <Hash className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">#{tag.replace('#', '')}</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {taggedPosts.length} posts on TarleX
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('top')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            filter === 'top'
              ? 'bg-indigo-600 text-white'
              : 'bg-white/5 text-slate-400 hover:text-white'
          }`}
        >
          Top Posts
        </button>
        <button
          onClick={() => setFilter('recent')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            filter === 'recent'
              ? 'bg-indigo-600 text-white'
              : 'bg-white/5 text-slate-400 hover:text-white'
          }`}
        >
          Most Recent
        </button>
      </div>

      {/* Grid */}
      {sortedPosts.length === 0 ? (
        <div className="py-20 text-center text-slate-500">
          <p className="text-sm font-semibold">No posts with #{tag.replace('#', '')} yet</p>
          <p className="text-xs text-slate-500 mt-1">Be the first to create a post with this hashtag!</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
          {sortedPosts.map(post => {
            const primaryMedia = post.media[0];

            return (
              <div
                key={post.id}
                onClick={() => onSelectPost(post)}
                className="relative aspect-square group bg-slate-900 rounded-xl overflow-hidden cursor-pointer"
              >
                <img
                  src={primaryMedia?.url}
                  alt="Post"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {post.media.length > 1 && (
                  <div className="absolute top-2 right-2 text-white drop-shadow">
                    <Layers className="w-4 h-4" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold text-xs">
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4 fill-white" />
                    {post.likesCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4 fill-white" />
                    {post.commentsCount}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
