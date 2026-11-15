import React, { useState, useEffect, useCallback, useRef } from 'react';
import { projects } from '../data/projects';

interface WorkPageProps {
  onBack: () => void;
}

export const WorkPage: React.FC<WorkPageProps> = ({ onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalProjects = projects.length;
  const project = projects[currentIndex];

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalProjects - 1));
  }, [totalProjects]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < totalProjects - 1 ? prev + 1 : 0));
  }, [totalProjects]);

  // Keyboard navigation: ArrowLeft and ArrowRight
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'ArrowRight') {
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

  // Touch Swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 45; // pixels
    if (distance > minSwipeDistance) {
      goToNext();
    } else if (distance < -minSwipeDistance) {
      goToPrev();
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  return (
    <div
      className="page-overlay work-page-container"
      role="region"
      aria-label="Featured Software Engineering Projects"
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="work-content-wrapper">
        {/* Header bar with Back button and Page Title */}
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

          <div className="work-counter font-handwriting" aria-live="polite">
            Project {String(currentIndex + 1).padStart(2, '0')} / {String(totalProjects).padStart(2, '0')}
          </div>
        </div>

        {/* Wobbly Hand-Drawn Frame Card */}
        <div className="project-frame-card wobbly-border">
          {/* Washi tape accents */}
          <div className="washi-tape tape-top-left" aria-hidden="true"></div>
          <div className="washi-tape tape-top-right" aria-hidden="true"></div>

          {/* Project Visual Showcase */}
          <div className="project-visual-wrapper">
            <img
              src={project.image}
              alt={project.alt}
              width={500}
              height={320}
              className="project-visual-img"
              loading="eager"
            />
            {project.highlight && (
              <div className="project-highlight-badge font-handwriting">
                {project.highlight}
              </div>
            )}
          </div>

          {/* Project Details Content */}
          <div className="project-info-section">
            <div className="project-title-row">
              <h1 className="project-title font-handwriting">{project.title}</h1>
            </div>
            <p className="project-subtitle">{project.subtitle}</p>

            <p className="project-summary">{project.summary}</p>

            {/* Tech Tags */}
            <div className="project-tags-row" aria-label="Technologies used">
              {project.tags.map((tag) => (
                <span key={tag} className="tech-tag-pill">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Project Action Links */}
            <div className="project-actions-row">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill-btn project-link-btn"
                  aria-label={`View GitHub repository for ${project.title} (opens in new tab)`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>GitHub</span>
                </a>
              )}

              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill-btn pill-terracotta project-link-btn"
                  aria-label={`Open Live Demo for ${project.title} (opens in new tab)`}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  <span>Live Demo</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Carousel Controls: Arrows + Dots */}
        <div className="slider-controls-row">
          <button
            type="button"
            className="slider-arrow-btn"
            onClick={goToPrev}
            aria-label="Previous project (or press Left Arrow)"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Dot Pagination */}
          <div className="dot-pagination" role="tablist" aria-label="Project selection pagination">
            {projects.map((p, idx) => (
              <button
                key={p.id}
                role="tab"
                type="button"
                className={`pagination-dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
                aria-selected={idx === currentIndex}
                aria-label={`Slide to project ${idx + 1}: ${p.title}`}
              >
                <span className="sr-only">Project {idx + 1}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="slider-arrow-btn"
            onClick={goToNext}
            aria-label="Next project (or press Right Arrow)"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <p className="swipe-hint font-handwriting" aria-hidden="true">
          swipe or use arrow keys ← →
        </p>
      </div>
    </div>
  );
};
