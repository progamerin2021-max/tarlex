import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { User } from '../../types';
import { useSocialStore } from '../../store/socialStore';
import { Avatar } from '../common/Avatar';
import { Search } from 'lucide-react';

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  userIds: string[];
  onNavigateUser: (username: string) => void;
}

export const FollowListModal: React.FC<FollowListModalProps> = ({
  isOpen,
  onClose,
  title,
  userIds,
  onNavigateUser,
}) => {
  const { users, currentUser, followingIds, actions } = useSocialStore();
  const [search, setSearch] = useState('');

  const targetUsers = users.filter(u => userIds.includes(u.id));

  const filtered = targetUsers.filter(
    u =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.displayName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* List */}
        <div className="max-h-64 overflow-y-auto space-y-2 no-scrollbar">
          {filtered.length === 0 ? (
            <p className="text-center text-xs text-slate-500 py-6">No users found</p>
          ) : (
            filtered.map(user => {
              const isMe = user.id === currentUser?.id;
              const isFollowing = followingIds.includes(user.id);

              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div
                    onClick={() => {
                      onClose();
                      onNavigateUser(user.username);
                    }}
                    className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                  >
                    <Avatar src={user.avatar} size="sm" isVerified={user.isVerified} />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate hover:text-indigo-300">
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
                      className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${
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
            })
          )}
        </div>
      </div>
    </Modal>
  );
};
