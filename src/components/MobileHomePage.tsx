import { LottieAvatar } from "./LottieAvatar";
import { Card, CardContent } from "./ui/card";
import { Heart, Target, BookOpen, MessageCircle, Star, Flame, Trophy, Settings } from "lucide-react";
import blackGif from './avatar/black.gif'; // 导入 black.gif

interface MobileHomePageProps {
  user: any;
  onNavigate: (page: string) => void;
  onAvatarClick: () => void;
  overlayGifs: string[]; // 新增：用于叠加的 GIF 数组
}

export function MobileHomePage({ user, onNavigate, onAvatarClick, overlayGifs }: MobileHomePageProps) {
  const quickActions = [
    {
      id: 'mood',
      title: 'Mood Log',
      icon: Heart,
      color: 'bg-pink-500',
      emoji: '😊'
    },
    {
      id: 'goals',
      title: 'Daily Goal',
      icon: Target,
      color: 'bg-green-500',
      emoji: '🎯'
    },
    {
      id: 'journal',
      title: 'Daily Prompt',
      icon: BookOpen,
      color: 'bg-purple-500',
      emoji: '✍️'
    },
    {
      id: 'chat',
      title: 'Talk to AI',
      icon: MessageCircle,
      color: 'bg-blue-500',
      emoji: '🤖'
    },
    {
      id: 'profile',
      title: 'Profile',
      icon: Settings,
      color: 'bg-gray-500',
      emoji: '⚙️'
    }
  ];

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const userPoints = user?.points || 127;
  const userStreak = user?.streak || 5;

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      
      {/* Header Stats */}
      <div className="absolute top-12 left-4 right-4 z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm">{userPoints}</span>
            </div>
            <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm">{userStreak}</span>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-sm text-gray-600">
              {getCurrentGreeting()}, {user?.name || 'Friend'}!
            </span>
          </div>
        </div>
      </div>

      {/* Left Side Actions */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 space-y-4 z-20">
        {quickActions.map((action, index) => (
          <div
            key={action.id}
            className="group cursor-pointer"
            onClick={() => onNavigate(action.id)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Icon Circle */}
            <div className={`
              w-14 h-14 ${action.color} rounded-2xl shadow-lg
              flex items-center justify-center
              transform transition-all duration-300
              hover:scale-110 hover:shadow-xl
              group-active:scale-95
              animate-fade-in-left
            `}>
              <span className="text-2xl">{action.emoji}</span>
            </div>
            
            {/* Label */}
            <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-md">
                <p className="text-xs text-gray-700 whitespace-nowrap">{action.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Center Avatar */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-6">
          <LottieAvatar
            size="xl"
            onClick={onAvatarClick}
            className="mx-auto"
            overlayGifs={overlayGifs} // 传递 overlayGifs
          />
          
          <div className="space-y-2">
            <h2 className="text-2xl text-gray-800">WithU 💙</h2>
            <p className="text-gray-600">Your gentle companion</p>
          </div>
        </div>
      </div>

      {/* Bottom Progress Indicators */}
      <div className="absolute bottom-24 left-4 right-4">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-xl">💧</span>
                </div>
                <p className="text-xs text-gray-500">Water</p>
                <p className="text-sm">6/8</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-xl">🎯</span>
                </div>
                <p className="text-xs text-gray-500">Goals</p>
                <p className="text-sm">2/3</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-xl">📝</span>
                </div>
                <p className="text-xs text-gray-500">Journal</p>
                <p className="text-sm">✓</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-xl">😊</span>
                </div>
                <p className="text-xs text-gray-500">Mood</p>
                <p className="text-sm">Happy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-32 right-8 animate-float">
        <div className="w-6 h-6 bg-yellow-200 rounded-full opacity-60"></div>
      </div>
      
      <div className="absolute bottom-48 right-12 animate-float" style={{ animationDelay: '1s' }}>
        <div className="w-4 h-4 bg-pink-200 rounded-full opacity-40"></div>
      </div>
      
      <div className="absolute top-48 left-16 animate-float" style={{ animationDelay: '2s' }}>
        <div className="w-8 h-8 bg-blue-200 rounded-full opacity-30"></div>
      </div>

      <style jsx>{`
        @keyframes fade-in-left {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-fade-in-left {
          animation: fade-in-left 0.6s ease-out forwards;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
