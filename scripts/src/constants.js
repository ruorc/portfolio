export const CONFIG_URL = './config.json';

export const SELECTORS = {
    NAV_LINK: 'a[data-link]',
    HEADER_NAV_LINKS: 'header nav a[data-link]',
    THEME_TOGGLER_BUTTON: '#theme-toggle'
};

export const LAYOUT_STRUCTURE = [
    { id: 'header', path: 'header' },
    { id: 'footer', path: 'footer' }
];

export const LOG_STYLE_COLORS = {
    PRELOAD_MESSAGE: "color: #9C27B0; font-weight: bold;",
    SUCCESS_MESSAGE: "color: #4CAF50; font-weight: bold;",
    WARNING_MESSAGE: "color: #FF9800; font-style: italic;",
    ERROR_MESSAGE: "color: #F44336; font-weight: bold;",
    HIGHLIGHT_MESSAGE: "color: #000000; font-weight: 900; background: #eee; padding: 0 4px; border-radius: 2px;"
};

export const DEFAULTS = {
    ROUTING: {
        USE_HASH_NAVIGATION: true,
        HOME_PAGE_NAME: 'home',
        ERROR_PAGE_NAME: 'error',
        NOT_FOUND_TEMPLATE: '404'
    },
    PATHS: {
        SCRIPTS_SUBDIRECTORY: 'scripts',
        STYLES_SUBDIRECTORY: 'styles',
        PAGES_SUBDIRECTORY: 'pages',
        COMPONENTS_SUBDIRECTORY: 'components',
        FALLBACK_IMAGE_URL: '/assets/images/no-image.svg'
    },
    EXTENSIONS: {
        HTML_FILE: 'html',
        JAVASCRIPT_FILE: 'js',
        CSS_FILE: 'css'
    },
    UI: {
        MAIN_CONTAINER_ID: 'page-wrapper',
        LOADER_CONTAINER_ID: '.loader-container',
        TRANSITION_DELAY_MS: 500,
        PAGE_TITLE_SUFFIX: 'SPA Project'
    },
    CACHE: {
        IS_AUTO_CLEAN_ENABLED: true,
        MIN_CLEAN_INTERVAL_MS: 30000,
        CACHE_TIME_TO_LIVE: 300000
    }
};
