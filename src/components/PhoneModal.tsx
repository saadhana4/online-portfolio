import React, { useState, useEffect, useRef } from 'react';
import { profileData } from '../data/profile';

interface PhoneModalProps {
  view: 'about' | 'contact';
  onClose: () => void;
  onSwitchView: (view: 'about' | 'contact') => void;
}

export const PhoneModal: React.FC<PhoneModalProps> = ({ view, onClose, onSwitchView }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Form states for Contact view
  const [fromEmail, setFromEmail] = useState('');
  const [topic, setTopic] = useState('Internship');
  const [message, setMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Focus trap & Escape key handling
  useEffect(() => {
    previousActiveElementRef.current = document.activeElement as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Focus trap logic
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

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

    // Initial focus on first interactive element
    const timer = setTimeout(() => {
      if (modalRef.current) {
        const firstInput = modalRef.current.querySelector<HTMLElement>('button, input, textarea, a');
        firstInput?.focus();
      }
    }, 100);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
      }
    };
  }, [onClose, view]);

  // Handle Contact Send action
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
    <div
      className="phone-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="phone-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="phone-modal-wrapper" ref={modalRef}>
        {/* Phone Device Shell */}
        <div className="phone-device-chassis torn-paper-edge">
          {/* Subtle phone screen crack/sketch overlay */}
          <svg className="phone-crack-svg" viewBox="0 0 340 680" fill="none" aria-hidden="true">
            <path
              d="M320 40 L285 75 L292 90 L260 125 M285 75 L250 82"
              stroke="#1F2A24"
              strokeWidth="0.8"
              opacity="0.18"
              strokeLinecap="round"
            />
          </svg>

          {/* Top Speaker Notch / Dynamic Island */}
          <div className="phone-notch-bar">
            <div className="phone-speaker-slot"></div>
            <div className="phone-camera-lens"></div>
          </div>

          {/* Phone Display Screen */}
          <div className="phone-screen-content">
            {/* ==========================================================
                VIEW 1: ABOUT (Notes App)
               ========================================================== */}
            {view === 'about' ? (
              <div className="notes-app-screen">
                {/* Notes App Top Bar */}
                <div className="notes-app-header">
                  <button
                    type="button"
                    className="notes-back-btn"
                    onClick={onClose}
                    aria-label="Done with notes, back to desk"
                  >
                    ‹ <span className="font-body">Desk</span>
                  </button>
                  <span id="phone-modal-title" className="notes-app-title font-handwriting">
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

                {/* Notes Body (Lined Yellow Notepad) */}
                <div className="notes-scrollable-body">
                  <div className="notes-date-stamp font-handwriting">
                    Today, 4:20 PM • Personal Notes
                  </div>

                  {/* Photo Slot: Polaroid Placeholder */}
                  <div className="notes-photo-slot">
                    <img
                      src="/avatar-placeholder.svg"
                      alt="Hand-drawn portrait illustration of Saadhana Karthikeyan"
                      width={180}
                      height={215}
                      className="notes-avatar-img"
                      loading="eager"
                    />
                  </div>

                  {/* Real Selectable HTML Text for Profile Fields */}
                  <div className="notes-fields-list">
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

                  <div className="notes-footer-doodle font-handwriting">
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
                <div className="mail-app-header">
                  <button
                    type="button"
                    className="mail-cancel-btn"
                    onClick={onClose}
                    aria-label="Cancel and close email"
                  >
                    Cancel
                  </button>
                  <span id="phone-modal-title" className="mail-app-title font-handwriting">
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

                {/* Mail Form */}
                <form id="mail-contact-form" className="mail-form-body" onSubmit={handleSendMail}>
                  {/* Fixed "To" field */}
                  <div className="mail-input-row">
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

                  {/* Optional "From" field */}
                  <div className="mail-input-row">
                    <label htmlFor="mail-from-field" className="mail-label">
                      From:
                    </label>
                    <input
                      id="mail-from-field"
                      type="text"
                      placeholder="Your name or email (optional)"
                      value={fromEmail}
                      onChange={(e) => setFromEmail(e.target.value)}
                      className="mail-input"
                    />
                  </div>

                  {/* Topic Select */}
                  <div className="mail-input-row">
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

                  {/* Message Body */}
                  <div className="mail-body-row">
                    <label htmlFor="mail-message-field" className="sr-only">
                      Message
                    </label>
                    <textarea
                      id="mail-message-field"
                      placeholder="Write your note here... looking forward to hearing from you!"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="mail-textarea"
                      rows={6}
                      required
                    />
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Bottom Home Indicator Bar */}
          <div className="phone-home-indicator"></div>
        </div>

        {/* ==========================================================
            BUTTONS BELOW THE PHONE
            Download Resume, LinkedIn, GitHub
           ========================================================== */}
        <div className="phone-bottom-actions-row" role="region" aria-label="Professional Links and Resume">
          <a
            href={profileData.resumeUrl}
            download="Saadhana_Karthikeyan_Resume.pdf"
            className="pill-btn pill-terracotta bottom-action-btn"
            aria-label="Download Saadhana Karthikeyan Resume PDF"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Download Resume</span>
          </a>

          <a
            href={profileData.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="pill-btn bottom-action-btn"
            aria-label="Saadhana Karthikeyan LinkedIn Profile (opens in new tab)"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
            <span>LinkedIn</span>
          </a>

          <a
            href={profileData.github}
            target="_blank"
            rel="noopener noreferrer"
            className="pill-btn bottom-action-btn"
            aria-label="Saadhana Karthikeyan GitHub Profile (opens in new tab)"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </div>
  );
};
