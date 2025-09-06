import { useState } from "react";
import { LottieAvatar } from "./LottieAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ArrowLeft, Star, Lock, Check } from "lucide-react";
import blackGif from './avatar/black.gif'; // Import black.gif
import casualGif from './avatar/casual.gif'; // Import casual.gif
import sportsGif from './avatar/sports.gif'; // Import sports.gif
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog"; // Import AlertDialog components

interface AvatarCustomizationProps {
  user: any;
  onBack: () => void;
  onSave: (outfit: string, accessories: string[]) => void;
  onUnlockItem: (type: 'outfit' | 'accessory', itemId: string, cost: number) => Promise<boolean>;
}

interface BaseOutfitItem {
  id: string;
  name: string;
  type: 'outfit' | 'accessory';
  cost: number;
  preview: string;
}

interface OutfitItem extends BaseOutfitItem {
  unlocked: boolean;
  equipped: boolean;
}

export function AvatarCustomization({ user, onBack, onSave, onUnlockItem }: AvatarCustomizationProps) {
  const [selectedOutfit, setSelectedOutfit] = useState(user?.avatar?.outfit || 'default');
  const [selectedAccessories, setSelectedAccessories] = useState(user?.avatar?.accessories || [] as string[]);
  const [activeTab, setActiveTab] = useState('outfits' as 'outfits' | 'accessories');
  const [itemToUnlock, setItemToUnlock] = useState(null as { type: 'outfit' | 'accessory', item: OutfitItem } | null); // State to hold item to be unlocked

  const userPoints = user?.points || 0;
  const unlockedOutfits = user?.unlockedOutfits || ['default', 'formal'];
  const unlockedAccessories = user?.unlockedAccessories || [];

  const baseOutfits: BaseOutfitItem[] = [
    { id: 'default', name: 'Default', type: 'outfit', cost: 0, preview: '👕' },
    { id: 'casual', name: 'Casual Wear', type: 'outfit', cost: 150, preview: '👔' },
    { id: 'formal', name: 'Formal Suit', type: 'outfit', cost: 0, preview: '🤵' }, // Formal is default unlocked
    { id: 'sporty', name: 'Sports Outfit', type: 'outfit', cost: 200, preview: '🏃' },
    { id: 'elegant', name: 'Elegant Style', type: 'outfit', cost: 300, preview: '💃' },
  ];

  const baseAccessories: BaseOutfitItem[] = [
    { id: 'hat', name: 'Cool Hat', type: 'accessory', cost: 100, preview: '🎩' },
    { id: 'glasses', name: 'Smart Glasses', type: 'accessory', cost: 120, preview: '👓' },
    { id: 'watch', name: 'Digital Watch', type: 'accessory', cost: 180, preview: '⌚' },
    { id: 'necklace', name: 'Sparkle Necklace', type: 'accessory', cost: 250, preview: '📿' },
  ];

  const outfits: OutfitItem[] = baseOutfits.map(outfit => ({
    ...outfit,
    unlocked: unlockedOutfits.includes(outfit.id),
    equipped: selectedOutfit === outfit.id
  }));

  const accessories: OutfitItem[] = baseAccessories.map(accessory => ({
    ...accessory,
    unlocked: unlockedAccessories.includes(accessory.id),
    equipped: selectedAccessories.includes(accessory.id)
  }));

  const selectOutfit = async (outfitId: string) => {
    const outfit = outfits.find(o => o.id === outfitId);
    if (!outfit) return;

    if (outfit.unlocked) {
      setSelectedOutfit(outfitId);
    } else if (userPoints >= outfit.cost) {
      setItemToUnlock({ type: 'outfit', item: outfit }); // Set item to unlock for confirmation
    } else {
      alert(`Not enough points to unlock ${outfit.name}. You need ${outfit.cost} points.`);
    }
  };

  const toggleAccessory = async (accessoryId: string) => {
    const accessory = accessories.find(a => a.id === accessoryId);
    if (!accessory) return;

    if (accessory.unlocked) {
      setSelectedAccessories(prev =>
        prev.includes(accessoryId)
          ? prev.filter(id => id !== accessoryId)
          : [...prev, accessoryId]
      );
    } else if (userPoints >= accessory.cost) {
      setItemToUnlock({ type: 'accessory', item: accessory }); // Set item to unlock for confirmation
    } else {
      alert(`Not enough points to unlock ${accessory.name}. You need ${accessory.cost} points.`);
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
            size="xl"
            className="mx-auto"
            overlayGifs={
              selectedOutfit === 'formal' ? [blackGif] :
              selectedOutfit === 'casual' ? [casualGif] :
              selectedOutfit === 'sporty' ? [sportsGif] :
              []
            } // 根据选择的套装动态添加叠加 GIF
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

      {/* Unlock Confirmation Dialog */}
      <AlertDialog open={!!itemToUnlock} onOpenChange={() => setItemToUnlock(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Purchase</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unlock "{itemToUnlock?.item.name}" for {itemToUnlock?.item.cost} points?
              You currently have {userPoints} points.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToUnlock(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              if (itemToUnlock) {
                const success = await onUnlockItem(itemToUnlock.type, itemToUnlock.item.id, itemToUnlock.item.cost);
                if (success) {
                  if (itemToUnlock.type === 'outfit') {
                    setSelectedOutfit(itemToUnlock.item.id);
                  } else {
                    setSelectedAccessories(prev => [...prev, itemToUnlock.item.id]);
                  }
                  alert(`Successfully unlocked ${itemToUnlock.item.name}!`);
                } else {
                  alert("Failed to unlock item. Not enough points or an error occurred.");
                }
                setItemToUnlock(null); // Close dialog
              }
            }}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
