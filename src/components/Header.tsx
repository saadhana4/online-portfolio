import React, { useState, useEffect, useRef } from 'react';

interface HeaderProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentRoute, onNavigate }) => {
  const [isHitting, setIsHitting] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const isInnerPage = currentRoute !== '' && currentRoute !== '/' && currentRoute !== '#/';

  // Handle Esc key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('pointerdown', handleClickOutside);
    }
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [isMenuOpen]);

  const handleWorkClick = (e: React.MouseEvent<HTMLAnchorElement> | React.KeyboardEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isHitting) return;

    setIsMenuOpen(false);

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

  const handleLinkClick = (route: string) => {
    setIsMenuOpen(false);
    onNavigate(route);
  };

  return (
    <header className="site-header" role="banner">
      {/* Top-Left Signature: Caveat, left: 27px, top: 24px, about 34px tall */}
      <div className="header-brand">
        <a
          href="#/"
          className="brand-signature font-handwriting"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('');
          }}
          aria-label="Saadhana Karthikeyan - Return to Desk home"
        >
          <span className="signature-text">saadhana</span>
        </a>
      </div>

      {/* Top-Right Navigation */}
      <nav className="header-nav" aria-label="Main Navigation" ref={menuRef}>
        {/* Mobile / Tablet Collapsible Menu (< 1000px) */}
        <div className="mobile-nav-container">
          <button
            type="button"
            className="pill-btn nav-pill menu-toggle-btn"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav-menu"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {isMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="4" y1="8" x2="20" y2="8" />
                  <line x1="4" y1="16" x2="20" y2="16" />
                </>
              )}
            </svg>
            <span>Menu</span>
          </button>

          {/* Vertical Drawer for under 1000px */}
          {isMenuOpen && (
            <div id="mobile-nav-menu" className="mobile-menu-drawer" role="menu">
              {isInnerPage && (
                <a
                  href="#/"
                  role="menuitem"
                  className="pill-btn nav-pill"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick('');
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                  <span>Desk</span>
                </a>
              )}

              <a
                href="#/work"
                role="menuitem"
                className={`pill-btn nav-pill work-pill ${currentRoute === 'work' ? 'active' : ''} ${isHitting ? 'is-hitting' : ''}`}
                onClick={handleWorkClick}
                aria-label="Work"
              >
                <svg className="hammer-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="9" y1="13" x2="4" y2="21" stroke="currentColor" strokeWidth="2.6" />
                  <line x1="6" y1="17.5" x2="7.5" y2="18.5" stroke="var(--accent)" strokeWidth="1.8" />
                  <path d="M8 6 L14 12 L18 8 L12 2 Z" fill="var(--accent)" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  <line x1="17" y1="7" x2="21" y2="11" stroke="currentColor" strokeWidth="3" />
                </svg>
                <span>Work</span>
              </a>

              <a
                href="#/journey"
                role="menuitem"
                className={`pill-btn nav-pill ${currentRoute === 'journey' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick('journey');
                }}
              >
                <svg className="compass-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" opacity="0.25" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
                <span>Journey</span>
              </a>

              <a
                href="#/about"
                role="menuitem"
                className={`pill-btn nav-pill ${currentRoute === 'about' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick('about');
                }}
              >
                <svg className="note-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <span>About</span>
              </a>

              <a
                href="#/contact"
                role="menuitem"
                className={`pill-btn nav-pill ${currentRoute === 'contact' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick('contact');
                }}
              >
                <svg className="mail-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>Contact</span>
              </a>
            </div>
          )}
        </div>

        {/* Desktop Navigation: exact 8px gap, top: 26px, right: 28px */}
        <div className="nav-pills-row nav-pills-desktop">
          {isInnerPage && (
            <a
              href="#/"
              className="pill-btn nav-pill back-pill"
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick('');
              }}
              aria-label="Return to Desk view"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Desk</span>
            </a>
          )}

          {/* Work Pill */}
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
            <svg className="hammer-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="9" y1="13" x2="4" y2="21" stroke="currentColor" strokeWidth="2.6" />
              <line x1="6" y1="17.5" x2="7.5" y2="18.5" stroke="var(--accent)" strokeWidth="1.8" />
              <path d="M8 6 L14 12 L18 8 L12 2 Z" fill="var(--accent)" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <line x1="17" y1="7" x2="21" y2="11" stroke="currentColor" strokeWidth="3" />
            </svg>

            <span className="sr-only">Work</span>

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
              handleLinkClick('journey');
            }}
            aria-current={currentRoute === 'journey' ? 'page' : undefined}
          >
            <svg className="compass-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
              handleLinkClick('about');
            }}
            aria-current={currentRoute === 'about' ? 'page' : undefined}
          >
            <svg className="note-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
              handleLinkClick('contact');
            }}
            aria-current={currentRoute === 'contact' ? 'page' : undefined}
          >
            <svg className="mail-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
