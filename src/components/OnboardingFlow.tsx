import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar } from "./Avatar";
import { ArrowLeft } from "lucide-react";

interface OnboardingFlowProps {
  onComplete: (userData: any) => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<'welcome' | 'signup' | 'login'>('welcome');
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

  const handleLogin = () => {
    // Mock login - in a real app, this would validate against a backend
    const savedUsers = JSON.parse(localStorage.getItem('withU_users') || '[]');
    const existingUser = savedUsers.find((user: any) => 
      user.email === loginData.email && user.password === loginData.password
    );
    
    if (existingUser) {
      onComplete(existingUser);
    } else {
      alert('Invalid credentials. For demo purposes, try signing up instead.');
    }
  };

  const handleSignup = (finalUserData: any) => {
    // Save to mock user database
    const savedUsers = JSON.parse(localStorage.getItem('withU_users') || '[]');
    const newUser = { ...finalUserData, id: Date.now() };
    savedUsers.push(newUser);
    localStorage.setItem('withU_users', JSON.stringify(savedUsers));
    onComplete(newUser);
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
          onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
        />
        <Input 
          type="password" 
          placeholder="Password" 
          value={userData.password}
          onChange={(e) => setUserData(prev => ({ ...prev, password: e.target.value }))}
        />
        <Button 
          onClick={() => setStep(1)} 
          className="w-full"
          disabled={!userData.name || !userData.email || !userData.password}
        >
          Continue
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
                  className={`p-2 rounded-lg border-2 ${
                    userData.avatar.mood === mood ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
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