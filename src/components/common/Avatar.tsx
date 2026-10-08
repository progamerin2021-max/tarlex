import React from 'react';

interface AvatarProps {
  src: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  hasStory?: boolean;
  storyViewed?: boolean;
  isVerified?: boolean;
  className?: string;
  onClick?: () => void;
}

const sizeMap = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
  '2xl': 'w-24 h-24 sm:w-28 sm:h-28',
};

const storyRingPadding = {
  xs: 'p-[1.5px]',
  sm: 'p-[2px]',
  md: 'p-[2px]',
  lg: 'p-[3px]',
  xl: 'p-[3px]',
  '2xl': 'p-[4px]',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'User',
  size = 'md',
  hasStory = false,
  storyViewed = false,
  isVerified = false,
  className = '',
  onClick,
}) => {
  const sizeClass = sizeMap[size];
  const ringClass = storyRingPadding[size];

  const ringStyle = hasStory
    ? storyViewed
      ? 'story-seen-ring rounded-full'
      : 'story-gradient-ring rounded-full cursor-pointer hover:opacity-90 transition-opacity'
    : '';

  return (
    <div
      className={`relative inline-block select-none flex-shrink-0 ${ringStyle} ${hasStory ? ringClass : ''} ${className}`}
      onClick={onClick}
    >
      <img
        src={src || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
        alt={alt}
        className={`${sizeClass} rounded-full object-cover bg-slate-800 ${
          hasStory ? 'border-2 border-[#0b0e14]' : ''
        }`}
        loading="lazy"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src =
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
        }}
      />
      {isVerified && (
        <span
          className="absolute -bottom-0.5 -right-0.5 bg-indigo-500 text-white rounded-full p-0.5 shadow-sm border border-[#0b0e14]"
          title="Verified Creator"
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        </span>
      )}
    </div>
  );
};
