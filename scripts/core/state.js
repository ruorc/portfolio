import { Config } from '@core';

export const State = {
    currentPage: null,
    isNavigating: false,
    isError: false,
    cache: Object.fromEntries(
        Object.keys(Config.extensions).map(key => [key, new Map()])
    )
};
