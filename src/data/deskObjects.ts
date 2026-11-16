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
    name: 'Watercolor Coffee Cup',
    src: '/desk/coffee-cup-saucer.webp',
    x: 12,
    y: 22,
    rotation: -4,
    widthVw: 10.5, // ~143px wide x 126px tall at 1366px
    targetPx1366: 143,
    alt: 'Ceramic coffee cup on saucer with dark roast coffee',
    showOnMobile: true,
    mobileX: 20,
    mobileY: 22,
    mobileWidthVw: 22,
    mobileRotation: -4,
    zIndex: 2,
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
    name: 'Vintage Pocket Watch',
    src: '/desk/pocket-watch.webp',
    x: 56,
    y: 17,
    rotation: 5,
    widthVw: 7.5, // ~102px wide x 134px tall at 1366px
    targetPx1366: 102,
    alt: 'Vintage antique brass pocket watch with Roman numerals',
    showOnMobile: true,
    mobileX: 68,
    mobileY: 20,
    mobileWidthVw: 16,
    mobileRotation: 5,
    zIndex: 2,
  },
  {
    id: 'sticky-notes',
    name: 'Vintage Books',
    src: '/desk/books.webp',
    x: 79.5,
    y: 29.5,
    rotation: 5,
    widthVw: 10.5, // ~143px at 1366px
    targetPx1366: 143,
    alt: 'Stack of vintage leather-bound books',
    showOnMobile: false,
    zIndex: 2,
  },
  {
    id: 'tape-roll',
    name: 'Vintage Magnifying Glass',
    src: '/desk/magnifying-glass.webp',
    x: 21,
    y: 43,
    rotation: 5,
    widthVw: 6.8, // ~93px wide x 144px tall at 1366px
    targetPx1366: 93,
    alt: 'Vintage brass magnifying glass with turned wooden handle',
    showOnMobile: false,
    zIndex: 2,
  },
  {
    id: 'plant',
    name: 'Potted Snake Plant',
    src: '/desk/snake-plant.webp',
    x: 6,
    y: 50,
    rotation: 0,
    widthVw: 7.5, // ~102px wide x 110px tall at 1366px
    targetPx1366: 102,
    alt: 'Lush snake plant in a glazed ceramic pot',
    showOnMobile: true,
    mobileX: 18,
    mobileY: 58,
    mobileWidthVw: 18,
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
    name: 'Antique Brass Scissors',
    src: '/desk/antique-scissors.webp',
    x: 92,
    y: 55,
    rotation: 10,
    widthVw: 8.5, // ~116px wide x 143px tall at 1366px
    targetPx1366: 116,
    alt: 'Antique engraved brass scissors',
    showOnMobile: false,
    zIndex: 2,
  },
  {
    id: 'sd-cards',
    name: 'Vintage Hourglass',
    src: '/desk/hourglass.webp',
    x: 91,
    y: 78,
    rotation: -10,
    widthVw: 6.2, // ~85px wide x 129px tall at 1366px
    targetPx1366: 85,
    alt: 'Vintage wooden and brass hourglass with sand',
    showOnMobile: false,
    zIndex: 2,
  },
  {
    id: 'laptop',
    name: 'Watercolor Laptop',
    src: '/desk/watercolor-laptop.webp',
    x: 54,
    y: 72, // sits comfortably below the hero line
    rotation: -2,
    widthVw: 17.5, // ~239px wide x 215px tall at 1366px
    targetPx1366: 239,
    alt: 'Watercolor sketch of an open modern laptop',
    showOnMobile: true,
    mobileX: 50,
    mobileY: 77,
    mobileWidthVw: 48,
    mobileRotation: -2,
    zIndex: 4,
  },
];
