import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import QuickReplies from './QuickReplies';
import ChatInput from './ChatInput';

export default function ChatInterface({ messages, isLoading, onSend, onToggleSidebar, quickReplies }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <>
      <header className="chat-header">
        <button className="chat-header__toggle" onClick={onToggleSidebar} id="sidebar-toggle">☰</button>
        <div className="chat-header__info">
          <div className="chat-header__title">Aura — Fragrance Consultant</div>
          <div className="chat-header__status">
            <span className="chat-header__dot"></span>
            Online • Ready to help
          </div>
        </div>
      </header>

      <div className="chat-messages" id="chat-messages">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {isLoading && (
          <div className="typing-indicator">
            <div className="typing-indicator__avatar">🌸</div>
            <div className="typing-indicator__bubble">
              <div className="typing-indicator__dot"></div>
              <div className="typing-indicator__dot"></div>
              <div className="typing-indicator__dot"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {quickReplies.length > 0 && !isLoading && (
        <QuickReplies chips={quickReplies} onSelect={onSend} />
      )}

      <ChatInput onSend={onSend} disabled={isLoading} />
    </>
  );
}
