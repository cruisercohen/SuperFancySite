// ============================================
// Element_Manager - Testable Module Export
// This mirrors the ElementManager implementation in script.js
// but exports for testing purposes.
// ============================================

import { ElementStore } from './element-store.module.js';

/**
 * Generate a unique ID.
 * Uses crypto.randomUUID() with fallback.
 * @returns {string}
 */
function generateId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Create a testable ElementManager instance with its own state.
 */
export function createElementManager() {
    let descriptors = [];

    function init() {
        descriptors = ElementStore.load();
    }

    function createElement(type) {
        const now = new Date().toISOString();
        const descriptor = {
            id: generateId(),
            type: type,
            content: type === 'text' ? 'Double-click to edit' : '',
            position: {
                x: Math.min(200 + Math.random() * 200, 800),
                y: Math.min(200 + Math.random() * 200, 600)
            },
            style: { width: null, height: null },
            createdAt: now,
            updatedAt: now
        };

        descriptors.push(descriptor);
        ElementStore.save(descriptors);
        return descriptor;
    }

    function updateElement(id, changes) {
        const index = descriptors.findIndex(d => d.id === id);
        if (index === -1) return;

        Object.assign(descriptors[index], changes);
        descriptors[index].updatedAt = new Date().toISOString();
        ElementStore.save(descriptors);
    }

    function deleteElement(id) {
        descriptors = descriptors.filter(d => d.id !== id);
        ElementStore.save(descriptors);
    }

    function getAllDescriptors() {
        return descriptors;
    }

    function setDescriptors(descs) {
        descriptors = [...descs];
    }

    return {
        init,
        createElement,
        updateElement,
        deleteElement,
        getAllDescriptors,
        setDescriptors,
        generateId
    };
}
