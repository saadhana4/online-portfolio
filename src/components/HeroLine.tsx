import { forwardRef } from 'react';

export type HeroWord = 'sees' | 'cares' | 'maps';

interface HeroLineProps {
  currentWord?: HeroWord;
  isAway?: boolean;
  isFadingIn?: boolean;
  isPhoneOpen?: boolean;
  isLoading?: boolean;
  isLoadingRevealed?: boolean;
}

export const HeroLine = forwardRef<HTMLDivElement, HeroLineProps>(
  (
    {
      isAway = false,
      isFadingIn = false,
      isPhoneOpen = false,
      isLoading = false,
      isLoadingRevealed = false,
    },
    ref
  ) => {
    const isHiddenOrInert = isAway || isPhoneOpen;

    return (
      <div
        ref={ref}
        className={`desk-hero-minimal ${isAway ? 'is-away' : ''} ${isFadingIn ? 'is-fading-in' : ''} ${isLoading && !isLoadingRevealed ? 'is-loading' : ''} ${isLoadingRevealed ? 'is-loading-revealed' : ''}`}
        role="region"
        aria-label="Introduction hero"
        inert={isHiddenOrInert ? true : undefined}
        aria-hidden={isHiddenOrInert ? 'true' : undefined}
      >
        {isPhoneOpen ? (
          <p className="hero-single-line" aria-hidden="true">
            <span className="hero-lead-text">Hey, I'm Saadhana and I engineer ideas into</span>{' '}
            <span className="hero-word-slot">
              <span
                className="hero-cycling-word font-handwriting"
                aria-hidden="true"
              >
                impact.
              </span>
            </span>
          </p>
        ) : (
          <h1 className="hero-single-line">
            <span className="hero-lead-text">Hey, I'm Saadhana and I engineer ideas into</span>{' '}
            <span className="hero-word-slot">
              <span
                className="hero-cycling-word font-handwriting"
                aria-hidden="true"
              >
                impact.
              </span>
            </span>
          </h1>
        )}

        {/* Visually-hidden sentence for screen readers */}
        <p className="sr-only">
          Hey, I'm Saadhana and I engineer ideas into impact.
        </p>
        {/* Accessible subtitle for screen readers and SEO (not visible on page) */}
        <p className="sr-only">
          M.Tech Integrated CSE student exploring Computer Vision, Healthcare Tech &amp; Full-Stack Systems.
        </p>
      </div>
    );
  }
);

HeroLine.displayName = 'HeroLine';
