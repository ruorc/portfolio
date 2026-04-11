import { Config, Api, getHtmlPath } from '@core';
import { checkFileExists } from '@utils';
import { writeDebugLog } from '@logger';

export const Layout = {
    async load() {
        const loadingTasks = Config.layout.map(async ({ id: elementId, path: componentPath }) => {
            const containerElement = document.getElementById(elementId);
            
            if (!containerElement) {
                return writeDebugLog('warn', '[Layout]', elementId, 'missing');
            }

            const componentFullPath = getHtmlPath(Config.paths.componentsDirectory, componentPath);
            
            if (await checkFileExists(componentFullPath)) {
                containerElement.innerHTML = await Api.fetchPage(componentFullPath);
            }
        });

        return Promise.all(loadingTasks);
    }
};
