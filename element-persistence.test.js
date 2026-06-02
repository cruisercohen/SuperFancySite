import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { ElementStore } from './element-store.module.js';
import { createElementManager } from './element-manager.module.js';

// ============================================
// Generators / Arbitraries
// ============================================

/** Generate a valid ISO 8601 date string */
const isoDateArb = fc.integer({ min: 1577836800000, max: 1924991999000 })
    .map(ts => new Date(ts).toISOString());

/** Generate a valid element type */
const elementTypeArb = fc.constantFrom('text', 'image', 'separator');

/** Generate a valid Element_Descriptor */
const validDescriptorArb = fc.record({
    id: fc.uuid(),
    type: elementTypeArb,
    content: fc.string({ minLength: 0, maxLength: 200 }),
    position: fc.record({
        x: fc.double({ min: 0, max: 2000, noNaN: true, noDefaultInfinity: true }),
        y: fc.double({ min: 0, max: 2000, noNaN: true, noDefaultInfinity: true })
    }),
    style: fc.record({
        width: fc.option(fc.double({ min: 10, max: 1000, noNaN: true, noDefaultInfinity: true }), { nil: null }),
        height: fc.option(fc.double({ min: 10, max: 1000, noNaN: true, noDefaultInfinity: true }), { nil: null })
    }),
    createdAt: isoDateArb,
    updatedAt: isoDateArb
});

/** Generate an array of valid descriptors */
const validDescriptorArrayArb = fc.array(validDescriptorArb, { minLength: 0, maxLength: 10 });

/** Generate an invalid descriptor (violates schema in various ways) */
const invalidDescriptorArb = fc.oneof(
    // Missing id
    fc.record({
        type: elementTypeArb,
        content: fc.string(),
        position: fc.record({ x: fc.integer(), y: fc.integer() }),
        style: fc.constant({}),
        createdAt: isoDateArb,
        updatedAt: isoDateArb
    }),
    // Invalid type
    fc.record({
        id: fc.uuid(),
        type: fc.constantFrom('video', 'audio', 'widget', '', 123, null),
        content: fc.string(),
        position: fc.record({ x: fc.integer(), y: fc.integer() }),
        style: fc.constant({}),
        createdAt: isoDateArb,
        updatedAt: isoDateArb
    }),
    // Missing position
    fc.record({
        id: fc.uuid(),
        type: elementTypeArb,
        content: fc.string(),
        style: fc.constant({}),
        createdAt: isoDateArb,
        updatedAt: isoDateArb
    }),
    // Invalid position (non-numeric)
    fc.record({
        id: fc.uuid(),
        type: elementTypeArb,
        content: fc.string(),
        position: fc.record({ x: fc.constant('abc'), y: fc.constant('def') }),
        style: fc.constant({}),
        createdAt: isoDateArb,
        updatedAt: isoDateArb
    }),
    // Invalid createdAt (not a date)
    fc.record({
        id: fc.uuid(),
        type: elementTypeArb,
        content: fc.string(),
        position: fc.record({ x: fc.integer(), y: fc.integer() }),
        style: fc.constant({}),
        createdAt: fc.constant('not-a-date'),
        updatedAt: isoDateArb
    }),
    // null value
    fc.constant(null),
    // number instead of object
    fc.constant(42),
    // string instead of object
    fc.constant('invalid'),
    // Empty id
    fc.record({
        id: fc.constant(''),
        type: elementTypeArb,
        content: fc.string(),
        position: fc.record({ x: fc.integer(), y: fc.integer() }),
        style: fc.constant({}),
        createdAt: isoDateArb,
        updatedAt: isoDateArb
    })
);

// ============================================
// Property Tests
// ============================================

describe('Page Element Persistence - Property Tests', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    describe('Property 1: Serialization Round-Trip', () => {
        /**
         * **Validates: Requirements 7.1**
         * For any valid Element_Descriptor, serializing to JSON via ElementStore.save()
         * and then deserializing via ElementStore.load() SHALL produce an equivalent
         * Element_Descriptor.
         */
        it('serializing and deserializing valid descriptors produces equivalent data', () => {
            fc.assert(
                fc.property(validDescriptorArrayArb, (descriptors) => {
                    // Save the descriptors
                    ElementStore.save(descriptors);

                    // Load them back
                    const loaded = ElementStore.load();

                    // They should be deeply equal
                    expect(loaded).toEqual(descriptors);
                }),
                { numRuns: 100 }
            );
        });
    });

    describe('Property 2: Creation Grows the Element Set', () => {
        /**
         * **Validates: Requirements 1.2, 1.3**
         * For any element type, calling createElement(type) SHALL result in the
         * descriptor array length increasing by exactly one with the correct type.
         */
        it('createElement increases descriptor count by one with correct type', () => {
            fc.assert(
                fc.property(
                    validDescriptorArrayArb,
                    elementTypeArb,
                    (startingDescriptors, type) => {
                        const manager = createElementManager();

                        // Set initial state by saving and loading
                        ElementStore.save(startingDescriptors);
                        manager.init();

                        const beforeLength = manager.getAllDescriptors().length;

                        // Create a new element
                        const created = manager.createElement(type);

                        const afterDescriptors = manager.getAllDescriptors();

                        // Length increased by exactly 1
                        expect(afterDescriptors.length).toBe(beforeLength + 1);

                        // New element has correct type
                        expect(created.type).toBe(type);

                        // New element has a non-empty id
                        expect(created.id).toBeTruthy();
                        expect(typeof created.id).toBe('string');
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    describe('Property 3: Deletion Removes Exactly One Element', () => {
        /**
         * **Validates: Requirements 3.1, 3.2**
         * For any existing element, calling deleteElement(id) SHALL result in
         * the descriptor array length decreasing by exactly one with the ID absent.
         */
        it('deleteElement removes exactly the targeted descriptor', () => {
            fc.assert(
                fc.property(
                    fc.array(validDescriptorArb, { minLength: 1, maxLength: 10 }),
                    (descriptors) => {
                        const manager = createElementManager();

                        // Save descriptors and initialize
                        ElementStore.save(descriptors);
                        manager.init();

                        // Pick a random descriptor to delete
                        const indexToDelete = Math.floor(Math.random() * descriptors.length);
                        const idToDelete = descriptors[indexToDelete].id;

                        const beforeLength = manager.getAllDescriptors().length;

                        // Delete the element
                        manager.deleteElement(idToDelete);

                        const afterDescriptors = manager.getAllDescriptors();

                        // Length decreased by exactly 1
                        expect(afterDescriptors.length).toBe(beforeLength - 1);

                        // ID is absent
                        expect(afterDescriptors.find(d => d.id === idToDelete)).toBeUndefined();
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    describe('Property 4: Position Update Persistence', () => {
        /**
         * **Validates: Requirements 2.1, 2.3, 4.1**
         * For any valid element and position coordinates, updating position and
         * reloading from store SHALL yield the new position.
         */
        it('position updates are persisted and restored correctly', () => {
            fc.assert(
                fc.property(
                    validDescriptorArb,
                    fc.double({ min: 0, max: 2000, noNaN: true, noDefaultInfinity: true }),
                    fc.double({ min: 0, max: 2000, noNaN: true, noDefaultInfinity: true }),
                    (descriptor, newX, newY) => {
                        const manager = createElementManager();

                        // Save single descriptor and init
                        ElementStore.save([descriptor]);
                        manager.init();

                        // Update position
                        manager.updateElement(descriptor.id, { position: { x: newX, y: newY } });

                        // Reload from store
                        const loaded = ElementStore.load();

                        // Find the element
                        const found = loaded.find(d => d.id === descriptor.id);
                        expect(found).toBeDefined();
                        expect(found.position.x).toBe(newX);
                        expect(found.position.y).toBe(newY);
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    describe('Property 5: Invalid Descriptors Are Rejected on Load', () => {
        /**
         * **Validates: Requirements 5.3, 7.2, 7.3**
         * For any invalid JSON objects, the ElementStore SHALL exclude them
         * from the returned descriptor array without throwing.
         */
        it('invalid descriptors are excluded without throwing', () => {
            fc.assert(
                fc.property(
                    fc.array(invalidDescriptorArb, { minLength: 1, maxLength: 10 }),
                    (invalidDescriptors) => {
                        // Write invalid data directly to localStorage
                        localStorage.setItem(
                            ElementStore.STORAGE_KEY,
                            JSON.stringify(invalidDescriptors)
                        );

                        // Load should not throw
                        let loaded;
                        expect(() => {
                            loaded = ElementStore.load();
                        }).not.toThrow();

                        // All invalid descriptors should be excluded
                        expect(loaded.length).toBe(0);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('mixed valid and invalid descriptors - only valid ones are returned', () => {
            fc.assert(
                fc.property(
                    fc.array(validDescriptorArb, { minLength: 1, maxLength: 5 }),
                    fc.array(invalidDescriptorArb, { minLength: 1, maxLength: 5 }),
                    (validDescs, invalidDescs) => {
                        // Mix valid and invalid
                        const mixed = [...validDescs, ...invalidDescs];

                        // Write mixed data directly to localStorage
                        localStorage.setItem(
                            ElementStore.STORAGE_KEY,
                            JSON.stringify(mixed)
                        );

                        // Load should not throw
                        let loaded;
                        expect(() => {
                            loaded = ElementStore.load();
                        }).not.toThrow();

                        // Only valid descriptors should be returned
                        expect(loaded.length).toBe(validDescs.length);
                        // Each loaded descriptor should match one of the valid ones
                        for (const d of loaded) {
                            expect(validDescs.find(v => v.id === d.id)).toBeDefined();
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    describe('Property 6: Content Edit Persistence', () => {
        /**
         * **Validates: Requirements 6.2, 4.1**
         * For any text element and new content string, updating content
         * SHALL result in the stored descriptor containing the new content.
         */
        it('content edits are persisted and restored correctly', () => {
            fc.assert(
                fc.property(
                    validDescriptorArb.filter(d => d.type === 'text'),
                    fc.string({ minLength: 1, maxLength: 500 }),
                    (descriptor, newContent) => {
                        const manager = createElementManager();

                        // Save single descriptor and init
                        ElementStore.save([descriptor]);
                        manager.init();

                        // Update content
                        manager.updateElement(descriptor.id, { content: newContent });

                        // Reload from store
                        const loaded = ElementStore.load();

                        // Find the element
                        const found = loaded.find(d => d.id === descriptor.id);
                        expect(found).toBeDefined();
                        expect(found.content).toBe(newContent);
                    }
                ),
                { numRuns: 100 }
            );
        });
    });
});
