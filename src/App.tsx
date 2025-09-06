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

interface User {
  name: string;
  email: string;
  password: string;
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
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    // Check if user data exists in localStorage
    const savedUser = localStorage.getItem('withU_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleOnboardingComplete = (userData: any) => {
    const newUser: User = {
      ...userData,
      avatar: {
        ...userData.avatar,
        outfit: 'default'
      },
      points: userData.points || 0,
      streak: userData.streak || 1,
      currentMood: userData.avatar.mood,
      onboarded: true
    };
    setUser(newUser);
    localStorage.setItem('withU_user', JSON.stringify(newUser));
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('withU_user', JSON.stringify(updatedUser));
  };

  const handleMoodLogged = (mood: string, note: string) => {
    if (user) {
      const updatedUser = {
        ...user,
        currentMood: mood,
        points: user.points + 5
      };
      setUser(updatedUser);
      localStorage.setItem('withU_user', JSON.stringify(updatedUser));
    }
  };

  const handlePointsEarned = (points: number) => {
    if (user) {
      const updatedUser = {
        ...user,
        points: user.points + points
      };
      setUser(updatedUser);
      localStorage.setItem('withU_user', JSON.stringify(updatedUser));
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

  const handleAvatarSave = (outfit: string, accessories: string[]) => {
    if (user) {
      const updatedUser = {
        ...user,
        avatar: {
          ...user.avatar,
          outfit,
          accessories
        }
      };
      setUser(updatedUser);
      localStorage.setItem('withU_user', JSON.stringify(updatedUser));
    }
  };

  // Show onboarding if user hasn't completed it
  if (!user || !user.onboarded) {
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

  const handleLogout = () => {
    localStorage.removeItem('withU_user');
    setUser(null);
    setCurrentPage('home');
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