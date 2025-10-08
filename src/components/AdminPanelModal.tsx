import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'https://esm.sh/react@18.2.0';
import { Category } from '../types.js';
import { ToolAdminCard } from './ToolAdminCard.js';
import { SwitchToggle } from './App.js';
import { Spinner } from './Spinner.js';

const AffiliateModal = lazy(() => import('./AffiliateModal.js'));

const TOOL_PAGE_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>New Tool</title>
  <meta name="description" content="A new awesome tool from Toolsyfy." />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <link rel="stylesheet" href="/styles.css" />
</head>
<body style="visibility: hidden;">
  <div id="site-header" data-shared="universal-header.html"></div>
  <div id="site-toolbar" data-shared="universal-toolbar.html"></div>

  <main id="tool-root" class="min-h-screen flex flex-col items-center p-4 sm:p-6 md:p-8">
    <div class="w-full max-w-2xl mx-auto">
        <div class="text-center mb-8">
             <h1 id="tool-title" class="text-3xl sm:text-4xl font-bold text-foreground">Your Tool Title</h1>
             <p id="tool-description" class="text-lg text-muted mt-2">Your tool description.</p>
        </div>
        
        <div id="tool-interface" class="bg-card shadow-lg rounded-xl p-6 sm:p-8">
            <!-- TODO: Add your tool's UI here -->
            <p>Tool UI placeholder.</p>
        </div>
    </div>
  </main>
  
  <div id="site-footer" data-shared="universal-footer.html"></div>
  
  <script src="/shared/shared-injector.js" defer></script>
  <script src="./tool.js" defer></script>
  <script>
    window.addEventListener('DOMContentLoaded', async () => {
      if (window.__SHARED_INJECTED__) await window.__SHARED_INjected__;
      if (typeof initTool === 'function') {
        initTool();
      } else {
        console.error('Tool initialization function (initTool) not found in tool.js');
      }
    });
  </script>
</body>
</html>`;


const ConfigButton = ({ onClick, icon, text, isDanger=false, isWarning=false, className='' }) => {
    const baseClasses = "w-full flex items-center gap-2 p-3 text-sm text-left font-medium rounded-lg transition-colors";
    let colorClasses = "bg-slate-100 text-slate-700 hover:bg-slate-200";
    if (isWarning) {
        colorClasses = "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    }
    if (isDanger) {
        colorClasses = "bg-red-100 text-red-800 hover:bg-red-200";
    }

    return (
        <button onClick={onClick} className={`${baseClasses} ${colorClasses} ${className}`}>
            {icon}
            <span>{text}</span>
        </button>
    );
}

const tabIcons = {
    tools: <i data-lucide="wrench" className="h-5 w-5" />,
    instructions: <i data-lucide="info" className="h-5 w-5" />,
    monetization: <i data-lucide="dollar-sign" className="h-5 w-5" />,
    feedback: <i data-lucide="message-square-text" className="h-5 w-5" />,
    analytics: <i data-lucide="pie-chart" className="h-5 w-5" />,
    changelog: <i data-lucide="list-checks" className="h-5 w-5" />,
    content: <i data-lucide="file-pen-line" className="h-5 w-5" />,
    settings: <i data-lucide="settings" className="h-5 w-5" />,
    data: <i data-lucide="database-zap" className="h-5 w-5" />,
    'ai-lab': <i data-lucide="flask-conical" className="h-5 w-5" />,
};


const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});


const AdminPanelModal = (props) => {
    const {
        tools, infoContents, onClose, onToggleLoginRequired, onToggleAdsDisabled, onToggleIsSponsored, onEditInfo,
        siteSettings, onSaveSiteSettings, onOpenAuthorSettings, onOpenLayoutSettings,
        onOpenFirebaseConfig, announcementBanner, onSaveAnnouncementBanner, onDeleteTool, onAddTool, onEditTool,
        addToast, toolStatuses, setToolStatuses, lastScan, isScanning, onScanTools, reports, setReports, suggestions, setSuggestions,
        toolInstructions, setToolInstructions, analyticsEvents, setAnalyticsEvents, affiliates, setAffiliates,
        changelog, setChangelog, favorites, setFavorites, userToolOverrides, setUserToolOverrides,
    } = props;
    
    const [activeTab, setActiveTab] = useState('tools');
    const [bannerText, setBannerText] = useState(announcementBanner.text);
    const [bannerEnabled, setBannerEnabled] = useState(announcementBanner.enabled);
    const [instructionEdits, setInstructionEdits] = useState({});
    const [generatingInstructionFor, setGeneratingInstructionFor] = useState(null);
    const [instructionSearch, setInstructionSearch] = useState('');

     // State for Tools tab
    const [toolSearch, setToolSearch] = useState('');
    const [toolStatusFilter, setToolStatusFilter] = useState('all');

    // State for Reports & Suggestions tabs
    const [reportStatusFilter, setReportStatusFilter] = useState('all');
    const [suggestionStatusFilter, setSuggestionStatusFilter] = useState('all');
    
     // State for Monetization tab
    const [currentSiteSettings, setCurrentSiteSettings] = useState(siteSettings);
    const [affiliateModalState, setAffiliateModalState] = useState(null);
    
    // State for Changelog tab
    const [newChangelog, setNewChangelog] = useState({ version: '', date: new Date().toISOString().split('T')[0], changes: '' });
    
    // State for AI Lab tab
    const [ideaTopic, setIdeaTopic] = useState('');
    const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
    const [aiToolIdeas, setAiToolIdeas] = useState([]);
    
    const [promptStudio, setPromptStudio] = useState({
        systemInstruction: '',
        prompt: '',
        temperature: 0.7,
        response: '',
        isLoading: false,
        error: '',
    });

    const [toolGenData, setToolGenData] = useState({
        toolName: '',
        generatedHtml: ''
    });

    // State for Data & Health Tab
    const [orphanScanResult, setOrphanScanResult] = useState(null);
    const [storageStats, setStorageStats] = useState(null);

    useEffect(() => {
        setCurrentSiteSettings(siteSettings);
    }, [siteSettings]);

    useEffect(() => {
        if (activeTab === 'data') {
            calculateStorageStats();
        }
    }, [activeTab]);

    const handleBannerSave = () => {
        onSaveAnnouncementBanner({ text: bannerText, enabled: bannerEnabled });
    };
    
    const handleInstructionChange = (toolName, text) => {
        setInstructionEdits(prev => ({ ...prev, [toolName]: text }));
    };

    const handleInstructionSave = (toolName) => {
        setToolInstructions({ ...toolInstructions, [toolName]: instructionEdits[toolName] });
        addToast(`Instructions for "${toolName}" saved.`, 'success');
    };
    
    const generateInstructionWithAI = async (tool) => {
        setGeneratingInstructionFor(tool.name);
        try {
            const response = await fetch(tool.link);
            if (!response.ok) {
                throw new Error(`Failed to fetch tool HTML: ${response.statusText}`);
            }
            const htmlContent = await response.text();

            const prompt = `You are an expert technical writer creating a user guide. Analyze the following HTML code for a web tool named "${tool.name}". The tool's description is: "${tool.description}". 
        
Your task is to generate clear, concise, step-by-step instructions on how to use this tool from a user's perspective. Focus on the UI elements (inputs, buttons, etc.) and the expected outcome. 

Format the output as a simple, numbered list (e.g., 1. Enter your details..., 2. Click the 'Generate' button...). Do not explain the code.

Here is the HTML code:
\`\`\`html
${htmlContent}
\`\`\``;

            const apiResponse = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: prompt })
            });

            if (!apiResponse.ok) {
                const errorData = await apiResponse.json();
                throw new Error(errorData.error || `API Error: ${apiResponse.statusText}`);
            }

            const { text } = await apiResponse.json();
            
            handleInstructionChange(tool.name, text.trim());
            addToast(`AI instructions generated for "${tool.name}".`, 'success');

        } catch (e) {
            console.error("Error generating instructions with AI:", e);
            addToast(`Failed to generate instructions: ${e.message}.`, 'error');
        } finally {
            setGeneratingInstructionFor(null);
        }
    };
    
     const handleReportStatusChange = useCallback((id, status) => {
        setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    }, [setReports]);

    const handleSuggestionStatusChange = useCallback((id, status) => {
        setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    }, [setSuggestions]);


    const filteredTools = useMemo(() => {
        return tools
            .filter(tool => tool.name.toLowerCase().includes(toolSearch.toLowerCase()))
            .filter(tool => toolStatusFilter === 'all' || (toolStatuses[tool.name] || 'unchecked') === toolStatusFilter);
    }, [tools, toolSearch, toolStatusFilter, toolStatuses]);
    
    const filteredToolsForInstructions = useMemo(() => {
        if (!instructionSearch) return tools;
        return tools.filter(tool => tool.name.toLowerCase().includes(instructionSearch.toLowerCase()));
    }, [tools, instructionSearch]);

    const filteredReports = useMemo(() => reports.filter(r => reportStatusFilter === 'all' || r.status === reportStatusFilter), [reports, reportStatusFilter]);
    const filteredSuggestions = useMemo(() => suggestions.filter(s => suggestionStatusFilter === 'all' || s.status === suggestionStatusFilter), [suggestions, suggestionStatusFilter]);
    
    const handleToolGenChange = (e) => {
        const { name, value } = e.target;
        setToolGenData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleGenerateToolFile = () => {
        const toolSlug = toolGenData.toolName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        if (!toolSlug) {
            addToast('Please provide a tool name.', 'error');
            return;
        }
        let finalHtml = TOOL_PAGE_TEMPLATE;
        
        setToolGenData(prev => ({ ...prev, generatedHtml: finalHtml }));
        addToast('Tool HTML shell generated successfully!', 'success');
    };

    const downloadToolFile = () => {
        const toolSlug = toolGenData.toolName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const blob = new Blob([toolGenData.generatedHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'index.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addToast(`Remember to place this file in 'public/tools/${toolSlug}/'`, 'success');
    };

    const handleExportData = () => {
        try {
            const dataToExport = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('toolsyfy_')) {
                    dataToExport[key] = JSON.parse(localStorage.getItem(key));
                }
            }
            const jsonString = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `toolsyfy_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            addToast('Data exported successfully!', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            addToast('Failed to export data.', 'error');
        }
    };
    
    const handleImportData = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
    
        if (!window.confirm("Are you sure you want to import data? This will overwrite all current settings.")) {
            event.target.value = ''; // Reset file input
            return;
        }
    
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = e.target?.result;
                if (typeof result !== 'string') throw new Error("Invalid file content");
                const dataToImport = JSON.parse(result);
                
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('toolsyfy_')) {
                        localStorage.removeItem(key);
                    }
                });
    
                Object.keys(dataToImport).forEach(key => {
                    if (key.startsWith('toolsyfy_')) {
                        localStorage.setItem(key, JSON.stringify(dataToImport[key]));
                    }
                });
                
                addToast('Data imported successfully! The page will now reload.', 'success');
                setTimeout(() => window.location.reload(), 2000);
    
            } catch (error) {
                console.error('Import failed:', error);
                addToast('Failed to import data. Make sure it is a valid backup file.', 'error');
            } finally {
                event.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    // --- Data & Health Functions ---

    const handleClearLocalData = () => {
        if (window.confirm("Are you sure you want to clear ALL local application data? This will reset favorites, settings, and other stored info. This cannot be undone.")) {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('toolsyfy_')) {
                    localStorage.removeItem(key);
                }
            });
            addToast("All local data has been cleared. Reloading...", 'success');
            setTimeout(() => window.location.reload(), 1500);
        }
    };

    const handleClearServiceWorker = () => {
        if ('serviceWorker' in navigator) {
            if (window.confirm("This will unregister the service worker, clearing its cache. The app will fetch all new files on the next load. Proceed?")) {
                navigator.serviceWorker.getRegistrations().then(registrations => {
                    if (registrations.length === 0) {
                        addToast("No active service worker found to clear.", "success");
                        return;
                    }
                    for (let registration of registrations) {
                        registration.unregister();
                    }
                    addToast("Service Worker unregistered. Reloading page...", "success");
                    setTimeout(() => window.location.reload(), 1500);
                }).catch(err => {
                    addToast("Failed to clear service worker.", "error");
                    console.error("Service worker unregistration failed: ", err);
                });
            }
        } else {
            addToast("Service workers are not supported in this browser.", "error");
        }
    };

    // FIX: Add type guards to ensure data from localStorage is handled safely.
    const runOrphanScan = useCallback(() => {
        const toolNames = new Set(tools.map(t => t.name));
        const results = {
            favorites: (Array.isArray(favorites) ? favorites : []).filter(name => typeof name === 'string' && !toolNames.has(name)),
            overrides: (userToolOverrides && typeof userToolOverrides === 'object' ? Object.keys(userToolOverrides) : []).filter(name => !toolNames.has(name)),
            statuses: (toolStatuses && typeof toolStatuses === 'object' ? Object.keys(toolStatuses) : []).filter(name => !toolNames.has(name)),
            instructions: (toolInstructions && typeof toolInstructions === 'object' ? Object.keys(toolInstructions) : []).filter(name => !toolNames.has(name)),
        };
        return results;
    }, [tools, favorites, userToolOverrides, toolStatuses, toolInstructions]);

    const handleScanOrphans = () => {
        const results = runOrphanScan();
        setOrphanScanResult(results);
        const totalOrphans = results.favorites.length + results.overrides.length + results.statuses.length + results.instructions.length;
        if (totalOrphans > 0) {
            addToast(`Scan complete. Found ${totalOrphans} orphaned entries.`, 'success');
        } else {
            addToast('Scan complete. No orphaned data found!', 'success');
        }
    };

    const handleCleanOrphans = () => {
        const orphans = runOrphanScan();
        const totalOrphans = orphans.favorites.length + orphans.overrides.length + orphans.statuses.length + orphans.instructions.length;
        if (totalOrphans === 0) {
            addToast("There is no orphaned data to clean.", "success");
            return;
        }

        if (window.confirm(`Found ${totalOrphans} orphaned entries. Are you sure you want to permanently delete them?`)) {
            setFavorites(prev => prev.filter(name => !orphans.favorites.includes(name)));
            setUserToolOverrides(prev => {
                const next = { ...prev };
                orphans.overrides.forEach(key => delete next[key]);
                return next;
            });
            setToolStatuses(prev => {
                const next = { ...prev };
                orphans.statuses.forEach(key => delete next[key]);
                return next;
            });
            setToolInstructions(prev => {
                const next = { ...prev };
                orphans.instructions.forEach(key => delete next[key]);
                return next;
            });

            addToast(`${totalOrphans} orphaned entries cleaned successfully.`, 'success');
            setOrphanScanResult(null); // Clear results after cleaning
        }
    };

    const calculateStorageStats = () => {
        try {
            const breakdown = [];
            let total = 0;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('toolsyfy_')) {
                    const value = localStorage.getItem(key);
                    const size = (new Blob([value]).size) / 1024; // size in KB
                    total += size;
                    breakdown.push({ key: key.replace('toolsyfy_', ''), size: parseFloat(size.toFixed(2)) });
                }
            }
            setStorageStats({ total: parseFloat(total.toFixed(2)), breakdown: breakdown.sort((a,b) => b.size - a.size) });
        } catch (e) {
            console.error("Could not calculate storage stats", e);
            setStorageStats(null);
        }
    };

    // ----------------------------

    const handleSaveAffiliate = (item) => {
        const isEditing = affiliates.some(a => a.id === item.id);
        if (isEditing) {
            setAffiliates(prev => prev.map(a => a.id === item.id ? item : a));
            addToast('Affiliate link updated!', 'success');
        } else {
            setAffiliates(prev => [...prev, { ...item, id: uuidv4() }]);
            addToast('Affiliate link added!', 'success');
        }
        setAffiliateModalState(null);
    };

    const handleDeleteAffiliate = (id) => {
        if (window.confirm("Are you sure you want to delete this affiliate link?")) {
            setAffiliates(prev => prev.filter(a => a.id !== id));
            addToast('Affiliate link deleted.', 'success');
        }
    };

    const handleGenerateIdeas = async () => {
        if (!ideaTopic) {
            addToast('Please enter a topic to generate ideas.', 'error');
            return;
        }
        setIsGeneratingIdeas(true);
        setAiToolIdeas([]);
        try {
            const prompt = `You are an expert in creating innovative, client-side web tools. Generate a list of 5 creative tool ideas based on the topic: "${ideaTopic}". For each idea, provide a tool name, a concise one-sentence user-facing description, a suggested category from the provided list, and 3-5 relevant lowercase tags.

Valid Categories: ${Object.values(Category).join(', ')}

Return the response as a valid JSON object with a single key "ideas" which is an array of objects. Each object must have the following keys: "name" (string), "description" (string), "category" (string, must be one of the valid categories), and "tags" (string, comma-separated).`;
            
            const apiResponse = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: "OBJECT",
                            properties: {
                                ideas: {
                                    type: "ARRAY",
                                    items: {
                                        type: "OBJECT",
                                        properties: {
                                            name: { type: "STRING" },
                                            description: { type: "STRING" },
                                            category: { type: "STRING" },
                                            tags: { type: "STRING" },
                                        },
                                        required: ["name", "description", "category", "tags"]
                                    }
                                }
                            },
                            required: ["ideas"]
                        }
                    }
                })
            });

            if (!apiResponse.ok) {
                const errorData = await apiResponse.json();
                throw new Error(errorData.error || `API Error: ${apiResponse.statusText}`);
            }

            const jsonResponse = await apiResponse.json();
            setAiToolIdeas(jsonResponse.ideas || []);

        } catch (e) {
            console.error("API call error:", e);
            addToast(`Failed to generate ideas: ${e.message}.`, 'error');
        } finally {
            setIsGeneratingIdeas(false);
        }
    };

    const handlePromptStudioChange = (e) => {
        const { name, value, type } = e.target;
        setPromptStudio(prev => ({ ...prev, [name]: type === 'range' ? parseFloat(value) : value }));
    };

    const handlePromptStudioGenerate = async () => {
        if (!promptStudio.prompt) {
            addToast('Please enter a prompt.', 'error');
            return;
        }
        setPromptStudio(prev => ({ ...prev, isLoading: true, response: '', error: '' }));
        try {
            const apiResponse = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: promptStudio.prompt,
                    config: {
                        systemInstruction: promptStudio.systemInstruction,
                        temperature: promptStudio.temperature,
                    }
                })
            });

            if (!apiResponse.ok) {
                const errorData = await apiResponse.json();
                throw new Error(errorData.error || `API Error: ${apiResponse.statusText}`);
            }

            const { text } = await apiResponse.json();
            setPromptStudio(prev => ({ ...prev, response: text }));

        } catch (e) {
            console.error("Prompt Studio API error:", e);
            setPromptStudio(prev => ({ ...prev, error: e.message }));
        } finally {
            setPromptStudio(prev => ({ ...prev, isLoading: false }));
        }
    };

    const handleAddChangelog = () => {
        if (!newChangelog.version || !newChangelog.changes) {
            addToast('Version and changes are required.', 'error');
            return;
        }
        const newEntry = {
            id: uuidv4(),
            version: newChangelog.version,
            date: newChangelog.date,
            changes: newChangelog.changes.split('\n').filter(line => line.trim() !== ''),
        };
        setChangelog(prev => [newEntry, ...prev]);
        setNewChangelog({ version: '', date: new Date().toISOString().split('T')[0], changes: '' });
        addToast('Changelog entry added!', 'success');
    };

    const handleDeleteChangelog = (id) => {
        if (window.confirm('Are you sure you want to delete this changelog entry?')) {
            setChangelog(prev => prev.filter(entry => entry.id !== id));
            addToast('Changelog entry deleted.', 'success');
        }
    };

    const tabs = useMemo(() => [
        { id: 'tools', label: 'Tools', icon: tabIcons.tools, count: tools.length },
        { id: 'instructions', label: 'Instructions', icon: tabIcons.instructions },
        { id: 'monetization', label: 'Monetization', icon: tabIcons.monetization },
        { id: 'feedback', label: 'Feedback', icon: tabIcons.feedback, count: reports.filter(r => r.status === 'Open').length + suggestions.filter(s => s.status === 'Open').length },
        { id: 'changelog', label: 'Changelog', icon: tabIcons.changelog },
        { id: 'analytics', label: 'Analytics', icon: tabIcons.analytics },
        { id: 'content', label: 'Content', icon: tabIcons.content },
        { id: 'settings', label: 'Settings', icon: tabIcons.settings },
        { id: 'data', label: 'Data & Health', icon: tabIcons.data },
        { id: 'ai-lab', label: 'AI Lab', icon: tabIcons['ai-lab'] },
    ], [tools.length, reports, suggestions]);

    return (
        <div className="fixed inset-0 modal-overlay z-50 flex items-center justify-center p-0 sm:p-4" onClick={onClose}>
            <div className="bg-background rounded-none sm:rounded-2xl shadow-xl w-full h-full flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex-shrink-0 z-10 bg-card border-b border-border">
                    <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Admin Panel</h1>
                        <button onClick={onClose} className="p-2 rounded-full text-muted hover:bg-secondary">
                            <i data-lucide="x" className="h-6 w-6"></i>
                        </button>
                    </div>
                </header>

                <div className="flex flex-grow min-h-0">
                    {/* Desktop Sidebar */}
                    <nav className="hidden md:block w-56 flex-shrink-0 border-r border-border p-4 space-y-2 overflow-y-auto">
                        {tabs.map(tab => (
                             <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 p-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-brand-primary text-white' : 'text-slate-600 hover:bg-secondary'}`}>
                                {tab.icon}
                                <span className="flex-grow text-left">{tab.label}</span>
                                {(tab.count ?? 0) > 0 && <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20' : 'bg-brand-primary text-white'}`}>{tab.count}</span>}
                            </button>
                        ))}
                    </nav>

                    <div className="flex-grow flex flex-col min-h-0">
                        {/* Mobile Dropdown */}
                        <div className="md:hidden p-4 border-b border-border">
                             <select onChange={(e) => setActiveTab(e.target.value)} value={activeTab} className="w-full p-2 bg-card border border-border rounded-md text-foreground font-semibold focus:ring-brand-primary focus:border-brand-primary">
                                {tabs.map(tab => <option key={tab.id} value={tab.id}>{tab.label} {(tab.count ?? 0) > 0 ? `(${tab.count})` : ''}</option>)}
                            </select>
                        </div>

                        <main className="flex-grow overflow-y-auto p-4 sm:p-6 bg-secondary">
                            {activeTab === 'tools' && (
                                <div className="space-y-4">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                        {/* Left side: Search and Filter */}
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <input
                                                type="text"
                                                value={toolSearch}
                                                onChange={(e) => setToolSearch(e.target.value)}
                                                placeholder="Search tools..."
                                                className="w-full sm:w-64 p-2 bg-card border border-border rounded-md text-sm"
                                            />
                                            <select
                                                value={toolStatusFilter}
                                                onChange={e => setToolStatusFilter(e.target.value)}
                                                className="w-full sm:w-auto min-w-[12rem] p-2 bg-card border border-border rounded-md text-sm"
                                            >
                                                <option value="all">All Statuses</option>
                                                <option value="live">Live</option>
                                                <option value="dead">Dead</option>
                                                <option value="unchecked">Unchecked</option>
                                            </select>
                                        </div>
                                        
                                        {/* Right side: Buttons */}
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
                                            <button
                                                onClick={onScanTools}
                                                disabled={isScanning}
                                                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-blue-500 text-white hover:bg-blue-600 disabled:bg-slate-400 whitespace-nowrap"
                                            >
                                                {isScanning ? <Spinner size="4" color="white" /> : <i data-lucide="scan-line" className="h-5 w-5"></i>}
                                                <span>{isScanning ? 'Scanning...' : 'Scan Status'}</span>
                                            </button>
                                            <button
                                                onClick={() => onAddTool()}
                                                className="flex-1 sm:flex-initial bg-brand-primary text-white font-semibold text-sm py-2 px-4 rounded-md hover:bg-brand-secondary whitespace-nowrap"
                                            >
                                                Add New Tool
                                            </button>
                                        </div>
                                    </div>
                                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                                        {filteredTools.map(tool => (
                                            <ToolAdminCard 
                                                key={tool.name}
                                                tool={tool}
                                                status={toolStatuses[tool.name] || 'unchecked'}
                                                onEdit={onEditTool}
                                                onDelete={onDeleteTool}
                                                onToggleLoginRequired={onToggleLoginRequired}
                                                onToggleAdsDisabled={onToggleAdsDisabled}
                                                onToggleIsSponsored={onToggleIsSponsored}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                             {activeTab === 'instructions' && (
                                <div className="space-y-4">
                                    <div className="sticky top-0 bg-secondary -mt-6 -mx-6 p-4 pt-6 mb-2 z-10 border-b border-border">
                                        <input
                                            type="text"
                                            value={instructionSearch}
                                            onChange={(e) => setInstructionSearch(e.target.value)}
                                            placeholder="Search tools to edit instructions..."
                                            className="w-full p-2 bg-card border border-border rounded-md text-sm"
                                        />
                                    </div>
                                    {filteredToolsForInstructions.map(tool => (
                                        <div key={tool.name} className="bg-card p-4 rounded-lg border border-border">
                                            <h4 className="font-bold text-foreground">{tool.name}</h4>
                                            <textarea 
                                                value={instructionEdits[tool.name] ?? toolInstructions[tool.name] ?? ''}
                                                onChange={(e) => handleInstructionChange(tool.name, e.target.value)}
                                                rows={4}
                                                className="w-full mt-2 p-2 bg-background border border-border rounded-md text-sm"
                                                placeholder="No instructions set. Click Generate or type here."
                                            />
                                            <div className="flex gap-2 mt-2">
                                                <button onClick={() => handleInstructionSave(tool.name)} className="bg-blue-500 text-white font-semibold text-xs py-1 px-3 rounded-md hover:bg-blue-600">Save</button>
                                                <button onClick={() => generateInstructionWithAI(tool)} disabled={generatingInstructionFor === tool.name} className="flex items-center gap-1 bg-indigo-500 text-white font-semibold text-xs py-1 px-3 rounded-md hover:bg-indigo-600 disabled:bg-slate-400">
                                                    {generatingInstructionFor === tool.name ? <Spinner size="3" color="white"/> : '✨'}
                                                    AI Generate
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredToolsForInstructions.length === 0 && (
                                        <p className="text-center text-muted py-10">No tools found for your search.</p>
                                    )}
                                </div>
                             )}
                            {activeTab === 'monetization' && (
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground mb-4">AdSense Settings</h3>
                                        <div className="bg-card p-4 rounded-lg border border-border space-y-4">
                                             <div>
                                                <label htmlFor="adsenseId" className="block text-sm font-medium text-muted mb-1">AdSense Publisher ID</label>
                                                <input type="text" name="adsenseId" id="adsenseId" value={currentSiteSettings.adsenseId} onChange={e => setCurrentSiteSettings({...currentSiteSettings, adsenseId: e.target.value})} className="w-full p-2 bg-card border border-border rounded-md" placeholder="ca-pub-XXXXXXXXXXXXXXXX"/>
                                            </div>
                                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                 <div>
                                                    <label htmlFor="adSlotIdMain" className="block text-sm font-medium text-muted mb-1">Slot ID (Main Page)</label>
                                                    <input type="text" name="adSlotIdMain" id="adSlotIdMain" value={currentSiteSettings.adSlotIdMain} onChange={e => setCurrentSiteSettings({...currentSiteSettings, adSlotIdMain: e.target.value})} className="w-full p-2 bg-card border border-border rounded-md" placeholder="1234567890"/>
                                                </div>
                                                 <div>
                                                    <label htmlFor="adSlotIdInFeed" className="block text-sm font-medium text-muted mb-1">Slot ID (In-Feed)</label>
                                                    <input type="text" name="adSlotIdInFeed" id="adSlotIdInFeed" value={currentSiteSettings.adSlotIdInFeed} onChange={e => setCurrentSiteSettings({...currentSiteSettings, adSlotIdInFeed: e.target.value})} className="w-full p-2 bg-card border border-border rounded-md" placeholder="1234567890"/>
                                                </div>
                                                 <div>
                                                    <label htmlFor="adSlotIdToolPage" className="block text-sm font-medium text-muted mb-1">Slot ID (Tool Pages)</label>
                                                    <input type="text" name="adSlotIdToolPage" id="adSlotIdToolPage" value={currentSiteSettings.adSlotIdToolPage} onChange={e => setCurrentSiteSettings({...currentSiteSettings, adSlotIdToolPage: e.target.value})} className="w-full p-2 bg-card border border-border rounded-md" placeholder="0987654321"/>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <button onClick={() => onSaveSiteSettings(currentSiteSettings)} className="px-4 py-2 text-sm font-medium rounded-md bg-brand-primary text-white hover:bg-brand-secondary">Save AdSense Settings</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-xl font-bold text-foreground">Affiliate Links</h3>
                                            <button onClick={() => setAffiliateModalState('add')} className="bg-brand-primary text-white font-semibold text-sm py-2 px-4 rounded-md hover:bg-brand-secondary">Add New</button>
                                        </div>
                                        <div className="space-y-3">
                                            {affiliates.map(item => (
                                                <div key={item.id} className="bg-card p-3 rounded-lg border border-border flex items-center gap-4">
                                                    <img src={item.imageUrl} alt="" className="w-16 h-16 object-cover rounded-md flex-shrink-0 bg-secondary"/>
                                                    <div className="flex-grow min-w-0">
                                                        <h4 className="font-bold truncate text-foreground">{item.name}</h4>
                                                        <p className="text-sm text-muted truncate">{item.description}</p>
                                                    </div>
                                                    <div className="flex-shrink-0 flex gap-2">
                                                        <button onClick={() => setAffiliateModalState(item)} className="p-2 rounded-md hover:bg-secondary text-blue-600"><i data-lucide="edit-3" className="h-5 w-5"></i></button>
                                                        <button onClick={() => handleDeleteAffiliate(item.id)} className="p-2 rounded-md hover:bg-secondary text-red-600"><i data-lucide="trash-2" className="h-5 w-5"></i></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'feedback' && (
                                <div className="space-y-8">
                                    {/* Issue Reports Section */}
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground mb-4">Issue Reports</h3>
                                        <div className="flex gap-2 p-1 bg-secondary rounded-lg mb-4">
                                            {['all', 'Open', 'Reviewed', 'Fixed'].map(status => (
                                                <button key={status} onClick={() => setReportStatusFilter(status)}
                                                    className={`w-full text-sm font-semibold py-1.5 px-3 rounded-md transition-colors ${ reportStatusFilter === status ? 'bg-card shadow' : 'text-muted'}`}>
                                                    {status === 'all' ? 'All' : status}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="space-y-4">
                                            {filteredReports.length === 0 ? (
                                                <p className="text-center text-muted py-10">No reports for this filter.</p>
                                            ) : (
                                                filteredReports.map(item => (
                                                    <div key={item.id} className="bg-card p-4 rounded-lg border border-border">
                                                        <div className="flex justify-between items-start flex-wrap gap-2">
                                                            <div className="flex-grow">
                                                                <p className="font-semibold text-foreground">{item.tool}</p>
                                                                <div className="flex items-center gap-2 text-xs text-muted mt-1">
                                                                    <span>{new Date(item.timestamp).toLocaleString()}</span>
                                                                    <span>&bull;</span>
                                                                    <span>{item.category}</span>
                                                                    {item.email && <span>&bull;</span>}
                                                                    {item.email && <a href={`mailto:${item.email}`} className="hover:underline">{item.email}</a>}
                                                                </div>
                                                            </div>
                                                            <div className="flex-shrink-0 flex items-center gap-2">
                                                                <select value={item.status} onChange={e => handleReportStatusChange(item.id, e.target.value)} className="text-xs p-1.5 bg-card border border-border rounded-md focus:ring-1 focus:ring-brand-primary">
                                                                    <option>Open</option>
                                                                    <option>Reviewed</option>
                                                                    <option>Fixed</option>
                                                                </select>
                                                                <button onClick={() => { if (window.confirm('Are you sure you want to delete this report?')) { setReports(reports.filter(r => r.id !== item.id)); } }} className="p-1.5 rounded-md text-red-500 hover:bg-red-100" title="Delete Report"><i data-lucide="trash-2" className="h-4 w-4"></i></button>
                                                            </div>
                                                        </div>
                                                        <p className="mt-2 p-3 bg-secondary rounded-md text-foreground whitespace-pre-wrap text-sm">{item.description}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Tool Suggestions Section */}
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground mb-4">Tool Suggestions</h3>
                                        <div className="flex gap-2 p-1 bg-secondary rounded-lg mb-4">
                                            {['all', 'Open', 'Reviewed', 'Implemented'].map(status => (
                                                <button key={status} onClick={() => setSuggestionStatusFilter(status)}
                                                    className={`w-full text-sm font-semibold py-1.5 px-3 rounded-md transition-colors ${ suggestionStatusFilter === status ? 'bg-card shadow' : 'text-muted'}`}>
                                                    {status === 'all' ? 'All' : status}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="space-y-4">
                                            {filteredSuggestions.length === 0 ? (
                                                <p className="text-center text-muted py-10">No suggestions for this filter.</p>
                                            ) : (
                                                filteredSuggestions.map(item => (
                                                     <div key={item.id} className="bg-card p-4 rounded-lg border border-border">
                                                        <div className="flex justify-between items-start flex-wrap gap-2">
                                                            <div className="flex-grow">
                                                                <p className="font-semibold text-foreground">{item.tool}</p>
                                                                <p className="text-xs text-muted mt-1">{new Date(item.timestamp).toLocaleString()}</p>
                                                            </div>
                                                            <div className="flex-shrink-0 flex items-center gap-2">
                                                                <select value={item.status} onChange={e => handleSuggestionStatusChange(item.id, e.target.value)} className="text-xs p-1.5 bg-card border border-border rounded-md focus:ring-1 focus:ring-brand-primary">
                                                                    <option>Open</option>
                                                                    <option>Reviewed</option>
                                                                    <option>Implemented</option>
                                                                </select>
                                                                <button onClick={() => { if (window.confirm('Are you sure you want to delete this suggestion?')) { setSuggestions(suggestions.filter(s => s.id !== item.id)); } }} className="p-1.5 rounded-md text-red-500 hover:bg-red-100" title="Delete Suggestion"><i data-lucide="trash-2" className="h-4 w-4"></i></button>
                                                            </div>
                                                        </div>
                                                        <p className="mt-2 p-3 bg-secondary rounded-md text-foreground whitespace-pre-wrap text-sm">{item.suggestion}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'changelog' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground mb-4">Add Changelog Entry</h3>
                                        <div className="bg-card p-4 rounded-lg border border-border space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-muted mb-1">Version</label>
                                                    <input type="text" value={newChangelog.version} onChange={e => setNewChangelog(p => ({...p, version: e.target.value}))} placeholder="e.g., 1.2.0" className="w-full p-2 bg-card border border-border rounded-md text-sm" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-muted mb-1">Date</label>
                                                    <input type="date" value={newChangelog.date} onChange={e => setNewChangelog(p => ({...p, date: e.target.value}))} className="w-full p-2 bg-card border border-border rounded-md text-sm" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-muted mb-1">Changes (one per line)</label>
                                                <textarea value={newChangelog.changes} onChange={e => setNewChangelog(p => ({...p, changes: e.target.value}))} rows={4} className="w-full p-2 bg-card border border-border rounded-md text-sm" placeholder="- Added new feature&#10;- Fixed a critical bug"></textarea>
                                            </div>
                                            <div className="text-right">
                                                <button onClick={handleAddChangelog} className="px-4 py-2 text-sm font-medium rounded-md bg-brand-primary text-white hover:bg-brand-secondary">Add Entry</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground mb-4">History</h3>
                                        <div className="space-y-4">
                                            {changelog.map(entry => (
                                                <div key={entry.id} className="bg-card p-4 rounded-lg border border-border relative">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <span className="text-xs font-bold bg-orange-100 text-brand-primary px-2 py-1 rounded-full">{entry.version}</span>
                                                            <p className="text-sm text-muted mt-1">{new Date(entry.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                                        </div>
                                                         <button onClick={() => handleDeleteChangelog(entry.id)} className="p-1.5 rounded-md hover:bg-secondary text-red-600" aria-label="Delete"><i data-lucide="trash-2" className="h-4 w-4"></i></button>
                                                    </div>
                                                    <ul className="mt-3 list-disc list-inside space-y-1 text-muted text-sm">
                                                        {entry.changes.map((change, i) => <li key={i}>{change}</li>)}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                              {activeTab === 'analytics' && (
                                 <p className="text-center text-muted py-10">Analytics viewing coming soon. You can export the data from the 'Data & Health' tab.</p>
                             )}
                             {activeTab === 'content' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {Object.keys(infoContents).map(key => (
                                        <ConfigButton key={key} onClick={() => onEditInfo(key)} icon={<i data-lucide="file-pen-line" className="h-5 w-5"/>} text={`Edit "${infoContents[key].title}"`} />
                                    ))}
                                </div>
                             )}
                             {activeTab === 'settings' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    <ConfigButton onClick={onOpenAuthorSettings} icon={<i data-lucide="user-square" className="h-5 w-5"/>} text="Author & Footer" />
                                    <ConfigButton onClick={onOpenLayoutSettings} icon={<i data-lucide="layout-grid" className="h-5 w-5"/>} text="Homepage Layout" />
                                    <ConfigButton onClick={onOpenFirebaseConfig} icon={<i data-lucide="key-round" className="h-5 w-5"/>} text="Firebase Auth" isWarning />
                                </div>
                             )}
                             {activeTab === 'data' && (
                                <div className="space-y-8">
                                    {/* Data Management */}
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground mb-4">Data Management</h3>
                                        <p className="text-sm text-muted mb-4">Export all site settings, tools, and user data into a single JSON file for backup, or import a file to restore the site's state.</p>
                                        <div className="flex gap-4">
                                            <button onClick={handleExportData} className="px-4 py-2 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"><i data-lucide="download" className="h-4 w-4" />Export All Data</button>
                                            <label className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 cursor-pointer flex items-center gap-2">
                                                <i data-lucide="upload" className="h-4 w-4" /><span>Import Data</span>
                                                <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Cache Management */}
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground mb-4">Cache & System Reset</h3>
                                        <p className="text-sm text-muted mb-4">Use these tools to clear caches or reset local data. This can resolve issues related to outdated settings or files.</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <ConfigButton onClick={handleClearLocalData} icon={<i data-lucide="trash-2" className="h-5 w-5"/>} text="Clear Local Data" isDanger />
                                            <ConfigButton onClick={handleClearServiceWorker} icon={<i data-lucide="cloud-off" className="h-5 w-5"/>} text="Clear Service Worker" isDanger />
                                        </div>
                                    </div>
                                    
                                    {/* Data Integrity */}
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground mb-4">Data Integrity</h3>
                                        <div className="bg-card p-4 rounded-lg border border-border">
                                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                                <div className="flex-grow">
                                                    <p className="font-semibold text-foreground">Orphaned Data Check</p>
                                                    <p className="text-sm text-muted">Scan for stored data (favorites, overrides, etc.) linked to tools that no longer exist.</p>
                                                </div>
                                                <button onClick={handleScanOrphans} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-blue-500 text-white hover:bg-blue-600"><i data-lucide="scan-search" className="h-5 w-5"/>Scan Now</button>
                                            </div>
                                            {orphanScanResult && (
                                                <div className="mt-4 pt-4 border-t border-border">
                                                    {Object.values(orphanScanResult).every((arr) => Array.isArray(arr) && arr.length === 0) ? (
                                                        <p className="text-sm text-green-600">No orphaned data found. Everything looks clean!</p>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <p className="text-sm text-yellow-600">Found orphaned entries:</p>
                                                            <ul className="list-disc list-inside text-xs text-muted space-y-1">
                                                                {orphanScanResult.favorites.length > 0 && <li>{orphanScanResult.favorites.length} in Favorites</li>}
                                                                {orphanScanResult.overrides.length > 0 && <li>{orphanScanResult.overrides.length} in Overrides</li>}
                                                                {orphanScanResult.statuses.length > 0 && <li>{orphanScanResult.statuses.length} in Statuses</li>}
                                                                {orphanScanResult.instructions.length > 0 && <li>{orphanScanResult.instructions.length} in Instructions</li>}
                                                            </ul>
                                                            <button onClick={handleCleanOrphans} className="mt-2 text-sm font-medium text-red-600 hover:underline">Clean Up</button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Storage Usage */}
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground mb-4">Storage Usage</h3>
                                        <div className="bg-card p-4 rounded-lg border border-border">
                                            {storageStats ? (
                                                <>
                                                    <p className="font-semibold text-foreground">Total Local Storage: {storageStats.total} KB <span className="text-muted font-normal">/ ~5000 KB limit</span></p>
                                                    <div className="w-full bg-secondary rounded-full h-2.5 my-2"><div className="bg-brand-primary h-2.5 rounded-full" style={{width: `${(storageStats.total / 5000) * 100}%`}}></div></div>
                                                    <ul className="mt-4 space-y-1 text-sm text-muted">
                                                        {storageStats.breakdown.map(item => (
                                                            <li key={item.key} className="flex justify-between items-center">
                                                                <span className="font-mono text-xs">{item.key}</span>
                                                                <span className="font-semibold">{item.size} KB</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </>
                                            ) : <p className="text-muted">Could not calculate storage usage.</p>}
                                        </div>
                                    </div>
                                </div>
                             )}
                             {activeTab === 'ai-lab' && (
                                <div className="space-y-12">
                                    {/* Gemini Prompt Studio */}
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold text-foreground">Gemini Prompt Studio</h3>
                                        <p className="text-sm text-muted">Test prompts directly with the Gemini API. Fine-tune system instructions and parameters.</p>
                                        <div className="bg-card p-4 rounded-lg border border-border space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-muted mb-1">System Instruction (Optional)</label>
                                                <textarea name="systemInstruction" value={promptStudio.systemInstruction} onChange={handlePromptStudioChange} rows={2} className="w-full p-2 bg-secondary border border-border rounded-md text-sm" placeholder="e.g., You are a helpful assistant."></textarea>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-muted mb-1">User Prompt</label>
                                                <textarea name="prompt" value={promptStudio.prompt} onChange={handlePromptStudioChange} rows={4} required className="w-full p-2 bg-secondary border border-border rounded-md text-sm" placeholder="e.g., What are the five largest planets in our solar system?"></textarea>
                                            </div>
                                             <div>
                                                <label className="block text-sm font-medium text-muted mb-1">Temperature: <span className="font-mono text-brand-primary">{promptStudio.temperature}</span></label>
                                                {/* FIX: Re-added missing/corrupted code for the prompt studio UI */}
                                                <input type="range" name="temperature" min="0" max="1" step="0.1" value={promptStudio.temperature} onChange={handlePromptStudioChange} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                                            </div>
                                            <button onClick={handlePromptStudioGenerate} disabled={promptStudio.isLoading} className="w-full flex justify-center bg-brand-primary text-white font-semibold py-2 px-4 rounded-md hover:bg-brand-secondary disabled:opacity-50">
                                                {promptStudio.isLoading ? <Spinner size="5" color="white" /> : 'Generate'}
                                            </button>
                                            {promptStudio.response && (
                                                <div>
                                                    <h4 className="font-semibold text-foreground">Response:</h4>
                                                    <pre className="mt-2 p-3 bg-secondary rounded-md text-foreground whitespace-pre-wrap text-sm">{promptStudio.response}</pre>
                                                </div>
                                            )}
                                            {promptStudio.error && <p className="text-red-500 text-sm">{promptStudio.error}</p>}
                                        </div>
                                    </div>
                                </div>
                             )}
                        </main>
                    </div>
                </div>
            </div>
            {/* FIX: Added suspense for lazy-loaded AffiliateModal */}
            <Suspense fallback={<div className="fixed inset-0 bg-background/50 z-[999] flex items-center justify-center"><Spinner /></div>}>
                {affiliateModalState && (
                    <AffiliateModal
                        modalState={affiliateModalState}
                        onClose={() => setAffiliateModalState(null)}
                        onSave={handleSaveAffiliate}
                    />
                )}
            </Suspense>
        </div>
    );
};

export default AdminPanelModal;