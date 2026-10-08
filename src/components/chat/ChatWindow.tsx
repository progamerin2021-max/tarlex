import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Image as ImageIcon, Smile, MoreVertical,
  Reply, Trash2, Check, CheckCheck, Brain, Sparkles,
  ArrowLeft, X
} from 'lucide-react';
import { Conversation, Message, User } from '../../types';
import { useSocialStore } from '../../store/socialStore';
import { Avatar } from '../common/Avatar';
import { useToast } from '../common/Toast';

interface ChatWindowProps {
  conversationId: string;
  onBackMobile?: () => void;
  onNavigateUser: (username: string) => void;
}

const MESSAGE_REACTIONS = ['❤️', '🔥', '👏', '😂', '😮', '👍'];

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  onBackMobile,
  onNavigateUser,
}) => {
  const { conversations, messages, users, currentUser, actions } = useSocialStore();
  const { toast } = useToast();

  const [inputVal, setInputVal] = useState('');
  const [replyingMessage, setReplyingMessage] = useState<Message | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [highThinking, setHighThinking] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const conversation = conversations.find(c => c.id === conversationId);
  const conversationMessages = messages.filter(m => m.conversationId === conversationId);

  const otherUserId = conversation?.participantIds.find(id => id !== currentUser?.id) || '';
  const otherUser = users.find(u => u.id === otherUserId) || {
    id: otherUserId,
    username: 'user',
    displayName: 'User',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: '',
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    createdAt: '',
  };

  const isAiBot = conversation?.isAiBot || otherUser.id === 'user_tarlex_ai';

  // Mark messages as read
  useEffect(() => {
    actions.markConversationRead(conversationId);
  }, [conversationId, conversationMessages.length]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages.length, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const textToSend = inputVal.trim();
    setInputVal('');
    const replyTarget = replyingMessage;
    setReplyingMessage(null);

    if (isAiBot) {
      setIsTyping(true);
    }

    await actions.sendMessage(
      conversationId,
      textToSend,
      undefined,
      replyTarget || undefined
    );

    if (isAiBot) {
      setIsTyping(false);
    }
  };

  const handleAttachImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          actions.sendMessage(conversationId, 'Shared an image', reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setInputVal(promptText);
  };

  const formatMsgTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!conversation) return null;

  return (
    <div className="flex flex-col h-full bg-[#0b0e14]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0d111a] border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          {onBackMobile && (
            <button
              onClick={onBackMobile}
              className="md:hidden p-1.5 text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <Avatar
            src={otherUser.avatar}
            size="md"
            isVerified={otherUser.isVerified}
            onClick={() => onNavigateUser(otherUser.username)}
          />

          <div>
            <div className="flex items-center gap-1.5">
              <span
                onClick={() => onNavigateUser(otherUser.username)}
                className="text-xs sm:text-sm font-bold text-white hover:text-indigo-300 cursor-pointer"
              >
                {otherUser.displayName}
              </span>
              {isAiBot && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Gemini
                </span>
              )}
            </div>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              {isAiBot ? 'Active · AI Creative Copilot' : 'Active now'}
            </p>
          </div>
        </div>

        {/* AI High Thinking Toggle */}
        {isAiBot && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setHighThinking(!highThinking);
                toast(
                  !highThinking ? 'High Thinking Enabled 🧠' : 'Standard Speed Mode',
                  !highThinking
                    ? 'Using gemini-3.1-pro-preview with ThinkingLevel.HIGH for deep reasoning.'
                    : 'Switched to low-latency fast model.',
                  'info'
                );
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                highThinking
                  ? 'bg-purple-900/40 border-purple-500 text-purple-200 shadow-sm'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
              title="Toggle Gemini High Thinking Mode"
            >
              <Brain className={`w-3.5 h-3.5 ${highThinking ? 'text-purple-400 animate-pulse' : ''}`} />
              <span className="hidden sm:inline">High Thinking</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick Prompts bar for TarleX AI Copilot */}
      {isAiBot && (
        <div className="px-4 py-2 bg-indigo-950/20 border-b border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[11px] font-semibold text-indigo-300 shrink-0">Try asking:</span>
          {[
            '5 viral hook ideas for my next reel',
            'How to get my first 10k followers on TarleX?',
            'Give me aesthetic captions for travel photography',
            'Analyze modern social media engagement strategies',
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleQuickPrompt(prompt)}
              className="text-[11px] text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors border border-white/5"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Messages Scroll Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {conversationMessages.map(msg => {
          const isMe = msg.senderId === currentUser?.id;
          return (
            <div
              key={msg.id}
              className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}
            >
              {/* Quoted message if replying */}
              {msg.replyToText && (
                <div
                  className={`text-[11px] text-slate-400 bg-white/5 border-l-2 border-indigo-500 px-2.5 py-1 rounded mb-1 max-w-xs truncate ${
                    isMe ? 'mr-1' : 'ml-1'
                  }`}
                >
                  Replying to: "{msg.replyToText}"
                </div>
              )}

              <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[70%]">
                {!isMe && (
                  <Avatar src={otherUser.avatar} size="xs" isVerified={otherUser.isVerified} />
                )}

                <div className="relative">
                  {/* Bubble */}
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed break-words shadow-sm ${
                      isMe
                        ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white rounded-br-xs'
                        : 'bg-[#161c28] text-slate-100 rounded-bl-xs border border-white/5'
                    }`}
                  >
                    {msg.mediaUrl && (
                      <img
                        src={msg.mediaUrl}
                        alt="Attachment"
                        className="rounded-xl max-h-56 w-auto object-cover mb-2 border border-black/20"
                      />
                    )}
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <div
                      className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                        isMe ? 'text-indigo-200' : 'text-slate-400'
                      }`}
                    >
                      <span>{formatMsgTime(msg.createdAt)}</span>
                      {isMe && (
                        msg.isRead ? (
                          <CheckCheck className="w-3 h-3 text-sky-300" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )
                      )}
                    </div>
                  </div>

                  {/* Message Reactions display */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div
                      className={`absolute -bottom-2 flex items-center gap-0.5 bg-[#121722] border border-white/10 rounded-full px-1.5 py-0.5 shadow-md text-xs ${
                        isMe ? 'right-2' : 'left-2'
                      }`}
                    >
                      {msg.reactions.map((r, ri) => (
                        <span key={ri}>{r.emoji}</span>
                      ))}
                    </div>
                  )}

                  {/* Hover Actions Menu */}
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-[#121722] border border-white/10 rounded-full px-1.5 py-1 shadow-lg z-10 ${
                      isMe ? '-left-20' : '-right-20'
                    }`}
                  >
                    {/* Emoji reaction */}
                    <div className="flex items-center gap-1">
                      {['❤️', '🔥', '👍'].map(em => (
                        <button
                          key={em}
                          onClick={() => actions.reactToMessage(msg.id, em)}
                          className="hover:scale-125 transition-transform text-xs"
                        >
                          {em}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setReplyingMessage(msg)}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Reply"
                    >
                      <Reply className="w-3.5 h-3.5" />
                    </button>

                    {isMe && (
                      <button
                        onClick={() => actions.deleteMessage(msg.id)}
                        className="p-1 text-rose-400 hover:text-rose-300"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs pl-8">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
            <span className="text-indigo-300 font-medium ml-1">TarleX Copilot is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Replying Banner */}
      {replyingMessage && (
        <div className="flex items-center justify-between px-4 py-2 bg-indigo-950/40 border-t border-indigo-500/20 text-xs text-indigo-300 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <Reply className="w-3.5 h-3.5" />
            <span className="truncate">Replying to: "{replyingMessage.text}"</span>
          </div>
          <button
            onClick={() => setReplyingMessage(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Emoji Picker Strip */}
      {showEmojiPicker && (
        <div className="px-4 py-2 bg-[#121722] border-t border-white/5 flex items-center gap-3 overflow-x-auto no-scrollbar shrink-0">
          {['❤️', '🔥', '👏', '😂', '😍', '✨', '🙌', '💯', '🚀', '💡', '📸', '⚡'].map(emoji => (
            <button
              key={emoji}
              onClick={() => {
                setInputVal(prev => prev + emoji);
                setShowEmojiPicker(false);
              }}
              className="text-lg hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Chat Input Bar */}
      <form onSubmit={handleSend} className="p-3 bg-[#0d111a] border-t border-white/5 flex items-center gap-2 shrink-0">
        <label className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
          <ImageIcon className="w-5 h-5" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAttachImage}
          />
        </label>

        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
        >
          <Smile className="w-5 h-5" />
        </button>

        <input
          type="text"
          placeholder={isAiBot ? "Ask TarleX Copilot anything..." : `Message @${otherUser.username}...`}
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />

        <button
          type="submit"
          disabled={!inputVal.trim()}
          className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
