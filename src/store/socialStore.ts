import { useState, useEffect } from 'react';
import {
  User, Post, Reel, StoryItem, Comment, Notification,
  Conversation, Message, SavedCollection, UserSettings
} from '../types';
import {
  SEED_USERS, SEED_POSTS, SEED_REELS, SEED_STORIES,
  SEED_COMMENTS, SEED_NOTIFICATIONS, SEED_CONVERSATIONS,
  SEED_MESSAGES, SEED_COLLECTIONS, CURRENT_USER_ID
} from '../data/seedData';

const STORAGE_KEY_PREFIX = 'tarlex_app_';

function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.warn('Storage read error', e);
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage write error', e);
  }
}

// Initial state construction
interface AppState {
  users: User[];
  currentUserId: string;
  posts: Post[];
  reels: Reel[];
  stories: StoryItem[];
  comments: Comment[];
  notifications: Notification[];
  conversations: Conversation[];
  messages: Message[];
  collections: SavedCollection[];
  followingIds: string[];
  pendingRequests: { requesterId: string; targetId: string }[];
  blockedUserIds: string[];
  mutedUserIds: string[];
  hiddenPostIds: string[];
  settings: UserSettings;
}

// Initialize initial following
const defaultFollowing = ['user_elena', 'user_kai', 'user_maya', 'user_tarlex_ai'];

const initialState: AppState = {
  users: getStorage('users', SEED_USERS),
  currentUserId: getStorage('currentUserId', CURRENT_USER_ID),
  posts: getStorage('posts', SEED_POSTS),
  reels: getStorage('reels', SEED_REELS),
  stories: getStorage('stories', SEED_STORIES),
  comments: getStorage('comments', SEED_COMMENTS),
  notifications: getStorage('notifications', SEED_NOTIFICATIONS),
  conversations: getStorage('conversations', SEED_CONVERSATIONS),
  messages: getStorage('messages', SEED_MESSAGES),
  collections: getStorage('collections', SEED_COLLECTIONS),
  followingIds: getStorage('followingIds', defaultFollowing),
  pendingRequests: getStorage('pendingRequests', []),
  blockedUserIds: getStorage('blockedUserIds', []),
  mutedUserIds: getStorage('mutedUserIds', []),
  hiddenPostIds: getStorage('hiddenPostIds', []),
  settings: getStorage('settings', {
    isPrivateAccount: false,
    allowTagging: 'everyone',
    allowComments: 'everyone',
    notificationsEnabled: true,
    theme: 'dark',
    language: 'English',
    soundEffects: true,
  }),
};

// Global Store Listeners
let state: AppState = { ...initialState };
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach(fn => fn());
}

function updateState(updater: (prev: AppState) => AppState) {
  state = updater(state);
  // Persist modified keys
  setStorage('users', state.users);
  setStorage('currentUserId', state.currentUserId);
  setStorage('posts', state.posts);
  setStorage('reels', state.reels);
  setStorage('stories', state.stories);
  setStorage('comments', state.comments);
  setStorage('notifications', state.notifications);
  setStorage('conversations', state.conversations);
  setStorage('messages', state.messages);
  setStorage('collections', state.collections);
  setStorage('followingIds', state.followingIds);
  setStorage('pendingRequests', state.pendingRequests);
  setStorage('blockedUserIds', state.blockedUserIds);
  setStorage('mutedUserIds', state.mutedUserIds);
  setStorage('hiddenPostIds', state.hiddenPostIds);
  setStorage('settings', state.settings);
  notify();
}

// Custom Hook to consume Store
export function useSocialStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handler = () => setTick(t => t + 1);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  const currentUser = state.users.find(u => u.id === state.currentUserId) || state.users[0];

  // Actions
  const actions = {
    // Auth actions
    login: (username: string) => {
      let existing = state.users.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (!existing) {
        // Create quick account if non-existent
        const newUser: User = {
          id: 'user_' + Date.now(),
          username: username.toLowerCase().replace(/\s+/g, '_'),
          displayName: username,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
          bio: 'Hey there! Exploring TarleX 🚀',
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          createdAt: new Date().toISOString(),
        };
        updateState(s => ({
          ...s,
          users: [...s.users, newUser],
          currentUserId: newUser.id,
        }));
      } else {
        updateState(s => ({ ...s, currentUserId: existing.id }));
      }
    },

    signup: (data: { username: string; displayName: string; email?: string; bio?: string }) => {
      const newUser: User = {
        id: 'user_' + Date.now(),
        username: data.username.toLowerCase().replace(/\s+/g, '_'),
        displayName: data.displayName,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
        bio: data.bio || 'New member of TarleX! ✨',
        followersCount: 0,
        followingCount: 1,
        postsCount: 0,
        createdAt: new Date().toISOString(),
      };
      updateState(s => ({
        ...s,
        users: [...s.users, newUser],
        currentUserId: newUser.id,
        followingIds: [...s.followingIds, 'user_tarlex_ai'],
      }));
    },

    logout: () => {
      updateState(s => ({ ...s, currentUserId: '' }));
    },

    switchAccount: (userId: string) => {
      if (state.users.some(u => u.id === userId)) {
        updateState(s => ({ ...s, currentUserId: userId }));
      }
    },

    updateProfile: (updates: Partial<User>) => {
      updateState(s => ({
        ...s,
        users: s.users.map(u => (u.id === s.currentUserId ? { ...u, ...updates } : u)),
      }));
    },

    // Follow System
    followUser: (targetUserId: string) => {
      const target = state.users.find(u => u.id === targetUserId);
      if (!target) return;

      if (target.isPrivate) {
        // Create follow request
        if (!state.pendingRequests.some(r => r.requesterId === state.currentUserId && r.targetId === targetUserId)) {
          const newReq = { requesterId: state.currentUserId, targetId: targetUserId };
          const notif: Notification = {
            id: 'notif_' + Date.now(),
            recipientId: targetUserId,
            senderId: state.currentUserId,
            type: 'follow_request',
            isRead: false,
            createdAt: new Date().toISOString(),
          };
          updateState(s => ({
            ...s,
            pendingRequests: [...s.pendingRequests, newReq],
            notifications: [notif, ...s.notifications],
          }));
        }
      } else {
        // Follow directly
        if (!state.followingIds.includes(targetUserId)) {
          const notif: Notification = {
            id: 'notif_' + Date.now(),
            recipientId: targetUserId,
            senderId: state.currentUserId,
            type: 'follow',
            isRead: false,
            createdAt: new Date().toISOString(),
          };
          updateState(s => ({
            ...s,
            followingIds: [...s.followingIds, targetUserId],
            users: s.users.map(u => {
              if (u.id === targetUserId) return { ...u, followersCount: u.followersCount + 1 };
              if (u.id === s.currentUserId) return { ...u, followingCount: u.followingCount + 1 };
              return u;
            }),
            notifications: [notif, ...s.notifications],
          }));
        }
      }
    },

    unfollowUser: (targetUserId: string) => {
      updateState(s => ({
        ...s,
        followingIds: s.followingIds.filter(id => id !== targetUserId),
        pendingRequests: s.pendingRequests.filter(r => !(r.requesterId === s.currentUserId && r.targetId === targetUserId)),
        users: s.users.map(u => {
          if (u.id === targetUserId && s.followingIds.includes(targetUserId)) {
            return { ...u, followersCount: Math.max(0, u.followersCount - 1) };
          }
          if (u.id === s.currentUserId && s.followingIds.includes(targetUserId)) {
            return { ...u, followingCount: Math.max(0, u.followingCount - 1) };
          }
          return u;
        }),
      }));
    },

    acceptFollowRequest: (requesterId: string) => {
      updateState(s => ({
        ...s,
        pendingRequests: s.pendingRequests.filter(r => !(r.requesterId === requesterId && r.targetId === s.currentUserId)),
        users: s.users.map(u => {
          if (u.id === s.currentUserId) return { ...u, followersCount: u.followersCount + 1 };
          if (u.id === requesterId) return { ...u, followingCount: u.followingCount + 1 };
          return u;
        }),
        notifications: s.notifications.map(n => 
          n.senderId === requesterId && n.type === 'follow_request' ? { ...n, isRead: true } : n
        ),
      }));
    },

    rejectFollowRequest: (requesterId: string) => {
      updateState(s => ({
        ...s,
        pendingRequests: s.pendingRequests.filter(r => !(r.requesterId === requesterId && r.targetId === s.currentUserId)),
      }));
    },

    // Post Actions
    createPost: (postData: {
      caption: string;
      mediaUrls: { url: string; type: 'image' | 'video'; aspectRatio?: '1:1' | '4:5' | '16:9' }[];
      location?: string;
      visibility?: 'public' | 'followers' | 'private';
      hashtags?: string[];
      taggedUsers?: string[];
    }) => {
      // Extract hashtags if not provided
      const detectedTags = postData.caption.match(/#[a-zA-Z0-9_]+/g) || [];
      const tags = Array.from(new Set([...(postData.hashtags || []), ...detectedTags]));

      const newPost: Post = {
        id: 'post_' + Date.now(),
        userId: state.currentUserId,
        caption: postData.caption,
        media: postData.mediaUrls.map((m, idx) => ({
          id: `media_${Date.now()}_${idx}`,
          type: m.type,
          url: m.url,
          aspectRatio: m.aspectRatio || '4:5',
        })),
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        savesCount: 0,
        location: postData.location,
        taggedUsers: postData.taggedUsers || [],
        hashtags: tags,
        createdAt: new Date().toISOString(),
        isLiked: false,
        isSaved: false,
        visibility: postData.visibility || 'public',
      };

      updateState(s => ({
        ...s,
        posts: [newPost, ...s.posts],
        users: s.users.map(u => (u.id === s.currentUserId ? { ...u, postsCount: u.postsCount + 1 } : u)),
      }));

      return newPost;
    },

    deletePost: (postId: string) => {
      const target = state.posts.find(p => p.id === postId);
      if (!target || target.userId !== state.currentUserId) return;

      updateState(s => ({
        ...s,
        posts: s.posts.filter(p => p.id !== postId),
        comments: s.comments.filter(c => c.postId !== postId),
        users: s.users.map(u => (u.id === s.currentUserId ? { ...u, postsCount: Math.max(0, u.postsCount - 1) } : u)),
      }));
    },

    toggleLikePost: (postId: string) => {
      const post = state.posts.find(p => p.id === postId);
      if (!post) return;
      const isCurrentlyLiked = !!post.isLiked;
      const nextLiked = !isCurrentlyLiked;
      const diff = nextLiked ? 1 : -1;

      let newNotifications = [...state.notifications];
      if (nextLiked && post.userId !== state.currentUserId) {
        newNotifications = [
          {
            id: 'notif_' + Date.now(),
            recipientId: post.userId,
            senderId: state.currentUserId,
            type: 'like',
            postId,
            isRead: false,
            createdAt: new Date().toISOString(),
          },
          ...newNotifications,
        ];
      }

      updateState(s => ({
        ...s,
        posts: s.posts.map(p =>
          p.id === postId
            ? { ...p, isLiked: nextLiked, likesCount: Math.max(0, p.likesCount + diff) }
            : p
        ),
        notifications: newNotifications,
      }));
    },

    toggleSavePost: (postId: string) => {
      const post = state.posts.find(p => p.id === postId);
      if (!post) return;
      const nextSaved = !post.isSaved;
      const diff = nextSaved ? 1 : -1;

      updateState(s => ({
        ...s,
        posts: s.posts.map(p =>
          p.id === postId
            ? { ...p, isSaved: nextSaved, savesCount: Math.max(0, p.savesCount + diff) }
            : p
        ),
      }));
    },

    sharePost: (postId: string) => {
      updateState(s => ({
        ...s,
        posts: s.posts.map(p => (p.id === postId ? { ...p, sharesCount: p.sharesCount + 1 } : p)),
      }));
    },

    hidePost: (postId: string) => {
      updateState(s => ({
        ...s,
        hiddenPostIds: [...s.hiddenPostIds, postId],
      }));
    },

    // Comments
    addComment: (postId: string, text: string) => {
      if (!text.trim()) return;
      const post = state.posts.find(p => p.id === postId);
      if (!post) return;

      const newComment: Comment = {
        id: 'comm_' + Date.now(),
        postId,
        userId: state.currentUserId,
        text: text.trim(),
        likesCount: 0,
        isLiked: false,
        createdAt: new Date().toISOString(),
        replies: [],
      };

      let newNotifs = [...state.notifications];
      if (post.userId !== state.currentUserId) {
        newNotifs = [
          {
            id: 'notif_' + Date.now(),
            recipientId: post.userId,
            senderId: state.currentUserId,
            type: 'comment',
            postId,
            text: text.slice(0, 80),
            isRead: false,
            createdAt: new Date().toISOString(),
          },
          ...newNotifs,
        ];
      }

      updateState(s => ({
        ...s,
        comments: [...s.comments, newComment],
        posts: s.posts.map(p => (p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p)),
        notifications: newNotifs,
      }));
    },

    deleteComment: (commentId: string) => {
      const comment = state.comments.find(c => c.id === commentId);
      if (!comment || comment.userId !== state.currentUserId) return;

      updateState(s => ({
        ...s,
        comments: s.comments.filter(c => c.id !== commentId),
        posts: s.posts.map(p => (p.id === comment.postId ? { ...p, commentsCount: Math.max(0, p.commentsCount - 1) } : p)),
      }));
    },

    toggleLikeComment: (commentId: string) => {
      updateState(s => ({
        ...s,
        comments: s.comments.map(c => {
          if (c.id === commentId) {
            const nextLiked = !c.isLiked;
            return {
              ...c,
              isLiked: nextLiked,
              likesCount: Math.max(0, c.likesCount + (nextLiked ? 1 : -1)),
            };
          }
          return c;
        }),
      }));
    },

    addCommentReply: (commentId: string, text: string) => {
      if (!text.trim()) return;
      const targetComment = state.comments.find(c => c.id === commentId);
      if (!targetComment) return;

      const newReply = {
        id: 'reply_' + Date.now(),
        commentId,
        userId: state.currentUserId,
        text: text.trim(),
        likesCount: 0,
        isLiked: false,
        createdAt: new Date().toISOString(),
      };

      let newNotifs = [...state.notifications];
      if (targetComment.userId !== state.currentUserId) {
        newNotifs = [
          {
            id: 'notif_' + Date.now(),
            recipientId: targetComment.userId,
            senderId: state.currentUserId,
            type: 'reply',
            postId: targetComment.postId,
            commentId,
            text: text.slice(0, 80),
            isRead: false,
            createdAt: new Date().toISOString(),
          },
          ...newNotifs,
        ];
      }

      updateState(s => ({
        ...s,
        comments: s.comments.map(c =>
          c.id === commentId ? { ...c, replies: [...(c.replies || []), newReply] } : c
        ),
        posts: s.posts.map(p => (p.id === targetComment.postId ? { ...p, commentsCount: p.commentsCount + 1 } : p)),
        notifications: newNotifs,
      }));
    },

    // Stories
    addStory: (storyData: { mediaUrl: string; mediaType: 'image' | 'video'; caption?: string }) => {
      const newStory: StoryItem = {
        id: 'story_' + Date.now(),
        userId: state.currentUserId,
        mediaUrl: storyData.mediaUrl,
        mediaType: storyData.mediaType,
        caption: storyData.caption,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(), // 24h
        viewersCount: 0,
        isViewed: false,
      };

      updateState(s => ({
        ...s,
        stories: [newStory, ...s.stories],
      }));
    },

    markStoryViewed: (storyId: string) => {
      updateState(s => ({
        ...s,
        stories: s.stories.map(st => (st.id === storyId ? { ...st, isViewed: true } : st)),
      }));
    },

    reactToStory: (storyId: string, emoji: string) => {
      const story = state.stories.find(st => st.id === storyId);
      if (!story) return;

      // Add direct message with reaction
      const targetUserId = story.userId;
      if (targetUserId === state.currentUserId) return;

      // Find or create conversation
      let conv = state.conversations.find(c =>
        c.participantIds.includes(state.currentUserId) && c.participantIds.includes(targetUserId)
      );

      const convId = conv ? conv.id : 'conv_' + Date.now();
      const newMsg: Message = {
        id: 'msg_' + Date.now(),
        conversationId: convId,
        senderId: state.currentUserId,
        text: `Reacted to story: ${emoji}`,
        mediaUrl: story.mediaUrl,
        reactions: [],
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      const notif: Notification = {
        id: 'notif_' + Date.now(),
        recipientId: targetUserId,
        senderId: state.currentUserId,
        type: 'reaction',
        text: emoji,
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      updateState(s => {
        let updatedConvs = [...s.conversations];
        if (!conv) {
          updatedConvs.unshift({
            id: convId,
            participantIds: [state.currentUserId, targetUserId],
            lastMessage: newMsg,
            updatedAt: new Date().toISOString(),
          });
        } else {
          updatedConvs = updatedConvs.map(c =>
            c.id === convId ? { ...c, lastMessage: newMsg, updatedAt: new Date().toISOString() } : c
          );
        }

        return {
          ...s,
          conversations: updatedConvs,
          messages: [...s.messages, newMsg],
          notifications: [notif, ...s.notifications],
        };
      });
    },

    // Reels
    toggleLikeReel: (reelId: string) => {
      const reel = state.reels.find(r => r.id === reelId);
      if (!reel) return;
      const nextLiked = !reel.isLiked;
      const diff = nextLiked ? 1 : -1;

      updateState(s => ({
        ...s,
        reels: s.reels.map(r =>
          r.id === reelId
            ? { ...r, isLiked: nextLiked, likesCount: Math.max(0, r.likesCount + diff) }
            : r
        ),
      }));
    },

    toggleSaveReel: (reelId: string) => {
      updateState(s => ({
        ...s,
        reels: s.reels.map(r => (r.id === reelId ? { ...r, isSaved: !r.isSaved } : r)),
      }));
    },

    // Direct Messages
    getOrCreateConversation: (otherUserId: string) => {
      let conv = state.conversations.find(c =>
        c.participantIds.includes(state.currentUserId) && c.participantIds.includes(otherUserId)
      );

      if (!conv) {
        const isAiBot = otherUserId === 'user_tarlex_ai';
        const newConv: Conversation = {
          id: 'conv_' + Date.now(),
          participantIds: [state.currentUserId, otherUserId],
          updatedAt: new Date().toISOString(),
          isAiBot,
        };
        updateState(s => ({
          ...s,
          conversations: [newConv, ...s.conversations],
        }));
        return newConv;
      }
      return conv;
    },

    sendMessage: async (conversationId: string, text: string, mediaUrl?: string, replyToMessage?: Message) => {
      if (!text.trim() && !mediaUrl) return;

      const newMsg: Message = {
        id: 'msg_' + Date.now(),
        conversationId,
        senderId: state.currentUserId,
        text: text.trim(),
        mediaUrl,
        replyToMessageId: replyToMessage?.id,
        replyToText: replyToMessage?.text,
        reactions: [],
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      updateState(s => ({
        ...s,
        messages: [...s.messages, newMsg],
        conversations: s.conversations.map(c =>
          c.id === conversationId ? { ...c, lastMessage: newMsg, updatedAt: new Date().toISOString() } : c
        ),
      }));

      // Check if chatting with TarleX AI Bot
      const conv = state.conversations.find(c => c.id === conversationId);
      if (conv && conv.participantIds.includes('user_tarlex_ai')) {
        try {
          // Prepare chat history
          const convMsgs = state.messages
            .filter(m => m.conversationId === conversationId)
            .concat(newMsg)
            .map(m => ({
              role: m.senderId === 'user_tarlex_ai' ? 'model' : 'user',
              content: m.text,
            }));

          const res = await fetch('/api/gemini/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: convMsgs,
              modelType: text.toLowerCase().includes('think') || text.toLowerCase().includes('strategy') ? 'complex' : 'general',
              enableThinking: text.toLowerCase().includes('analyze') || text.toLowerCase().includes('deep'),
            }),
          });

          const data = await res.json();
          const aiReplyText = data.reply || "I'm here to help elevate your TarleX posts and creative vision!";

          const aiMsg: Message = {
            id: 'msg_ai_' + Date.now(),
            conversationId,
            senderId: 'user_tarlex_ai',
            text: aiReplyText,
            reactions: [],
            isRead: false,
            createdAt: new Date().toISOString(),
          };

          updateState(s => ({
            ...s,
            messages: [...s.messages, aiMsg],
            conversations: s.conversations.map(c =>
              c.id === conversationId ? { ...c, lastMessage: aiMsg, updatedAt: new Date().toISOString() } : c
            ),
          }));
        } catch (err) {
          console.error('Failed to get AI reply', err);
        }
      }
    },

    reactToMessage: (messageId: string, emoji: string) => {
      updateState(s => ({
        ...s,
        messages: s.messages.map(m => {
          if (m.id === messageId) {
            const existing = m.reactions.find(r => r.userId === s.currentUserId);
            let updatedReactions = [...m.reactions];
            if (existing) {
              if (existing.emoji === emoji) {
                // remove
                updatedReactions = updatedReactions.filter(r => r.userId !== s.currentUserId);
              } else {
                // update
                updatedReactions = updatedReactions.map(r =>
                  r.userId === s.currentUserId ? { ...r, emoji } : r
                );
              }
            } else {
              updatedReactions.push({ userId: s.currentUserId, emoji });
            }
            return { ...m, reactions: updatedReactions };
          }
          return m;
        }),
      }));
    },

    deleteMessage: (messageId: string) => {
      updateState(s => ({
        ...s,
        messages: s.messages.filter(m => m.id !== messageId),
      }));
    },

    markConversationRead: (conversationId: string) => {
      updateState(s => ({
        ...s,
        messages: s.messages.map(m =>
          m.conversationId === conversationId && m.senderId !== s.currentUserId
            ? { ...m, isRead: true }
            : m
        ),
      }));
    },

    // Notifications
    markNotificationRead: (notificationId: string) => {
      updateState(s => ({
        ...s,
        notifications: s.notifications.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        ),
      }));
    },

    markAllNotificationsRead: () => {
      updateState(s => ({
        ...s,
        notifications: s.notifications.map(n =>
          n.recipientId === s.currentUserId ? { ...n, isRead: true } : n
        ),
      }));
    },

    // Collections
    createCollection: (name: string, coverImage?: string) => {
      const newCol: SavedCollection = {
        id: 'col_' + Date.now(),
        userId: state.currentUserId,
        name,
        coverImage,
        postIds: [],
        createdAt: new Date().toISOString(),
      };
      updateState(s => ({
        ...s,
        collections: [...s.collections, newCol],
      }));
    },

    togglePostInCollection: (collectionId: string, postId: string) => {
      updateState(s => ({
        ...s,
        collections: s.collections.map(col => {
          if (col.id === collectionId) {
            const hasPost = col.postIds.includes(postId);
            const nextPostIds = hasPost
              ? col.postIds.filter(id => id !== postId)
              : [...col.postIds, postId];
            return { ...col, postIds: nextPostIds };
          }
          return col;
        }),
      }));
    },

    // Settings & Block/Report
    blockUser: (userId: string) => {
      if (userId === state.currentUserId) return;
      updateState(s => ({
        ...s,
        blockedUserIds: [...new Set([...s.blockedUserIds, userId])],
        followingIds: s.followingIds.filter(id => id !== userId),
      }));
    },

    unblockUser: (userId: string) => {
      updateState(s => ({
        ...s,
        blockedUserIds: s.blockedUserIds.filter(id => id !== userId),
      }));
    },

    muteUser: (userId: string) => {
      updateState(s => ({
        ...s,
        mutedUserIds: [...new Set([...s.mutedUserIds, userId])],
      }));
    },

    unmuteUser: (userId: string) => {
      updateState(s => ({
        ...s,
        mutedUserIds: s.mutedUserIds.filter(id => id !== userId),
      }));
    },

    updateSettings: (partial: Partial<UserSettings>) => {
      updateState(s => ({
        ...s,
        settings: { ...s.settings, ...partial },
      }));
    },

    reportUser: (userId: string, reason: string) => {
      console.log(`Reported user ${userId}: ${reason}`);
    },

    reportPost: (postId: string, reason: string) => {
      console.log(`Reported post ${postId}: ${reason}`);
    },
  };

  // Filtered views
  const visiblePosts = state.posts
    .filter(p => !state.hiddenPostIds.includes(p.id))
    .filter(p => !state.blockedUserIds.includes(p.userId));

  const unreadNotificationsCount = state.notifications.filter(
    n => n.recipientId === state.currentUserId && !n.isRead
  ).length;

  const unreadMessagesCount = state.messages.filter(
    m => m.senderId !== state.currentUserId && !m.isRead
  ).length;

  return {
    state,
    currentUser,
    isAuthenticated: !!state.currentUserId,
    posts: visiblePosts,
    reels: state.reels,
    stories: state.stories,
    users: state.users,
    comments: state.comments,
    notifications: state.notifications.filter(n => n.recipientId === state.currentUserId),
    conversations: state.conversations,
    messages: state.messages,
    collections: state.collections,
    followingIds: state.followingIds,
    pendingRequests: state.pendingRequests,
    blockedUserIds: state.blockedUserIds,
    mutedUserIds: state.mutedUserIds,
    settings: state.settings,
    unreadNotificationsCount,
    unreadMessagesCount,
    actions,
  };
}
