import { useEffect, useRef, useState } from "react";

interface LottieAvatarProps {
  mood?: string;
  outfit?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  className?: string;
}

export function LottieAvatar({ 
  mood = 'happy', 
  outfit = 'default',
  size = 'lg',
  onClick,
  className = '' 
}: LottieAvatarProps) {
  const [animationState, setAnimationState] = useState('idle');
  
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24', 
    lg: 'w-40 h-40',
    xl: 'w-56 h-56'
  };

  // Mock Lottie animation with CSS animations
  const getMoodAnimation = (mood: string) => {
    const animations = {
      happy: 'animate-bounce',
      sad: 'animate-pulse',
      excited: 'animate-ping',
      calm: 'animate-pulse',
      anxious: 'animate-pulse',
      stressed: 'animate-bounce',
      tired: ''
    };
    return animations[mood as keyof typeof animations] || '';
  };

  const getOutfitStyle = (outfit: string) => {
    const outfits = {
      default: 'from-blue-400 to-purple-500',
      casual: 'from-green-400 to-blue-500',
      formal: 'from-gray-600 to-gray-800',
      sporty: 'from-orange-400 to-red-500',
      elegant: 'from-pink-400 to-purple-600'
    };
    return outfits[outfit as keyof typeof outfits] || outfits.default;
  };

  const handleClick = () => {
    setAnimationState('clicked');
    setTimeout(() => setAnimationState('idle'), 600);
    onClick?.();
  };

  return (
    <div 
      className={`${sizeClasses[size]} ${className} relative cursor-pointer transition-transform hover:scale-105`}
      onClick={handleClick}
    >
      {/* Main Avatar Body */}
      <div className={`
        w-full h-full rounded-full 
        bg-gradient-to-br ${getOutfitStyle(outfit)}
        shadow-2xl border-4 border-white
        flex items-center justify-center relative overflow-hidden
        ${getMoodAnimation(mood)}
        ${animationState === 'clicked' ? 'animate-ping' : ''}
      `}>
        
        {/* Face */}
        <div className="relative w-3/4 h-3/4 bg-gradient-to-b from-yellow-100 to-yellow-200 rounded-full border-2 border-yellow-300">
          
          {/* Eyes */}
          <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-black rounded-full"></div>
          <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-black rounded-full"></div>
          
          {/* Mouth based on mood */}
          <div className={`absolute bottom-1/3 left-1/2 transform -translate-x-1/2 ${
            mood === 'happy' ? 'w-4 h-2 border-b-2 border-black rounded-b-full' :
            mood === 'sad' ? 'w-4 h-2 border-t-2 border-black rounded-t-full' :
            mood === 'excited' ? 'w-6 h-3 border-b-2 border-black rounded-b-full' :
            'w-3 h-1 bg-black rounded-full'
          }`}></div>
          
          {/* Cheeks for happy mood */}
          {mood === 'happy' && (
            <>
              <div className="absolute top-1/2 left-2 w-2 h-2 bg-pink-300 rounded-full opacity-60"></div>
              <div className="absolute top-1/2 right-2 w-2 h-2 bg-pink-300 rounded-full opacity-60"></div>
            </>
          )}
        </div>
        
        {/* Outfit Accessories */}
        {outfit === 'formal' && (
          <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-gray-800 to-transparent rounded-b-full"></div>
        )}
        
        {outfit === 'sporty' && (
          <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-white rounded-full"></div>
        )}
        
        {/* Sparkle effect for interaction */}
        {animationState === 'clicked' && (
          <div className="absolute inset-0">
            <div className="absolute top-2 left-2 w-1 h-1 bg-yellow-300 rounded-full animate-ping"></div>
            <div className="absolute top-4 right-3 w-1 h-1 bg-pink-300 rounded-full animate-ping" style={{ animationDelay: '0.1s' }}></div>
            <div className="absolute bottom-3 left-4 w-1 h-1 bg-blue-300 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
          </div>
        )}
      </div>
      
      {/* Floating hearts for happy mood */}
      {mood === 'happy' && (
        <div className="absolute -top-2 -right-1 animate-bounce">
          <span className="text-pink-500 text-lg">💖</span>
        </div>
      )}
      
      {/* Tap indicator */}
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 opacity-70">
        Tap to customize
      </div>
    </div>
  );
}