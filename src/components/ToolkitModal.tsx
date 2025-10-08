import React, { useState, useEffect } from 'react';

const ToolkitModal = ({ favoriteTools, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
        onClose();
    }, 300);
  };

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleToolClick = (tool) => {
    window.location.href = tool.link;
    onClose();
  };

  const animationClass = isClosing ? 'opacity-0' : 'opacity-100';
  const modalAnimationClass = isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100';

  return (
    <div
      className={`fixed inset-0 modal-overlay z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out ${animationClass}`}
      aria-modal="true"
      role="dialog"
      onClick={handleClose}
    >
      <div
        className={`bg-card rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col transition-all duration-300 ease-in-out ${modalAnimationClass}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <h2 className="text-xl font-bold text-foreground">My Toolkit</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full text-muted hover:bg-secondary transition-colors"
            aria-label="Close Toolkit modal"
          >
            <i data-lucide="x" className="h-6 w-6"></i>
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-12rem)]">
          {favoriteTools.length > 0 ? (
            <ul className="space-y-3">
              {favoriteTools.map(tool => (
                <li key={tool.name}>
                  <button onClick={() => handleToolClick(tool)} className="w-full text-left p-4 rounded-lg bg-secondary hover:bg-secondary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary">
                    <h3 className="font-semibold text-foreground">{tool.name}</h3>
                    <p className="text-sm text-muted">{tool.description}</p>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                <h3 className="mt-2 text-lg font-medium text-foreground">Your Toolkit is empty</h3>
                <p className="mt-1 text-sm text-muted">Click the heart icon on any tool to add it here.</p>
            </div>
          )}
        </div>
        <div className="flex justify-end p-4 border-t border-border flex-shrink-0">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium rounded-md bg-brand-primary text-white hover:bg-brand-secondary">Close</button>
        </div>
      </div>
    </div>
  );
};
export default ToolkitModal;
