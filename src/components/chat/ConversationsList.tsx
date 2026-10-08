import React, { useState } from 'react';
import { Conversation, User } from '../../types';
import { useSocialStore } from '../../store/socialStore';
import { Avatar } from '../common/Avatar';
import { Search, Sparkles, Plus } from 'lucide-react';

interface ConversationsListProps {
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onStartNewChat: () => void;
}

export const ConversationsList: React.FC<ConversationsListProps> = ({
  activeConversationId,
  onSelectConversation,
  onStartNewChat,
}) => {
  const { conversations, users, currentUser } = useSocialStore();
  const [search, setSearch] = useState('');

  const formatMessageTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    if (now.getTime() - date.getTime() < 86400000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getOtherParticipant = (conv: Conversation): User => {
    const otherId = conv.participantIds.find(id => id !== currentUser?.id) || conv.participantIds[0];
    return (
      users.find(u => u.id === otherId) || {
        id: otherId,
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

  const filteredConversations = conversations.filter(conv => {
    const other = getOtherParticipant(conv);
    return (
      other.username.toLowerCase().includes(search.toLowerCase()) ||
      other.displayName.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="flex flex-col h-full bg-[#0d111a] border-r border-white/5">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          Messages
          <span className="text-xs text-indigo-400 font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10">
            {conversations.length}
          </span>
        </h2>
        <button
          onClick={onStartNewChat}
          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
          title="New Message"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-white/5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Conversations Stream */}
      <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-white/[0.03]">
        {filteredConversations.map(conv => {
          const other = getOtherParticipant(conv);
          const isSelected = activeConversationId === conv.id;
          const isAi = conv.isAiBot || other.id === 'user_tarlex_ai';
          const lastMsg = conv.lastMessage;
          const isUnread = lastMsg && !lastMsg.isRead && lastMsg.senderId !== currentUser?.id;

          return (
            <div
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`flex items-center gap-3 p-3.5 cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-indigo-600/15 border-l-2 border-indigo-500'
                  : 'hover:bg-white/[0.03]'
              }`}
            >
              <div className="relative">
                <Avatar
                  src={other.avatar}
                  size="md"
                  isVerified={other.isVerified}
                />
                {isAi ? (
                  <span className="absolute -top-1 -right-1 p-0.5 rounded-full bg-indigo-500 text-white shadow-sm">
                    <Sparkles className="w-2.5 h-2.5" />
                  </span>
                ) : (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0d111a]" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-xs font-bold truncate ${isSelected ? 'text-indigo-200' : 'text-white'}`}>
                    {other.displayName}
                  </p>
                  <span className="text-[10px] text-slate-500 shrink-0">
                    {formatMessageTime(conv.updatedAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className={`text-xs truncate ${isUnread ? 'text-white font-semibold' : 'text-slate-400'}`}>
                    {lastMsg?.text || (isAi ? 'Ask me anything about content!' : 'Started conversation')}
                  </p>
                  {isUnread && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 ml-1.5" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
