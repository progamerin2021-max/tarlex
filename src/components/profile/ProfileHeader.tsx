import React, { useState } from 'react';
import { User } from '../../types';
import { useSocialStore } from '../../store/socialStore';
import { Avatar } from '../common/Avatar';
import {
  Link as LinkIcon, Settings, MessageSquare,
  Lock, Check, UserPlus, UserCheck, Shield
} from 'lucide-react';

interface ProfileHeaderProps {
  user: User;
  onOpenEditProfile: () => void;
  onOpenFollowers: () => void;
  onOpenFollowing: () => void;
  onStartMessage: (userId: string) => void;
  onOpenSettings: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  onOpenEditProfile,
  onOpenFollowers,
  onOpenFollowing,
  onStartMessage,
  onOpenSettings,
}) => {
  const { currentUser, followingIds, pendingRequests, actions } = useSocialStore();

  const isOwner = user.id === currentUser?.id;
  const isFollowing = followingIds.includes(user.id);
  const isRequested = pendingRequests.some(
    r => r.requesterId === currentUser?.id && r.targetId === user.id
  );

  const handleFollowAction = () => {
    if (isFollowing) {
      actions.unfollowUser(user.id);
    } else if (isRequested) {
      actions.unfollowUser(user.id); // cancel request
    } else {
      actions.followUser(user.id);
    }
  };

  return (
    <div className="w-full bg-[#10141e] border border-white/5 rounded-3xl p-5 sm:p-8 mb-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-8">
        {/* Avatar */}
        <Avatar
          src={user.avatar}
          alt={user.displayName}
          size="2xl"
          isVerified={user.isVerified}
        />

        {/* Info */}
        <div className="flex-1 text-center sm:text-left min-w-0 space-y-4">
          {/* Top Row: Username and Main Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {user.username}
              </h1>
              {user.isPrivate && (
                <span title="Private Account" className="inline-flex">
                  <Lock className="w-4 h-4 text-slate-400" />
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-center sm:justify-end gap-2">
              {isOwner ? (
                <>
                  <button
                    onClick={onOpenEditProfile}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={onOpenSettings}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                    title="Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleFollowAction}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      isFollowing
                        ? 'bg-white/10 hover:bg-white/15 text-white'
                        : isRequested
                        ? 'bg-slate-800 text-slate-300 border border-white/10'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                    }`}
                  >
                    {isFollowing ? (
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5" /> Following
                      </span>
                    ) : isRequested ? (
                      <span>Requested</span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <UserPlus className="w-3.5 h-3.5" /> Follow
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => onStartMessage(user.id)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Message
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-center sm:justify-start gap-6 sm:gap-8 pt-1">
            <div className="text-center sm:text-left">
              <span className="text-base sm:text-lg font-bold text-white block">
                {user.postsCount}
              </span>
              <span className="text-xs text-slate-400">posts</span>
            </div>

            <button
              onClick={onOpenFollowers}
              className="text-center sm:text-left hover:opacity-80 transition-opacity"
            >
              <span className="text-base sm:text-lg font-bold text-white block">
                {user.followersCount.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400">followers</span>
            </button>

            <button
              onClick={onOpenFollowing}
              className="text-center sm:text-left hover:opacity-80 transition-opacity"
            >
              <span className="text-base sm:text-lg font-bold text-white block">
                {user.followingCount.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400">following</span>
            </button>
          </div>

          {/* Bio & Details */}
          <div className="space-y-1.5 text-xs sm:text-sm">
            <p className="font-bold text-white">{user.displayName}</p>
            {user.bio && (
              <p className="text-slate-300 whitespace-pre-wrap leading-relaxed max-w-lg">
                {user.bio}
              </p>
            )}
            {user.website && (
              <a
                href={user.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-medium hover:underline pt-0.5"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>{user.website.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
