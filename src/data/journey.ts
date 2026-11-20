export interface JourneyStep {
  id: string;
  category: string;
  title: string;
  timeframe?: string;
  items: Array<{
    title: string;
    description?: string;
    details?: string[];
    badge?: string;
  }>;
}

export interface SkillCategory {
  name: string;
  skills: string[];
}

export const journeySteps: JourneyStep[] = [
  {
    id: 'education',
    category: 'Education',
    title: 'Academic Foundation',
    items: [
      {
        title: 'M.Tech CSE (Integrated)',
        description: 'Sri Krishna College of Engineering and Technology',
        details: ['Graduation: 2029', 'Focus: Software Engineering, AI/ML, System Design'],
        badge: 'Graduation 2029',
      },
      {
        title: 'Higher Secondary',
        description: 'SSVM World School',
        details: ['Graduated in 2024 with Computer Science'],
        badge: '2024',
      },
    ],
  },
  {
    id: 'internship',
    category: 'Internship',
    title: 'Industry Experience',
    items: [
      {
        title: 'QA Intern',
        description: 'Boyante Solutions (Summer)',
        details: [
          'Worked closely with the engineering and QA team',
          'Identified, reproduced, and systematically documented issues',
          'Built robust debugging, regression testing, and root-cause analysis skills',
        ],
        badge: 'Summer QA',
      },
    ],
  },
  {
    id: 'hackathons',
    category: 'Hackathons & Challenges',
    title: 'Competitive Building',
    items: [
      {
        title: 'PromptWars x Catalyst',
        description: 'CareNest — Elderly Care & Medication Management Platform',
        details: ['Scored 96.64 in AI code evaluation', 'Passcode-based shared care and adherence tracking'],
        badge: 'Score: 96.64',
      },
      {
        title: 'Amazon ML Challenge 2026',
        description: 'Machine Learning Competition Participant',
        details: ['Explored deep learning feature engineering and large-scale model optimization'],
        badge: 'Participant',
      },
      {
        title: 'VIT DevJams Hackathon',
        description: 'Intensive Hackathon Participant',
        details: ['Collaborated on fast-paced full-stack prototype development under tight deadlines'],
        badge: 'Participant',
      },
    ],
  },
  {
    id: 'campus',
    category: 'Campus',
    title: 'Leadership & Contributions',
    items: [
      {
        title: 'Technical Event Coordination',
        description: 'Campus Technical Organization',
        details: ['Organized and coordinated a technical event, driving student engagement and logistics'],
        badge: 'Organizer',
      },
    ],
  },
  {
    id: 'certifications',
    category: 'Certifications',
    title: 'Verified Learning',
    items: [
      {
        title: 'BCG X Forage Generative AI Job Simulation',
        description: 'Practical business use-cases and generative AI implementation strategies',
        badge: 'BCG X',
      },
      {
        title: 'Data Science & Analytics using Power BI',
        description: 'Future Interns — End-to-end data pipelines, DAX modeling, and interactive dashboards',
        badge: 'Power BI',
      },
      {
        title: 'AI Ethics and Social Challenges',
        description: 'Coursera — Algorithmic fairness, transparency, and societal impact of modern AI',
        badge: 'Coursera',
      },
    ],
  },
];

export const toolboxSkills: SkillCategory[] = [
  {
    name: 'Languages',
    skills: ['Java', 'Python', 'JavaScript', 'C', 'C++', 'SQL'],
  },
  {
    name: 'Web',
    skills: ['React', 'Spring Boot', 'Node.js', 'HTML', 'CSS', 'REST APIs'],
  },
  {
    name: 'AI/ML',
    skills: ['OpenCV', 'MediaPipe', 'Generative AI', 'Pandas', 'NumPy'],
  },
  {
    name: 'Databases',
    skills: ['PostgreSQL', 'MySQL'],
  },
  {
    name: 'Tools',
    skills: ['Git', 'GitHub', 'VS Code', 'Postman', 'Power BI', 'Jupyter'],
  },
];
