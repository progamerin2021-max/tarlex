import React, { useState } from 'react';
import { Grid, Film, Bookmark, Tag, Layers, Heart, MessageCircle } from 'lucide-react';
import { Post, Reel } from '../../types';

interface ProfileTabsProps {
  posts: Post[];
  reels: Reel[];
  savedPosts: Post[];
  isOwner: boolean;
  onSelectPost: (post: Post) => void;
  onSelectReel: (reel: Reel) => void;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  posts,
  reels,
  savedPosts,
  isOwner,
  onSelectPost,
  onSelectReel,
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'saved'>('posts');

  const tabs = [
    { id: 'posts', label: 'Posts', icon: Grid, count: posts.length },
    { id: 'reels', label: 'Reels', icon: Film, count: reels.length },
    ...(isOwner ? [{ id: 'saved', label: 'Saved', icon: Bookmark, count: savedPosts.length }] : []),
  ];

  return (
    <div className="w-full space-y-4">
      {/* Tabs Switcher */}
      <div className="flex items-center justify-center border-b border-white/5">
        <div className="flex items-center gap-6 sm:gap-10">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-1 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                  isActive
                    ? 'border-indigo-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className="text-[10px] text-slate-500 font-normal">({tab.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Content */}
      {activeTab === 'posts' && (
        posts.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Grid className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold">No posts yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 sm:gap-3">
            {posts.map(post => {
              const primaryMedia = post.media[0];
              const isMulti = post.media.length > 1;

              return (
                <div
                  key={post.id}
                  onClick={() => onSelectPost(post)}
                  className="relative aspect-square group bg-slate-900 sm:rounded-xl overflow-hidden cursor-pointer"
                >
                  <img
                    src={primaryMedia?.url}
                    alt="Post"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {isMulti && (
                    <div className="absolute top-2 right-2 text-white drop-shadow">
                      <Layers className="w-4 h-4" />
                    </div>
                  )}

                  {/* Hover stats overlay */}
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
        )
      )}

      {/* Reels Tab */}
      {activeTab === 'reels' && (
        reels.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Film className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold">No reels created yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 sm:gap-3">
            {reels.map(reel => (
              <div
                key={reel.id}
                onClick={() => onSelectReel(reel)}
                className="relative aspect-[9/16] group bg-slate-900 sm:rounded-xl overflow-hidden cursor-pointer"
              >
                <img
                  src={reel.thumbnailUrl}
                  alt="Reel thumb"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute bottom-2 left-2 text-white font-bold text-xs flex items-center gap-1 drop-shadow">
                  <Film className="w-3.5 h-3.5" />
                  <span>{reel.likesCount}</span>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Saved Tab */}
      {activeTab === 'saved' && (
        savedPosts.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Bookmark className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold">No saved posts</p>
            <p className="text-xs text-slate-500 mt-1">Posts you save will appear privately here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 sm:gap-3">
            {savedPosts.map(post => (
              <div
                key={post.id}
                onClick={() => onSelectPost(post)}
                className="relative aspect-square group bg-slate-900 sm:rounded-xl overflow-hidden cursor-pointer"
              >
                <img
                  src={post.media[0]?.url}
                  alt="Saved post"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
