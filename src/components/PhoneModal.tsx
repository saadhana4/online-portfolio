import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { profileData } from '../data/profile';

interface PhoneModalProps {
  view: 'about' | 'contact';
  isDirectLoad?: boolean;
  isClosing?: boolean;
  onClose: () => void;
  onCloseComplete?: () => void;
  onSwitchView: (view: 'about' | 'contact') => void;
}

interface FlipParams {
  deltaX: number;
  deltaY: number;
  scale: number;
  rotation: number;
}

export const PhoneModal: React.FC<PhoneModalProps> = ({
  view,
  isDirectLoad = false,
  isClosing = false,
  onClose,
  onCloseComplete,
  onSwitchView,
}) => {
  const modalRootRef = useRef<HTMLDivElement>(null);
  const phoneChassisRef = useRef<HTMLDivElement>(null);
  const fromInputRef = useRef<HTMLInputElement>(null);
  const isClosingRef = useRef<boolean>(false);
  const flipParamsRef = useRef<FlipParams>({ deltaX: 0, deltaY: 0, scale: 0.35, rotation: 0 });

  const [isReducedMotion] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  // Animation states
  // 'initial' -> 'zooming' -> 'screen-off-pause' -> 'screen-turning-on' -> 'form-stagger' -> 'actions-stagger' -> 'ready'
  // When closing: 'closing-content' -> 'closing-screen' -> 'closing-zoom' -> 'closed'
  const [isZoomed, setIsZoomed] = useState<boolean>(() => isDirectLoad || isReducedMotion);
  const [screenOn, setScreenOn] = useState<boolean>(() => isDirectLoad || isReducedMotion);
  const [formVisible, setFormVisible] = useState<boolean>(() => isDirectLoad || isReducedMotion);
  const [actionsVisible, setActionsVisible] = useState<boolean>(() => isDirectLoad || isReducedMotion);
  const [isDimOverlayVisible, setIsDimOverlayVisible] = useState<boolean>(true);
  const [closePhase, setClosePhase] = useState<'' | 'content' | 'screen' | 'zoom'>('');

  // Form states for Contact view
  const [fromEmail, setFromEmail] = useState('');
  const [topic, setTopic] = useState('Internship');
  const [message, setMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Restore desk object opacity helper
  const restoreDeskObject = useCallback(() => {
    const rulerEl = document.querySelector<HTMLElement>('.desk-object-ruler');
    if (rulerEl) {
      rulerEl.style.transition = '';
      rulerEl.style.opacity = '';
      rulerEl.style.pointerEvents = '';
      rulerEl.classList.remove('desk-phone-hidden');
    }
  }, []);

  // Compute desk object bounding rect & FLIP parameters
  const getDeskPhoneRect = useCallback((): { rect: DOMRect; rotation: number } | null => {
    const rulerEl = document.querySelector<HTMLElement>('.desk-object-ruler');
    if (!rulerEl) return null;

    const style = window.getComputedStyle(rulerEl);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return null;
    }

    const rect = rulerEl.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Check if rect is usable (has dimensions and is on screen)
    if (rect.width <= 0 || rect.height <= 0) return null;
    if (rect.bottom < 30 || rect.top > vh - 30 || rect.right < 30 || rect.left > vw - 30) {
      return null;
    }

    // Read current rotation from transform matrix
    let rot = -10; // Default config rotation for ruler
    const tr = style.transform;
    if (tr && tr !== 'none' && tr.startsWith('matrix(')) {
      const parts = tr.slice(7, -1).split(',').map(parseFloat);
      if (parts.length >= 2) {
        rot = Math.round(Math.atan2(parts[1], parts[0]) * (180 / Math.PI));
      }
    }

    return { rect, rotation: rot };
  }, []);

  // Measure and initialize FLIP animation at mount
  useLayoutEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Dim desk overlay immediately
    document.body.classList.add('desk-dimmed');

    if (isDirectLoad || prefersReduced) {
      // Direct load or reduced motion: skip FLIP animation completely
      const rulerEl = document.querySelector<HTMLElement>('.desk-object-ruler');
      if (rulerEl) {
        rulerEl.style.opacity = '0';
        rulerEl.style.pointerEvents = 'none';
        rulerEl.classList.add('desk-phone-hidden');
      }

      // Move focus to From field if in Contact view
      if (view === 'contact') {
        setTimeout(() => {
          fromInputRef.current?.focus({ preventScroll: true });
        }, 50);
      }
      return;
    }

    // Normal motion: Compute start rect and target centered position
    const deskPhone = getDeskPhoneRect();
    const phoneEl = phoneChassisRef.current;
    if (!phoneEl) return;

    // Get phone's final rest dimensions
    const phoneRect = phoneEl.getBoundingClientRect();
    const phoneWidth = phoneRect.width > 0 ? phoneRect.width : 280;
    const phoneHeight = phoneRect.height > 0 ? phoneRect.height : 546;

    const targetCenterX = window.innerWidth / 2;
    // Keep target top at least 80px below top of viewport to never overlap nav pills (y=26..62px)
    const targetCenterY = Math.max(80 + phoneHeight / 2, window.innerHeight / 2);

    let deltaX = 0;
    let deltaY = (window.innerHeight - targetCenterY) + 60;
    let scale = 0.35;
    let rotation = 0;

    const rulerEl = document.querySelector<HTMLElement>('.desk-object-ruler');

    if (deskPhone) {
      const { rect: startRect, rotation: startRot } = deskPhone;
      scale = startRect.width / phoneWidth;
      const startCenterX = startRect.left + startRect.width / 2;
      const startCenterY = startRect.top + startRect.height / 2;
      deltaX = startCenterX - targetCenterX;
      deltaY = startCenterY - targetCenterY;
      rotation = startRot;

      // Cross-fade: Hide desk object over first 200ms
      if (rulerEl) {
        rulerEl.style.transition = 'opacity 200ms ease-out';
        rulerEl.style.opacity = '0';
        rulerEl.style.pointerEvents = 'none';
        rulerEl.classList.add('desk-phone-hidden');
      }
    } else {
      // Fallback: growing from bottom center at scale 0.35
      if (rulerEl) {
        rulerEl.style.transition = 'opacity 200ms ease-out';
        rulerEl.style.opacity = '0';
        rulerEl.style.pointerEvents = 'none';
        rulerEl.classList.add('desk-phone-hidden');
      }
    }

    flipParamsRef.current = { deltaX, deltaY, scale, rotation };

    // Set phone to start transform and opacity 0
    phoneEl.style.willChange = 'transform';
    phoneEl.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scale}) rotate(${rotation}deg)`;
    phoneEl.style.opacity = '0';

    // Start 750ms zoom animation in next frame
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!phoneEl) return;
        phoneEl.style.transition =
          'transform 750ms cubic-bezier(.22, 1, .36, 1), opacity 200ms ease-out';
        phoneEl.style.transform = 'translate3d(0, 0, 0) scale(1) rotate(0deg)';
        phoneEl.style.opacity = '1';
      });
    });

    // 1) Zoom finishes at 750ms
    const zoomTimer = setTimeout(() => {
      if (phoneEl) {
        phoneEl.style.willChange = 'auto';
        phoneEl.style.transform = '';
        phoneEl.style.transition = '';
      }
      setIsZoomed(true);

      // 2) 100ms after zoom ends (at 850ms), screen turns on with 300ms flicker
      const screenTimer = setTimeout(() => {
        setScreenOn(true);
        setFormVisible(true);

        // Move focus to From field without scrolling
        setTimeout(() => {
          if (view === 'contact') {
            fromInputRef.current?.focus({ preventScroll: true });
          }
        }, 320);

        // 3) Form rows stagger finishes, then actions appear with 80ms stagger
        const actionsTimer = setTimeout(() => {
          setActionsVisible(true);
        }, 300);

        return () => clearTimeout(actionsTimer);
      }, 100);

      return () => clearTimeout(screenTimer);
    }, 750);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(zoomTimer);
    };
  }, [isDirectLoad, getDeskPhoneRect, view]);

  // Clean up body dimming on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove('desk-dimmed');
    };
  }, []);

  // REVERSE CLOSING SEQUENCE:
  // 1. Form and actions fade out (150ms)
  // 2. Screen turns off (150ms)
  // 3. Phone shrinks back into desk object's rect while overlay fades out (~600ms)
  // 4. Restore desk object, navigate to #/, return focus to Contact/About pill
  const triggerClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      // prefers-reduced-motion: 150ms fade out only
      setIsDimOverlayVisible(false);
      const phoneEl = phoneChassisRef.current;
      if (phoneEl) {
        phoneEl.style.transition = 'opacity 150ms ease';
        phoneEl.style.opacity = '0';
      }
      setTimeout(() => {
        restoreDeskObject();
        onClose();
        onCloseComplete?.();
      }, 150);
      return;
    }

    // Step 1: Form and actions fade out (150ms)
    setClosePhase('content');

    setTimeout(() => {
      // Step 2: Screen turns off (150ms)
      setClosePhase('screen');

      setTimeout(() => {
        // Step 3: Phone shrinks back into phone object's rect over 600ms
        setClosePhase('zoom');
        setIsDimOverlayVisible(false);

        const params = flipParamsRef.current;
        const phoneEl = phoneChassisRef.current;
        if (phoneEl) {
          phoneEl.style.willChange = 'transform';
          phoneEl.style.transition =
            'transform 600ms cubic-bezier(.22, 1, .36, 1), opacity 200ms ease 400ms';
          phoneEl.style.transform = `translate3d(${params.deltaX}px, ${params.deltaY}px, 0) scale(${params.scale}) rotate(${params.rotation}deg)`;
          phoneEl.style.opacity = '0';
        }

        // Fade desk object back to opacity 1 over the last 200ms of the zoom
        const rulerEl = document.querySelector<HTMLElement>('.desk-object-ruler');
        if (rulerEl) {
          rulerEl.style.transition = 'opacity 200ms ease 400ms';
          rulerEl.style.opacity = '1';
          rulerEl.style.pointerEvents = '';
        }

        // Step 4: End of reverse sequence (600ms later)
        setTimeout(() => {
          restoreDeskObject();
          onClose();
          onCloseComplete?.();
        }, 600);
      }, 150);
    }, 150);
  }, [onClose, onCloseComplete, restoreDeskObject]);

  // Handle external closing trigger (e.g. browser back button or nav Back pill)
  useEffect(() => {
    if (isClosing && !isClosingRef.current) {
      triggerClose();
    }
  }, [isClosing, triggerClose]);

  // Keyboard navigation & Focus Trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        triggerClose();
        return;
      }

      // Trap focus inside phone AND action buttons
      if (e.key === 'Tab' && modalRootRef.current) {
        const focusable = modalRootRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const visibleFocusable = Array.from(focusable).filter(
          (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0
        );

        if (visibleFocusable.length === 0) return;

        const firstElement = visibleFocusable[0];
        const lastElement = visibleFocusable[visibleFocusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerClose]);

  // Handle Contact Send action (mailto form)
  const handleSendMail = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `[${topic}] Portfolio Message${fromEmail ? ` from ${fromEmail}` : ''}`;
    const bodyContent = `${message}\n\n---\nSent from Portfolio Contact Screen\nFrom: ${fromEmail || 'Not specified'}`;
    const mailtoUrl = `mailto:${profileData.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyContent)}`;
    window.location.href = mailtoUrl;
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(profileData.email);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2200);
  };

  return (
    <div className="phone-modal-root" ref={modalRootRef}>
      {/* 2) FULL-SCREEN DESK DIMMING OVERLAY */}
      <div
        className={`desk-dim-overlay ${isDimOverlayVisible ? 'is-visible' : ''} ${closePhase === 'zoom' ? 'is-fading-out' : ''}`}
        onClick={triggerClose}
        aria-hidden="true"
      />

      {/* PHONE AND ACTIONS LAYOUT CONTAINER */}
      <div className="phone-modal-layout">
        {/* 1) & 5) PHONE DEVICE CHASSIS (Portrait 1:1.95 ratio) */}
        <div
          ref={phoneChassisRef}
          className={`phone-device-chassis torn-paper-edge ${isZoomed ? 'is-zoomed' : ''} ${screenOn ? 'screen-on' : 'screen-off'} ${closePhase ? `close-${closePhase}` : ''}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="phone-dialog-heading"
        >
          {/* Sole <h1> on page when phone is open */}
          <h1 id="phone-dialog-heading" className="sr-only">
            {view === 'contact' ? 'Contact' : 'About'}
          </h1>

          {/* Crack Texture (always visible on screen) */}
          <svg className="phone-crack-svg" viewBox="0 0 340 680" fill="none" aria-hidden="true">
            <path
              d="M320 40 L285 75 L292 90 L260 125 M285 75 L250 82 M260 125 L230 160 M260 125 L275 145"
              stroke="currentColor"
              strokeWidth="0.9"
              strokeLinecap="round"
            />
          </svg>

          {/* Top Speaker Notch / Dynamic Island */}
          <div className="phone-notch-bar" aria-hidden="true">
            <div className="phone-speaker-slot"></div>
            <div className="phone-camera-lens"></div>
          </div>

          {/* 3) PHONE DISPLAY SCREEN: Arrives OFF, switches ON 100ms after zoom */}
          <div className={`phone-screen-frame ${screenOn ? 'screen-active' : 'screen-dark'}`}>
            {/* Light screen layer that flickers on */}
            <div className={`phone-screen-light-layer ${screenOn ? 'layer-on' : 'layer-off'}`}>
              {/* ==========================================================
                  VIEW 1: ABOUT (Notes App)
                 ========================================================== */}
              {view === 'about' ? (
                <div className="notes-app-screen">
                  {/* Notes Header */}
                  <div className={`notes-app-header ${formVisible ? 'header-visible' : 'header-hidden'}`}>
                    <button
                      type="button"
                      className="notes-back-btn"
                      onClick={triggerClose}
                      aria-label="Done with notes, back to desk"
                    >
                      ‹ <span className="font-body">Desk</span>
                    </button>
                    <span className="notes-app-title font-handwriting">
                      Notes
                    </span>
                    <button
                      type="button"
                      className="notes-switch-btn font-handwriting"
                      onClick={() => onSwitchView('contact')}
                      aria-label="Switch to Mail Contact app"
                    >
                      Email ✉
                    </button>
                  </div>

                  {/* Notes Body (Lined Notepad) */}
                  <div className="notes-scrollable-body">
                    <div className={`notes-date-stamp font-handwriting ${formVisible ? 'notes-row-stagger-1' : 'row-hidden'}`}>
                      Today, 4:20 PM • Personal Notes
                    </div>

                    {/* Photo Slot: Polaroid Placeholder */}
                    <div className={`notes-photo-slot ${formVisible ? 'notes-row-stagger-2' : 'row-hidden'}`}>
                      <img
                        src="/avatar-placeholder.svg"
                        alt="Hand-drawn portrait illustration of Saadhana Karthikeyan"
                        width={180}
                        height={215}
                        className="notes-avatar-img"
                        loading="eager"
                      />
                    </div>

                    {/* Profile Fields List */}
                    <div className={`notes-fields-list ${formVisible ? 'notes-row-stagger-3' : 'row-hidden'}`}>
                      <div className="notes-field-row">
                        <span className="field-label font-handwriting">Name:</span>
                        <span className="field-value font-body">{profileData.name}</span>
                      </div>

                      <div className="notes-field-row">
                        <span className="field-label font-handwriting">Studying:</span>
                        <span className="field-value font-body">{profileData.studying}</span>
                      </div>

                      <div className="notes-field-row">
                        <span className="field-label font-handwriting">Good at:</span>
                        <span className="field-value font-body">{profileData.goodAt}</span>
                      </div>

                      <div className="notes-field-row">
                        <span className="field-label font-handwriting">Lately building:</span>
                        <span className="field-value font-body">{profileData.latelyBuilding}</span>
                      </div>

                      <div className="notes-field-row">
                        <span className="field-label font-handwriting">Interested in:</span>
                        <span className="field-value font-body">{profileData.interestedIn}</span>
                      </div>

                      <div className="notes-field-row">
                        <span className="field-label font-handwriting">Languages:</span>
                        <span className="field-value font-body">{profileData.languages}</span>
                      </div>

                      <div className="notes-field-row">
                        <span className="field-label font-handwriting">Based in:</span>
                        <span className="field-value font-body">{profileData.basedIn}</span>
                      </div>
                    </div>

                    <div className={`notes-footer-doodle font-handwriting ${formVisible ? 'notes-row-stagger-4' : 'row-hidden'}`}>
                      — Keep learning, keep building with purpose ✨
                    </div>
                  </div>
                </div>
              ) : (
                /* ==========================================================
                   VIEW 2: CONTACT (Mail App)
                   ========================================================== */
                <div className="mail-app-screen">
                  {/* Mail App Top Bar */}
                  <div className={`mail-app-header ${formVisible ? 'header-visible' : 'header-hidden'}`}>
                    <button
                      type="button"
                      className="mail-cancel-btn"
                      onClick={triggerClose}
                      aria-label="Cancel and close email"
                    >
                      Cancel
                    </button>
                    <span className="mail-app-title font-handwriting">
                      New Message
                    </span>
                    <button
                      type="submit"
                      form="mail-contact-form"
                      className="mail-send-btn font-handwriting"
                      aria-label="Send email via mail application"
                    >
                      Send
                    </button>
                  </div>

                  {/* Mail Form with staggered rows (From, To, Topic, message, Send) */}
                  <form id="mail-contact-form" className="mail-form-body" onSubmit={handleSendMail}>
                    {/* 1. From Row (receives focus when screen switches on) */}
                    <div className={`mail-input-row ${formVisible ? 'form-row-stagger-1' : 'row-hidden'}`}>
                      <label htmlFor="mail-from-field" className="mail-label">
                        From:
                      </label>
                      <input
                        ref={fromInputRef}
                        id="mail-from-field"
                        type="text"
                        placeholder="Your name or email"
                        value={fromEmail}
                        onChange={(e) => setFromEmail(e.target.value)}
                        className="mail-input"
                      />
                    </div>

                    {/* 2. To Row */}
                    <div className={`mail-input-row ${formVisible ? 'form-row-stagger-2' : 'row-hidden'}`}>
                      <label htmlFor="mail-to-field" className="mail-label">
                        To:
                      </label>
                      <div className="mail-to-recipient">
                        <input
                          id="mail-to-field"
                          type="email"
                          readOnly
                          value={profileData.email}
                          className="mail-input mail-input-readonly"
                          aria-label="Recipient email address fixed to saadhanak18@gmail.com"
                        />
                        <button
                          type="button"
                          className="copy-email-btn"
                          onClick={handleCopyEmail}
                          title="Copy email to clipboard"
                          aria-label="Copy recipient email to clipboard"
                        >
                          {isCopied ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    {/* 3. Topic Row */}
                    <div className={`mail-input-row ${formVisible ? 'form-row-stagger-3' : 'row-hidden'}`}>
                      <label htmlFor="mail-topic-field" className="mail-label">
                        Topic:
                      </label>
                      <select
                        id="mail-topic-field"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="mail-select"
                        required
                      >
                        <option value="Internship">Internship Opportunity</option>
                        <option value="Collaboration">Project Collaboration</option>
                        <option value="Hackathon team">Hackathon Team</option>
                        <option value="Just saying hi">Just saying hi 👋</option>
                      </select>
                    </div>

                    {/* 4. Message Row */}
                    <div className={`mail-body-row ${formVisible ? 'form-row-stagger-4' : 'row-hidden'}`}>
                      <label htmlFor="mail-message-field" className="sr-only">
                        Message
                      </label>
                      <textarea
                        id="mail-message-field"
                        placeholder="Write your note here... looking forward to hearing from you!"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="mail-textarea"
                        rows={5}
                        required
                      />
                    </div>

                    {/* 5. Send Row */}
                    <div className={`mail-submit-row ${formVisible ? 'form-row-stagger-5' : 'row-hidden'}`}>
                      <button
                        type="submit"
                        className="mail-primary-send-btn font-handwriting"
                        aria-label="Send message"
                      >
                        Send message ✉
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Home Indicator Bar */}
          <div className="phone-home-indicator" aria-hidden="true"></div>
        </div>

        {/* ==========================================================
            4) CONTACT ACTIONS
            Desktop (>= 1000px): Vertical stack at right with 32px gap
            Mobile (< 1000px): Wrapping row under phone
           ========================================================== */}
        <div
          className={`phone-actions-container ${actionsVisible ? 'actions-visible' : 'actions-hidden'} ${closePhase ? `close-${closePhase}` : ''}`}
          role="region"
          aria-label="Professional Links and Resume"
        >
          {/* Handwritten label on desktop */}
          <span className="phone-actions-header-label font-handwriting" aria-hidden="true">
            find me elsewhere
          </span>

          <div className="phone-actions-stack">
            {/* 1. Download Resume */}
            <a
              href={profileData.resumeUrl}
              download="Saadhana_Karthikeyan_Resume.pdf"
              className="pill-btn pill-terracotta phone-action-pill action-stagger-1"
              aria-label="Download Saadhana Karthikeyan Resume PDF"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Download Resume</span>
            </a>

            {/* 2. LinkedIn */}
            <a
              href="https://www.linkedin.com/in/saadhana-karthikeyan-449743326"
              target="_blank"
              rel="noopener noreferrer"
              className="pill-btn phone-action-pill action-stagger-2"
              aria-label="Saadhana Karthikeyan LinkedIn Profile (opens in new tab)"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
              <span>LinkedIn</span>
            </a>

            {/* 3. GitHub (View source) */}
            <a
              href="https://github.com/saadhana4/online-portfolio"
              target="_blank"
              rel="noopener noreferrer"
              className="pill-btn phone-action-pill action-stagger-3"
              aria-label="View source on GitHub (opens in new tab)"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>View source</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
