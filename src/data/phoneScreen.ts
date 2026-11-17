export interface PhoneScreenCalibration {
  imageWidth: number;
  imageHeight: number;
  center: {
    xPercent: number; // Center X as percentage of image width
    yPercent: number; // Center Y as percentage of image height
    xNative: number;  // Center X in native pixels
    yNative: number;  // Center Y in native pixels
  };
  size: {
    widthPercent: number;  // Screen width as percentage of image width
    heightPercent: number; // Screen height as percentage of image height
    widthNative: number;   // Screen width in native pixels
    heightNative: number;  // Screen height in native pixels
  };
  tiltAngleDeg: number;       // Clockwise tilt of screen inside image (degrees)
  cornerRadiusPercent: number;// Corner radius as percentage of image width
  cornerRadiusNative: number; // Corner radius in native pixels
  cornersPercent: {
    topLeft: { x: number; y: number };
    topRight: { x: number; y: number };
    bottomRight: { x: number; y: number };
    bottomLeft: { x: number; y: number };
  };
}

export const PHONE_SCREEN: PhoneScreenCalibration = {
  imageWidth: 480,
  imageHeight: 650,
  center: {
    xPercent: 61.46,
    yPercent: 38.46,
    xNative: 295.0,
    yNative: 250.0,
  },
  size: {
    widthPercent: 41.25,
    heightPercent: 65.54,
    widthNative: 198,
    heightNative: 426,
  },
  tiltAngleDeg: 12.6,
  cornerRadiusPercent: 4.58,
  cornerRadiusNative: 22,
  cornersPercent: {
    topLeft: { x: 50.33, y: 2.97 },
    topRight: { x: 90.63, y: 9.63 },
    bottomRight: { x: 72.58, y: 73.95 },
    bottomLeft: { x: 32.29, y: 67.29 },
  },
};

export default PHONE_SCREEN;
