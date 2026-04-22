import { Config, Api, State, getHtmlPath, getStylePath, getJavaScriptPath } from '@core';
import { convertToSlug, checkFileExists, normalizeResourcePath } from '@utils';
import { writeDebugLog } from '@logger';

export const Loader = {
    _cleanupTasks: new Map(),
    _currentPageSlug: null,

    isResourceCached(resourceUrl = "", resourceType = Config.extensions.html) {
        if (!resourceUrl) return false;

        const absoluteUrl = normalizeResourcePath(resourceUrl);
        const cacheCategory = State.cache && State.cache[resourceType];

        if (!(cacheCategory instanceof Map)) {
            writeDebugLog('error', '[Loader]', `State.cache.${resourceType} is not a Map!`);
            return false;
        }

        const cachedItem = cacheCategory.get(absoluteUrl);
        if (!cachedItem) return false;

        return (Date.now() - cachedItem.timestamp < Config.cache.timeToLive);
    },

    async initializePageScripts(pageName = "", pageContainer = null) {
        const pageSlug = convertToSlug(pageName);
        this._runPageCleanup(this._currentPageSlug);
        this._currentPageSlug = pageSlug;

        try {
            await this._loadPageScript(pageSlug, pageContainer);
            writeDebugLog('success', '[Loader]', pageSlug, 'initialized');
        } catch (loaderError) {
            writeDebugLog('error', '[Loader]', pageSlug, loaderError.message);
        }
    },

    async _loadPageScript(pageSlug = "", pageContainer = null) {
        const scriptResourcePath = Config.asset(
            Config.paths.pagesDirectory,
            pageSlug,
            'hasScript',
            (name) => getJavaScriptPath(name, Config.paths.pagesDirectory)
        );

        if (!scriptResourcePath || !(await checkFileExists(scriptResourcePath))) {
            return;
        }

        const absoluteScriptPath = normalizeResourcePath(scriptResourcePath);
        const scriptModule = await import(absoluteScriptPath);

        if (typeof scriptModule?.default === 'function') {
            const cleanupFunction = scriptModule.default(pageContainer);
            if (typeof cleanupFunction === 'function') {
                this._cleanupTasks.set(pageSlug, cleanupFunction);
            }
        }
    },

    async manageStyle(pageName = "", shouldActivateImmediately = false) {
        if (!pageName) {
            if (shouldActivateImmediately) this._removeUnusedStyles(null);
            return null;
        }
        const pattern = new RegExp(`^${Config.paths.projectsDirectory}`, "i");
        const pageSlug = pattern.test(pageName) ? Config.routing.singleProjectStyle: convertToSlug(pageName);
        const rawStylePath = Config.asset(
            Config.paths.pagesDirectory,
            pageSlug,
            'hasStyle',
            (name) => getStylePath(name, Config.paths.pagesDirectory)
        );

        if (!rawStylePath || !(await checkFileExists(rawStylePath))) {
            if (shouldActivateImmediately) this._removeUnusedStyles(null);
            return null;
        }

        const absoluteStylePath = normalizeResourcePath(rawStylePath);
        const isCssCached = this.isResourceCached(absoluteStylePath, Config.extensions.css);

        if (isCssCached && !shouldActivateImmediately) {
            this._removeUnusedStyles(null, true);
            return null;
        }

        if (!isCssCached) {
            await Api.fetchResource(absoluteStylePath, Config.extensions.css);
        }

        const styleLinkElement = await this._injectStyleTag(absoluteStylePath, !shouldActivateImmediately);

        if (styleLinkElement && shouldActivateImmediately) {
            await this._activateStyleTag(styleLinkElement);
            this._removeUnusedStyles(absoluteStylePath);
        }

        return styleLinkElement;
    },

    async preloadPage(pageName = "") {
        const pageSlug = convertToSlug(pageName);
        if (!pageSlug) return;

        const pagesDirectory = Config.paths.pagesDirectory;
        const absoluteHtmlPath = normalizeResourcePath(getHtmlPath(pagesDirectory, pageSlug));

        const isHtmlCached = this.isResourceCached(absoluteHtmlPath, Config.extensions.html);
        if (!isHtmlCached) {
            if (await checkFileExists(absoluteHtmlPath)) {
                Api.fetchResource(absoluteHtmlPath, Config.extensions.html).catch(() => { });
            }
        }
        await this.manageStyle(pageName, false);

        const scriptResourcePath = Config.asset(
            pagesDirectory,
            pageSlug,
            'hasScript',
            (name) => getJavaScriptPath(name, pagesDirectory)
        );

        if (scriptResourcePath) {
            import(normalizeResourcePath(scriptResourcePath)).catch(() => { });
        }

        writeDebugLog('preload', '[Preload]', pageSlug, 'syncing resources...');
    },

    async _injectStyleTag(absoluteUrl = "", isPreloadMode = true) {
        let linkElement = document.querySelector(`link[href="${absoluteUrl}"]`);

        if (!linkElement) {
            linkElement = document.createElement('link');
            linkElement.href = absoluteUrl;
            linkElement.dataset.managed = "true";
            linkElement.rel = isPreloadMode ? 'prefetch' : 'preload';
            linkElement.as = 'style';
            document.head.appendChild(linkElement);
        }

        linkElement.dataset.pageStyleState = isPreloadMode ? "preloading" : "active";
        return linkElement;
    },

    async _activateStyleTag(linkElement = null) {
        if (!linkElement || linkElement.rel === 'stylesheet') return;

        return new Promise((resolve) => {
            const onFinish = () => {
                linkElement.onload = linkElement.onerror = null;
                resolve();
            };
            linkElement.onload = onFinish;
            linkElement.onerror = onFinish;
            linkElement.rel = 'stylesheet';
            linkElement.removeAttribute('as');
            setTimeout(onFinish, Config.ui.transitionDelay);
        });
    },

    _removeUnusedStyles(activeStylePath = "", shouldOnlyRemovePreloads = false) {
        document.querySelectorAll('link[data-managed="true"]').forEach(link => {
            const resourceHref = link.getAttribute('href');
            if (link.dataset.keep === "true" || resourceHref.includes('spinner')) return;

            const isCurrentlyPreloading = link.dataset.pageStyleState === "preloading";
            const shouldBeRemoved = shouldOnlyRemovePreloads
                ? isCurrentlyPreloading
                : (resourceHref !== activeStylePath);

            if (shouldBeRemoved) link.remove();
        });
    },

    _runPageCleanup(pageSlug = "") {
        if (pageSlug && this._cleanupTasks.has(pageSlug)) {
            try {
                this._cleanupTasks.get(pageSlug)();
            } catch (cleanupError) {
                writeDebugLog('error', '[Cleanup]', pageSlug, cleanupError.message);
            }
            this._cleanupTasks.delete(pageSlug);
        }
    }
};
