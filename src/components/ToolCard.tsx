import React, { useState, forwardRef, memo } from 'react';
import { CategoryIcons } from '../constants/icons';

// --- Reusable Action Button for Accessibility ---
const ToolCardActionButton = ({ onClick, 'aria-label': ariaLabel, title, className = '', children }) => {
    
    const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick(e);
    };

    return (
        <div className="relative group">
            <button
                type="button"
                onClick={handleClick}
                aria-label={ariaLabel}
                className={`p-2 rounded-full cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-110 ${className}`}
            >
                {children}
            </button>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-foreground text-background text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 pointer-events-none z-30">
                {title}
            </span>
        </div>
    );
};


const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
);

const AdminIndexBadge = ({ index }) => (
    <div className="bg-brand-primary text-white text-xs font-bold px-2 py-1 rounded-full pointer-events-none">
        #{index + 1}
    </div>
);

const ToolCardComponent = forwardRef(({ tool, isAdmin = false, onToolEdit, onToolClick, isFavorite, onToggleFavorite, isHighlighted, toolIndex, isLoggedIn, onLoginClick, onShowInfo, onReportIssue }, ref) => {
  const { name, description, category, link, loginRequired, tags, isSponsored } = tool;
  const iconName = CategoryIcons[category];
  const [isPopping, setIsPopping] = useState(false);
  const [copyStatus, setCopyStatus] = useState('Copy link');


  const handleClick = (e) => {
    if (loginRequired && !isLoggedIn) {
        e.preventDefault();
        onLoginClick();
    } else {
        onToolClick(name);
    }
  };


  const handleShare = async (e) => {
    const shareData = {
      title: `${tool.name} - Toolsyfy`,
      text: `${tool.description} Check it out on Toolsyfy!`,
      url: window.location.origin + tool.link,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
        try {
            await navigator.clipboard.writeText(shareData.url);
            alert('Sharing failed. Link copied to clipboard!');
        } catch (copyErr) {
            alert('Could not share or copy link.');
        }
      }
    }
  };

  const handleCopyLink = (e) => {
    const toolUrl = window.location.origin + tool.link;
    navigator.clipboard.writeText(toolUrl).then(() => {
        setCopyStatus('Copied!');
        setTimeout(() => setCopyStatus('Copy link'), 2000);
    }, () => {
        setCopyStatus('Failed to copy!');
        setTimeout(() => setCopyStatus('Copy link'), 2000);
    });
  };
  
  const EditButton = () => (
    isAdmin && onToolEdit && (
      <div 
        role="button"
        tabIndex={0}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToolEdit(tool); }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onToolEdit(tool); } }}
        className="absolute top-2 right-2 p-2 rounded-full bg-secondary text-muted hover:bg-secondary-hover hover:text-brand-primary transition-colors z-20 cursor-pointer"
        aria-label={`Edit ${name}`}
      >
        <i data-lucide="edit-3" className="h-5 w-5"></i>
      </div>
    )
  );
  
  const handleFavoriteClick = (e) => {
    onToggleFavorite(tool.name);
    if (!isFavorite) {
        setIsPopping(true);
        setTimeout(() => setIsPopping(false), 300);
    }
  };

  return (
    <a 
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        ref={ref}
        className={`bg-card border border-border rounded-xl p-4 sm:p-5 flex flex-col h-full relative shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:border-brand-primary block group/card active:scale-[0.98] ${isHighlighted ? 'highlight-tool' : ''}`}
        aria-label={`Open tool: ${name}`}
      >
        <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5">
            {isAdmin && typeof toolIndex === 'number' && <AdminIndexBadge index={toolIndex} />}
        </div>
        
        {isSponsored && (
            <div className="absolute top-2 right-2 text-xs font-bold bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full z-10">
                Sponsored
            </div>
        )}

        {/* --- Card Content --- */}
        <h3 className="text-lg sm:text-xl font-bold text-foreground pr-4 group-hover/card:text-brand-primary transition-colors mb-1">{name}</h3>
        
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-brand-primary font-semibold min-w-0">
                <span className="truncate" title={category}>{category}</span>
                {loginRequired && <span className="text-muted flex-shrink-0" title="Login required"><LockIcon /></span>}
            </div>
            <div className="text-brand-primary flex-shrink-0">
                <i data-lucide={iconName} className="h-6 w-6"></i>
            </div>
        </div>

        <p className="text-muted text-sm line-clamp-3 mb-4">{description}</p>
        
        {tags && tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
                {tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs font-medium text-muted bg-secondary px-2 py-1 rounded-full">
                        {tag}
                    </span>
                ))}
                {tags.length > 3 && (
                     <span className="text-xs font-bold text-muted bg-secondary px-2 py-1 rounded-full">
                        +{tags.length - 3} more
                    </span>
                )}
            </div>
        )}

        {/* --- Footer Actions (pushed to bottom) --- */}
        <div className="mt-auto pt-4 border-t border-border">
            <div className="flex items-center justify-around text-muted">
                {/* FIX: Moved icon inside the component as children */}
                <ToolCardActionButton
                    onClick={handleFavoriteClick}
                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    className={`transition-colors ${isFavorite ? 'text-red-500 bg-red-100' : 'hover:bg-red-100 hover:text-red-500'}`}
                >
                    <div className={isPopping ? 'animate-pop' : ''}>
                      <i data-lucide="heart" className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`}></i>
                    </div>
                </ToolCardActionButton>
                
                {/* FIX: Moved icon inside the component as children */}
                <ToolCardActionButton
                    onClick={(e) => onShowInfo(tool.name)}
                    aria-label="How to use"
                    title="How to use"
                    className="hover:bg-green-100 hover:text-green-600"
                >
                    <i data-lucide="info" className="h-5 w-5"></i>
                </ToolCardActionButton>
                
                {/* FIX: Moved icon inside the component as children */}
                <ToolCardActionButton
                    onClick={handleCopyLink}
                    aria-label="Copy link"
                    title={copyStatus}
                    className="hover:bg-blue-100 hover:text-blue-500"
                >
                    <i data-lucide="link" className="h-5 w-5"></i>
                </ToolCardActionButton>

                {/* FIX: Moved icon inside the component as children */}
                <ToolCardActionButton
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onReportIssue(tool.name); }}
                    aria-label="Report issue"
                    title="Report issue"
                    className="hover:bg-yellow-100 hover:text-yellow-600"
                >
                     <i data-lucide="flag" className="h-5 w-5"></i>
                </ToolCardActionButton>

                {/* FIX: Moved icon inside the component as children */}
                <ToolCardActionButton
                    onClick={handleShare}
                    aria-label="Share tool"
                    title="Share tool"
                    className="hover:bg-sky-100 hover:text-sky-500"
                >
                    <i data-lucide="share-2" className="h-5 w-5"></i>
                </ToolCardActionButton>
            </div>
        </div>
    </a>
  );
});

ToolCardComponent.displayName = 'ToolCard';
export const ToolCard = memo(ToolCardComponent);