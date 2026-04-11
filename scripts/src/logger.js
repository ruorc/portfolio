import { LOG_STYLE_COLORS } from '@constants';

export const IS_DEBUG_MODE_ENABLED = ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const writeDebugLog = IS_DEBUG_MODE_ENABLED 
    ? (logType = "info", label = "", targetName = "", suffix = "") => {
        const typeStyle = LOG_STYLE_COLORS[`${logType.toUpperCase()}_MESSAGE`] || 'color: gray';
        
        console.log(
            `%c${label} %c${targetName}%c ${suffix}`, 
            typeStyle, 
            LOG_STYLE_COLORS.HIGHLIGHT_MESSAGE, 
            typeStyle
        );
    } 
    : () => {};
