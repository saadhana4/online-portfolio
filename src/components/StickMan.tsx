import React, { useEffect, useRef, useState } from 'react';

interface StickManProps {
  isAway?: boolean;
}

export const StickMan: React.FC<StickManProps> = ({ isAway = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  // SVG limb refs for direct 60/120fps manipulation without React re-renders
  const headGroupRef = useRef<SVGGElement>(null);
  const spineRef = useRef<SVGLineElement>(null);
  const armFrontRef = useRef<SVGPathElement>(null);
  const armBackRef = useRef<SVGPathElement>(null);
  const legFrontRef = useRef<SVGPathElement>(null);
  const legBackRef = useRef<SVGPathElement>(null);

  // Responsive hint text (purely keyboard WASD instructions)
  const [hintText] = useState<string>('A: left  •  W: jump  •  D: right');

  // State refs: X position strictly along the bottom of the screen
  const posXRef = useRef<number>(32);
  const facingRef = useRef<'right' | 'left'>('right');
  const keysDownRef = useRef<Set<string>>(new Set());
  const hasMovedRef = useRef<boolean>(false);
  const isJumpingRef = useRef<boolean>(false);
  const jumpProgressRef = useRef<number>(0);
  const walkPhaseRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const isInitializedRef = useRef<boolean>(false);

  // Trigger small jump in place
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

  useEffect(() => {
    lastTimeRef.current = performance.now();

    // Set initial X position in bottom-left clear area
    if (!isInitializedRef.current && typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 700;
      posXRef.current = isMobile ? 20 : 32;
      isInitializedRef.current = true;
    }

    // Keyboard listeners (capture phase to isolate from any stage/desk scrolling)
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

      // W key or Up arrow: tiny jump in place!
      if (key === 'w' || key === 'arrowup') {
        triggerJump();
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return;
      }

      // A key or Left arrow: walk left
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

      // D key or Right arrow: walk right
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
      const key = e.key.toLowerCase();
      if (key === 'a' || key === 'arrowleft') {
        keysDownRef.current.delete('a');
      } else if (key === 'd' || key === 'arrowright') {
        keysDownRef.current.delete('d');
      }
    };

    // Attach listeners on window with capture: true
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('keyup', handleKeyUp, { capture: true });

    // Update SVG joints & paths
    const applyPose = (
      moving: boolean,
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
        // Small jump pose (arms slightly raised, knees bent)
        head.setAttribute('transform', 'translate(0, -1) rotate(1 16 14)');
        spine.setAttribute('y1', '20');
        spine.setAttribute('y2', '43');

        // Arms slight upward swing
        armF.setAttribute('d', 'M 16 24 Q 11 16 8 10');
        armB.setAttribute('d', 'M 16 24 Q 21 16 24 10');

        // Legs bent slightly up in small jump
        legF.setAttribute('d', 'M 16 43 L 13 58 L 11 72');
        legB.setAttribute('d', 'M 16 43 L 19 58 L 21 72');
      } else if (!moving) {
        // Idle pose: authentic graphite doodle matching inspo photo
        const breathe = Math.sin(now * 0.003) * 0.8;
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
        const bob = Math.abs(Math.sin(phase)) * 2.8;
        const headTilt = Math.sin(phase) * 3.5;

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

      // Only horizontal walking via A (left) and D (right) keys
      if (keys.has('a')) dx -= 1;
      if (keys.has('d')) dx += 1;

      const isMoving = dx !== 0;

      if (dx < 0) facingRef.current = 'left';
      else if (dx > 0) facingRef.current = 'right';

      if (isMoving) {
        const speed = 210; // pixels per second along the bottom
        posXRef.current += dx * speed * dt;

        // Clamped horizontally to screen edges
        const padX = 16;
        posXRef.current = Math.max(padX, Math.min(window.innerWidth - padX - 44, posXRef.current));

        walkPhaseRef.current += dt * 14;
      }

      // Small jump in place physics (W key)
      let jumpY = 0;
      if (isJumpingRef.current) {
        jumpProgressRef.current += dt * 4.8; // quick, small hop (~0.21s)
        if (jumpProgressRef.current >= 1.0) {
          isJumpingRef.current = false;
          jumpProgressRef.current = 0;
        } else {
          // Small jump: 14px small jump in place
          jumpY = -Math.sin(jumpProgressRef.current * Math.PI) * 14;
        }
      }

      // Update limbs SVG
      applyPose(isMoving, walkPhaseRef.current, isJumpingRef.current, now);

      // Apply transform to stickman container strictly at bottom of screen
      if (containerRef.current) {
        const scaleX = facingRef.current === 'left' ? -1 : 1;
        containerRef.current.style.transform = `translate3d(${posXRef.current}px, ${jumpY}px, 0) scaleX(${scaleX})`;
      }

      rAFId = requestAnimationFrame(tick);
    };

    rAFId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('keyup', handleKeyUp, { capture: true });
      cancelAnimationFrame(rAFId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`stickman-container ${isAway ? 'is-away' : ''}`}
      aria-label="Doodle stickman at bottom of screen. Use A to move left, D to move right, and W to jump."
      role="img"
    >
      {/* Handwritten hint badge */}
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
          {/* Cute top hair loop doodle matching inspo image */}
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
