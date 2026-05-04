import React, { useState, useCallback } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';
import './index.css';
import './components.css';
import './chat.css';

const API_URL = import.meta.env.PROD ? '/api/chat' : 'http://localhost:3001/api/chat';

const INITIAL_QUICK_REPLIES = [
  '🌹 Floral', '🪵 Woody', '🍊 Citrus',
  '🌶️ Oriental', '🌊 Fresh', '🍰 Gourmand',
];

const PREFERENCE_PATTERNS = [
  { pattern: /\b(floral|rose|jasmine|lily)\b/i, icon: '🌹', label: 'Floral' },
  { pattern: /\b(woody|wood|sandalwood|cedar|oud)\b/i, icon: '🪵', label: 'Woody' },
  { pattern: /\b(citrus|lemon|orange|bergamot|grapefruit)\b/i, icon: '🍊', label: 'Citrus' },
  { pattern: /\b(oriental|spicy|amber|vanilla|incense)\b/i, icon: '🌶️', label: 'Oriental' },
  { pattern: /\b(fresh|aquatic|marine|clean|ozonic)\b/i, icon: '🌊', label: 'Fresh' },
  { pattern: /\b(gourmand|sweet|chocolate|caramel|coffee)\b/i, icon: '🍰', label: 'Gourmand' },
  { pattern: /\b(male|men|him|masculine)\b/i, icon: '♂️', label: 'For Him' },
  { pattern: /\b(female|women|her|feminine)\b/i, icon: '♀️', label: 'For Her' },
  { pattern: /\b(unisex|gender.?neutral)\b/i, icon: '⚧️', label: 'Unisex' },
  { pattern: /\b(office|work|professional|business)\b/i, icon: '💼', label: 'Office' },
  { pattern: /\b(party|night|club|evening)\b/i, icon: '🎉', label: 'Party' },
  { pattern: /\b(date|romantic|romance|intimate)\b/i, icon: '💕', label: 'Romantic' },
  { pattern: /\b(daily|everyday|casual)\b/i, icon: '☀️', label: 'Daily Wear' },
  { pattern: /\b(budget|affordable|cheap|under.\$?50)\b/i, icon: '💰', label: 'Budget' },
  { pattern: /\b(premium|luxury|expensive|high.?end)\b/i, icon: '💎', label: 'Luxury' },
  { pattern: /\b(hot|summer|tropical|warm)\b/i, icon: '🌡️', label: 'Hot Climate' },
  { pattern: /\b(cold|winter|cool|chilly)\b/i, icon: '❄️', label: 'Cold Climate' },
];

function getQuickRepliesForContext(messages) {
  const count = messages.filter(m => m.role === 'user').length;
  if (count === 0) return INITIAL_QUICK_REPLIES;
  if (count === 1) return ['👨 Male', '👩 Female', '🌈 Unisex'];
  if (count === 2) return ['💼 Office', '🎉 Party', '💕 Date Night', '☀️ Daily Wear'];
  if (count === 3) return ['💰 Under $50', '💵 $50-$100', '💎 $100-$200', '👑 Luxury $200+'];
  if (count === 4) return ['🌡️ Hot Climate', '❄️ Cold Climate', '🌤️ Temperate', '💧 Humid'];
  return ['Show me more options', 'I don\'t like these', 'Explain fragrance families', 'Try a different style'];
}

function extractPreferences(messages) {
  const prefs = new Map();
  messages.filter(m => m.role === 'user').forEach(msg => {
    PREFERENCE_PATTERNS.forEach(({ pattern, icon, label }) => {
      if (pattern.test(msg.content)) {
        prefs.set(label, { icon, label });
      }
    });
  });
  return Array.from(prefs.values());
}

export default function App() {
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const sendMessage = useCallback(async (text) => {
    const userMessage = { role: 'user', content: text, timestamp: Date.now() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const apiMessages = updatedMessages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      let data;
      if (!res.ok) {
        data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'API request failed');
      }
      data = await res.json();

      const aiMessage = { role: 'assistant', content: data.reply, timestamp: Date.now() };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error:', err);
      const errorMsg = {
        role: 'assistant',
        content: `I apologize, but I encountered an error: **${err.message}**. Please try again. 🌸`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const handleStart = useCallback(async () => {
    setStarted(true);
    setIsLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hello! I want to find my perfect perfume.' }],
        }),
      });

      let data;
      if (!res.ok) {
        data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'API request failed');
      }
      data = await res.json();

      setMessages([
        { role: 'assistant', content: data.reply, timestamp: Date.now() },
      ]);
    } catch (err) {
      console.error('Error:', err);
      setMessages([{
        role: 'assistant',
        content: `Welcome to Aura! ✨ I'm your personal fragrance consultant. \n\nI apologize, but I encountered an error connecting: **${err.message}**. Please refresh to try again.`,
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setMessages([]);
    setStarted(false);
  }, []);

  const preferences = extractPreferences(messages);
  const quickReplies = getQuickRepliesForContext(messages);

  if (!started) {
    return (
      <div className="app">
        <div className="app__main">
          <WelcomeScreen onStart={handleStart} />
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar
        preferences={preferences}
        collapsed={sidebarCollapsed}
        onReset={handleReset}
      />
      <div className="app__main">
        <ChatInterface
          messages={messages}
          isLoading={isLoading}
          onSend={sendMessage}
          onToggleSidebar={() => setSidebarCollapsed(prev => !prev)}
          quickReplies={quickReplies}
        />
      </div>
    </div>
  );
}
