import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { CheckCircle, Circle, Plus, Star, Gift, ArrowLeft } from "lucide-react";

interface GoalsPageProps {
  user: any;
  onPointsEarned: (points: number) => void;
  onBack?: () => void;
}

interface Goal {
  id: string;
  title: string;
  points: number;
  completed: boolean;
  type: 'daily' | 'custom';
}

export function GoalsPage({ user, onPointsEarned, onBack }: GoalsPageProps) {
  const [goals, setGoals] = useState<Goal[]>([
    { id: '1', title: 'Drink 8 glasses of water', points: 10, completed: false, type: 'daily' },
    { id: '2', title: 'Take 10 deep breaths', points: 5, completed: true, type: 'daily' },
    { id: '3', title: 'Get 7+ hours sleep', points: 15, completed: false, type: 'daily' },
    { id: '4', title: 'Write in journal', points: 10, completed: false, type: 'daily' },
  ]);

  const [newGoal, setNewGoal] = useState('');
  const [showRewards, setShowRewards] = useState(false);

  const userPoints = user?.points || 127;
  const completedGoals = goals.filter(g => g.completed).length;
  const totalGoals = goals.length;
  const progressPercent = (completedGoals / totalGoals) * 100;

  const toggleGoal = (goalId: string) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const newCompleted = !goal.completed;
        if (newCompleted && !goal.completed) {
          onPointsEarned(goal.points);
        }
        return { ...goal, completed: newCompleted };
      }
      return goal;
    }));
  };

  const addCustomGoal = () => {
    if (newGoal.trim()) {
      const goal: Goal = {
        id: Date.now().toString(),
        title: newGoal.trim(),
        points: 5,
        completed: false,
        type: 'custom'
      };
      setGoals(prev => [...prev, goal]);
      setNewGoal('');
    }
  };

  const rewards = [
    { id: 'hat', name: 'Cool Hat', cost: 50, unlocked: userPoints >= 50, type: 'accessory' },
    { id: 'glasses', name: 'Smart Glasses', cost: 75, unlocked: userPoints >= 75, type: 'accessory' },
    { id: 'background1', name: 'Ocean Background', cost: 100, unlocked: userPoints >= 100, type: 'background' },
    { id: 'background2', name: 'Forest Background', cost: 150, unlocked: userPoints >= 150, type: 'background' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Back Button */}
        {onBack && (
          <div className="pt-12">
            <Button onClick={onBack} variant="ghost" size="sm">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
          </div>
        )}
        
        {/* Header */}
        <div className="text-center pt-4">
          <h1>Daily Goals</h1>
          <p className="text-gray-600">Small steps, big progress 🎯</p>
        </div>

        {/* Points & Progress */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-lg">{userPoints} points</span>
              </div>
              <Badge variant="outline">
                {completedGoals}/{totalGoals} completed
              </Badge>
            </div>
            <Progress value={progressPercent} className="h-3" />
            <p className="text-sm text-gray-600 mt-2 text-center">
              {progressPercent === 100 ? "Amazing work today! 🎉" : "Keep going! You're doing great! 💪"}
            </p>
          </CardContent>
        </Card>

        {/* Daily Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Today's Goals</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {goals.map(goal => (
              <div 
                key={goal.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                  goal.completed 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200 hover:border-green-300'
                }`}
              >
                <button
                  onClick={() => toggleGoal(goal.id)}
                  className="flex-shrink-0"
                >
                  {goal.completed ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400 hover:text-green-600" />
                  )}
                </button>
                
                <div className="flex-1">
                  <p className={goal.completed ? 'line-through text-gray-500' : ''}>
                    {goal.title}
                  </p>
                </div>
                
                <Badge variant={goal.completed ? 'default' : 'secondary'}>
                  +{goal.points}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Add Custom Goal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Add Custom Goal</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex space-x-2">
              <Input
                placeholder="e.g., Go for a 10-minute walk"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomGoal()}
              />
              <Button onClick={addCustomGoal} disabled={!newGoal.trim()}>
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Rewards Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Gift className="w-5 h-5" />
                <span>Rewards Shop</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowRewards(!showRewards)}
              >
                {showRewards ? 'Hide' : 'Show'}
              </Button>
            </CardTitle>
          </CardHeader>
          {showRewards && (
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {rewards.map(reward => (
                  <div 
                    key={reward.id}
                    className={`p-3 rounded-lg border text-center ${
                      reward.unlocked 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="text-2xl mb-2">
                      {reward.type === 'accessory' ? '👒' : '🖼️'}
                    </div>
                    <h4 className="text-sm mb-1">{reward.name}</h4>
                    <Badge variant={reward.unlocked ? 'default' : 'secondary'}>
                      {reward.cost} points
                    </Badge>
                  </div>
                ))}
              </div>
              
              {/* Mini Garden Visualization */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg text-center">
                <h4 className="mb-3">Your Progress Garden 🌱</h4>
                <div className="flex justify-center space-x-2">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div 
                      key={i}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                        i < Math.floor(progressPercent / 20) ? 'bg-green-200' : 'bg-gray-200'
                      }`}
                    >
                      {i < Math.floor(progressPercent / 20) ? '🌸' : '🌱'}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Complete goals to grow your garden!
                </p>
              </div>
            </CardContent>
          )}
        </Card>

      </div>
    </div>
  );
}