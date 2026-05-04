import React, { useState, useRef } from 'react';

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e) => {
    setText(e.target.value);
    e.target.style.height = '44px';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  return (
    <div className="chat-input">
      <textarea
        ref={textareaRef}
        className="chat-input__field"
        placeholder="Ask Aura about fragrances..."
        value={text}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
        id="chat-input-field"
      />
      <button
        className="chat-input__send"
        onClick={handleSubmit}
        disabled={disabled || !text.trim()}
        id="send-btn"
      >
        ➤
      </button>
    </div>
  );
}
