const href = link.getAttribute('href');
            const isCurrent = href === activePath;
            const isPreload = link.dataset.pageStyle === "preloading";

            // Skip the current active stylesheet to prevent flickering
            if (isCurrent) return;

            /**
             * Business Rule: 
             * Delete if we are in "Full Cleanup" mode OR if the style is explicitly a "Preload"
             */
            const shouldRemove = !onlyPreloads || isPreload;

            if (shouldRemove) {
                link.remove();
            }