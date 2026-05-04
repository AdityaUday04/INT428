import React from 'react';

function formatMessage(text) {
  // Convert markdown-like bold to HTML
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function renderContent(text) {
  const lines = text.split('\n');
  const elements = [];
  let currentList = [];

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`}>
          {currentList.map((item, i) => (
            <li key={i}>{formatMessage(item)}</li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      currentList.push(trimmed.slice(2));
    } else {
      flushList();
      if (trimmed) {
        elements.push(<p key={`p-${i}`}>{formatMessage(trimmed)}</p>);
      }
    }
  });
  flushList();
  return elements;
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`message ${isUser ? 'message--user' : 'message--ai'}`}>
      <div className="message__avatar">{isUser ? '👤' : '🌸'}</div>
      <div>
        <div className="message__bubble">
          {isUser ? <p>{message.content}</p> : renderContent(message.content)}
        </div>
        <div className="message__time">{time}</div>
      </div>
    </div>
  );
}
