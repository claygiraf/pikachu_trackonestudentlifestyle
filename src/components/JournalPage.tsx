import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Calendar, Heart, Edit3, Sparkles, ArrowLeft, Save } from "lucide-react"; // Added Save icon
import { db } from "../firebase"; // Import Firestore db
import { doc, updateDoc, getDoc } from "firebase/firestore"; // Import Firestore functions
import { genAI } from "../gemini"; // Import Gemini AI
import { toast } from "sonner"; // Import toast for notifications
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog"; // Import AlertDialog components

interface JournalPageProps {
  user: any;
  onBack?: () => void;
}

interface JournalEntry {
  date: Date;
  question: string;
  answer: string;
  timestamp: Date;
  originalPrompt?: string; // Optional, if the prompt was adjusted
}

export function JournalPage({ user, onBack }: JournalPageProps) {
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [journalEntries, setJournalEntries] = useState<Record<string, JournalEntry>>({});
  const [todaysQuestion, setTodaysQuestion] = useState('');
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isEditingToday, setIsEditingToday] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [alertDialogContent, setAlertDialogContent] = useState({ title: '', description: '' });

  const getTodaysDateId = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`; // YYYY-MM-DD local date as document ID
  };

  const todaysDateId = getTodaysDateId();

  const fetchJournalEntries = async () => {
    if (!user?.uid) return;
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const journalWall = userDocSnap.data().JournalWall || {};
      const fetchedEntries: Record<string, JournalEntry> = {};
      for (const dateKey in journalWall) {
        const entry = journalWall[dateKey];
        fetchedEntries[dateKey] = {
          date: entry.timestamp?.toDate ? entry.timestamp.toDate() : new Date(dateKey),
          question: entry.question,
          answer: entry.answer,
          timestamp: entry.timestamp?.toDate ? entry.timestamp.toDate() : new Date(dateKey),
          originalPrompt: entry.originalPrompt,
        };
      }
      setJournalEntries(fetchedEntries);
    }
  };

  useEffect(() => {
    fetchJournalEntries();
  }, [user]);

  const hasEntryToday = !!journalEntries[todaysDateId] && journalEntries[todaysDateId].answer !== "";

  const generateDailyQuestion = async () => {
    if (!user?.uid) return;

    setIsLoadingQuestion(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const journalWall = userDocSnap.exists() ? userDocSnap.data().JournalWall || {} : {};

      if (journalWall[todaysDateId]?.question) {
        // Question already exists for today, just set it and return
        setTodaysQuestion(journalWall[todaysDateId].question);
        return;
      }

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });

      // Get last 30 questions to avoid repetition
      const last30Days = Object.keys(journalEntries)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
        .slice(0, 30);
      const recentQuestions = last30Days.map(dateId => journalEntries[dateId].question);

      const prompt = `Generate a short, simple, and unique reflective daily journal question in English. Avoid questions similar to these recent ones: ${recentQuestions.join(', ')}. Examples: "What made you smile today?", "Grateful for?", "Small accomplishment?". Keep it very concise. It's okay for questions to be similar, but try to make them different.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      const generatedQuestion = text;
      setTodaysQuestion(generatedQuestion);

      // Save the generated question to Firestore
      await updateDoc(userDocRef, {
        [`JournalWall.${todaysDateId}`]: {
          question: generatedQuestion,
          answer: "",
          timestamp: new Date(),
        },
      });
      fetchJournalEntries(); // Refresh entries

    } catch (error) {
      console.error("Error generating question with Gemini:", error);
      setAlertDialogContent({ title: "AI Error", description: "Failed to generate a journal question. Please try again." });
      setShowAlertDialog(true);
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  useEffect(() => {
    if (user?.uid && !hasEntryToday && !todaysQuestion && !isLoadingQuestion) {
      generateDailyQuestion();
    } else if (hasEntryToday) {
      setTodaysQuestion(journalEntries[todaysDateId].question);
      setCurrentAnswer(journalEntries[todaysDateId].answer);
    }
  }, [user, hasEntryToday, todaysQuestion, isLoadingQuestion, journalEntries, todaysDateId]);

  const saveEntry = async () => {
    if (!currentAnswer.trim() || !user?.uid || !todaysQuestion) {
      toast.error("Please wait for the daily question to generate before saving.");
      return;
    }

    setIsLoadingQuestion(true); // Use this to disable button during save
    try {
      const userDocRef = doc(db, "users", user.uid);
      let finalQuestion = todaysQuestion;
      let originalPrompt = todaysQuestion;

      // AI to adjust question based on answer
      if (currentAnswer.trim().length > 50) { // Only adjust if answer is substantial
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });
        const adjustmentPrompt = `Given the original journal question: "${todaysQuestion}" and the user's answer: "${currentAnswer}", suggest a more fitting, concise question (in English) that better reflects the essence of the answer. If the original question is already perfect, just return the original question. Respond with only the suggested question.`;
        const result = await model.generateContent(adjustmentPrompt);
        const response = await result.response;
        const suggestedQuestion = response.text().trim();

        if (suggestedQuestion && suggestedQuestion !== todaysQuestion) {
          finalQuestion = suggestedQuestion;
        }
      }

      await updateDoc(userDocRef, {
        [`JournalWall.${todaysDateId}`]: {
          question: finalQuestion,
          answer: currentAnswer.trim(),
          timestamp: new Date(),
          originalPrompt: originalPrompt,
        },
      });

      toast.success("Journal entry saved! 🌟");
      setCurrentAnswer('');
      setIsEditingToday(false);
      fetchJournalEntries(); // Refresh entries
      if (onBack) onBack();
    } catch (error) {
      console.error("Error saving journal entry: ", error);
      setAlertDialogContent({ title: "Error Saving Entry", description: "Failed to save journal entry. Please try again." });
      setShowAlertDialog(true);
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const handleEditToday = () => {
    setIsEditingToday(true);
    setCurrentAnswer(journalEntries[todaysDateId]?.answer || '');
  };

  const sortedEntries = Object.keys(journalEntries)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .map(dateId => ({ dateId, ...journalEntries[dateId] }));

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 pb-20">
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
          <h1>Journal Wall</h1>
          <p className="text-gray-600">Your private space for reflection ✨</p>
        </div>

        {/* Today's Prompt */}
        {!hasEntryToday && (
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span>Today's Prompt</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                {isLoadingQuestion ? (
                  <p className="text-lg text-gray-700 italic">Generating question...</p>
                ) : (
                  <p className="text-lg text-gray-700 italic">"{todaysQuestion}"</p>
                )}
              </div>

              <Textarea
                placeholder="Start writing your thoughts here..."
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                className="resize-none"
                rows={4}
              />

              <Button
                onClick={saveEntry}
                disabled={!currentAnswer.trim() || isLoadingQuestion}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {isEditingToday ? "Update My Entry" : "Save My Entry"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Display Today's Entry if it exists and not editing */}
        {hasEntryToday && !isEditingToday && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-2xl mb-2">🎉</div>
                  <h4>You've journaled today!</h4>
                  <p className="text-sm text-gray-600">
                    Great job taking time for self-reflection
                  </p>
                </div>
                <Button onClick={handleEditToday} variant="outline" size="sm">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-purple-300">
                  <p className="text-sm text-gray-600 italic">"{todaysQuestion}"</p>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {journalEntries[todaysDateId]?.answer}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Display Today's Entry if it exists and is being edited */}
        {hasEntryToday && isEditingToday && (
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span>Edit Today's Entry</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                <p className="text-lg text-gray-700 italic">"{todaysQuestion}"</p>
              </div>

              <Textarea
                placeholder="Start writing your thoughts here..."
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                className="resize-none"
                rows={4}
              />

              <Button
                onClick={saveEntry}
                disabled={!currentAnswer.trim() || isLoadingQuestion}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {isEditingToday ? "Update My Entry" : "Save My Entry"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Journal Entries */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h3>Your Entries</h3>
            <Badge variant="secondary">{sortedEntries.length} entries</Badge>
          </div>

          {sortedEntries.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No entries yet.</p>
                <p className="text-sm">Start by writing your first reflection above! 💙</p>
              </CardContent>
            </Card>
          ) : (
            sortedEntries.map(({ dateId, ...entry }) => (
              <Card key={dateId} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="outline" className="text-xs">
                      {formatDate(entry.date)}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-purple-300">
                      <p className="text-sm text-gray-600 italic">"{entry.question}"</p>
                    </div>

                    <p className="text-gray-700 leading-relaxed">
                      {entry.answer}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Journaling Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-sm">💡 Journaling Tips</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• There's no right or wrong way to journal</li>
              <li>• Write freely without worrying about grammar</li>
              <li>• Focus on how you feel, not just what happened</li>
              <li>• Your entries are completely private</li>
            </ul>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
