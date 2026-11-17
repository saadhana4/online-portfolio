import React, { useEffect, useRef, useState } from 'react';

interface StickManProps {
  isAway?: boolean;
}

export const StickMan: React.FC<StickManProps> = ({ isAway = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const puffsLayerRef = useRef<HTMLDivElement>(null);

  // SVG limb refs for direct 60/120fps manipulation without React re-renders
  const headGroupRef = useRef<SVGGElement>(null);
  const spineRef = useRef<SVGLineElement>(null);
  const armFrontRef = useRef<SVGPathElement>(null);
  const armBackRef = useRef<SVGPathElement>(null);
  const legFrontRef = useRef<SVGPathElement>(null);
  const legBackRef = useRef<SVGPathElement>(null);

  // Responsive hint text
  const [hintText] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 700 || window.matchMedia('(pointer: coarse)').matches
        ? 'Tap: walk • W: jump'
        : 'A ‹  W ⇡  D ›';
    }
    return 'A ‹  W ⇡  D ›';
  });

  // State refs: X position along the bottom of the screen
  const posXRef = useRef<number>(32);
  const targetXRef = useRef<number | null>(null);
  const facingRef = useRef<'right' | 'left'>('right');
  const keysDownRef = useRef<Set<string>>(new Set());
  const hasMovedRef = useRef<boolean>(false);
  const isJumpingRef = useRef<boolean>(false);
  const jumpProgressRef = useRef<number>(0);
  const walkPhaseRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const lastPuffTimeRef = useRef<number>(0);
  const isInitializedRef = useRef<boolean>(false);

  // Trigger tiny jump in place
  const triggerJump = () => {
    if (!isJumpingRef.current) {
      isJumpingRef.current = true;
      jumpProgressRef.current = 0;
      if (!hasMovedRef.current) {
        hasMovedRef.current = true;
        if (hintRef.current) hintRef.current.classList.add('faded');
      }
    }
  };

  // Foot dust puff at the bottom
  const addPuff = (x: number) => {
    if (!puffsLayerRef.current) return;
    const puff = document.createElement('div');
    puff.className = 'stickman-foot-puff';
    puff.style.left = `${x}px`;
    puffsLayerRef.current.appendChild(puff);
    setTimeout(() => {
      puff.remove();
    }, 650);
  };

  useEffect(() => {
    lastTimeRef.current = performance.now();

    // Set initial X position in bottom-left clear area
    if (!isInitializedRef.current && typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 700 || window.matchMedia('(pointer: coarse)').matches;
      posXRef.current = isMobile ? 20 : 32;
      isInitializedRef.current = true;
    }

    // Keyboard listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      // Guard: do not capture keys while user is typing in form fields or modals
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
      const code = e.code;

      // W key or Up arrow or Space: tiny jump in place!
      if (key === 'w' || key === 'arrowup' || code === 'Space' || key === ' ') {
        triggerJump();
        e.preventDefault();
        return;
      }

      // A (left), D (right), S (crouch)
      if (['a', 'd', 's', 'arrowleft', 'arrowright', 'arrowdown'].includes(key)) {
        keysDownRef.current.add(key);
        // Clear tap target when user presses keyboard
        targetXRef.current = null;

        if (!hasMovedRef.current) {
          hasMovedRef.current = true;
          if (hintRef.current) hintRef.current.classList.add('faded');
        }

        if (key.startsWith('arrow')) {
          e.preventDefault();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysDownRef.current.delete(key);
    };

    // Desk tap/click to walk horizontally along bottom (for mobile & mouse)
    const handleStagePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.closest('button') ||
          target.closest('a') ||
          target.closest('input') ||
          target.closest('.phone-modal-backdrop') ||
          target.closest('.header-nav') ||
          target.closest('.hero-word-slot'))
      ) {
        return;
      }

      // If clicked on stickman himself, trigger tiny jump in place!
      if (target && containerRef.current && containerRef.current.contains(target)) {
        triggerJump();
        return;
      }

      // Move horizontally along bottom to clicked X
      targetXRef.current = Math.max(16, Math.min(window.innerWidth - 56, e.clientX - 22));

      if (!hasMovedRef.current) {
        hasMovedRef.current = true;
        if (hintRef.current) hintRef.current.classList.add('faded');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('pointerdown', handleStagePointerDown);

    // Update SVG joints & paths
    const applyPose = (
      moving: boolean,
      crouching: boolean,
      phase: number,
      jumping: boolean,
      now: number
    ) => {
      const head = headGroupRef.current;
      const spine = spineRef.current;
      const armF = armFrontRef.current;
      const armB = armBackRef.current;
      const legF = legFrontRef.current;
      const legB = legBackRef.current;

      if (!head || !spine || !armF || !armB || !legF || !legB) return;

      if (jumping) {
        // Cheerful tiny jump pose \o/
        head.setAttribute('transform', 'translate(0, -2) rotate(2 16 14)');
        spine.setAttribute('y1', '19');
        spine.setAttribute('y2', '42');

        // Arms reaching up in joy
        armF.setAttribute('d', 'M 16 23 Q 10 12 6 5');
        armB.setAttribute('d', 'M 16 23 Q 22 12 26 5');

        // Legs bent up slightly during jump
        legF.setAttribute('d', 'M 16 42 L 12 56 L 9 70');
        legB.setAttribute('d', 'M 16 42 L 20 56 L 23 70');
      } else if (crouching) {
        // Tiny crouch/squat in place when holding S
        head.setAttribute('transform', 'translate(0, 6) rotate(-2 16 14)');
        spine.setAttribute('y1', '27.6');
        spine.setAttribute('y2', '48');

        armF.setAttribute('d', 'M 16 31 Q 12 40 9 49');
        armB.setAttribute('d', 'M 16 31 Q 20 40 23 49');

        legF.setAttribute('d', 'M 16 48 L 11 65 L 10 80');
        legB.setAttribute('d', 'M 16 48 L 21 65 L 22 80');
      } else if (!moving) {
        // Idle pose: authentic graphite doodle matching inspo photo
        const breathe = Math.sin(now * 0.003) * 1.0;
        head.setAttribute('transform', `translate(0, ${breathe}) rotate(-3 16 14)`);
        spine.setAttribute('y1', `${21.6 + breathe}`);
        spine.setAttribute('y2', `${44 + breathe}`);

        // Arms at rest
        armF.setAttribute('d', `M 16 ${25 + breathe} Q 13.5 35 10 44`);
        armB.setAttribute('d', `M 16 ${25 + breathe} Q 18 35 19.5 45`);

        // Legs in easy ready stance matching inspo doodle
        legF.setAttribute('d', `M 16 ${44 + breathe} L 13.5 62 L 10 80`);
        legB.setAttribute('d', `M 16 ${44 + breathe} L 19 62 L 23 80`);
      } else {
        // Walking cycle with natural stride and arm swing
        const bob = Math.abs(Math.sin(phase)) * 3.2;
        const headTilt = Math.sin(phase) * 4.0;

        head.setAttribute('transform', `translate(0, ${bob}) rotate(${headTilt} 16 14)`);
        spine.setAttribute('y1', `${21.6 + bob}`);
        spine.setAttribute('y2', `${44 + bob}`);

        const hipY = 44 + bob;
        const shoulderY = 25 + bob;

        // Leg stride angles
        const angleFront = Math.sin(phase) * 0.55;
        const angleBack = Math.sin(phase + Math.PI) * 0.55;

        // Knee bend when lifting back leg
        const bendFront = Math.max(0, -Math.sin(phase)) * 0.85;
        const bendBack = Math.max(0, -Math.sin(phase + Math.PI)) * 0.85;

        // Front leg
        const kfx = 16 + Math.sin(angleFront) * 17;
        const kfy = hipY + Math.cos(angleFront) * 17;
        const ffx = kfx + Math.sin(angleFront - bendFront) * 17;
        const ffy = kfy + Math.cos(angleFront - bendFront) * 17;
        legF.setAttribute(
          'd',
          `M 16 ${hipY} L ${kfx.toFixed(1)} ${kfy.toFixed(1)} L ${ffx.toFixed(1)} ${ffy.toFixed(1)}`
        );

        // Back leg
        const kbx = 16 + Math.sin(angleBack) * 17;
        const kby = hipY + Math.cos(angleBack) * 17;
        const fbx = kbx + Math.sin(angleBack - bendBack) * 17;
        const fby = kby + Math.cos(angleBack - bendBack) * 17;
        legB.setAttribute(
          'd',
          `M 16 ${hipY} L ${kbx.toFixed(1)} ${kby.toFixed(1)} L ${fbx.toFixed(1)} ${fby.toFixed(1)}`
        );

        // Arms swinging opposite to legs
        const armAngleFront = Math.sin(phase + Math.PI) * 0.45;
        const armAngleBack = Math.sin(phase) * 0.45;

        const afx = 16 + Math.sin(armAngleFront) * 18;
        const afy = shoulderY + Math.cos(armAngleFront) * 18;
        armF.setAttribute(
          'd',
          `M 16 ${shoulderY} Q ${(16 + afx) / 2 - 1} ${(shoulderY + afy) / 2} ${afx.toFixed(1)} ${afy.toFixed(1)}`
        );

        const abx = 16 + Math.sin(armAngleBack) * 18;
        const aby = shoulderY + Math.cos(armAngleBack) * 18;
        armB.setAttribute(
          'd',
          `M 16 ${shoulderY} Q ${(16 + abx) / 2 + 1} ${(shoulderY + aby) / 2} ${abx.toFixed(1)} ${aby.toFixed(1)}`
        );
      }
    };

    let rAFId: number;

    const tick = (now: number) => {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;

      let dx = 0;
      const keys = keysDownRef.current;

      // Only horizontal walking: A (left), D (right)
      if (keys.has('a') || keys.has('arrowleft')) dx -= 1;
      if (keys.has('d') || keys.has('arrowright')) dx += 1;

      // Tap-to-walk horizontally if no keys held
      if (dx === 0 && targetXRef.current !== null) {
        const toX = targetXRef.current - posXRef.current;
        if (Math.abs(toX) > 6) {
          dx = Math.sign(toX);
        } else {
          targetXRef.current = null;
        }
      }

      const isCrouching = !isJumpingRef.current && (keys.has('s') || keys.has('arrowdown'));
      const isMoving = dx !== 0 && !isCrouching;

      if (dx < 0) facingRef.current = 'left';
      else if (dx > 0) facingRef.current = 'right';

      if (isMoving) {
        const speed = 210; // pixels per second
        posXRef.current += dx * speed * dt;

        // Clamped horizontally to bottom of screen
        const padX = 16;
        posXRef.current = Math.max(padX, Math.min(window.innerWidth - padX - 44, posXRef.current));

        walkPhaseRef.current += dt * 14;

        // Dust puff every ~220ms when in motion along bottom
        if (now - lastPuffTimeRef.current > 220) {
          addPuff(posXRef.current + 22);
          lastPuffTimeRef.current = now;
        }
      }

      // Tiny jump in place physics (W key or click)
      let jumpY = 0;
      if (isJumpingRef.current) {
        jumpProgressRef.current += dt * 4.4; // quick, crisp hop (~0.23s)
        if (jumpProgressRef.current >= 1.0) {
          isJumpingRef.current = false;
          jumpProgressRef.current = 0;
          addPuff(posXRef.current + 22);
        } else {
          // Tiny jump: 18px hop in place
          jumpY = -Math.sin(jumpProgressRef.current * Math.PI) * 18;
        }
      }

      // Update limbs SVG
      applyPose(isMoving, isCrouching, walkPhaseRef.current, isJumpingRef.current, now);

      // Apply transform to container (stays strictly at bottom of screen)
      if (containerRef.current) {
        const scaleX = facingRef.current === 'left' ? -1 : 1;
        containerRef.current.style.transform = `translate3d(${posXRef.current}px, ${jumpY}px, 0) scaleX(${scaleX})`;
      }

      rAFId = requestAnimationFrame(tick);
    };

    rAFId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('pointerdown', handleStagePointerDown);
      cancelAnimationFrame(rAFId);
    };
  }, []);

  return (
    <>
      {/* Footprint dust puffs layer along bottom baseline */}
      <div ref={puffsLayerRef} className="stickman-puffs-layer" aria-hidden="true" />

      {/* Main Stickman Character locked to bottom of screen */}
      <div
        ref={containerRef}
        className={`stickman-container ${isAway ? 'is-away' : ''}`}
        aria-label="Interactive doodle stickman at bottom of screen. Use A to move left, D to move right, and W to jump in place."
        role="img"
        onClick={triggerJump}
      >
        {/* Handwritten onboarding hint badge */}
        <div ref={hintRef} className="stickman-hint" aria-hidden="true">
          {hintText}
        </div>

        {/* Scalable Vector Doodle Stick Figure */}
        <svg
          width="44"
          height="92"
          viewBox="0 0 32 86"
          style={{ overflow: 'visible' }}
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
            {/* Cute top hair / scribble loop matching inspo image */}
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
    </>
  );
};
