import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { DeskHome } from './components/DeskHome';
import { WorkPage } from './components/WorkPage';
import { JourneyPage } from './components/JourneyPage';
import { PhoneModal } from './components/PhoneModal';
import './App.css';

type RouteType = '' | 'work' | 'journey' | 'about' | 'contact';

export const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<RouteType>('');

  // Parse hash string to RouteType
  const parseHash = (hash: string): RouteType => {
    const clean = hash.replace(/^#\/?/, '').trim().toLowerCase();
    if (clean === 'work') return 'work';
    if (clean === 'journey') return 'journey';
    if (clean === 'about') return 'about';
    if (clean === 'contact') return 'contact';
    return '';
  };

  // Synchronize hash with state and document title
  useEffect(() => {
    const handleHashChange = () => {
      const route = parseHash(window.location.hash);
      setCurrentRoute(route);

      // Update document title dynamically
      switch (route) {
        case 'work':
          document.title = 'Work & Projects — Saadhana Karthikeyan';
          break;
        case 'journey':
          document.title = 'Journey & Experience — Saadhana Karthikeyan';
          break;
        case 'about':
          document.title = 'About Saadhana — Notes App';
          break;
        case 'contact':
          document.title = 'Contact Saadhana — Mail App';
          break;
        default:
          document.title = 'Saadhana Karthikeyan — Software Developer Portfolio';
          break;
      }
    };

    // Initialize on mount
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = useCallback((route: string) => {
    window.location.hash = route ? `#/${route}` : '#/';
  }, []);

  return (
    <div className="app-container">
      {/* Accessible Skip Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Persistent Scrapbook Header */}
      <Header currentRoute={currentRoute} onNavigate={navigateTo} />

      {/* Main Content Area */}
      <main id="main-content" className="main-content" tabIndex={-1}>
        {/* Route: Home Desk view (also serves as background for About & Contact phone overlays) */}
        {(currentRoute === '' || currentRoute === 'about' || currentRoute === 'contact') && (
          <DeskHome onNavigate={navigateTo} />
        )}

        {/* Route: Work Project Slider */}
        {currentRoute === 'work' && <WorkPage onBack={() => navigateTo('')} />}

        {/* Route: Journey Timeline */}
        {currentRoute === 'journey' && <JourneyPage onBack={() => navigateTo('')} />}

        {/* Route: About or Contact (Phone Overlay rising from bottom with dimmed desk) */}
        {(currentRoute === 'about' || currentRoute === 'contact') && (
          <PhoneModal
            view={currentRoute}
            onClose={() => navigateTo('')}
            onSwitchView={(newView) => navigateTo(newView)}
          />
        )}
      </main>
    </div>
  );
};

export default App;
