import React, { useState, useEffect } from 'react';
import { Category, Tool } from '../types';
import { SwitchToggle } from './App';

interface ToolModalProps {
    toolState: { mode: 'add', prefill?: Partial<Tool> } | { mode: 'edit', tool: Tool };
    categories: string[];
    onClose: () => void;
    onSave: (originalName: string | null, toolData: Tool) => void;
}

const AIGenerateButton: React.FC<{ onClick: () => void, isLoading: boolean, disabled?: boolean }> = ({ onClick, isLoading, disabled = false }) => (
    <button type="button" onClick={onClick} disabled={isLoading || disabled} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed">
        {isLoading ? (
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-5 h-5"><circle cx="4" cy="12" r="3"><animate id="a" begin="0;s.end" attributeName="r" dur="0.6s" values="3;1;3" fill="freeze" /></circle><circle cx="12" cy="12" r="3"><animate begin="a.begin+0.15s" attributeName="r" dur="0.6s" values="3;1;3" fill="freeze" /></circle><circle cx="20" cy="12" r="3"><animate id="s" begin="a.begin+0.3s" attributeName="r" dur="0.6s" values="3;1;3" fill="freeze" /></circle></svg>
        ) : (
            <i data-lucide="wand-2" className="h-5 w-5"></i>
        )}
        {isLoading ? 'Generating...' : '✨ AI Generate'}
    </button>
);


const ToolModal: React.FC<ToolModalProps> = ({ toolState, categories, onClose, onSave }) => {
  const isEditMode = toolState.mode === 'edit';
  const initialTool: Partial<Tool> = isEditMode ? toolState.tool : (toolState.prefill || {});

  const [tool, setTool] = useState<Partial<Tool>>({
    name: '',
    description: '',
    category: categories[0],
    link: '',
    tags: [],
    ...initialTool,
  });
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        setTool(prev => ({...prev, [(e.target as HTMLInputElement).name]: (e.target as HTMLInputElement).checked}));
    } else {
        setTool(prev => ({...prev, [name]: value}));
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const tags = e.target.value.split(',').map(tag => tag.trim());
      setTool(prev => ({...prev, tags}));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tool.name || !tool.category || !tool.link || !tool.description) {
      alert('Please fill all required fields.');
      return;
    }
    onSave(isEditMode ? toolState.tool.name : null, tool as Tool);
  };

   const animationClass = isClosing ? 'opacity-0' : 'opacity-100';
   const modalAnimationClass = isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100';

  return (
    <div 
      className={`fixed inset-0 modal-overlay z-[998] flex justify-center items-center p-4 transition-opacity duration-300 ${animationClass}`}
      onClick={handleClose}
    >
      <div 
        className={`bg-card rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col transition-all ${modalAnimationClass}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">{isEditMode ? 'Edit Tool' : 'Add New Tool'}</h2>
          <button onClick={handleClose} className="p-2 rounded-full text-muted hover:bg-secondary">
            <i data-lucide="x" className="h-6 w-6"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(100vh-12rem)]">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-muted mb-1">Tool Name</label>
            <input type="text" name="name" id="name" value={tool.name} onChange={handleChange} required className="w-full p-2 bg-card border border-border rounded-md"/>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-muted mb-1">Description</label>
            <textarea name="description" id="description" value={tool.description} onChange={handleChange} required rows={3} className="w-full p-2 bg-card border border-border rounded-md"></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-muted mb-1">Category</label>
                <select name="category" id="category" value={tool.category} onChange={handleChange} required className="w-full p-2 bg-card border border-border rounded-md">
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
               <div>
                <label htmlFor="link" className="block text-sm font-medium text-muted mb-1">Link</label>
                <input type="text" name="link" id="link" value={tool.link} onChange={handleChange} required className="w-full p-2 bg-card border border-border rounded-md" placeholder="/tools/new-tool/index.html"/>
              </div>
          </div>
          <div>
              <label htmlFor="tags" className="block text-sm font-medium text-muted mb-1">Tags (comma-separated)</label>
              <input type="text" name="tags" id="tags" value={tool.tags?.join(', ')} onChange={handleTagsChange} className="w-full p-2 bg-card border border-border rounded-md"/>
          </div>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-border">
                <SwitchToggle label="Login Required" checked={!!tool.loginRequired} onChange={() => setTool(p=>({...p, loginRequired: !p.loginRequired}))} uniqueId="tool-login-req" />
                <SwitchToggle label="Ads Disabled" checked={!!tool.adsDisabled} onChange={() => setTool(p=>({...p, adsDisabled: !p.adsDisabled}))} uniqueId="tool-ads-disabled" />
                <SwitchToggle label="Sponsored" checked={!!tool.isSponsored} onChange={() => setTool(p=>({...p, isSponsored: !p.isSponsored}))} uniqueId="tool-sponsored" />
            </div>

          <div className="flex justify-end pt-4 border-t border-border mt-2">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium rounded-md bg-secondary text-foreground hover:bg-secondary-hover mr-2">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium rounded-md bg-brand-primary text-white hover:bg-brand-secondary">{isEditMode ? 'Save Changes' : 'Add Tool'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
// FIX: Changed to a default export for compatibility with React.lazy.
export default ToolModal;
