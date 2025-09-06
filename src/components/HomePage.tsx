import { Avatar } from "./Avatar";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Heart, Target, BookOpen, MessageCircle, AlertTriangle } from "lucide-react";

interface HomePageProps {
  user: any;
  onNavigate: (page: string) => void;
}

export function HomePage({ user, onNavigate }: HomePageProps) {
  const quickActions = [
    {
      id: 'mood',
      title: 'Log Mood',
      icon: Heart,
      color: 'bg-pink-100 text-pink-600',
      description: 'How are you feeling today?'
    },
    {
      id: 'goals',
      title: 'Daily Goal',
      icon: Target,
      color: 'bg-green-100 text-green-600',
      description: 'Check your progress'
    },
    {
      id: 'journal',
      title: 'Daily Prompt',
      icon: BookOpen,
      color: 'bg-purple-100 text-purple-600',
      description: 'Reflect and write'
    },
    {
      id: 'chat',
      title: 'Talk to AI',
      icon: MessageCircle,
      color: 'bg-blue-100 text-blue-600',
      description: 'Get support anytime'
    }
  ];

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm px-6 py-8 rounded-b-3xl shadow-sm">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Avatar 
              mood={user?.currentMood || 'happy'} 
              accessories={user?.avatar?.accessories || []}
              size="lg"
            />
          </div>
          <div>
            <h2>{getCurrentGreeting()}, {user?.name || 'Friend'}!</h2>
            <p className="text-gray-600">How can I support you today?</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex-1 p-6 space-y-4">
        <h3>Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map(action => (
            <Card 
              key={action.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              onClick={() => onNavigate(action.id)}
            >
              <CardContent className="p-4 text-center space-y-3">
                <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center mx-auto`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <div>
                  <h4>{action.title}</h4>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Daily Stats */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <h4 className="mb-3">Today's Progress</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl">💧</div>
                <p className="text-xs text-gray-500">Water</p>
                <p className="text-sm">6/8 glasses</p>
              </div>
              <div>
                <div className="text-2xl">🎯</div>
                <p className="text-xs text-gray-500">Goals</p>
                <p className="text-sm">2/3 done</p>
              </div>
              <div>
                <div className="text-2xl">✨</div>
                <p className="text-xs text-gray-500">Points</p>
                <p className="text-sm">127</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Button */}
        <Button 
          variant="outline"
          className="w-full mt-4 border-red-200 text-red-600 hover:bg-red-50"
          onClick={() => onNavigate('emergency')}
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Need immediate support?
        </Button>
      </div>
    </div>
  );
}