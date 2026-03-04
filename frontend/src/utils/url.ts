/**
 * Sanitizes a URL by ensuring it doesn't contain hardcoded local development ports
 * that might differ between machines or sessions.
 * 
 * If a URL contains 'localhost:PORT/uploads/', it converts it to a relative path '/uploads/'.
 * This ensures assets load correctly regardless of which port the frontend or backend is running on.
 */
export const sanitizeUrl = (url: string | null | undefined): string => {
    if (!url) return '';

    // If it's already a relative path or a data URL, return as is
    if (url.startsWith('/') || url.startsWith('data:')) {
        return url;
    }

    try {
        // Check if it's a localhost URL
        if (url.includes('localhost:') || url.includes('127.0.0.1:')) {
            // Use type assertion to avoid lint errors with import.meta.env
            const metaEnv = (import.meta as any).env;
            const apiBase = metaEnv?.VITE_API_BASE_URL || '';

            // Extract the path and query from the URL
            try {
                const urlObj = new URL(url);
                const pathAndSearch = urlObj.pathname + urlObj.search;

                // Return absolute URL using the API base from environment + the path
                // This converts http://localhost:PORT/file.png to API_BASE/file.png
                return `${apiBase}${pathAndSearch}`;
            } catch (e) {
                // Better fallback for malformed URLs
                const parts = url.split('localhost:');
                if (parts.length > 1) {
                    const portAndPath = parts[1];
                    const firstSlash = portAndPath.indexOf('/');
                    if (firstSlash !== -1) {
                        return `${apiBase}${portAndPath.substring(firstSlash)}`;
                    }
                }
            }
        }
    } catch (e) {
        console.error('Error sanitizing URL:', url, e);
    }

    return url;
};

/**
 * Recursively sanitizes all string values in an object that look like URLs
 */
export const sanitizeObject = (obj: any): any => {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    const sanitized: any = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            if (typeof value === 'string' && (key === 'src' || value.includes('localhost:'))) {
                sanitized[key] = sanitizeUrl(value);
            } else if (typeof value === 'object') {
                sanitized[key] = sanitizeObject(value);
            } else {
                sanitized[key] = value;
            }
        }
    }
    return sanitized;
};
