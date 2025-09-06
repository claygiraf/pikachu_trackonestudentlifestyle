import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar } from "./Avatar";
import { ArrowLeft } from "lucide-react";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, User, fetchSignInMethodsForEmail } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { app } from "../firebase";

interface OnboardingFlowProps {
  onComplete: (userData: User) => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const auth = getAuth(app);
  const db = getFirestore(app); // 初始化 Firestore
  const [creating, setCreating] = useState(false);
  const [createdUser, setCreatedUser] = useState(null as User | null);
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState('welcome' as 'welcome' | 'signup' | 'login');
  const [emailError, setEmailError] = useState(null as string | null);
  const [passwordError, setPasswordError] = useState(null as string | null);
  const [loginPasswordError, setLoginPasswordError] = useState(null as string | null);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    avatar: { mood: 'happy', accessories: [] as string[] },
    trustedContact: ''
  });
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      onComplete(userCredential.user);
    } catch (error: any) {
      alert(`Failed Login: ${error.message}`);
    }
  };

  const handleSignup = async (finalUserData: any) => {
    if (!createdUser) {
      alert("No user created. Please go back to start.");
      return;
    }
    // 确保 createdUser 是 User 类型
    const userToComplete = createdUser as User;

    try {
      await setDoc(doc(db, "users", createdUser.uid), {
        name: finalUserData.name,
        email: finalUserData.email,
        avatar: finalUserData.avatar,
        trustedContact: finalUserData.trustedContact,
        createdAt: new Date(),
        onboarded: true,
        points: 0, // Initialize points for new users
        unlockedOutfits: ['default', 'formal'], // Default unlocked outfits
        unlockedAccessories: [], // Default unlocked accessories
      });

      onComplete(createdUser);
    } catch (error: any) {
      alert(`Failed Saving User Data: ${error.message}`);
    }
  };

  const goBack = () => {
    if (mode === 'signup' || mode === 'login') {
      if (step > 0) {
        setStep(step - 1);
      } else {
        setMode('welcome');
        setStep(0);
      }
    }
  };

  const handleContinueToAvatar = async () => {
    if (creating) return;
    setCreating(true);
    setEmailError(null);
    setPasswordError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      setEmailError('Please enter a valid email address.');
      setCreating(false);
      return;
    }
    if (userData.password.length < 6) {
      setPasswordError('Password should be at least 6 characters long.');
      setCreating(false);
      return;
    }

    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, userData.email);
      if (signInMethods && signInMethods.length > 0) {
        setEmailError('This email is already registered. Please log in instead.');
        setCreating(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      setCreatedUser(userCredential.user);
      setStep(1);
    } catch (error: any) {
      // Firebase Auth 错误处理
      if (error.code === 'auth/email-already-in-use') {
        setEmailError('This email is already registered. Please log in instead.');
      } else if (error.code === 'auth/weak-password') {
        setPasswordError('Password should be at least 6 characters long.');
      } else {
        alert(`Failed Sign Up: ${error.message}`);
      }
    } finally {
      setCreating(false);
    }
  };

  // Welcome Screen
  if (mode === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl">WithU 💙</h1>
              <p className="text-lg text-gray-600">Your gentle mental health companion</p>
            </div>
            <div className="space-y-3">
              <Button
                onClick={() => { setMode('signup'); setStep(0); }}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Get Started
              </Button>
              <Button
                onClick={() => { setMode('login'); setStep(0); }}
                variant="outline"
                className="w-full"
              >
                Login (Existing User)
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Login Flow
  if (mode === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2 mb-2">
                <Button onClick={goBack} variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              </div>
              <CardTitle>Welcome Back</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={loginData.email}
                onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
              />
              <Input
                type="password"
                placeholder="Password"
                value={loginData.password}
                onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
              />
              <Button
                onClick={handleLogin}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!loginData.email || !loginData.password}
              >
                Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const signupSteps = [

    // Sign Up
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2 mb-2">
          <Button onClick={goBack} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </div>
        <CardTitle>Create Your Account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Your name"
          value={userData.name}
          onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
        />
        <Input
          type="email"
          placeholder="Email"
          value={userData.email}
          onChange={(e) => {
            setUserData(prev => ({ ...prev, email: e.target.value }));
            setEmailError(null); // 清除错误
          }}
          className={emailError ? "border-red-500" : ""}
        />
        {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
        <Input
          type="password"
          placeholder="Password"
          value={userData.password}
          onChange={(e) => {
            setUserData(prev => ({ ...prev, password: e.target.value }));
            setPasswordError(null); // 清除错误
          }}
          className={passwordError ? "border-red-500" : ""}
        />
        {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
        <Button
          onClick={handleContinueToAvatar}
          className="w-full"
          disabled={
            creating ||
            !userData.name ||
            !userData.email ||
            !userData.password
          }
        >
          {creating ? "Creating..." : "Continue"}
        </Button>
      </CardContent>
    </Card>,

    // Avatar Selection
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2 mb-2">
          <Button onClick={goBack} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </div>
        <CardTitle>Choose Your Avatar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center mb-4">
          <Avatar
            mood={userData.avatar.mood}
            accessories={userData.avatar.accessories}
            size="lg"
          />
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-2">Base Mood</label>
            <div className="grid grid-cols-4 gap-2">
              {['happy', 'calm', 'excited', 'tired'].map(mood => (
                <button
                  key={mood}
                  onClick={() => setUserData(prev => ({
                    ...prev,
                    avatar: { ...prev.avatar, mood }
                  }))}
                  className={`p-2 rounded-lg border-2 ${userData.avatar.mood === mood ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                >
                  <Avatar mood={mood} size="sm" />
                </button>
              ))}
            </div>
          </div>
        </div>
        <Button onClick={() => setStep(2)} className="w-full">
          Continue
        </Button>
      </CardContent>
    </Card>,

    // Trusted Contact
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2 mb-2">
          <Button onClick={goBack} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </div>
        <CardTitle>Emergency Contact</CardTitle>
        <p className="text-sm text-gray-600">Optional: Add a trusted contact for emergency situations</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Phone number (optional)"
          value={userData.trustedContact}
          onChange={(e) => setUserData(prev => ({ ...prev, trustedContact: e.target.value }))}
        />
        <div className="space-y-2">
          <Button
            onClick={() => handleSignup(userData)}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Complete Setup
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleSignup(userData)}
            className="w-full"
          >
            Skip for now
          </Button>
        </div>
      </CardContent>
    </Card>
  ];

  // Signup Flow
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {signupSteps[step]}
      </div>
    </div>
  );
}
