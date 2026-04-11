import { CONFIG_URL, DEFAULTS, LAYOUT_STRUCTURE } from '@constants';

let _settings = null;
let _configurationPromise = null;

const _getNestedSetting = (path = "", fallbackValue = "") => {
    if (!path) return fallbackValue;
    return path.split('.').reduce((object, key) => object?.[key], _settings) ?? fallbackValue;
};

export async function initializeConfig() {
    if (_configurationPromise) return _configurationPromise;

    _configurationPromise = fetch(CONFIG_URL)
        .then(response => response.json())
        .then(data => {
            _settings = data;
            return _settings;
        })
        .catch(error => {
            console.error("Config failed to load, using defaults", error);
            _settings = {};
            return _settings;
        });

    return _configurationPromise;
}

export const Config = {
    get layout() { return LAYOUT_STRUCTURE; },

    routing: {
        get isHash() { return _getNestedSetting('routing.useHash', DEFAULTS.ROUTING.USE_HASH_NAVIGATION); },
        get homePage() { return _getNestedSetting('routing.defaultPage', DEFAULTS.ROUTING.HOME_PAGE_NAME); },
        get errorPage() { return DEFAULTS.ROUTING.ERROR_PAGE_NAME; },
        get template404() { return DEFAULTS.ROUTING.NOT_FOUND_TEMPLATE; }
    },

    paths: {
        get scriptsDirectory() { 
            const directory = _getNestedSetting('paths.scriptsSubdir', DEFAULTS.PATHS.SCRIPTS_SUBDIRECTORY);
            return directory.endsWith('/') ? directory : `${directory}/`;
        },
        get stylesDirectory() { 
            const directory = _getNestedSetting('paths.stylesSubdir', DEFAULTS.PATHS.STYLES_SUBDIRECTORY);
            return directory.endsWith('/') ? directory : `${directory}/`;
        },
        get pagesDirectory() { 
            const directory = _getNestedSetting('paths.pagesSubdir', DEFAULTS.PATHS.PAGES_SUBDIRECTORY);
            return directory.endsWith('/') ? directory : `${directory}/`;
        },
        get componentsDirectory() {
            const directory = _getNestedSetting('paths.componentsSubdir', DEFAULTS.PATHS.COMPONENTS_SUBDIRECTORY);
            return directory.endsWith('/') ? directory : `${directory}/`;
        },
        get fallbackImage() { return _getNestedSetting('paths.fallbackImage', DEFAULTS.PATHS.FALLBACK_IMAGE_URL); }
    },

    extensions: {
        get html() { return _getNestedSetting('extensions.html', DEFAULTS.EXTENSIONS.HTML_FILE); },
        get js() { return _getNestedSetting('extensions.js', DEFAULTS.EXTENSIONS.JAVASCRIPT_FILE); },
        get css() { return _getNestedSetting('extensions.css', DEFAULTS.EXTENSIONS.CSS_FILE); }
    },

    ui: {
        get transitionDelay() { return _getNestedSetting('ui.transitionDelay', DEFAULTS.UI.TRANSITION_DELAY_MS); },
        get titleSuffix() { return _getNestedSetting('ui.titleSuffix', DEFAULTS.UI.PAGE_TITLE_SUFFIX); },
        get containerId() { return DEFAULTS.UI.MAIN_CONTAINER_ID; },
        get loaderId() { return DEFAULTS.UI.LOADER_CONTAINER_ID; }
    },

    cache: {
        get timeToLive() { return _getNestedSetting('paths.cacheTtl', DEFAULTS.PATHS.CACHE_TIME_TO_LIVE); },
        get isAutoCleanEnabled() { return _getNestedSetting('paths.autoCleanCache', DEFAULTS.CACHE.IS_AUTO_CLEAN_ENABLED); }
    },

    asset(rootKey = "", pageName = "", assetType = "", pathGenerator = (name) => name) {
        pageName = _convertToSlug(pageName);
        if (!pageName || !assetType) return undefined;
        
        rootKey = _convertToSlug(rootKey);
        const prefix = rootKey ? `${rootKey}.` : '';

        const isEnabled = _getNestedSetting(`${prefix}${pageName}.${assetType}`);
        
        if (isEnabled === false) return null;
        return isEnabled ? pathGenerator(pageName) : undefined;
    }
};

export const getJavaScriptPath = (name = "", subDirectory = "") => 
    _buildPath(Config.paths.scriptsDirectory, Config.extensions.js, name, subDirectory);

export const getStylePath = (name = "", subDirectory = "") => 
    _buildPath(Config.paths.stylesDirectory, Config.extensions.css, name, subDirectory);

export const getHtmlPath = (baseDirectory = "", name = "", subDirectory = "") => 
    _buildPath(baseDirectory, Config.extensions.html, name, subDirectory);

const _buildPath = (directory = "", extension = "", fileName = "", subDirectory = "") => {
    if (!fileName || !directory) return "";
    
    const segments = [
        _convertToSlug(directory), 
        _convertToSlug(subDirectory), 
        _convertToSlug(fileName)
    ].filter(Boolean);
    
    return `${segments.join('/')}${extension}`;
};

const _convertToSlug = (text = "") => {
    if (!text) return "";
    return String(text)
        .trim()
        .replace(/^#/, '')
        .replace(/\/+/g, '/')
        .replace(/^\/|\/$/g, '')
        .toLowerCase()
        .replace(/\s+/g, '-');
};
