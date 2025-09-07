import React, { useState, useRef, useEffect } from "react";
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
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'ai',
      content: `Hi ${user?.name || 'friend'}! 💙 I'm here to listen and support you. How are you feeling today?`,
      timestamp: new Date()
    }
  ] as Message[]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const emergencyKeywords = [
    'want to die', 'kill myself', 'self harm', 'suicide', 
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

  const generateAIResponse = async (userMessage: string) => {
  // Emergency check (keep this!)
  if (checkForEmergency(userMessage)) {
    setTimeout(() => onEmergencyTrigger(), 500);
    return "⚠️ I'm really concerned about you right now. 💙 Your life has value and you matter. Please reach out for immediate support.";
  }

  try {
    const res = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }),
    });

    const data = await res.json();
    return data.reply || "Sorry, I couldn’t understand that.";
  } catch (err) {
    console.error("Error calling AI:", err);
    return "⚠️ Something went wrong. Please try again later.";
  }
};


  const handleSendMessage = async () => {
  if (!inputText.trim()) return;

  const newUserMessage: Message = {
    id: Date.now().toString(),
    type: "user",
    content: inputText,
    timestamp: new Date(),
  };

  setMessages((prev) => [...prev, newUserMessage]);
  setInputText("");
  setIsTyping(true);

  // Call LLM
  const aiReply = await generateAIResponse(newUserMessage.content);

  const aiResponse: Message = {
    id: (Date.now() + 1).toString(),
    type: "ai",
    content: aiReply,
    timestamp: new Date(),
  };

  setMessages((prev) => [...prev, aiResponse]);
  setIsTyping(false);
};


  // ...existing code...
const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSendMessage();
  }
};
// ...existing code...
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
            onKeyDown={handleKeyPress}
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