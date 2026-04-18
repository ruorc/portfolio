import { initializeConfig, Config, State, Router, Layout, Loader } from '@core';
import { Theme } from '@ui';
import { SELECTORS } from '@constants';
import { convertToSlug } from '@utils';

async function bootstrapApplication() {
    try {
        await initializeConfig();
        Theme.initialize();
        await Layout.load();

        const resolveCurrentPath = () => {
            const rawPath = Config.routing.isHash
                ? window.location.hash.slice(1)
                : window.location.pathname;
            return convertToSlug(rawPath) || Config.routing.homePage;
        };

        document.addEventListener('click', (event) => {
            const navigationLink = event.target.closest(SELECTORS.NAV_LINK);
            if (navigationLink) {
                event.preventDefault();
                const targetHref = navigationLink.getAttribute('href');
                Router.navigateTo(convertToSlug(targetHref));
            }

            if (event.target.closest(SELECTORS.THEME_TOGGLER_BUTTON)) {
                Theme.toggleTheme();
            }
        });

        document.addEventListener('mouseover', (event) => {
            const navigationLink = event.target.closest(SELECTORS.NAV_LINK);
            if (navigationLink) {
                const targetPageSlug = convertToSlug(navigationLink.getAttribute('href'));
                if (targetPageSlug && targetPageSlug !== State.currentPage) {
                    Loader.preloadPage(targetPageSlug);
                }
            }
        });

        document.addEventListener('error', (event) => {
            const errorTarget = event.target;
            if (errorTarget.tagName === 'IMG' && errorTarget.src !== Config.paths.fallbackImage) {
                errorTarget.src = Config.paths.fallbackImage;
            }
        }, true);

        const navigationEventType = Config.routing.isHash ? 'hashchange' : 'popstate';
        window.addEventListener(navigationEventType, () => {
            Router.navigateTo(resolveCurrentPath());
        });

        Router.navigateTo(resolveCurrentPath());

    } catch (criticalError) {
        const mainContainer = document.querySelector('main');

        if (mainContainer) {
            mainContainer.className = 'error-page';
            mainContainer.innerHTML = `
                <div class="critical-error">
                    <h1>Oops! Something went wrong</h1>
                    <p>Failed to load the application configuration.</p>
                    <button onclick="window.location.reload()">Try again</button>
                </div>
            `;
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapApplication);
} else {
    bootstrapApplication();
}
