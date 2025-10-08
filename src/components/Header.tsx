import React, { useState, useEffect, useRef, memo } from 'react';

const Sidebar = ({ isOpen, onClose, siteConfig, user, isAdmin, onLoginClick, onLogout, onShowToolkit, favoriteCount, onOpenAdmin, categories, activeCategory, setActiveCategory }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openCategoriesDropdown, setOpenCategoriesDropdown] = useState(true);

  const handleCategorySelect = (category) => {
    setActiveCategory(category);
    onClose();
  };
  
  return (
    <aside className={`fixed inset-0 bg-overlay z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}>
      <div className={`w-72 bg-card h-full p-6 shadow-lg flex flex-col justify-between border-r border-border transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`} onClick={e => e.stopPropagation()}>
        <div>
          <div className="flex items-center justify-between mb-6">
            <a href="/" className="flex items-center gap-2" aria-label="Toolsyfy Home">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
              <h2 className="text-xl font-semibold text-foreground">Toolsyfy</h2>
            </a>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-secondary text-muted"><i data-lucide="x" className="h-6 w-6"></i></button>
          </div>

          <nav className="space-y-2">
            {siteConfig?.menu?.map(item => (
              item.children ? (
                <div key={item.label} className="dropdown">
                  <button onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)} className="flex justify-between w-full items-center text-base font-medium text-foreground py-1">
                    <span>{item.label}</span>
                    <i data-lucide="chevron-down" className={`h-4 w-4 transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`}></i>
                  </button>
                  {openDropdown === item.label && (
                    <div className="ml-4 mt-2 space-y-2 border-l border-border pl-4">
                      {item.children.map(child => <a key={child.label} href={child.link} className="block text-sm text-muted hover:text-brand-primary">{child.label}</a>)}
                    </div>
                  )}
                </div>
              ) : (
                <a key={item.label} href={item.link} className="block text-base font-medium text-foreground hover:text-brand-primary py-1">{item.label}</a>
              )
            ))}
          </nav>

            <div className="mt-4 pt-4 border-t border-border">
                <div className="dropdown">
                    <button onClick={() => setOpenCategoriesDropdown(!openCategoriesDropdown)} className="flex justify-between w-full items-center text-base font-medium text-foreground py-1">
                        <span>Tool Categories</span>
                        <i data-lucide="chevron-down" className={`h-4 w-4 transition-transform ${openCategoriesDropdown ? 'rotate-180' : ''}`}></i>
                    </button>
                    {openCategoriesDropdown && (
                        <div className="ml-4 mt-2 space-y-1 border-l border-border pl-4 max-h-48 overflow-y-auto">
                            <button onClick={() => handleCategorySelect('all')} className={`w-full text-left block text-sm py-1 hover:text-brand-primary ${activeCategory === 'all' ? 'text-brand-primary font-semibold' : 'text-muted'}`}>All Categories</button>
                            <button onClick={() => handleCategorySelect('favorites')} className={`w-full text-left block text-sm py-1 hover:text-brand-primary ${activeCategory === 'favorites' ? 'text-brand-primary font-semibold' : 'text-muted'}`}>My Toolkit</button>
                            {categories.map(cat => <button key={cat} onClick={() => handleCategorySelect(cat)} className={`w-full text-left block text-sm py-1 hover:text-brand-primary ${activeCategory === cat ? 'text-brand-primary font-semibold' : 'text-muted'}`}>{cat}</button>)}
                        </div>
                    )}
                </div>
            </div>

           <div className="mt-4 pt-4 border-t border-border space-y-2">
                <button onClick={() => { onShowToolkit(); onClose(); }} className="w-full flex items-center justify-between text-base font-medium text-foreground hover:text-brand-primary py-1">
                    <div className="flex items-center gap-3">
                        <i data-lucide="briefcase" className="h-5 w-5"></i>
                        <span>My Toolkit</span>
                    </div>
                    {favoriteCount > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">
                            {favoriteCount}
                        </span>
                    )}
                </button>
                {isAdmin && (
                    <button onClick={() => { onOpenAdmin(); onClose(); }} className="w-full flex items-center gap-3 text-base font-medium text-foreground hover:text-brand-primary py-1">
                        <i data-lucide="settings" className="h-5 w-5"></i>
                        <span>Admin Panel</span>
                    </button>
                )}
            </div>
        </div>

        <div className="pt-4 border-t border-border">
            {user ? (
                <div className="mb-4 text-sm text-muted">
                    <p className="font-semibold text-foreground">Signed in as</p>
                    <p className="truncate mb-2">{user.email || user.phoneNumber}</p>
                    <button onClick={() => { onLogout(); onClose(); }} className="w-full border border-border rounded-lg py-2 flex items-center justify-center gap-2 text-sm font-medium text-foreground hover:bg-secondary transition">
                        <i data-lucide="log-out" className="h-4 w-4"></i>
                        <span>Logout</span>
                    </button>
                </div>
            ) : (
                <button onClick={() => { onLoginClick(); onClose(); }} className="mb-4 w-full bg-brand-primary text-white font-semibold py-2 px-4 rounded-md hover:bg-brand-secondary border border-brand-secondary">
                    Login / Sign Up
                </button>
            )}
            
          <div className="flex gap-4 mb-4">
            {siteConfig?.social?.map(s => (
              <a key={s.icon} href={s.link} target="_blank" rel="noopener noreferrer" aria-label={s.icon}><i data-lucide={s.icon} className="w-5 h-5 text-muted hover:text-brand-primary"></i></a>
            ))}
          </div>
          <div className="text-xs text-muted space-x-3">
            <a href="/#privacy" className="hover:text-brand-primary">Privacy</a><span>&bull;</span>
            <a href="/#terms" className="hover:text-brand-primary">Terms</a><span>&bull;</span>
            <a href="/#contact" className="hover:text-brand-primary">Contact</a>
          </div>
        </div>
      </div>
    </aside>
  );
};


const HeaderComponent = ({ user, isAdmin, siteConfig, onLoginClick, onLogout, onShowToolkit, onOpenCmdK, favoriteCount, onOpenAdmin, categories, activeCategory, setActiveCategory }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  
   useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const SearchButton = () => (
    <button
      onClick={onOpenCmdK}
      className="w-full text-left flex items-center gap-2 p-2 rounded-lg transition-colors bg-card hover:bg-slate-50 border border-slate-300 md:w-64 focus:outline-none focus:ring-2 focus:ring-brand-primary"
      aria-label="Search tools"
    >
      <i data-lucide="search" className="h-5 w-5 text-slate-500"></i>
      <span className="text-slate-500 text-sm flex-grow">Search tools...</span>
      <kbd className="font-sans text-xs font-semibold text-slate-500 border border-slate-300 rounded px-1.5 py-0.5">
          ⌘K
      </kbd>
    </button>
  );

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-header border-b border-border transition-colors">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side */}
            <div className="flex items-center gap-2 sm:gap-4">
                <button onClick={() => setIsMenuOpen(true)} className="md:hidden p-2 text-foreground rounded-lg hover:bg-secondary-hover transition-colors" aria-label="Open menu" aria-expanded={isMenuOpen}>
                    <i data-lucide="menu" className="h-6 w-6"></i>
                </button>
                <a href="/" className="flex items-center gap-2" aria-label="Toolsyfy Home">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                    <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">Toolsyfy</span>
                </a>
            </div>

            {/* Middle */}
            <div className="flex-1 flex justify-center px-4">
              <div className="hidden md:block">
                <SearchButton />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-3">
                {/* Desktop controls */}
                <div className="hidden md:flex items-center gap-1 sm:gap-2">
                    <button 
                        onClick={onShowToolkit}
                        className="relative flex items-center gap-4 text-foreground rounded-full hover:bg-secondary-hover transition-colors p-2" 
                        aria-label="Open Toolkit"
                    >
                        <i data-lucide="briefcase" className="h-6 w-6"></i>
                        {favoriteCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white ring-2 ring-background">
                            {favoriteCount}
                        </span>
                        )}
                    </button>
      
                    {isAdmin && (
                        <button 
                            onClick={onOpenAdmin}
                            className="flex items-center gap-4 rounded-full hover:bg-secondary-hover transition-colors text-foreground p-2" 
                            aria-label="Open Admin Panel"
                        >
                            <i data-lucide="settings" className="h-6 w-6"></i>
                        </button>
                    )}
                    {user ? (
                        <div ref={profileRef} className="relative">
                            <button onClick={() => setProfileOpen(prev => !prev)} className="p-2 rounded-full text-foreground hover:bg-secondary-hover transition-colors">
                                <i data-lucide="user" className="h-6 w-6"></i>
                            </button>
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg py-1 border border-border">
                                    <div className="px-4 py-2 text-sm text-muted border-b border-border">
                                        <p className="font-semibold text-foreground">Signed in as</p>
                                        <p className="truncate">{user.email || user.phoneNumber}</p>
                                    </div>
                                    <button onClick={onLogout} className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary">
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button onClick={onLoginClick} className="px-4 py-2 text-sm font-semibold rounded-md bg-brand-primary text-white hover:bg-brand-secondary border border-brand-secondary">
                            Login
                        </button>
                    )}
                </div>
                {/* Mobile controls */}
                <div className="md:hidden">
                    <button onClick={onOpenCmdK} className="p-2 text-foreground rounded-lg hover:bg-secondary-hover transition-colors" aria-label="Search tools">
                        <i data-lucide="search" className="h-6 w-6"></i>
                    </button>
                </div>
            </div>
          </div>
        </div>
      </header>
      <Sidebar 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        siteConfig={siteConfig} 
        user={user}
        isAdmin={isAdmin}
        onLoginClick={onLoginClick}
        onLogout={onLogout}
        onShowToolkit={onShowToolkit}
        favoriteCount={favoriteCount}
        onOpenAdmin={onOpenAdmin}
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />
    </>
  );
};

export const Header = memo(HeaderComponent);
