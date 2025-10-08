import React, { useState, useEffect } from 'react';

const SuggestionModal = ({ onClose, onSubmit }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [tool, setTool] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) handleClose();
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tool || !suggestion) {
        alert("Please fill out all fields.");
        return;
    }
    onSubmit({ tool, suggestion });
    setIsSubmitted(true);
  };

  const animationClass = isClosing ? 'opacity-0' : 'opacity-100';
  const modalAnimationClass = isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100';

  return (
    <div
      className={`fixed inset-0 modal-overlay z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${animationClass}`}
      onClick={handleClose}
    >
      <div
        className={`bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg flex flex-col transition-all duration-300 ${modalAnimationClass}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <i data-lucide="lightbulb" className="h-6 w-6 text-brand-primary"></i>
            Suggest a Tool
          </h2>
          <button onClick={handleClose} className="p-2 rounded-full text-muted hover:bg-secondary">
            <i data-lucide="x" className="h-6 w-6"></i>
          </button>
        </div>
        
        {isSubmitted ? (
            <>
                <div className="p-6 sm:p-8 text-center">
                    <i data-lucide="check-circle-2" className="mx-auto h-12 w-12 text-green-500"></i>
                    <h3 className="mt-4 text-lg font-bold text-foreground">Thank You!</h3>
                    <p className="mt-2 text-muted">
                        Your suggestion has been submitted. We appreciate your feedback and will review it soon.
                    </p>
                </div>
                <div className="flex justify-end p-4 border-t border-border">
                    <button onClick={handleClose} className="w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-md bg-brand-primary text-white hover:bg-brand-secondary">
                        Done
                    </button>
                </div>
            </>
        ) : (
            <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="tool-idea" className="block text-sm font-medium text-muted mb-1">Tool Name / Idea</label>
                        <input
                            type="text"
                            id="tool-idea"
                            value={tool}
                            onChange={(e) => setTool(e.target.value)}
                            required
                            className="w-full p-2 bg-card border border-border rounded-md text-foreground focus:ring-brand-primary focus:border-brand-primary"
                            placeholder="e.g., 'Bulk Image Resizer'"
                        />
                    </div>
                    <div>
                        <label htmlFor="suggestion-desc" className="block text-sm font-medium text-muted mb-1">Detailed Description</label>
                        <textarea
                            id="suggestion-desc"
                            value={suggestion}
                            onChange={(e) => setSuggestion(e.target.value)}
                            required
                            rows={5}
                            className="w-full p-2 bg-card border border-border rounded-md text-foreground focus:ring-brand-primary focus:border-brand-primary"
                            placeholder="Describe what the tool should do, its features, and why it would be useful."
                        ></textarea>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-end items-center gap-2 p-4 border-t border-border">
                    <button type="button" onClick={handleClose} className="w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-md bg-secondary text-foreground hover:bg-secondary-hover">Cancel</button>
                    <button type="submit" className="w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-md bg-brand-primary text-white hover:bg-brand-secondary">
                        Submit Suggestion
                    </button>
                </div>
            </form>
        )}
      </div>
    </div>
  );
};
export default SuggestionModal;
