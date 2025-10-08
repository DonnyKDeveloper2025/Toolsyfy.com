import React, { useState, useEffect } from 'react';
import { SiteSettings } from '../types';

interface SiteSettingsModalProps {
    settings: SiteSettings;
    onClose: () => void;
    onSave: (settings: SiteSettings) => void;
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


const SiteSettingsModal: React.FC<SiteSettingsModalProps> = ({ settings, onClose, onSave, addToast }) => {
  const [currentSettings, setCurrentSettings] = useState<SiteSettings>(settings);
  const [isClosing, setIsClosing] = useState(false);
  const [loadingAI, setLoadingAI] = useState<string | null>(null);

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
  
  const generateWithAI = async (field: 'siteTitle' | 'metaDescription' | 'metaKeywords') => {
      setLoadingAI(field);
      let prompt = '';
      switch (field) {
          case 'siteTitle':
              prompt = `Generate a concise, catchy, and SEO-friendly site title for a website named "Toolsyfy" which is a collection of over 500 free online tools for developers, marketers, and creators. Return ONLY the title text.`;
              break;
          case 'metaDescription':
              prompt = `Generate an SEO-friendly meta description (under 160 characters) for a website named "Toolsyfy". It offers over 500 free, browser-based tools for various tasks like web development, content creation, and productivity. Return ONLY the description text.`;
              break;
          case 'metaKeywords':
              prompt = `Generate a comma-separated list of 10-15 relevant, SEO-friendly meta keywords for a website named "Toolsyfy" that provides free online tools. Return ONLY the comma-separated string.`;
              break;
      }

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
          setCurrentSettings(prev => ({ ...prev, [field]: text.trim() }));
          addToast(`${field} generated successfully!`, 'success');
      } catch (e: any) {
          console.error("API call error:", e);
          addToast(`Failed to generate content: ${e.message}.`, 'error');
      } finally {
          setLoadingAI(null);
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
          <h2 className="text-xl font-bold text-foreground">Site Settings</h2>
          <button onClick={handleClose} className="p-2 rounded-full text-muted hover:bg-secondary">
            <i data-lucide="x" className="h-6 w-6"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[calc(100vh-12rem)]">
            <h3 className="text-lg font-semibold text-muted border-b border-border pb-2">General & SEO</h3>
            <div className="relative">
                <label htmlFor="siteTitle" className="block text-sm font-medium text-muted mb-1">Site Title</label>
                <input type="text" name="siteTitle" id="siteTitle" value={currentSettings.siteTitle} onChange={handleInputChange} className="w-full p-2 bg-card border border-border rounded-md text-foreground focus:ring-brand-primary focus:border-brand-primary"/>
                <AIGenerateButton onClick={() => generateWithAI('siteTitle')} isLoading={loadingAI === 'siteTitle'} />
            </div>
            <div className="relative">
                <label htmlFor="metaDescription" className="block text-sm font-medium text-muted mb-1">Meta Description</label>
                <textarea name="metaDescription" id="metaDescription" value={currentSettings.metaDescription} onChange={handleInputChange} rows={3} className="w-full p-2 bg-card border border-border rounded-md text-foreground focus:ring-brand-primary focus:border-brand-primary"></textarea>
                <AIGenerateButton onClick={() => generateWithAI('metaDescription')} isLoading={loadingAI === 'metaDescription'} />
            </div>
             <div className="relative">
                <label htmlFor="metaKeywords" className="block text-sm font-medium text-muted mb-1">Meta Keywords (comma-separated)</label>
                <input type="text" name="metaKeywords" id="metaKeywords" value={currentSettings.metaKeywords} onChange={handleInputChange} className="w-full p-2 bg-card border border-border rounded-md text-foreground focus:ring-brand-primary focus:border-brand-primary"/>
                <AIGenerateButton onClick={() => generateWithAI('metaKeywords')} isLoading={loadingAI === 'metaKeywords'} />
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
export default SiteSettingsModal;