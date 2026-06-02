# Implementation Plan: Page Element Persistence

## Overview

This plan implements the page element persistence feature for SuperFancySite using vanilla JavaScript. The implementation adds a toolbar for creating elements (text, image, separator), drag-and-drop positioning, inline editing, delete functionality, and localStorage-based persistence with validation. All code integrates into the existing `script.js`, `style.css`, and `index.html` files.

## Tasks

- [ ] 1. Implement Element_Store persistence layer
  - [ ] 1.1 Create the Element_Store module in script.js
    - Implement `ElementStore.isAvailable()` to check localStorage accessibility
    - Implement `ElementStore.save(descriptors)` to serialize and write the descriptor array to localStorage under the key `"superfancy_page_elements"`
    - Implement `ElementStore.load()` to read, parse, and validate stored JSON from localStorage
    - Implement `ElementStore.clear()` to remove the stored key
    - Implement schema validation: check `id` (non-empty string), `type` (one of text/image/separator), `content` (string), `position` (object with numeric x/y), `style` (object), `createdAt`/`updatedAt` (ISO 8601 strings)
    - Skip invalid descriptors with a console warning; catch JSON parse errors and return empty array
    - _Requirements: 4.1, 4.2, 4.3, 5.3, 7.1, 7.2, 7.3_

  - [ ]* 1.2 Write property test for serialization round-trip
    - **Property 1: Serialization Round-Trip**
    - Generate random valid Element_Descriptors with fast-check, serialize via `ElementStore.save()`, deserialize via `ElementStore.load()`, assert deep equality
    - **Validates: Requirements 7.1**

  - [ ]* 1.3 Write property test for invalid descriptor rejection
    - **Property 5: Invalid Descriptors Are Rejected on Load**
    - Generate random invalid JSON objects that violate the schema, feed to load/validation logic, assert they are excluded without errors
    - **Validates: Requirements 5.3, 7.2, 7.3**

- [ ] 2. Implement Element_Manager core logic
  - [ ] 2.1 Create the Element_Manager module in script.js
    - Implement `ElementManager.init()` to bootstrap on page load — call `ElementStore.load()` and `restoreElements()`
    - Implement `ElementManager.createElement(type)` to create a new Element_Descriptor with a unique ID via `crypto.randomUUID()` (with fallback), default position, empty content, timestamps, and add to internal descriptor array
    - Implement `ElementManager.updateElement(id, changes)` to patch an existing descriptor's fields and update `updatedAt`
    - Implement `ElementManager.deleteElement(id)` to remove a descriptor from the array
    - After every mutation, call `ElementStore.save(descriptors)`
    - Implement `ElementManager.getAllDescriptors()` to return current in-memory array
    - Implement `ElementManager.restoreElements(descriptors)` to render all descriptors to DOM
    - _Requirements: 1.2, 1.3, 3.1, 3.2, 4.1, 5.1, 5.2_

  - [ ]* 2.2 Write property test for element creation
    - **Property 2: Creation Grows the Element Set**
    - Generate random starting descriptor arrays and element types, call `createElement(type)`, assert array length increased by exactly one with correct type
    - **Validates: Requirements 1.2, 1.3**

  - [ ]* 2.3 Write property test for element deletion
    - **Property 3: Deletion Removes Exactly One Element**
    - Generate random descriptor arrays with at least one element, delete by random valid ID, assert length decreased by one and ID is absent
    - **Validates: Requirements 3.1, 3.2**

- [ ] 3. Implement Element_Toolbar UI
  - [ ] 3.1 Add toolbar HTML structure to index.html
    - Add a fixed-position toolbar container with buttons for text block, image, and decorative separator element types
    - Each button should have appropriate labels and aria attributes
    - _Requirements: 1.1, 1.4_

  - [ ] 3.2 Add toolbar styles to style.css
    - Style the toolbar as a fixed-position floating panel
    - Style toolbar buttons with hover/active states consistent with the site's design language
    - _Requirements: 1.1_

  - [ ] 3.3 Implement ElementToolbar module in script.js
    - Implement `ElementToolbar.init(containerSelector)` to bind click handlers to toolbar buttons
    - Implement `ElementToolbar.getAvailableTypes()` returning `['text', 'image', 'separator']`
    - On button click, call `ElementManager.createElement(type)` and render the new element
    - _Requirements: 1.1, 1.2, 1.4_

- [ ] 4. Checkpoint - Core modules verified
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement Page_Element DOM rendering and delete functionality
  - [ ] 5.1 Implement element rendering function in script.js
    - Create DOM structure for each element type: wrapper div with `class="page-element"`, `data-element-id`, absolute positioning
    - Render controls container with delete button (× character, `aria-label="Delete element"`)
    - Render type-specific content: `contenteditable` div for text, `<img>` for image, `<hr>` for separator
    - Show delete control on hover/focus of the Page_Element
    - _Requirements: 3.3, 5.2, 5.4_

  - [ ] 5.2 Implement delete functionality in script.js
    - Attach click handler to each element's delete button
    - On click, call `ElementManager.deleteElement(id)` and remove the DOM node
    - _Requirements: 3.1, 3.2_

  - [ ] 5.3 Add Page_Element styles to style.css
    - Style `.page-element` with absolute positioning, border, background consistent with site theme
    - Style `.page-element-controls` to appear on hover
    - Style `.page-element-delete` button
    - Style type-specific content containers (text, image, separator)
    - _Requirements: 3.3, 5.4_

- [ ] 6. Implement drag-and-drop positioning
  - [ ] 6.1 Implement drag behavior using pointer events in script.js
    - Add `pointerdown` handler on Page_Element to initiate drag (set pointer capture)
    - Add `pointermove` handler to update element position in real-time, clamping to container boundaries
    - Add `pointerup` handler to finalize position, release pointer capture, and call `ElementManager.updateElement(id, { position: {x, y} })`
    - Apply a visual indicator CSS class (e.g., `dragging`) during drag
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ]* 6.2 Write property test for position update persistence
    - **Property 4: Position Update Persistence**
    - Generate random valid elements and position coordinates, update position via `ElementManager.updateElement()`, reload from `ElementStore.load()`, assert stored position matches
    - **Validates: Requirements 2.1, 2.3, 4.1**

  - [ ] 6.3 Add drag styles to style.css
    - Style `.page-element.dragging` with visual feedback (opacity change, shadow, cursor)
    - _Requirements: 2.2_

- [ ] 7. Implement inline editing for element content
  - [ ] 7.1 Implement text element inline editing in script.js
    - On double-click of a text Page_Element, activate `contenteditable` on the content div
    - On blur or Enter key press, deactivate editing, read new content, call `ElementManager.updateElement(id, { content: newContent })`
    - _Requirements: 6.1, 6.2_

  - [ ] 7.2 Implement image element URL editing in script.js
    - On double-click of an image Page_Element, show a URL input field (overlay or inline)
    - On confirm (Enter or button), update the image `src` and call `ElementManager.updateElement(id, { content: newUrl })`
    - Handle broken image URLs by showing a placeholder with "Image not found" text
    - _Requirements: 6.3_

  - [ ]* 7.3 Write property test for content edit persistence
    - **Property 6: Content Edit Persistence**
    - Generate random text elements and new content strings, call `updateElement()` with new content, reload from store, assert content matches
    - **Validates: Requirements 6.2, 4.1**

- [ ] 8. Implement error handling and localStorage warnings
  - [ ] 8.1 Implement localStorage unavailable warning in script.js
    - On `ElementManager.init()`, check `ElementStore.isAvailable()`
    - If unavailable, display a non-blocking warning banner at the top of the page
    - On save failure (quota exceeded), display "Changes cannot be saved — storage is full" warning
    - _Requirements: 4.3_

  - [ ] 8.2 Add warning banner styles to style.css
    - Style the warning banner with attention-grabbing but non-intrusive design
    - _Requirements: 4.3_

- [ ] 9. Implement page load restoration
  - [ ] 9.1 Wire up page load initialization in script.js
    - On `DOMContentLoaded`, call `ElementToolbar.init()` and `ElementManager.init()`
    - `ElementManager.init()` reads from `ElementStore.load()`, then calls `restoreElements()` to recreate all saved elements with their positions, content, and styles
    - Handle corrupted data gracefully (discard and start empty)
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 10. Final checkpoint - All features integrated
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation uses vanilla JavaScript with no build tools, matching the existing project stack
- All code integrates into the three existing files: `script.js`, `style.css`, `index.html`
- `fast-check` library is used for property-based testing (can be loaded via CDN or npm for test environment)
- Test runner: Vitest or Jest recommended for running property tests

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "3.1", "3.2"] },
    { "id": 1, "tasks": ["1.2", "1.3", "2.1", "3.3"] },
    { "id": 2, "tasks": ["2.2", "2.3", "5.1", "5.3"] },
    { "id": 3, "tasks": ["5.2", "6.1", "6.3"] },
    { "id": 4, "tasks": ["6.2", "7.1", "7.2"] },
    { "id": 5, "tasks": ["7.3", "8.1", "8.2"] },
    { "id": 6, "tasks": ["9.1"] }
  ]
}
```
