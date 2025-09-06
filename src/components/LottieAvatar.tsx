import { useState, useEffect } from "react";

// Import all mood-based GIFs
import baseNeutralGif from './avatar/base.gif';
import baseHappyGif from './avatar/base_happy.gif';
import baseCalmGif from './avatar/base_calm.gif';
import baseSadGif from './avatar/base_sad.gif';
import baseAnxiousGif from './avatar/base_anxious.gif';
import baseStressedGif from './avatar/base_stressed.gif';

export interface LottieAvatarProps { // Export the interface
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  className?: string;
  overlayGifs?: string[]; // For outfits/accessories
  mood?: 'happy' | 'calm' | 'neutral' | 'sad' | 'anxious' | 'stressed' | null; // Current mood, allow null
  refreshKey?: number; // Add a refreshKey to force re-render
}

const moodGifMap: Record<NonNullable<LottieAvatarProps['mood']>, string> = {
  neutral: baseNeutralGif,
  happy: baseHappyGif,
  calm: baseCalmGif,
  sad: baseSadGif,
  anxious: baseAnxiousGif,
  stressed: baseStressedGif,
};

export function LottieAvatar({
  size = 'lg',
  onClick,
  className = '',
  overlayGifs = [],
  mood = null, // Default mood is null
  refreshKey = 0 // Default refreshKey
}: LottieAvatarProps) {
  const effectiveMood = mood === null ? 'neutral' : mood; // Treat null as neutral
  const [loadedImages, setLoadedImages] = useState(0);
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const [internalKey, setInternalKey] = useState(0); // Use internalKey for image reloading

  const currentBaseGif = moodGifMap[effectiveMood];
  const totalImages = 1 + overlayGifs.length; // currentBaseGif + all overlayGifs

  useEffect(() => {
    // Reset loading state when mood, overlayGifs, or refreshKey change
    setLoadedImages(0);
    setAllImagesLoaded(false);
    setInternalKey(prevKey => prevKey + 1); // Change internalKey to force re-render of img elements
  }, [mood, overlayGifs, refreshKey]); // Add refreshKey to dependencies

  useEffect(() => {
    if (totalImages > 0 && loadedImages === totalImages) {
      setAllImagesLoaded(true);
    } else if (totalImages === 0) { // Handle case with no images (e.g., initial render before user data)
      setAllImagesLoaded(true);
    }
  }, [loadedImages, totalImages]);

  const handleImageLoad = () => {
    setLoadedImages(prev => prev + 1);
  };

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-40 h-40',
    xl: 'w-56 h-56'
  };

  return (
    <div
      className={`${sizeClasses[size]} ${className} relative cursor-pointer hover:scale-105 transition-transform`}
      onClick={onClick}
    >
      {!allImagesLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-full">
          Loading Avatar...
        </div>
      )}

      {/* Base Avatar GIF based on mood */}
      <img
        key={`base-${internalKey}`} // Use internalKey to force re-render
        src={`${currentBaseGif}?t=${internalKey}`} // Add timestamp to force reload
        alt={`${mood} Avatar`}
        className={`absolute inset-0 w-full h-full object-contain ${allImagesLoaded ? '' : 'hidden'}`}
        onLoad={handleImageLoad}
      />

      {/* Overlay Gifs for outfits/accessories */}
      {overlayGifs.map((gifPath, index) => (
        <img
          key={`overlay-${internalKey}-${index}`} // Use internalKey to force re-render
          src={`${gifPath}?t=${internalKey}`} // Add timestamp to force reload
          alt={`Overlay ${index}`}
          className={`absolute inset-0 w-full h-full object-contain ${allImagesLoaded ? '' : 'hidden'}`}
          style={{ zIndex: index + 1 }} // Ensure overlays are above base GIF
          onLoad={handleImageLoad}
        />
      ))}

      {/* Tap indicator */}
      <div className={`absolute -bottom-3 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 opacity-70 ${allImagesLoaded ? '' : 'hidden'}`}>
        Tap to customize
      </div>
    </div>
  );
}
