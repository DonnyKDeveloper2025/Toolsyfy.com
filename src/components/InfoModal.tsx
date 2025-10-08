import React, { useState, useEffect } from 'react';

const renderTitleWithHighlight = (titleText) => {
    const parts = titleText.split(/(Toolsyfy)/gi);
    return parts.map((part, index) =>
        part.toLowerCase() === 'toolsyfy' ? (
            <span key={index} className="text-brand-primary">
                {part}
            </span>
        ) : (
            part
        )
    );
};

const renderContentWithHighlight = (text) => {
    const styleToolsyfy = (line) => {
        const parts = line.split(/(Toolsyfy)/gi);
        return parts.map((part, index) =>
            part.toLowerCase() === 'toolsyfy' ? (
                <span key={index} className="font-semibold text-brand-primary">
                    {part}
                </span>
            ) : (
                part
            )
        );
    };
    
    const headingClasses = "text-xl font-bold text-slate-800 mb-2";
    const paragraphClasses = "mb-4 text-slate-600 whitespace-pre-wrap";
    
    return text.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h3 key={index} className={headingClasses}>{styleToolsyfy(line.substring(2))}</h3>;
      }
      return <p key={index} className={paragraphClasses}>{styleToolsyfy(line) || '\u00A0'}</p>;
    });
};


const InfoModal = ({ title, content, onClose, isAdmin, onEdit }) => {
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
          <h2 className="text-xl font-bold text-foreground">{renderTitleWithHighlight(title)}</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full text-muted hover:bg-secondary transition-colors"
            aria-label={`Close ${title} modal`}
          >
            <i data-lucide="x" className="h-6 w-6"></i>
          </button>
        </div>
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[calc(100vh-12rem)]">
          {renderContentWithHighlight(content)}
        </div>
        <div className="flex justify-end items-center p-4 border-t border-border flex-shrink-0 gap-2">
            {isAdmin && onEdit && (
               <button type="button" onClick={onEdit} className="px-4 py-2 text-sm font-medium rounded-md bg-secondary text-foreground hover:bg-secondary-hover mr-auto">Edit</button>
            )}
            <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium rounded-md bg-brand-primary text-white hover:bg-brand-secondary">Close</button>
        </div>
      </div>
    </div>
  );
};
export default InfoModal;
