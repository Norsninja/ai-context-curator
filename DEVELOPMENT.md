# AI Context Curator - Development Documentation

## Architecture Overview

The app follows a modular architecture with clear separation of concerns:

```
┌─────────────┐     ┌──────────┐     ┌─────────┐
│   main.js   │────▶│  Electron │────▶│ Window  │
│ (Main Process)     │  Window   │     │ (Renderer)
└─────────────┘     └──────────┘     └─────────┘
                                            │
                    ┌───────────────────────┴──────────────┐
                    │                                       │
              ┌─────▼─────┐  ┌──────────┐  ┌──────────┐  ┌─▼────────┐
              │   app.js   │──│ store.js │──│  ui.js   │──│ utils.js │
              │(Initialize)│  │  (Data)  │  │  (UI)    │  │(Helpers) │
              └───────────┘  └──────────┘  └──────────┘  └──────────┘
```

## Core Modules

### 1. main.js (Electron Main Process)
- Creates the Electron window
- Handles app lifecycle
- Optional: Loads default-data.json on first run
- Path: `/main.js`

### 2. app.js (Application Controller)
- Entry point for renderer process
- Initializes DataStore and UIRenderer
- Connects store events to UI updates
- Path: `/src/app.js`

### 3. store.js (Data Layer)
```javascript
Key responsibilities:
- Data persistence via localStorage
- Event emission for state changes
- Project/cell CRUD operations

Key methods:
- createProject(name) - Creates new project
- deleteProject(projectId) - Removes project
- addCell() - Adds cell to current project
- updateCell(cellId, updates) - Updates cell data
- save() - Persists to localStorage
- load() - Retrieves from localStorage

Events emitted:
- 'project:created'
- 'project:deleted'
- 'project:switched'
- 'cell:added'
- 'cell:updated'
- 'cell:deleted'
```

### 4. ui.js (UI Layer)
```javascript
Key responsibilities:
- DOM manipulation
- User interaction handling
- Reactive updates from store events

Key methods:
- renderProject() - Renders entire project
- updateMainPrompt() - Updates main prompt display
- editMainPrompt() - Shows edit interface
- addCellElement(cell) - Adds cell to DOM
- updateCellElement(cellId, updates) - Updates cell in DOM
- editCellContent(cellId) - Shows cell edit interface
- copySelected() - Copies selected cells to clipboard

State management:
- this.state.collapsedCells - Set of collapsed cell IDs
- this.state.mainPromptCollapsed - Boolean for main prompt
```

### 5. utils.js (Utility Functions)
```javascript
- createPreview(text) - Truncates text to 50 chars
- showNotification(message, type) - Shows temporary notification
```

## Data Structure

### localStorage Schema
```javascript
{
  "version": "2.1",
  "projects": {
    "project-id": {
      "name": "Project Name",
      "mainPrompt": "Your standard greeting...",
      "cells": [
        {
          "id": 1,
          "title": "Cell Title",
          "content": "Cell content..."
        }
      ],
      "created": 1234567890,
      "lastModified": 1234567890
    }
  },
  "activeProject": "project-id"
}
```

## Event Flow

### Creating a New Project
1. User selects "New Project..." from dropdown
2. UI calls `showNewProjectInput()`
3. User enters name and presses Enter
4. UI calls `store.createProject(name)`
5. Store creates project, emits 'project:created' and 'project:switched'
6. UI listeners trigger `updateProjectSelector()` and `renderProject()`

### Editing Cell Content
1. User clicks on cell content
2. UI calls `editCellContent(cellId)`
3. UI replaces content div with textarea and buttons
4. User clicks Save
5. UI calls `store.updateCell(cellId, {content})`
6. Store updates data, emits 'cell:updated'
7. UI immediately restores display (doesn't wait for event)
8. Notification shows "Cell content saved"

### Copying to Clipboard
1. User selects cells via checkboxes
2. User clicks "Copy Selected"
3. UI builds text with main prompt + selected cells
4. Uses Electron clipboard API via preload script
5. Shows notification "Copied to clipboard"

## Development Setup

### Prerequisites
```bash
# Node.js 18+ required
node --version

# Install dependencies
npm install

# Install electron-builder for builds
npm install --save-dev electron-builder
```

### Running in Development
```bash
# Start Electron app
npm start

# The app hot-reloads on save for:
# - index.html
# - style.css
# - src/*.js files
```

### Building Executables
```bash
# Build for current platform
npm run dist

# Build without publishing (for CI/CD)
npm run build-only

# Platform-specific builds
npm run dist-win    # Windows
npm run dist-mac    # macOS
npm run dist-linux  # Linux
```

## Common Development Tasks

### Adding a New Feature to Cells
1. Add UI element in `ui.js` → `addCellElement()`
2. Handle interaction in `ui.js` (add event listener)
3. Update data in `store.js` (add to cell object)
4. Emit event from store
5. Handle event in UI if needed

### Adding a New Project Property
1. Update `store.js` → `createProject()` to include property
2. Add UI in `index.html` if needed
3. Add render logic in `ui.js`
4. Handle persistence automatically via save()

### Modifying the Save Format
1. Update `store.js` → `save()` and `load()` methods
2. Add migration logic in `load()` for backward compatibility
3. Update VERSION constant if breaking change

### Adding Keyboard Shortcuts
1. Add listener in `ui.js` → `bindEvents()`
2. Check if element is being edited before executing
3. Example:
```javascript
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault();
    this.saveCurrentEdit();
  }
});
```

## Debugging Tips

### Check Data State
```javascript
// In console:
localStorage.getItem('ai-context-curator')
window.dataStore.data  // Current data
window.ui.state        // UI state
```

### Monitor Events
```javascript
// Add to store.js temporarily:
emit(event, ...args) {
  console.log('Event:', event, args);
  // ... rest of emit
}
```

### Common Issues

1. **Save button not disappearing**: Check if `updateCellElement()` is properly restoring display div

2. **Project creation "fails"**: Usually duplicate `updateProjectSelector()` calls

3. **Data not persisting**: Check localStorage quota, clear old data

4. **Notifications not showing**: Check if utils.js is loaded, CSS for .notification class exists

## File Structure
```
context-manager/
├── main.js                 # Electron main process
├── preload.js             # Preload script for clipboard
├── index.html             # Main window HTML
├── style.css              # All styles
├── src/
│   ├── app.js            # Application initialization
│   ├── store.js          # Data management
│   ├── ui.js             # UI management
│   └── utils.js          # Utility functions
├── images/               # Screenshots for README
├── dist/                 # Built executables (git ignored)
└── .github/workflows/    # CI/CD automation
```

## Key Design Decisions

1. **localStorage over files**: Simpler, works in renderer process, Electron handles persistence

2. **Event-driven updates**: Store emits events, UI reacts - keeps separation clean

3. **No framework**: Vanilla JS keeps it lightweight and simple to modify

4. **Immediate UI updates**: Some operations update UI immediately rather than waiting for events (better UX)

5. **Single source of truth**: DataStore owns all data, UI is purely presentational

## Testing Approach

### Manual Testing Checklist
- [ ] Create/delete projects
- [ ] Edit main prompt (save/cancel)
- [ ] Add/edit/delete cells
- [ ] Copy with various selections
- [ ] Collapse/expand all
- [ ] Project switching preserves data
- [ ] Notifications appear and auto-hide
- [ ] Data persists after app restart

### Future Enhancements Ideas
- Export/import JSON files
- Markdown rendering in cells
- Drag-and-drop cell reordering
- Search across all projects
- Backup/restore functionality
- Themes/dark mode
- Cell templates

## Contributing Guidelines

1. Keep it simple - this is a lightweight tool
2. Test thoroughly - data loss is unacceptable  
3. Maintain separation - store handles data, UI handles display
4. Comment complex logic - future you will thank you
5. Update this doc - if you add features, document them

---

*Last updated: August 2025 - v3.0.3*