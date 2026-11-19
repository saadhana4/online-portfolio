import React, { useState, useEffect, useRef, useCallback, useLayoutEffect, useMemo } from 'react';
import { profileData } from '../data/profile';
import { PHONE_SCREEN } from '../data/phoneScreen';
import {
  computeDeskObjectEngineState,
  shortestRotationDeg,
  type DeskObjectEngineState,
} from '../data/phoneEngine';
import { preloadLargePhoneImage } from '../utils/preloadImage';

interface PhoneModalProps {
  view: 'about' | 'contact';
  isDirectLoad?: boolean;
  isClosing?: boolean;
  onClose: () => void;
  onCloseComplete?: () => void;
  onSwitchView: (view: 'about' | 'contact') => void;
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
  const cloneRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const fromInputRef = useRef<HTMLInputElement>(null);
  const isClosingRef = useRef<boolean>(false);
  const activeAnimationRef = useRef<Animation | null>(null);

  const [isReducedMotion] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  // Target sizing and layout calculated purely from viewport
  const dims = useMemo(() => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1366;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 642;
    const isMobile = vw < 700;

    // Sizing: screen height about min(80svh, 560px), smaller on mobile so actions fit in 100svh
    const hScreen = Math.min(isMobile ? vh * 0.58 : vh * 0.8, 560);
    const targetScale = hScreen / PHONE_SCREEN.size.heightNative; // 426

    const wImage = PHONE_SCREEN.imageWidth * targetScale; // 480 * s
    const hImage = PHONE_SCREEN.imageHeight * targetScale; // 650 * s
    const wScreen = PHONE_SCREEN.size.widthNative * targetScale; // 198 * s
    const xScreenInImg = PHONE_SCREEN.center.xNative * targetScale; // 295 * s
    const yScreenInImg = PHONE_SCREEN.center.yNative * targetScale; // 250 * s
    const rCorner = PHONE_SCREEN.cornerRadiusNative * targetScale; // 22 * s

    // Centering: center of screen horizontally in viewport
    const targetScreenX = vw / 2;
    // On 1366x642 and others: keep top clear of nav pills (y=26..62px)
    const targetScreenY = Math.max(76 + hScreen / 2, vh / 2);

    return {
      targetScale,
      wImage,
      hImage,
      wScreen,
      hScreen,
      xScreenInImg,
      yScreenInImg,
      rCorner,
      targetScreenX,
      targetScreenY,
    };
  }, []);

  // Stored transforms for closing animation
  const targetTransformRef = useRef<string>('');
  const targetRotRef = useRef<number>(-PHONE_SCREEN.tiltAngleDeg);

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

  // Helper to restore original desk object
  const restoreDeskObject = useCallback(() => {
    const rulerEl = document.querySelector<HTMLElement>('.desk-object-ruler');
    if (rulerEl) {
      rulerEl.style.transition = '';
      rulerEl.style.opacity = '';
      rulerEl.style.visibility = '';
      rulerEl.style.pointerEvents = '';
      rulerEl.classList.remove('desk-phone-hidden');
    }
  }, []);

  // Run zoom transition using Web Animations API
  useLayoutEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Dim desk overlay immediately
    document.body.classList.add('desk-dimmed');

    const cloneEl = cloneRef.current;
    const rulerEl = document.querySelector<HTMLElement>('.desk-object-ruler');

    // Get current engine state of desk ruler object (no getBoundingClientRect)
    let engineState: DeskObjectEngineState | null = null;
    if (typeof window !== 'undefined') {
      const getEngine = (window as unknown as { __getDeskObjectEngineState?: (id?: string) => DeskObjectEngineState })
        .__getDeskObjectEngineState;
      if (getEngine) {
        engineState = getEngine('ruler');
      } else {
        engineState = computeDeskObjectEngineState(
          'ruler',
          0,
          0,
          window.innerWidth < 700,
          false,
          window.innerWidth,
          window.innerHeight
        );
      }
    }

    const startRot = engineState && engineState.isAvailable ? engineState.rotation : 0;
    // Shortest rotation path so screen becomes upright (-PHONE_SCREEN.tiltAngleDeg = -12.6deg)
    const targetRot = shortestRotationDeg(startRot, -PHONE_SCREEN.tiltAngleDeg);
    targetRotRef.current = targetRot;

    const targetTx = dims.targetScreenX - dims.xScreenInImg;
    const targetTy = dims.targetScreenY - dims.yScreenInImg;
    const targetTransform = `translate3d(${targetTx}px, ${targetTy}px, 0) rotate(${targetRot}deg) scale(1)`;
    targetTransformRef.current = targetTransform;

    // Immediately hide original desk object (visibility hidden)
    if (rulerEl) {
      rulerEl.style.visibility = 'hidden';
      rulerEl.style.opacity = '0';
      rulerEl.style.pointerEvents = 'none';
      rulerEl.classList.add('desk-phone-hidden');
    }

    if (!cloneEl) return;

    if (isDirectLoad || prefersReduced) {
      // Direct load or reduced motion: set final transform
      cloneEl.style.transform = targetTransform;
      cloneEl.style.opacity = '1';

      requestAnimationFrame(() => {
        setIsZoomed(true);
        setScreenOn(true);
        setFormVisible(true);
        setActionsVisible(true);
      });

      if (view === 'contact') {
        const timer = setTimeout(() => {
          fromInputRef.current?.focus({ preventScroll: true });
        }, 50);
        return () => clearTimeout(timer);
      }
      return;
    }

    // Determine start transform
    let startTx = 0;
    let startTy = 0;
    let startScale = 0.35;

    if (engineState && engineState.isAvailable) {
      startTx = engineState.screenCenterX - dims.xScreenInImg;
      startTy = engineState.screenCenterY - dims.yScreenInImg;
      startScale = engineState.width / dims.wImage;
    } else {
      // Fallback: start from bottom center at scale 0.35
      startTx = window.innerWidth / 2 - dims.xScreenInImg;
      startTy = window.innerHeight + 60 - dims.yScreenInImg;
      startScale = 0.35;
    }

    const startTransform = `translate3d(${startTx}px, ${startTy}px, 0) rotate(${startRot}deg) scale(${startScale})`;

    cloneEl.style.willChange = 'transform';
    cloneEl.style.transform = startTransform;
    cloneEl.style.opacity = '1';

    let isCancelled = false;

    // Ensure high-res image is decoded before animation runs
    preloadLargePhoneImage().then(() => {
      if (isCancelled || !cloneEl) return;

      // Animate clone with Web Animations API using transform only
      const anim = cloneEl.animate(
        [
          { transform: startTransform },
          { transform: targetTransform },
        ],
        {
          duration: 900,
          easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
          fill: 'forwards',
        }
      );
      activeAnimationRef.current = anim;

      anim.onfinish = () => {
        if (isCancelled || !cloneEl) return;
        cloneEl.style.willChange = 'auto';
        cloneEl.style.transform = targetTransform;
        setIsZoomed(true);

        // 100ms after zoom ends, screen switches on with flicker
        setTimeout(() => {
          if (isCancelled) return;
          setScreenOn(true);
          setFormVisible(true);

          // Focus moves to From field
          setTimeout(() => {
            if (isCancelled) return;
            if (view === 'contact') {
              fromInputRef.current?.focus({ preventScroll: true });
            }
          }, 320);

          // Contact actions fade in after form with 80ms stagger
          setTimeout(() => {
            if (isCancelled) return;
            setActionsVisible(true);
          }, 300);
        }, 100);
      };
    });

    return () => {
      isCancelled = true;
      if (activeAnimationRef.current) {
        activeAnimationRef.current.cancel();
      }
    };
  }, [isDirectLoad, dims, view]);

  // Clean up body dimming class on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove('desk-dimmed');
    };
  }, []);

  // REVERSE CLOSING SEQUENCE:
  // 1. Actions and form fade out (150ms)
  // 2. Screen turns off (150ms)
  // 3. Re-read object's CURRENT center, rotation and width from engine, animate clone back (800ms)
  // 4. Remove clone, restore original object, navigate to #/, return focus to Contact pill
  const triggerClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setIsDimOverlayVisible(false);
      const cloneEl = cloneRef.current;
      if (cloneEl) {
        cloneEl.style.transition = 'opacity 150ms ease';
        cloneEl.style.opacity = '0';
      }
      setTimeout(() => {
        restoreDeskObject();
        onClose();
        onCloseComplete?.();
      }, 150);
      return;
    }

    // Step 1: Actions and form fade out (150ms)
    setClosePhase('content');

    setTimeout(() => {
      // Step 2: Screen turns off (150ms)
      setClosePhase('screen');

      setTimeout(() => {
        // Step 3: Animate clone back to desk object's current position (800ms)
        setClosePhase('zoom');
        setIsDimOverlayVisible(false);

        const cloneEl = cloneRef.current;

        // Re-read current engine state
        let currentEngine: DeskObjectEngineState | null = null;
        if (typeof window !== 'undefined') {
          const getEngine = (window as unknown as { __getDeskObjectEngineState?: (id?: string) => DeskObjectEngineState })
            .__getDeskObjectEngineState;
          if (getEngine) {
            currentEngine = getEngine('ruler');
          }
        }

        let returnTx = 0;
        let returnTy = 0;
        let returnScale = 0.35;
        let returnRot = targetRotRef.current;

        if (currentEngine && currentEngine.isAvailable) {
          returnTx = currentEngine.screenCenterX - dims.xScreenInImg;
          returnTy = currentEngine.screenCenterY - dims.yScreenInImg;
          returnScale = currentEngine.width / dims.wImage;
          returnRot = shortestRotationDeg(targetRotRef.current, currentEngine.rotation);
        } else {
          returnTx = window.innerWidth / 2 - dims.xScreenInImg;
          returnTy = window.innerHeight + 80 - dims.yScreenInImg;
          returnScale = 0.35;
          returnRot = targetRotRef.current;
        }

        const returnTransform = `translate3d(${returnTx}px, ${returnTy}px, 0) rotate(${returnRot}deg) scale(${returnScale})`;

        if (cloneEl) {
          cloneEl.style.willChange = 'transform';
          const returnAnim = cloneEl.animate(
            [
              { transform: targetTransformRef.current, opacity: '1' },
              { transform: returnTransform, opacity: '0' },
            ],
            {
              duration: 800,
              easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
              fill: 'forwards',
            }
          );

          returnAnim.onfinish = () => {
            restoreDeskObject();
            onClose();
            onCloseComplete?.();
          };
        } else {
          restoreDeskObject();
          onClose();
          onCloseComplete?.();
        }
      }, 150);
    }, 150);
  }, [onClose, onCloseComplete, restoreDeskObject, dims]);

  // Handle external closing trigger (browser back or nav back pill)
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

      // Trap focus inside phone dialog AND action buttons
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
      {/* 3) FULL-SCREEN OVERLAY: Warm dark tint rgba(60,50,35,0.30), no blur */}
      <div
        className={`desk-dim-overlay ${isDimOverlayVisible ? 'is-visible' : ''} ${closePhase === 'zoom' ? 'is-fading-out' : ''}`}
        onClick={triggerClose}
        aria-hidden="true"
      />

      {/* DIALOG ACCESSIBILITY CONTAINER */}
      <div
        className="phone-dialog-wrap"
        role="dialog"
        aria-modal="true"
        aria-labelledby="phone-dialog-heading"
      >
        {/* Sole <h1> on page when dialog is open */}
        <h1 id="phone-dialog-heading" className="sr-only">
          {view === 'contact' ? 'Contact' : 'About'}
        </h1>

        {/* 2) & 4) ANIMATING CLONE OF DESK OBJECT (The Hand Holding Phone Image) */}
        <div
          ref={cloneRef}
          className={`hand-phone-clone ${isZoomed ? 'is-zoomed' : ''} ${closePhase ? `close-${closePhase}` : ''}`}
          style={{
            width: `${dims.wImage}px`,
            height: `${dims.hImage}px`,
            transformOrigin: `${dims.xScreenInImg}px ${dims.yScreenInImg}px`,
          }}
          aria-hidden="true"
        >
          {/* Engraved Hand Holding Smartphone Image */}
          <img
            src="/desk/hand-phone-large.webp"
            alt=""
            aria-hidden="true"
            className="hand-phone-img"
            draggable={false}
          />

          {/* 4) SCREEN UI CONTAINER: Placed and rotated over calibrated screen quad */}
          <div
            className={`phone-screen-container ${screenOn ? 'screen-on' : 'screen-off'}`}
            style={{
              left: `${dims.xScreenInImg}px`,
              top: `${dims.yScreenInImg}px`,
              width: `${dims.wScreen}px`,
              height: `${dims.hScreen}px`,
              borderRadius: `${dims.rCorner}px`,
              transform: `translate(-50%, -50%) rotate(${PHONE_SCREEN.tiltAngleDeg}deg)`,
              transformOrigin: '50% 50%',
            }}
          >
            {/* Opaque Light Screen Layer that turns on 100ms after zoom */}
            <div className={`phone-screen-light-layer ${screenOn ? 'layer-on' : 'layer-off'}`}>
              {/* ==========================================================
                  VIEW 1: ABOUT (Notes Screen)
                 ========================================================== */}
              {view === 'about' ? (
                <div className="notes-app-screen">
                  {/* Notes Header */}
                  <div className={`notes-app-header ${formVisible ? 'header-visible' : 'header-hidden'}`}>
                    <span className="notes-app-title">Notes</span>
                    <button
                      type="button"
                      className="notes-switch-btn font-handwriting"
                      onClick={() => onSwitchView('contact')}
                      aria-label="Switch to Email contact app"
                    >
                      Email ✉
                    </button>
                  </div>

                  {/* Notes Body */}
                  <div className="notes-scrollable-body">
                    {/* Direct User Photo */}
                    <div className={`notes-photo-slot ${formVisible ? 'notes-row-stagger-1' : 'row-hidden'}`}>
                      <img
                        src="/saadhana-photo.jpg"
                        alt="Portrait photo of Saadhana Karthikeyan"
                        width={136}
                        height={136}
                        className="notes-avatar-img"
                        loading="eager"
                      />
                    </div>

                    {/* Bio Statement */}
                    <div className={`notes-bio-block ${formVisible ? 'notes-row-stagger-2' : 'row-hidden'}`}>
                      <p className="notes-bio-text">
                        {profileData.bio}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* ==========================================================
                   VIEW 2: CONTACT (Mail Screen)
                   ========================================================== */
                <div className="mail-app-screen">
                  {/* Mail App Top Bar */}
                  <div className={`mail-app-header ${formVisible ? 'header-visible' : 'header-hidden'}`}>
                    <button
                      type="button"
                      className="mail-cancel-btn"
                      onClick={triggerClose}
                      aria-label="Cancel message"
                    >
                      Cancel
                    </button>
                    <span className="mail-app-title">New Message</span>
                    <button
                      type="submit"
                      form="mail-contact-form"
                      className="mail-send-btn"
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
                        autoComplete="email"
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
                          aria-label="Recipient email address saadhanak18@gmail.com"
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
                        <option value="Internship">Internship</option>
                        <option value="Collaboration">Collaboration</option>
                        <option value="Hackathon team">Hackathon team</option>
                        <option value="Just saying hi">Just saying hi</option>
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
                        rows={4}
                        required
                      />
                    </div>

                    {/* 5. Primary Send Button */}
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
        </div>

        {/* ==========================================================
            4) CONTACT ACTIONS (Download Resume, LinkedIn, View source)
            Desktop (>= 1000px): Vertical stack at right with 32px gap
            Mobile (< 1000px): Wrapping row under phone
           ========================================================== */}
        <div
          ref={actionsRef}
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
