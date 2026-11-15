import React, { useState, useEffect } from 'react';

const WORDS = ['sees', 'cares', 'maps'] as const;

export const HeroLine: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

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
    <div className="desk-hero-minimal" role="region" aria-label="Introduction hero">
      <h1 className="hero-single-line">
        <span className="hero-lead-text">Hey, I'm Saadhana and I build software that</span>{' '}
        <span className="hero-word-slot">
          <span
            key={activeWord}
            className="hero-cycling-word font-handwriting"
            aria-live="polite"
            aria-atomic="true"
          >
            {activeWord}
          </span>
        </span>
      </h1>

      {/* Accessible subtitle for screen readers and SEO (not visible on page) */}
      <p className="sr-only">
        M.Tech Integrated CSE student exploring Computer Vision, Healthcare Tech &amp; Full-Stack Systems.
      </p>
    </div>
  );
};
