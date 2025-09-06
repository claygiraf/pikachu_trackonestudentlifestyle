import { useState, useEffect } from "react";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { MobileHomePage } from "./components/MobileHomePage";
import { AvatarCustomization } from "./components/AvatarCustomization";
import { MoodTracker } from "./components/MoodTracker";
import { AIChat } from "./components/AIChat";
import { GoalsPage } from "./components/GoalsPage";
import { JournalPage } from "./components/JournalPage";
import { EmergencyMode } from "./components/EmergencyMode";
import { ProfilePage } from "./components/ProfilePage";
import { MobileNavigation } from "./components/MobileNavigation";
import { getAuth, onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { app } from "./firebase";

interface UserData {
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
  currentMood: string;
  onboarded: boolean;
}

export default function App() {
  const auth = getAuth(app);
  const db = getFirestore(app);
  const [user, setUser] = useState<UserData | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUser(userDocSnap.data() as UserData);
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

  const handleOnboardingComplete = async (userData: FirebaseUser) => {
    setFirebaseUser(userData);
    const userDocRef = doc(db, "users", userData.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      setUser(userDocSnap.data() as UserData);
    }
  };

  const handleUserUpdate = async (updatedUser: UserData) => {
    if (firebaseUser) {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      await updateDoc(userDocRef, updatedUser as { [key: string]: any });
      setUser(updatedUser);
    }
  };

  const handleMoodLogged = async (mood: string, note: string) => {
    if (user && firebaseUser) {
      const updatedUser = {
        ...user,
        currentMood: mood,
        points: user.points + 5
      };
      const userDocRef = doc(db, "users", firebaseUser.uid);
      await updateDoc(userDocRef, {
        currentMood: updatedUser.currentMood,
        points: updatedUser.points
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
      const updatedUser = {
        ...user,
        avatar: {
          ...user.avatar,
          outfit,
          accessories
        }
      };
      const userDocRef = doc(db, "users", firebaseUser.uid);
      await updateDoc(userDocRef, {
        avatar: updatedUser.avatar
      });
      setUser(updatedUser);
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
    switch (currentPage) {
      case 'home':
        return <MobileHomePage user={user} onNavigate={handleNavigation} onAvatarClick={handleAvatarCustomization} />;
      case 'mood':
        return <MoodTracker user={user} onMoodLogged={handleMoodLogged} onBack={handleBackToHome} />;
      case 'chat':
        return <AIChat user={user} onEmergencyTrigger={handleEmergencyTrigger} onBack={handleBackToHome} />;
      case 'goals':
        return <GoalsPage user={user} onPointsEarned={handlePointsEarned} onBack={handleBackToHome} />;
      case 'journal':
        return <JournalPage user={user} onBack={handleBackToHome} />;
      case 'profile':
        return <ProfilePage user={user} onUserUpdate={handleUserUpdate} onBack={handleBackToHome} onLogout={handleLogout} />;
      default:
        return <MobileHomePage user={user} onNavigate={handleNavigation} onAvatarClick={handleAvatarCustomization} />;
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 overflow-hidden">
      {renderCurrentPage()}
    </div>
  );
}
