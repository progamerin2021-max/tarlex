import React from 'react';
import { Home, Compass, PlusSquare, Film } from 'lucide-react';
import { useSocialStore } from '../../store/socialStore';
import { Avatar } from '../common/Avatar';

interface MobileBottomNavProps {
  currentTab: string;
  onNavigate: (tab: string, param?: string) => void;
  onOpenCreate: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onNavigate,
  onOpenCreate,
}) => {
  const { currentUser } = useSocialStore();

  const isProfileActive = currentTab.startsWith('profile');

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b0e14]/95 backdrop-blur-lg border-t border-white/5 px-2 py-2 pb-safe select-none">
      <div className="flex items-center justify-around">
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${
            currentTab === 'home' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Home"
        >
          <Home className="w-6 h-6 stroke-[2.2]" />
        </button>

        <button
          onClick={() => onNavigate('explore')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${
            currentTab === 'explore' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Explore"
        >
          <Compass className="w-6 h-6 stroke-[2.2]" />
        </button>

        {/* Center Create Button */}
        <button
          onClick={onOpenCreate}
          className="flex items-center justify-center -mt-3 w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-rose-500 text-white shadow-lg shadow-indigo-500/30 active:scale-95 transition-transform"
          aria-label="Create Post"
        >
          <PlusSquare className="w-6 h-6 stroke-[2.5]" />
        </button>

        <button
          onClick={() => onNavigate('reels')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${
            currentTab === 'reels' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Reels"
        >
          <Film className="w-6 h-6 stroke-[2.2]" />
        </button>

        <button
          onClick={() => onNavigate('profile', currentUser?.username)}
          className={`flex flex-col items-center justify-center p-1.5 rounded-full transition-transform ${
            isProfileActive ? 'ring-2 ring-indigo-500' : 'opacity-80 hover:opacity-100'
          }`}
          aria-label="My Profile"
        >
          <Avatar src={currentUser?.avatar} size="xs" />
        </button>
      </div>
    </nav>
  );
};
