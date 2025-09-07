import { useState, useEffect } from "react";
import { Toaster } from 'sonner';
import { OnboardingFlow } from "./components/OnboardingFlow";
import { MobileHomePage } from "./components/MobileHomePage";
import { AvatarCustomization } from "./components/AvatarCustomization";
import { MoodTracker } from "./components/MoodTracker";
import { AIChat } from "./components/AIChat";
import { GoalsPage } from "./components/GoalsPage";
import { JournalPage } from "./components/JournalPage";
import { EmergencyMode } from "./components/EmergencyMode";
import { ProfilePage } from "./components/ProfilePage";
import { getAuth, onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { app } from "./firebase";
import blackGif from './components/avatar/black.gif'; // Import black.gif
import casualGif from './components/avatar/casual.gif'; // Import casual.gif
import sportsGif from './components/avatar/sports.gif'; // Import sports.gif


interface UserData {
  uid: string; // Add uid to UserData interface
  name: string;
  email: string;
  avatar: {
    mood: string;
    outfit: string;
    accessories: string[];
  };
  trustedContact: string;
  points: number;
  streak: number;
  currentMood: LottieAvatarProps['mood']; // Change type to match LottieAvatarProps['mood']
  onboarded: boolean;
  unlockedOutfits: string[];
  unlockedAccessories: string[];
}

export default function App() {
  const auth = getAuth(app);
  const db = getFirestore(app);
  const [user, setUser] = useState(null as UserData | null);
  const [firebaseUser, setFirebaseUser] = useState(null as FirebaseUser | null);
  const [currentPage, setCurrentPage] = useState('home');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUser({ ...userDocSnap.data(), uid: user.uid } as UserData); // Add uid from firebaseUser
        } else {
          // User is authenticated but no Firestore data, likely just signed up
          // OnboardingFlow will handle initial Firestore data creation
          setUser(null); // Keep user null until onboarding is complete
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db]);

  useEffect(() => {
    // 只在切换到 home 或 mood 页时刷新 user
    if (currentPage === 'home' || currentPage === 'mood') {
      reloadUser();
    }
  }, [currentPage]);

  const handleOnboardingComplete = async (firebaseUser: FirebaseUser) => {
    setFirebaseUser(firebaseUser);
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      setUser({ ...userDocSnap.data(), uid: firebaseUser.uid } as UserData); // Add uid from firebaseUser
    } else {

      const initialUserData: UserData = {
        uid: firebaseUser.uid, // Add uid here
        name: firebaseUser.displayName || '',
        email: firebaseUser.email || '',
        avatar: { mood: 'neutral', outfit: 'default', accessories: [] }, // Default to 'neutral'
        trustedContact: '',
        points: 0,
        streak: 0,
        currentMood: 'neutral', // Default to 'neutral'
        onboarded: true,
        unlockedOutfits: ['default', 'formal'],
        unlockedAccessories: [],
      };
      await setDoc(userDocRef, initialUserData);
      setUser(initialUserData);
    }
  };

  const reloadUser = async () => {
    if (firebaseUser) {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        setUser({ ...userDocSnap.data(), uid: firebaseUser.uid } as UserData);
      }
    }
  };

  const handleUserUpdate = async (updatedUser: UserData) => {
    if (firebaseUser) {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      await updateDoc(userDocRef, updatedUser as { [key: string]: any });
      setUser({ ...updatedUser, uid: firebaseUser.uid }); // Ensure uid is present
    }
  };

  const handleUnlockItem = async (type: 'outfit' | 'accessory', itemId: string, cost: number) => {
    if (user && firebaseUser && user.points >= cost) {
      const updatedUser = { ...user };
      if (type === 'outfit') {
        updatedUser.unlockedOutfits = [...user.unlockedOutfits, itemId];
      } else {
        updatedUser.unlockedAccessories = [...user.unlockedAccessories, itemId];
      }
      updatedUser.points -= cost;

      const userDocRef = doc(db, "users", firebaseUser.uid);
      await updateDoc(userDocRef, {
        points: updatedUser.points,
        unlockedOutfits: updatedUser.unlockedOutfits,
        unlockedAccessories: updatedUser.unlockedAccessories,
      });
      setUser(updatedUser);
      return true;
    }
    return false;
  };

  const handleMoodLogged = async (mood: string, note: string) => {
    if (user && firebaseUser) {
      const updatedUser: UserData = { // Explicitly type updatedUser
        ...user,
        currentMood: mood as LottieAvatarProps['mood'], // Cast to correct type
      };
      const userDocRef = doc(db, "users", firebaseUser.uid);
      await updateDoc(userDocRef, {
        currentMood: updatedUser.currentMood,
      });
      setUser(updatedUser);
    }
  };

  const handlePointsEarned = async (points: number) => {
    if (user && firebaseUser) {
      const updatedUser = {
        ...user,
        points: user.points + points
      };
      const userDocRef = doc(db, "users", firebaseUser.uid);
      await updateDoc(userDocRef, {
        points: updatedUser.points
      });
      setUser(updatedUser);
    }
  };

  const handleNavigation = (page: string) => {
    // Handle special navigation cases
    if (page === 'chat') {
      setCurrentPage('chat');
      return;
    }
    setCurrentPage(page);
  };

  const handleEmergencyTrigger = () => {
    setCurrentPage('emergency');
  };

  const handleAvatarCustomization = () => {
    setCurrentPage('avatar');
  };

  const handleAvatarSave = async (outfit: string, accessories: string[]) => {
    if (user && firebaseUser) {
      const userDocRef = doc(db, "users", firebaseUser.uid);

      const avatarToSave: typeof user.avatar = {
        outfit,
        accessories,
        mood: user.avatar.mood ?? 'neutral'
      };

      await updateDoc(userDocRef, {
        avatar: avatarToSave
      });

      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        setUser({ ...userDocSnap.data(), uid: firebaseUser.uid } as UserData);
      }
    }
  };

  if (loading) {
    return <div>Loading authentication...</div>;
  }

  // Show onboarding if user hasn't completed it or no user data in Firestore
  if (!firebaseUser || !user?.onboarded) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  // Emergency mode (no navigation)
  if (currentPage === 'emergency') {
    return (
      <EmergencyMode 
        user={user}
        onBack={() => setCurrentPage('home')}
      />
    );
  }

  // Avatar customization (no navigation)
  if (currentPage === 'avatar') {
    return (
      <AvatarCustomization
        user={user}
        onBack={() => setCurrentPage('home')}
        onSave={handleAvatarSave}
        onUnlockItem={handleUnlockItem} 
      />
    );
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
      setCurrentPage('home');
    } catch (error: any) {
      alert(`Failed Logout: ${error.message}`);
    }
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  const renderCurrentPage = () => {
    const currentOverlayGifs: string[] = [];
    if (user?.avatar?.outfit === 'formal') {
      currentOverlayGifs.push(blackGif);
    } else if (user?.avatar?.outfit === 'casual') {
      currentOverlayGifs.push(casualGif);
    } else if (user?.avatar?.outfit === 'sporty') {
      currentOverlayGifs.push(sportsGif);
    }
    // Future: Add more GIFs based on user?.avatar?.accessories

    switch (currentPage) {
      case 'home':
        return <MobileHomePage user={user} onNavigate={handleNavigation} onAvatarClick={handleAvatarCustomization} overlayGifs={currentOverlayGifs} mood={user.currentMood} />;
      case 'mood':
        return (
          <MoodTracker
            user={user}
            onMoodLogged={handleMoodLogged}
            onBack={handleBackToHome}
            onNeedHelp={handleEmergencyTrigger}
          />
        );
      case 'chat':
        return <AIChat user={user} onEmergencyTrigger={handleEmergencyTrigger} onBack={handleBackToHome} />;
      case 'goals':
        return <GoalsPage user={user} onPointsEarned={handlePointsEarned} onBack={handleBackToHome} />;
      case 'journal':
        return <JournalPage user={user} onBack={handleBackToHome} />;
      case 'profile':
        return <ProfilePage user={user} onUserUpdate={handleUserUpdate} onBack={handleBackToHome} onLogout={handleLogout} />;
      default:
        return <MobileHomePage user={user} onNavigate={handleNavigation} onAvatarClick={handleAvatarCustomization} overlayGifs={currentOverlayGifs} mood={user.currentMood} />;
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 overflow-hidden">
      {renderCurrentPage()}
      <Toaster/>
    </div>
  );
  
}
