//Emergency Mode.
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Heart, Phone, Users, Wind, Eye, Ear, Hand, Flower, Lightbulb } from "lucide-react";

interface EmergencyModeProps {
  user: any;
  onBack: () => void;
}

export function EmergencyMode({ user, onBack }: EmergencyModeProps) {
  const [currentActivity, setCurrentActivity] = useState<string | null>(null);
  const [breathingCount, setBreathingCount] = useState(0);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');

  const startBreathing = () => {
    setCurrentActivity('breathing');
    setBreathingCount(0);
    setBreathingPhase('inhale');
    
    // Simulate breathing cycle
    let count = 0;
    const interval = setInterval(() => {
      count++;
      if (count <= 4) {
        setBreathingPhase('inhale');
      } else if (count <= 8) {
        setBreathingPhase('hold');
      } else if (count <= 14) {
        setBreathingPhase('exhale');
      } else {
        count = 0;
        setBreathingCount(prev => prev + 1);
      }
    }, 1000);

    // Stop after 5 cycles
    setTimeout(() => {
      clearInterval(interval);
      setCurrentActivity(null);
    }, 70000);
  };

  const groundingSteps = [
    { icon: Eye, text: "5 things you can SEE around you" },
    { icon: Ear, text: "4 things you can HEAR right now" },
    { icon: Hand, text: "3 things you can TOUCH or feel" },
    { icon: Flower, text: "2 things you can SMELL nearby" },
    { icon: Hand, text: "1 thing you can TASTE" },
  ];

  const affirmations = [
    "Hey, just take some rest",
    "I am safe right now in this moment",
    "This feeling will pass, just like clouds in the sky",
    "I am stronger than I know",
    "I deserve love, care, and support",
    "One breath at a time, one moment at a time",
    "I have survived difficult moments before",
    "There are people who care about me",
    "It's okay to not be okay sometimes"
  ];

  const callTrustedContact = () => {
    if (user?.trustedContact) {
      window.location.href = `tel:${user.trustedContact}`;
    } else {
      alert("No trusted contact set up. You can add one in your profile settings.");
    }
  };

  const callHotline = () => {
    window.location.href = "tel:988"; // Suicide & Crisis Lifeline
  };

  if (currentActivity === 'breathing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Breathing Exercise</CardTitle>
            <p className="text-gray-600">Follow the circle and breathe with me</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative">
              <div 
                className={`w-32 h-32 mx-auto rounded-full border-4 border-blue-500 transition-all duration-1000 ${
                  breathingPhase === 'inhale' ? 'scale-125 bg-blue-100' :
                  breathingPhase === 'hold' ? 'scale-125 bg-blue-200' :
                  'scale-100 bg-blue-50'
                }`}
              >
                <div className="flex items-center justify-center h-full">
                  <Wind className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl capitalize">{breathingPhase}</h3>
              <p className="text-gray-600">
                {breathingPhase === 'inhale' && "Breathe in slowly through your nose"}
                {breathingPhase === 'hold' && "Hold your breath gently"}
                {breathingPhase === 'exhale' && "Breathe out slowly through your mouth"}
              </p>
              <p className="text-sm">Cycle {breathingCount + 1} of 5</p>
            </div>

            <Button 
              onClick={() => setCurrentActivity(null)}
              variant="outline"
            >
              Stop Exercise
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Immediate Support Message */}
        <Card className="bg-white border-red-200">
          <CardContent className="p-6 text-center">
            <Heart className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h1 className="text-xl mb-2">We're here with you 💙</h1>
            <p className="text-gray-700 leading-relaxed">
              Take a moment. You're not alone. Your life has value and meaning. 
              Let's get through this together, one moment at a time.
            </p>
          </CardContent>
        </Card>

        {/* Immediate Help Options */}
        <Card className="border-red-300">
          <CardHeader>
            <CardTitle className="text-red-700">I need help right now</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={callHotline}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call Crisis Lifeline (988)
            </Button>
            
            {user?.trustedContact && (
              <Button 
                onClick={callTrustedContact}
                variant="outline"
                className="w-full border-red-300 text-red-700 hover:bg-red-50"
              >
                <Users className="w-4 h-4 mr-2" />
                Call My Trusted Contact
              </Button>
            )}
            
            <p className="text-xs text-gray-600 text-center">
              Available 24/7 • Free • Confidential
            </p>
          </CardContent>
        </Card>

        {/* Coping Strategies */}
        <Card>
          <CardHeader>
            <CardTitle>Try these coping strategies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            
            {/* Breathing Exercise */}
            <Button 
              onClick={startBreathing}
              variant="outline"
              className="w-full h-auto p-4 flex items-start space-x-3 text-left"
            >
              <Wind className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4>Breathing Exercise</h4>
                <p className="text-sm text-gray-600">
                  Guided 4-4-6 breathing pattern to help calm your mind
                </p>
              </div>
            </Button>

            {/* Grounding Exercise */}
            <Button 
              onClick={() => setCurrentActivity('grounding')}
              variant="outline"
              className="w-full h-auto p-4 flex items-start space-x-3 text-left"
            >
              <Eye className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h4>5-4-3-2-1 Grounding</h4>
                <p className="text-sm text-gray-600">
                  Use your senses to connect with the present moment
                </p>
              </div>
            </Button>

            {/* Positive Affirmations */}
            <Button 
              onClick={() => setCurrentActivity('affirmations')}
              variant="outline"
              className="w-full h-auto p-4 flex items-start space-x-3 text-left"
            >
              <Lightbulb className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
              <div>
                <h4>Positive Affirmations</h4>
                <p className="text-sm text-gray-600">
                  Gentle reminders of your strength and worth
                </p>
              </div>
            </Button>

          </CardContent>
        </Card>

        {/* Grounding Activity */}
        {currentActivity === 'grounding' && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle>5-4-3-2-1 Grounding Exercise</CardTitle>
              <p className="text-sm text-gray-600">Take your time with each step</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {groundingSteps.map((step, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                  <step.icon className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <p>{step.text}</p>
                </div>
              ))}
              <Button 
                onClick={() => setCurrentActivity(null)}
                className="w-full mt-4"
              >
                I've completed this exercise
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Affirmations */}
        {currentActivity === 'affirmations' && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle>Remember These Truths</CardTitle>
              <p className="text-sm text-gray-600">Read these slowly and let them sink in</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {affirmations.map((affirmation, index) => (
                <div key={index} className="p-3 bg-white rounded-lg border-l-4 border-yellow-400">
                  <p className="italic">"{affirmation}"</p>
                </div>
              ))}
              <Button 
                onClick={() => setCurrentActivity(null)}
                className="w-full mt-4"
              >
                Thank you
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Back Button */}
        <Button 
          onClick={onBack}
          variant="ghost"
          className="w-full"
        >
          Return to App
        </Button>

      </div>
    </div>
  );
}
