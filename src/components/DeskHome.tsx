import React, { useState, useEffect, useRef } from 'react';
import { deskObjects } from '../data/deskObjects';
import { getHeroYPercent, getObjectTransform } from '../data/driftKeyframes';
import { HeroLine, type HeroWord } from './HeroLine';

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

  const [currentWord, setCurrentWord] = useState<HeroWord>('sees');
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [sparks, setSparks] = useState<Spark[]>([]);

  const stageRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const objectRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const targetRef = useRef<number>(0);
  const currentRef = useRef<number>(0);
  const isLoopRunningRef = useRef<boolean>(false);
  const rAFIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const activeWordRef = useRef<HeroWord>('sees');
  const reducedMotionRef = useRef<boolean>(false);
  const isMobileRef = useRef<boolean>(isMobile);
  const hasInteractedRef = useRef<boolean>(false);

  const cachedStageSize = useRef<{ width: number; height: number }>({
    width: 1366,
    height: 642,
  });

  // Setup loop, resize and input event listeners
  useEffect(() => {
    // Check reduced motion
    const checkMotion = () => {
      const reduced = typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;
      reducedMotionRef.current = reduced;
      return reduced;
    };
    const isReduced = checkMotion();

    // Toggle will-change on animated elements
    const setWillChange = (active: boolean) => {
      const val = active ? 'transform' : 'auto';
      if (heroRef.current) {
        heroRef.current.style.willChange = val;
      }
      for (const id in objectRefs.current) {
        const el = objectRefs.current[id];
        if (el) el.style.willChange = val;
      }
    };

    // Render a single frame at progress p
    const renderFrame = (p: number) => {
      let normP = p % 1;
      if (normP < 0) normP += 1;

      const { width, height } = cachedStageSize.current;
      const isMob = isMobileRef.current;

      // 1. Move Hero line with translateY driven by interpolated y%
      if (heroRef.current) {
        const heroYPercent = getHeroYPercent(normP);
        const heroYPx = (heroYPercent / 100) * height;
        heroRef.current.style.transform = `translate3d(-50%, ${heroYPx}px, 0) translateY(-50%)`;
      }

      // 2. Update scroll-driven word: sees [0, 0.22), cares [0.22, 0.62), maps [0.62, 1)
      let nextWord: HeroWord = 'sees';
      if (normP >= 0.62) {
        nextWord = 'maps';
      } else if (normP >= 0.22) {
        nextWord = 'cares';
      } else {
        nextWord = 'sees';
      }

      if (activeWordRef.current !== nextWord) {
        activeWordRef.current = nextWord;
        setCurrentWord(nextWord);
      }

      // 3. Update Desk Objects (transforms only)
      for (const obj of deskObjects) {
        if (isMob && !obj.showOnMobile) continue;

        const el = objectRefs.current[obj.id];
        if (!el) continue;

        const pos = getObjectTransform(obj.id, normP, isMob);
        const xPx = (pos.x / 100) * width;
        const yPx = (pos.y / 100) * height;

        el.style.transform = `translate3d(${xPx}px, ${yPx}px, 0) translate(-50%, -50%) rotate(${pos.rot}deg)`;
      }
    };

    // Main RAF tick loop
    const tick = (now: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = now;
      let dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      if (dt > 0.1) dt = 0.1; // clamp against giant steps on resume

      let target = targetRef.current;
      let current = currentRef.current;

      // Frame-rate independent easing: current += (target - current) * (1 - Math.exp(-dt * 6))
      current += (target - current) * (1 - Math.exp(-dt * 6));

      // Seamless loop wrapping: when target passes 1 (or goes below 0),
      // subtract (or add) 1 from BOTH target and current
      while (target >= 1) {
        target -= 1;
        current -= 1;
      }
      while (target < 0) {
        target += 1;
        current += 1;
      }

      targetRef.current = target;
      currentRef.current = current;

      renderFrame(current);

      // Stop loop when |target - current| <= 0.0005
      if (Math.abs(target - current) <= 0.0005) {
        currentRef.current = target;
        renderFrame(target);
        isLoopRunningRef.current = false;
        setWillChange(false);
        rAFIdRef.current = null;
        return;
      }

      rAFIdRef.current = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (reducedMotionRef.current) return;
      if (!isLoopRunningRef.current) {
        isLoopRunningRef.current = true;
        setWillChange(true);
        lastTimeRef.current = performance.now();
        rAFIdRef.current = requestAnimationFrame(tick);
      }
    };

    const triggerInteraction = () => {
      if (!hasInteractedRef.current) {
        hasInteractedRef.current = true;
        setHasInteracted(true);
      }
    };

    // Cache initial stage dimensions
    const updateDimensions = () => {
      if (stageRef.current) {
        cachedStageSize.current = {
          width: stageRef.current.clientWidth,
          height: stageRef.current.clientHeight,
        };
      } else {
        cachedStageSize.current = {
          width: window.innerWidth,
          height: window.innerHeight,
        };
      }
      const isMob = window.innerWidth < 700;
      isMobileRef.current = isMob;
      setIsMobile(isMob);
      renderFrame(currentRef.current);
    };

    updateDimensions();

    // Attach testing helper to window for headless verification
    if (typeof window !== 'undefined') {
      (window as unknown as { __setProgress?: (p: number) => void }).__setProgress = (p: number) => {
        targetRef.current = p;
        currentRef.current = p;
        renderFrame(p);
      };
      (window as unknown as { __getProgress?: () => number }).__getProgress = () => currentRef.current;
    }

    // Resize listener (debounced)
    let resizeTimer: number | null = null;
    const handleResize = () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(updateDimensions, 100);
    };
    window.addEventListener('resize', handleResize);

    const stageEl = stageRef.current;
    if (stageEl && !isReduced) {
      // 1. Wheel listener (non-passive to preventDefault on stage)
      const handleWheel = (e: WheelEvent) => {
        if (reducedMotionRef.current) return;
        e.preventDefault();
        triggerInteraction();

        let dy = e.deltaY;
        if (e.deltaMode === 1) {
          dy *= 16; // lines
        } else if (e.deltaMode === 2) {
          dy *= window.innerHeight; // pages
        }

        // Clamp each event's delta to +-120
        const clampedDy = Math.max(-120, Math.min(120, dy));
        targetRef.current += clampedDy / 2500;
        startLoop();
      };

      // 2. Touch listeners
      let lastTouchY = 0;
      const handleTouchStart = (e: TouchEvent) => {
        if (reducedMotionRef.current) return;
        if (e.touches.length > 0) {
          lastTouchY = e.touches[0].clientY;
        }
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (reducedMotionRef.current) return;
        if (e.touches.length > 0) {
          e.preventDefault();
          const currentY = e.touches[0].clientY;
          const dy = lastTouchY - currentY;
          lastTouchY = currentY;

          triggerInteraction();
          const h = cachedStageSize.current.height || window.innerHeight || 600;
          targetRef.current += dy / (h * 3);
          startLoop();
        }
      };

      // 3. Keyboard listener
      const handleKeyDown = (e: KeyboardEvent) => {
        if (reducedMotionRef.current) return;

        // Do not hijack keys while a link, button or mobile menu has focus
        const active = document.activeElement as HTMLElement | null;
        if (
          active &&
          (active.tagName === 'INPUT' ||
            active.tagName === 'TEXTAREA' ||
            active.tagName === 'SELECT' ||
            active.tagName === 'BUTTON' ||
            active.tagName === 'A' ||
            active.closest('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"]), nav, #mobile-nav-menu'))
        ) {
          return;
        }

        let handled = false;
        if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
          targetRef.current += 0.08;
          handled = true;
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
          targetRef.current -= 0.08;
          handled = true;
        } else if (e.key === 'Home') {
          targetRef.current = 0;
          handled = true;
        }

        if (handled) {
          e.preventDefault();
          triggerInteraction();
          startLoop();
        }
      };

      stageEl.addEventListener('wheel', handleWheel, { passive: false });
      stageEl.addEventListener('touchstart', handleTouchStart, { passive: true });
      stageEl.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        if (resizeTimer) window.clearTimeout(resizeTimer);
        window.removeEventListener('resize', handleResize);
        stageEl.removeEventListener('wheel', handleWheel);
        stageEl.removeEventListener('touchstart', handleTouchStart);
        stageEl.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('keydown', handleKeyDown);
        if (rAFIdRef.current) {
          cancelAnimationFrame(rAFIdRef.current);
        }
        setWillChange(false);
      };
    }

    return () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      if (rAFIdRef.current) {
        cancelAnimationFrame(rAFIdRef.current);
      }
      setWillChange(false);
    };
  }, []);

  // Filter objects for mobile: only laptop, notebook, plant, coffee cup, headphones under 700px
  const visibleObjects = deskObjects.filter((obj) => (isMobile ? obj.showOnMobile : true));

  // Pointerdown handler for Click Spark burst
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Skip if clicking on interactive elements like nav, links, buttons
    const target = e.target as HTMLElement | null;
    if (target && target.closest('a, button, nav, input, select, textarea')) {
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
      ref={stageRef}
      className="desk-surface-stage"
      aria-label="Interactive scrapbook desk workspace"
      onPointerDown={handlePointerDown}
    >
      {/* Centered Single-line Hero Message */}
      <HeroLine ref={heroRef} currentWord={currentWord} />

      {/* Scattered Desk Objects Layer: transforms only */}
      <div className="desk-objects-stage-layer" aria-hidden="true">
        {visibleObjects.map((obj) => {
          const widthVw = isMobile && obj.mobileWidthVw !== undefined ? obj.mobileWidthVw : obj.widthVw;
          const pos = getObjectTransform(obj.id, 0, isMobile);

          const style: React.CSSProperties = {
            width: `${widthVw}vw`,
            transform: `translate3d(${pos.x}vw, ${pos.y}vh, 0) translate(-50%, -50%) rotate(${pos.rot}deg)`,
            zIndex: obj.zIndex || 2,
          };

          return (
            <div
              key={obj.id}
              ref={(el) => {
                objectRefs.current[obj.id] = el;
              }}
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

      {/* Handwritten scroll hint with doodle arrow */}
      <div
        className={`desk-scroll-hint font-handwriting ${hasInteracted ? 'is-faded' : ''}`}
        aria-hidden="true"
      >
        <span>scroll</span>
        <svg
          width="14"
          height="18"
          viewBox="0 0 14 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M7 2 L7 15" />
          <path d="M3 11 L7 16 L11 11" />
        </svg>
      </div>

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
              <line x1="15" y1="3" x2="15" y2="7.5" />
              <line x1="15" y1="22.5" x2="15" y2="27" />
              <line x1="3" y1="15" x2="7.5" y2="15" />
              <line x1="22.5" y1="15" x2="27" y2="15" />
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
