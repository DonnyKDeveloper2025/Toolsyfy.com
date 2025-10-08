// Add adsbygoogle to the window interface to fix TypeScript error.
// FIX: Added lucide to global window declaration
declare global {
  interface Window {
    adsbygoogle: any[];
    firebase: any;
    lucide: any;
  }
}

import React, { useState, useMemo, useEffect, createRef, useRef, lazy, Suspense, useCallback, useLayoutEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ToolCard } from './ToolCard';
import { FeaturedTools } from './FeaturedTools';
import { INFO_CONTENT } from '../constants/infoContent';
import { Category } from '../types';
import { CookieConsentBanner } from './CookieConsentBanner';
import { ScrollToTopButton } from './ScrollToTopButton';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { SearchBar } from './SearchBar';
import { AnnouncementBanner } from './AnnouncementBanner';
import { Spinner } from './Spinner';
import { AffiliateSection } from './AffiliateSection';
import Fuse from 'fuse.js';

// Changed all lazy-loaded modals to use default exports to fix type inference issues.
const InfoModal = lazy(() => import('./InfoModal'));
const ToolkitModal = lazy(() => import('./ToolkitModal'));
const CmdKModal = lazy(() => import('./CmdKModal'));
const SuggestionModal = lazy(() => import('./SuggestionModal'));
const ReportModal = lazy(() => import('./ReportModal'));
const LoginModal = lazy(() => import('./LoginModal'));
const AdminPanelModal = lazy(() => import('./AdminPanelModal'));
const EditInfoModal = lazy(() => import('./EditInfoModal'));
const SiteSettingsModal = lazy(() => import('./SiteSettingsModal'));
const AuthorSettingsModal = lazy(() => import('./AuthorSettingsModal'));
const LayoutSettingsModal = lazy(() => import('./LayoutSettingsModal'));
const FirebaseConfigModal = lazy(() => import('./FirebaseConfigModal'));
const ToolModal = lazy(() => import('./ToolModal'));
const ToolInstructionModal = lazy(() => import('./ToolInstructionModal'));


// NOTE: Added and exported missing SwitchToggle component to fix compilation errors.
export const SwitchToggle = ({ label, checked, onChange, uniqueId }) => (
    <div className="flex items-center gap-2 text-sm" title={label}>
        <label htmlFor={uniqueId} className="font-medium text-muted cursor-pointer flex-grow truncate">{label}</label>
        <div className="relative inline-block w-10 flex-shrink-0 align-middle select-none transition duration-200 ease-in">
            <input 
                type="checkbox" 
                name={uniqueId} 
                id={uniqueId} 
                checked={checked} 
                onChange={(e) => onChange(e.target.checked)} 
                className={`toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out ${checked ? 'right-0 border-brand-primary' : 'left-0 border-border'}`}
            />
            <label 
                htmlFor={uniqueId} 
                className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors ${checked ? 'bg-brand-primary' : 'bg-slate-300'}`}
            ></label>
        </div>
    </div>
);


const ToastComponent = ({ id, message, type, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(id);
        }, 5000);
        return () => clearTimeout(timer);
    }, [id, onDismiss]);

    const baseClasses = "flex items-center w-full max-w-xs p-4 my-2 text-muted bg-card rounded-lg shadow";
    const typeClasses = {
        success: "bg-green-50 text-green-800",
        error: "bg-red-50 text-red-800",
    };
    const iconClasses = {
        success: "w-5 h-5 text-green-500 bg-green-100 rounded-lg",
        error: "w-5 h-5 text-red-500 bg-red-100 rounded-lg",
    };
    
    const SuccessIcon = () => <svg className={iconClasses.success} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/></svg>;
    const ErrorIcon = () => <svg className={iconClasses.error} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"/></svg>;

    return (
        <div className={`${baseClasses} ${typeClasses[type]}`} role="alert">
            <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8">
                {type === 'success' ? <SuccessIcon /> : <ErrorIcon />}
            </div>
            <div className="ms-3 text-sm font-normal">{message}</div>
            <button type="button" onClick={() => onDismiss(id)} className="ms-auto -mx-1.5 -my-1.5 bg-card text-muted hover:text-foreground rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-secondary inline-flex items-center justify-center h-8 w-8" aria-label="Close">
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/></svg>
            </button>
        </div>
    );
};

const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const defaultAuthorImageUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128' fill='%239AA6B2'%3E%3Cpath d='M64 0C28.7 0 0 28.7 0 64s28.7 64 64 64 64-28.7 64-64S99.3 0 64 0zm0 18c12.1 0 22 9.9 22 22s-9.9 22-22 22-22-9.9-22-22S51.9 18 64 18zm0 88.5c-19.4 0-36.2-9.3-46.5-23.4 1-15.4 15.6-26.9 30.9-29.3 4.2.8 8.6 1.3 13.2 1.3 4.5 0 8.9-.5 13.2-1.3 15.3 2.4 29.9 13.9 30.9 29.3-10.3 14.1-27.1 23.4-46.5 23.4z'/%3E%3C/svg%3E";

export default function App() {
  const ADMIN_EMAIL = 'admin@toolsyfy.com';

  const [baseTools, setBaseTools] = useState([]);
  const [isLoadingTools, setIsLoadingTools] = useState(true);
  const [userToolOverrides, setUserToolOverrides] = useLocalStorage('toolsyfy_tool_overrides', {});
  const [favorites, setFavorites] = useLocalStorage('toolsyfy_favorites', []);
  const [infoContents, setInfoContents] = useLocalStorage('toolsyfy_info_content', INFO_CONTENT);
  const [siteSettings, setSiteSettings] = useLocalStorage('toolsyfy_site_settings', {
      siteTitle: 'Toolsyfy',
      metaDescription: '',
      metaKeywords: '',
      adsenseId: '',
      adSlotIdMain: '',
      adSlotIdToolPage: '',
      adSlotIdInFeed: '',
  });
  const [themeSettings, setThemeSettings] = useLocalStorage('toolsyfy_theme_settings', {
      faviconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2300D1FF' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' /%3E%3C/svg%3E",
  });
   const [authorSettings, setAuthorSettings] = useLocalStorage('toolsyfy_author_settings', {
      authorName: 'Donny K',
      authorBio: 'Builds tools that simplify your life ✨\nSharing tips and tools to boost productivity 🚀\nHelping you make the most of your digital world 💡',
      authorImageUrl: defaultAuthorImageUrl,
      buyMeACoffeeUrl: 'https://buymeacoffee.com/Donnyk2025',
      twitterUrl: '#',
      githubUrl: '#',
      footerText: '© {year} Toolsyfy. All Rights Reserved.',
  });
  const [layoutSettings, setLayoutSettings] = useLocalStorage('toolsyfy_layout_settings', {
      showToolOfTheDay: true,
      showFeaturedTools: true,
      customToolOfTheDay: '',
      customFeaturedTools: [],
      showAffiliateSection: true,
  });
   const [firebaseSettings, setFirebaseSettings] = useLocalStorage('toolsyfy_firebase_config', { apiKey: "YOUR_API_KEY", authDomain: "", projectId: "", storageBucket: "", messagingSenderId: "", appId: "" });
  const [cookieConsent, setCookieConsent] = useLocalStorage('toolsyfy_cookie_consent', null);
  const [searchHistory, setSearchHistory] = useLocalStorage('toolsyfy_search_history', {});
  const [announcementBanner, setAnnouncementBanner] = useLocalStorage('toolsyfy_announcement_banner', {
    text: '',
    enabled: false,
  });

  // States for new universal toolbar features
  const [reports, setReports] = useLocalStorage('toolsyfy_user_reports', []);
  const [suggestions, setSuggestions] = useLocalStorage('toolsyfy_user_suggestions', []);
  const [toolInstructions, setToolInstructions] = useLocalStorage('toolsyfy_tool_instructions', {});
  const [analyticsEvents, setAnalyticsEvents] = useLocalStorage('toolsyfy_analytics_events', []);
  const [affiliates, setAffiliates] = useLocalStorage('toolsyfy_affiliates', []);
  const [changelog, setChangelog] = useLocalStorage('toolsyfy_changelog', []);


  // New state for tool status scanning
  const [toolStatuses, setToolStatuses] = useLocalStorage('toolsyfy_tool_statuses', {});
  const [lastScan, setLastScan] = useLocalStorage('toolsyfy_last_scan', null);
  const [isScanning, setIsScanning] = useState(false);
  const [siteConfig, setSiteConfig] = useLocalStorage('toolsyfy_site_config', null);
  
  const [modalState, setModalState] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  
  // Search state management with debouncing
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // This will be the debounced value

  const [activeCategory, setActiveCategory] = useState('all');
  const [isCookieBannerVisible, setIsCookieBannerVisible] = useState(false);
  const [highlightedTool, setHighlightedTool] = useState(null);
  const toolRefs = useRef({});
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Data migration effect to update the author image for existing users
  useEffect(() => {
    const oldImageUrls = [
        'https://i.postimg.cc/htbhNVC0/In_Shot_20250929_085347092.jpg',
        'https://i.postimg.cc/5yFf0J5N/profile-picture-hq.jpg',
    ];

    if (
      !authorSettings.authorImageUrl || 
      oldImageUrls.includes(authorSettings.authorImageUrl) || 
      authorSettings.authorImageUrl.startsWith('https://via.placeholder.com')
    ) {
        if (authorSettings.authorImageUrl !== defaultAuthorImageUrl) {
            setAuthorSettings(prev => ({
                ...prev,
                authorImageUrl: defaultAuthorImageUrl
            }));
        }
    }
  }, [authorSettings.authorImageUrl, setAuthorSettings]);

  const tools = useMemo(() => {
    return baseTools.map(tool => ({
      ...tool,
      ...(userToolOverrides[tool.name] || {}),
    })).sort((a,b) => a.name.localeCompare(b.name));
  }, [baseTools, userToolOverrides]);

  // FIX: Removed incorrect 'as Category[]' cast. Object.values(Category) returns a string array, which is the correct type.
  const categories = useMemo(() => (Object.values(Category)).sort((a, b) => a.localeCompare(b)), []);
  const favoriteTools = useMemo(() => tools.filter(tool => favorites.includes(tool.name)), [tools, favorites]);

  const filteredTools = useMemo(() => {
    let categoryFiltered = tools;
    if (activeCategory === 'favorites') {
      categoryFiltered = favoriteTools;
    } else if (activeCategory !== 'all') {
      categoryFiltered = tools.filter(tool => tool.category === activeCategory);
    }
    
    if (!searchQuery.trim()) {
        return categoryFiltered;
    }

    // Use Fuse.js for fuzzy search
    const fuse = new Fuse(categoryFiltered, {
        keys: ['name', 'description', 'category', 'tags'],
        includeScore: true,
        threshold: 0.4, // Adjust for more or less fuzziness
    });
    
    return fuse.search(searchQuery).map(result => result.item);
  }, [tools, activeCategory, searchQuery, favoriteTools]);

  useLayoutEffect(() => {
    // FIX: Check if window.lucide exists before calling createIcons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });

  useEffect(() => {
    // Fetch global site config on initial load
    if (!siteConfig) {
        fetch('./data/site-config.json')
            .then(res => res.json())
            .then((data) => {
                setSiteConfig(data);
                setSiteSettings(prev => ({
                    ...prev,
                    siteTitle: data.defaultMeta.title,
                    metaDescription: data.defaultMeta.description,
                    metaKeywords: data.defaultMeta.keywords,
                }));

                // Initialize announcement banner from site-config if not already in localStorage
                const storedBanner = localStorage.getItem('toolsyfy_announcement_banner');
                if (!storedBanner && data.announcementBanner) {
                    setAnnouncementBanner(data.announcementBanner);
                }
            })
            .catch(err => console.error("Failed to load site config", err));
    }
  }, [siteConfig, setSiteConfig, setSiteSettings, setAnnouncementBanner]);

  useEffect(() => {
    async function fetchTools() {
      // 1. Try to load from localStorage cache first
      try {
        const cachedTools = localStorage.getItem("toolsyfy_base_tools");
        if (cachedTools) {
          setBaseTools(JSON.parse(cachedTools));
          setIsLoadingTools(false);
        }
      } catch (e) {
        console.warn("Could not read tools from localStorage cache.", e);
      }

      // 2. Fetch from the API endpoint to get fresh data
      try {
        const localRes = await fetch('./tools.json');
        if (localRes.ok) {
            const localData = await localRes.json();
            setBaseTools(localData);
            localStorage.setItem("toolsyfy_base_tools", JSON.stringify(localData));
        }
      } catch (err) {
        console.warn("⚠️ Using cached tool data due to network issue", err);
      } finally {
        if (isLoadingTools) setIsLoadingTools(false); // Ensure loading is off even if only cache is used
      }
    }

    fetchTools();
    
    // Fetch affiliates if local storage is empty
    if (affiliates.length === 0) {
        fetch('./data/affiliates.json')
            .then(res => res.json())
            .then(data => setAffiliates(data))
            .catch(err => console.error("Failed to load affiliates.json", err));
    }
    
    // Fetch changelog if local storage is empty
    if (changelog.length === 0) {
        fetch('./data/changelog.json')
            .then(res => res.json())
            .then(data => setChangelog(data))
            .catch(err => console.error("Failed to load changelog.json", err));
    }
  }, [setBaseTools, affiliates.length, setAffiliates, changelog.length, setChangelog]);
  
  const addToast = useCallback((message, type = 'success') => {
      setToasts(prev => [...prev, { id: Date.now(), message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const handleCloseModal = useCallback(() => setModalState(null), []);

  useEffect(() => {
    const setupAuthListener = () => {
        if (window.firebase?.apps?.length) {
            const unsubscribe = window.firebase.auth().onAuthStateChanged(async (currentUser) => {
                setUser(currentUser);
                setIsAdmin(currentUser?.email === ADMIN_EMAIL);
                setAuthInitialized(true);

                if (currentUser) {
                    try {
                        const idToken = await currentUser.getIdToken();
                        const userSession = {
                            uid: currentUser.uid,
                            email: currentUser.email,
                            displayName: currentUser.displayName,
                            photoURL: currentUser.photoURL,
                            token: idToken,
                        };
                        localStorage.setItem('toolsyfy_user', JSON.stringify(userSession));
                        
                        // Sync favorites with Firestore
                        const userDocRef = window.firebase.firestore().collection('users').doc(currentUser.uid);
                        const userDoc = await userDocRef.get();
                        
                        const localFavorites = JSON.parse(localStorage.getItem('toolsyfy_favorites') || '[]');

                        if (userDoc.exists) {
                            // User exists, merge favorites, giving Firestore precedence
                            const firestoreFavorites = userDoc.data()?.favorites || [];
                            const mergedFavorites = [...new Set([...localFavorites, ...firestoreFavorites])];
                            
                            setFavorites(mergedFavorites); // Update local state & localStorage
                            
                            if (mergedFavorites.length > firestoreFavorites.length) {
                                await userDocRef.set({ favorites: mergedFavorites }, { merge: true });
                            }
                        } else {
                            // New user, sync local (guest) favorites up to Firestore
                            await userDocRef.set({ favorites: localFavorites });
                        }

                    } catch (error) {
                        console.error("Error during user session or favorites sync:", error);
                        localStorage.removeItem('toolsyfy_user');
                    }
                } else {
                    localStorage.removeItem('toolsyfy_user');
                }
            });
            return unsubscribe;
        } else {
            setTimeout(setupAuthListener, 100);
            if (!authInitialized) setAuthInitialized(true);
        }
    };
    const unsubscribe = setupAuthListener();
    return () => {
        if (typeof unsubscribe === 'function') {
            unsubscribe();
        }
    };
  }, [ADMIN_EMAIL, authInitialized, setFavorites]);

  useEffect(() => {
    document.title = siteSettings.siteTitle;
    document.querySelector('meta[name="description"]')?.setAttribute('content', siteSettings.metaDescription);
    document.querySelector('meta[name="keywords"]')?.setAttribute('content', siteSettings.metaKeywords);
    
    // FIX: Cast favicon element to HTMLLinkElement to safely access 'href' property.
    const favicon = document.getElementById('favicon') as HTMLLinkElement;
    if (favicon && themeSettings.faviconUrl) favicon.href = themeSettings.faviconUrl;

  }, [siteSettings, themeSettings]);
  
  useEffect(() => {
    if (authInitialized && cookieConsent === null) {
      setTimeout(() => setIsCookieBannerVisible(true), 1000);
    }
  }, [authInitialized, cookieConsent]);
  
  useEffect(() => {
      const handleHashChange = () => {
          const hash = window.location.hash.replace('#', '');
          const validModals = ['about', 'contact', 'privacy', 'terms', 'disclaimer'];
          if (validModals.includes(hash)) {
              setModalState({ type: 'info', payload: hash });
          } else if (hash === 'login') {
              setModalState({ type: 'login' });
          } else if (hash === 'favorites') {
              setActiveCategory('favorites');
              window.history.replaceState(null, '', window.location.pathname + window.location.search);
          } else if (hash === 'suggestion') {
              setModalState({ type: 'suggestion' });
              window.history.replaceState(null, '', window.location.pathname + window.location.search);
          } else if (hash === 'report') {
              setModalState({ type: 'report' });
              window.history.replaceState(null, '', window.location.pathname + window.location.search);
          } else if (hash === 'admin') {
              if (isAdmin) {
                  setIsAdminPanelOpen(true);
              } else {
                  setModalState({ type: 'login' });
                  addToast("Please log in as an administrator to access this.", 'error');
              }
              window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
      };

      window.addEventListener('hashchange', handleHashChange, false);
      handleHashChange(); // Check hash on initial load

      // Check for report prefill from static pages
      const toolToReport = localStorage.getItem('toolsyfy_report_prefill');
      if (toolToReport) {
          setModalState({ type: 'report', payload: toolToReport });
          localStorage.removeItem('toolsyfy_report_prefill');
          if(window.location.hash === '#report') {
              window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
      }

      return () => {
          window.removeEventListener('hashchange', handleHashChange, false);
      };
  }, [isAdmin, addToast]);
  
  // Keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (event) => {
        if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
            event.preventDefault();
            setModalState({ type: 'cmdk' });
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Debounce effect for search
  useEffect(() => {
    const handler = setTimeout(() => {
        setSearchQuery(inputValue);
    }, 300); // 300ms debounce delay

    return () => {
        clearTimeout(handler);
    };
  }, [inputValue, setSearchQuery]);
  
  // Update search history with the debounced query
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;

    const term = searchQuery.trim().toLowerCase();
    setSearchHistory(prev => ({
        ...prev,
        [term]: (prev[term] || 0) + 1
    }));
  }, [searchQuery, setSearchHistory]);
  
  useMemo(() => {
      filteredTools.forEach(tool => {
          if (!toolRefs.current[tool.name]) {
              toolRefs.current[tool.name] = createRef();
          }
      });
  }, [filteredTools]);
  
  const handleSelectToolFromCmdK = useCallback((tool) => {
    setModalState(null);
    const currentCategory = tool.category;
    if (activeCategory !== 'all' && activeCategory !== 'favorites' && activeCategory !== currentCategory) {
        setActiveCategory(currentCategory);
    }
    setInputValue(''); // Clear search input
    setSearchQuery(''); // Clear debounced search
    
    // Scroll to tool after a short delay to allow for re-render
    setTimeout(() => {
        const toolElement = toolRefs.current[tool.name]?.current;
        if (toolElement) {
            toolElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setHighlightedTool(tool.name);
            setTimeout(() => setHighlightedTool(null), 2000);
        }
    }, 100);
  }, [activeCategory, setActiveCategory, setInputValue, setSearchQuery]);

  const handleToggleFavorite = useCallback((toolName) => {
    const newFavorites = favorites.includes(toolName)
        ? favorites.filter(name => name !== toolName)
        : [...favorites, toolName];

    setFavorites(newFavorites);

    // If user is logged in, sync with Firestore
    if (user && window.firebase?.apps?.length) {
        const userDocRef = window.firebase.firestore().collection('users').doc(user.uid);
        userDocRef.set({ favorites: newFavorites }, { merge: true })
            .catch(error => console.error("Failed to update favorites in Firestore:", error));
    }
  }, [favorites, setFavorites, user]);

  const handleToolClick = useCallback((toolName) => {
    setUserToolOverrides(prev => ({
        ...prev,
        [toolName]: {
            ...prev[toolName],
            clickCount: ((prev[toolName]?.clickCount || 0) + 1),
        }
    }));
  }, [setUserToolOverrides]);
  
  const handleLogout = useCallback(() => {
    localStorage.removeItem('toolsyfy_user'); // Ensure immediate clearing for UI responsiveness
    if (window.firebase?.apps?.length) {
      window.firebase.auth().signOut();
    }
  }, []);

  const handleSuggestionSubmit = useCallback((suggestionData) => {
    const newSuggestion = {
        ...suggestionData,
        id: uuidv4(),
        timestamp: Date.now(),
        status: 'Open',
    };
    setSuggestions(prev => [...prev, newSuggestion]);
  }, [setSuggestions]);

  const handleReportSubmit = useCallback((reportData) => {
      const newReport = {
          ...reportData,
          id: uuidv4(),
          timestamp: Date.now(),
          status: 'Open',
      };
      setReports(prev => [...prev, newReport]);
  }, [setReports]);


  // --- Admin Handlers ---
  const handleSaveTool = useCallback((originalName, toolData) => {
    if (!originalName) {
        if (baseTools.some(t => t.name.toLowerCase() === toolData.name.toLowerCase())) {
            addToast(`A tool with the name "${toolData.name}" already exists.`, 'error');
            return;
        }
        setBaseTools(prev => [...prev, toolData]);
        addToast(`Added new tool: ${toolData.name}`, 'success');
    } else {
        if (originalName !== toolData.name && baseTools.some(t => t.name.toLowerCase() === toolData.name.toLowerCase())) {
            addToast(`A tool with the name "${toolData.name}" already exists.`, 'error');
            return;
        }
        if (originalName !== toolData.name) {
            setUserToolOverrides(prev => {
                const newOverrides = { ...prev };
                if (newOverrides[originalName]) {
                    newOverrides[toolData.name] = { ...newOverrides[originalName] };
                    delete newOverrides[originalName];
                }
                return newOverrides;
            });
             setToolStatuses(prev => {
                const newStatuses = { ...prev };
                if (newStatuses[originalName]) {
                    newStatuses[toolData.name] = newStatuses[originalName];
                    delete newStatuses[originalName];
                }
                return newStatuses;
            });
        }
        setBaseTools(prev => prev.map(t => (t.name === originalName ? toolData : t)));
        addToast(`Updated tool: ${toolData.name}`, 'success');
    }
    setModalState(null);
  }, [baseTools, addToast, setBaseTools, setUserToolOverrides, setToolStatuses]);

  const handleDeleteTool = useCallback((toolName) => {
      if (window.confirm(`Are you sure you want to delete "${toolName}"? This action cannot be undone.`)) {
          setBaseTools(prev => prev.filter(tool => tool.name !== toolName));
          setUserToolOverrides(prev => {
              const newOverrides = { ...prev };
              delete newOverrides[toolName];
              return newOverrides;
          });
          setToolStatuses(prev => {
              const newOverrides = { ...prev };
              delete newOverrides[toolName];
              return newOverrides;
          });
          addToast(`Deleted tool: ${toolName}`, 'success');
      }
  }, [addToast, setBaseTools, setUserToolOverrides, setToolStatuses]);

  const handleScanTools = useCallback(async () => {
    if (isScanning) return;
    setIsScanning(true);
    addToast('Starting tool status scan...', 'success');

    const statusesToUpdate = {};
    tools.forEach(tool => {
        statusesToUpdate[tool.name] = 'scanning';
    });
    setToolStatuses(statusesToUpdate);

    const checkToolStatus = async (tool) => {
        let status = 'dead';
        if (typeof tool.link === 'string' && tool.link.trim().endsWith('.html')) {
            try {
                // Use cache-busting parameter to ensure a fresh check
                const response = await fetch(`${tool.link}?t=${Date.now()}`, { method: 'HEAD', cache: 'no-store' });
                if (response.ok) {
                    status = 'live';
                }
            } catch (error) {
                console.warn(`Scan failed for ${tool.name}:`, error);
            }
        }
        return { name: tool.name, status };
    };
    
    // Process tools sequentially to update UI progressively
    for (const tool of tools) {
        const result = await checkToolStatus(tool);
        setToolStatuses(prev => ({ ...prev, [result.name]: result.status }));
    }

    setLastScan(Date.now());
    setIsScanning(false);
    addToast('Tool status scan complete!', 'success');
  }, [tools, addToast, setToolStatuses, setLastScan, isScanning]);

  const handleUpdateToolCategory = useCallback((toolName, newCategory) => {
      setUserToolOverrides(prev => ({ ...prev, [toolName]: { ...prev[toolName], category: newCategory } }));
  }, [setUserToolOverrides]);

  const handleToggleLoginRequired = useCallback((toolName) => {
      setUserToolOverrides(prev => ({ ...prev, [toolName]: { ...prev[toolName], loginRequired: !prev[toolName]?.loginRequired } }));
  }, [setUserToolOverrides]);

  const handleToggleAdsDisabled = useCallback((toolName) => {
      setUserToolOverrides(prev => ({ ...prev, [toolName]: { ...prev[toolName], adsDisabled: !prev[toolName]?.adsDisabled } }));
  }, [setUserToolOverrides]);
  
  const handleToggleIsSponsored = useCallback((toolName) => {
    setUserToolOverrides(prev => ({ ...prev, [toolName]: { ...prev[toolName], isSponsored: !prev[toolName]?.isSponsored } }));
  }, [setUserToolOverrides]);

  const handleSaveInfoContent = useCallback((key, content) => {
      setInfoContents(prev => ({ ...prev, [key]: { ...prev[key], content } }));
      setModalState(null);
      addToast('Info content saved successfully!', 'success');
  }, [setInfoContents, addToast]);

  const handleSaveSiteSettings = useCallback((settings) => {
    setSiteSettings(settings);
    addToast('Site settings saved!', 'success');
  }, [setSiteSettings, addToast]);

  const handleSaveAuthorSettings = useCallback((settings) => {
    setAuthorSettings(settings);
    addToast('Author settings saved!', 'success');
  }, [setAuthorSettings, addToast]);

  const handleSaveLayoutSettings = useCallback((settings) => {
    setLayoutSettings(settings);
    addToast('Layout settings saved!', 'success');
  }, [setLayoutSettings, addToast]);

  const handleSaveFirebaseSettings = useCallback((settings) => {
      setFirebaseSettings(settings);
      addToast("Firebase settings saved. The page will now reload to apply changes.", 'success');
      setTimeout(() => window.location.reload(), 2000);
  }, [setFirebaseSettings, addToast]);
  
  const handleSaveAnnouncementBanner = useCallback((settings) => {
    setAnnouncementBanner(settings);
    addToast('Announcement banner saved!', 'success');
  }, [setAnnouncementBanner, addToast]);

  const renderModals = () => {
    if (!modalState) return null;

    switch (modalState.type) {
      case 'info': return <InfoModal title={infoContents[modalState.payload].title} content={infoContents[modalState.payload].content} onClose={handleCloseModal} isAdmin={isAdmin} onEdit={() => setModalState({ type: 'edit-info', payload: modalState.payload })} />;
      case 'toolkit': return <ToolkitModal favoriteTools={favoriteTools} onClose={handleCloseModal} />;
      case 'cmdk': return <CmdKModal tools={tools} onClose={handleCloseModal} onSelectTool={handleSelectToolFromCmdK} />;
      case 'suggestion': return <SuggestionModal onClose={handleCloseModal} onSubmit={handleSuggestionSubmit} />;
      case 'report': return <ReportModal onClose={handleCloseModal} onSubmit={handleReportSubmit} tools={tools} initialTool={modalState.payload} />;
      case 'login': return <LoginModal onClose={handleCloseModal} />;
      case 'tool-instruction': {
        const toolName = modalState.payload;
        const instruction = toolInstructions[toolName] || "No instructions available for this tool yet. If you're unsure how it works, you can report an issue or suggest a feature using the toolbar on the tool's page.";
        return <ToolInstructionModal toolName={toolName} instruction={instruction} onClose={handleCloseModal} />;
      }
      
      // Admin modals
      case 'tool': return <ToolModal toolState={modalState.payload} categories={categories} onClose={handleCloseModal} onSave={handleSaveTool} />;
      case 'edit-info': return <EditInfoModal contentKey={modalState.payload} title={infoContents[modalState.payload].title} initialContent={infoContents[modalState.payload].content} onClose={handleCloseModal} onSave={handleSaveInfoContent} />;
      case 'site-settings': return <SiteSettingsModal settings={siteSettings} onClose={handleCloseModal} onSave={handleSaveSiteSettings} addToast={addToast} />;
      case 'author-settings': return <AuthorSettingsModal settings={authorSettings} onClose={handleCloseModal} onSave={handleSaveAuthorSettings} addToast={addToast} />;
      case 'layout-settings': return <LayoutSettingsModal settings={layoutSettings} allTools={tools} onClose={handleCloseModal} onSave={handleSaveLayoutSettings} />;
      case 'firebase-config': return <FirebaseConfigModal settings={firebaseSettings} onClose={handleCloseModal} onSave={handleSaveFirebaseSettings} />;

      default: return null;
    }
  };
  
  const [toolOfTheDay, featuredTools] = useMemo(() => {
    const sortedByClicks = [...tools].sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0));
    const day = new Date().getDate();
    const dateBasedTool = tools[day % tools.length] || null;
    const clickBasedFeatured = sortedByClicks.slice(0, 4);

    return [dateBasedTool, clickBasedFeatured];
  }, [tools]);

  if (!authInitialized || isLoadingTools || !siteConfig) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-background">
            <Spinner />
            <p className="mt-4 text-muted">Initializing...</p>
        </div>
      );
  }

  return (
    <>
      <div aria-live="assertive" className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-[999]">
          <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
              {toasts.map(toast => (
                  <ToastComponent key={toast.id} {...toast} onDismiss={removeToast} />
              ))}
          </div>
      </div>
      
      {announcementBanner.enabled && <AnnouncementBanner text={announcementBanner.text} />}
      <Header
        user={user}
        isAdmin={isAdmin}
        siteConfig={siteConfig}
        onLoginClick={() => setModalState({ type: 'login' })}
        onLogout={handleLogout}
        onShowToolkit={() => setModalState({ type: 'toolkit' })}
        onOpenCmdK={() => setModalState({ type: 'cmdk' })}
        favoriteCount={favorites.length}
        onOpenAdmin={() => {
          if (isAdmin) {
            setIsAdminPanelOpen(true);
          } else {
            setModalState({ type: 'login' });
            addToast("Please log in as an administrator to access this.", 'error');
          }
        }}
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16">
        <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight">
                Work Smarter with <span className="text-brand-primary">Toolsyfy</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted max-w-3xl mx-auto">
                Access 500+ free utilities designed to save you time, spark creativity, and simplify your digital tasks. No sign-up required, no nonsense.
            </p>
        </div>

        <div className="mt-12 max-w-5xl mx-auto">
            <SearchBar
                searchQuery={inputValue}
                setSearchQuery={setInputValue}
                categories={categories}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                favoriteCount={favorites.length}
            />
        </div>
        
        {!searchQuery && <div className="max-w-5xl mx-auto mb-12"><FeaturedTools tools={tools} layoutSettings={layoutSettings} toolOfTheDay={toolOfTheDay} featuredTools={featuredTools} /></div>}
        
        {layoutSettings.showAffiliateSection && affiliates.length > 0 && (
            <div className="max-w-5xl mx-auto mb-12">
                <AffiliateSection affiliates={affiliates} />
            </div>
        )}

        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                    {
                        activeCategory === 'all' ? 'All Tools' : 
                        activeCategory === 'favorites' ? 'My Toolkit' :
                        activeCategory
                    }
                     <span className="text-base font-normal text-muted ml-2">({filteredTools.length} found)</span>
                </h2>
            </div>
            
            <div>
                {isLoadingTools && baseTools.length === 0 && (
                    <div className="text-center my-12 py-10 flex flex-col items-center justify-center">
                        <Spinner />
                        <h3 className="text-2xl font-bold text-foreground mt-4">Loading Tools...</h3>
                        <p className="text-muted mt-2">Please wait a moment.</p>
                    </div>
                )}

                {!isLoadingTools && filteredTools.length === 0 && (
                    <div className="text-center my-12 py-10 bg-secondary rounded-lg">
                        <h3 className="text-2xl font-bold text-foreground">No tools found</h3>
                        <p className="text-muted mt-2">Try adjusting your search query or category selection.</p>
                    </div>
                )}
                
                {/* --- Tools Grid --- */}
                {filteredTools.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {filteredTools.map(tool => (
                            <ToolCard
                                key={tool.name}
                                ref={toolRefs.current[tool.name]}
                                tool={tool}
                                isLoggedIn={!!user}
                                onLoginClick={() => setModalState({ type: 'login' })}
                                onToolClick={handleToolClick}
                                isFavorite={favorites.includes(tool.name)}
                                onToggleFavorite={handleToggleFavorite}
                                isHighlighted={highlightedTool === tool.name}
                                onShowInfo={(toolName) => setModalState({ type: 'tool-instruction', payload: toolName })}
                                onReportIssue={(toolName) => setModalState({ type: 'report', payload: toolName })}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
      </main>

      <Footer 
        authorSettings={authorSettings}
        onShowInfoModal={(topic) => setModalState({ type: 'info', payload: topic })}
        onShowSuggestionModal={() => setModalState({ type: 'suggestion' })}
      />
      
      <Suspense fallback={<div className="fixed inset-0 bg-background z-50 flex items-center justify-center"><Spinner /></div>}>
        {isAdminPanelOpen && (
            <AdminPanelModal
                tools={tools} 
                infoContents={infoContents} 
                onClose={() => setIsAdminPanelOpen(false)} 
                onToggleLoginRequired={handleToggleLoginRequired} 
                onToggleAdsDisabled={handleToggleAdsDisabled} 
                onToggleIsSponsored={handleToggleIsSponsored}
                onEditInfo={(key) => setModalState({ type: 'edit-info', payload: key })} 
                siteSettings={siteSettings}
                onSaveSiteSettings={handleSaveSiteSettings}
                onOpenAuthorSettings={() => setModalState({ type: 'author-settings' })} 
                onOpenLayoutSettings={() => setModalState({ type: 'layout-settings' })} 
                onOpenFirebaseConfig={() => setModalState({ type: 'firebase-config' })}
                searchHistory={searchHistory}
                announcementBanner={announcementBanner}
                onSaveAnnouncementBanner={handleSaveAnnouncementBanner}
                onDeleteTool={handleDeleteTool}
                onAddTool={(prefill) => setModalState({ type: 'tool', payload: { mode: 'add', prefill } })}
                onEditTool={(tool) => setModalState({ type: 'tool', payload: { mode: 'edit', tool } })}
                addToast={addToast}
                toolStatuses={toolStatuses}
                setToolStatuses={setToolStatuses}
                lastScan={lastScan}
                isScanning={isScanning}
                onScanTools={handleScanTools}
                reports={reports}
                setReports={setReports}
                suggestions={suggestions}
                setSuggestions={setSuggestions}
                toolInstructions={toolInstructions}
                setToolInstructions={setToolInstructions}
                analyticsEvents={analyticsEvents}
                setAnalyticsEvents={setAnalyticsEvents}
                affiliates={affiliates}
                setAffiliates={setAffiliates}
                changelog={changelog}
                setChangelog={setChangelog}
                favorites={favorites}
                setFavorites={setFavorites}
                userToolOverrides={userToolOverrides}
                setUserToolOverrides={setUserToolOverrides}
            />
        )}

        {renderModals()}
      </Suspense>
      
      <CookieConsentBanner 
        show={cookieConsent === null}
        isVisible={isCookieBannerVisible} 
        onAccept={() => {
            setCookieConsent(true);
            setIsCookieBannerVisible(false);
        }}
      />
      
      <ScrollToTopButton isCookieBannerVisible={isCookieBannerVisible && cookieConsent === null} />
    </>
  );
}
