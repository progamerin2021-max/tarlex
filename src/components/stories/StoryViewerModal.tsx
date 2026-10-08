import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Eye, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { useSocialStore } from '../../store/socialStore';
import { Avatar } from '../common/Avatar';
import { useToast } from '../common/Toast';

interface StoryViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUsername: string;
  onNavigateUser: (username: string) => void;
}

const STORY_DURATION_MS = 5000;

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  isOpen,
  onClose,
  initialUsername,
  onNavigateUser,
}) => {
  const { stories, users, currentUser, actions } = useSocialStore();
  const { toast } = useToast();

  const [activeUserIndex, setActiveUserIndex] = useState(0);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReactionBurst, setShowReactionBurst] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Group stories by active creators
  const usersWithStories = users.filter(u =>
    stories.some(s => s.userId === u.id && new Date(s.expiresAt).getTime() > Date.now())
  );

  // Sync initial user
  useEffect(() => {
    if (initialUsername) {
      const idx = usersWithStories.findIndex(u => u.username === initialUsername);
      if (idx !== -1) {
        setActiveUserIndex(idx);
        setActiveStoryIndex(0);
        setProgress(0);
      }
    }
  }, [initialUsername, isOpen]);

  const activeUser = usersWithStories[activeUserIndex];
  const userStories = activeUser
    ? stories.filter(s => s.userId === activeUser.id && new Date(s.expiresAt).getTime() > Date.now())
    : [];
  const currentStory = userStories[activeStoryIndex];

  // Mark viewed when active
  useEffect(() => {
    if (currentStory && !currentStory.isViewed) {
      actions.markStoryViewed(currentStory.id);
    }
  }, [currentStory]);

  // Story progression timer
  useEffect(() => {
    if (!isOpen || isPaused || !currentStory) return;

    const intervalTime = 50;
    const step = 100 / (STORY_DURATION_MS / intervalTime);

    timerRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNextStory();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isPaused, activeUserIndex, activeStoryIndex, currentStory]);

  const handleNextStory = () => {
    setProgress(0);
    if (activeStoryIndex < userStories.length - 1) {
      setActiveStoryIndex(prev => prev + 1);
    } else if (activeUserIndex < usersWithStories.length - 1) {
      setActiveUserIndex(prev => prev + 1);
      setActiveStoryIndex(0);
    } else {
      onClose();
    }
  };

  const handlePrevStory = () => {
    setProgress(0);
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(prev => prev - 1);
    } else if (activeUserIndex > 0) {
      setActiveUserIndex(prev => prev - 1);
      const prevUserStories = stories.filter(
        s => s.userId === usersWithStories[activeUserIndex - 1].id
      );
      setActiveStoryIndex(Math.max(0, prevUserStories.length - 1));
    }
  };

  const handleSendReaction = (emoji: string) => {
    if (!currentStory) return;
    actions.reactToStory(currentStory.id, emoji);
    setShowReactionBurst(emoji);
    setTimeout(() => setShowReactionBurst(null), 1000);
    toast('Reaction Sent!', `Sent ${emoji} to @${activeUser.username}`, 'success');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeUser) return;

    const conv = actions.getOrCreateConversation(activeUser.id);
    actions.sendMessage(
      conv.id,
      `Replied to your story: "${replyText.trim()}"`,
      currentStory?.mediaUrl
    );
    toast('Reply Sent!', `Message sent to @${activeUser.username}`, 'success');
    setReplyText('');
  };

  if (!isOpen || !activeUser || !currentStory) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center select-none backdrop-blur-md">
      {/* Background close overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Story Container */}
      <div
        className="relative w-full max-w-sm h-full max-h-[820px] sm:rounded-3xl overflow-hidden bg-slate-950 flex flex-col shadow-2xl z-10 border border-white/10"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Progress bars */}
        <div className="absolute top-3 left-3 right-3 flex items-center gap-1.5 z-30">
          {userStories.map((st, idx) => (
            <div key={st.id} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-75"
                style={{
                  width:
                    idx < activeStoryIndex
                      ? '100%'
                      : idx === activeStoryIndex
                      ? `${progress}%`
                      : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-6 left-3 right-3 flex items-center justify-between z-30 pt-1">
          <div
            onClick={(e) => {
              e.stopPropagation();
              onClose();
              onNavigateUser(activeUser.username);
            }}
            className="flex items-center gap-2.5 cursor-pointer bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full"
          >
            <Avatar src={activeUser.avatar} size="xs" isVerified={activeUser.isVerified} />
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">{activeUser.username}</span>
              <span className="text-[10px] text-white/60">
                {Math.max(1, Math.floor((Date.now() - new Date(currentStory.createdAt).getTime()) / 3600000))}h
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Media */}
        <div className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center bg-black">
          {currentStory.mediaType === 'video' ? (
            <video
              src={currentStory.mediaUrl}
              autoPlay
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={currentStory.mediaUrl}
              alt="Story"
              className="w-full h-full object-cover"
            />
          )}

          {/* Left/Right Tap zones */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              handlePrevStory();
            }}
            className="absolute left-0 top-0 bottom-0 w-1/3 z-20 cursor-pointer"
          />
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleNextStory();
            }}
            className="absolute right-0 top-0 bottom-0 w-2/3 z-20 cursor-pointer"
          />

          {/* Reaction burst animation */}
          {showReactionBurst && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 text-7xl animate-bounce">
              {showReactionBurst}
            </div>
          )}

          {/* Caption banner if exists */}
          {currentStory.caption && (
            <div className="absolute bottom-24 left-4 right-4 z-20 p-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-center">
              <p className="text-sm font-semibold text-white">{currentStory.caption}</p>
            </div>
          )}
        </div>

        {/* Footer Reply / Reaction Bar */}
        <div className="p-3 bg-black/80 backdrop-blur-md border-t border-white/5 z-30 flex flex-col gap-2">
          {/* Reaction buttons */}
          <div className="flex items-center justify-around py-1">
            {['❤️', '🔥', '👏', '😂', '😍', '✨'].map(emoji => (
              <button
                key={emoji}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSendReaction(emoji);
                }}
                className="text-2xl hover:scale-130 active:scale-95 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Reply form */}
          {activeUser.id !== currentUser?.id ? (
            <form onSubmit={handleSendReply} className="flex items-center gap-2">
              <input
                type="text"
                placeholder={`Reply to ${activeUser.username}...`}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                className="flex-1 px-3 py-2 bg-white/10 border border-white/10 rounded-full text-xs text-white placeholder-white/50 focus:outline-none focus:border-indigo-400"
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="p-2 rounded-full bg-indigo-600 text-white disabled:opacity-40 hover:bg-indigo-500 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-1.5 py-1 text-xs text-slate-400">
              <Eye className="w-4 h-4 text-indigo-400" />
              <span>{currentStory.viewersCount || 14} viewers</span>
            </div>
          )}
        </div>

        {/* Outer next / prev desktop helpers */}
        {activeUserIndex > 0 && (
          <button
            onClick={handlePrevStory}
            className="hidden sm:flex absolute -left-12 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {activeUserIndex < usersWithStories.length - 1 && (
          <button
            onClick={handleNextStory}
            className="hidden sm:flex absolute -right-12 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};
