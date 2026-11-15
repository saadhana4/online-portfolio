import React, { useState } from 'react';

export const DoodleCompanion: React.FC = () => {
  const [speech, setSpeech] = useState<string | null>(null);

  const messages = [
    'hi there! welcome to my desk ✨',
    'feel free to explore the notes & projects 🌿',
    'built with care & curiosity 💡',
    'press Esc anytime to close notes ☕',
  ];

  const handleClick = () => {
    setSpeech((prev) => {
      const nextIndex = (messages.indexOf(prev || '') + 1) % messages.length;
      return messages[nextIndex];
    });
  };

  return (
    <div
      className="desk-doodle-container"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label="Saadhana's desk mascot doodle. Click to say hello!"
    >
      {/* Speech Bubble */}
      {speech && (
        <div className="doodle-speech-bubble font-handwriting" role="status">
          <span>{speech}</span>
          <button
            className="doodle-speech-close"
            onClick={(e) => {
              e.stopPropagation();
              setSpeech(null);
            }}
            aria-label="Close speech bubble"
          >
            ×
          </button>
        </div>
      )}

      {/* Hand-drawn laptop-with-eyes SVG */}
      <svg
        className="doodle-character-svg"
        viewBox="0 0 100 85"
        width="95"
        height="80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <filter id="doodle-shadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="2" dy="3" stdDeviation="2.5" floodColor="#1F2A24" floodOpacity="0.18" />
        </filter>

        <g filter="url(#doodle-shadow)">
          {/* Laptop Screen Frame */}
          <rect
            x="18"
            y="10"
            width="64"
            height="46"
            rx="6"
            fill="#FAFBF7"
            stroke="#1F2A24"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Screen Display Interior */}
          <rect x="23" y="15" width="54" height="36" rx="4" fill="#2E3A33" stroke="#1F2A24" strokeWidth="1.5" />

          {/* Eyes (Cute big blinking eyes) */}
          <circle cx="40" cy="30" r="5" fill="#FAFBF7" />
          <circle cx="41.5" cy="30" r="2.8" fill="#1F2A24" />
          <circle cx="43" cy="28.5" r="1.2" fill="#FAFBF7" />

          <circle cx="60" cy="30" r="5" fill="#FAFBF7" />
          <circle cx="58.5" cy="30" r="2.8" fill="#1F2A24" />
          <circle cx="57" cy="28.5" r="1.2" fill="#FAFBF7" />

          {/* Rosy blush */}
          <ellipse cx="32" cy="38" rx="3.5" ry="2.2" fill="#F4C7BA" opacity="0.9" />
          <ellipse cx="68" cy="38" rx="3.5" ry="2.2" fill="#F4C7BA" opacity="0.9" />

          {/* Cheerful Smile */}
          <path d="M44 38 Q50 44 56 38" stroke="#F3E3A3" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Laptop Base */}
          <path
            d="M8 58 L92 58 L84 72 L16 72 Z"
            fill="#D3D7C5"
            stroke="#1F2A24"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Trackpad */}
          <rect x="42" y="62" width="16" height="5.5" rx="2" fill="#FAFBF7" stroke="#1F2A24" strokeWidth="1.2" />

          {/* Tiny sprouting leaf sprout on top of laptop! */}
          <path d="M50 10 C46 3, 38 4, 40 1 Z" fill="#88B49E" stroke="#1F2A24" strokeWidth="1.5" />
          <path d="M50 10 C54 3, 62 4, 60 1 Z" fill="#88B49E" stroke="#1F2A24" strokeWidth="1.5" />
        </g>
      </svg>
      <span className="doodle-caption font-handwriting">byte 🌱</span>
    </div>
  );
};
