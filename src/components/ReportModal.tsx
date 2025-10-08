import React, { useState, useEffect } from 'react';
import { Report, Tool } from '../types';

interface ReportModalProps {
    onClose: () => void;
    onSubmit: (report: Omit<Report, 'id' | 'timestamp' | 'status'>) => void;
    tools: Tool[];
    initialTool?: string;
}

const ReportModal: React.FC<ReportModalProps> = ({ onClose, onSubmit, tools, initialTool }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [tool, setTool] = useState(initialTool || '');
  const [category, setCategory] = useState('Bug / Not Working');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tool || !description || !category) {
        alert("Please fill out all required fields.");
        return;
    }
    onSubmit({ tool, category, description, email });
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
            <i data-lucide="flag" className="h-6 w-6 text-brand-primary"></i>
            Report an Issue
          </h2>
          <button onClick={handleClose} className="p-2 rounded-full text-muted hover:bg-secondary">
            <i data-lucide="x" className="h-6 w-6"></i>
          </button>
        </div>
        
        {isSubmitted ? (
            <>
                <div className="p-6 sm:p-8 text-center">
                    <i data-lucide="check-circle-2" className="mx-auto h-12 w-12 text-green-500"></i>
                    <h3 className="mt-4 text-lg font-bold text-foreground">Report Submitted</h3>
                    <p className="mt-2 text-muted">
                        Thank you for your feedback! We'll look into the issue as soon as possible.
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
                        <label htmlFor="report-tool" className="block text-sm font-medium text-muted mb-1">Tool with an Issue</label>
                        <select
                            id="report-tool"
                            value={tool}
                            onChange={(e) => setTool(e.target.value)}
                            required
                            className="w-full p-2 bg-card border border-border rounded-md text-foreground focus:ring-brand-primary focus:border-brand-primary"
                        >
                            <option value="" disabled>-- Select a tool --</option>
                            <option value="General Site Issue">General Site Issue</option>
                            {tools.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="report-category" className="block text-sm font-medium text-muted mb-1">Issue Category</label>
                        <select
                            id="report-category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                            className="w-full p-2 bg-card border border-border rounded-md text-foreground focus:ring-brand-primary focus:border-brand-primary"
                        >
                            <option>Bug / Not Working</option>
                            <option>Broken Link</option>
                            <option>Incorrect Information</option>
                            <option>Spelling / Grammar</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="report-desc" className="block text-sm font-medium text-muted mb-1">Describe the Issue</label>
                        <textarea
                            id="report-desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            rows={5}
                            className="w-full p-2 bg-card border border-border rounded-md text-foreground focus:ring-brand-primary focus:border-brand-primary"
                            placeholder="Please be as specific as possible. What were you trying to do? What went wrong? Include any error messages."
                        ></textarea>
                    </div>
                     <div>
                        <label htmlFor="report-email" className="block text-sm font-medium text-muted mb-1">Your Email (Optional)</label>
                        <input
                            type="email"
                            id="report-email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 bg-card border border-border rounded-md text-foreground focus:ring-brand-primary focus:border-brand-primary"
                            placeholder="So we can follow up with you if needed."
                        />
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-end items-center gap-2 p-4 border-t border-border">
                    <button type="button" onClick={handleClose} className="w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-md bg-secondary text-foreground hover:bg-secondary-hover">Cancel</button>
                    <button type="submit" className="w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-md bg-brand-primary text-white hover:bg-brand-secondary">
                        Submit Report
                    </button>
                </div>
            </form>
        )}
      </div>
    </div>
  );
};
// FIX: Changed to a default export for compatibility with React.lazy.
export default ReportModal;