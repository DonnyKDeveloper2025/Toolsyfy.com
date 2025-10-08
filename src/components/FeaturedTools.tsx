import React, { memo } from 'react';
import { CategoryIcons } from '../constants/icons';

const FeaturedToolCard = memo(({ tool, isSpotlight = false }) => {
    if (!tool) return null;

    return (
        <a href={tool.link} className={`block p-4 rounded-xl transition-all duration-300 ${isSpotlight ? 'bg-brand-primary text-white hover:bg-brand-secondary' : 'bg-secondary hover:bg-secondary-hover'}`}>
            <div className="flex items-center gap-4">
                <div className={`flex-shrink-0 p-2 rounded-lg ${isSpotlight ? 'bg-white/20' : 'bg-card'}`}>
                    <div className={isSpotlight ? 'text-white' : 'text-brand-primary'}>
                      <i data-lucide={CategoryIcons[tool.category]} className="h-6 w-6"></i>
                    </div>
                </div>
                <div>
                    <h4 className={`font-bold ${isSpotlight ? 'text-white' : 'text-foreground'}`}>{tool.name}</h4>
                    <p className={`text-sm ${isSpotlight ? 'text-orange-100' : 'text-muted'}`}>{tool.description}</p>
                </div>
            </div>
        </a>
    );
});

const FeaturedToolsComponent = ({ tools, layoutSettings, toolOfTheDay, featuredTools }) => {
    const { showToolOfTheDay, showFeaturedTools, customToolOfTheDay, customFeaturedTools } = layoutSettings;

    // Determine the final tool of the day
    const finalToolOfTheDay = customToolOfTheDay
        ? tools.find(t => t.name === customToolOfTheDay) || toolOfTheDay
        : toolOfTheDay;

    // Determine the final list of featured tools
    const finalFeaturedTools = customFeaturedTools && customFeaturedTools.length > 0
        ? customFeaturedTools.map(name => tools.find(t => t.name === name)).filter((t) => !!t)
        : featuredTools;
        
    if (!showToolOfTheDay && !showFeaturedTools) {
        return null;
    }

    return (
        <div className="mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {showToolOfTheDay && (
                    <div className="lg:col-span-1">
                        <h3 className="text-xl font-bold text-foreground mb-4">Tool of the Day ✨</h3>
                        <FeaturedToolCard tool={finalToolOfTheDay} isSpotlight={true} />
                    </div>
                )}
                {showFeaturedTools && (
                    <div className={showToolOfTheDay ? "lg:col-span-2" : "lg:col-span-3"}>
                        <h3 className="text-xl font-bold text-foreground mb-4">Popular Tools 🔥</h3>
                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!showToolOfTheDay ? 'lg:grid-cols-4' : ''}`}>
                            {finalFeaturedTools.slice(0, 4).map(tool => (
                                <FeaturedToolCard key={tool.name} tool={tool} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const FeaturedTools = memo(FeaturedToolsComponent);