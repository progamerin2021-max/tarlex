import React, { useState, useEffect } from 'react';
import { useSocialStore } from './store/socialStore';
import { ToastProvider, useToast } from './components/common/Toast';
import { DesktopSidebar } from './components/navigation/DesktopSidebar';
import { MobileHeader } from './components/navigation/MobileHeader';
import { MobileBottomNav } from './components/navigation/MobileBottomNav';
import { StoryTray } from './components/feed/StoryTray';
import { PostCard } from './components/feed/PostCard';
import { CommentSheetModal } from './components/comments/CommentSheetModal';
import { StoryViewerModal } from './components/stories/StoryViewerModal';
import { StoryCreatorModal } from './components/stories/StoryCreatorModal';
import { CreatePostModal } from './components/create/CreatePostModal';
import { PostDetailModal } from './components/feed/PostDetailModal';
import { ReelsFeed } from './components/reels/ReelsFeed';
import { ExploreGrid } from './components/explore/ExploreGrid';
import { ConversationsList } from './components/chat/ConversationsList';
import { ChatWindow } from './components/chat/ChatWindow';
import { NotificationList } from './components/notifications/NotificationList';
import { ProfileHeader } from './components/profile/ProfileHeader';
import { ProfileTabs } from './components/profile/ProfileTabs';
import { EditProfileModal } from './components/profile/EditProfileModal';
import { FollowListModal } from './components/profile/FollowListModal';
import { SettingsView } from './components/settings/SettingsView';
import { SavedPostsView } from './components/saved/SavedPostsView';
import { HashtagView } from './components/feed/HashtagView';
import { AuthView } from './components/auth/AuthView';
import { Post, Reel } from './types';
import { Sparkles, TrendingUp, Compass, Plus, Users } from 'lucide-react';
import { Avatar } from './components/common/Avatar';

function MainApp() {
  const {
    currentUser,
    isAuthenticated,
    posts,
    reels,
    users,
    followingIds,
    conversations,
    actions,
  } = useSocialStore();

  // Navigation state
  const [currentTab, setCurrentTab] = useState<'home' | 'explore' | 'reels' | 'messages' | 'notifications' | 'profile' | 'settings' | 'saved' | 'hashtag' | 'login'>('home');
  const [routeParam, setRouteParam] = useState<string>('');

  // Active Modals & Selected items
  const [activeStoryUser, setActiveStoryUser] = useState<string | null>(null);
  const [showStoryCreator, setShowStoryCreator] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPostCommentsId, setSelectedPostCommentsId] = useState<string | null>(null);
  const [selectedPostDetail, setSelectedPostDetail] = useState<Post | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(conversations[0]?.id || null);

  // Profile modal states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [followListModalState, setFollowListModalState] = useState<{
    isOpen: boolean;
    title: string;
    userIds: string[];
  }>({ isOpen: false, title: '', userIds: [] });

  // Home feed filter: Following vs For You
  const [feedFilter, setFeedFilter] = useState<'forYou' | 'following'>('forYou');

  // Handle URL hash routing or popstate
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (!hash) return;
      const parts = hash.split('/');
      const tab = parts[0];
      const param = parts[1] || '';

      if (['home', 'explore', 'reels', 'messages', 'notifications', 'profile', 'settings', 'saved', 'hashtag', 'login'].includes(tab)) {
        setCurrentTab(tab as any);
        setRouteParam(param);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateTo = (tab: string, param: string = '') => {
    setCurrentTab(tab as any);
    setRouteParam(param);
    window.location.hash = `#/${tab}${param ? '/' + param : ''}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Direct Message with AI Copilot
  const handleOpenCopilot = () => {
    const conv = actions.getOrCreateConversation('user_tarlex_ai');
    setActiveConversationId(conv.id);
    navigateTo('messages');
  };

  // Filtered Home Posts
  const homePosts = posts.filter(post => {
    if (feedFilter === 'following') {
      return followingIds.includes(post.userId) || post.userId === currentUser?.id;
    }
    return true; // For You includes recommended
  });

  // Profile user resolution
  const profileUsername = (currentTab === 'profile' ? routeParam : '') || currentUser?.username;
  const profileUser = users.find(u => u.username.toLowerCase() === profileUsername?.toLowerCase()) || currentUser;
  const profilePosts = posts.filter(p => p.userId === profileUser?.id);
  const profileReels = reels.filter(r => r.userId === profileUser?.id);
  const userSavedPosts = posts.filter(p => p.isSaved);

  // Suggested users for right sidebar
  const suggestedUsers = users.filter(
    u => u.id !== currentUser?.id && !followingIds.includes(u.id)
  );

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col md:flex-row">
      {/* Desktop Left Sidebar */}
      <DesktopSidebar
        currentTab={currentTab}
        onNavigate={navigateTo}
        onOpenCreate={() => setShowCreatePost(true)}
        onOpenCopilot={handleOpenCopilot}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        {/* Mobile Header */}
        <MobileHeader
          onNavigate={navigateTo}
          onOpenCopilot={handleOpenCopilot}
        />

        <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 pt-3 sm:pt-6">
          {/* HOME FEED TAB */}
          {currentTab === 'home' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Center Feed Column */}
              <div className="lg:col-span-2 max-w-xl mx-auto w-full space-y-4">
                {/* Stories Tray */}
                <StoryTray
                  onOpenStory={username => setActiveStoryUser(username)}
                  onOpenCreateStory={() => setShowStoryCreator(true)}
                />

                {/* Feed Segment Filter: For You vs Following */}
                <div className="flex items-center justify-between bg-[#10141e] border border-white/5 p-1 rounded-2xl">
                  <button
                    onClick={() => setFeedFilter('forYou')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      feedFilter === 'forYou'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Recommended Feed
                  </button>
                  <button
                    onClick={() => setFeedFilter('following')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      feedFilter === 'following'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Following Feed
                  </button>
                </div>

                {/* Posts Feed */}
                {homePosts.length === 0 ? (
                  <div className="py-20 text-center bg-[#10141e] border border-white/5 rounded-3xl p-8 space-y-3">
                    <Compass className="w-12 h-12 mx-auto text-indigo-400 opacity-80" />
                    <p className="text-sm font-bold text-white">Your Feed is Quiet</p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Explore creators to follow or create your first post on TarleX!
                    </p>
                    <button
                      onClick={() => setFeedFilter('forYou')}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Switch to Recommended
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {homePosts.map(post => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onOpenComments={postId => setSelectedPostCommentsId(postId)}
                        onNavigateUser={username => navigateTo('profile', username)}
                        onNavigateHashtag={tag => navigateTo('hashtag', tag)}
                        onOpenStory={username => setActiveStoryUser(username)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop Right Sidebar: Suggested Creators & Copilot Widget */}
              <div className="hidden lg:block space-y-6 sticky top-6 h-fit">
                {/* User mini profile */}
                <div className="flex items-center justify-between p-3.5 bg-[#10141e] border border-white/5 rounded-2xl">
                  <div
                    onClick={() => navigateTo('profile', currentUser?.username)}
                    className="flex items-center gap-3 cursor-pointer min-w-0"
                  >
                    <Avatar src={currentUser?.avatar} size="md" isVerified={currentUser?.isVerified} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate hover:text-indigo-300">
                        {currentUser?.displayName}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">@{currentUser?.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigateTo('settings')}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Settings
                  </button>
                </div>

                {/* TarleX Copilot Creative AI Prompter */}
                <div className="p-4 bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-slate-900 border border-indigo-500/30 rounded-2xl space-y-3 shadow-sm">
                  <div className="flex items-center gap-2 text-indigo-300">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">
                      TarleX Copilot · AI
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Need instant viral hooks, hashtag strategy, or feedback on post ideas? Chat with your AI creative partner.
                  </p>
                  <button
                    onClick={handleOpenCopilot}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Open Copilot Chat
                  </button>
                </div>

                {/* Suggested Creators */}
                {suggestedUsers.length > 0 && (
                  <div className="p-4 bg-[#10141e] border border-white/5 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Suggested For You
                      </h3>
                      <button
                        onClick={() => navigateTo('explore')}
                        className="text-[11px] text-indigo-400 hover:underline font-semibold"
                      >
                        See All
                      </button>
                    </div>

                    <div className="space-y-3">
                      {suggestedUsers.slice(0, 4).map(user => (
                        <div key={user.id} className="flex items-center justify-between">
                          <div
                            onClick={() => navigateTo('profile', user.username)}
                            className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                          >
                            <Avatar src={user.avatar} size="sm" isVerified={user.isVerified} />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate hover:text-indigo-300">
                                {user.displayName}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">@{user.username}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => actions.followUser(user.id)}
                            className="text-xs font-bold text-indigo-400 hover:text-white px-2 py-1 rounded-lg hover:bg-indigo-600/20 transition-colors"
                          >
                            Follow
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EXPLORE TAB */}
          {currentTab === 'explore' && (
            <ExploreGrid
              onSelectPost={post => setSelectedPostDetail(post)}
              onSelectReel={() => navigateTo('reels')}
              onNavigateUser={username => navigateTo('profile', username)}
              onNavigateHashtag={tag => navigateTo('hashtag', tag)}
            />
          )}

          {/* REELS TAB */}
          {currentTab === 'reels' && (
            <ReelsFeed
              onNavigateUser={username => navigateTo('profile', username)}
              onNavigateHashtag={tag => navigateTo('hashtag', tag)}
            />
          )}

          {/* MESSAGES TAB */}
          {currentTab === 'messages' && (
            <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-6.5rem)] rounded-3xl overflow-hidden border border-white/5 bg-[#0b0e14] shadow-2xl">
              {/* Left Inbox List */}
              <div className={`h-full ${activeConversationId ? 'hidden md:block' : 'block'} md:col-span-1`}>
                <ConversationsList
                  activeConversationId={activeConversationId}
                  onSelectConversation={id => setActiveConversationId(id)}
                  onStartNewChat={() => {
                    const firstOther = users.find(u => u.id !== currentUser?.id);
                    if (firstOther) {
                      const conv = actions.getOrCreateConversation(firstOther.id);
                      setActiveConversationId(conv.id);
                    }
                  }}
                />
              </div>

              {/* Right Chat Stream */}
              <div className={`h-full ${!activeConversationId ? 'hidden md:flex' : 'flex'} md:col-span-2 flex-col`}>
                {activeConversationId ? (
                  <ChatWindow
                    conversationId={activeConversationId}
                    onBackMobile={() => setActiveConversationId(null)}
                    onNavigateUser={username => navigateTo('profile', username)}
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center bg-[#0d111a]">
                    <Sparkles className="w-12 h-12 text-indigo-400 mb-2 opacity-60" />
                    <p className="text-sm font-bold text-white">Your Direct Messages</p>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">
                      Select a conversation on the left or talk to TarleX Copilot.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {currentTab === 'notifications' && (
            <NotificationList
              onNavigateUser={username => navigateTo('profile', username)}
              onSelectPost={postId => {
                const target = posts.find(p => p.id === postId);
                if (target) setSelectedPostDetail(target);
              }}
            />
          )}

          {/* USER PROFILE TAB */}
          {currentTab === 'profile' && profileUser && (
            <div className="space-y-6">
              <ProfileHeader
                user={profileUser}
                onOpenEditProfile={() => setShowEditProfile(true)}
                onOpenFollowers={() => {
                  setFollowListModalState({
                    isOpen: true,
                    title: 'Followers',
                    userIds: users.filter(u => u.id !== profileUser.id).map(u => u.id),
                  });
                }}
                onOpenFollowing={() => {
                  setFollowListModalState({
                    isOpen: true,
                    title: 'Following',
                    userIds: followingIds,
                  });
                }}
                onStartMessage={userId => {
                  const conv = actions.getOrCreateConversation(userId);
                  setActiveConversationId(conv.id);
                  navigateTo('messages');
                }}
                onOpenSettings={() => navigateTo('settings')}
              />

              <ProfileTabs
                posts={profilePosts}
                reels={profileReels}
                savedPosts={userSavedPosts}
                isOwner={profileUser.id === currentUser?.id}
                onSelectPost={post => setSelectedPostDetail(post)}
                onSelectReel={() => navigateTo('reels')}
              />
            </div>
          )}

          {/* SETTINGS TAB */}
          {currentTab === 'settings' && (
            <SettingsView
              onOpenEditProfile={() => setShowEditProfile(true)}
              onLogout={() => navigateTo('login')}
            />
          )}

          {/* SAVED POSTS TAB */}
          {currentTab === 'saved' && (
            <SavedPostsView
              onSelectPost={post => setSelectedPostDetail(post)}
            />
          )}

          {/* HASHTAG TAB */}
          {currentTab === 'hashtag' && (
            <HashtagView
              tag={routeParam || 'NordicDesign'}
              onBack={() => navigateTo('explore')}
              onSelectPost={post => setSelectedPostDetail(post)}
            />
          )}

          {/* LOGIN / SIGNUP VIEW */}
          {currentTab === 'login' && (
            <AuthView onSuccess={() => navigateTo('home')} />
          )}
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav
          currentTab={currentTab}
          onNavigate={navigateTo}
          onOpenCreate={() => setShowCreatePost(true)}
        />
      </div>

      {/* GLOBAL MODALS */}
      {/* 1. Comments Sheet Modal */}
      {selectedPostCommentsId && (
        <CommentSheetModal
          isOpen={!!selectedPostCommentsId}
          onClose={() => setSelectedPostCommentsId(null)}
          postId={selectedPostCommentsId}
          onNavigateUser={username => {
            setSelectedPostCommentsId(null);
            navigateTo('profile', username);
          }}
        />
      )}

      {/* 2. Story Viewer Modal */}
      {activeStoryUser && (
        <StoryViewerModal
          isOpen={!!activeStoryUser}
          onClose={() => setActiveStoryUser(null)}
          initialUsername={activeStoryUser}
          onNavigateUser={username => {
            setActiveStoryUser(null);
            navigateTo('profile', username);
          }}
        />
      )}

      {/* 3. Story Creator Modal */}
      <StoryCreatorModal
        isOpen={showStoryCreator}
        onClose={() => setShowStoryCreator(false)}
      />

      {/* 4. Create Post Modal */}
      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
      />

      {/* 5. Post Detail Modal */}
      <PostDetailModal
        isOpen={!!selectedPostDetail}
        onClose={() => setSelectedPostDetail(null)}
        post={selectedPostDetail}
        onNavigateUser={username => {
          setSelectedPostDetail(null);
          navigateTo('profile', username);
        }}
        onNavigateHashtag={tag => {
          setSelectedPostDetail(null);
          navigateTo('hashtag', tag);
        }}
      />

      {/* 6. Edit Profile Modal */}
      {currentUser && (
        <EditProfileModal
          isOpen={showEditProfile}
          onClose={() => setShowEditProfile(false)}
          user={currentUser}
        />
      )}

      {/* 7. Follow List Modal */}
      <FollowListModal
        isOpen={followListModalState.isOpen}
        onClose={() => setFollowListModalState(prev => ({ ...prev, isOpen: false }))}
        title={followListModalState.title}
        userIds={followListModalState.userIds}
        onNavigateUser={username => {
          setFollowListModalState(prev => ({ ...prev, isOpen: false }));
          navigateTo('profile', username);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
