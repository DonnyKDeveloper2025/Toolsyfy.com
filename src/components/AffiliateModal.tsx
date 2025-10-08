import React, { useState, useEffect } from 'react';
import { AffiliateItem } from '../types';

interface AffiliateModalProps {
    modalState: 'add' | AffiliateItem;
    onClose: () => void;
    onSave: (item: AffiliateItem) => void;
}

const AffiliateModal: React.FC<AffiliateModalProps> = ({ modalState, onClose, onSave }) => {
    const isEditMode = typeof modalState !== 'string';
    const itemToEdit = isEditMode ? modalState : null;

    const [item, setItem] = useState<Omit<AffiliateItem, 'id'>>({
        name: '', description: '', link: '', imageUrl: '', callToAction: ''
    });
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (itemToEdit) {
            setItem(itemToEdit);
        }
    }, [itemToEdit]);
    
    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setItem(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...item, id: itemToEdit?.id || '' });
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
              <h2 className="text-xl font-bold text-foreground">{isEditMode ? 'Edit Affiliate Link' : 'Add New Affiliate Link'}</h2>
              <button onClick={handleClose} className="p-2 rounded-full text-muted hover:bg-secondary">
                <i data-lucide="x" className="h-6 w-6"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-muted mb-1">Name</label>
                    <input type="text" name="name" id="name" value={item.name} onChange={handleChange} required className="w-full p-2 bg-card border border-border rounded-md"/>
                  </div>
                   <div>
                    <label htmlFor="callToAction" className="block text-sm font-medium text-muted mb-1">Button Text (CTA)</label>
                    <input type="text" name="callToAction" id="callToAction" value={item.callToAction} onChange={handleChange} required className="w-full p-2 bg-card border border-border rounded-md"/>
                  </div>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-muted mb-1">Description</label>
                <textarea name="description" id="description" value={item.description} onChange={handleChange} required rows={3} className="w-full p-2 bg-card border border-border rounded-md"></textarea>
              </div>
               <div>
                <label htmlFor="link" className="block text-sm font-medium text-muted mb-1">Affiliate URL</label>
                <input type="url" name="link" id="link" value={item.link} onChange={handleChange} required className="w-full p-2 bg-card border border-border rounded-md"/>
              </div>
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-muted mb-1">Image URL</label>
                <input type="url" name="imageUrl" id="imageUrl" value={item.imageUrl} onChange={handleChange} required className="w-full p-2 bg-card border border-border rounded-md"/>
              </div>
              <div className="flex justify-end pt-4 border-t border-border mt-2">
                <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium rounded-md bg-secondary text-foreground hover:bg-secondary-hover mr-2">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium rounded-md bg-brand-primary text-white hover:bg-brand-secondary">{isEditMode ? 'Update Link' : 'Add Link'}</button>
              </div>
            </form>
          </div>
        </div>
    );
};

export default AffiliateModal;