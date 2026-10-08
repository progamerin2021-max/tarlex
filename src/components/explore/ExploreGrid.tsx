import React, { useState } from 'react';
import { Search, Film, Layers, Heart, MessageCircle, TrendingUp, Sparkles, Hash, UserCheck, UserPlus } from 'lucide-react';
import { Post, Reel } from '../../types';
import { useSocialStore } from '../../store/socialStore';
import { Avatar } from '../common/Avatar';

interface ExploreGridProps {
  onSelectPost: (post: Post) => void;
  onSelectReel: (reel: Reel) => void;
  onNavigateUser: (username: string) => void;
  onNavigateHashtag: (tag: string) => void;
}

const TRENDING_HASHTAGS = [
  { tag: 'MinimalArchitecture', posts: '124K' },
  { tag: 'FilmIsNotDead', posts: '89K' },
  { tag: 'SlowCraft', posts: '45K' },
  { tag: 'Dolomites', posts: '62K' },
  { tag: 'TokyoMidnight', posts: '98K' },
  { tag: 'DeskSetup', posts: '31K' },
];

export const ExploreGrid: React.FC<ExploreGridProps> = ({
  onSelectPost,
  onSelectReel,
  onNavigateUser,
  onNavigateHashtag,
}) => {
  const { posts, reels, users, currentUser, followingIds, actions } = useSocialStore();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'accounts' | 'tags' | 'reels'>('all');

  // Filtered accounts
  const matchedUsers = users.filter(
    u =>
      u.username.toLowerCase().includes(query.toLowerCase()) ||
      u.displayName.toLowerCase().includes(query.toLowerCase())
  );

  // Filtered tags
  const matchedTags = TRENDING_HASHTAGS.filter(t =>
    t.tag.toLowerCase().includes(query.replace('#', '').toLowerCase())
  );

  // Filtered posts
  const matchedPosts = posts.filter(
    p =>
      p.caption.toLowerCase().includes(query.toLowerCase()) ||
      p.hashtags.some(h => h.toLowerCase().includes(query.toLowerCase()))
  );

  const suggestedUsers = users.filter(
    u => u.id !== currentUser?.id && !followingIds.includes(u.id)
  );

  return (
    <div className="w-full space-y-6">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search creators, hashtags (#NordicDesign), or vibes..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-[#121722] border border-white/10 rounded-2xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-sm"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter Segmented Control */}
      <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-xl overflow-x-auto no-scrollbar">
        {(['all', 'accounts', 'tags', 'reels'] as const).map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeFilter === f
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Query Results when searching */}
      {query.trim().length > 0 ? (
        <div className="space-y-6">
          {/* Matched Users */}
          {(activeFilter === 'all' || activeFilter === 'accounts') && matchedUsers.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                Creators
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matchedUsers.map(user => {
                  const isFollowing = followingIds.includes(user.id);
                  const isMe = user.id === currentUser?.id;

                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 bg-[#10141e] border border-white/5 rounded-2xl"
                    >
                      <div
                        onClick={() => onNavigateUser(user.username)}
                        className="flex items-center gap-3 min-w-0 cursor-pointer"
                      >
                        <Avatar src={user.avatar} size="md" isVerified={user.isVerified} />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate hover:text-indigo-300">
                            {user.displayName}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">@{user.username}</p>
                        </div>
                      </div>

                      {!isMe && (
                        <button
                          onClick={() => {
                            if (isFollowing) actions.unfollowUser(user.id);
                            else actions.followUser(user.id);
                          }}
                          className={`text-xs font-bold px-3 py-1 rounded-xl transition-colors ${
                            isFollowing
                              ? 'bg-white/10 text-slate-300 hover:text-white'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                          }`}
                        >
                          {isFollowing ? 'Following' : 'Follow'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Matched Hashtags */}
          {(activeFilter === 'all' || activeFilter === 'tags') && matchedTags.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                Hashtags
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {matchedTags.map(item => (
                  <button
                    key={item.tag}
                    onClick={() => onNavigateHashtag(item.tag)}
                    className="flex items-center gap-2.5 p-3 bg-[#10141e] border border-white/5 rounded-2xl text-left hover:border-indigo-500/40 transition-colors"
                  >
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                      <Hash className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">#{item.tag}</p>
                      <p className="text-[10px] text-slate-400">{item.posts} posts</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Trending Hashtags Ribbon */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> Trending Topics
              </h3>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {TRENDING_HASHTAGS.map(item => (
                <button
                  key={item.tag}
                  onClick={() => onNavigateHashtag(item.tag)}
                  className="flex items-center gap-2 px-3 py-2 bg-[#121722] hover:bg-white/10 border border-white/5 rounded-xl shrink-0 transition-colors"
                >
                  <span className="text-xs font-bold text-white">#{item.tag}</span>
                  <span className="text-[10px] text-slate-400">{item.posts}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Suggested Creators horizontal carousel */}
          {suggestedUsers.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                Suggested For You
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {suggestedUsers.slice(0, 4).map(user => (
                  <div
                    key={user.id}
                    className="p-3.5 bg-[#10141e] border border-white/5 rounded-2xl flex flex-col items-center text-center space-y-2 hover:border-white/10 transition-colors"
                  >
                    <Avatar
                      src={user.avatar}
                      size="lg"
                      isVerified={user.isVerified}
                      onClick={() => onNavigateUser(user.username)}
                    />
                    <div className="min-w-0 w-full">
                      <p
                        onClick={() => onNavigateUser(user.username)}
                        className="text-xs font-bold text-white truncate cursor-pointer hover:text-indigo-300"
                      >
                        {user.displayName}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">@{user.username}</p>
                    </div>
                    <button
                      onClick={() => actions.followUser(user.id)}
                      className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Explore Masonry Media Mosaic */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Explore Feed
        </h3>
        <div className="grid grid-cols-3 gap-1 sm:gap-2.5">
          {posts.map((post, idx) => {
            const isSpan = idx % 5 === 0;
            const primaryMedia = post.media[0];

            return (
              <div
                key={post.id}
                onClick={() => onSelectPost(post)}
                className={`relative group bg-slate-900 overflow-hidden sm:rounded-xl cursor-pointer ${
                  isSpan ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'
                }`}
              >
                <img
                  src={primaryMedia?.url}
                  alt="Explore"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />

                {post.media.length > 1 && (
                  <div className="absolute top-2 right-2 text-white drop-shadow">
                    <Layers className="w-4 h-4" />
                  </div>
                )}

                {/* Hover stats */}
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
      </div>
    </div>
  );
};
