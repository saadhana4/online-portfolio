import React, { useState } from 'react';

interface HeaderProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentRoute, onNavigate }) => {
  const [isHitting, setIsHitting] = useState<boolean>(false);
  const isInnerPage = currentRoute !== '' && currentRoute !== '/' && currentRoute !== '#/';

  const handleWorkClick = (e: React.MouseEvent<HTMLAnchorElement> | React.KeyboardEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isHitting) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    if (prefersReducedMotion) {
      onNavigate('work');
      return;
    }

    setIsHitting(true);
    setTimeout(() => {
      setIsHitting(false);
      onNavigate('work');
    }, 750);
  };

  return (
    <header className="site-header" role="banner">
      {/* Top-Left Signature */}
      <div className="header-brand">
        <a
          href="#/"
          className="brand-signature"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('');
          }}
          aria-label="Saadhana Karthikeyan - Return to Desk home"
        >
          <span className="signature-text">saadhana</span>
          <span className="signature-dot" aria-hidden="true">★</span>
        </a>
      </div>

      {/* Top-Right Nav Pills */}
      <nav className="header-nav" aria-label="Main Navigation">
        <div className="nav-pills-row">
          {/* Back to Desk pill if on inner page */}
          {isInnerPage && (
            <a
              href="#/"
              className="pill-btn nav-pill pill-sage back-pill"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('');
              }}
              aria-label="Return to Desk view"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Desk</span>
            </a>
          )}

          {/* Work Pill with Hammer Impact Click Animation */}
          <a
            href="#/work"
            className={`pill-btn nav-pill work-pill ${currentRoute === 'work' ? 'active' : ''} ${isHitting ? 'is-hitting' : ''}`}
            onClick={handleWorkClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleWorkClick(e);
              }
            }}
            aria-current={currentRoute === 'work' ? 'page' : undefined}
            aria-label="Work"
          >
            {/* Hand-drawn Hammer SVG */}
            <svg
              className="hammer-icon-svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {/* Handle */}
              <line x1="9" y1="13" x2="4" y2="21" stroke="#1F2A24" strokeWidth="2.6" />
              {/* Handle grip stripes */}
              <line x1="6" y1="17.5" x2="7.5" y2="18.5" stroke="#C8553D" strokeWidth="1.8" />
              {/* Hammer Head */}
              <path
                d="M8 6 L14 12 L18 8 L12 2 Z"
                fill="#C8553D"
                stroke="#1F2A24"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {/* Striking Face */}
              <line x1="17" y1="7" x2="21" y2="11" stroke="#1F2A24" strokeWidth="3" />
            </svg>

            {/* Accessible name stays 'Work' */}
            <span className="sr-only">Work</span>

            {/* Split letters with aria-hidden */}
            <span className="work-letters-wrapper" aria-hidden="true">
              <span className="work-char char-w">W</span>
              <span className="work-char char-o">o</span>
              <span className="work-char char-r">r</span>
              <span className="work-char char-k">k</span>
            </span>
          </a>

          {/* Journey Pill */}
          <a
            href="#/journey"
            className={`pill-btn nav-pill journey-pill ${currentRoute === 'journey' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate('journey');
            }}
            aria-current={currentRoute === 'journey' ? 'page' : undefined}
          >
            {/* Hand-drawn compass icon */}
            <svg className="compass-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" opacity="0.25" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
            <span>Journey</span>
          </a>

          {/* About Pill */}
          <a
            href="#/about"
            className={`pill-btn nav-pill about-pill ${currentRoute === 'about' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate('about');
            }}
            aria-current={currentRoute === 'about' ? 'page' : undefined}
          >
            {/* Hand-drawn note icon */}
            <svg className="note-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span>About</span>
          </a>

          {/* Contact Pill */}
          <a
            href="#/contact"
            className={`pill-btn nav-pill contact-pill ${currentRoute === 'contact' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate('contact');
            }}
            aria-current={currentRoute === 'contact' ? 'page' : undefined}
          >
            {/* Hand-drawn envelope icon */}
            <svg className="mail-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span>Contact</span>
          </a>
        </div>
      </nav>
    </header>
  );
};
