// --- UNIVERSAL BOOTSTRAP LOADER FOR TOOLSYFY ---
performance.mark('tool-init-start');

// --- GLOBAL STATE & CACHE ---
const state = {
    currentTool: null,
    allTools: [],
    siteConfig: {},
    themeSettings: {},
    authorSettings: {},
    infoContent: {},
    toolInstructions: {},
};

// This promise resolves when the injection and initialization are complete.
// Tool-specific scripts should await this before running.
window.__SHARED_INJECTED__ = new Promise(async (resolve) => {
    try {
        // Fetch all necessary data and templates in parallel.
        // Using absolute paths from the root for robustness.
        await Promise.all([
            loadAndMergeData('/tools.json', 'allTools', []),
            loadAndMergeData('/data/site-config.json', 'siteConfig', {}),
            loadAndMergeDataFromStorage('toolsyfy_author_settings', 'authorSettings', {}),
            loadAndMergeDataFromStorage('toolsyfy_info_content', 'infoContent', {}),
            loadAndMergeDataFromStorage('toolsyfy_tool_instructions', 'toolInstructions', {})
        ]);

        // Find the current tool based on the URL slug.
        state.currentTool = findCurrentToolData();
        if (!state.currentTool) {
            console.warn(`No tool found for path: ${window.location.pathname}. This might be expected on non-tool pages.`);
        }
        
        // Inject shared HTML components.
        await injectSharedHTML();
        
        // Apply settings and initialize dynamic content.
        applyGlobalSettings();
        if (state.currentTool) {
            applySeoMetaTags(state.currentTool);
            applyToolSpecificContent(state.currentTool);
            initializeAds(state.currentTool);
        }

        // Make the UI interactive.
        initializeInteractivity();
        
        // Finalize page visibility.
        document.body.style.visibility = 'visible';
        logPerformance();
        
        // Start monitoring localStorage size.
        setInterval(monitorStorage, 10000);

        resolve(); // Signal completion to tool-specific scripts

    } catch (error) {
        console.error("Critical error during tool page initialization:", error);
        document.body.innerHTML = '<p style="text-align:center; padding: 2rem;">Error: Could not load tool.</p>';
        document.body.style.visibility = 'visible';
    }
});


// --- DATA LOADING & HELPERS ---

async function loadAndMergeData(url, stateKey, fallback) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch ${url}`);
        state[stateKey] = await res.json();
    } catch (e) {
        console.error(`Error loading ${url}:`, e);
        state[stateKey] = fallback;
    }
}

function loadAndMergeDataFromStorage(storageKey, stateKey, fallback) {
    try {
        const item = localStorage.getItem(storageKey);
        state[stateKey] = item ? JSON.parse(item) : fallback;
    } catch (e) {
        console.error(`Error loading ${storageKey} from localStorage:`, e);
        state[stateKey] = fallback;
    }
}

function findCurrentToolData() {
    const path = window.location.pathname;
    const pathSegments = path.split('/').filter(Boolean);
    const toolsIndex = pathSegments.indexOf('tools');
    if (toolsIndex === -1 || toolsIndex + 1 >= pathSegments.length) {
        return null;
    }
    const toolSlug = pathSegments[toolsIndex + 1];
    return state.allTools.find(tool => tool.link.includes(`/${toolSlug}/`));
}


// --- DOM INJECTION & MANIPULATION ---

function applySeoMetaTags(tool) {
    document.title = tool.title || `${tool.name} - Toolsyfy`;

    const setMeta = (nameOrProperty, content) => {
        if (!content) return;
        const isProperty = nameOrProperty.startsWith('og:') || nameOrProperty.startsWith('twitter:');
        const selector = isProperty ? `meta[property="${nameOrProperty}"]` : `meta[name="${nameOrProperty}"]`;
        
        let el = document.head.querySelector(selector);
        if (!el) {
            el = document.createElement('meta');
            if (isProperty) el.setAttribute('property', nameOrProperty);
            else el.setAttribute('name', nameOrProperty);
            document.head.appendChild(el);
        }
        el.setAttribute('content', content);
    };
    
    const description = tool.metaDescription || tool.description;
    const imageUrl = tool.thumbnail || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 630'%3E%3Crect width='1200' height='630' fill='%231e293b'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='60' fill='%23e2e8f0' text-anchor='middle' dominant-baseline='middle'%3EToolsyfy%3C/text%3E%3C/svg%3E";

    setMeta('description', description);
    setMeta('keywords', tool.keywords);
    setMeta('og:title', tool.title || tool.name);
    setMeta('og:description', description);
    