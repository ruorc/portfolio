export const State = {
    currentPage: null,
    isNavigating: false,
    isError: false,
    cache: {
        html: new Map(),
        css: new Map(),
        js: new Map()
    }
};
