import React from 'react';
import { Tool, ToolStatus } from '../types';
import { SwitchToggle } from './App';

interface ToolAdminCardProps {
    tool: Tool;
    status: ToolStatus;
    onEdit: (tool: Tool) => void;
    onDelete: (toolName: string) => void;
    onToggleLoginRequired: (toolName: string) => void;
    onToggleAdsDisabled: (toolName: string) => void;
    onToggleIsSponsored: (toolName: string) => void;
}

const StatusIndicator: React.FC<{ status: ToolStatus }> = ({ status }) => {
    switch (status) {
        case 'live':
            return <div className="w-2.5 h-2.5 rounded-full bg-green-500" title="Live: File found at link." />;
        case 'dead':
            return <div className="w-2.5 h-2.5 rounded-full bg-red-500" title="Error: File not found (404) or invalid link." />;
        case 'scanning':
            return <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" title="Scanning..." />;
        case 'unchecked':
        default:
            return <div className="w-2.5 h-2.5 rounded-full bg-slate-400" title="Status unchecked. Run a scan." />;
    }
};

export const ToolAdminCard: React.FC<ToolAdminCardProps> = ({ tool, status, onEdit, onDelete, onToggleLoginRequired, onToggleAdsDisabled, onToggleIsSponsored }) => {
    
    const handleOpen = () => {
        if (status === 'live') {
            window.open(tool.link, '_blank');
        }
    };
    
    // Create a sanitized version of the tool name to be used in HTML IDs.
    const sanitizedToolName = tool.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');

    return (
        <div className="bg-card border border-border rounded-lg p-4 flex flex-col h-full shadow-sm">
            <div className="flex-grow">
                <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                         <StatusIndicator status={status} />
                        <h3 className="font-bold text-foreground truncate" title={tool.name}>{tool.name}</h3>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={handleOpen} disabled={status !== 'live'} title="Open Tool Page" className="p-1.5 rounded-md hover:bg-secondary text-muted disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Open"><i data-lucide="external-link" className="h-4 w-4"></i></button>
                        <button onClick={() => onEdit(tool)} title="Edit Tool" className="p-1.5 rounded-md hover:bg-secondary text-blue-600" aria-label="Edit"><i data-lucide="edit-3" className="h-4 w-4"></i></button>
                        <button onClick={() => onDelete(tool.name)} title="Delete Tool" className="p-1.5 rounded-md hover:bg-secondary text-red-600" aria-label="Delete"><i data-lucide="trash-2" className="h-4 w-4"></i></button>
                    </div>
                </div>
                <p className="text-xs text-brand-primary font-semibold mt-1">{tool.category}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <SwitchToggle
                    label="Login Req."
                    checked={!!tool.loginRequired}
                    onChange={() => onToggleLoginRequired(tool.name)}
                    uniqueId={`login-${sanitizedToolName}`}
                />
                <SwitchToggle
                    label="Ads Off"
                    checked={!!tool.adsDisabled}
                    onChange={() => onToggleAdsDisabled(tool.name)}
                    uniqueId={`ads-${sanitizedToolName}`}
                />
                 <SwitchToggle
                    label="Sponsored"
                    checked={!!tool.isSponsored}
                    onChange={() => onToggleIsSponsored(tool.name)}
                    uniqueId={`sponsored-${sanitizedToolName}`}
                />
            </div>
        </div>
    );
};
