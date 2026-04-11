const _cleanStringInput = (inputString = "") => {
    if (!inputString) return "";
    return String(inputString)
        .trim()
        .replace(/^#/, '')
        .replace(/\/+/g, '/')
        .replace(/^\/|\/$/g, '');
};

export const convertToSlug = (resourceName = "") => {
    const cleanedInput = _cleanStringInput(resourceName);
    if (!cleanedInput) return "";
    
    return cleanedInput.toLowerCase().replace(/\s+/g, '-');
};

export const formatPageNameDisplay = (pageSlug = "") => {
    const cleanedInput = _cleanStringInput(pageSlug);
    if (!cleanedInput) return "";
    
    return cleanedInput
        .split('-')
        .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1) : "")
        .join(' ');
};

export const normalizeResourcePath = (pathString = "") => {
    const safePath = pathString || "/";
    return new URL(safePath, window.location.origin).href;
};

export async function checkFileExists(resourceUrl = "") {
    if (!resourceUrl) return false;
    
    try {
        const response = await fetch(normalizeResourcePath(resourceUrl), { method: 'HEAD' });
        return response.ok;
    } catch (error) { 
        return false; 
    }
}
