import React, { useState, useEffect, useRef, useCallback } from 'react';
import { preloadLargePhoneImage } from '../utils/preloadImage';

interface HeaderProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onBeginDrift?: (target: 'home' | 'away') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentRoute, onNavigate, onBeginDrift }) => {
  const [isHitting, setIsHitting] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  const panelRef = useRef<HTMLElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const closeTimeoutRef = useRef<number | null>(null);

  const isInnerPage = currentRoute !== '' && currentRoute !== '/' && currentRoute !== '#/';

  const checkReducedMotion = () => {
    return (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  };

  // Close panel helper with optional callback after 250ms (or 0ms if reduced motion)
  const closePanel = useCallback(
    (callback?: () => void) => {
      const isReduced = checkReducedMotion();

      if (isReduced) {
        setIsMenuOpen(false);
        setIsClosing(false);
        callback?.();
        toggleButtonRef.current?.focus();
        return;
      }

      setIsClosing(true);
      if (closeTimeoutRef.current) window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = window.setTimeout(() => {
        setIsMenuOpen(false);
        setIsClosing(false);
        callback?.();
        toggleButtonRef.current?.focus();
      }, 250);
    },
    []
  );

  const handleToggle = () => {
    if (isMenuOpen) {
      closePanel();
    } else {
      setIsMenuOpen(true);
      setIsClosing(false);
    }
  };

  // Focus management & keyboard trapping while side panel is open
  useEffect(() => {
    if (!isMenuOpen) return;

    // Focus first link on open
    const focusTimer = window.setTimeout(() => {
      if (isMenuOpen && !isClosing) {
        const firstLink = panelRef.current?.querySelector<HTMLElement>('a');
        firstLink?.focus();
      }
    }, 60);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closePanel();
        return;
      }

      if (e.key === 'Tab') {
        const panel = panelRef.current;
        const toggle = toggleButtonRef.current;
        if (!panel || !toggle) return;

        const links = Array.from(
          panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
        );
        const focusable = [toggle, ...links];
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen, isClosing, closePanel]);

  // Set page behind inert & aria-hidden while side panel is open
  useEffect(() => {
    const mainContent = document.getElementById('main-content');
    const headerBrand = document.querySelector('.header-brand');

    if (isMenuOpen) {
      mainContent?.setAttribute('inert', '');
      headerBrand?.setAttribute('inert', '');
      mainContent?.setAttribute('aria-hidden', 'true');
      headerBrand?.setAttribute('aria-hidden', 'true');
    } else {
      mainContent?.removeAttribute('inert');
      headerBrand?.removeAttribute('inert');
      mainContent?.removeAttribute('aria-hidden');
      headerBrand?.removeAttribute('aria-hidden');
    }

    return () => {
      mainContent?.removeAttribute('inert');
      headerBrand?.removeAttribute('inert');
      mainContent?.removeAttribute('aria-hidden');
      headerBrand?.removeAttribute('aria-hidden');
    };
  }, [isMenuOpen]);

  // Desktop link handlers
  const handleWorkClick = (
    e: React.MouseEvent<HTMLAnchorElement> | React.KeyboardEvent<HTMLAnchorElement>
  ) => {
    e.preventDefault();
    if (isHitting) return;

    if (checkReducedMotion()) {
      onNavigate('work');
      return;
    }

    setIsHitting(true);
    setTimeout(() => {
      onBeginDrift?.('away');
    }, 280);
    setTimeout(() => {
      onNavigate('work');
    }, 330);
    setTimeout(() => {
      setIsHitting(false);
    }, 750);
  };

  const handleJourneyClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onBeginDrift?.('away');
    onNavigate('journey');
  };

  const handleBackClick = () => {
    onBeginDrift?.('home');
    onNavigate('');
  };

  const handleLinkClick = (route: string) => {
    onNavigate(route);
  };

  // Mobile menu item selections: closes panel first (250ms), then executes action
  const handlePanelItemClick = (e: React.MouseEvent<HTMLAnchorElement>, route: string) => {
    e.preventDefault();
    closePanel(() => {
      if (route === '') {
        handleBackClick();
      } else if (route === 'work') {
        if (checkReducedMotion()) {
          onNavigate('work');
          return;
        }
        setIsHitting(true);
        setTimeout(() => {
          onBeginDrift?.('away');
        }, 280);
        setTimeout(() => {
          onNavigate('work');
        }, 330);
        setTimeout(() => {
          setIsHitting(false);
        }, 750);
      } else if (route === 'journey') {
        handleJourneyClick(e);
      } else {
        handleLinkClick(route);
      }
    });
  };

  return (
    <header className="site-header" role="banner">
      {/* Top-Left Signature: Caveat */}
      <div className="header-brand">
        <a
          href="#/"
          className="brand-signature font-handwriting"
          onClick={(e) => {
            e.preventDefault();
            handleBackClick();
          }}
          aria-label="Saadhana Karthikeyan - Return to Desk home"
        >
          <span className="signature-text">saadhana</span>
        </a>
      </div>

      {/* Top-Right Navigation */}
      <div className="header-nav">
        {/* Mobile / Tablet Collapsible Menu (< 1000px) */}
        <div className="mobile-nav-container">
          {/* Back pill on mobile: shown outside next to Menu pill when menu is closed on inner routes */}
          {!isMenuOpen && isInnerPage && (
            <div className="back-pill-wrapper mobile-back-wrapper">
              <a
                href="#/"
                className="pill-btn nav-pill back-pill"
                onClick={(e) => {
                  e.preventDefault();
                  handleBackClick();
                }}
                aria-label="Back to home"
              >
                <svg
                  className="back-icon-svg"
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
                  <path d="M9 14 L4 9 L9 4" />
                  <path d="M5 9 C11 8, 17 9, 18 13 C19 16, 17 20, 13 20 C10 20, 8 18, 8 16" />
                </svg>
                <span>Back</span>
              </a>
            </div>
          )}

          {/* Menu / Close Toggle Pill (stays in exact same spot at top right, morphs text and icon) */}
          <button
            ref={toggleButtonRef}
            type="button"
            className={`pill-btn nav-pill menu-toggle-btn ${isMenuOpen ? 'is-close-active' : ''}`}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav-panel"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={handleToggle}
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
            <span>{isMenuOpen ? 'Close' : 'Menu'}</span>
          </button>
        </div>

        {/* Mobile Light Scrim (rgba(60,50,35,0.18), closes menu on tap) */}
        <div
          className={`mobile-panel-scrim ${isMenuOpen && !isClosing ? 'is-open' : ''}`}
          onClick={() => closePanel()}
          aria-hidden="true"
        />

        {/* Mobile Side Panel: <nav aria-label="Main"> */}
        <nav
          ref={panelRef}
          id="mobile-nav-panel"
          className={`mobile-side-panel ${isMenuOpen ? 'is-open' : ''} ${isClosing ? 'is-closing' : ''}`}
          aria-label="Main"
          aria-hidden={!isMenuOpen}
        >
          <div className="panel-pills-column">
            {/* 1. Back pill (only when not on home route) */}
            {isInnerPage && (
              <a
                href="#/"
                className="pill-btn nav-pill panel-nav-pill"
                onClick={(e) => handlePanelItemClick(e, '')}
                aria-label="Back to home"
              >
                <svg
                  className="panel-icon-svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 14 L4 9 L9 4" />
                  <path d="M5 9 C11 8, 17 9, 18 13 C19 16, 17 20, 13 20 C10 20, 8 18, 8 16" />
                </svg>
                <span>Back</span>
              </a>
            )}

            {/* 2. Work pill */}
            <a
              href="#/work"
              className={`pill-btn nav-pill panel-nav-pill ${currentRoute === 'work' ? 'active' : ''}`}
              onClick={(e) => handlePanelItemClick(e, 'work')}
              aria-current={currentRoute === 'work' ? 'page' : undefined}
            >
              <svg
                className="panel-icon-svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="9" y1="13" x2="4" y2="21" stroke="currentColor" strokeWidth="2.6" />
                <line x1="6" y1="17.5" x2="7.5" y2="18.5" stroke="var(--accent)" strokeWidth="1.8" />
                <path
                  d="M8 6 L14 12 L18 8 L12 2 Z"
                  fill="var(--accent)"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <line x1="17" y1="7" x2="21" y2="11" stroke="currentColor" strokeWidth="3" />
              </svg>
              <span>Work</span>
            </a>

            {/* 3. Journey pill */}
            <a
              href="#/journey"
              className={`pill-btn nav-pill panel-nav-pill ${currentRoute === 'journey' ? 'active' : ''}`}
              onClick={(e) => handlePanelItemClick(e, 'journey')}
              aria-current={currentRoute === 'journey' ? 'page' : undefined}
            >
              <svg
                className="panel-icon-svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <polygon
                  points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
                  fill="currentColor"
                  opacity="0.25"
                />
                <polygon
                  points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
                />
              </svg>
              <span>Journey</span>
            </a>

            {/* 4. About pill */}
            <a
              href="#/about"
              className={`pill-btn nav-pill panel-nav-pill ${currentRoute === 'about' ? 'active' : ''}`}
              onClick={(e) => handlePanelItemClick(e, 'about')}
              onMouseEnter={preloadLargePhoneImage}
              onFocus={preloadLargePhoneImage}
              aria-current={currentRoute === 'about' ? 'page' : undefined}
            >
              <svg
                className="panel-icon-svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <span>About</span>
            </a>

            {/* 5. Contact pill */}
            <a
              href="#/contact"
              className={`pill-btn nav-pill panel-nav-pill ${currentRoute === 'contact' ? 'active' : ''}`}
              onClick={(e) => handlePanelItemClick(e, 'contact')}
              onMouseEnter={preloadLargePhoneImage}
              onFocus={preloadLargePhoneImage}
              aria-current={currentRoute === 'contact' ? 'page' : undefined}
            >
              <svg
                className="panel-icon-svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span>Contact</span>
            </a>
          </div>
        </nav>

        {/* Desktop Navigation: exact 8px gap, top: 26px, right: 28px */}
        <nav className="nav-pills-row nav-pills-desktop" aria-label="Desktop Main Navigation">
          {/* 5) BACK PILL: FIRST pill in nav, left of Work */}
          {isInnerPage && (
            <div className="back-pill-wrapper">
              <a
                href="#/"
                className="pill-btn nav-pill back-pill"
                onClick={(e) => {
                  e.preventDefault();
                  handleBackClick();
                }}
                aria-label="Back to home"
              >
                {/* Hand-drawn arrow that draws itself out to the left on hover/focus */}
                <svg
                  className="back-pill-draw-arrow-svg"
                  width="120"
                  height="28"
                  viewBox="0 0 120 28"
                  fill="none"
                  stroke="var(--base-400)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path
                    d="M 115 14 C 95 9, 70 18, 45 13 C 32 10, 20 14, 12 14 M 22 8 L 12 14 L 22 20"
                    pathLength="100"
                  />
                </svg>

                {/* Hand-drawn looped arrow pointing left */}
                <svg
                  className="back-icon-svg"
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
                  <path d="M9 14 L4 9 L9 4" />
                  <path d="M5 9 C11 8, 17 9, 18 13 C19 16, 17 20, 13 20 C10 20, 8 18, 8 16" />
                </svg>
                <span>Back</span>
              </a>
            </div>
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
            onClick={handleJourneyClick}
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
            onMouseEnter={preloadLargePhoneImage}
            onFocus={preloadLargePhoneImage}
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
            onMouseEnter={preloadLargePhoneImage}
            onFocus={preloadLargePhoneImage}
            aria-current={currentRoute === 'contact' ? 'page' : undefined}
          >
            <svg className="mail-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span>Contact</span>
          </a>
        </nav>
      </div>
    </header>
  );
};