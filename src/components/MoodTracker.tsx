import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { ArrowLeft } from "lucide-react";

interface MoodTrackerProps {
  user: any;
  onMoodLogged: (mood: string, note: string) => void;
  onBack?: () => void;
}

export function MoodTracker({ user, onMoodLogged, onBack }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [note, setNote] = useState('');
  const [showChart, setShowChart] = useState(false);

  const moods = [
    { id: 'happy', emoji: '😊', label: 'Happy', value: 5 },
    { id: 'calm', emoji: '😌', label: 'Calm', value: 4 },
    { id: 'neutral', emoji: '😐', label: 'Neutral', value: 3 },
    { id: 'sad', emoji: '😢', label: 'Sad', value: 2 },
    { id: 'anxious', emoji: '😰', label: 'Anxious', value: 1 },
    { id: 'stressed', emoji: '😤', label: 'Stressed', value: 1 },
  ];

  // Mock data for the past 7 days
  const moodData = [
    { day: 'Mon', mood: 4 },
    { day: 'Tue', mood: 3 },
    { day: 'Wed', mood: 5 },
    { day: 'Thu', mood: 2 },
    { day: 'Fri', mood: 4 },
    { day: 'Sat', mood: 5 },
    { day: 'Sun', mood: 4 },
  ];

  const handleMoodSubmit = () => {
    if (selectedMood) {
      onMoodLogged(selectedMood, note);
      
      // Show supportive message
      const mood = moods.find(m => m.id === selectedMood);
      let message = "Thanks for checking in with yourself! 💙";
      
      if (mood && mood.value <= 2) {
        message = "You've had a tough day, maybe try a deep breath 💙 You're not alone.";
      } else if (mood && mood.value >= 4) {
        message = "So glad you're feeling good today! ✨ Keep spreading those positive vibes.";
      }
      
      setTimeout(() => {
        alert(message);
        setSelectedMood('');
        setNote('');
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4 pb-20">
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
          <h1>How are you feeling?</h1>
          <p className="text-gray-600">Your feelings matter</p>
        </div>

        {/* Mood Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Your Mood</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {moods.map(mood => (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedMood === mood.id 
                      ? 'border-pink-500 bg-pink-50 scale-105' 
                      : 'border-gray-200 hover:border-pink-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{mood.emoji}</div>
                  <div className="text-sm">{mood.label}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Optional Note */}
        <Card>
          <CardHeader>
            <CardTitle>Optional Note</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="Write one positive thing about today..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button 
          onClick={handleMoodSubmit}
          disabled={!selectedMood}
          className="w-full bg-pink-600 hover:bg-pink-700"
        >
          Log My Mood
        </Button>

        {/* Mood Trend Toggle */}
        <Button 
          variant="outline"
          onClick={() => setShowChart(!showChart)}
          className="w-full"
        >
          {showChart ? 'Hide' : 'Show'} My 7-Day Trend
        </Button>

        {/* Mood Chart */}
        {showChart && (
          <Card>
            <CardHeader>
              <CardTitle>Your Mood Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={moodData}>
                    <XAxis dataKey="day" />
                    <YAxis domain={[1, 5]} hide />
                    <Line 
                      type="monotone" 
                      dataKey="mood" 
                      stroke="#ec4899" 
                      strokeWidth={3}
                      dot={{ fill: '#ec4899', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Keep tracking to see patterns and celebrate progress! 📈
                </p>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}