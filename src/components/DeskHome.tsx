import React, { useState, useEffect, useRef, useCallback } from 'react';
import { deskObjects } from '../data/deskObjects';
import {
  getHeroYPercent,
  getBlendedObjectTransform,
  AWAY_LAYOUT,
  AWAY_LAYOUT_MOBILE,
} from '../data/driftKeyframes';
import { HeroLine, type HeroWord } from './HeroLine';
import { StickMan } from './StickMan';
import { computeDeskObjectEngineState, type DeskObjectEngineState } from '../data/phoneEngine';
import { getHasCompletedInitialLoad, setHasCompletedInitialLoad } from '../data/loaderState';

interface Spark {
  id: number;
  x: number;
  y: number;
  rotation: number;
}

interface DeskHomeProps {
  currentRoute: string;
  isDriftingAwayTrigger?: boolean;
  isPhoneOpen?: boolean;
}

export const DeskHome: React.FC<DeskHomeProps> = ({
  currentRoute,
  isDriftingAwayTrigger = false,
  isPhoneOpen = false,
}) => {
  const isAwayRoute = currentRoute === 'work' || currentRoute === 'journey';
  const shouldBeAway = isAwayRoute || isDriftingAwayTrigger;

  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 700;
    }
    return false;
  });

  // Loading Sequence State
  const initialShouldLoad =
    typeof window !== 'undefined' && !getHasCompletedInitialLoad() && currentRoute === '';
  const [isLoading, setIsLoading] = useState<boolean>(initialShouldLoad);
  const [loadingProgress, setLoadingProgress] = useState<number>(initialShouldLoad ? 0 : 1);
  const [isSequenceEnding, setIsSequenceEnding] = useState<boolean>(false);
  const [isLoadingHeroRevealed, setIsLoadingHeroRevealed] = useState<boolean>(!initialShouldLoad);
  const [revealedObjectIds, setRevealedObjectIds] = useState<Set<string>>(() => {
    if (!initialShouldLoad) {
      return new Set(deskObjects.map((o) => o.id));
    }
    return new Set<string>();
  });

  const isLoadingRef = useRef<boolean>(isLoading);
  const [currentWord, setCurrentWord] = useState<HeroWord>('sees');
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [sparks, setSparks] = useState<Spark[]>([]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  // Hero line visibility states for fade-out and fade-in
  const heroIsAway = shouldBeAway;
  const [heroIsFadingIn, setHeroIsFadingIn] = useState<boolean>(false);
  const heroIsAwayRef = useRef<boolean>(shouldBeAway);
  const heroIsFadingInRef = useRef<boolean>(false);

  const stageRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const objectRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Scroll progress p in [0, 1)
  const targetRef = useRef<number>(0);
  const currentRef = useRef<number>(0);

  // Blend value a in [0, 1] (0 = home, 1 = away)
  const blendARef = useRef<number>(shouldBeAway ? 1 : 0);
  const targetARef = useRef<number>(shouldBeAway ? 1 : 0);
  const isEnteringAwayRef = useRef<boolean>(shouldBeAway);
  const blendStartTimeRef = useRef<number>(0);

  const isLoopRunningRef = useRef<boolean>(false);
  const rAFIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const activeWordRef = useRef<HeroWord>('sees');
  const reducedMotionRef = useRef<boolean>(false);
  const isMobileRef = useRef<boolean>(isMobile);
  const hasInteractedRef = useRef<boolean>(false);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  const cachedStageSize = useRef<{ width: number; height: number }>({
    width: 1366,
    height: 642,
  });

  const checkReducedMotion = useCallback(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    reducedMotionRef.current = !!reduced;
    return !!reduced;
  }, []);

  // Real Asset Loading & Staggered Reveal Sequence
  useEffect(() => {
    if (!initialShouldLoad) {
      setHasCompletedInitialLoad(true);
      return;
    }

    let isCancelled = false;
    const startTime = performance.now();
    const isReduced = checkReducedMotion();
    const minDuration = isReduced ? 600 : 2000;
    const maxDuration = 4500;

    const visible = deskObjects.filter((obj) => (isMobileRef.current ? obj.showOnMobile : true));

    // Staggered reveal order: notebook, pencil, then the rest
    const preferredOrder = [
      'notebook',
      'pencil',
      'webcam',
      'headphones',
      'sticky-notes',
      'tape-roll',
      'plant',
      'coffee-cup',
      'laptop',
      'sd-cards',
      'ruler',
      'scissors',
    ];
    const orderedIds = [
      ...preferredOrder.filter((id) => visible.some((o) => o.id === id)),
      ...visible.filter((o) => !preferredOrder.includes(o.id)).map((o) => o.id),
    ];

    const decodedSet = new Set<string>();
    let loadedItemsCount = 0;
    const totalItems = 1 + visible.length; // 1 for fonts + 1 per image

    const updateProgress = () => {
      const p = Math.min(1, loadedItemsCount / totalItems);
      setLoadingProgress(p);
    };

    // 1. Fonts ready
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      document.fonts.ready
        .catch(() => {})
        .then(() => {
          if (isCancelled) return;
          loadedItemsCount++;
          updateProgress();
        });
    } else {
      loadedItemsCount++;
      updateProgress();
    }

    // 2. Decode visible images
    visible.forEach((obj) => {
      const img = new Image();
      img.src = obj.src;
      img
        .decode()
        .catch(() => {})
        .then(() => {
          if (isCancelled) return;
          decodedSet.add(obj.id);
          loadedItemsCount++;
          updateProgress();
        });
    });

    let revealIndex = 0;
    let finishTriggered = false;

    const triggerFinish = () => {
      if (finishTriggered || isCancelled) return;
      finishTriggered = true;

      // Reveal all remaining objects
      setRevealedObjectIds(new Set(orderedIds));
      setLoadingProgress(1);

      // Hero line fades in (400ms, with word 'sees')
      activeWordRef.current = 'sees';
      setCurrentWord('sees');
      setIsLoadingHeroRevealed(true);

      // Trigger stickman return
      setIsSequenceEnding(true);
    };

    // Stagger loop: every 70ms, reveal next decoded object
    const staggerInterval = window.setInterval(() => {
      if (isCancelled || finishTriggered) return;

      const elapsed = performance.now() - startTime;

      // 4.5s timeout fallback: reveal everything regardless
      if (elapsed >= maxDuration) {
        window.clearInterval(staggerInterval);
        triggerFinish();
        return;
      }

      if (revealIndex < orderedIds.length) {
        const nextId = orderedIds[revealIndex];
        if (decodedSet.has(nextId) || elapsed > 1500) {
          setRevealedObjectIds((prev) => new Set([...prev, nextId]));
          revealIndex++;
        }
      }

      const allRevealed = revealIndex >= orderedIds.length;
      const allLoaded = loadedItemsCount >= totalItems;
      if (allRevealed && allLoaded && elapsed >= minDuration) {
        window.clearInterval(staggerInterval);
        triggerFinish();
      }
    }, 70);

    return () => {
      isCancelled = true;
      window.clearInterval(staggerInterval);
    };
  }, [initialShouldLoad, checkReducedMotion]);

  // Called when stickman completes walking back to home spot
  const handleSequenceComplete = useCallback(() => {
    setIsLoading(false);
    setHasCompletedInitialLoad(true);
    targetRef.current = 0;
    currentRef.current = 0;
  }, []);

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

  // Render frame given progress p and blend value a
  const renderFrame = useCallback((p: number, a: number, isEnteringAway: boolean) => {
    let normP = p % 1;
    if (normP < 0) normP += 1;

    const { width, height } = cachedStageSize.current;
    const isMob = isMobileRef.current;

    // 1. Hero line translateY
    if (heroRef.current) {
      if (a < 0.01 && !heroIsFadingInRef.current && !heroIsAwayRef.current) {
        const heroYPercent = getHeroYPercent(normP);
        const heroYPx = (heroYPercent / 100) * height;
        heroRef.current.style.transform = `translate3d(-50%, ${heroYPx}px, 0) translateY(-50%)`;
      } else {
        heroRef.current.style.transform = '';
      }
    }

    // 2. Scroll-driven word (only while in home mode and not loading)
    if (a < 0.5 && !isLoadingRef.current) {
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
    }

    // 3. Desk Objects (blended transforms)
    for (const obj of deskObjects) {
      if (isMob && !obj.showOnMobile) continue;

      const el = objectRefs.current[obj.id];
      if (!el) continue;

      const pos = getBlendedObjectTransform(obj.id, normP, a, isMob, isEnteringAway);
      const xPx = (pos.x / 100) * width;
      const yPx = (pos.y / 100) * height;

      el.style.transform = `translate3d(${xPx}px, ${yPx}px, 0) translate(-50%, -50%) rotate(${pos.rot}deg)`;
    }
  }, []);

  // Main RAF tick loop: handles both scroll progress p easing AND blend a tweening
  const tick = useCallback(
    function tickFn(now: number) {
      if (!lastTimeRef.current) lastTimeRef.current = now;
      let dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      if (dt > 0.1) dt = 0.1;

      let targetP = targetRef.current;
      let currentP = currentRef.current;
      const targetA = targetARef.current;
      let currentA = blendARef.current;

      let needsAnotherLoop = false;

      // A) Blend value a tweening (900ms duration)
      if (Math.abs(targetA - currentA) > 0.001) {
        needsAnotherLoop = true;
        const elapsed = now - blendStartTimeRef.current;
        const normT = Math.max(0, Math.min(1, elapsed / 900));

        if (targetA === 1) {
          // Drifting to away
          currentA = normT;
          if (normT >= 1) currentA = 1;
        } else {
          // Drifting back to home
          currentA = 1 - normT;
          if (normT >= 1) currentA = 0;
        }
        blendARef.current = currentA;
      } else {
        blendARef.current = targetA;
        currentA = targetA;
      }

      // B) Scroll progress p easing (only when near home a < 0.05 and not loading)
      if (currentA < 0.05 && !isLoadingRef.current) {
        currentP += (targetP - currentP) * (1 - Math.exp(-dt * 6));

        while (targetP >= 1) {
          targetP -= 1;
          currentP -= 1;
        }
        while (targetP < 0) {
          targetP += 1;
          currentP += 1;
        }

        targetRef.current = targetP;
        currentRef.current = currentP;

        if (Math.abs(targetP - currentP) > 0.0005) {
          needsAnotherLoop = true;
        } else {
          currentRef.current = targetP;
        }
      }

      renderFrame(currentRef.current, currentA, isEnteringAwayRef.current);

      if (needsAnotherLoop) {
        rAFIdRef.current = requestAnimationFrame(tickFn);
      } else {
        isLoopRunningRef.current = false;
        setWillChange(false);
        rAFIdRef.current = null;
      }
    },
    [renderFrame]
  );

  const startLoop = useCallback(() => {
    if (reducedMotionRef.current || isLoadingRef.current) return;
    if (!isLoopRunningRef.current) {
      isLoopRunningRef.current = true;
      setWillChange(true);
      lastTimeRef.current = performance.now();
      rAFIdRef.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  const isFirstMountRef = useRef<boolean>(true);

  // Handle route and mode transitions (home <-> away)
  useEffect(() => {
    const isReduced = checkReducedMotion();

    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      if (shouldBeAway) {
        blendARef.current = 1;
        targetARef.current = 1;
        heroIsAwayRef.current = true;
        heroIsFadingInRef.current = false;
        renderFrame(0, 1, true);
        return;
      }
    }

    if (shouldBeAway) {
      // Transition to away
      targetARef.current = 1;
      isEnteringAwayRef.current = true;
      blendStartTimeRef.current = performance.now();

      if (isReduced) {
        blendARef.current = 1;
        heroIsAwayRef.current = true;
        heroIsFadingInRef.current = false;
        renderFrame(0, 1, true);
        return;
      }

      heroIsAwayRef.current = true;
      heroIsFadingInRef.current = false;
      startLoop();
    } else {
      // Transition back to home
      targetRef.current = 0;
      currentRef.current = 0;
      targetARef.current = 0;
      isEnteringAwayRef.current = false;
      blendStartTimeRef.current = performance.now();

      activeWordRef.current = 'sees';
      requestAnimationFrame(() => {
        setCurrentWord('sees');
      });

      if (isReduced) {
        blendARef.current = 0;
        heroIsAwayRef.current = false;
        heroIsFadingInRef.current = false;
        renderFrame(0, 0, false);
        return;
      }

      heroIsAwayRef.current = false;
      heroIsFadingInRef.current = true;
      requestAnimationFrame(() => {
        setHeroIsFadingIn(true);
      });
      const timer = window.setTimeout(() => {
        heroIsFadingInRef.current = false;
        setHeroIsFadingIn(false);
      }, 850);

      startLoop();

      return () => {
        window.clearTimeout(timer);
      };
    }
  }, [shouldBeAway, renderFrame, startLoop, checkReducedMotion]);

  const triggerInteraction = () => {
    if (!hasInteractedRef.current && !isLoadingRef.current) {
      hasInteractedRef.current = true;
      setHasInteracted(true);
    }
  };

  // Setup loop, resize and input event listeners
  useEffect(() => {
    const isReduced = checkReducedMotion();

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
      renderFrame(currentRef.current, blendARef.current, isEnteringAwayRef.current);
    };

    updateDimensions();

    // Testing helper attached to window
    if (typeof window !== 'undefined') {
      (window as unknown as { __setProgress?: (p: number) => void }).__setProgress = (p: number) => {
        targetRef.current = p;
        currentRef.current = p;
        renderFrame(p, blendARef.current, isEnteringAwayRef.current);
      };
      (window as unknown as { __getProgress?: () => number }).__getProgress = () => currentRef.current;
      (window as unknown as { __setBlendA?: (a: number) => void }).__setBlendA = (a: number) => {
        blendARef.current = a;
        targetARef.current = a;
        renderFrame(currentRef.current, a, isEnteringAwayRef.current);
      };
      (window as unknown as { __getBlendA?: () => number }).__getBlendA = () => blendARef.current;
      (window as unknown as { __getDeskObjectEngineState?: (id?: string) => DeskObjectEngineState }).__getDeskObjectEngineState = (id = 'ruler') => {
        const stageW = cachedStageSize.current.width || window.innerWidth;
        const stageH = cachedStageSize.current.height || window.innerHeight;
        return computeDeskObjectEngineState(
          id,
          currentRef.current,
          blendARef.current,
          isMobileRef.current,
          isEnteringAwayRef.current,
          stageW,
          stageH
        );
      };
    }

    let resizeTimer: number | null = null;
    const handleResize = () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(updateDimensions, 100);
    };
    window.addEventListener('resize', handleResize);

    const stageEl = stageRef.current;
    if (stageEl && !isReduced) {
      const handleWheel = (e: WheelEvent) => {
        // Ignore input during loading or when not in home mode
        if (reducedMotionRef.current || blendARef.current > 0.01 || isLoadingRef.current) return;
        e.preventDefault();
        triggerInteraction();

        let dy = e.deltaY;
        if (e.deltaMode === 1) {
          dy *= 16;
        } else if (e.deltaMode === 2) {
          dy *= window.innerHeight;
        }

        const clampedDy = Math.max(-120, Math.min(120, dy));
        targetRef.current += clampedDy / 2500;
        startLoop();
      };

      let lastTouchY = 0;
      const handleTouchStart = (e: TouchEvent) => {
        if (reducedMotionRef.current || blendARef.current > 0.01 || isLoadingRef.current) return;
        if (e.touches.length > 0) {
          lastTouchY = e.touches[0].clientY;
        }
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (reducedMotionRef.current || blendARef.current > 0.01 || isLoadingRef.current) return;
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

      const handleKeyDown = (e: KeyboardEvent) => {
        if (reducedMotionRef.current || blendARef.current > 0.01 || isLoadingRef.current) return;

        const k = e.key.toLowerCase();
        // Stickman controls must NEVER drift desk objects
        if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) {
          return;
        }

        const active = document.activeElement as HTMLElement | null;
        if (
          active &&
          (active.tagName === 'INPUT' ||
            active.tagName === 'TEXTAREA' ||
            active.tagName === 'SELECT' ||
            active.tagName === 'BUTTON' ||
            active.tagName === 'A' ||
            active.closest('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"]), nav, #mobile-nav-panel'))
        ) {
          return;
        }

        let handled = false;
        if (e.key === 'PageDown') {
          targetRef.current += 0.08;
          handled = true;
        } else if (e.key === 'PageUp') {
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
  }, [renderFrame, startLoop, checkReducedMotion]);

  const prevPhoneOpenRef = useRef<boolean>(isPhoneOpen);
  useEffect(() => {
    if (prevPhoneOpenRef.current && !isPhoneOpen) {
      targetRef.current = 0;
      currentRef.current = 0;
      startLoop();
    }
    prevPhoneOpenRef.current = isPhoneOpen;
  }, [isPhoneOpen, startLoop]);

  const visibleObjects = deskObjects.filter((obj) => (isMobile ? obj.showOnMobile : true));

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only spawn sparks in home mode on non-interactive regions when phone is not open and not loading
    if (blendARef.current > 0.05 || isPhoneOpen || isLoadingRef.current) return;

    const target = e.target as HTMLElement | null;
    if (target && target.closest('a, button, nav, input, select, textarea')) {
      return;
    }

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

    setSparks((prev) => [...prev.slice(-7), newSpark]);

    setTimeout(() => {
      setSparks((prev) => prev.filter((s) => s.id !== sparkId));
    }, 550);
  };

  return (
    <section
      ref={stageRef}
      className={`desk-surface-stage ${shouldBeAway ? 'mode-away' : 'mode-home'} ${isPhoneOpen ? 'phone-is-open' : ''} ${isLoading ? 'is-stage-loading' : ''}`}
      aria-label="Interactive scrapbook desk workspace"
      inert={isPhoneOpen ? true : undefined}
      aria-hidden={isPhoneOpen ? true : undefined}
      onPointerDown={handlePointerDown}
    >
      {/* Visually-hidden status announcement for screen readers */}
      <div className="sr-only" role="status" aria-live="polite">
        {isLoading ? 'Loading' : 'Page loaded'}
      </div>

      {/* Centered Single-line Hero Message */}
      <HeroLine
        ref={heroRef}
        currentWord={currentWord}
        isAway={heroIsAway}
        isFadingIn={heroIsFadingIn}
        isPhoneOpen={isPhoneOpen}
        isLoading={isLoading}
        isLoadingRevealed={isLoadingHeroRevealed}
      />

      {/* Scattered Desk Objects Layer: transforms only */}
      <div className="desk-objects-stage-layer" aria-hidden="true">
        {visibleObjects.map((obj) => {
          const widthVw = isMobile && obj.mobileWidthVw !== undefined ? obj.mobileWidthVw : obj.widthVw;
          const pos = shouldBeAway
            ? ((isMobile ? AWAY_LAYOUT_MOBILE[obj.id] : null) || AWAY_LAYOUT[obj.id] || { x: 50, y: 50, rot: 0 })
            : {
                x: isMobile && obj.mobileX !== undefined ? obj.mobileX : obj.x,
                y: isMobile && obj.mobileY !== undefined ? obj.mobileY : obj.y,
                rot: isMobile && obj.mobileRotation !== undefined ? obj.mobileRotation : obj.rotation,
              };
          const isRuler = obj.id === 'ruler';

          const style: React.CSSProperties = {
            width: `${widthVw}vw`,
            transform: `translate3d(${pos.x}vw, ${pos.y}vh, 0) translate(-50%, -50%) rotate(${pos.rot}deg)`,
            zIndex: obj.zIndex || 2,
          };

          const isRevealed = !isLoading || revealedObjectIds.has(obj.id);
          const loaderClass = !isRevealed ? 'loader-hidden' : (isLoading ? 'loader-revealing' : '');

          return (
            <div
              key={obj.id}
              ref={(el) => {
                objectRefs.current[obj.id] = el;
              }}
              className={`desk-object-cutout desk-object-${obj.id} ${obj.src.endsWith('.webp') ? 'is-photo' : ''} ${isRuler && isPhoneOpen ? 'desk-phone-hidden' : ''} ${loaderClass}`}
              style={style}
              aria-hidden="true"
            >
              <img
                src={obj.src}
                alt=""
                loading="lazy"
                decoding="async"
                className={`desk-cutout-img ${obj.src.endsWith('.webp') ? 'is-photo' : ''}`}
                draggable={false}
              />
            </div>
          );
        })}
      </div>

      {/* Doodle Stickman Character Layer */}
      <StickMan
        isAway={shouldBeAway || isPhoneOpen}
        isLoading={isLoading}
        loadingProgress={loadingProgress}
        isSequenceEnding={isSequenceEnding}
        onSequenceComplete={handleSequenceComplete}
      />

      {/* Handwritten scroll hint with doodle arrow (visible only in home mode and when not loading) */}
      <div
        className={`desk-scroll-hint font-handwriting ${hasInteracted || shouldBeAway || isPhoneOpen || isLoading ? 'is-faded' : ''}`}
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
      <div className="burst-layer" aria-hidden="true" inert={isPhoneOpen || isLoading ? true : undefined}>
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
