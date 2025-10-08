import React from 'react';
import { AffiliateItem } from '../types';

interface AffiliateSectionProps {
    affiliates: AffiliateItem[];
}

const AffiliateCard: React.FC<{ item: AffiliateItem }> = ({ item }) => (
    <div className="bg-card rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-border">
        <div className="md:flex">
            <div className="md:flex-shrink-0">
                <img className="h-48 w-full object-cover md:w-48 bg-secondary" src={item.imageUrl} alt={item.name} />
            </div>
            <div className="p-6 flex flex-col justify-between">
                <div>
                    <div className="uppercase tracking-wide text-sm text-brand-primary font-semibold">{item.name}</div>
                    <p className="mt-2 text-muted">{item.description}</p>
                </div>
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-md hover:bg-brand-secondary text-center">
                    {item.callToAction}
                </a>
            </div>
        </div>
    </div>
);


export const AffiliateSection: React.FC<AffiliateSectionProps> = ({ affiliates }) => {
    return (
        <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">
                Featured Products & Services
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {affiliates.map(item => (
                    <AffiliateCard key={item.id} item={item} />
                ))}
            </div>
        </div>
    );
};