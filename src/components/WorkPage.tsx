import React, { useState, useEffect, useCallback, useRef } from 'react';
import { projects } from '../data/projects';

interface WorkPageProps {
  onBack: () => void;
}

export const WorkPage: React.FC<WorkPageProps> = ({ onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animClass, setAnimClass] = useState<'fade' | 'slide-left' | 'slide-right'>('fade');
  const [animKey, setAnimKey] = useState<number>(0);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const totalProjects = projects.length;
  const project = projects[currentIndex];

  const changeProject = useCallback((nextIndex: number, animType: 'fade' | 'slide-left' | 'slide-right' = 'fade') => {
    setAnimClass(animType);
    setAnimKey((prev) => prev + 1);
    setCurrentIndex(nextIndex);
  }, []);

  const goToPrev = useCallback((animType: 'fade' | 'slide-right' = 'fade') => {
    changeProject(currentIndex > 0 ? currentIndex - 1 : totalProjects - 1, animType);
  }, [currentIndex, totalProjects, changeProject]);

  const goToNext = useCallback((animType: 'fade' | 'slide-left' = 'fade') => {
    changeProject(currentIndex < totalProjects - 1 ? currentIndex + 1 : 0, animType);
  }, [currentIndex, totalProjects, changeProject]);

  const goToIndex = useCallback((idx: number) => {
    if (idx === currentIndex) return;
    changeProject(idx, idx > currentIndex ? 'slide-left' : 'slide-right');
  }, [currentIndex, changeProject]);

  // Keyboard navigation: ArrowLeft and ArrowRight, Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev('fade');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext('fade');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrev, goToNext, onBack]);

  // Touch Swipe navigation on framed visual (threshold 40px; ignore mostly-vertical gestures)
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

    // Ignore gestures that are mostly vertical so scrolling is never blocked
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      return;
    }

    if (deltaX < -40) {
      // Swiped left -> Next project
      goToNext('slide-left');
    } else if (deltaX > 40) {
      // Swiped right -> Previous project
      goToPrev('slide-right');
    }
  };

  return (
    <div
      className="page-overlay work-page-container"
      role="region"
      aria-label="Featured Software Engineering Projects"
    >
      {/* Visually hidden screen reader announcements & h1 heading */}
      <h1 className="sr-only">Featured Projects</h1>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Project {currentIndex + 1} of {totalProjects}: {project.title}
      </div>

      <div className="work-content-wrapper">
        {/* Header row with "Back to Desk" button (hidden under 700px on mobile) */}
        <div className="work-header-row">
          <button
            type="button"
            className="pill-btn pill-sage work-back-btn"
            onClick={onBack}
            aria-label="Back to desk"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Back to Desk</span>
          </button>
        </div>

        {/* Two-Column Layout (Desktop) / Stacked (Tablet & Mobile) */}
        <div key={animKey} className={`work-two-column-block ${animClass}`}>
          {/* Left Column: Framed visual window */}
          <div
            className="work-visual-frame wobbly-border"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Washi tape accents */}
            <div className="washi-tape tape-top-left" aria-hidden="true" />
            <div className="washi-tape tape-top-right" aria-hidden="true" />

            {/* Counter pill tucked at the frame's top corner */}
            <div className="work-counter font-handwriting" aria-hidden="true">
              Project {String(currentIndex + 1).padStart(2, '0')} / {String(totalProjects).padStart(2, '0')}
            </div>

            {/* Project visual illustration */}
            <div className="project-visual-wrapper">
              <img
                src={project.image}
                alt={project.alt}
                width={500}
                height={320}
                className="project-visual-img"
                loading="eager"
              />
            </div>
          </div>

          {/* Right Column: Project details on paper (no card background or border) */}
          <div className="work-info-column">
            {project.highlight && (
              <span className="project-highlight-pill font-handwriting">
                {project.highlight}
              </span>
            )}

            <h2 className="project-title font-handwriting">{project.title}</h2>
            <p className="project-subtitle">{project.subtitle}</p>
            <p className="project-summary">{project.summary}</p>

            {/* Tech tag pills in a wrapping row */}
            <div className="project-tags-row" aria-label="Technologies used">
              {project.tags.map((tag) => (
                <span key={tag} className="tech-tag-pill">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Slider controls: Previous/Next arrows + dot pagination */}
          <div className="slider-controls-row">
            <button
              type="button"
              className="slider-arrow-btn"
              onClick={() => goToPrev('fade')}
              aria-label="Previous project (or press Left Arrow)"
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

            {/* Dot Pagination with >= 44x44px touch targets */}
            <div
              className="dot-pagination"
              role="tablist"
              aria-label="Project selection pagination"
            >
              {projects.map((p, idx) => (
                <button
                  key={p.id}
                  role="tab"
                  type="button"
                  className={`pagination-dot ${idx === currentIndex ? 'active' : ''}`}
                  onClick={() => goToIndex(idx)}
                  aria-selected={idx === currentIndex}
                  aria-label={`Slide to project ${idx + 1}: ${p.title}`}
                >
                  <span className="dot-circle" aria-hidden="true" />
                  <span className="sr-only">Project {idx + 1}: {p.title}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              className="slider-arrow-btn"
              onClick={() => goToNext('fade')}
              aria-label="Next project (or press Right Arrow)"
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
        </div>

        {/* Swipe hint on touch devices */}
        <p className="swipe-hint font-handwriting" aria-hidden="true">
          swipe or use arrow keys ← →
        </p>
      </div>
    </div>
  );
};
