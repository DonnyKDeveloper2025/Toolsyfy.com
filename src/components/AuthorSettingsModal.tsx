import React, { useState, useEffect } from 'react';
import { AuthorSettings } from '../types';

interface AuthorSettingsModalProps {
    settings: AuthorSettings;
    onClose: () => void;
    onSave: (settings: AuthorSettings) => void;
    addToast: (message: string, type: 'success' | 'error') => void;
}

const AIGenerateButton: React.FC<{ onClick: () => void, isLoading: boolean }> = ({ onClick, isLoading }) => (
    <button type="button" onClick={onClick} disabled={isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 disabled:opacity-50">
        {isLoading ? (
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-4 h-4">
                <circle cx="4" cy="12" r="3"><animate id="a" begin="0;s.end" attributeName="r" dur="0.6s" values="3;1;3" fill="freeze" /></circle>
                <circle cx="12" cy="12" r="3"><animate begin="a.begin+0.15s" attributeName="r" dur="0.6s" values="3;1;3" fill="freeze" /></circle>
                <circle cx="20" cy="12" r="3"><animate id="s" begin="a.begin+0.3s" attributeName="r" dur="0.6s" values="3;1;3" fill="freeze" /></circle>
            </svg>
        ) : (
            <i data-lucide="wand-2" className="h-4 w-4"></i>
        )}
    </button>
);

const AuthorSettingsModal: React.FC<AuthorSettingsModalProps> = ({ settings, onClose, onSave, addToast }) => {
  const [currentSettings, setCurrentSettings] = useState<AuthorSettings>(settings);
  const [isClosing, setIsClosing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(currentSettings);
    handleClose();
  };
  
  const generateBioWithAI = async () => {
      setIsGenerating(true);
      const prompt = `Rewrite the following author bio in an engaging and professional tone, suitable for a "created by" section on a website called "Toolsyfy". The author's name is ${currentSettings.authorName || 'the creator'}. If the bio is empty, create a new one based on a developer who loves building helpful tools. The output should be 3 short, separate lines, each on a new line. Current bio: "${currentSettings.authorBio}"`;
      
      try {
          const apiResponse = await fetch('/api/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ contents: prompt })
          });

          if (!apiResponse.ok) {
              const errorData = await apiResponse.json();
              throw new Error(errorData.error || `API Error: ${apiResponse.statusText}`);
          }

          const { text } = await apiResponse.json();
          setCurrentSettings(prev => ({ ...prev, authorBio: text.trim() }));
          addToast('Author bio generated!', 'success');
      } catch (e: any) {
          console.error("API call error:", e);
          addToast(`Failed to generate author bio: ${e.message}.`, 'error');
      } finally {
          setIsGenerating(false);
      }
  };
  
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.keyCode === 27) handleClose();
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
      className={`fixed inset-0 modal-overlay z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${animationClass}`}
      onClick={handleClose}
    >
      <div 
        className={`bg-card rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col transition-all ${modalAnimationClass}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Author & Footer Settings</h2>
          <button onClick={handleClose} className="p-2 rounded-full text-muted hover:bg-secondary transition-colors">
            <i data-lucide="x" className="h-6 w-6"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[calc(100vh-12rem)]">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Author Card</h3>
            <div>
                <label htmlFor="authorName" className="block text-sm font-medium text-muted mb-1">Author Name</label>
                <input type="text" name="authorName" id="authorName" value={currentSettings.authorName} onChange={handleInputChange} className="w-full p-2 bg-card border border-border rounded-md text-foreground focus:ring-brand-primary focus:border-brand-primary"/>
            </div>
             <div className="relative">
                <label htmlFor="authorBio" className="block text-sm font-medium text-muted mb-1">Author Bio (use line breaks for new lines)</label>
                <textarea name="authorBio" id="authorBio" value={currentSettings.authorBio} onChange={handleInputChange} rows={4} className="w-full p-2 bg-card border border-border rounded-md text-foreground focus:ring-brand-primary focus:border-brand-primary"/>
                <AIGenerateButton onClick={generateBioWithAI} isLoading={isGenerating} />
            </div>
            <div>
                <label htmlFor="authorImageUrl" className="block text-sm font-medium text-muted mb-1">Author Image URL</label>
                <input type="url" name="authorImageUrl" id="authorImageUrl" value={currentSettings.authorImageUrl} onChange={handleInputChange} className="w-full p-2 bg-card border border-border rounded-md text-foreground focus:ring-brand-primary focus:border-brand-primary"/>
            </div>
             <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2 pt-4">Social & Support Links</h3>
             <div>
                <label htmlFor="buyMeACoffeeUrl" className="block text-sm font-medium text-muted mb-1">"Buy Me a Coffee" URL</label>
                <input type="url" name="buyMeACoffeeUrl" id="buyMeACoffeeUrl" value={currentSettings.buyMeACoffeeUrl} onChange={handleInputChange} className="w-full p-2 bg-card border border-border rounded-md text-foreground focus:ring-brand-primary focus:border-brand-primary"/>
            </div>
            <div>
                <label htmlFor="twitterUrl" className="block text-sm font-medium text-muted mb-1">Twitter URL</label>
                <input type="url" name="twitterUrl" id="twitterUrl" value={currentSettings.twitterUrl} onChange={handleInputChange} className="w-full p-2 bg-card border border-border rounded-md text-foreground focus:ring-brand-primary focus:border-brand-primary"/>
            </div>
             <div>
                <label htmlFor="githubUrl" className="block text-sm font-medium text-muted mb-1">GitHub URL</label>
                <input type="url" name="githubUrl" id="githubUrl" value={currentSettings.githubUrl} onChange={handleInputChange} className="w-full p-2 bg-card border border-border rounded-md text-foreground focus:ring-brand-primary focus:border-brand-primary"/>
            </div>
             <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2 pt-4">Footer</h3>
            <div>
                <label htmlFor="footerText" className="block text-sm font-medium text-muted mb-1">Footer Text</label>
                <input type="text" name="footerText" id="footerText" value={currentSettings.footerText} onChange={handleInputChange} className="w-full p-2 bg-card border border-border rounded-md text-foreground focus:ring-brand-primary focus:border-brand-primary"/>
                 <p className="text-xs text-muted mt-1">Use {'{year}'} to automatically insert the current year.</p>
            </div>
          
          <div className="flex justify-end pt-4 border-t border-border mt-4">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium rounded-md bg-secondary text-foreground hover:bg-secondary-hover mr-2">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium rounded-md bg-brand-primary text-white hover:bg-brand-secondary">Save Settings</button>
          </div>
        </form>
      </div>
    </div>
  );
};
// FIX: Changed to a default export for compatibility with React.lazy.
export default AuthorSettingsModal;