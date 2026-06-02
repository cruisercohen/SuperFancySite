// ============================================
// Element_Store - Testable Module Export
// This mirrors the ElementStore implementation in script.js
// but exports for testing purposes.
// ============================================

const STORAGE_KEY = 'superfancy_page_elements';

/**
 * Check if localStorage is accessible.
 * @returns {boolean}
 */
function isAvailable() {
    try {
        const testKey = '__storage_test__';
        localStorage.setItem(testKey, '1');
        localStorage.removeItem(testKey);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Validate a single Element_Descriptor against the expected schema.
 * @param {*} descriptor - The object to validate
 * @returns {boolean}
 */
function isValidDescriptor(descriptor) {
    if (!descriptor || typeof descriptor !== 'object') return false;
    if (typeof descriptor.id !== 'string' || descriptor.id.length === 0) return false;
    if (!['text', 'image', 'separator'].includes(descriptor.type)) return false;
    if (typeof descriptor.content !== 'string') return false;
    if (!descriptor.position || typeof descriptor.position !== 'object') return false;
    if (typeof descriptor.position.x !== 'number' || typeof descriptor.position.y !== 'number') return false;
    if (!descriptor.style || typeof descriptor.style !== 'object') return false;
    if (typeof descriptor.createdAt !== 'string' || !isValidISO8601(descriptor.createdAt)) return false;
    if (typeof descriptor.updatedAt !== 'string' || !isValidISO8601(descriptor.updatedAt)) return false;
    return true;
}

/**
 * Check if a string is a valid ISO 8601 date string.
 * @param {string} str
 * @returns {boolean}
 */
function isValidISO8601(str) {
    const date = new Date(str);
    return !isNaN(date.getTime());
}

/**
 * Serialize and save descriptors to localStorage.
 * @param {Array} descriptors - Array of Element_Descriptors
 * @returns {boolean} - true if save succeeded, false otherwise
 */
function save(descriptors) {
    if (!isAvailable()) return false;
    try {
        const json = JSON.stringify(descriptors);
        localStorage.setItem(STORAGE_KEY, json);
        return true;
    } catch (e) {
        console.warn('[ElementStore] Save failed:', e.message);
        return false;
    }
}

/**
 * Read, parse, and validate stored descriptors from localStorage.
 * @returns {Array} - Array of valid Element_Descriptors (empty array on failure)
 */
function load() {
    if (!isAvailable()) return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            console.warn('[ElementStore] Stored data is not an array. Discarding.');
            return [];
        }
        const valid = [];
        for (const descriptor of parsed) {
            if (isValidDescriptor(descriptor)) {
                valid.push(descriptor);
            } else {
                console.warn('[ElementStore] Skipping invalid descriptor:', descriptor);
            }
        }
        return valid;
    } catch (e) {
        console.warn('[ElementStore] Failed to parse stored data:', e.message);
        return [];
    }
}

/**
 * Remove all stored element data from localStorage.
 */
function clear() {
    if (!isAvailable()) return;
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        console.warn('[ElementStore] Clear failed:', e.message);
    }
}

export const ElementStore = {
    isAvailable,
    save,
    load,
    clear,
    isValidDescriptor,
    STORAGE_KEY
};
