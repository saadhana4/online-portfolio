import { forwardRef } from 'react';

export type HeroWord = 'sees' | 'cares' | 'maps';

interface HeroLineProps {
  currentWord: HeroWord;
}

export const HeroLine = forwardRef<HTMLDivElement, HeroLineProps>(({ currentWord }, ref) => {
  return (
    <div
      ref={ref}
      className="desk-hero-minimal"
      role="region"
      aria-label="Introduction hero"
    >
      <h1 className="hero-single-line">
        <span className="hero-lead-text">Hey, I'm Saadhana and I build software that</span>{' '}
        <span className="hero-word-slot">
          <span
            key={currentWord}
            className="hero-cycling-word font-handwriting word-swap-fade"
            aria-hidden="true"
          >
            {currentWord}
          </span>
        </span>
      </h1>

      {/* Visually-hidden sentence for screen readers */}
      <p className="sr-only">
        I build software that sees, cares and maps.
      </p>
      {/* Accessible subtitle for screen readers and SEO (not visible on page) */}
      <p className="sr-only">
        M.Tech Integrated CSE student exploring Computer Vision, Healthcare Tech &amp; Full-Stack Systems.
      </p>
    </div>
  );
});

HeroLine.displayName = 'HeroLine';
