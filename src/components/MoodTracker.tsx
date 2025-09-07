import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from "recharts";
import { ArrowLeft, Sparkles } from "lucide-react"; // Import Sparkles icon
import { db } from "../firebase"; // Import Firestore db
import { doc, updateDoc, getDoc, arrayUnion } from "firebase/firestore"; // Import Firestore functions
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore"; // Keep for fetching mood data for chart
import { genAI } from "../gemini"; // Import Gemini AI
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog"; // Import AlertDialog components

interface MoodData {
  day: string;
  mood: number;
  fullDate: Date;
}

interface MoodTrackerProps {
  user: any;
  onMoodLogged: (mood: string, note: string) => void;
  onBack?: () => void;
  onNeedHelp?: () => void;
}

export const moods = [ // Export moods array
  { id: 'happy', emoji: '😊', label: 'Happy', value: 2 },
  { id: 'calm', emoji: '😌', label: 'Calm', value: 1 },
  { id: 'neutral', emoji: '😐', label: 'Neutral', value: 0 },
  { id: 'sad', emoji: '😢', label: 'Sad', value: -1 },
  { id: 'anxious', emoji: '😰', label: 'Anxious', value: -2 },
  { id: 'stressed', emoji: '😤', label: 'Stressed', value: -2 },
];

export function MoodTracker({ user, onMoodLogged, onBack, onNeedHelp }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [note, setNote] = useState('');
  const [showChart, setShowChart] = useState(false);
  const [moodData, setMoodData] = useState<MoodData[]>([]);
  const [isLoadingMood, setIsLoadingMood] = useState(false);
  const [showGeminiDialog, setShowGeminiDialog] = useState(false);
  const negativeDays = moodData.filter((mood) => mood.mood < 0).length;
  const showHelpPrompt = negativeDays >= 5;
  const [geminiDialogContent, setGeminiDialogContent] = useState({ title: '', description: '' });

  const moodValueMap: Record<string, number> = {
    neutral: 0,
    calm: 1,
    happy: 2,
    sad: -1,
    anxious: -2,
    stressed: -2,
  };

  const getMoodValue = (moodId: string) => {
    return moodValueMap[moodId] ?? 0;
  };


  const fetchMoodData = async () => {
    if (!user?.uid) return;
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);
    let fetchedData: MoodData[] = [];
    if (userDocSnap.exists()) {
      const moodsMap = userDocSnap.data().moods || {};
      fetchedData = Object.keys(moodsMap).map(dateKey => {
        const moodEntry = moodsMap[dateKey];
        const date = moodEntry.timestamp instanceof Date
          ? moodEntry.timestamp
          : moodEntry.timestamp?.toDate?.() || new Date(dateKey);
        return {
          day: `${date.getMonth() + 1}/${date.getDate()}`, // 显示为 M/D
          mood: getMoodValue(moodEntry.mood),
          fullDate: date,
        };
      }).sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());
    }
    // Limit to last 7 days for chart
    const last7 = fetchedData.slice(-7);
    setMoodData(last7);
  };

  useEffect(() => {
    fetchMoodData();
  }, [user]);

  const handleMoodSubmit = async () => {
    if (!selectedMood || !user?.uid) return;

    const today = new Date();
    // Generate docId based on local date (Singapore time)
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const docId = `${year}-${month}-${day}`; // YYYY-MM-DD local date as document ID

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const moodsMap = userDocSnap.exists() ? userDocSnap.data().moods || {} : {};
      const alreadyLogged = !!moodsMap[docId];

      await updateDoc(userDocRef, {
        [`moods.${docId}`]: {
          mood: selectedMood,
          note: note,
          timestamp: today,
        },
      });

      if (!alreadyLogged) {
        const currentPoints = userDocSnap.exists() ? userDocSnap.data().points || 0 : 0;
        await updateDoc(userDocRef, {
          points: currentPoints + 5,
        });
        toast("Mood logged! You earned a point for checking in today.");
      }
      onMoodLogged(selectedMood, note);

      const mood = moods.find(m => m.id === selectedMood);
      let message = "Thanks for checking in with yourself! 💙";

      if (onBack) {
        onBack(); // Navigate back to the previous page (HomePage)
      }

      if (mood && mood.value <= 2) {
        message = "You've had a tough day, maybe try a deep breath 💙 You're not alone.";
      } else if (mood && mood.value >= 4) {
        message = "So glad you're feeling good today! ✨ Keep spreading those positive vibes.";
      }

      setGeminiDialogContent({ title: "Mood Logged!", description: "Thanks for checking in with yourself! 💙" });
      setShowGeminiDialog(true);
      setSelectedMood('');
      setNote('');
      fetchMoodData();
      if (onBack) onBack();
    } catch (error) {
      console.error("Error logging mood: ", error);
      setGeminiDialogContent({ title: "Error Logging Mood", description: "Failed to log mood. Please try again." });
      setShowGeminiDialog(true);
    }
  };

  const analyzeMoodWithGemini = async () => {
    if (!note.trim()) {
      alert("Please describe your day in the note section first.");
      return;
    }

    setIsLoadingMood(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });
      const prompt = `Based on the following description of a day, choose the most appropriate mood from these options: happy, calm, neutral, sad, anxious, stressed. Respond with only the mood ID (e.g., "happy").\n\nDescription: "${note}"`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim().toLowerCase();

      const recognizedMood = moods.find(m => text.includes(m.id));
      if (recognizedMood) {
        setSelectedMood(recognizedMood.id);
        setGeminiDialogContent({ title: "AI Mood Suggestion", description: `Gemini suggests your mood is: ${recognizedMood.label}` });
        setShowGeminiDialog(true);
      } else {
        setGeminiDialogContent({ title: "AI Mood Suggestion", description: "Gemini couldn't determine a clear mood. Please select manually." });
        setShowGeminiDialog(true);
      }
    } catch (error) {
      console.error("Error analyzing mood with Gemini:", error);
      setGeminiDialogContent({ title: "AI Error", description: "Failed to analyze mood with AI. Please try again." });
      setShowGeminiDialog(true);
    } finally {
      setIsLoadingMood(false);
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
                  className={`p-4 rounded-lg border-2 transition-all ${selectedMood === mood.id
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

        {/* Optional Note / AI Mood Suggestion */}
        <Card>
          <CardHeader>
            <CardTitle>Optional Note or AI Mood Suggestion</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Describe your day, and AI can suggest a mood..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="resize-none mb-2"
              rows={3}
            />
            <Button
              onClick={analyzeMoodWithGemini}
              disabled={!note.trim() || isLoadingMood}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isLoadingMood ? 'Analyzing...' : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Suggest Mood with AI
                </>
              )}
            </Button>
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
                    <YAxis domain={[-2, 2]} hide={false} />
                    <Line
                      type="monotone"
                      dataKey="mood"
                      stroke="#ec4899"
                      strokeWidth={3}
                      dot={{ fill: '#ec4899', strokeWidth: 2, r: 6 }}
                    />
                    {/* neutral line*/}
                    <ReferenceLine y={0} stroke="#888" strokeDasharray="3 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Keep tracking to see patterns and celebrate progress! 📈
                </p>
              </div>

              {/* Emergency Suggestion */}
              {showHelpPrompt && (
                <div className="mt-6 text-center">
                  <p className="text-blue-600 font-semibold mb-3">
                    We noticed several tough days 💔 Remember, you are not alone.
                  </p>
                  <Button 
                    className="bg-red-500 hover:bg-red-600 text-white"
                    onClick={() => onNeedHelp && onNeedHelp()}   
                  >
                    I Need Help
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

      </div>

      {/* Gemini Dialog */}
      <AlertDialog open={showGeminiDialog} onOpenChange={setShowGeminiDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{geminiDialogContent.title}</AlertDialogTitle>
            <AlertDialogDescription>{geminiDialogContent.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowGeminiDialog(false)}>Okay</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}