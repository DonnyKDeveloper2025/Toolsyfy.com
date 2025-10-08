import React, { useState, useEffect } from 'react';

const AIGenerateButton = ({ onClick, isLoading }) => (
    <button type="button" onClick={onClick} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 disabled:opacity-50">
        {isLoading ? (
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-5 h-5">
                <circle cx="4" cy="12" r="3"><animate id="a" begin="0;s.end" attributeName="r" dur="0.6s" values="3;1;3" fill="freeze" /></circle>
                <circle cx="12" cy="12" r="3"><animate begin="a.begin+0.15s" attributeName="r" dur="0.6s" values="3;1;3" fill="freeze" /></circle>
                <circle cx="20" cy="12" r="3"><animate id="s" begin="a.begin+0.3s" attributeName="r" dur="0.6s" values="3;1;3" fill="freeze" /></circle>
            </svg>
        ) : (
            <i data-lucide="wand-2" className="h-5 w-5"></i>
        )}
        {isLoading ? 'Generating...' : '✨ AI Writer'}
    </button>
);


const EditInfoModal = ({ contentKey, title, initialContent, onClose, onSave }) => {
  const [content, setContent] = useState(initialContent);
  const [isClosing, setIsClosing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
        onClose();
    }, 300);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(contentKey, content);
  };
  
  const generateWithAI = async () => {
    setIsGenerating(true);
    try {
        const apiResponse = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: `Generate content for the "${title}" page of a website called "Toolsyfy". Toolsyfy is a collection of over 500 free, no-backend online tools for developers, marketers, and content creators. The tone should be professional, clear, and user-friendly. The output should be formatted with markdown-like headings (e.g., "# Heading 1").`,
            })
        });

        if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            throw new Error(errorData.error || `API Error: ${apiResponse.statusText}`);
        }
        
        const { text } = await apiResponse.json();
        setContent(text);
    } catch (e) {
        console.error("API call error:", e);
        alert(`Failed to generate content: ${e.message}. Please try again.`);
    } finally {
        setIsGenerating(false);
    }
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
          <h2 className="text-xl font-bold text-foreground">Editing: {title}</h2>
          <button 
            onClick={handleClose} 
            className="p-2 rounded-full text-muted hover:bg-secondary transition-colors"
            aria-label="Close edit form"
          >
            <i data-lucide="x" className="h-6 w-6"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 flex flex-col flex-grow min-h-0">
          <div className="flex-grow flex flex-col min-h-0">
            <label htmlFor="info-content-edit" className="block text-sm font-medium text-muted mb-2">
                Content (use '# ' for headings)
            </label>
            <textarea 
                id="info-content-edit" 
                value={content} 
                onChange={e => setContent(e.target.value)} 
                required
                className="w-full h-full flex-grow p-2 bg-background border border-border rounded-md focus:ring-brand-primary focus:border-brand-primary text-foreground font-mono text-sm resize-none"
            ></textarea>
          </div>
          <div className="flex justify-between items-center pt-4 mt-4 border-t border-border flex-shrink-0">
            <AIGenerateButton onClick={generateWithAI} isLoading={isGenerating} />
            <div>
              <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium rounded-md bg-secondary text-foreground hover:bg-secondary-hover mr-2">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm font-medium rounded-md bg-brand-primary text-white hover:bg-brand-secondary">Save Changes</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
export default EditInfoModal;
