interface AvatarProps {
  mood?: string;
  accessories?: string[];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ 
  mood = 'happy', 
  accessories = [], 
  size = 'md',
  className = '' 
}: AvatarProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32'
  };

  const getMoodEmoji = (mood: string) => {
    const moodMap: { [key: string]: string } = {
      happy: '😊',
      sad: '😢',
      anxious: '😰',
      stressed: '😤',
      calm: '😌',
      excited: '🤗',
      tired: '😴'
    };
    return moodMap[mood] || '😊';
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 rounded-full border-4 border-white shadow-lg`}>
      <div className="text-2xl">
        {getMoodEmoji(mood)}
      </div>
      
      {accessories.includes('hat') && (
        <div className="absolute -top-2 w-8 h-4 bg-red-500 rounded-t-full"></div>
      )}
      
      {accessories.includes('glasses') && (
        <div className="absolute top-1/3 w-6 h-2 border-2 border-black rounded-full bg-transparent"></div>
      )}
    </div>
  );
}