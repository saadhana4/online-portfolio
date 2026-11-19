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
      {/* Hidden SVG filter for the subtle hand-drawn wobble on the frame outline */}
      <svg
        width="0"
        height="0"
        style={{ position: 'absolute', pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <defs>
          <filter id="workFrameWobble" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Visually hidden screen reader announcements & h1 heading */}
      <h1 className="sr-only">Featured Projects</h1>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Project {currentIndex + 1} of {totalProjects}: {project.title}
      </div>

      <div className="work-content-wrapper">
        {/* Two-Column Layout (Desktop) / Stacked (Tablet & Mobile) */}
        <div key={animKey} className={`work-two-column-block ${animClass}`}>
          {/* Left Column: Simple frame (single image edge-to-edge + wobbled outline) */}
          <div
            className="work-visual-frame"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={project.image}
              alt={project.alt}
              width={500}
              height={333}
              className="project-visual-img"
              loading="eager"
            />
            <div className="work-frame-outline" aria-hidden="true" />
          </div>

          {/* Right Column: Project details on paper */}
          <div className="work-info-column">
            {project.highlight && (
              <div className="project-highlight-plain font-handwriting">
                {project.highlight}
              </div>
            )}

            <h2 className="project-title font-handwriting">{project.title}</h2>
            <p className="project-subtitle">{project.subtitle}</p>
            <p className="project-summary">{project.summary}</p>

            {/* Plain tech tags line with middle dots */}
            <p className="project-tags-plain" aria-label="Technologies used">
              {project.tags.join(' · ')}
            </p>
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
