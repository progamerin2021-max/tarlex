import React from 'react';
import { Sparkles, Bell, MessageSquare } from 'lucide-react';
import { useSocialStore } from '../../store/socialStore';

interface MobileHeaderProps {
  onNavigate: (tab: string, param?: string) => void;
  onOpenCopilot: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  onNavigate,
  onOpenCopilot,
}) => {
  const { unreadNotificationsCount, unreadMessagesCount } = useSocialStore();

  return (
    <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#0b0e14]/90 backdrop-blur-md border-b border-white/5">
      {/* Brand */}
      <div
        onClick={() => onNavigate('home')}
        className="flex items-center gap-2 cursor-pointer select-none"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-rose-500 flex items-center justify-center shadow-md">
          <span className="font-extrabold text-white text-base">TX</span>
        </div>
        <span className="font-extrabold text-xl tracking-tight text-white">
          Tarle<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-rose-400">X</span>
        </span>
      </div>

      {/* Action shortcuts */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onOpenCopilot}
          className="p-2 text-indigo-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors relative"
          title="TarleX Copilot"
        >
          <Sparkles className="w-5 h-5" />
        </button>

        <button
          onClick={() => onNavigate('notifications')}
          className="p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0b0e14]" />
          )}
        </button>

        <button
          onClick={() => onNavigate('messages')}
          className="p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors relative"
          title="Direct Messages"
        >
          <MessageSquare className="w-5 h-5" />
          {unreadMessagesCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-[#0b0e14]" />
          )}
        </button>
      </div>
    </header>
  );
};
