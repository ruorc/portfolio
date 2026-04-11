import { Config, State } from '@core';
import { DEFAULTS } from '@constants';
import { normalizeResourcePath } from '@utils';
import { writeDebugLog } from '@logger';

export const Api = {
    _pendingRequests: new Map(),
    _isCleanerInitialized: false,

    async fetchResource(resourceUrl = "", resourceType = 'html') {
        if (!resourceUrl) return "";
        
        const absoluteUrl = normalizeResourcePath(resourceUrl);
        const currentTimestamp = Date.now();

        this._startAutoCacheCleaner();

        const cacheCategory = State.cache?.[resourceType];
        const cachedResource = cacheCategory?.get(absoluteUrl);

        if (cachedResource && (currentTimestamp - cachedResource.timestamp < Config.cache.timeToLive)) {
            return cachedResource.data;
        }

        if (this._pendingRequests.has(absoluteUrl)) {
            return this._pendingRequests.get(absoluteUrl);
        }

        const networkPromise = (async () => {
            try {
                const response = await fetch(absoluteUrl);
                if (!response.ok) throw new Error(`HTTP_STATUS_${response.status}`);
                
                const responseData = await response.text();
                const pattern = new RegExp(`^${Config.paths.pagesDirectory}`, "i");
                const isPageResource = pattern.test(resourceUrl);

                if (isPageResource && cacheCategory) {
                    cacheCategory.set(absoluteUrl, { 
                        data: responseData, 
                        timestamp: Date.now() 
                    });
                }

                return responseData;
            } finally {
                this._pendingRequests.delete(absoluteUrl);
            }
        })();

        this._pendingRequests.set(absoluteUrl, networkPromise);
        return networkPromise;
    },

    async fetchPage(pageUrl = "") {
        return this.fetchResource(pageUrl, 'html');
    },

    _startAutoCacheCleaner() {
        if (!Config.cache.isAutoCleanEnabled || this._isCleanerInitialized) {
            return;
        }
        
        this._isCleanerInitialized = true;
        
        const cleanIntervalMs = Math.max(
            Config.cache.timeToLive / 2, 
            DEFAULTS.CACHE.MIN_CLEAN_INTERVAL_MS
        );

        setInterval(() => {
            const currentTimestamp = Date.now();
            let evictedItemsCount = 0;

            ['html', 'css', 'js'].forEach(resourceType => {
                const cacheCategory = State.cache?.[resourceType];
                if (!cacheCategory) return;

                for (const [url, cachedItem] of cacheCategory.entries()) {
                    if (currentTimestamp - cachedItem.timestamp > Config.cache.timeToLive) {
                        cacheCategory.delete(url);
                        evictedItemsCount++;
                    }
                }
            });

            if (evictedItemsCount > 0) {
                writeDebugLog('warn', '[Cache Cleaner]', `Evicted ${evictedItemsCount} items across all categories`);
            }
        }, cleanIntervalMs);
    }
};
