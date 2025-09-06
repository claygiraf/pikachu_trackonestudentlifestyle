import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send, Bot, User, AlertTriangle, ArrowLeft } from "lucide-react";

interface AIChatProps {
  user: any;
  onEmergencyTrigger: () => void;
  onBack?: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export function AIChat({ user, onEmergencyTrigger, onBack }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: `Hi ${user?.name || 'friend'}! 💙 I'm here to listen and support you. How are you feeling today?`,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const emergencyKeywords = [
    'want to die', 'kill myself', 'end it all', 'self harm', 'suicide', 
    'hurt myself', 'not worth living', 'better off dead'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkForEmergency = (text: string) => {
    const lowerText = text.toLowerCase();
    return emergencyKeywords.some(keyword => lowerText.includes(keyword));
  };

  const generateAIResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Emergency response
    if (checkForEmergency(userMessage)) {
      setTimeout(() => onEmergencyTrigger(), 1000);
      return "I'm really concerned about you right now. 💙 Your life has value and you matter. Let me help you find some immediate support.";
    }
    
    // Mood-based responses
    if (lowerMessage.includes('sad') || lowerMessage.includes('down') || lowerMessage.includes('depressed')) {
      return "I hear that you're going through a tough time. 💙 It's okay to feel sad - your feelings are valid. What's one small thing that usually brings you a bit of comfort?";
    }
    
    if (lowerMessage.includes('anxious') || lowerMessage.includes('worried') || lowerMessage.includes('scared')) {
      return "Anxiety can feel overwhelming. Let's try to slow things down. 🌸 Try taking three deep breaths with me. In for 4... hold for 4... out for 6. You're safe right now.";
    }
    
    if (lowerMessage.includes('happy') || lowerMessage.includes('good') || lowerMessage.includes('great')) {
      return "I'm so glad to hear you're feeling positive today! ✨ What's bringing you joy right now? It's wonderful to celebrate these moments.";
    }
    
    if (lowerMessage.includes('stressed') || lowerMessage.includes('overwhelmed')) {
      return "Feeling overwhelmed is tough. 💙 Let's break things down. What's the one most important thing you need to focus on right now? We can tackle this together.";
    }
    
    // Default supportive responses
    const responses = [
      "Thank you for sharing that with me. 💙 How are you taking care of yourself today?",
      "I'm here to listen. What's on your mind right now? 🌸",
      "That sounds important to you. Tell me more about how you're feeling about it.",
      "You're being really brave by talking about this. 💙 What kind of support would feel helpful right now?",
      "I appreciate you opening up. What's one thing that's going well for you today, even if it's small? 🌟"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI typing delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(inputText),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm px-4 py-4 border-b pt-12">
        {onBack && (
          <div className="max-w-md mx-auto mb-4">
            <Button onClick={onBack} variant="ghost" size="sm">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
          </div>
        )}
        <div className="flex items-center space-x-3 max-w-md mx-auto">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2>AI Companion</h2>
            <p className="text-sm text-gray-600">Always here to listen 💙</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-md mx-auto w-full pb-24">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-2 max-w-[80%] ${
              message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' ? 'bg-blue-600' : 'bg-gray-200'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-gray-600" />
                )}
              </div>
              <Card className={message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-white'}>
                <CardContent className="p-3">
                  <p className="text-sm">{message.content}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-gray-600" />
              </div>
              <Card className="bg-white">
                <CardContent className="p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t px-4 py-4">
        <div className="flex space-x-2 max-w-md mx-auto">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

    </div>
  );
}