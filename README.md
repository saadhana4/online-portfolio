# Saadhana Karthikeyan — Portfolio 🌿

> A playful, handmade "messy desk" scrapbook portfolio for **Saadhana Karthikeyan**. Designed to feel tactile, personal, and authentic — not like a generic tech template.

Built with **React 19**, **TypeScript**, **Vite**, and plain **CSS (CSS variables)**. Zero heavy animation or 3D libraries (no GSAP, no Three.js).

---

## 🎨 Visual System & Aesthetic

- **Paper Canvas**: Sage-tinted warm background (`#E9EBDD`) with an inline SVG `feTurbulence` paper-grain texture.
- **Palette**:
  - Ink: `#1F2A24`
  - Sage Paper: `#E9EBDD` / Light Paper: `#FAFBF7`
  - Butter-Yellow Pills: `#F3E3A3`
  - Terracotta Accent: `#C8553D`
- **Typography**:
  - Headings & Accents: [Caveat](https://fonts.google.com/specimen/Caveat) (Google Fonts, handwritten cursive)
  - Body Text: [Nunito](https://fonts.google.com/specimen/Nunito) (Google Fonts, clean geometric humanist sans-serif)
- **The Desk**:
  - Scattered desk objects with slight natural rotations, rough torn-paper white edges (SVG `feDisplacementMap` displacement filter), and soft drop shadows.
  - Desk objects: **Laptop**, **Notebook**, **Pencil**, **Sticky Notes**, **Coffee Cup**, **Webcam**, **Headphones**, and **Potted Plant**.
  - Configurable via `src/data/deskObjects.ts`.
- **Hero Banner**:
  - *"Hey, I'm Saadhana and I engineer ideas into impact."*
  - Features signature handwritten terracotta typography accentuating *"impact."*.
- **Doodle Mascot**:
  - Tiny hand-drawn laptop-with-eyes character (`byte 🌱`) at bottom-left that responds to clicks and keypresses with playful speech bubbles.

---

## 🧭 Pages & Architecture

Hash routing is used (`#/work`, `#/journey`, `#/about`, `#/contact`, and `#/` for Desk) to guarantee flawless static hosting on Vercel or GitHub Pages with zero rewrite configurations needed.

### 1. Work (`#/work`)
- Single-project interactive showcase in a wobbly hand-drawn polaroid frame with washi tape accents.
- Dot pagination, Previous / Next controls, **Arrow-key navigation** (`←` / `→`), and **touch swipe gestures** on mobile.
- Features all 6 flagship projects with illustrated scrapbook cards:
  1. **CareNest** — Elderly Care & Medication Management Platform (*FastAPI, PromptWars x Catalyst Hackathon, 96.64 AI evaluation score*).
  2. **WasteWise** — Geospatial AI Waste Management Platform (*FastAPI, PostgreSQL, PostGIS*).
  3. **AI Virtual Calculator** — Touchless air-gesture calculator (*MediaPipe, OpenCV, Python*).
  4. **Digital Case-Taking & Emergency Health ID System** — Biometric emergency healthcare identity (*Flask, Twilio SMS, NAMASTE, ICD-11 TM2*).
  5. **Aetheria** — Interactive beauty & lifestyle experience (*Next.js, React, frame-sequence scroll animation*).
  6. **Power BI Business Sales Dashboard** — Interactive sales analytics (*Power BI, DAX, data modeling*).

### 2. Journey (`#/journey`)
- Vertical timeline replacing generic "Process" pages.
- **Scroll Spy**: As you scroll through the milestones, the current active step is circled with a hand-drawn red ring in full contrast.
- Inactive steps are softly dimmed while strictly maintaining WCAG AA compliant contrast ($\ge 4.5:1$).
- Milestones covered:
  - **Education**: M.Tech CSE (Integrated), SKCET (expected 2029) & SSVM World School (2024).
  - **Internship**: QA Intern at Boyante Solutions.
  - **Hackathons**: PromptWars x Catalyst (CareNest), Amazon ML Challenge 2026, VIT DevJams.
  - **Campus**: SKCET official website redesign & technical event coordination.
  - **Certifications**: BCG X Generative AI Simulation, Power BI Data Science (Future Interns), AI Ethics (Coursera).
  - **Toolbox**: Categorized technical stack spanning Languages, Web, AI/ML, Databases, and Developer Tools.

### 3. About (`#/about`)
- The desk dims and an illustrated retro mobile phone rises from the bottom with a torn paper edge and subtle screen scratch texture.
- Displays a **Notes app** screen with real, selectable HTML text:
  - **Name**: Saadhana Karthikeyan
  - **Studying**: M.Tech CSE (Integrated), SKCET Coimbatore
  - **Good at**: Computer vision, backend APIs, full-stack apps
  - **Lately building**: Healthcare tech and AI-powered apps
  - **Interested in**: Software engineering, full stack, backend, healthcare technology, AI/ML
  - **Languages**: English, Tamil, Hindi
  - **Based in**: Coimbatore, Tamil Nadu
  - Photo slot with custom polaroid illustration.

### 4. Contact (`#/contact`)
- The phone switches to an illustrated **Mail "New Message"** screen:
  - **To**: `saadhanak18@gmail.com` (fixed recipient with quick one-click copy button).
  - **From**: Optional sender name/email.
  - **Topic**: Select dropdown (*Internship*, *Collaboration*, *Hackathon team*, *Just saying hi*).
  - **Message**: Note body.
  - **Send**: Automatically composes a formatted `mailto:` link and launches the default email client (zero backend dependency).
  - Quick action buttons below phone: **Download Resume** (`/Saadhana_Karthikeyan_Resume.pdf`), **LinkedIn**, and **GitHub**.
  - *(Strictly adheres to privacy rules: no phone number displayed).*

---

## ♿ Accessibility & Performance

- **Semantic HTML**: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, with one logical `<h1>` per page view.
- **Keyboard Navigation**:
  - Accessible Skip-to-content link (`.skip-link`).
  - High-contrast `:focus-visible` outline rings on all interactive elements.
  - `ArrowLeft` / `ArrowRight` project switching in Work slider.
  - `Escape` key closes the phone overlay and returns focus to the previous active element.
  - Focus trapping within modal dialogs.
- **Color Contrast**: Every text element meets or exceeds WCAG AA contrast standards ($\ge 4.5:1$), including dimmed journey states (`#4A584F` on sage paper is $\approx 6.2:1$).
- **Reduced Motion**: Full support for `prefers-reduced-motion: reduce`. Disables CSS wobble animations, transforms, modal rise transitions, and freezes cycling hero text.
- **Performance & Mobile**:
  - Target Lighthouse 90+ on mobile.
  - Lightweight vector SVGs under 150 KB.
  - Responsive layout tested from 360px up to 4K displays.
  - Under 700px, automatically reduces desk clutter to only 4 priority objects.
  - Zero horizontal overflow at 360px.

---

## 🛠️ Local Development

### Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm / yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/saadhana4/online-portfolio.git
cd online-portfolio

# Install dependencies
npm install

# Start local development server
npm run dev
```

### Production Build & Preview
```bash
# Build TypeScript and Vite bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🚀 How to Deploy to Vercel

Since this project uses **hash routing** (`#/work`, `#/journey`, etc.), Vercel can serve it directly as a standard static site without requiring complex rewrite rules or serverless functions!

### Option 1: Deploy via Vercel Web Dashboard (Recommended)

1. Push your repository to GitHub:
   ```bash
   git remote add origin https://github.com/saadhana4/online-portfolio.git
   git branch -M main
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com/) and sign in with your GitHub account.
3. Click **"Add New..."** → **"Project"**.
4. Import your **`online-portfolio`** repository.
5. In the configuration settings:
   - **Framework Preset**: `Vite` (Vercel detects this automatically).
   - **Root Directory**: `./` (leave default).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click **"Deploy"**. Your portfolio will be live in seconds with an SSL certificate and global CDN!

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy directly from terminal
vercel

# Deploy to production
vercel --prod
```

---

## 📄 License
Created with ❤️ by **Saadhana Karthikeyan**. Free to explore and reference.
