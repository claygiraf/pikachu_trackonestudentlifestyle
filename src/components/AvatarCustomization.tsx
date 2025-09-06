import { useState } from "react";
import { LottieAvatar } from "./LottieAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ArrowLeft, Star, Lock, Check } from "lucide-react";

interface AvatarCustomizationProps {
  user: any;
  onBack: () => void;
  onSave: (outfit: string, accessories: string[]) => void;
}

interface OutfitItem {
  id: string;
  name: string;
  type: 'outfit' | 'accessory';
  cost: number;
  preview: string;
  unlocked: boolean;
  equipped: boolean;
}

export function AvatarCustomization({ user, onBack, onSave }: AvatarCustomizationProps) {
  const [selectedOutfit, setSelectedOutfit] = useState(user?.avatar?.outfit || 'default');
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>(user?.avatar?.accessories || []);
  const [activeTab, setActiveTab] = useState<'outfits' | 'accessories'>('outfits');

  const userPoints = user?.points || 127;

  const outfits: OutfitItem[] = [
    {
      id: 'default',
      name: 'Default',
      type: 'outfit',
      cost: 0,
      preview: '👕',
      unlocked: true,
      equipped: selectedOutfit === 'default'
    },
    {
      id: 'casual',
      name: 'Casual Wear',
      type: 'outfit',
      cost: 50,
      preview: '👔',
      unlocked: userPoints >= 50,
      equipped: selectedOutfit === 'casual'
    },
    {
      id: 'formal',
      name: 'Formal Suit',
      type: 'outfit',
      cost: 100,
      preview: '🤵',
      unlocked: userPoints >= 100,
      equipped: selectedOutfit === 'formal'
    },
    {
      id: 'sporty',
      name: 'Sports Outfit',
      type: 'outfit',
      cost: 75,
      preview: '🏃',
      unlocked: userPoints >= 75,
      equipped: selectedOutfit === 'sporty'
    },
    {
      id: 'elegant',
      name: 'Elegant Style',
      type: 'outfit',
      cost: 120,
      preview: '💃',
      unlocked: userPoints >= 120,
      equipped: selectedOutfit === 'elegant'
    },
  ];

  const accessories: OutfitItem[] = [
    {
      id: 'hat',
      name: 'Cool Hat',
      type: 'accessory',
      cost: 30,
      preview: '🎩',
      unlocked: userPoints >= 30,
      equipped: selectedAccessories.includes('hat')
    },
    {
      id: 'glasses',
      name: 'Smart Glasses',
      type: 'accessory',
      cost: 40,
      preview: '👓',
      unlocked: userPoints >= 40,
      equipped: selectedAccessories.includes('glasses')
    },
    {
      id: 'watch',
      name: 'Digital Watch',
      type: 'accessory',
      cost: 60,
      preview: '⌚',
      unlocked: userPoints >= 60,
      equipped: selectedAccessories.includes('watch')
    },
    {
      id: 'necklace',
      name: 'Sparkle Necklace',
      type: 'accessory',
      cost: 80,
      preview: '📿',
      unlocked: userPoints >= 80,
      equipped: selectedAccessories.includes('necklace')
    },
  ];

  const selectOutfit = (outfitId: string) => {
    const outfit = outfits.find(o => o.id === outfitId);
    if (outfit && outfit.unlocked) {
      setSelectedOutfit(outfitId);
    }
  };

  const toggleAccessory = (accessoryId: string) => {
    const accessory = accessories.find(a => a.id === accessoryId);
    if (accessory && accessory.unlocked) {
      setSelectedAccessories(prev =>
        prev.includes(accessoryId)
          ? prev.filter(id => id !== accessoryId)
          : [...prev, accessoryId]
      );
    }
  };

  const handleSave = () => {
    onSave(selectedOutfit, selectedAccessories);
    onBack();
  };

  return (
    <div className="h-screen bg-gradient-to-br from-purple-50 to-pink-50 relative overflow-hidden">
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-white/80 backdrop-blur-sm z-20 pt-12 pb-4">
        <div className="flex items-center justify-between px-4">
          <Button onClick={onBack} variant="ghost" size="sm">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          
          <h1 className="text-xl">Customize Avatar</h1>
          
          <div className="flex items-center space-x-1 bg-yellow-100 px-3 py-1 rounded-full">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm">{userPoints}</span>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="absolute top-28 left-0 right-0 z-10">
        <div className="flex justify-center">
          <LottieAvatar
            mood={user?.currentMood || 'happy'}
            outfit={selectedOutfit}
            size="xl"
            className="mx-auto"
          />
        </div>
      </div>

      {/* Customization Panel */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl" style={{ height: '60%' }}>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-4 pt-6">
          <button
            onClick={() => setActiveTab('outfits')}
            className={`flex-1 py-3 text-center rounded-t-lg transition-colors ${
              activeTab === 'outfits' 
                ? 'bg-purple-100 text-purple-600 border-b-2 border-purple-600' 
                : 'text-gray-500'
            }`}
          >
            Outfits
          </button>
          <button
            onClick={() => setActiveTab('accessories')}
            className={`flex-1 py-3 text-center rounded-t-lg transition-colors ${
              activeTab === 'accessories' 
                ? 'bg-purple-100 text-purple-600 border-b-2 border-purple-600' 
                : 'text-gray-500'
            }`}
          >
            Accessories
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto" style={{ height: 'calc(100% - 120px)' }}>
          
          {activeTab === 'outfits' && (
            <div className="grid grid-cols-2 gap-4">
              {outfits.map(outfit => (
                <Card 
                  key={outfit.id}
                  className={`cursor-pointer transition-all ${
                    outfit.equipped 
                      ? 'ring-2 ring-purple-500 bg-purple-50' 
                      : outfit.unlocked
                      ? 'hover:shadow-md'
                      : 'opacity-60'
                  }`}
                  onClick={() => selectOutfit(outfit.id)}
                >
                  <CardContent className="p-4 text-center space-y-3">
                    <div className="text-4xl">{outfit.preview}</div>
                    <div>
                      <h4 className="text-sm">{outfit.name}</h4>
                      <div className="flex items-center justify-center space-x-2 mt-2">
                        {outfit.unlocked ? (
                          outfit.equipped ? (
                            <Badge className="bg-green-100 text-green-700">
                              <Check className="w-3 h-3 mr-1" />
                              Equipped
                            </Badge>
                          ) : (
                            <Badge variant="outline">Available</Badge>
                          )
                        ) : (
                          <Badge variant="secondary" className="bg-gray-100">
                            <Lock className="w-3 h-3 mr-1" />
                            {outfit.cost} pts
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'accessories' && (
            <div className="grid grid-cols-2 gap-4">
              {accessories.map(accessory => (
                <Card 
                  key={accessory.id}
                  className={`cursor-pointer transition-all ${
                    accessory.equipped 
                      ? 'ring-2 ring-purple-500 bg-purple-50' 
                      : accessory.unlocked
                      ? 'hover:shadow-md'
                      : 'opacity-60'
                  }`}
                  onClick={() => toggleAccessory(accessory.id)}
                >
                  <CardContent className="p-4 text-center space-y-3">
                    <div className="text-4xl">{accessory.preview}</div>
                    <div>
                      <h4 className="text-sm">{accessory.name}</h4>
                      <div className="flex items-center justify-center space-x-2 mt-2">
                        {accessory.unlocked ? (
                          accessory.equipped ? (
                            <Badge className="bg-green-100 text-green-700">
                              <Check className="w-3 h-3 mr-1" />
                              Equipped
                            </Badge>
                          ) : (
                            <Badge variant="outline">Available</Badge>
                          )
                        ) : (
                          <Badge variant="secondary" className="bg-gray-100">
                            <Lock className="w-3 h-3 mr-1" />
                            {accessory.cost} pts
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
          <Button onClick={handleSave} className="w-full bg-purple-600 hover:bg-purple-700">
            Save Changes
          </Button>
        </div>
      </div>

      {/* Floating Sparkles */}
      <div className="absolute top-40 right-8 animate-ping">
        <span className="text-yellow-400 text-xl">✨</span>
      </div>
      
      <div className="absolute top-56 left-12 animate-bounce" style={{ animationDelay: '0.5s' }}>
        <span className="text-pink-400 text-lg">💫</span>
      </div>
      
      <div className="absolute top-48 right-16 animate-pulse" style={{ animationDelay: '1s' }}>
        <span className="text-purple-400 text-sm">⭐</span>
      </div>
    </div>
  );
}