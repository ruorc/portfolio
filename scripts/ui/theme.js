import { writeDebugLog } from '@logger';

export const Theme = {
    initialize() {
        const savedThemePreference = localStorage.getItem('theme') || 
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            
        document.documentElement.setAttribute('data-theme', savedThemePreference);
        writeDebugLog('success', '[Theme]', savedThemePreference, 'applied');
    },

    toggleTheme() {
        const currentActiveTheme = document.documentElement.getAttribute('data-theme');
        const nextTargetTheme = currentActiveTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', nextTargetTheme);
        localStorage.setItem('theme', nextTargetTheme);
        writeDebugLog('success', '[Theme]', 'switched to', nextTargetTheme);
    }
};
