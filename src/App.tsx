import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { DeskHome } from './components/DeskHome';
import { WorkPage } from './components/WorkPage';
import { JourneyPage } from './components/JourneyPage';
import { PhoneModal } from './components/PhoneModal';
import './App.css';

type RouteType = '' | 'work' | 'journey' | 'about' | 'contact';

// Parse hash string to RouteType
const parseHash = (hash: string): RouteType => {
  const clean = hash.replace(/^#\/?/, '').trim().toLowerCase();
  if (clean === 'work') return 'work';
  if (clean === 'journey') return 'journey';
  if (clean === 'about') return 'about';
  if (clean === 'contact') return 'contact';
  return '';
};

export const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<RouteType>(() => {
    if (typeof window !== 'undefined') {
      return parseHash(window.location.hash);
    }
    return '';
  });
  const [isDriftingAway, setIsDriftingAway] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const r = parseHash(window.location.hash);
      return r === 'work' || r === 'journey';
    }
    return false;
  });
  const [isTransitioningRoute, setIsTransitioningRoute] = useState<boolean>(false);

  // Active phone modal state (persists during reverse closing sequence)
  const [activePhoneView, setActivePhoneView] = useState<'about' | 'contact' | null>(() => {
    if (typeof window !== 'undefined') {
      const r = parseHash(window.location.hash);
      return r === 'about' || r === 'contact' ? r : null;
    }
    return null;
  });
  const [isPhoneClosing, setIsPhoneClosing] = useState<boolean>(false);
  const [isDirectLoad, setIsDirectLoad] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const r = parseHash(window.location.hash);
      return r === 'about' || r === 'contact';
    }
    return false;
  });
  const lastClosedPhoneViewRef = useRef<'about' | 'contact'>('contact');

  const isInitialMount = useRef<boolean>(true);
  const prevRouteRef = useRef<RouteType>(
    typeof window !== 'undefined' ? parseHash(window.location.hash) : ''
  );

  // Synchronize hash with state, document title, and home-route class
  useEffect(() => {
    const handleHashChange = () => {
      const route = parseHash(window.location.hash);
      const prevRoute = prevRouteRef.current;
      prevRouteRef.current = route;
      setCurrentRoute(route);

      if (route === 'contact' || route === 'about') {
        setActivePhoneView(route);
        setIsPhoneClosing(false);
        lastClosedPhoneViewRef.current = route;
      } else if (route === '' || route === 'work' || route === 'journey') {
        // If navigating away while phone is open (e.g. browser back button or back pill)
        setActivePhoneView((prev) => {
          if (prev) {
            setIsPhoneClosing(true);
            return prev; // keep mounted until reverse closing finishes
          }
          return null;
        });
      }

      if (!isInitialMount.current) {
        // Any navigation after initial mount is not a direct load
        setIsDirectLoad(false);

        if ((route === 'work' || route === 'journey') && prevRoute === '') {
          setIsDriftingAway(true);
          setIsTransitioningRoute(true);
          setTimeout(() => {
            setIsTransitioningRoute(false);
          }, 900);
        } else if (route === '') {
          setIsDriftingAway(false);
        }
      } else {
        isInitialMount.current = false;
        if (route === 'work' || route === 'journey') {
          setIsDriftingAway(true);
        }
      }

      // On home route only, set html/body overflow: hidden so desk never scrolls
      if (route === '') {
        document.documentElement.classList.add('home-route');
        document.body.classList.add('home-route');
      } else {
        document.documentElement.classList.remove('home-route');
        document.body.classList.remove('home-route');
      }

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

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      document.documentElement.classList.remove('home-route');
      document.body.classList.remove('home-route');
    };
  }, []);

  const navigateTo = useCallback((route: string) => {
    window.location.hash = route ? `#/${route}` : '#/';
  }, []);

  const handlePhoneCloseComplete = useCallback(() => {
    setActivePhoneView(null);
    setIsPhoneClosing(false);
    const viewToFocus = lastClosedPhoneViewRef.current;
    if (window.location.hash !== '#/' && window.location.hash !== '') {
      window.location.hash = '#/';
    }
    // Return focus to Contact or About pill
    requestAnimationFrame(() => {
      const targetSelector = viewToFocus === 'about' ? '.about-pill' : '.contact-pill';
      const targetPill = document.querySelector<HTMLElement>(targetSelector);
      targetPill?.focus();
    });
  }, []);

  const handleBeginDrift = useCallback((target: 'home' | 'away') => {
    if (target === 'away') {
      setIsDriftingAway(true);
      setIsTransitioningRoute(true);
      setTimeout(() => {
        setIsTransitioningRoute(false);
      }, 900);
    } else {
      setIsDriftingAway(false);
    }
  }, []);

  const isPhoneOpen = activePhoneView !== null;

  return (
    <div className="app-container">
      {/* Accessible Skip Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Persistent Scrapbook Header */}
      <Header
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        onBeginDrift={handleBeginDrift}
      />

      {/* Main Content Area */}
      <main id="main-content" className="main-content" tabIndex={-1}>
        {/* 1) PERSISTENT DESK STAGE: Mounted ONCE at app level */}
        <DeskHome
          currentRoute={currentRoute}
          isDriftingAwayTrigger={isDriftingAway}
          isPhoneOpen={isPhoneOpen}
        />

        {/* Route: Work Project Slider */}
        {currentRoute === 'work' && (
          <div className={`route-content-container ${isTransitioningRoute ? 'route-content-entering' : ''}`}>
            <WorkPage onBack={() => navigateTo('')} />
          </div>
        )}

        {/* Route: Journey Timeline */}
        {currentRoute === 'journey' && (
          <div className={`route-content-container ${isTransitioningRoute ? 'route-content-entering' : ''}`}>
            <JourneyPage onBack={() => navigateTo('')} />
          </div>
        )}

        {/* Route: About or Contact (Phone Overlay with zoom FLIP transition) */}
        {activePhoneView && (
          <PhoneModal
            view={activePhoneView}
            isDirectLoad={isDirectLoad}
            isClosing={isPhoneClosing}
            onClose={() => navigateTo('')}
            onCloseComplete={handlePhoneCloseComplete}
            onSwitchView={(newView) => navigateTo(newView)}
          />
        )}
      </main>
    </div>
  );
};

export default App;
