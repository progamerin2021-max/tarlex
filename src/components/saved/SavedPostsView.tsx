import React, { useState } from 'react';
import { useSocialStore } from '../../store/socialStore';
import { Post, SavedCollection } from '../../types';
import { Plus, Bookmark, Folder, Layers, Heart, MessageCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

interface SavedPostsViewProps {
  onSelectPost: (post: Post) => void;
}

export const SavedPostsView: React.FC<SavedPostsViewProps> = ({
  onSelectPost,
}) => {
  const { posts, collections, actions } = useSocialStore();
  const { toast } = useToast();

  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  const savedPosts = posts.filter(p => p.isSaved);

  const activeCollection = collections.find(c => c.id === activeCollectionId);
  const displayedPosts = activeCollection
    ? posts.filter(p => activeCollection.postIds.includes(p.id))
    : savedPosts;

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    actions.createCollection(
      newCollectionName.trim(),
      savedPosts[0]?.media[0]?.url
    );
    setNewCollectionName('');
    setShowCreateModal(false);
    toast('Collection Created!', 'Organize your favorite posts', 'success');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-400" />
            Saved Posts
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Only you can see the posts and collections you save.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Collection
        </button>
      </div>

      {/* Collections Row */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Collections
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* All Posts Card */}
          <div
            onClick={() => setActiveCollectionId(null)}
            className={`p-3 rounded-2xl border cursor-pointer transition-all ${
              activeCollectionId === null
                ? 'bg-indigo-950/40 border-indigo-500'
                : 'bg-[#10141e] border-white/5 hover:border-white/10'
            }`}
          >
            <div className="aspect-video rounded-xl bg-slate-800 mb-2 overflow-hidden flex items-center justify-center">
              {savedPosts[0]?.media[0]?.url ? (
                <img
                  src={savedPosts[0]?.media[0]?.url}
                  alt="All"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Bookmark className="w-6 h-6 text-slate-500" />
              )}
            </div>
            <p className="text-xs font-bold text-white truncate">All Saved Posts</p>
            <p className="text-[11px] text-slate-400">{savedPosts.length} posts</p>
          </div>

          {/* User Collections */}
          {collections.map(col => {
            const isSel = activeCollectionId === col.id;
            const cover = col.coverImage || posts.find(p => col.postIds.includes(p.id))?.media[0]?.url;

            return (
              <div
                key={col.id}
                onClick={() => setActiveCollectionId(col.id)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                  isSel
                    ? 'bg-indigo-950/40 border-indigo-500'
                    : 'bg-[#10141e] border-white/5 hover:border-white/10'
                }`}
              >
                <div className="aspect-video rounded-xl bg-slate-800 mb-2 overflow-hidden flex items-center justify-center">
                  {cover ? (
                    <img src={cover} alt={col.name} className="w-full h-full object-cover" />
                  ) : (
                    <Folder className="w-6 h-6 text-slate-500" />
                  )}
                </div>
                <p className="text-xs font-bold text-white truncate">{col.name}</p>
                <p className="text-[11px] text-slate-400">{col.postIds.length} posts</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid of Saved Posts */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {activeCollection ? activeCollection.name : 'All Saved Items'}
        </h3>

        {displayedPosts.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <Bookmark className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold">No saved posts in this section</p>
            <p className="text-xs text-slate-500 mt-1">Tap the bookmark icon on any post to save it.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
            {displayedPosts.map(post => {
              const primaryMedia = post.media[0];

              return (
                <div
                  key={post.id}
                  onClick={() => onSelectPost(post)}
                  className="relative aspect-square group bg-slate-900 rounded-xl overflow-hidden cursor-pointer"
                >
                  <img
                    src={primaryMedia?.url}
                    alt="Saved"
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

      {/* Create Collection Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Collection"
        maxWidth="sm"
      >
        <form onSubmit={handleCreateCollection} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Collection Name
            </label>
            <input
              type="text"
              placeholder="e.g. Design Systems, Travel Inspo..."
              value={newCollectionName}
              onChange={e => setNewCollectionName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors"
          >
            Create Collection
          </button>
        </form>
      </Modal>
    </div>
  );
};
