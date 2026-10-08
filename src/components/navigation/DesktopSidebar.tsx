import React, { useState } from 'react';
import {
  Home, Compass, Film, MessageSquare, Bell, PlusSquare,
  User as UserIcon, Settings, Sparkles, LogOut, Users, ChevronDown, Check
} from 'lucide-react';
import { useSocialStore } from '../../store/socialStore';
import { Avatar } from '../common/Avatar';

interface DesktopSidebarProps {
  currentTab: string;
  onNavigate: (tab: string, param?: string) => void;
  onOpenCreate: () => void;
  onOpenCopilot: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  currentTab,
  onNavigate,
  onOpenCreate,
  onOpenCopilot,
}) => {
  const {
    currentUser,
    users,
    unreadNotificationsCount,
    unreadMessagesCount,
    actions,
  } = useSocialStore();

  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'reels', label: 'Reels', icon: Film },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
    },
    { id: 'create', label: 'Create', icon: PlusSquare, action: onOpenCreate },
    { id: 'profile', label: 'Profile', icon: UserIcon, param: currentUser?.username },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 xl:w-72 h-screen sticky top-0 bg-[#0d111a] border-r border-white/5 px-4 py-6 z-30 select-none">
      {/* Brand Header */}
      <div
        onClick={() => onNavigate('home')}
        className="flex items-center gap-3 px-3 cursor-pointer group mb-8"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-rose-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
          <span className="font-extrabold text-white text-xl tracking-tight">TX</span>
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-2xl tracking-tight text-white flex items-center gap-1.5">
            Tarle<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-rose-400">X</span>
          </span>
          <span className="text-[10px] text-slate-400 tracking-wider font-medium uppercase -mt-1">
            Social Media
          </span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive =
            currentTab === item.id ||
            (item.id === 'profile' && currentTab.startsWith('profile'));

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else {
                  onNavigate(item.id, item.param);
                }
              }}
              className={`w-full flex items-center gap-4 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all relative ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-300 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 ${
                    isActive ? 'text-indigo-400 stroke-[2.2]' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[18px] text-center border-2 border-[#0d111a]">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="truncate">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
              )}
            </button>
          );
        })}

        {/* AI Copilot shortcut button */}
        <div className="pt-4 pb-2 px-1">
          <button
            onClick={onOpenCopilot}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-rose-900/20 border border-indigo-500/30 text-indigo-200 hover:border-indigo-400/60 hover:text-white transition-all shadow-sm group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold leading-none text-slate-100">TarleX Copilot</p>
                <p className="text-[10px] text-slate-400 mt-1">Creative AI & Hooks</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Gemini
            </span>
          </button>
        </div>
      </nav>

      {/* Account / Profile Footer */}
      <div className="relative pt-4 border-t border-white/5">
        <button
          onClick={() => setShowAccountMenu(!showAccountMenu)}
          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.04] transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Avatar src={currentUser?.avatar} alt={currentUser?.displayName} size="sm" isVerified={currentUser?.isVerified} />
            <div className="text-left min-w-0">
              <p className="text-xs font-bold text-white truncate">{currentUser?.displayName}</p>
              <p className="text-[11px] text-slate-400 truncate">@{currentUser?.username}</p>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showAccountMenu ? 'rotate-180' : ''}`} />
        </button>

        {/* Account Switcher Dropdown */}
        {showAccountMenu && (
          <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-[#141a26] border border-white/10 rounded-2xl shadow-2xl z-40 animate-in fade-in zoom-in-95">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
              Switch Creator Profile
            </p>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {users.map(u => (
                <button
                  key={u.id}
                  onClick={() => {
                    actions.switchAccount(u.id);
                    setShowAccountMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                    u.id === currentUser?.id ? 'bg-indigo-600/20 text-indigo-200' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar src={u.avatar} size="xs" />
                    <div className="min-w-0">
                      <p className="font-semibold truncate text-white">{u.displayName}</p>
                      <p className="text-[10px] text-slate-400">@{u.username}</p>
                    </div>
                  </div>
                  {u.id === currentUser?.id && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                </button>
              ))}
            </div>

            <div className="pt-2 mt-2 border-t border-white/5">
              <button
                onClick={() => {
                  actions.logout();
                  setShowAccountMenu(false);
                  onNavigate('login');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
