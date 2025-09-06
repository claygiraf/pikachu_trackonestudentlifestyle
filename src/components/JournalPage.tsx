import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Calendar, Heart, Edit3, Sparkles, ArrowLeft } from "lucide-react";

interface JournalPageProps {
  user: any;
  onBack?: () => void;
}

interface JournalEntry {
  id: string;
  date: Date;
  prompt: string;
  entry: string;
}

export function JournalPage({ user, onBack }: JournalPageProps) {
  const [currentEntry, setCurrentEntry] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: '1',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      prompt: "What made you smile today?",
      entry: "I had a great conversation with my friend over coffee. It reminded me how important it is to stay connected with people I care about."
    },
    {
      id: '2',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      prompt: "What are you grateful for right now?",
      entry: "I'm grateful for my health, my family, and the small moments of peace I find in my daily routine."
    }
  ]);

  const dailyPrompts = [
    "Today I'm grateful for ___",
    "What made you smile today?",
    "Describe a moment when you felt proud of yourself",
    "What's something new you learned recently?",
    "Write about a person who means a lot to you",
    "What's a challenge you overcame this week?",
    "Describe your ideal day",
    "What are three things going well in your life?",
    "What would you tell your younger self?",
    "What's something you're looking forward to?",
    "Describe a place that makes you feel peaceful",
    "What's a skill you'd like to develop?",
    "Write about a random act of kindness you witnessed or did",
    "What's your favorite way to relax?",
    "Describe a goal you're working toward"
  ];

  const getTodaysPrompt = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return dailyPrompts[dayOfYear % dailyPrompts.length];
  };

  const todaysPrompt = getTodaysPrompt();
  const hasEntryToday = entries.some(entry => 
    entry.date.toDateString() === new Date().toDateString()
  );

  const saveEntry = () => {
    if (currentEntry.trim()) {
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        date: new Date(),
        prompt: todaysPrompt,
        entry: currentEntry.trim()
      };
      
      setEntries(prev => [newEntry, ...prev]);
      setCurrentEntry('');
      
      // Show encouraging message
      setTimeout(() => {
        alert("Beautiful reflection! 🌟 Thank you for taking time to connect with yourself.");
      }, 500);
    }
  };

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
                <p className="text-lg text-gray-700 italic">"{todaysPrompt}"</p>
              </div>
              
              <Textarea
                placeholder="Start writing your thoughts here..."
                value={currentEntry}
                onChange={(e) => setCurrentEntry(e.target.value)}
                className="resize-none"
                rows={4}
              />
              
              <Button 
                onClick={saveEntry}
                disabled={!currentEntry.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Save My Entry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Success Message for Today */}
        {hasEntryToday && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">🎉</div>
              <h4>You've journaled today!</h4>
              <p className="text-sm text-gray-600">
                Great job taking time for self-reflection
              </p>
            </CardContent>
          </Card>
        )}

        {/* Journal Entries */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h3>Your Entries</h3>
            <Badge variant="secondary">{entries.length} entries</Badge>
          </div>

          {entries.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No entries yet.</p>
                <p className="text-sm">Start by writing your first reflection above! 💙</p>
              </CardContent>
            </Card>
          ) : (
            entries.map(entry => (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="outline" className="text-xs">
                      {formatDate(entry.date)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-purple-300">
                      <p className="text-sm text-gray-600 italic">"{entry.prompt}"</p>
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed">
                      {entry.entry}
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