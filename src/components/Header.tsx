import React from 'react';

interface HeaderProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentRoute, onNavigate }) => {
  const isInnerPage = currentRoute !== '' && currentRoute !== '/' && currentRoute !== '#/';

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

          {/* Work Pill */}
          <a
            href="#/work"
            className={`pill-btn nav-pill ${currentRoute === 'work' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate('work');
            }}
            aria-current={currentRoute === 'work' ? 'page' : undefined}
          >
            {/* Hand-drawn folder / sparkles icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <span>Work</span>
          </a>

          {/* Journey Pill */}
          <a
            href="#/journey"
            className={`pill-btn nav-pill ${currentRoute === 'journey' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate('journey');
            }}
            aria-current={currentRoute === 'journey' ? 'page' : undefined}
          >
            {/* Hand-drawn compass / map icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" opacity="0.2" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
            <span>Journey</span>
          </a>

          {/* About Pill */}
          <a
            href="#/about"
            className={`pill-btn nav-pill ${currentRoute === 'about' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate('about');
            }}
            aria-current={currentRoute === 'about' ? 'page' : undefined}
          >
            {/* Hand-drawn note / profile icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span>About</span>
          </a>

          {/* Contact Pill */}
          <a
            href="#/contact"
            className={`pill-btn nav-pill ${currentRoute === 'contact' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate('contact');
            }}
            aria-current={currentRoute === 'contact' ? 'page' : undefined}
          >
            {/* Hand-drawn envelope icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
