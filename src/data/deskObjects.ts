export interface DeskObjectConfig {
  id: string;
  name: string;
  src: string;
  x: number; // left % on desktop
  y: number; // top % on desktop
  rotation: number; // rotation in degrees
  widthVw: number; // width in vw
  targetPx1366: number; // reference visible width at 1366px
  alt: string; // empty alt for decorative desk items per a11y
  showOnMobile: boolean; // only laptop, notebook, plant, coffee cup, headphones on mobile
  mobileX?: number; // left % on mobile
  mobileY?: number; // top % on mobile
  mobileWidthVw?: number; // width in vw on mobile
  mobileRotation?: number; // rotation on mobile
  zIndex?: number;
}

export const deskObjects: DeskObjectConfig[] = [
  {
    id: 'notebook',
    name: 'Spiral Notebook',
    src: '/desk/notebook.svg',
    x: 11,
    y: 20,
    rotation: -6,
    widthVw: 12.08, // 165px at 1366px
    targetPx1366: 165,
    alt: '',
    showOnMobile: true,
    mobileX: 20,
    mobileY: 21,
    mobileWidthVw: 24,
    mobileRotation: -6,
    zIndex: 2,
  },
  {
    id: 'pencil',
    name: 'Graphite Pencil',
    src: '/desk/pencil.svg',
    x: 24.5, // >=24px from notebook (notebook right edge ~17vw, pencil left edge ~19vw)
    y: 22,
    rotation: 14,
    widthVw: 10.98, // 150px at 1366px
    targetPx1366: 150,
    alt: '',
    showOnMobile: false,
    zIndex: 3,
  },
  {
    id: 'webcam',
    name: 'Vintage Camera',
    src: '/desk/camera.webp',
    x: 36,
    y: 25,
    rotation: -4,
    widthVw: 7.2, // ~98px at 1366px (1.47:1 aspect ratio)
    targetPx1366: 98,
    alt: 'Vintage rangefinder camera',
    showOnMobile: false,
    zIndex: 1,
  },
  {
    id: 'headphones',
    name: 'Studio Headphones',
    src: '/desk/headphones.svg',
    x: 56,
    y: 18,
    rotation: -3,
    widthVw: 12.45, // 170px at 1366px
    targetPx1366: 170,
    alt: '',
    showOnMobile: true,
    mobileX: 68,
    mobileY: 21,
    mobileWidthVw: 18,
    mobileRotation: 4,
    zIndex: 2,
  },
  {
    id: 'sticky-notes',
    name: 'Pastel Sticky Notes',
    src: '/desk/stickynotes.svg',
    x: 79.5,
    y: 29.5,
    rotation: 5,
    widthVw: 8.42, // 115px at 1366px
    targetPx1366: 115,
    alt: '',
    showOnMobile: false,
    zIndex: 2,
  },
  {
    id: 'tape-roll',
    name: 'Washi Tape Roll',
    src: '/desk/taperoll.svg',
    x: 23,
    y: 43,
    rotation: 0,
    widthVw: 4.76, // 65px at 1366px
    targetPx1366: 65,
    alt: '',
    showOnMobile: false,
    zIndex: 2,
  },
  {
    id: 'plant',
    name: 'Potted Monstera Plant',
    src: '/desk/plant.svg',
    x: 5,
    y: 51,
    rotation: 0,
    widthVw: 6.22, // 85px at 1366px
    targetPx1366: 85,
    alt: '',
    showOnMobile: true,
    mobileX: 18,
    mobileY: 58,
    mobileWidthVw: 16,
    mobileRotation: 0,
    zIndex: 1,
  },
  {
    id: 'ruler',
    name: 'Wooden Ruler',
    src: '/desk/ruler.svg',
    x: 12,
    y: 76,
    rotation: -35,
    widthVw: 10.98, // 150px at 1366px
    targetPx1366: 150,
    alt: '',
    showOnMobile: false,
    zIndex: 2,
  },
  {
    id: 'coffee-cup',
    name: 'Vintage Light Bulb',
    src: '/desk/bulb.webp',
    x: 26,
    y: 70,
    rotation: 15,
    widthVw: 5.6, // ~76px wide x 123px tall at 1366px
    targetPx1366: 76,
    alt: 'Vintage incandescent light bulb',
    showOnMobile: true,
    mobileX: 74,
    mobileY: 58,
    mobileWidthVw: 13,
    mobileRotation: 12,
    zIndex: 3,
  },
  {
    id: 'scissors',
    name: 'Craft Scissors',
    src: '/desk/scissors.svg',
    x: 93.5,
    y: 57,
    rotation: -30,
    widthVw: 10.98, // 150px at 1366px
    targetPx1366: 150,
    alt: '',
    showOnMobile: false,
    zIndex: 2,
  },
  {
    id: 'sd-cards',
    name: 'SD Memory Cards',
    src: '/desk/sdcards.svg',
    x: 91,
    y: 78,
    rotation: -10,
    widthVw: 8.42, // 115px at 1366px
    targetPx1366: 115,
    alt: '',
    showOnMobile: false,
    zIndex: 2,
  },
  {
    id: 'laptop',
    name: 'Laptop with Code',
    src: '/desk/laptop.svg',
    x: 54,
    y: 65, // top edge sits about 40px below the hero line at 45%
    rotation: -3,
    widthVw: 20.50, // 280px at 1366px
    targetPx1366: 280,
    alt: '',
    showOnMobile: true,
    mobileX: 50,
    mobileY: 79,
    mobileWidthVw: 50,
    mobileRotation: -2,
    zIndex: 4,
  },
];
