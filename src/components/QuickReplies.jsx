import React from 'react';

export default function QuickReplies({ chips, onSelect }) {
  return (
    <div className="quick-replies">
      {chips.map((chip, i) => (
        <button
          key={i}
          className="quick-replies__chip"
          onClick={() => onSelect(chip)}
          id={`quick-reply-${i}`}
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
