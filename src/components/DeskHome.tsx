import React, { useState, useEffect } from 'react';
import { deskObjects } from '../data/deskObjects';
import { HeroLine } from './HeroLine';
import { DoodleCompanion } from './DoodleCompanion';

interface Spark {
  id: number;
  x: number;
  y: number;
  rotation: number;
}

export const DeskHome: React.FC = () => {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 700;
    }
    return false;
  });

  const [sparks, setSparks] = useState<Spark[]>([]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 700);
    };

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter objects for mobile: only laptop, notebook, plant, coffee cup, headphones under 700px
  const visibleObjects = deskObjects.filter((obj) => (isMobile ? obj.showOnMobile : true));

  // Pointerdown handler for Click Spark burst
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Skip if clicking on interactive elements like nav, mascot, links, buttons
    const target = e.target as HTMLElement | null;
    if (target && target.closest('a, button, nav, .desk-doodle-container, input, select, textarea')) {
      return;
    }

    // Skip spark under prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
    }

    const sparkId = Date.now() + Math.random();
    const newSpark: Spark = {
      id: sparkId,
      x: e.clientX,
      y: e.clientY,
      rotation: Math.floor(Math.random() * 45),
    };

    // Keep at most 8 alive at once
    setSparks((prev) => [...prev.slice(-7), newSpark]);

    // Remove element after 550ms
    setTimeout(() => {
      setSparks((prev) => prev.filter((s) => s.id !== sparkId));
    }, 550);
  };

  return (
    <section
      className="desk-surface-stage"
      aria-label="Interactive scrapbook desk workspace"
      onPointerDown={handlePointerDown}
    >
      {/* Centered Single-line Hero Message */}
      <HeroLine />

      {/* Scattered Desk Objects Layer: Completely static, non-interactive */}
      <div className="desk-objects-stage-layer" aria-hidden="true">
        {visibleObjects.map((obj) => {
          const posX = isMobile && obj.mobileX !== undefined ? obj.mobileX : obj.x;
          const posY = isMobile && obj.mobileY !== undefined ? obj.mobileY : obj.y;
          const rot = isMobile && obj.mobileRotation !== undefined ? obj.mobileRotation : obj.rotation;
          const widthVw = isMobile && obj.mobileWidthVw !== undefined ? obj.mobileWidthVw : obj.widthVw;

          const style: React.CSSProperties = {
            left: `${posX}%`,
            top: `${posY}%`,
            width: `${widthVw}vw`,
            '--base-rot': `${rot}deg`,
            zIndex: obj.zIndex || 2,
          } as React.CSSProperties;

          return (
            <div
              key={obj.id}
              className={`desk-object-cutout desk-object-${obj.id}`}
              style={style}
              aria-hidden="true"
            >
              <img
                src={obj.src}
                alt=""
                loading="lazy"
                className="desk-cutout-img"
                draggable={false}
              />
            </div>
          );
        })}
      </div>

      {/* Bottom-left Doodle mascot */}
      <DoodleCompanion />

      {/* Click Spark Burst Layer */}
      <div className="burst-layer" aria-hidden="true">
        {sparks.map((spark) => (
          <svg
            key={spark.id}
            className="click-spark-svg"
            viewBox="0 0 30 30"
            style={
              {
                left: `${spark.x}px`,
                top: `${spark.y}px`,
                '--spark-rot': `${spark.rotation}deg`,
              } as React.CSSProperties
            }
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* 8 Short Radial Dashes with a gap in the center */}
            <g stroke="var(--base-400)" strokeWidth="2" strokeLinecap="round">
              {/* North & South */}
              <line x1="15" y1="3" x2="15" y2="7.5" />
              <line x1="15" y1="22.5" x2="15" y2="27" />
              {/* East & West */}
              <line x1="3" y1="15" x2="7.5" y2="15" />
              <line x1="22.5" y1="15" x2="27" y2="15" />
              {/* Diagonals */}
              <line x1="6.5" y1="6.5" x2="9.8" y2="9.8" />
              <line x1="20.2" y1="20.2" x2="23.5" y2="23.5" />
              <line x1="6.5" y1="23.5" x2="9.8" y2="20.2" />
              <line x1="20.2" y1="9.8" x2="23.5" y2="6.5" />
            </g>
          </svg>
        ))}
      </div>
    </section>
  );
};
