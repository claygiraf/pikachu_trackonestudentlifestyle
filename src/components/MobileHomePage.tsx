import { useState, useEffect } from "react"; // Import useState and useEffect
import { LottieAvatar, LottieAvatarProps } from "./LottieAvatar"; // Import LottieAvatarProps
import { Card, CardContent } from "./ui/card";
import { Heart, Target, BookOpen, MessageCircle, Star, Flame, Trophy, Settings } from "lucide-react";
import { db } from "../firebase"; // Import Firestore db
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions
import { toast } from "sonner"; // Import toast from sonner
import { moods as validMoods } from "./MoodTracker"; // Import moods array from MoodTracker

// Import outfit GIFs
import blackGif from './avatar/black.gif';
import casualGif from './avatar/casual.gif';
import sportsGif from './avatar/sports.gif';

interface MobileHomePageProps {
  user: any;
  onNavigate: (page: string) => void;
  onAvatarClick: () => void;
  refreshKey?: number; // Add refreshKey prop
}

export function MobileHomePage({ user, onNavigate, onAvatarClick, refreshKey }: MobileHomePageProps) {
  const [currentMood, setCurrentMood] = useState<LottieAvatarProps['mood'] | null>(null);
  const [overlayGifs, setOverlayGifs] = useState<string[]>([]);

  useEffect(() => {
    const fetchUserMoodAndAvatar = async () => {
      if (!user) return;

      console.log("MobileHomePage: Fetching user data for:", user.uid); // Debug log
      console.log("MobileHomePage: Initial user object:", user); // Debug log

      // Fetch current day's mood from the moods map
      const today = new Date();
      const year = today.getFullYear();
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const day = today.getDate().toString().padStart(2, '0');
      const docId = `${year}-${month}-${day}`; // YYYY-MM-DD local date as document ID

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      // Get valid mood IDs from MoodTracker
      const validMoodIds = validMoods.map(m => m.id);

      if (userDocSnap.exists()) {
        const moodsMap = userDocSnap.data().moods || {};
        const todayMood = moodsMap[docId];

        if (todayMood && validMoodIds.includes(todayMood.mood)) {
          setCurrentMood(todayMood.mood);
          console.log("MobileHomePage: Mood from moods map:", todayMood.mood); // Debug log
        } else {
          setCurrentMood(null); // Default to null if no mood logged today or mood is invalid
          console.log("MobileHomePage: No valid mood found in moods map for today. Setting currentMood to null."); // Debug log
          toast("You haven't record your mood today!", {
            description: "Press Here!!",
            action: {
              label: "Log Mood",
              onClick: () => onNavigate('mood'),
            },
            duration: Infinity, // Keep notification until dismissed or action taken
          });
        }
      } else {
        setCurrentMood(null); // Default to null if user doc doesn't exist
        console.log("MobileHomePage: User document does not exist. Setting currentMood to null."); // Debug log
        toast("You haven't record your mood today!", {
          description: "Press Here!!",
          action: {
            label: "Log Mood",
            onClick: () => onNavigate('mood'),
          },
          duration: Infinity, // Keep notification until dismissed or action taken
        });
      }

      // Fetch avatar outfit and accessories
      const userAvatar = userDocSnap.data()?.avatar || {};
      const selectedOutfit = userAvatar.outfit || 'default';
      const selectedAccessories = userAvatar.accessories || [];

      const currentOverlayGifs: string[] = [];
      if (user?.avatar?.outfit === 'formal') {
        currentOverlayGifs.push(blackGif);
      } else if (user?.avatar?.outfit === 'casual') {
        currentOverlayGifs.push(casualGif);
      } else if (user?.avatar?.outfit === 'sporty') {
        currentOverlayGifs.push(sportsGif);
      }
      // Add accessories to overlayGifs if needed, assuming accessory paths are stored directly
      // For now, we'll just use the outfit. If accessories are also GIFs, they need to be handled here.
      
      setOverlayGifs(currentOverlayGifs);
      console.log("MobileHomePage: Overlay Gifs (from outfit):", currentOverlayGifs); // Debug log

      // Ensure that user?.avatar?.mood is not used for current mood display
      // The currentMood state should solely be driven by the moods map.
      // Explicitly ensure user.avatar.mood is not used for current mood display.
      // This is a defensive measure to prevent any potential unintended usage.
      if (user?.avatar) {
        user.avatar.mood = undefined; // Clear the mood from the user.avatar object
        console.log("MobileHomePage: Cleared user.avatar.mood. Updated user object:", user); // Debug log
      }
    };

    fetchUserMoodAndAvatar();
  }, [user]); // Add onNavigate to dependencies

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
              mood={currentMood} // Pass currentMood state to LottieAvatar
              overlayGifs={overlayGifs} // 传递 overlayGifs
              refreshKey={refreshKey} // Pass refreshKey to LottieAvatar
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

      <style>{`
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
