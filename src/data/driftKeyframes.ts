export interface KeyframePosition {
  x: number; // percentage of stage width
  y: number; // percentage of stage height
  rot: number; // degrees
}

export interface ObjectKeyframes {
  id: string;
  delay: number; // 0 to 0.06
  p0: KeyframePosition;
  p28: KeyframePosition;
  p45: KeyframePosition;
  p65: KeyframePosition;
  p85: KeyframePosition;
  p1: KeyframePosition;
  mobileP0?: KeyframePosition;
  mobileP28?: KeyframePosition;
  mobileP45?: KeyframePosition;
  mobileP65?: KeyframePosition;
  mobileP85?: KeyframePosition;
  mobileP1?: KeyframePosition;
}

// 6 keyframe progress values
export const KEYFRAME_P = [0, 0.28, 0.45, 0.65, 0.85, 1.0] as const;

// Hero line y% per keyframe
export const HERO_Y_KEYFRAMES = [45, 26, 25, 47, 68, 45] as const;

export const driftKeyframes: Record<string, ObjectKeyframes> = {
  notebook: {
    id: 'notebook',
    delay: 0.000,
    p0: { x: 11, y: 20, rot: -6 },
    p28: { x: 48, y: 50, rot: 30 },
    p45: { x: 50, y: 51, rot: -15 },
    p65: { x: 20, y: 12, rot: 30 },
    p85: { x: 20, y: -2, rot: -36 },
    p1: { x: 11, y: 20, rot: -6 },
    mobileP0: { x: 20, y: 21, rot: -6 },
    mobileP65: { x: 22, y: 18, rot: 30 },
    mobileP1: { x: 20, y: 21, rot: -6 },
  },
  pencil: {
    id: 'pencil',
    delay: 0.025,
    p0: { x: 24.5, y: 22, rot: 14 },
    p28: { x: 54, y: 48, rot: -26 },
    p45: { x: 52, y: 48, rot: 24 },
    p65: { x: 6, y: 30, rot: -26 },
    p85: { x: 85, y: 106, rot: 44 },
    p1: { x: 24.5, y: 22, rot: 14 },
  },
  webcam: {
    id: 'webcam',
    delay: 0.050,
    p0: { x: 36, y: 25, rot: -4 },
    p28: { x: 52, y: 45, rot: 32 },
    p45: { x: 48, y: 47, rot: -20 },
    p65: { x: 90, y: 20, rot: 25 },
    p85: { x: 5, y: -2, rot: -34 },
    p1: { x: 36, y: 25, rot: -4 },
  },
  headphones: {
    id: 'headphones',
    delay: 0.015,
    p0: { x: 56, y: 18, rot: -3 },
    p28: { x: 47, y: 56, rot: -38 },
    p45: { x: 49, y: 54, rot: 12 },
    p65: { x: 34, y: 15, rot: -35 },
    p85: { x: 58, y: -3, rot: 25 },
    p1: { x: 56, y: 18, rot: -3 },
    mobileP0: { x: 68, y: 21, rot: 4 },
    mobileP65: { x: 68, y: 18, rot: -35 },
    mobileP1: { x: 68, y: 21, rot: 4 },
  },
  'sticky-notes': {
    id: 'sticky-notes',
    delay: 0.040,
    p0: { x: 79.5, y: 29.5, rot: 5 },
    p28: { x: 2, y: 98, rot: 45 },
    p45: { x: 7, y: 94, rot: 15 },
    p65: { x: 42, y: 84, rot: -25 },
    p85: { x: 70, y: 50, rot: 30 },
    p1: { x: 79.5, y: 29.5, rot: 5 },
  },
  'tape-roll': {
    id: 'tape-roll',
    delay: 0.010,
    p0: { x: 23, y: 43, rot: 0 },
    p28: { x: 55, y: 54, rot: 42 },
    p45: { x: 51, y: 53, rot: -18 },
    p65: { x: 50, y: 26, rot: 30 },
    p85: { x: 44, y: 0, rot: -28 },
    p1: { x: 23, y: 43, rot: 0 },
  },
  plant: {
    id: 'plant',
    delay: 0.060,
    p0: { x: 5, y: 51, rot: 0 },
    p28: { x: 44, y: 48, rot: 35 },
    p45: { x: 47, y: 50, rot: -22 },
    p65: { x: 86, y: 86, rot: 24 },
    p85: { x: -1, y: 70, rot: -30 },
    p1: { x: 5, y: 51, rot: 0 },
    mobileP0: { x: 18, y: 58, rot: 0 },
    mobileP65: { x: 22, y: 84, rot: 24 },
    mobileP1: { x: 18, y: 58, rot: 0 },
  },
  ruler: {
    id: 'ruler',
    delay: 0.030,
    p0: { x: 12, y: 76, rot: -35 },
    p28: { x: 51, y: 58, rot: 15 },
    p45: { x: 50, y: 55, rot: -30 },
    p65: { x: 18, y: 84, rot: 25 },
    p85: { x: 25, y: 103, rot: -5 },
    p1: { x: 12, y: 76, rot: -35 },
  },
  'coffee-cup': {
    id: 'coffee-cup',
    delay: 0.045,
    p0: { x: 26, y: 70, rot: -3 },
    p28: { x: 46, y: 53, rot: 36 },
    p45: { x: 48, y: 52, rot: -14 },
    p65: { x: 53, y: 90, rot: 32 },
    p85: { x: 31, y: 50, rot: -28 },
    p1: { x: 26, y: 70, rot: -3 },
    mobileP0: { x: 76, y: 58, rot: -3 },
    mobileP65: { x: 76, y: 84, rot: 32 },
    mobileP85: { x: 25, y: 50, rot: -28 },
    mobileP1: { x: 76, y: 58, rot: -3 },
  },
  scissors: {
    id: 'scissors',
    delay: 0.020,
    p0: { x: 93.5, y: 57, rot: -30 },
    p28: { x: 53, y: 47, rot: 26 },
    p45: { x: 52, y: 50, rot: -24 },
    p65: { x: 30, y: 88, rot: 40 },
    p85: { x: 70, y: 102, rot: -2 },
    p1: { x: 93.5, y: 57, rot: -30 },
  },
  'sd-cards': {
    id: 'sd-cards',
    delay: 0.055,
    p0: { x: 91, y: 78, rot: -10 },
    p28: { x: 97, y: 98, rot: 25 },
    p45: { x: 92, y: 93, rot: -20 },
    p65: { x: 68, y: 83, rot: 28 },
    p85: { x: 50, y: 104, rot: -38 },
    p1: { x: 91, y: 78, rot: -10 },
  },
  laptop: {
    id: 'laptop',
    delay: 0.035,
    p0: { x: 54, y: 71, rot: -3 },
    p28: { x: 98, y: 2, rot: 35 },
    p45: { x: 94, y: 6, rot: -15 },
    p65: { x: 78, y: 13, rot: 26 },
    p85: { x: 50, y: 36, rot: -28 },
    p1: { x: 54, y: 71, rot: -3 },
    mobileP0: { x: 50, y: 77, rot: -2 },
    mobileP28: { x: 92, y: -6, rot: 35 },
    mobileP45: { x: 88, y: -4, rot: -15 },
    mobileP65: { x: 50, y: 82, rot: 26 },
    mobileP85: { x: 50, y: 36, rot: -28 },
    mobileP1: { x: 50, y: 77, rot: -2 },
  },
};

/**
 * 2) AWAY LAYOUT (Every object cropped by screen edge; center stays clear)
 * notebook (14,-3) rot -22 | tape roll (31,0) rot 15 | headphones (47,-5) rot 10 |
 * webcam (63,-1) rot -12 | laptop (80,-8) rot 8 | sticky notes (93,3) rot 20 |
 * plant (-1,60) rot 0 | ruler (14,105) rot -30 | coffee cup (33,103) rot 12 |
 * SD cards (52,106) rot -8 | scissors (72,102) rot 25 | pencil (90,106) rot 60
 */
export const AWAY_LAYOUT: Record<string, KeyframePosition> = {
  notebook: { x: 14, y: -3, rot: -22 },
  'tape-roll': { x: 31, y: 0, rot: 15 },
  headphones: { x: 47, y: -5, rot: 10 },
  webcam: { x: 63, y: -1, rot: -12 },
  laptop: { x: 80, y: -8, rot: 8 },
  'sticky-notes': { x: 93, y: 3, rot: 20 },
  plant: { x: -1, y: 60, rot: 0 },
  ruler: { x: 14, y: 105, rot: -30 },
  'coffee-cup': { x: 33, y: 103, rot: 12 },
  'sd-cards': { x: 52, y: 106, rot: -8 },
  scissors: { x: 72, y: 102, rot: 25 },
  pencil: { x: 90, y: 106, rot: 60 },
};

/**
 * Stable per-object stagger of 0 to 120ms (different per object)
 */
export const OBJECT_STAGGERS: Record<string, number> = {
  notebook: 0,
  pencil: 80,
  webcam: 40,
  headphones: 100,
  'sticky-notes': 30,
  'tape-roll': 70,
  plant: 110,
  ruler: 20,
  'coffee-cup': 90,
  scissors: 50,
  'sd-cards': 120,
  laptop: 60,
};

/**
 * Standard cubic ease in-out
 */
export function cubicEaseInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Evaluates cubic-bezier(0.65, 0, 0.35, 1) using Newton-Raphson solver
 */
export function cubicBezierEase(x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  const x1 = 0.65;
  const x2 = 0.35;
  const y1 = 0.0;
  const y2 = 1.0;

  let t = x;
  for (let i = 0; i < 6; i++) {
    const oneMinusT = 1 - t;
    const currentX =
      3 * oneMinusT * oneMinusT * t * x1 +
      3 * oneMinusT * t * t * x2 +
      t * t * t;
    const currentDx =
      3 * oneMinusT * oneMinusT * x1 +
      6 * oneMinusT * t * (x2 - x1) +
      3 * t * t * (1 - x2);
    if (Math.abs(currentDx) < 1e-6) break;
    t -= (currentX - x) / currentDx;
    t = Math.max(0, Math.min(1, t));
  }

  const oneMinusT = 1 - t;
  return (
    3 * oneMinusT * oneMinusT * t * y1 +
    3 * oneMinusT * t * t * y2 +
    t * t * t
  );
}

/**
 * Interpolate hero y% at progress p
 */
export function getHeroYPercent(p: number): number {
  let normalizedP = p % 1;
  if (normalizedP < 0) normalizedP += 1;

  for (let i = 0; i < KEYFRAME_P.length - 1; i++) {
    const pStart = KEYFRAME_P[i];
    const pEnd = KEYFRAME_P[i + 1];
    if (normalizedP >= pStart && normalizedP <= pEnd) {
      const segT = (normalizedP - pStart) / (pEnd - pStart);
      const easedT = cubicEaseInOut(segT);
      const yStart = HERO_Y_KEYFRAMES[i];
      const yEnd = HERO_Y_KEYFRAMES[i + 1];
      return yStart + (yEnd - yStart) * easedT;
    }
  }
  return HERO_Y_KEYFRAMES[0];
}

/**
 * Interpolate object position and rotation at progress p
 */
export function getObjectTransform(
  id: string,
  progress: number,
  isMobile: boolean
): KeyframePosition {
  const kf = driftKeyframes[id];
  if (!kf) {
    return { x: 50, y: 50, rot: 0 };
  }

  let p = (progress - kf.delay) % 1;
  if (p < 0) p += 1;

  const getPos = (index: number): KeyframePosition => {
    if (isMobile) {
      switch (index) {
        case 0: return kf.mobileP0 || kf.p0;
        case 1: return kf.mobileP28 || kf.p28;
        case 2: return kf.mobileP45 || kf.p45;
        case 3: return kf.mobileP65 || kf.p65;
        case 4: return kf.mobileP85 || kf.p85;
        case 5: return kf.mobileP1 || kf.mobileP0 || kf.p1;
      }
    } else {
      switch (index) {
        case 0: return kf.p0;
        case 1: return kf.p28;
        case 2: return kf.p45;
        case 3: return kf.p65;
        case 4: return kf.p85;
        case 5: return kf.p1;
      }
    }
    return kf.p0;
  };

  for (let i = 0; i < KEYFRAME_P.length - 1; i++) {
    const pStart = KEYFRAME_P[i];
    const pEnd = KEYFRAME_P[i + 1];
    if (p >= pStart && p <= pEnd) {
      const segT = (p - pStart) / (pEnd - pStart);
      const easedT = cubicEaseInOut(segT);
      const start = getPos(i);
      const end = getPos(i + 1);

      let x = start.x + (end.x - start.x) * easedT;
      let y = start.y + (end.y - start.y) * easedT;
      const rot = start.rot + (end.rot - start.rot) * easedT;

      if (isMobile && y > 0 && y < 15 && x > 62) {
        y = 16;
      }

      return { x, y, rot };
    }
  }

  return getPos(0);
}

/**
 * Blends home position with away layout position
 * a in [0, 1] (0 = home, 1 = away)
 */
export function getBlendedObjectTransform(
  id: string,
  homeP: number,
  globalA: number,
  isMobile: boolean,
  isEnteringAway: boolean
): KeyframePosition {
  const homePos = getObjectTransform(id, homeP, isMobile);
  const awayPos = AWAY_LAYOUT[id] || homePos;

  if (globalA <= 0) return homePos;
  if (globalA >= 1) return awayPos;

  // Stagger calculation: 0 to 120ms of 900ms duration
  const staggerMs = OBJECT_STAGGERS[id] ?? 0;
  const staggerNorm = staggerMs / 900;
  const activeWindow = (900 - 120) / 900; // ~0.867

  let localA: number;
  if (isEnteringAway) {
    const normalizedTime = Math.max(0, Math.min(1, (globalA - staggerNorm) / activeWindow));
    localA = cubicBezierEase(normalizedTime);
  } else {
    // When returning to home, reverse progress (1 - globalA) drives the return
    const reverseTime = 1 - globalA;
    const normalizedTime = Math.max(0, Math.min(1, (reverseTime - staggerNorm) / activeWindow));
    localA = 1 - cubicBezierEase(normalizedTime);
  }

  const x = homePos.x + (awayPos.x - homePos.x) * localA;
  const y = homePos.y + (awayPos.y - homePos.y) * localA;
  const rot = homePos.rot + (awayPos.rot - homePos.rot) * localA;

  return { x, y, rot };
}
