export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  website?: string;
  isVerified?: boolean;
  isPrivate?: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: string;
}

export interface PostMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  aspectRatio?: '1:1' | '4:5' | '16:9';
  altText?: string;
}

export interface Post {
  id: string;
  userId: string;
  caption: string;
  media: PostMedia[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  location?: string;
  taggedUsers?: string[];
  hashtags: string[];
  createdAt: string;
  isLiked?: boolean;
  isSaved?: boolean;
  visibility: 'public' | 'followers' | 'private';
}

export interface CommentReply {
  id: string;
  commentId: string;
  userId: string;
  text: string;
  likesCount: number;
  isLiked?: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  text: string;
  likesCount: number;
  isLiked?: boolean;
  createdAt: string;
  replies?: CommentReply[];
}

export interface StoryItem {
  id: string;
  userId: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  durationSeconds?: number;
  createdAt: string;
  expiresAt: string;
  caption?: string;
  viewersCount: number;
  isViewed?: boolean;
}

export interface UserStoryGroup {
  user: User;
  stories: StoryItem[];
  hasUnseen: boolean;
}

export interface Reel {
  id: string;
  userId: string;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  audioName: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  hashtags: string[];
  createdAt: string;
}

export interface Notification {
  id: string;
  recipientId: string;
  senderId: string;
  type: 'like' | 'comment' | 'follow' | 'follow_request' | 'reply' | 'reaction' | 'mention';
  postId?: string;
  commentId?: string;
  reelId?: string;
  text?: string;
  isRead: boolean;
  createdAt: string;
}

export interface MessageReaction {
  userId: string;
  emoji: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  replyToMessageId?: string;
  replyToText?: string;
  reactions: MessageReaction[];
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage?: Message;
  updatedAt: string;
  isAiBot?: boolean;
}

export interface SavedCollection {
  id: string;
  userId: string;
  name: string;
  coverImage?: string;
  postIds: string[];
  createdAt: string;
}

export interface FollowRelation {
  followerId: string;
  followingId: string;
  status: 'active' | 'pending';
  createdAt: string;
}

export interface UserSettings {
  isPrivateAccount: boolean;
  allowTagging: 'everyone' | 'following' | 'nobody';
  allowComments: 'everyone' | 'following' | 'nobody';
  notificationsEnabled: boolean;
  theme: 'dark' | 'light';
  language: string;
  soundEffects: boolean;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'info';
}
