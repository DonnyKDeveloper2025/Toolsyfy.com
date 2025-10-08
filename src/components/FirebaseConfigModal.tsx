import React, { useState, useEffect } from 'react';
import { FirebaseSettings } from '../types';

interface FirebaseConfigModalProps {
    settings: FirebaseSettings;
    onClose: () => void;
    onSave: (settings: FirebaseSettings) => void;
}

const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({ settings, onClose, onSave }) => {
  const [currentSettings, setCurrentSettings] = useState<FirebaseSettings>(settings);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(currentSettings).some(val => typeof val === 'string' && val.includes('YOUR_'))) {
        if (!window.confirm("Some fields still contain default placeholder values. Are you sure you want to save? This may disable authentication.")) {
            return;
        }
    }
    onSave(currentSettings);
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
          <h2 className="text-xl font-bold text-foreground">Firebase Configuration</h2>
          <button onClick={handleClose} className="p-2 rounded-full text-muted hover:bg-secondary transition-colors">
            <i data-lucide="x" className="h-6 w-6"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[calc(100vh-12rem)]">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                <div className="flex">
                    <div className="py-1 flex-shrink-0">
                        <svg className="h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div>
                        <p className="font-bold">Security Warning</p>
                        <p className="text-sm">
                            These keys control your Firebase project. Incorrect values will break user login. <strong>Never share these keys publicly.</strong> After saving, the page will reload to apply the new configuration.
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="apiKey" className="block text-sm font-medium text-muted mb-1">API Key</label>
                    <input type="text" name="apiKey" id="apiKey" value={currentSettings.apiKey} onChange={handleInputChange} className="w-full p-2 bg-card border border-border rounded-md text-foreground focus:ring-brand-primary focus:border-brand-primary"/>
                </div>
                 <div>
                    <label htmlFor="authDomain" className="block text-sm font-medium text-muted mb-1">Auth Domain</label>
                    <input type="text" name="authDomain" id="authDomain" value={currentSettings.authDomain} onChange={handleInputChange} className="w-full p-2 bg-card border border-border rounded-md text-foreground focus:ring-brand-primary focus:border-brand-primary"/>
                </div>
                 <div>
                    <label htmlFor="projectId" className="block text-sm font-medium text-muted mb-1">Project ID</label>
                    <input type="text" name="projectId" id="projectId" value={currentSettings.projectId} onChange={handleInputChange} className="w-full p-2 bg-card border border-border rounded-md text-foreground focus:ring-brand-primary focus:border-brand-primary"/>
                </div>
                 <div>
                    <label htmlFor="storageBucket" className="block text-sm font-medium text-muted mb-1">Storage Bucket</label>
                    <input type="text" name="storageBucket" id="storageBucket" value={currentSettings.storageBucket} onChange={handleInputChange} className="w-full p-2 bg-card border border-border rounded-md text-foreground focus:ring-brand-primary focus:border-brand-primary"/>
                </div>
                 <div>
                    <label htmlFor="messagingSenderId" className="block text-sm font-medium text-muted mb-1">Messaging Sender ID</label>
                    <input type="text" name="messagingSenderId" id="messagingSenderId" value={currentSettings.messagingSenderId} onChange={handleInputChange} className="w-full p-2 bg-card border border-border rounded-md text-foreground focus:ring-brand-primary focus:border-brand-primary"/>
                </div>
                 <div>
                    <label htmlFor="appId" className="block text-sm font-medium text-muted mb-1">App ID</label>
                    <input type="text" name="appId" id="appId" value={currentSettings.appId} onChange={handleInputChange} className="w-full p-2 bg-card border border-border rounded-md text-foreground focus:ring-brand-primary focus:border-brand-primary"/>
                </div>
            </div>
          
          <div className="flex justify-end pt-4 border-t border-border mt-4">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium rounded-md bg-secondary text-foreground hover:bg-secondary-hover mr-2">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium rounded-md bg-brand-primary text-white hover:bg-brand-secondary">Save and Reload</button>
          </div>
        </form>
      </div>
    </div>
  );
};
// FIX: Changed to a default export for compatibility with React.lazy.
export default FirebaseConfigModal;