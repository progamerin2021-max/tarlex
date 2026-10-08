import React, { useState } from 'react';
import { useSocialStore } from '../../store/socialStore';
import {
  Lock, Bell, Shield, Moon, Sun, Globe, LogOut,
  UserX, VolumeX, Trash2, Check, User
} from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { useToast } from '../common/Toast';

interface SettingsViewProps {
  onOpenEditProfile: () => void;
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onOpenEditProfile,
  onLogout,
}) => {
  const {
    currentUser,
    users,
    blockedUserIds,
    mutedUserIds,
    settings,
    actions,
  } = useSocialStore();
  const { toast } = useToast();

  const [activeSection, setActiveSection] = useState<'general' | 'privacy' | 'notifications' | 'blocked'>('general');

  const blockedUsers = users.filter(u => blockedUserIds.includes(u.id));
  const mutedUsers = users.filter(u => mutedUserIds.includes(u.id));

  const handleTogglePrivate = () => {
    const nextPrivate = !settings.isPrivateAccount;
    actions.updateSettings({ isPrivateAccount: nextPrivate });
    actions.updateProfile({ isPrivate: nextPrivate });
    toast(
      nextPrivate ? 'Account is now Private 🔒' : 'Account is now Public 🌐',
      nextPrivate
        ? 'Only approved followers can view your feed and stories'
        : 'Anyone on TarleX can view your posts and stories',
      'info'
    );
  };

  const handleToggleNotifications = () => {
    actions.updateSettings({ notificationsEnabled: !settings.notificationsEnabled });
    toast('Settings Saved', 'Notification preferences updated', 'success');
  };

  const handleToggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    actions.updateSettings({ theme: nextTheme });
    toast('Appearance Updated', `Switched to ${nextTheme} theme`, 'info');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your TarleX account? This action cannot be undone.')) {
      actions.logout();
      toast('Account Deleted', 'Your account and data were removed', 'info');
      onLogout();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-white/5">
        <h2 className="text-xl font-bold text-white">Settings & Privacy</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage your account preferences, security, and privacy on TarleX.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation Sidebar for settings */}
        <div className="space-y-1.5 bg-[#10141e] border border-white/5 p-3 rounded-2xl h-fit">
          {[
            { id: 'general', label: 'Account & Security', icon: User },
            { id: 'privacy', label: 'Privacy & Sharing', icon: Lock },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'blocked', label: 'Blocked & Muted', icon: UserX },
          ].map(sec => {
            const Icon = sec.icon;
            const isSel = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors ${
                  isSel
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Box */}
        <div className="md:col-span-2 bg-[#10141e] border border-white/5 p-5 rounded-2xl space-y-6">
          {/* General Section */}
          {activeSection === 'general' && (
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-white">Account Details</h3>

              <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <Avatar src={currentUser?.avatar} size="md" />
                  <div>
                    <p className="text-xs font-bold text-white">{currentUser?.displayName}</p>
                    <p className="text-[11px] text-slate-400">@{currentUser?.username}</p>
                  </div>
                </div>
                <button
                  onClick={onOpenEditProfile}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Edit
                </button>
              </div>

              {/* Theme */}
              <div className="flex items-center justify-between py-2 border-t border-white/5">
                <div>
                  <p className="text-xs font-bold text-white">Interface Theme</p>
                  <p className="text-[11px] text-slate-400">Curated high-contrast dark theme</p>
                </div>
                <button
                  onClick={handleToggleTheme}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold text-white transition-colors border border-white/10"
                >
                  {settings.theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                  <span className="capitalize">{settings.theme}</span>
                </button>
              </div>

              {/* Language */}
              <div className="flex items-center justify-between py-2 border-t border-white/5">
                <div>
                  <p className="text-xs font-bold text-white">Language</p>
                  <p className="text-[11px] text-slate-400">English (United States)</p>
                </div>
                <span className="text-xs text-indigo-400 font-semibold">Default</span>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-white/5 space-y-2">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  Log Out of TarleX
                </button>

                <button
                  onClick={handleDeleteAccount}
                  className="w-full flex items-center justify-center gap-2 py-2.5 hover:bg-rose-500/10 rounded-xl text-xs font-bold text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {/* Privacy Section */}
          {activeSection === 'privacy' && (
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-white">Account Privacy</h3>

              <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/5">
                <div>
                  <p className="text-xs font-bold text-white">Private Account</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    When enabled, only people who follow you can view your photos and stories.
                  </p>
                </div>
                <button
                  onClick={handleTogglePrivate}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 shrink-0 ${
                    settings.isPrivateAccount ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.isPrivateAccount ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Commenting permissions */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <label className="text-xs font-bold text-white block">
                  Allow Comments From
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['everyone', 'following', 'nobody'] as const).map(opt => (
                    <button
                      key={opt}
                      onClick={() => actions.updateSettings({ allowComments: opt })}
                      className={`p-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                        settings.allowComments === opt
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tagging permissions */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <label className="text-xs font-bold text-white block">
                  Allow Tagging In Posts
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['everyone', 'following', 'nobody'] as const).map(opt => (
                    <button
                      key={opt}
                      onClick={() => actions.updateSettings({ allowTagging: opt })}
                      className={`p-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                        settings.allowTagging === opt
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Push & In-App Notifications</h3>

              <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/5">
                <div>
                  <p className="text-xs font-bold text-white">Enable All Notifications</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Receive alerts for likes, comments, mentions, and direct messages.
                  </p>
                </div>
                <button
                  onClick={handleToggleNotifications}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 shrink-0 ${
                    settings.notificationsEnabled ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Blocked & Muted Accounts Section */}
          {activeSection === 'blocked' && (
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-white">Blocked Accounts</h3>
              {blockedUsers.length === 0 ? (
                <p className="text-xs text-slate-500 py-3">You haven't blocked any accounts.</p>
              ) : (
                <div className="space-y-2">
                  {blockedUsers.map(u => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl"
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar src={u.avatar} size="sm" />
                        <div>
                          <p className="text-xs font-semibold text-white">{u.displayName}</p>
                          <p className="text-[11px] text-slate-400">@{u.username}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          actions.unblockUser(u.id);
                          toast('Unblocked', `Unblocked @${u.username}`, 'info');
                        }}
                        className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white"
                      >
                        Unblock
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <h3 className="text-sm font-bold text-white pt-3 border-t border-white/5">
                Muted Accounts
              </h3>
              {mutedUsers.length === 0 ? (
                <p className="text-xs text-slate-500 py-3">You haven't muted any creators.</p>
              ) : (
                <div className="space-y-2">
                  {mutedUsers.map(u => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl"
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar src={u.avatar} size="sm" />
                        <div>
                          <p className="text-xs font-semibold text-white">{u.displayName}</p>
                          <p className="text-[11px] text-slate-400">@{u.username}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => actions.unmuteUser(u.id)}
                        className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white"
                      >
                        Unmute
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
