import { Config, State } from '@core';
import { SELECTORS } from '@constants';
import { convertToSlug, formatPageNameDisplay } from '@utils';

export const UI = {
    getContainer: () => document.getElementById(Config.ui.containerId),
    
    getLoader: () => document.querySelector(Config.ui.loaderId),

    toggleLoader(isShown = false) {
        const loaderElement = this.getLoader();
        if (loaderElement) {
            loaderElement.classList.toggle('hidden', !isShown);
        }
    },

    prepareTransition() {
        const containerElement = this.getContainer();
        if (containerElement) {
            containerElement.classList.replace('visible', 'hidden');
            containerElement.classList.remove(`${convertToSlug(State.currentPage)}-page`, 'error-page');
        }
    },

    renderPage(pageContentHtml = "", pageName = "") {
        const containerElement = this.getContainer();
        if (!containerElement) return;

        containerElement.innerHTML = pageContentHtml;
        
        const pageSlug = convertToSlug(pageName);
        containerElement.classList.add(`${pageSlug}-page`);
        
        if (State.isError) {
            containerElement.classList.add('error-page');
        }
        
        containerElement.classList.remove('hidden');
        
        // Trigger reflow
        void containerElement.offsetWidth; 
        
        requestAnimationFrame(() => {
            containerElement.classList.add('visible');
        });
        
        const pageTitleContent = State.isError ? "404" : this.getNavigationLinkText(pageName);
        document.title = `${pageTitleContent} | ${Config.ui.titleSuffix}`;
    },

    generateNotFoundMarkup(pageName = "") {
        const lastValidPage = State.currentPage || Config.routing.homePage;
        const backNavigationPath = `${Config.routing.isHash ? '#' : '/'}${convertToSlug(lastValidPage)}`;
        
        const missingPageTitle = this.getNavigationLinkText(pageName);
        const lastValidPageTitle = this.getNavigationLinkText(lastValidPage);

        return `
            <h1>404</h1>
            <p>Page <strong>"${missingPageTitle}"</strong> not found.</p>
            <a href="${backNavigationPath}" data-link>Back to ${lastValidPageTitle}</a>
        `;
    },

    getNavigationLinkText(pageName = "") {
        const targetSlug = convertToSlug(pageName);
        const navigationLinks = document.querySelectorAll(SELECTORS.NAV_LINK);
        
        for (const linkElement of navigationLinks) {
            const rawHref = linkElement.getAttribute('href')?.replace(/^#/, '').replace(/^\//, '') || "";
            if (convertToSlug(rawHref) === targetSlug) {
                return linkElement.innerText;
            }
        }
        
        return formatPageNameDisplay(pageName);
    },

    updateActiveNavigationLink(pageName = "") {
        const activeSlug = convertToSlug(pageName);
        const navigationLinks = document.querySelectorAll(`${SELECTORS.HEADER_NAV_LINKS}, ${SELECTORS.LOGO_LINK}`);
        
        navigationLinks.forEach((linkElement) => {
            const rawHref = linkElement.getAttribute('href')?.replace(/^#/, '').replace(/^\//, '') || "";
            const isMatch = convertToSlug(rawHref) === activeSlug;
            linkElement.classList.toggle('active', isMatch);
        });
    },

    syncBrowserHistory(pageName = "") {
        const normalizedPageName = convertToSlug(pageName);
        
        if (Config.routing.isHash) {
            if (window.location.hash !== `#${normalizedPageName}`) {
                window.location.hash = normalizedPageName;
            }
        } else {
            const historyPath = normalizedPageName === Config.routing.homePage ? '/' : `/${normalizedPageName}`;
            if (window.location.pathname !== historyPath) {
                window.history.pushState({ page: normalizedPageName }, "", historyPath);
            }
        }
    },

    scrollToTop: () => window.scrollTo({ top: 0, behavior: 'smooth' })
};
