import { useState, useEffect } from "react";
import baseGif from './avatar/base.gif'; // Import base.gif

interface LottieAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  className?: string;
  overlayGifs?: string[]; // 新增：用于叠加的 GIF 数组
}

export function LottieAvatar({
  size = 'lg',
  onClick,
  className = '',
  overlayGifs = []
}: LottieAvatarProps) {
  const [loadedImages, setLoadedImages] = useState(0);
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const [key, setKey] = useState(0); // Add a key to force re-render and reload images

  const totalImages = 1 + overlayGifs.length; // baseGif + all overlayGifs

  useEffect(() => {
    // Reset loading state when overlayGifs change
    setLoadedImages(0);
    setAllImagesLoaded(false);
    setKey(prevKey => prevKey + 1); // Change key to force re-render of img elements
  }, [overlayGifs]);

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
      
      {/* Base Avatar GIF */}
      <img 
        key={`base-${key}`} // Use key to force re-render
        src={`${baseGif}?t=${key}`} // Add timestamp to force reload
        alt="Base Avatar" 
        className={`absolute inset-0 w-full h-full object-contain ${allImagesLoaded ? '' : 'hidden'}`} 
        onLoad={handleImageLoad}
      />

      {/* Overlay Gifs for outfits/accessories */}
      {overlayGifs.map((gifPath, index) => (
        <img
          key={`overlay-${key}-${index}`} // Use key to force re-render
          src={`${gifPath}?t=${key}`} // Add timestamp to force reload
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
