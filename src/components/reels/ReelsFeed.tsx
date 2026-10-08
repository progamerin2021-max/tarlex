import React, { useState, useEffect } from 'react';
import { useSocialStore } from '../../store/socialStore';
import { ReelItem } from './ReelItem';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface ReelsFeedProps {
  onNavigateUser: (username: string) => void;
  onNavigateHashtag?: (tag: string) => void;
}

export const ReelsFeed: React.FC<ReelsFeedProps> = ({
  onNavigateUser,
  onNavigateHashtag,
}) => {
  const { reels } = useSocialStore();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        setActiveIndex(prev => Math.min(reels.length - 1, prev + 1));
      } else if (e.key === 'ArrowUp') {
        setActiveIndex(prev => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [reels.length]);

  return (
    <div className="relative w-full min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center py-2">
      {/* Up / Down navigation helpers for desktop */}
      <div className="hidden lg:flex fixed right-10 top-1/2 -translate-y-1/2 flex-col gap-3 z-30">
        <button
          onClick={() => setActiveIndex(prev => Math.max(0, prev - 1))}
          disabled={activeIndex === 0}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 backdrop-blur-md transition-all"
          title="Previous Reel"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
        <button
          onClick={() => setActiveIndex(prev => Math.min(reels.length - 1, prev + 1))}
          disabled={activeIndex === reels.length - 1}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 backdrop-blur-md transition-all"
          title="Next Reel"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>

      {/* Reel Feed */}
      <div className="w-full flex flex-col items-center">
        {reels.map((reel, idx) => (
          <div
            key={reel.id}
            className={`w-full transition-opacity duration-300 ${
              idx === activeIndex ? 'block' : 'hidden'
            }`}
          >
            <ReelItem
              reel={reel}
              isActive={idx === activeIndex}
              onNavigateUser={onNavigateUser}
              onNavigateHashtag={onNavigateHashtag}
            />
          </div>
        ))}
      </div>

      {/* Reel Index Dots */}
      <div className="flex items-center gap-1.5 mt-2">
        {reels.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`rounded-full transition-all ${
              i === activeIndex
                ? 'w-4 h-1.5 bg-indigo-500'
                : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
