import React, { useState, useEffect } from 'react';

const WORDS = ['sees', 'cares', 'maps'] as const;

export const HeroLine: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % WORDS.length);
    }, 3200);

    return () => clearInterval(timer);
  }, [reducedMotion]);

  const activeWord = reducedMotion ? 'sees' : WORDS[index];

  return (
    <div className="desk-hero-card" role="region" aria-label="Introduction hero">
      <h1 className="hero-heading">
        <span className="hero-greeting">Hey, I'm Saadhana and I build software that</span>{' '}
        <span className="cycling-word-wrapper">
          <span
            key={activeWord}
            className="cycling-word font-handwriting"
            aria-live="polite"
            aria-atomic="true"
          >
            {activeWord}
          </span>
          {/* Hand-drawn squiggly underline SVG */}
          <svg
            className="hero-underline-svg"
            viewBox="0 0 120 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M3 12 C25 4, 45 16, 68 8 C88 2, 102 14, 117 7"
              stroke="#C8553D"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </h1>
      <p className="hero-subtext">
        M.Tech Integrated CSE student exploring Computer Vision, Healthcare Tech &amp; Full-Stack Systems.
      </p>
    </div>
  );
};
