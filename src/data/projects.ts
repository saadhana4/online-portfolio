export interface Project {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  tags: string[];
  image: string;
  alt: string;
  highlight?: string;
}

export const projects: Project[] = [
  {
    id: 'carenest',
    title: 'CareNest',
    subtitle: 'Elderly Care & Medication Management Platform',
    summary:
      'Passcode-based shared access for elderly users, caretakers and family; medication schedules, adherence tracking, doctor appointments, email reminders for missed or upcoming doses. FastAPI. Scored 96.64 in the AI code evaluation.',
    tags: ['FastAPI', 'Python', 'Elderly Care', 'Adherence Tracking', 'Email Reminders'],
    image: '/projects/carenest.png',
    alt: 'CareNest elderly care and medication management dashboard interface',
    highlight: 'PromptWars x Catalyst Hackathon • 96.64 AI Score',
  },
  {
    id: 'wastewise',
    title: 'WasteWise',
    subtitle: 'Geospatial AI Waste Management Platform',
    summary:
      'Maps waste hotspots and supports collection planning. Municipal admin dashboard showing hotspots, severity, waste categories, vehicles and zones. FastAPI with PostgreSQL/PostGIS.',
    tags: ['FastAPI', 'PostgreSQL', 'PostGIS', 'Geospatial AI', 'Municipal Dashboard'],
    image: '/projects/wastewise.svg',
    alt: 'WasteWise geospatial AI hotspot mapping dashboard card',
    highlight: 'Geospatial Hotspots & Fleet Planning',
  },
  {
    id: 'ai-calculator',
    title: 'AI Virtual Calculator',
    subtitle: 'MediaPipe Touchless Air-Gesture Calculator',
    summary:
      'Touchless calculator using real-time hand tracking and gesture recognition: gesture-controlled arithmetic, dynamic theme switching, finger-landmark detection.',
    tags: ['MediaPipe', 'OpenCV', 'Computer Vision', 'Python', 'Gesture Recognition'],
    image: '/projects/calculator.png',
    alt: 'AI Virtual Calculator air-gesture interface with MediaPipe hand landmark tracking and virtual keypad',
    highlight: 'Touchless Air-Gesture Math & Vision',
  },
  {
    id: 'emergency-health-id',
    title: 'Digital Case-Taking & Emergency Health ID',
    subtitle: 'Biometric Emergency Health Identity System',
    summary:
      'Flask healthcare app: fingerprint and face-recognition patient identification, doctor consent workflows with time-limited emergency access, audit logging, Twilio SMS alerts, Ayush intake mapped to NAMASTE and ICD-11 TM2.',
    tags: ['Flask', 'Biometrics', 'Twilio SMS', 'ICD-11 TM2', 'NAMASTE', 'Audit Logging'],
    image: '/projects/casettaking.svg',
    alt: 'Digital Case-Taking and Emergency Health ID System with consent workflow',
    highlight: 'Biometric Access & Ayush Intake Standards',
  },
  {
    id: 'aetheria',
    title: 'Aetheria',
    subtitle: 'Interactive Beauty & Lifestyle Website',
    summary:
      'Cinematic scroll-driven site in Next.js and React with frame-sequence scroll animation and a preloader.',
    tags: ['Next.js', 'React', 'Frame Sequences', 'Scroll-Driven UI', 'Web Animation'],
    image: '/projects/aetheria.svg',
    alt: 'Aetheria cinematic film sequence and lifestyle experience card',
    highlight: 'Frame-Sequence Scroll & Interactive Preloader',
  },
  {
    id: 'powerbi-sales',
    title: 'Power BI Business Sales Dashboard',
    subtitle: 'Interactive Analytics & Data Preparation',
    summary:
      'Interactive sales dashboard, data prep and visualization.',
    tags: ['Power BI', 'DAX', 'Data Preparation', 'Business Analytics', 'Data Viz'],
    image: '/projects/powerbi.png',
    alt: 'Power BI business sales dashboard with multi-year trends, KPI metrics, geographic maps, and regional breakdowns',
    highlight: 'Interactive KPI Modeling & Visuals',
  },
];
