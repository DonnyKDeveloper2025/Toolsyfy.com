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
        // FIX: Using absolute paths from the root for robustness.
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
    setMeta('og:image', imageUrl);
    setMeta('og:url', window.location.href);
    setMeta('og:type', 'website');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', tool.title || tool.name);
    setMeta('twitter:description', description);
    setMeta('twitter:image', imageUrl);
}

async function injectSharedHTML() {
    const placeholders = document.querySelectorAll('[data-shared]');
    for (const el of placeholders) {
        const filename = el.getAttribute('data-shared');
        try {
            // FIX: Path is now absolute from the root (e.g., /shared/universal-header.html)
            const res = await fetch(`/shared/${filename}`);
            if (res.ok) el.innerHTML = await res.text();
            else console.error(`Failed to fetch ${filename}`);
        } catch (e) {
            console.error(`Error injecting ${filename}:`, e);
        }
    }
}


function applyToolSpecificContent(tool) {
    const titleEl = document.getElementById('tool-title');
    const descEl = document.getElementById('tool-description');
    if (titleEl) titleEl.textContent = tool.name;
    if (descEl) descEl.textContent = tool.description;

    const toolContainer = document.querySelector('#tool-root > div');
    if (toolContainer) {
        const layoutMap = { 'default': 'max-w-2xl', 'medium': 'max-w-3xl', 'large': 'max-w-4xl', 'wide': 'max-w-6xl', 'full': 'max-w-7xl' };
        Object.values(layoutMap).forEach(cls => toolContainer.classList.remove(cls));
        toolContainer.classList.add(layoutMap[tool.layout] || layoutMap['default']);
    }
}

function applyGlobalSettings() {
    const { authorName, authorBio, authorImageUrl, buyMeACoffeeUrl, twitterUrl, githubUrl, footerText } = state.authorSettings || {};
    const authorImgEl = document.getElementById('author-img');
    if (authorImgEl && authorImageUrl) authorImgEl.src = authorImageUrl;
    
    const authorNameEl = document.getElementById('author-name');
    if(authorNameEl && authorName) authorNameEl.textContent = authorName;

    const authorBioEl = document.getElementById('author-bio');
    if(authorBioEl) authorBioEl.innerHTML = (authorBio || '').split('\n').map(line => `<p>${line}</p>`).join('');
    
    const twitterEl = document.getElementById('author-twitter');
    if (twitterEl && twitterUrl) twitterEl.href = twitterUrl;
    
    const githubEl = document.getElementById('author-github');
    if (githubEl && githubUrl) githubEl.href = githubUrl;
    
    const bmacEl = document.getElementById('author-bmac');
    if (bmacEl && buyMeACoffeeUrl) bmacEl.href = buyMeACoffeeUrl;
    
    const footerTextEl = document.getElementById('footer-text-placeholder');
    if (footerTextEl) {
        footerTextEl.innerHTML = (footerText || '').replace('{year}', new Date().getFullYear().toString()).replace(/Toolsyfy/gi, '<span class="font-semibold text-brand-primary">Toolsyfy</span>');
    }

    // Initialize legal modals
    initializeModalSystem();
}

// --- INTERACTIVITY & DYNAMIC MODULES ---

function initializeInteractivity() {
    if (window.lucide) window.lucide.createIcons();
    initializeSidebar();
    initializeAuth();
    initializeFavorites();
    if(state.currentTool) initializeToolbar();
}

function initializeAuth() {
    const user = JSON.parse(localStorage.getItem('toolsyfy_user') || 'null');
    const loggedOutView = document.getElementById('auth-logged-out-view');
    const loggedInView = document.getElementById('auth-logged-in-view');
    const profileBtn = document.getElementById('profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    const logoutBtn = document.getElementById('logout-btn');
    const userEmailDisplay = document.getElementById('user-email-display');

    if (user) {
        loggedOutView?.classList.add('hidden');
        loggedInView?.classList.remove('hidden');
        if (userEmailDisplay) userEmailDisplay.textContent = user.email;
        profileBtn?.addEventListener('click', (e) => { e.stopPropagation(); profileDropdown?.classList.toggle('hidden'); });
        logoutBtn?.addEventListener('click', () => { localStorage.removeItem('toolsyfy_user'); window.location.href = '/'; });
        document.addEventListener('click', (e) => { if (!loggedInView?.contains(e.target)) profileDropdown?.classList.add('hidden'); });
    } else {
        loggedOutView?.classList.remove('hidden');
        loggedInView?.classList.add('hidden');
    }
}

function initializeFavorites() {
    const favorites = JSON.parse(localStorage.getItem('toolsyfy_favorites') || '[]');
    const countEl = document.getElementById('favorite-count');
    if (countEl) {
        if (favorites.length > 0) {
            countEl.textContent = favorites.length;
            countEl.classList.remove('hidden');
        } else {
            countEl.classList.add('hidden');
        }
    }
    document.getElementById('toolkit-btn')?.addEventListener('click', () => window.location.href = '/#favorites');
}

function initializeSidebar() {
    const sidebar = document.getElementById("mobile-sidebar"), openBtn = document.getElementById("open-sidebar"), closeBtn = document.getElementById("close-sidebar");
    if (!sidebar || !openBtn || !closeBtn) return;
    const panel = sidebar.querySelector('div');
    const open = () => { sidebar.classList.remove("hidden"); setTimeout(() => { sidebar.classList.remove("opacity-0"); panel?.classList.remove("-translate-x-full"); }, 10); document.body.style.overflow = 'hidden'; };
    const close = () => { sidebar.classList.add("opacity-0"); panel?.classList.add("-translate-x-full"); setTimeout(() => sidebar.classList.add("hidden"), 300); document.body.style.overflow = ''; };
    openBtn.addEventListener("click", open);
    closeBtn.addEventListener("click", close);
    sidebar.addEventListener("click", (e) => { if (e.target === sidebar) close(); });
    // Menu & Social population logic from tool-init.js (if any) can be integrated here.
}


function initializeToolbar() {
    const fab = document.getElementById('universal-toolbar-fab'), actions = document.getElementById('universal-toolbar-actions'), plusIcon = document.getElementById('fab-plus-icon'), closeIcon = document.getElementById('fab-close-icon');
    if(!fab) return;
    fab.addEventListener('click', () => {
        const isOpen = actions.classList.toggle('active');
        actions.classList.toggle('translate-y-0', isOpen); actions.classList.toggle('opacity-100', isOpen); actions.classList.toggle('pointer-events-auto', isOpen);
        actions.classList.toggle('translate-y-4', !isOpen); actions.classList.toggle('opacity-0', !isOpen); actions.classList.toggle('pointer-events-none', !isOpen);
        plusIcon.classList.toggle('scale-0', isOpen); plusIcon.classList.toggle('opacity-0', isOpen);
        closeIcon.classList.toggle('scale-0', !isOpen); closeIcon.classList.toggle('opacity-0', !isOpen);
    });
    document.getElementById('toolbar-share-btn')?.addEventListener('click', async () => { /* share logic */ });
    document.getElementById('toolbar-report-btn')?.addEventListener('click', () => { localStorage.setItem('toolsyfy_report_prefill', state.currentTool.name); window.location.href = '/#report'; });
    document.getElementById('toolbar-suggest-btn')?.addEventListener('click', () => window.location.href = '/#suggestion');
    const modal = document.getElementById('instruction-modal'), modalContent = document.getElementById('instruction-modal-content'), openBtn = document.getElementById('toolbar-help-btn');
    const closeBtns = [document.getElementById('instruction-modal-close-btn'), document.getElementById('instruction-modal-got-it-btn')];
    const openM = () => { /* open modal logic */ }, closeM = () => { /* close modal logic */ };
    openBtn?.addEventListener('click', openM); closeBtns.forEach(b => b?.addEventListener('click', closeM)); modal?.addEventListener('click', e => e.target === modal && closeM());
}

function initializeModalSystem() {
    document.querySelectorAll('[data-modal-trigger]').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = trigger.getAttribute('data-modal-trigger');
            window.location.hash = modalId; // Redirect to main page with hash
        });
    });
}


function initializeAds(tool) {
    const adsEnabledGlobally = state.siteConfig?.settings?.adsEnabled ?? true;
    if (!adsEnabledGlobally || tool.adsDisabled) {
        document.querySelectorAll('ins.adsbygoogle').forEach(slot => slot.style.display = 'none'); return;
    }
    const { adsenseId, adSlotIdToolPage } = JSON.parse(localStorage.getItem('toolsyfy_site_settings') || '{}');
    if (adsenseId && adSlotIdToolPage) {
        if (!window.adsbygoogleLoaded) {
            const script = document.createElement('script');
            script.async = true; script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`;
            script.crossOrigin = 'anonymous'; document.head.appendChild(script); window.adsbygoogleLoaded = true;
        }
        document.querySelectorAll('ins.adsbygoogle').forEach(slot => {
            slot.setAttribute('data-ad-client', adsenseId); slot.setAttribute('data-ad-slot', adSlotIdToolPage);
            try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) { console.error("AdSense error:", e); }
        });
    }
}


// --- UTILITY FUNCTIONS ---

function monitorStorage() {
    try {
        const size = JSON.stringify(localStorage).length / 1024;
        if (size > 4500) console.warn(`⚠️ LocalStorage nearing 5MB limit. Size: ${size.toFixed(2)} KB`);
    } catch (e) { console.error("Could not monitor localStorage size.", e); }
}

function logPerformance() {
    try {
        performance.mark('tool-init-end');
        performance.measure('tool-init-duration', 'tool-init-start', 'tool-init-end');
    } catch(e) {}
}