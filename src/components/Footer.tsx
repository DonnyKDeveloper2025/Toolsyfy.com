import React, { memo } from 'https://esm.sh/react@18.2.0';

// Reusable components moved outside for performance.

const SocialIcon = ({ href, label, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="text-muted hover:text-brand-primary transition-colors duration-300">
    {children}
  </a>
);

const LinkButton = ({ onClick, children }) => (
    <button onClick={onClick} className="text-muted hover:text-brand-primary transition-colors">
        {children}
    </button>
);


const FooterComponent = ({ authorSettings, onShowInfoModal, onShowSuggestionModal }) => {
  const { authorName, authorBio, authorImageUrl, buyMeACoffeeUrl, twitterUrl, githubUrl, footerText } = authorSettings;

  const renderFooterText = (text) => {
    const year = new Date().getFullYear().toString();
    const replacedText = text.replace('{year}', year);
    const parts = replacedText.split(/(Toolsyfy)/gi);
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

  return (
    <footer className="bg-secondary text-foreground pt-12 pb-8 border-t border-border">
      <div className="container mx-auto px-6">
        
        {/* --- Author Card --- */}
        <div className="bg-background rounded-2xl shadow-xl mx-auto p-6 relative max-w-2xl border-2 border-brand-primary">
            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-8">
                <div className="flex-shrink-0">
                    <img 
                        src={authorImageUrl} 
                        alt={`Photo of ${authorName}`}
                        className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-card ring-4 ring-brand-primary"
                        loading="lazy"
                        decoding="async"
                    />
                </div>
                <div>
                    <p className="text-sm font-bold text-brand-primary uppercase tracking-widest">Created by</p>
                    <h2 className="text-3xl sm:text-4xl font-black text-foreground my-1 tracking-tighter">{authorName}</h2>
                    <div className="text-base sm:text-lg text-muted mt-2 space-y-1">
                        {(authorBio || '').split('\n').map((line, index) => (
                            <p key={index}>{line}</p>
                        ))}
                    </div>
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-6">
                        <div className="flex items-center space-x-4">
                            <h3 className="text-sm font-semibold text-muted">Follow Me:</h3>
                            {/* FIX: Moved icon inside the component as children */}
                            <SocialIcon href={twitterUrl} label="Follow on Twitter">
                                <i data-lucide="twitter" className="w-6 h-6"></i>
                            </SocialIcon>
                             {/* FIX: Moved icon inside the component as children */}
                             <SocialIcon href={githubUrl} label="Follow on GitHub">
                                <i data-lucide="github" className="w-6 h-6"></i>
                            </SocialIcon>
                        </div>
                        <div className="h-6 w-px bg-border hidden sm:block"></div>
                        <a href={buyMeACoffeeUrl} target="_blank" rel="noopener noreferrer" className="inline-block transition-transform hover:scale-105">
                            <img 
                                src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" 
                                alt="Buy Me A Coffee" 
                                className="h-12"
                            />
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <div className="text-center text-sm mt-12">
          <div className="mb-6 w-full max-w-xs mx-auto border-t border-border"></div>
          <div className="flex justify-center items-center flex-wrap gap-x-6 gap-y-2">
              {/* FIX: Moved text inside the component as children */}
              <LinkButton onClick={() => onShowInfoModal('about')}>About Us</LinkButton>
              <LinkButton onClick={() => onShowInfoModal('contact')}>Contact</LinkButton>
              <LinkButton onClick={() => onShowInfoModal('privacy')}>Privacy Policy</LinkButton>
              <LinkButton onClick={() => onShowInfoModal('terms')}>Terms of Service</LinkButton>
              <LinkButton onClick={() => onShowInfoModal('disclaimer')}>Disclaimer</LinkButton>
              <LinkButton onClick={onShowSuggestionModal}>Suggest a Tool</LinkButton>
          </div>
          <p className="mt-6 text-muted">{renderFooterText(footerText || '')}</p>
        </div>
      </div>
    </footer>
  );
};

export const Footer = memo(FooterComponent);