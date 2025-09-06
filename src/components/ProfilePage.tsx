import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar } from "./Avatar";
import { User, Phone, Star, Trophy, Settings, Edit2, Save, LogOut, ArrowLeft } from "lucide-react";

interface ProfilePageProps {
  user: any;
  onUserUpdate: (updatedUser: any) => void;
  onBack?: () => void;
  onLogout?: () => void;
}

export function ProfilePage({ user, onUserUpdate, onBack, onLogout }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    trustedContact: user?.trustedContact || ''
  });
  const [selectedAccessories, setSelectedAccessories] = useState(user?.avatar?.accessories || []);

  const achievements = [
    { id: 'streak3', name: '3 Day Streak', icon: '🔥', unlocked: true },
    { id: 'mood50', name: '50 Moods Logged', icon: '😊', unlocked: true },
    { id: 'goals25', name: '25 Goals Completed', icon: '🎯', unlocked: false },
    { id: 'journal10', name: '10 Journal Entries', icon: '📝', unlocked: true },
    { id: 'helper', name: 'Helper Badge', icon: '💙', unlocked: false },
    { id: 'mindful', name: 'Mindful Master', icon: '🧘', unlocked: false },
  ];

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const userPoints = user?.points || 127;
  const userStreak = user?.streak || 5;

  const availableAccessories = [
    { id: 'hat', name: 'Cool Hat', cost: 50, emoji: '🎩' },
    { id: 'glasses', name: 'Smart Glasses', cost: 75, emoji: '👓' },
  ];

  const availableBackgrounds = [
    { id: 'default', name: 'Default', cost: 0 },
    { id: 'ocean', name: 'Ocean', cost: 100 },
    { id: 'forest', name: 'Forest', cost: 150 },
  ];

  const handleSaveProfile = () => {
    const updatedUser = {
      ...user,
      ...editForm,
      avatar: {
        ...user.avatar,
        accessories: selectedAccessories
      }
    };
    onUserUpdate(updatedUser);
    setIsEditing(false);
  };

  const toggleAccessory = (accessoryId: string) => {
    setSelectedAccessories(prev => 
      prev.includes(accessoryId) 
        ? prev.filter(id => id !== accessoryId)
        : [...prev, accessoryId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 pb-20">
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
          <h1>Profile</h1>
          <p className="text-gray-600">Customize your WithU experience</p>
        </div>

        {/* Profile Info */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Avatar 
                mood={user?.currentMood || 'happy'}
                accessories={selectedAccessories}
                size="lg"
              />
              
              {isEditing ? (
                <div className="space-y-3">
                  <Input
                    placeholder="Your name"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                  <div className="flex space-x-2">
                    <Button onClick={handleSaveProfile} size="sm">
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                    <Button 
                      onClick={() => setIsEditing(false)} 
                      variant="outline" 
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <h2>{user?.name || 'Friend'}</h2>
                  <p className="text-gray-600">{user?.email}</p>
                  <Button 
                    onClick={() => setIsEditing(true)} 
                    variant="ghost" 
                    size="sm"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit Profile
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5" />
              <span>Your Stats</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl text-yellow-500">✨</div>
                <p className="text-lg">{userPoints}</p>
                <p className="text-xs text-gray-500">Points</p>
              </div>
              <div>
                <div className="text-2xl text-orange-500">🔥</div>
                <p className="text-lg">{userStreak}</p>
                <p className="text-xs text-gray-500">Day Streak</p>
              </div>
              <div>
                <div className="text-2xl text-purple-500">🏆</div>
                <p className="text-lg">{unlockedAchievements.length}</p>
                <p className="text-xs text-gray-500">Achievements</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avatar Customization */}
        <Card>
          <CardHeader>
            <CardTitle>Customize Avatar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Accessories</label>
              <div className="grid grid-cols-2 gap-3">
                {availableAccessories.map(accessory => (
                  <button
                    key={accessory.id}
                    onClick={() => toggleAccessory(accessory.id)}
                    disabled={userPoints < accessory.cost}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      selectedAccessories.includes(accessory.id)
                        ? 'border-purple-500 bg-purple-50' 
                        : userPoints >= accessory.cost
                        ? 'border-gray-200 hover:border-purple-300'
                        : 'border-gray-200 opacity-50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{accessory.emoji}</div>
                    <p className="text-sm">{accessory.name}</p>
                    <Badge variant={userPoints >= accessory.cost ? 'default' : 'secondary'}>
                      {accessory.cost} pts
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5" />
              <span>Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {achievements.map(achievement => (
                <div 
                  key={achievement.id}
                  className={`p-3 rounded-lg text-center ${
                    achievement.unlocked 
                      ? 'bg-yellow-50 border border-yellow-200' 
                      : 'bg-gray-50 border border-gray-200 opacity-60'
                  }`}
                >
                  <div className="text-2xl mb-1">{achievement.icon}</div>
                  <p className="text-xs">{achievement.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="flex items-center space-x-2 text-sm mb-2">
                  <Phone className="w-4 h-4" />
                  <span>Emergency Contact</span>
                </label>
                {isEditing ? (
                  <Input
                    placeholder="Phone number (optional)"
                    value={editForm.trustedContact}
                    onChange={(e) => setEditForm(prev => ({ ...prev, trustedContact: e.target.value }))}
                  />
                ) : (
                  <p className="text-gray-600 text-sm">
                    {user?.trustedContact || 'Not set'}
                  </p>
                )}
              </div>
              
              <div className="border-t pt-3">
                <h4 className="text-sm mb-2">AI Response Style</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="aiStyle" defaultChecked />
                    <span className="text-sm">Supportive & Gentle</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="aiStyle" />
                    <span className="text-sm">Motivational & Energetic</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="aiStyle" />
                    <span className="text-sm">Concise & Direct</span>
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logout Button */}
        {onLogout && (
          <Card className="border-red-200">
            <CardContent className="p-4">
              <Button 
                onClick={onLogout}
                variant="destructive" 
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}