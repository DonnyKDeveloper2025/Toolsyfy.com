import React, { useState, useEffect, useRef, memo } from 'react';

const SearchBarComponent = ({ searchQuery, setSearchQuery, categories, activeCategory, setActiveCategory, favoriteCount }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
                setIsSearchActive(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);
    
    const handleCategorySelect = (category) => {
        setActiveCategory(category);
        setIsDropdownOpen(false);
        inputRef.current?.focus();
    };

    const getCategoryDisplayName = () => {
        if (activeCategory === 'all') return 'All Categories';
        if (activeCategory === 'favorites') return `My Toolkit (${favoriteCount})`;
        return activeCategory;
    };

    return (
        <div className="mb-12" ref={wrapperRef}>
            <div className={`relative flex items-center w-full bg-card border-2 rounded-xl transition-all duration-300 shadow-sm ${isSearchActive ? 'ring-2 ring-brand-primary border-transparent' : 'border-border'}`}>
                
                {/* Search Input */}
                <div className="flex-grow flex items-center relative">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                         <i data-lucide="search" className="h-5 w-5 text-muted"></i>
                    </div>
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearchActive(true)}
                        placeholder="Search for tools by name, category, or tag..."
                        className="w-full p-4 pl-12 pr-10 text-lg bg-transparent outline-none text-foreground"
                        aria-label="Search tools"
                    />
                     {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                            aria-label="Clear search"
                        >
                            <i data-lucide="x" className="h-5 w-5 text-muted hover:text-foreground"></i>
                        </button>
                    )}
                </div>

                {!searchQuery && (
                    <>
                        {/* Separator */}
                        <div className="h-6 w-px bg-border"></div>

                        {/* Category Dropdown Button */}
                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex-shrink-0 h-full flex items-center gap-2 pl-3 pr-4 text-muted hover:text-foreground transition-colors"
                                aria-haspopup="true"
                                aria-expanded={isDropdownOpen}
                            >
                                <i data-lucide="filter" className="h-5 w-5"></i>
                                <span className="font-semibold text-sm">{getCategoryDisplayName()}</span>
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute top-full mt-2 right-0 w-72 bg-card border border-border rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto">
                                    <ul className="p-2 text-sm" role="menu">
                                        <li>
                                            <button onClick={() => handleCategorySelect('all')} className="w-full text-left px-3 py-2 rounded-md text-foreground hover:bg-secondary" role="menuitem">All Categories</button>
                                        </li>
                                        <li>
                                            <button onClick={() => handleCategorySelect('favorites')} className="w-full text-left px-3 py-2 rounded-md text-foreground hover:bg-secondary" role="menuitem">My Toolkit ({favoriteCount})</button>
                                        </li>
                                        <li className="px-3 py-2 mt-1 text-xs font-semibold text-muted uppercase" role="separator">Categories</li>
                                        {categories.map(cat => (
                                            <li key={cat}>
                                                <button onClick={() => handleCategorySelect(cat)} className="w-full text-left px-3 py-2 rounded-md text-foreground hover:bg-secondary" role="menuitem">{cat}</button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export const SearchBar = memo(SearchBarComponent);
