import { deskObjects } from './deskObjects';
import { getBlendedObjectTransform } from './driftKeyframes';
import { PHONE_SCREEN } from './phoneScreen';

export interface DeskObjectEngineState {
  screenCenterX: number;
  screenCenterY: number;
  objectCenterX: number;
  objectCenterY: number;
  width: number;
  height: number;
  rotation: number;
  isAvailable: boolean;
}

/**
 * Compute the exact center, rotation, width, height, and screen center
 * of a desk object directly from the desk animation engine state.
 * Eliminates getBoundingClientRect inflation due to rotation.
 */
export function computeDeskObjectEngineState(
  id: string,
  p: number,
  a: number,
  isMob: boolean,
  isEnteringAway: boolean,
  stageW: number,
  stageH: number
): DeskObjectEngineState {
  const obj = deskObjects.find((o) => o.id === id);
  if (!obj) {
    return {
      screenCenterX: stageW / 2,
      screenCenterY: stageH + 100,
      objectCenterX: stageW / 2,
      objectCenterY: stageH + 100,
      width: 107,
      height: 144,
      rotation: 0,
      isAvailable: false,
    };
  }

  // Not shown on mobile set
  if (isMob && !obj.showOnMobile) {
    return {
      screenCenterX: stageW / 2,
      screenCenterY: stageH + 100,
      objectCenterX: stageW / 2,
      objectCenterY: stageH + 100,
      width: 107,
      height: 144,
      rotation: 0,
      isAvailable: false,
    };
  }

  const normP = ((p % 1) + 1) % 1;
  const pos = getBlendedObjectTransform(id, normP, a, isMob, isEnteringAway);

  const widthVw = isMob && obj.mobileWidthVw !== undefined ? obj.mobileWidthVw : obj.widthVw;
  const widthPx = (widthVw / 100) * stageW;
  const heightPx = widthPx * (PHONE_SCREEN.imageHeight / PHONE_SCREEN.imageWidth);
  const objCenterX = (pos.x / 100) * stageW;
  const objCenterY = (pos.y / 100) * stageH;
  const rot = pos.rot;

  // Check if off screen (e.g. scroll loop moved it outside viewport bounds)
  const isOffScreen = pos.x < -5 || pos.x > 105 || pos.y < -5 || pos.y > 105;
  if (isOffScreen) {
    return {
      screenCenterX: stageW / 2,
      screenCenterY: stageH + 100,
      objectCenterX: stageW / 2,
      objectCenterY: stageH + 100,
      width: widthPx,
      height: heightPx,
      rotation: rot,
      isAvailable: false,
    };
  }

  // Native offset of screen center from image center (240, 325)
  const dx = PHONE_SCREEN.center.xNative - PHONE_SCREEN.imageWidth / 2; // 295.0 - 240.0 = 55.0
  const dy = PHONE_SCREEN.center.yNative - PHONE_SCREEN.imageHeight / 2; // 250.0 - 325.0 = -75.0
  const scale = widthPx / PHONE_SCREEN.imageWidth;
  const rad = (rot * Math.PI) / 180;

  const screenCenterX = objCenterX + scale * (dx * Math.cos(rad) - dy * Math.sin(rad));
  const screenCenterY = objCenterY + scale * (dx * Math.sin(rad) + dy * Math.cos(rad));

  return {
    screenCenterX,
    screenCenterY,
    objectCenterX: objCenterX,
    objectCenterY: objCenterY,
    width: widthPx,
    height: heightPx,
    rotation: rot,
    isAvailable: true,
  };
}

/**
 * Return the shortest angular rotation path from fromDeg to toDeg (in degrees).
 */
export function shortestRotationDeg(fromDeg: number, toDeg: number): number {
  let diff = (toDeg - fromDeg) % 360;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return fromDeg + diff;
}
