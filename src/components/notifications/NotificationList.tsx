import React from 'react';
import { useSocialStore } from '../../store/socialStore';
import { Avatar } from '../common/Avatar';
import {
  Heart, MessageCircle, UserPlus, CornerDownRight,
  Sparkles, Check, X, CheckCheck
} from 'lucide-react';
import { Notification } from '../../types';

interface NotificationListProps {
  onNavigateUser: (username: string) => void;
  onSelectPost: (postId: string) => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  onNavigateUser,
  onSelectPost,
}) => {
  const { notifications, users, posts, actions } = useSocialStore();

  const formatTime = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return `${Math.max(1, Math.floor(diff / 60000))}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getSender = (senderId: string) => {
    return (
      users.find(u => u.id === senderId) || {
        id: senderId,
        username: 'user',
        displayName: 'User',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        bio: '',
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        createdAt: '',
      }
    );
  };

  const renderIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />;
      case 'comment':
        return <MessageCircle className="w-3.5 h-3.5 text-indigo-400" />;
      case 'reply':
        return <CornerDownRight className="w-3.5 h-3.5 text-amber-400" />;
      case 'follow':
        return <UserPlus className="w-3.5 h-3.5 text-emerald-400" />;
      case 'follow_request':
        return <UserPlus className="w-3.5 h-3.5 text-purple-400" />;
      case 'reaction':
        return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Heart className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <h2 className="text-lg font-bold text-white">Notifications</h2>
        <button
          onClick={actions.markAllNotificationsRead}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
        >
          <CheckCheck className="w-4 h-4" />
          Mark all as read
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="py-20 text-center text-slate-500">
          <p className="text-sm font-semibold">No notifications right now</p>
          <p className="text-xs text-slate-500 mt-1">
            When people like, comment, or follow you, updates appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const sender = getSender(n.senderId);
            const relatedPost = posts.find(p => p.id === n.postId);

            return (
              <div
                key={n.id}
                onClick={() => {
                  actions.markNotificationRead(n.id);
                  if (n.postId) onSelectPost(n.postId);
                }}
                className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl border transition-colors cursor-pointer ${
                  n.isRead
                    ? 'bg-[#10141e] border-white/5 hover:border-white/10'
                    : 'bg-indigo-950/20 border-indigo-500/30 hover:border-indigo-500/50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <Avatar
                      src={sender.avatar}
                      size="md"
                      isVerified={sender.isVerified}
                      onClick={() => onNavigateUser(sender.username)}
                    />
                    <div className="absolute -bottom-1 -right-1 p-1 bg-[#10141e] rounded-full border border-white/10 shadow-sm">
                      {renderIcon(n.type)}
                    </div>
                  </div>

                  <div className="min-w-0 text-xs leading-relaxed">
                    <p className="text-slate-200">
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateUser(sender.username);
                        }}
                        className="font-bold text-white hover:underline mr-1"
                      >
                        {sender.displayName}
                      </span>
                      {n.type === 'like' && 'liked your post.'}
                      {n.type === 'comment' && `commented: "${n.text}"`}
                      {n.type === 'reply' && `replied: "${n.text}"`}
                      {n.type === 'follow' && 'started following you.'}
                      {n.type === 'follow_request' && 'requested to follow you.'}
                      {n.type === 'reaction' && `reacted to your story with ${n.text || '✨'}`}
                    </p>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {formatTime(n.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Right side thumbnail or follow action */}
                <div className="shrink-0 flex items-center gap-2">
                  {n.type === 'follow_request' ? (
                    <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => actions.acceptFollowRequest(sender.id)}
                        className="p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
                        title="Accept"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => actions.rejectFollowRequest(sender.id)}
                        className="p-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300"
                        title="Decline"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : relatedPost ? (
                    <img
                      src={relatedPost.media[0]?.url}
                      alt="Thumbnail"
                      className="w-11 h-11 rounded-xl object-cover border border-white/10"
                    />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
