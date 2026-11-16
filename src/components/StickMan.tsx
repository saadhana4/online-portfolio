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

  // Detect mobile/touch for responsive hint text
  const [hintText] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 700 || window.matchMedia('(pointer: coarse)').matches
        ? 'Tap desk to walk ✎'
        : 'WASD to walk ✎';
    }
    return 'WASD to walk ✎';
  });

  // Movement & animation state refs
  const posRef = useRef<{ x: number; y: number }>({ x: 42, y: 510 });
  const targetPosRef = useRef<{ x: number; y: number } | null>(null);
  const facingRef = useRef<'right' | 'left'>('right');
  const keysDownRef = useRef<Set<string>>(new Set());
  const hasMovedRef = useRef<boolean>(false);
  const isJumpingRef = useRef<boolean>(false);
  const jumpProgressRef = useRef<number>(0);
  const walkPhaseRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const lastPuffTimeRef = useRef<number>(0);
  const isInitializedRef = useRef<boolean>(false);

  // Trigger jump animation
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

  // Foot dust puff
  const addPuff = (x: number, y: number) => {
    if (!puffsLayerRef.current) return;
    const puff = document.createElement('div');
    puff.className = 'stickman-foot-puff';
    puff.style.left = `${x}px`;
    puff.style.top = `${y}px`;
    puffsLayerRef.current.appendChild(puff);
    setTimeout(() => {
      puff.remove();
    }, 650);
  };

  useEffect(() => {
    lastTimeRef.current = performance.now();

    const isMobile = window.innerWidth < 700 || window.matchMedia('(pointer: coarse)').matches;

    // Set initial position in clear bottom-left area matching inspo photo
    if (!isInitializedRef.current && typeof window !== 'undefined') {
      const initX = isMobile ? 24 : Math.max(38, Math.min(60, window.innerWidth * 0.04));
      const initY = Math.max(80, window.innerHeight - (isMobile ? 115 : 135));
      posRef.current = { x: initX, y: initY };
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

      if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(key)) {
        keysDownRef.current.add(key);
        // Clear tap target when user presses keyboard
        targetPosRef.current = null;

        if (!hasMovedRef.current) {
          hasMovedRef.current = true;
          if (hintRef.current) hintRef.current.classList.add('faded');
        }

        // Prevent window arrow scrolling while driving stickman
        if (key.startsWith('arrow')) {
          e.preventDefault();
        }
      } else if (code === 'Space' || key === ' ') {
        // Spacebar to jump
        triggerJump();
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysDownRef.current.delete(key);
    };

    // Desk tap/click to walk (supports mobile & mouse navigation)
    const handleStagePointerDown = (e: PointerEvent) => {
      // Only handle if clicking background / desk stage, not navigation links/buttons/modals
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

      // If clicked on stickman itself, jump!
      if (target && containerRef.current && containerRef.current.contains(target)) {
        triggerJump();
        return;
      }

      // Tap-to-move target
      targetPosRef.current = {
        x: Math.max(16, Math.min(window.innerWidth - 56, e.clientX - 22)),
        y: Math.max(30, Math.min(window.innerHeight - 95, e.clientY - 75)),
      };

      if (!hasMovedRef.current) {
        hasMovedRef.current = true;
        if (hintRef.current) hintRef.current.classList.add('faded');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('pointerdown', handleStagePointerDown);

    // Update SVG joints & paths
    const applyPose = (moving: boolean, phase: number, jumping: boolean, now: number) => {
      const head = headGroupRef.current;
      const spine = spineRef.current;
      const armF = armFrontRef.current;
      const armB = armBackRef.current;
      const legF = legFrontRef.current;
      const legB = legBackRef.current;

      if (!head || !spine || !armF || !armB || !legF || !legB) return;

      if (jumping) {
        // Cheerful jumping pose \o/
        head.setAttribute('transform', 'translate(0, -2) rotate(2 16 14)');
        spine.setAttribute('y1', '19');
        spine.setAttribute('y2', '42');

        // Arms reaching up in joy
        armF.setAttribute('d', 'M 16 23 Q 10 12 6 5');
        armB.setAttribute('d', 'M 16 23 Q 22 12 26 5');

        // Legs bent slightly up in jump
        legF.setAttribute('d', 'M 16 42 L 12 58 L 9 72');
        legB.setAttribute('d', 'M 16 42 L 20 58 L 23 72');
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
      let dy = 0;

      const keys = keysDownRef.current;
      if (keys.has('a') || keys.has('arrowleft')) dx -= 1;
      if (keys.has('d') || keys.has('arrowright')) dx += 1;
      if (keys.has('w') || keys.has('arrowup')) dy -= 1;
      if (keys.has('s') || keys.has('arrowdown')) dy += 1;

      // Tap-to-walk steering if no keyboard keys are held
      if (dx === 0 && dy === 0 && targetPosRef.current) {
        const toX = targetPosRef.current.x - posRef.current.x;
        const toY = targetPosRef.current.y - posRef.current.y;
        const dist = Math.hypot(toX, toY);

        if (dist > 8) {
          dx = toX / dist;
          dy = toY / dist;
        } else {
          targetPosRef.current = null;
        }
      }

      const isMoving = dx !== 0 || dy !== 0;

      if (dx < -0.05) facingRef.current = 'left';
      else if (dx > 0.05) facingRef.current = 'right';

      if (isMoving) {
        const mag = Math.hypot(dx, dy);
        const normDx = dx / mag;
        const normDy = dy / mag;

        const speed = 200; // pixels per second
        posRef.current.x += normDx * speed * dt;
        posRef.current.y += normDy * speed * dt;

        // Viewport clamping
        const padX = 16;
        const padY = 24;
        posRef.current.x = Math.max(padX, Math.min(window.innerWidth - padX - 44, posRef.current.x));
        posRef.current.y = Math.max(padY, Math.min(window.innerHeight - padY - 90, posRef.current.y));

        walkPhaseRef.current += dt * 14;

        // Dust puff every ~220ms when in motion
        if (now - lastPuffTimeRef.current > 220) {
          addPuff(posRef.current.x + 22, posRef.current.y + 86);
          lastPuffTimeRef.current = now;
        }
      }

      // Jump physics
      let jumpY = 0;
      if (isJumpingRef.current) {
        jumpProgressRef.current += dt * 4.0;
        if (jumpProgressRef.current >= 1.0) {
          isJumpingRef.current = false;
          jumpProgressRef.current = 0;
          addPuff(posRef.current.x + 22, posRef.current.y + 86);
        } else {
          jumpY = -Math.sin(jumpProgressRef.current * Math.PI) * 32;
        }
      }

      // Update limbs SVG
      applyPose(isMoving, walkPhaseRef.current, isJumpingRef.current, now);

      // Apply transform to container
      if (containerRef.current) {
        const scaleX = facingRef.current === 'left' ? -1 : 1;
        const finalY = posRef.current.y + jumpY;
        containerRef.current.style.transform = `translate3d(${posRef.current.x}px, ${finalY}px, 0) scaleX(${scaleX})`;
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
      {/* Footprint dust puffs layer */}
      <div ref={puffsLayerRef} className="stickman-puffs-layer" aria-hidden="true" />

      {/* Main Stickman Character */}
      <div
        ref={containerRef}
        className={`stickman-container ${isAway ? 'is-away' : ''}`}
        aria-label="Interactive doodle stickman. Use W, A, S, D keys or click to move."
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
