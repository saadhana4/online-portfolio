import React, { useState, useEffect, useRef } from 'react';
import { journeySteps, toolboxSkills } from '../data/journey';

interface JourneyPageProps {
  onBack: () => void;
}

export const JourneyPage: React.FC<JourneyPageProps> = ({ onBack }) => {
  const [activeStepId, setActiveStepId] = useState<string>('education');
  const stepRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Detect which step is active based on scroll position
  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      // Find entry closest to top viewport center
      const visible = entries.filter((e) => e.isIntersecting);
      if (visible.length > 0) {
        // Pick the top one
        visible.sort((a, b) => Math.abs(a.boundingClientRect.top - 120) - Math.abs(b.boundingClientRect.top - 120));
        setActiveStepId(visible[0].target.id);
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: '-80px 0px -40% 0px',
      threshold: [0.1, 0.4, 0.7],
    });

    stepRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="page-overlay journey-page-container" role="region" aria-label="Journey and Experience">
      <div className="journey-content-wrapper">
        {/* Header row */}
        <div className="page-header-row">
          <button
            type="button"
            className="pill-btn pill-sage"
            onClick={onBack}
            aria-label="Back to desk"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Back to Desk</span>
          </button>

          <span className="journey-tagline font-handwriting">learning, building, evolving ✨</span>
        </div>

        {/* Page Title */}
        <div className="journey-title-block">
          <h1 className="journey-main-heading font-handwriting">Journey</h1>
          <p className="journey-intro-text">
            A chronological timeline of milestones, engineering experiences, hackathons, and technical craft.
          </p>
        </div>

        {/* Vertical Timeline List */}
        <div className="journey-timeline" role="list">
          {journeySteps.map((step, idx) => {
            const isActive = activeStepId === step.id;

            return (
              <article
                key={step.id}
                id={step.id}
                ref={(el) => {
                  if (el) stepRefs.current.set(step.id, el);
                  else stepRefs.current.delete(step.id);
                }}
                className={`journey-step-card ${isActive ? 'step-active' : 'step-dimmed'}`}
                role="listitem"
                tabIndex={0}
                aria-current={isActive ? 'step' : undefined}
                onClick={() => setActiveStepId(step.id)}
              >
                {/* Timeline node marker with hand-drawn ring when active */}
                <div className="step-marker-wrapper" aria-hidden="true">
                  <div className="step-number-pill font-handwriting">
                    {String(idx + 1).padStart(2, '0')}
                  </div>

                  {isActive && (
                    <svg
                      className="hand-drawn-ring-svg"
                      viewBox="0 0 70 70"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M35 6 C52 4, 66 18, 64 35 C62 52, 48 65, 33 64 C16 63, 4 48, 6 32 C8 15, 24 5, 42 6"
                        stroke="#C8553D"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        strokeDasharray="180"
                        strokeDashoffset="0"
                      />
                    </svg>
                  )}
                </div>

                {/* Step Body */}
                <div className="step-body-content">
                  <header className="step-header">
                    <span className="step-category-label font-handwriting">{step.category}</span>
                    <h2 className="step-title">{step.title}</h2>
                  </header>

                  <div className="step-items-list">
                    {step.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="step-item-entry">
                        <div className="item-title-row">
                          <h3 className="item-title">{item.title}</h3>
                          {item.badge && <span className="item-badge-pill">{item.badge}</span>}
                        </div>
                        {item.description && <p className="item-desc">{item.description}</p>}
                        {item.details && item.details.length > 0 && (
                          <ul className="item-details-bullets">
                            {item.details.map((detail, dIdx) => (
                              <li key={dIdx}>{detail}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}

          {/* Toolbox Section under the heading "Toolbox" */}
          <section
            id="toolbox"
            ref={(el) => {
              if (el) stepRefs.current.set('toolbox', el);
              else stepRefs.current.delete('toolbox');
            }}
            className={`journey-step-card toolbox-card ${activeStepId === 'toolbox' ? 'step-active' : 'step-dimmed'}`}
            role="region"
            aria-label="Toolbox Skills"
            tabIndex={0}
            onClick={() => setActiveStepId('toolbox')}
          >
            {/* Marker */}
            <div className="step-marker-wrapper" aria-hidden="true">
              <div className="step-number-pill font-handwriting">06</div>
              {activeStepId === 'toolbox' && (
                <svg
                  className="hand-drawn-ring-svg"
                  viewBox="0 0 70 70"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M35 6 C52 4, 66 18, 64 35 C62 52, 48 65, 33 64 C16 63, 4 48, 6 32 C8 15, 24 5, 42 6"
                    stroke="#C8553D"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </div>

            <div className="step-body-content">
              <header className="step-header">
                <span className="step-category-label font-handwriting">Technical Stack</span>
                <h2 className="step-title">Toolbox</h2>
              </header>

              <div className="toolbox-categories-grid">
                {toolboxSkills.map((cat) => (
                  <div key={cat.name} className="toolbox-category-box">
                    <h3 className="toolbox-cat-name font-handwriting">{cat.name}</h3>
                    <div className="toolbox-tags-row">
                      {cat.skills.map((skill) => (
                        <span key={skill} className="toolbox-skill-tag">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
