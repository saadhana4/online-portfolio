import React, { useState, useEffect } from 'react';
import { deskObjects, type DeskObjectConfig } from '../data/deskObjects';
import { HeroLine } from './HeroLine';
import { DoodleCompanion } from './DoodleCompanion';

interface DeskHomeProps {
  onNavigate: (route: string) => void;
}

export const DeskHome: React.FC<DeskHomeProps> = ({ onNavigate }) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 700);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter objects for mobile (show only 4 objects under 700px)
  const visibleObjects = deskObjects.filter((obj) => (isMobile ? obj.showOnMobile : true));

  // Handle object interaction (optional quick shortcut click)
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
    <section className="desk-surface" aria-label="Interactive scrapbook desk workspace">
      {/* Centered Hero Message */}
      <HeroLine />

      {/* Scattered Desk Objects */}
      <div className="desk-objects-layer" aria-hidden="true">
        {visibleObjects.map((obj) => {
          // Adjust responsive positioning
          const style: React.CSSProperties = {
            left: `${obj.x}%`,
            top: `${obj.y}%`,
            '--base-rot': `${obj.rotation}deg`,
            zIndex: obj.zIndex || 2,
            width: isMobile ? Math.min(obj.size * 0.72, 180) : obj.size,
          } as React.CSSProperties;

          return (
            <div
              key={obj.id}
              className={`desk-object desk-object-${obj.id}`}
              style={style}
              onClick={() => handleObjectClick(obj)}
              title={`${obj.name}`}
            >
              <div className="desk-object-inner torn-paper-edge">
                <img
                  src={obj.src}
                  alt={obj.alt} /* empty alt for decorative desk items per a11y specs */
                  loading="lazy"
                  width={obj.size}
                  height={Math.round(obj.size * 0.85)}
                  className="desk-object-img"
                  draggable={false}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom-left Doodle mascot */}
      <DoodleCompanion />
    </section>
  );
};
