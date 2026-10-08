import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { PostMedia } from '../../types';

interface PostMediaCarouselProps {
  media: PostMedia[];
  onDoubleClick?: () => void;
}

export const PostMediaCarousel: React.FC<PostMediaCarouselProps> = ({
  media,
  onDoubleClick,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  if (!media || media.length === 0) return null;

  const currentMedia = media[currentIndex] || media[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : media.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev < media.length - 1 ? prev + 1 : 0));
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
    const video = document.getElementById(`post-video-${currentMedia.id}`) as HTMLVideoElement;
    if (video) {
      if (isPlaying) video.pause();
      else video.play();
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
    const video = document.getElementById(`post-video-${currentMedia.id}`) as HTMLVideoElement;
    if (video) {
      video.muted = !isMuted;
    }
  };

  return (
    <div
      onDoubleClick={onDoubleClick}
      className="relative w-full aspect-[4/5] sm:aspect-square bg-[#0b0e14] overflow-hidden select-none group"
    >
      {currentMedia.type === 'video' ? (
        <div className="relative w-full h-full flex items-center justify-center">
          <video
            id={`post-video-${currentMedia.id}`}
            src={currentMedia.url}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover"
          />
          {/* Controls overlay */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
            <button
              onClick={togglePlay}
              className="p-2 rounded-full bg-black/60 backdrop-blur-sm text-white/90 hover:text-white transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={toggleMute}
              className="p-2 rounded-full bg-black/60 backdrop-blur-sm text-white/90 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      ) : (
        <img
          src={currentMedia.url}
          alt={currentMedia.altText || 'Post photo'}
          className="w-full h-full object-cover transition-opacity duration-300"
          loading="lazy"
        />
      )}

      {/* Carousel navigation arrows */}
      {media.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 z-10"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm">
            {media.map((_, i) => (
              <span
                key={i}
                className={`transition-all rounded-full ${
                  i === currentIndex
                    ? 'w-2 h-2 bg-white'
                    : 'w-1.5 h-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>

          {/* Counter badge in top right */}
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[11px] font-medium text-white/90 z-10">
            {currentIndex + 1}/{media.length}
          </div>
        </>
      )}
    </div>
  );
};
