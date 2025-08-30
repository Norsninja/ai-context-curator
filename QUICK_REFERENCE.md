# AI Context Curator - Quick Reference

## Commands Cheat Sheet

```bash
# Development
npm start                 # Run app in dev mode
npm run dist             # Build for current platform
npm run build-only       # Build without publishing (CI/CD)

# Platform-specific builds
npm run dist-win         # Windows .exe
npm run dist-mac         # macOS .dmg
npm run dist-linux       # Linux .AppImage

# Git release workflow
git tag v3.0.4 -m "Description"
git push origin v3.0.4   # Triggers GitHub Actions
```

## Key Files & Line Numbers

```javascript
// Main entry points
main.js:22-44           // App initialization & window creation
src/app.js:10-25        // Wire up store and UI

// Data operations
src/store.js:151-172    // createProject()
src/store.js:211-221    // addCell()
src/store.js:234-244    // updateCell()
src/store.js:59-67      // save() to localStorage

// UI operations  
src/ui.js:278-309       // editMainPrompt()
src/ui.js:487-520       // editCellContent()
src/ui.js:534-560       // copySelected()
src/ui.js:225-241       // updateMainPrompt()

// Event bindings
src/ui.js:42-51         // Store event listeners
src/ui.js:54-115        // DOM event listeners

// Utilities
src/utils.js:4-13       // createPreview()
src/utils.js:13-36      // showNotification()
```

## Data Access in Console

```javascript
// Check current data
localStorage.getItem('ai-context-curator')
JSON.parse(localStorage.getItem('ai-context-curator'))

// Access live objects
window.dataStore.data               // All data
window.dataStore.data.projects      // All projects
window.dataStore.getCurrentProject() // Active project

// UI state
window.ui.state.collapsedCells     // Set of collapsed cell IDs
window.ui.state.mainPromptCollapsed // Boolean
```

## Common Fixes

| Issue | Solution | File:Line |
|-------|----------|-----------|
| Save button stays visible | Add display restore after save | ui.js:500-510 |
| Project creation "fails" | Remove duplicate updateProjectSelector() | ui.js:178 |
| Notification not showing | Check utils.js loaded, CSS exists | style.css:458-494 |
| Data not saving | Check localStorage quota, clear cache | store.js:59-67 |
| Cell not updating | Check event listener binding | ui.js:47-48 |

## Event Flow Diagram

```
User Action → UI Handler → Store Method → Event Emit → UI Update
     ↓            ↓             ↓             ↓           ↓
Click Save → editCell() → updateCell() → 'cell:updated' → updateCellElement()
```

## localStorage Structure

```json
{
  "version": "2.1",
  "projects": {
    "project-id": {
      "name": "Name",
      "mainPrompt": "...",
      "cells": [{
        "id": 1,
        "title": "Title",
        "content": "..."
      }]
    }
  },
  "activeProject": "project-id"
}
```

## CSS Classes for States

```css
.collapsed          /* Cell/prompt is collapsed */
.editing           /* Cell is being edited */
.confirming        /* Delete button confirming */
.notification      /* Base notification class */
.notification-success/error/info  /* Notification types */
```

## Quick Debugging

```javascript
// Add temporary logging
store.emit = function(event, ...args) {
  console.log('📡 Event:', event, args);
  // original emit code
}

// Watch for changes
Object.observe(window.dataStore.data, console.log)

// Check what's selected
document.querySelectorAll('.cell-checkbox:checked')
```

## Build Issues

| Platform | Common Issue | Fix |
|----------|-------------|-----|
| WSL | Need Wine for Windows builds | `sudo apt install wine wine32` |
| Mac | Code signing required | Use `--mac.identity=null` for unsigned |
| Windows | Antivirus blocks exe | Add exception for dist folder |
| GitHub Actions | 403 Forbidden | Check workflow permissions |

---

*Keep this file open while developing - it's your cheat sheet!*