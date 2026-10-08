import React, { useState, useRef, useEffect } from 'react';
import {
  Heart, MessageCircle, Send, Bookmark, Music2,
  Volume2, VolumeX, Play, Pause, MoreVertical
} from 'lucide-react';
import { Reel } from '../../types';
import { useSocialStore } from '../../store/socialStore';
import { Avatar } from '../common/Avatar';
import { ShareModal } from '../feed/ShareModal';
import { CommentSheetModal } from '../comments/CommentSheetModal';

interface ReelItemProps {
  reel: Reel;
  isActive: boolean;
  onNavigateUser: (username: string) => void;
  onNavigateHashtag?: (tag: string) => void;
}

export const ReelItem: React.FC<ReelItemProps> = ({
  reel,
  isActive,
  onNavigateUser,
  onNavigateHashtag,
}) => {
  const { users, currentUser, followingIds, actions } = useSocialStore();
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const author = users.find(u => u.id === reel.userId) || {
    id: reel.userId,
    username: 'creator',
    displayName: 'Creator',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: '',
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    createdAt: '',
  };

  const isFollowing = followingIds.includes(author.id);
  const isOwner = author.id === currentUser?.id;

  // Autoplay/pause based on visibility
  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleDoubleTap = () => {
    if (!reel.isLiked) {
      actions.toggleLikeReel(reel.id);
    }
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 900);
  };

  return (
    <div
      className="relative w-full h-[calc(100vh-4rem)] md:h-[780px] max-w-md mx-auto bg-black sm:rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center select-none snap-start mb-6 border border-white/10"
      onDoubleClick={handleDoubleTap}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={reel.videoUrl}
        poster={reel.thumbnailUrl}
        loop
        playsInline
        muted={isMuted}
        onClick={togglePlay}
        className="w-full h-full object-cover cursor-pointer"
      />

      {/* Floating Play Indicator when paused */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer pointer-events-auto"
        >
          <div className="p-4 rounded-full bg-black/60 backdrop-blur-md text-white">
            <Play className="w-10 h-10 fill-white" />
          </div>
        </div>
      )}

      {/* Double Tap Heart Burst */}
      {showHeartBurst && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <Heart className="w-24 h-24 text-rose-500 fill-rose-500 animate-ping opacity-90 drop-shadow-2xl" />
        </div>
      )}

      {/* Sound Mute button top right */}
      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/50 backdrop-blur-md text-white/90 hover:text-white hover:bg-black/70 transition-colors"
        aria-label="Toggle mute"
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>

      {/* Right Action Rail (Vertical on right side) */}
      <div className="absolute right-3 bottom-20 z-20 flex flex-col items-center gap-5 text-white">
        {/* Like */}
        <button
          onClick={() => actions.toggleLikeReel(reel.id)}
          className="flex flex-col items-center gap-1 group"
        >
          <div className={`p-2.5 rounded-full bg-black/40 backdrop-blur-md transition-transform active:scale-125 ${
            reel.isLiked ? 'text-rose-500' : 'text-white'
          }`}>
            <Heart className={`w-6 h-6 ${reel.isLiked ? 'fill-rose-500' : ''}`} />
          </div>
          <span className="text-[11px] font-bold drop-shadow-md">
            {reel.likesCount.toLocaleString()}
          </span>
        </button>

        {/* Comment */}
        <button
          onClick={() => setShowComments(true)}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors">
            <MessageCircle className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold drop-shadow-md">
            {reel.commentsCount}
          </span>
        </button>

        {/* Share */}
        <button
          onClick={() => setShowShare(true)}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors">
            <Send className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold drop-shadow-md">
            {reel.sharesCount}
          </span>
        </button>

        {/* Save */}
        <button
          onClick={() => actions.toggleSaveReel(reel.id)}
          className="flex flex-col items-center gap-1 group"
        >
          <div className={`p-2.5 rounded-full bg-black/40 backdrop-blur-md transition-colors ${
            reel.isSaved ? 'text-amber-400' : 'text-white'
          }`}>
            <Bookmark className={`w-6 h-6 ${reel.isSaved ? 'fill-amber-400' : ''}`} />
          </div>
        </button>
      </div>

      {/* Bottom Info Overlay */}
      <div className="absolute left-0 right-16 bottom-0 p-4 pb-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20 flex flex-col gap-2">
        {/* Creator Info */}
        <div className="flex items-center gap-2.5">
          <Avatar
            src={author.avatar}
            size="sm"
            isVerified={author.isVerified}
            onClick={() => onNavigateUser(author.username)}
          />
          <span
            onClick={() => onNavigateUser(author.username)}
            className="text-xs sm:text-sm font-bold text-white hover:text-indigo-300 cursor-pointer drop-shadow-md"
          >
            @{author.username}
          </span>
          {!isOwner && (
            <button
              onClick={() => {
                if (isFollowing) actions.unfollowUser(author.id);
                else actions.followUser(author.id);
              }}
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-md transition-colors ${
                isFollowing
                  ? 'bg-white/20 text-white'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        {/* Caption */}
        <p className="text-xs text-white/95 line-clamp-2 leading-relaxed drop-shadow-md">
          {reel.caption}
        </p>

        {/* Audio ticker */}
        <div className="flex items-center gap-2 text-[11px] text-white/80 font-medium">
          <Music2 className="w-3.5 h-3.5 shrink-0 animate-pulse text-indigo-400" />
          <span className="truncate">{reel.audioName}</span>
        </div>
      </div>

      {/* Modals */}
      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        post={{
          id: reel.id,
          userId: reel.userId,
          caption: reel.caption,
          media: [{ id: reel.id, type: 'video', url: reel.videoUrl }],
          likesCount: reel.likesCount,
          commentsCount: reel.commentsCount,
          sharesCount: reel.sharesCount,
          savesCount: reel.savesCount,
          hashtags: reel.hashtags,
          createdAt: reel.createdAt,
          visibility: 'public',
        }}
      />

      <CommentSheetModal
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        postId={reel.id}
        onNavigateUser={onNavigateUser}
      />
    </div>
  );
};
