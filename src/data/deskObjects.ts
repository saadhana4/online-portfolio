export interface DeskObjectConfig {
  id: string;
  name: string;
  src: string;
  x: number; // percentage from left (0 - 100)
  y: number; // percentage from top (0 - 100)
  rotation: number; // rotation in degrees
  size: number; // base display width in px
  alt: string; // decorative desk objects use empty alt
  showOnMobile: boolean; // only 4 objects shown under 700px mobile
  zIndex?: number;
}

export const deskObjects: DeskObjectConfig[] = [
  {
    id: 'laptop',
    name: 'Laptop with Code',
    src: '/desk/laptop.svg',
    x: 50,
    y: 68,
    rotation: -1.5,
    size: 290,
    alt: '',
    showOnMobile: true,
    zIndex: 4,
  },
  {
    id: 'notebook',
    name: 'Spiral Notebook',
    src: '/desk/notebook.svg',
    x: 15,
    y: 62,
    rotation: 6,
    size: 200,
    alt: '',
    showOnMobile: true,
    zIndex: 2,
  },
  {
    id: 'plant',
    name: 'Potted Monstera Plant',
    src: '/desk/plant.svg',
    x: 12,
    y: 20,
    rotation: -5,
    size: 145,
    alt: '',
    showOnMobile: true,
    zIndex: 1,
  },
  {
    id: 'coffee-cup',
    name: 'Warm Ceramic Coffee Cup',
    src: '/desk/coffeecup.svg',
    x: 84,
    y: 22,
    rotation: 4,
    size: 135,
    alt: '',
    showOnMobile: true,
    zIndex: 3,
  },
  {
    id: 'pencil',
    name: 'Graphite Pencil',
    src: '/desk/pencil.svg',
    x: 28,
    y: 86,
    rotation: 22,
    size: 155,
    alt: '',
    showOnMobile: false,
    zIndex: 5,
  },
  {
    id: 'sticky-notes',
    name: 'Pastel Sticky Notes',
    src: '/desk/stickynotes.svg',
    x: 85,
    y: 52,
    rotation: -7,
    size: 140,
    alt: '',
    showOnMobile: false,
    zIndex: 2,
  },
  {
    id: 'webcam',
    name: 'Clip-on Webcam',
    src: '/desk/webcam.svg',
    x: 34,
    y: 15,
    rotation: 3,
    size: 120,
    alt: '',
    showOnMobile: false,
    zIndex: 1,
  },
  {
    id: 'headphones',
    name: 'Studio Headphones',
    src: '/desk/headphones.svg',
    x: 80,
    y: 78,
    rotation: -10,
    size: 175,
    alt: '',
    showOnMobile: false,
    zIndex: 3,
  },
];
