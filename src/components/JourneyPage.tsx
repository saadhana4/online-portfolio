import React, { useState, useEffect, useCallback, useRef } from 'react';
import { journeySteps, toolboxSkills, type JourneyStep, type SkillCategory } from '../data/journey';

interface JourneyPageProps {
  onBack: () => void;
}

interface RegularStep extends JourneyStep {
  type: 'regular';
}

interface ToolboxStep {
  type: 'toolbox';
  id: string;
  category: string;
  title: string;
  categories: SkillCategory[];
}

type Step = RegularStep | ToolboxStep;

const steps: Step[] = [
  ...journeySteps.map((s) => ({ ...s, type: 'regular' as const })),
  {
    type: 'toolbox' as const,
    id: 'toolbox',
    category: 'Technical Stack',
    title: 'Toolbox',
    categories: toolboxSkills,
  },
];

// Hand-drawn wobbly circle SVG paths (seeds 0 through 5)
// Plain hand-drawn circle with a slightly open/overlapping imperfect loop
const CIRCLE_PATHS = [
  'M 50 8 C 73 6, 94 25, 93 49 C 92 73, 74 93, 49 92 C 25 91, 7 73, 8 49 C 9 25, 27 7, 52 8 C 62 8.5, 71 13, 76 19',
  'M 47 9 C 71 7, 92 28, 93 52 C 94 75, 76 94, 51 93 C 27 92, 8 74, 7 50 C 6 26, 25 9, 49 8 C 59 7.5, 68 12, 74 17',
  'M 52 7 C 76 9, 95 27, 93 51 C 91 75, 73 92, 48 91 C 24 90, 8 72, 9 48 C 10 24, 29 8, 53 8 C 63 8, 72 13, 77 18',
  'M 49 8 C 73 7, 92 26, 94 49 C 96 72, 77 93, 52 92 C 27 91, 9 73, 8 49 C 7 25, 26 8, 50 8 C 60 8, 69 12, 75 18',
  'M 51 8 C 75 9, 93 29, 92 53 C 91 76, 72 93, 48 92 C 24 91, 7 71, 9 47 C 11 23, 29 7, 53 8 C 63 8.5, 72 14, 76 20',
  'M 48 8 C 72 7, 94 27, 93 50 C 92 74, 74 92, 50 93 C 26 94, 8 75, 7 51 C 6 27, 25 8, 49 8 C 59 8, 68 12, 74 17',
];

export const JourneyPage: React.FC<JourneyPageProps> = ({ onBack }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [animClass, setAnimClass] = useState<'slide-forward' | 'slide-backward'>('slide-forward');
  const [animKey, setAnimKey] = useState<number>(0);

  const cardBodyRef = useRef<HTMLDivElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastWheelTimeRef = useRef<number>(0);

  const totalSteps = steps.length;
  const currentStep = steps[currentIndex];

  const goToIndex = useCallback(
    (nextIndex: number) => {
      if (nextIndex === currentIndex || nextIndex < 0 || nextIndex >= totalSteps) return;
      setAnimClass(nextIndex > currentIndex ? 'slide-forward' : 'slide-backward');
      setAnimKey((k) => k + 1);
      setCurrentIndex(nextIndex);
    },
    [currentIndex, totalSteps]
  );

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      goToIndex(currentIndex - 1);
    }
  }, [currentIndex, goToIndex]);

  const goToNext = useCallback(() => {
    if (currentIndex < totalSteps - 1) {
      goToIndex(currentIndex + 1);
    }
  }, [currentIndex, totalSteps, goToIndex]);

  // Keyboard navigation: Left/Right, Up/Down, PageUp/PageDown, Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT')
      ) {
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrev, goToNext, onBack]);

  // Touch Swipe navigation: horizontal threshold 40px, ignore mostly-vertical gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - touchStartRef.current.x;
    const deltaY = endY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      return;
    }

    if (deltaX < -40) {
      goToNext();
    } else if (deltaX > 40) {
      goToPrev();
    }
  };

  // Mouse wheel / trackpad: 1 step per gesture, threshold 40px deltaY, 700ms cooldown
  // Do NOT hijack wheel if card body has internal scroll in that direction
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const cardBody = cardBodyRef.current;
      if (cardBody && cardBody.contains(e.target as Node)) {
        const hasOverflow = cardBody.scrollHeight > cardBody.clientHeight + 2;
        if (hasOverflow) {
          if (e.deltaY > 0) {
            const atBottom = cardBody.scrollTop + cardBody.clientHeight >= cardBody.scrollHeight - 2;
            if (!atBottom) return; // Allow natural internal scroll
          } else if (e.deltaY < 0) {
            const atTop = cardBody.scrollTop <= 2;
            if (!atTop) return; // Allow natural internal scroll
          }
        }
      }

      if (Math.abs(e.deltaY) < 40) return;

      const now = Date.now();
      if (now - lastWheelTimeRef.current < 700) return;

      if (e.deltaY > 0) {
        if (currentIndex < totalSteps - 1) {
          e.preventDefault();
          lastWheelTimeRef.current = now;
          goToNext();
        }
      } else if (e.deltaY < 0) {
        if (currentIndex > 0) {
          e.preventDefault();
          lastWheelTimeRef.current = now;
          goToPrev();
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentIndex, totalSteps, goToNext, goToPrev]);

  return (
    <div
      className="page-overlay journey-page-container"
      role="region"
      aria-label="Journey and Milestones"
    >
      {/* Screen Reader Announcement for current step */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Step {currentIndex + 1} of {totalSteps}: {currentStep.category}
      </div>

      <div className="journey-content-wrapper">
        {/* Page Heading (h1) */}
        <h1 className="journey-main-heading font-handwriting">Journey</h1>

        {/* Card stage: Large Number + Card */}
        <div
          className="journey-card-stage"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Large Hand-Drawn Number */}
          <div className="journey-large-number-wrap" aria-hidden="true">
            <div className="journey-handdrawn-circle circle-large">
              <svg className="circle-svg" viewBox="0 0 100 100" fill="none" aria-hidden="true">
                <path
                  d={CIRCLE_PATHS[currentIndex]}
                  stroke="var(--base-400)"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="circle-digit font-handwriting">{currentIndex + 1}</span>
            </div>
          </div>

          {/* Current Step Card */}
          <div className="journey-card-anim-wrapper">
            <article
              key={animKey}
              className={`journey-step-card ${animClass}`}
              aria-label={`Step ${currentIndex + 1}: ${currentStep.title}`}
            >
              <header className="journey-step-card-header">
                <span className="step-category-label font-handwriting">{currentStep.category}</span>
                <h2 className="step-title">{currentStep.title}</h2>
              </header>

              <div ref={cardBodyRef} className="journey-step-card-body">
                {currentStep.type === 'regular' ? (
                  <div className="step-items-list">
                    {currentStep.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="step-item-entry">
                        <div className="item-title-row">
                          <h3 className="item-title">{item.title}</h3>
                          {item.badge && (
                            <span className="item-badge-plain font-handwriting">{item.badge}</span>
                          )}
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
                ) : (
                  <div className="toolbox-categories-grid-2col">
                    {currentStep.categories.map((cat) => (
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
                )}
              </div>
            </article>
          </div>
        </div>

        {/* Controls Row: Prev arrow, Hand-Drawn Number Pagination, Next arrow */}
        <div className="journey-controls-row">
          <button
            type="button"
            className="slider-arrow-btn"
            onClick={goToPrev}
            disabled={currentIndex === 0}
            aria-label="Previous step"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <nav aria-label="Journey steps" className="journey-pagination-nav">
            {steps.map((step, idx) => {
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={step.id}
                  type="button"
                  className={`journey-step-nav-btn ${isCurrent ? 'active' : ''}`}
                  onClick={() => goToIndex(idx)}
                  aria-label={`Step ${idx + 1}: ${step.title}`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <span className="journey-handdrawn-circle circle-small">
                    <svg
                      className="circle-svg"
                      viewBox="0 0 100 100"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d={CIRCLE_PATHS[idx]}
                        fill={isCurrent ? 'var(--pill)' : 'none'}
                        stroke={isCurrent ? 'var(--base-400)' : 'var(--base-300)'}
                        strokeWidth={isCurrent ? 3 : 2}
                        vectorEffect="non-scaling-stroke"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="circle-digit font-handwriting">{idx + 1}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            className="slider-arrow-btn"
            onClick={goToNext}
            disabled={currentIndex === totalSteps - 1}
            aria-label="Next step"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Hand-written swipe hint on touch devices only */}
        <p className="journey-swipe-hint font-handwriting" aria-hidden="true">
          swipe or use arrow keys ← →
        </p>
      </div>
    </div>
  );
};
