import React, { useState, useEffect } from 'react';
import { deskObjects, type DeskObjectConfig } from '../data/deskObjects';
import { HeroLine } from './HeroLine';
import { DoodleCompanion } from './DoodleCompanion';

interface DeskHomeProps {
  onNavigate: (route: string) => void;
}

export const DeskHome: React.FC<DeskHomeProps> = ({ onNavigate }) => {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 700;
    }
    return false;
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 700);
    };

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter objects for mobile: only laptop, notebook, plant, coffee cup, headphones under 700px
  const visibleObjects = deskObjects.filter((obj) => (isMobile ? obj.showOnMobile : true));

  // Quick interactive shortcuts when clicking objects
  const handleObjectClick = (obj: DeskObjectConfig) => {
    if (obj.id === 'laptop') {
      onNavigate('work');
    } else if (obj.id === 'notebook') {
      onNavigate('journey');
    } else if (obj.id === 'sticky-notes') {
      onNavigate('about');
    }
  };

  return (
    <section className="desk-surface-stage" aria-label="Interactive scrapbook desk workspace">
      {/* Centered Single-line Hero Message */}
      <HeroLine />

      {/* Scattered Desk Objects Layer */}
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
              onClick={() => handleObjectClick(obj)}
              title={obj.name}
            >
              <img
                src={obj.src}
                alt={obj.alt}
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
    </section>
  );
};
