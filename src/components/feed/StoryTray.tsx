import React from 'react';
import { Plus } from 'lucide-react';
import { useSocialStore } from '../../store/socialStore';
import { Avatar } from '../common/Avatar';

interface StoryTrayProps {
  onOpenStory: (username: string) => void;
  onOpenCreateStory: () => void;
}

export const StoryTray: React.FC<StoryTrayProps> = ({
  onOpenStory,
  onOpenCreateStory,
}) => {
  const { currentUser, stories, users } = useSocialStore();

  // Group stories by user
  const userStoryMap = new Map<string, typeof stories>();
  stories.forEach(st => {
    // Only non-expired stories
    const isExpired = new Date(st.expiresAt).getTime() < Date.now();
    if (!isExpired) {
      const existing = userStoryMap.get(st.userId) || [];
      userStoryMap.set(st.userId, [...existing, st]);
    }
  });

  const currentUserStories = userStoryMap.get(currentUser?.id || '') || [];

  // Other users with stories
  const otherUsersWithStories = users
    .filter(u => u.id !== currentUser?.id && userStoryMap.has(u.id))
    .map(u => {
      const userSts = userStoryMap.get(u.id) || [];
      const hasUnseen = userSts.some(st => !st.isViewed);
      return { user: u, stories: userSts, hasUnseen };
    });

  return (
    <div className="w-full bg-[#10141e] border border-white/5 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth">
        {/* Current user story / add story */}
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group">
          <div className="relative">
            {currentUserStories.length > 0 ? (
              <Avatar
                src={currentUser?.avatar}
                alt={currentUser?.displayName}
                size="lg"
                hasStory={true}
                storyViewed={!currentUserStories.some(s => !s.isViewed)}
                onClick={() => onOpenStory(currentUser?.username || '')}
              />
            ) : (
              <div
                onClick={onOpenCreateStory}
                className="w-14 h-14 rounded-full p-[2px] bg-white/10 group-hover:bg-white/20 transition-colors flex items-center justify-center relative"
              >
                <img
                  src={currentUser?.avatar}
                  alt={currentUser?.displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenCreateStory();
              }}
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center border-2 border-[#10141e] shadow-md group-hover:scale-110 transition-transform"
              title="Add story"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
          <span className="text-[11px] font-medium text-slate-300 max-w-[68px] truncate text-center">
            Your Story
          </span>
        </div>

        {/* Other creators' stories */}
        {otherUsersWithStories.map(({ user, hasUnseen }) => (
          <div
            key={user.id}
            onClick={() => onOpenStory(user.username)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
          >
            <Avatar
              src={user.avatar}
              alt={user.displayName}
              size="lg"
              hasStory={true}
              storyViewed={!hasUnseen}
              className="group-hover:scale-105 transition-transform"
            />
            <span className="text-[11px] font-medium text-slate-300 max-w-[68px] truncate text-center group-hover:text-white transition-colors">
              {user.username}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
