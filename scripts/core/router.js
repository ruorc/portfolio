import { Config, Api, State, Loader, getHtmlPath } from '@core';
import { UI } from '@ui';
import { convertToSlug } from '@utils';
import { IS_DEBUG_MODE_ENABLED, writeDebugLog } from '@logger';

export const Router = {
    async navigateTo(pageName = Config.routing.homePage) {
        const normalizedPageName = convertToSlug(pageName);
        
        if (State.isNavigating || (State.currentPage === normalizedPageName && !State.isError)) {
            return;
        }
        
        State.isNavigating = true;
        
        UI.prepareTransition();
        UI.scrollToTop();

        let loaderDisplayTimeout = null;

        if (IS_DEBUG_MODE_ENABLED) {
            UI.toggleLoader(true);
        } else {
            loaderDisplayTimeout = setTimeout(() => {
                UI.toggleLoader(true);
            }, Config.ui.transitionDelay);
        }

        let pageContentHtml = '';
        let finalTargetPageName = normalizedPageName;
        const pageResourcePath = getHtmlPath(Config.paths.pagesDirectory, normalizedPageName);

        try {
            if (IS_DEBUG_MODE_ENABLED) {
                await new Promise((resolve) => setTimeout(resolve, Config.ui.transitionDelay));
            }

            pageContentHtml = await Api.fetchPage(pageResourcePath);
            
            await Loader.manageStyle(normalizedPageName, true);

            State.isError = false;
            State.currentPage = normalizedPageName;

        } catch (navigationError) {
            writeDebugLog('error', '[Router]', normalizedPageName, 'Loading 404', navigationError.message);
            
            State.isError = true;
            finalTargetPageName = Config.routing.errorPage;
            
            await Loader.manageStyle(null, true); 

            const errorTemplatePath = getHtmlPath(Config.paths.pagesDirectory, Config.routing.template404);
            
            try {
                pageContentHtml = await Api.fetchPage(errorTemplatePath);
                await Loader.manageStyle(Config.routing.template404, true);
            } catch {
                pageContentHtml = UI.generateNotFoundMarkup(normalizedPageName);
            }
        }

        if (loaderDisplayTimeout) {
            clearTimeout(loaderDisplayTimeout);
        }
        
        UI.toggleLoader(false);

        UI.renderPage(pageContentHtml, finalTargetPageName);
        
        requestAnimationFrame(() => {
            Loader.initializePageScripts(finalTargetPageName, UI.getContainer());
        });

        UI.updateActiveNavigationLink(State.currentPage);
        UI.syncBrowserHistory(State.currentPage);

        State.isNavigating = false;
    }
};
