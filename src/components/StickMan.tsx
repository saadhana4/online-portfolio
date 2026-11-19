import React, { useEffect, useRef, useState, useCallback } from 'react';

interface StickManProps {
  isAway?: boolean;
  isLoading?: boolean;
  loadingProgress?: number; // 0.0 to 1.0
  isSequenceEnding?: boolean; // triggers walking back to home spot
  onSequenceComplete?: () => void;
}

export const StickMan: React.FC<StickManProps> = ({
  isAway = false,
  isLoading = false,
  loadingProgress = 0,
  isSequenceEnding = false,
  onSequenceComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const doodleSvgRef = useRef<SVGSVGElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  // SVG limb refs for direct 60/120fps manipulation without React re-renders
  const headGroupRef = useRef<SVGGElement>(null);
  const spineRef = useRef<SVGLineElement>(null);
  const armFrontRef = useRef<SVGPathElement>(null);
  const armBackRef = useRef<SVGPathElement>(null);
  const legFrontRef = useRef<SVGPathElement>(null);
  const legBackRef = useRef<SVGPathElement>(null);

  // Touch device detection
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(hover: none)').matches;
    }
    return false;
  });

  const [hasTouched, setHasTouched] = useState<boolean>(false);

  // Loading sequence UI states
  const [thoughtFadedOut, setThoughtFadedOut] = useState<boolean>(false);
  const [showScrollBubble, setShowScrollBubble] = useState<boolean>(false);
  const [isScrollBubblePopped, setIsScrollBubblePopped] = useState<boolean>(false);
  const [isScrollBubbleFading, setIsScrollBubbleFading] = useState<boolean>(false);

  const isThoughtFading = isSequenceEnding && !thoughtFadedOut;
  const showThoughtBubble = isLoading && !thoughtFadedOut;
  const showNormalHint = !isLoading && !showScrollBubble;

  // State refs for animation loop
  const posXRef = useRef<number>(32);
  const facingRef = useRef<'right' | 'left'>('right');
  const keysDownRef = useRef<Set<string>>(new Set());
  const hasMovedRef = useRef<boolean>(false);
  const isJumpingRef = useRef<boolean>(false);
  const jumpProgressRef = useRef<number>(0);
  const walkPhaseRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const isInitializedRef = useRef<boolean>(false);

  // Loading animation tracking refs
  const sequenceStateRef = useRef<'idle' | 'loading_walk' | 'returning' | 'arrived'>('idle');
  const returnStartTimeRef = useRef<number>(0);
  const returnStartXRef = useRef<number>(0);
  const loadingProgressRef = useRef<number>(loadingProgress);

  useEffect(() => {
    loadingProgressRef.current = loadingProgress;
  }, [loadingProgress]);

  const reducedMotionRef = useRef<boolean>(false);

  const checkReducedMotion = useCallback(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    reducedMotionRef.current = !!reduced;
    return !!reduced;
  }, []);

  const getHomeX = useCallback(() => {
    if (typeof window === 'undefined') return 32;
    const isMobile = window.innerWidth < 700;
    return isMobile ? Math.max(16, window.innerWidth * 0.03) : Math.max(28, window.innerWidth * 0.03);
  }, []);

  // Set pose for the 3 hand-drawn walk frames
  const applyWalkFrame = useCallback((frame: 0 | 1 | 2) => {
    const head = headGroupRef.current;
    const spine = spineRef.current;
    const armF = armFrontRef.current;
    const armB = armBackRef.current;
    const legF = legFrontRef.current;
    const legB = legBackRef.current;

    if (!head || !spine || !armF || !armB || !legF || !legB) return;

    if (frame === 0) {
      // Frame 0: Legs apart (right leg forward, left leg back)
      head.setAttribute('transform', 'translate(0, -1) rotate(2 16 14)');
      spine.setAttribute('y1', '20.6');
      spine.setAttribute('y2', '43');
      armF.setAttribute('d', 'M 16 25 Q 12 34 8 42');
      armB.setAttribute('d', 'M 16 25 Q 21 34 25 42');
      legF.setAttribute('d', 'M 16 43 L 21 62 L 25 80');
      legB.setAttribute('d', 'M 16 43 L 11 62 L 7 80');
    } else if (frame === 1) {
      // Frame 1: Legs together (passing position, 0px vertical bob)
      head.setAttribute('transform', 'translate(0, 0) rotate(0 16 14)');
      spine.setAttribute('y1', '21.6');
      spine.setAttribute('y2', '44');
      armF.setAttribute('d', 'M 16 25 Q 15 35 14 45');
      armB.setAttribute('d', 'M 16 25 Q 17 35 18 45');
      legF.setAttribute('d', 'M 16 44 L 16 62 L 16 80');
      legB.setAttribute('d', 'M 16 44 L 16.5 61 L 17 78');
    } else {
      // Frame 2: Legs apart the other way (left leg forward, right leg back)
      head.setAttribute('transform', 'translate(0, -1) rotate(-2 16 14)');
      spine.setAttribute('y1', '20.6');
      spine.setAttribute('y2', '43');
      armF.setAttribute('d', 'M 16 25 Q 21 34 25 42');
      armB.setAttribute('d', 'M 16 25 Q 12 34 8 42');
      legF.setAttribute('d', 'M 16 43 L 11 62 L 7 80');
      legB.setAttribute('d', 'M 16 43 L 21 62 L 25 80');
    }
  }, []);

  const applyIdlePose = useCallback((now: number) => {
    const head = headGroupRef.current;
    const spine = spineRef.current;
    const armF = armFrontRef.current;
    const armB = armBackRef.current;
    const legF = legFrontRef.current;
    const legB = legBackRef.current;

    if (!head || !spine || !armF || !armB || !legF || !legB) return;

    const breathe = Math.sin(now * 0.003) * 0.8;
    head.setAttribute('transform', `translate(0, ${breathe}) rotate(-3 16 14)`);
    spine.setAttribute('y1', `${21.6 + breathe}`);
    spine.setAttribute('y2', `${44 + breathe}`);
    armF.setAttribute('d', `M 16 ${25 + breathe} Q 13.5 35 10 44`);
    armB.setAttribute('d', `M 16 ${25 + breathe} Q 18 35 19.5 45`);
    legF.setAttribute('d', `M 16 ${44 + breathe} L 13.5 62 L 10 80`);
    legB.setAttribute('d', `M 16 ${44 + breathe} L 19 62 L 23 80`);
  }, []);

  // Jump in place (desktop WASD)
  const triggerJump = () => {
    if (!isJumpingRef.current && sequenceStateRef.current === 'idle') {
      isJumpingRef.current = true;
      jumpProgressRef.current = 0;
      if (!hasMovedRef.current) {
        hasMovedRef.current = true;
        if (hintRef.current) hintRef.current.classList.add('faded');
      }
    }
  };

  // Dismiss "scroll" / "swipe" speech bubble
  const dismissScrollBubble = useCallback(() => {
    setIsScrollBubbleFading(true);
    window.setTimeout(() => {
      setShowScrollBubble(false);
      sequenceStateRef.current = 'idle';
    }, 250);
  }, []);

  // Listen for media changes (hover & reduced motion)
  useEffect(() => {
    checkReducedMotion();
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaHover = window.matchMedia('(hover: none)');
      const updateHover = (e: MediaQueryListEvent) => setIsTouchDevice(e.matches);
      if (mediaHover.addEventListener) {
        mediaHover.addEventListener('change', updateHover);
        return () => mediaHover.removeEventListener('change', updateHover);
      }
    }
  }, [checkReducedMotion]);

  // Touch listener to fade touch helper
  useEffect(() => {
    if (!isTouchDevice) return;
    const handleFirstTouch = () => {
      setHasTouched(true);
      if (hintRef.current) hintRef.current.classList.add('faded');
      window.removeEventListener('touchstart', handleFirstTouch);
    };
    window.addEventListener('touchstart', handleFirstTouch, { passive: true });
    return () => window.removeEventListener('touchstart', handleFirstTouch);
  }, [isTouchDevice]);

  // Fade out thought bubble when sequence ends
  useEffect(() => {
    if (isSequenceEnding && !thoughtFadedOut) {
      const timer = window.setTimeout(() => {
        setThoughtFadedOut(true);
      }, 150);
      return () => window.clearTimeout(timer);
    }
  }, [isSequenceEnding, thoughtFadedOut]);

  // Manage sequence phases when props change
  useEffect(() => {
    if (isLoading && !isSequenceEnding) {
      sequenceStateRef.current = 'loading_walk';
    } else if (isSequenceEnding && sequenceStateRef.current === 'loading_walk') {
      // Check reduced motion
      if (reducedMotionRef.current) {
        // Instant finish without walking
        sequenceStateRef.current = 'arrived';
        posXRef.current = getHomeX();
        facingRef.current = 'right';
        setShowScrollBubble(true);
        setIsScrollBubblePopped(true);
        onSequenceComplete?.();
        return;
      }

      // Start returning walk back to home spot (steady pace over 700ms)
      sequenceStateRef.current = 'returning';
      returnStartTimeRef.current = performance.now();
      returnStartXRef.current = posXRef.current;
      facingRef.current = 'left';
    }
  }, [isLoading, isSequenceEnding, getHomeX, onSequenceComplete]);

  // Listen for user input or 8s timer to dismiss "scroll" / "swipe" bubble
  useEffect(() => {
    if (!showScrollBubble || isScrollBubbleFading) return;

    const timer = window.setTimeout(() => {
      dismissScrollBubble();
    }, 8000);

    const handleInput = () => {
      dismissScrollBubble();
    };

    window.addEventListener('wheel', handleInput, { passive: true });
    window.addEventListener('touchstart', handleInput, { passive: true });
    window.addEventListener('keydown', handleInput, { capture: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('wheel', handleInput);
      window.removeEventListener('touchstart', handleInput);
      window.removeEventListener('keydown', handleInput, { capture: true });
    };
  }, [showScrollBubble, isScrollBubbleFading, dismissScrollBubble]);

  // Main RAF tick loop
  useEffect(() => {
    lastTimeRef.current = performance.now();

    if (!isInitializedRef.current) {
      posXRef.current = getHomeX();
      isInitializedRef.current = true;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Keyboard input disabled during loading sequence
      if (sequenceStateRef.current !== 'idle') return;

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.closest('input, textarea, [contenteditable="true"], form'))
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') {
        triggerJump();
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return;
      }

      if (key === 'a' || key === 'arrowleft') {
        keysDownRef.current.add('a');
        if (!hasMovedRef.current) {
          hasMovedRef.current = true;
          if (hintRef.current) hintRef.current.classList.add('faded');
        }
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return;
      }

      if (key === 'd' || key === 'arrowright') {
        keysDownRef.current.add('d');
        if (!hasMovedRef.current) {
          hasMovedRef.current = true;
          if (hintRef.current) hintRef.current.classList.add('faded');
        }
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (sequenceStateRef.current !== 'idle') return;
      const key = e.key.toLowerCase();
      if (key === 'a' || key === 'arrowleft') {
        keysDownRef.current.delete('a');
      } else if (key === 'd' || key === 'arrowright') {
        keysDownRef.current.delete('d');
      }
    };

    if (!isTouchDevice) {
      window.addEventListener('keydown', handleKeyDown, { capture: true });
      window.addEventListener('keyup', handleKeyUp, { capture: true });
    }

    let rAFId: number;

    const tick = (now: number) => {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;

      const isReduced = reducedMotionRef.current;
      const state = sequenceStateRef.current;
      const homeX = getHomeX();
      let jumpY = 0;

      if (state === 'loading_walk') {
        facingRef.current = 'right';
        if (isReduced) {
          posXRef.current = homeX;
          applyIdlePose(now);
        } else {
          // Progress from 3% to 60% of screen width
          const maxX = window.innerWidth * 0.60;
          const targetX = homeX + loadingProgressRef.current * (maxX - homeX);
          // Smoothed movement
          posXRef.current += (targetX - posXRef.current) * (1 - Math.exp(-dt * 5.5));

          // 3-frame walk cycle every 180ms with 1px vertical bob
          const frameIndex = (Math.floor(now / 180) % 3) as 0 | 1 | 2;
          applyWalkFrame(frameIndex);
          jumpY = frameIndex === 1 ? 0 : -1;
        }
      } else if (state === 'returning') {
        facingRef.current = 'left';
        if (isReduced) {
          posXRef.current = homeX;
          facingRef.current = 'right';
          sequenceStateRef.current = 'arrived';
          applyIdlePose(now);
          setShowScrollBubble(true);
          setIsScrollBubblePopped(true);
          onSequenceComplete?.();
        } else {
          const elapsed = now - returnStartTimeRef.current;
          const t = Math.min(1, elapsed / 700);
          posXRef.current = returnStartXRef.current + (homeX - returnStartXRef.current) * t;

          const frameIndex = (Math.floor(now / 180) % 3) as 0 | 1 | 2;
          applyWalkFrame(frameIndex);
          jumpY = frameIndex === 1 ? 0 : -1;

          if (t >= 1) {
            posXRef.current = homeX;
            facingRef.current = 'right';
            sequenceStateRef.current = 'arrived';
            applyIdlePose(now);

            // Pop in speech bubble (250ms scale-and-fade)
            setShowScrollBubble(true);
            requestAnimationFrame(() => {
              setIsScrollBubblePopped(true);
            });

            onSequenceComplete?.();
          }
        }
      } else if (state === 'arrived') {
        applyIdlePose(now);
      } else {
        // Standard user-driven walking & idle
        let dx = 0;
        const keys = keysDownRef.current;
        if (!isTouchDevice) {
          if (keys.has('a')) dx -= 1;
          if (keys.has('d')) dx += 1;
        }

        const isMoving = dx !== 0;
        if (dx < 0) facingRef.current = 'left';
        else if (dx > 0) facingRef.current = 'right';

        if (isMoving) {
          const speed = 210;
          posXRef.current += dx * speed * dt;
          const padX = 16;
          posXRef.current = Math.max(padX, Math.min(window.innerWidth - padX - 44, posXRef.current));
          walkPhaseRef.current += dt * 14;

          // Standard continuous walking animation
          const phase = walkPhaseRef.current;
          const head = headGroupRef.current;
          const spine = spineRef.current;
          const armF = armFrontRef.current;
          const armB = armBackRef.current;
          const legF = legFrontRef.current;
          const legB = legBackRef.current;

          if (head && spine && armF && armB && legF && legB) {
            const bob = Math.abs(Math.sin(phase)) * 2.8;
            const headTilt = Math.sin(phase) * 3.5;
            head.setAttribute('transform', `translate(0, ${bob}) rotate(${headTilt} 16 14)`);
            spine.setAttribute('y1', `${21.6 + bob}`);
            spine.setAttribute('y2', `${44 + bob}`);

            const hipY = 44 + bob;
            const shoulderY = 25 + bob;
            const angleFront = Math.sin(phase) * 0.55;
            const angleBack = Math.sin(phase + Math.PI) * 0.55;
            const bendFront = Math.max(0, -Math.sin(phase)) * 0.85;
            const bendBack = Math.max(0, -Math.sin(phase + Math.PI)) * 0.85;

            const kfx = 16 + Math.sin(angleFront) * 17;
            const kfy = hipY + Math.cos(angleFront) * 17;
            const ffx = kfx + Math.sin(angleFront - bendFront) * 17;
            const ffy = kfy + Math.cos(angleFront - bendFront) * 17;
            legF.setAttribute('d', `M 16 ${hipY} L ${kfx.toFixed(1)} ${kfy.toFixed(1)} L ${ffx.toFixed(1)} ${ffy.toFixed(1)}`);

            const kbx = 16 + Math.sin(angleBack) * 17;
            const kby = hipY + Math.cos(angleBack) * 17;
            const fbx = kbx + Math.sin(angleBack - bendBack) * 17;
            const fby = kby + Math.cos(angleBack - bendBack) * 17;
            legB.setAttribute('d', `M 16 ${hipY} L ${kbx.toFixed(1)} ${kby.toFixed(1)} L ${fbx.toFixed(1)} ${fby.toFixed(1)}`);

            const armAngleFront = Math.sin(phase + Math.PI) * 0.45;
            const armAngleBack = Math.sin(phase) * 0.45;
            const afx = 16 + Math.sin(armAngleFront) * 18;
            const afy = shoulderY + Math.cos(armAngleFront) * 18;
            armF.setAttribute('d', `M 16 ${shoulderY} Q ${(16 + afx) / 2 - 1} ${(shoulderY + afy) / 2} ${afx.toFixed(1)} ${afy.toFixed(1)}`);

            const abx = 16 + Math.sin(armAngleBack) * 18;
            const aby = shoulderY + Math.cos(armAngleBack) * 18;
            armB.setAttribute('d', `M 16 ${shoulderY} Q ${(16 + abx) / 2 + 1} ${(shoulderY + aby) / 2} ${abx.toFixed(1)} ${aby.toFixed(1)}`);
          }
        } else {
          applyIdlePose(now);
        }

        // Small jump in place physics (W key)
        if (isJumpingRef.current) {
          jumpProgressRef.current += dt * 4.8;
          if (jumpProgressRef.current >= 1.0) {
            isJumpingRef.current = false;
            jumpProgressRef.current = 0;
          } else {
            jumpY = -Math.sin(jumpProgressRef.current * Math.PI) * 14;
          }
        }
      }

      // Update positions without mirroring text bubbles
      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${posXRef.current}px, ${jumpY}px, 0)`;
      }

      if (doodleSvgRef.current) {
        const scaleX = facingRef.current === 'left' ? -1 : 1;
        doodleSvgRef.current.style.transform = `scaleX(${scaleX})`;
      }

      rAFId = requestAnimationFrame(tick);
    };

    rAFId = requestAnimationFrame(tick);

    return () => {
      if (!isTouchDevice) {
        window.removeEventListener('keydown', handleKeyDown, { capture: true });
        window.removeEventListener('keyup', handleKeyUp, { capture: true });
      }
      cancelAnimationFrame(rAFId);
    };
  }, [
    isTouchDevice,
    applyIdlePose,
    applyWalkFrame,
    getHomeX,
    onSequenceComplete,
  ]);

  return (
    <div
      ref={containerRef}
      className={`stickman-container ${isAway ? 'is-away' : ''}`}
      aria-hidden="true"
    >
      {/* 1. Hand-drawn cloud-shaped THOUGHT BUBBLE ("loading") */}
      {showThoughtBubble && (
        <svg
          className={`stickman-thought-bubble ${isThoughtFading ? 'fading' : ''}`}
          width="84"
          height="46"
          viewBox="0 0 84 46"
          fill="none"
          aria-hidden="true"
        >
          {/* Two trailing circles from head to cloud */}
          <circle cx="8" cy="40" r="2.2" stroke="var(--base-300)" strokeWidth="1.6" fill="var(--base-100)" />
          <circle cx="16" cy="33" r="3.4" stroke="var(--base-300)" strokeWidth="1.6" fill="var(--base-100)" />

          {/* Cloud shape outline */}
          <path
            d="M 30 32
               C 23 32 18 26 21 20
               C 18 14 24 8 30 10
               C 35 5 45 4 50 8
               C 57 4 67 7 69 13
               C 76 15 78 22 74 27
               C 77 33 71 38 65 36
               C 59 40 47 40 42 36
               C 37 39 29 37 30 32 Z"
            stroke="var(--base-300)"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="var(--base-100)"
          />
          <text
            x="48"
            y="23"
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--base-300)"
            fontFamily="var(--font-handwriting, 'Caveat', cursive)"
            fontSize="14px"
            fontWeight="600"
            letterSpacing="0.8px"
            style={{ textTransform: 'lowercase', fontVariant: 'small-caps' }}
          >
            loading
          </text>
        </svg>
      )}

      {/* 2. Hand-drawn SPEECH BUBBLE ("scroll" / "swipe") popping in after arrival */}
      {showScrollBubble && (
        <svg
          className={`stickman-speech-bubble-pop ${isScrollBubblePopped ? 'pop-active' : 'pop-entering'} ${isScrollBubbleFading ? 'pop-fading' : ''}`}
          width="76"
          height="44"
          viewBox="0 0 76 44"
          fill="none"
          aria-hidden="true"
        >
          {/* Wobbly hand-drawn speech bubble outline with pointed tail */}
          <path
            d="M 14 4
               C 32 3 50 4.5 64 4
               C 71 4 72 8 72 15
               C 71.5 22 72.3 26 71.8 30
               C 71.5 36 67 36 60 36
               C 48 35.5 36 36.3 27 36
               L 19 42
               L 18 36
               C 10 36 4 34.5 4 28
               C 3.7 22 4.2 14 4.1 10
               C 4 5 7 4 14 4 Z"
            stroke="var(--base-400)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="var(--base-100)"
          />
          <text
            x="38"
            y="20"
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--base-400)"
            fontFamily="var(--font-handwriting, 'Caveat', cursive)"
            fontSize="16px"
            fontWeight="700"
          >
            {isTouchDevice ? 'swipe' : 'scroll'}
          </text>
        </svg>
      )}

      {/* 3. Existing persistent helper text: 'use WASD' or touch speech bubble */}
      {showNormalHint &&
        (isTouchDevice ? (
          <div
            ref={hintRef}
            className={`stickman-speech-bubble font-handwriting ${hasTouched ? 'faded' : ''}`}
            aria-hidden="true"
          >
            <span className="speech-bubble-text">swipe</span>
            <svg
              className="speech-bubble-tail"
              width="10"
              height="7"
              viewBox="0 0 10 7"
              fill="none"
              stroke="#282421"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M 1 0 L 5 6 L 9 0" fill="var(--base-100)" />
            </svg>
          </div>
        ) : (
          <div ref={hintRef} className="stickman-hint" aria-hidden="true">
            use WASD
          </div>
        ))}

      {/* 4. Scalable Vector Doodle Stick Figure (mirrored horizontally via style.transform) */}
      <svg
        ref={doodleSvgRef}
        width="44"
        height="92"
        viewBox="0 0 32 86"
        className="stickman-doodle-svg"
        style={{ overflow: 'visible', transformOrigin: '16px 44px' }}
        aria-hidden="true"
      >
        {/* Head & hair loop doodle */}
        <g ref={headGroupRef}>
          <ellipse
            cx="16"
            cy="14"
            rx="5.8"
            ry="7.6"
            stroke="#282421"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 14.5 7 Q 17 4 19 3"
            stroke="#282421"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* Torso spine */}
        <line
          ref={spineRef}
          x1="16"
          y1="21.6"
          x2="16"
          y2="44"
          stroke="#282421"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Arms (back and front) */}
        <path
          ref={armBackRef}
          d="M 16 25 Q 18 35 19.5 45"
          stroke="#332e2a"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          ref={armFrontRef}
          d="M 16 25 Q 13.5 35 10 44"
          stroke="#25201d"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Legs (back and front) */}
        <path
          ref={legBackRef}
          d="M 16 44 L 19 62 L 23 80"
          stroke="#332e2a"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          ref={legFrontRef}
          d="M 16 44 L 13.5 62 L 10 80"
          stroke="#25201d"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
};
