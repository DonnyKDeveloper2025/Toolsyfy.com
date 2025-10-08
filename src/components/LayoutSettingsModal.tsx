import React, { useState, useEffect } from 'react';
import { LayoutSettings, Tool } from '../types';
import { SwitchToggle } from './App';

interface LayoutSettingsModalProps {
    settings: LayoutSettings;
    allTools: Tool[];
    onClose: () => void;
    onSave: (settings: LayoutSettings) => void;
}

const LayoutSettingsModal: React.FC<LayoutSettingsModalProps> = ({ settings, allTools, onClose, onSave }) => {
  const [currentSettings, setCurrentSettings] = useState<LayoutSettings>(settings);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };
  
  const handleToggle = (key: keyof Pick<LayoutSettings, 'showToolOfTheDay' | 'showFeaturedTools' | 'showAffiliateSection'>) => {
      setCurrentSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, options } = e.target;
    const value: string[] = [];
    for (let i = 0, l = options.length; i < l; i++) {
        if (options[i].selected) {
            value.push(options[i].value);
        }
    }
    setCurrentSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(currentSettings);
    handleClose();
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
          <h2 className="text-xl font-bold text-foreground">Homepage Layout Settings</h2>
          <button onClick={handleClose} className="p-2 rounded-full text-muted hover:bg-secondary">
            <i data-lucide="x" className="h-6 w-6"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[calc(100vh-12rem)]">
            <h3 className="text-lg font-semibold text-muted border-b border-border pb-2">Section Visibility</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SwitchToggle label="Tool of the Day" checked={currentSettings.showToolOfTheDay} onChange={() => handleToggle('showToolOfTheDay')} uniqueId="show-totd" />
                <SwitchToggle label="Featured Tools" checked={currentSettings.showFeaturedTools} onChange={() => handleToggle('showFeaturedTools')} uniqueId="show-featured" />
                <SwitchToggle label="Affiliate Section" checked={currentSettings.showAffiliateSection} onChange={() => handleToggle('showAffiliateSection')} uniqueId="show-affiliate" />
            </div>

            <h3 className="text-lg font-semibold text-muted border-b border-border pb-2 pt-4">Content Customization</h3>
            <div>
                <label htmlFor="customToolOfTheDay" className="block text-sm font-medium text-muted mb-1">Custom Tool of the Day (Optional)</label>
                <select name="customToolOfTheDay" id="customToolOfTheDay" value={currentSettings.customToolOfTheDay} onChange={handleSelectChange} className="w-full p-2 bg-card border border-border rounded-md">
                    <option value="">Default (Date-based)</option>
                    {allTools.map(tool => <option key={tool.name} value={tool.name}>{tool.name}</option>)}
                </select>
            </div>
             <div>
                <label htmlFor="customFeaturedTools" className="block text-sm font-medium text-muted mb-1">Custom Featured Tools (Optional, select up to 4)</label>
                <select 
                    name="customFeaturedTools" 
                    id="customFeaturedTools" 
                    multiple 
                    value={currentSettings.customFeaturedTools} 
                    onChange={handleMultiSelectChange} 
                    className="w-full p-2 bg-card border border-border rounded-md h-40"
                >
                    {allTools.map(tool => <option key={tool.name} value={tool.name}>{tool.name}</option>)}
                </select>
                <p className="text-xs text-muted mt-1">Hold Ctrl/Cmd to select multiple. If empty, it defaults to the most clicked tools.</p>
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

export default LayoutSettingsModal;
