import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CategoryIcons } from '../constants/icons';

const CmdKModal = ({ tools, onClose, onSelectTool }) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  useEffect(() => {
    inputRef.current?.focus();
    document.body.style.overflow = 'hidden';

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const filteredTools = useMemo(() => {
    if (!query) {
      return [];
    }
    const lowerCaseQuery = query.toLowerCase();
    return tools.filter(tool => 
      tool.name.toLowerCase().includes(lowerCaseQuery) ||
      tool.description.toLowerCase().includes(lowerCaseQuery) ||
      tool.category.toLowerCase().includes(lowerCaseQuery) ||
      (tool.tags && tool.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery)))
    ).slice(0, 10);
  }, [query, tools]);
  
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if(filteredTools.length > 0) {
        const activeItem = resultsRef.current?.children[activeIndex];
        activeItem?.scrollIntoView({
            block: 'nearest',
        });
    }
  }, [activeIndex, filteredTools]);

  const handleKeyDown = (e) => {
    if (filteredTools.length === 0) {
        return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % filteredTools.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + filteredTools.length) % filteredTools.length);
    } else if (e.key === 'Enter') {
      if (filteredTools[activeIndex]) {
        onSelectTool(filteredTools[activeIndex]);
      }
    }
  };

  const animationClass = isClosing ? 'opacity-0' : 'opacity-100';
  const modalAnimationClass = isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100';

  return (
    <div className={`fixed inset-0 z-50 flex justify-center items-start pt-20 px-4 transition-opacity duration-300 ${animationClass}`} aria-modal="true" role="dialog">
      <div onClick={handleClose} className="absolute inset-0 modal-overlay"></div>
      <div className={`relative w-full max-w-xl bg-card rounded-xl shadow-2xl overflow-hidden border border-border transition-all duration-300 ${modalAnimationClass}`}>
        <div className="flex items-center gap-2 p-3 border-b border-border">
          <i data-lucide="search" className="h-5 w-5 text-muted"></i>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search for tools..."
            className="w-full bg-transparent focus:outline-none text-foreground"
          />
          <button onClick={handleClose} className="p-1.5 rounded-md text-muted hover:bg-secondary hover:text-foreground transition-colors" aria-label="Close search">
            <i data-lucide="x" className="h-5 w-5"></i>
          </button>
        </div>
        <div ref={resultsRef} className="max-h-96 overflow-y-auto">
          {filteredTools.length > 0 ? (
            <ul className="p-2">
              {filteredTools.map((tool, index) => (
                <li key={tool.name}>
                  <button
                    onClick={() => onSelectTool(tool)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`w-full text-left p-3 flex items-center gap-4 rounded-lg transition-colors ${activeIndex === index ? 'bg-brand-primary text-white' : 'hover:bg-secondary'}`}
                  >
                    <div className={`flex-shrink-0 p-2 rounded-md ${activeIndex === index ? 'bg-brand-secondary' : 'bg-secondary'}`}>
                        <div className={`${activeIndex === index ? 'text-white' : 'text-brand-primary'}`}>
                          <i data-lucide={CategoryIcons[tool.category]} className="h-6 w-6"></i>
                        </div>
                    </div>
                    <div>
                      <h3 className={`font-semibold ${activeIndex === index ? 'text-white' : 'text-foreground'}`}>{tool.name}</h3>
                      <p className={`text-sm ${activeIndex === index ? 'text-orange-100' : 'text-muted'}`}>{tool.category}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-10 text-center text-muted">
              <p>{query ? 'No results found.' : 'Type to search for a tool.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default CmdKModal;
