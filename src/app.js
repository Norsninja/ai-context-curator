/**
 * Main Application Controller
 * Initializes and coordinates all modules
 */

class App {
  constructor() {
    this.store = window.dataStore;
    this.ui = null;
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    console.log('AI Context Curator v3 - Initializing...');
    
    // Initialize UI renderer
    this.ui = new UIRenderer(this.store);
    
    // Initial render
    this.ui.renderProject();
    
    // Log stats
    this.logStats();
    
    console.log('AI Context Curator v3 - Ready!');
  }

  logStats() {
    const projects = Object.keys(this.store.getProjects()).length;
    const currentProject = this.store.getCurrentProject();
    const cells = currentProject ? currentProject.cells.length : 0;
    
    console.log(`Loaded ${projects} project(s), current project has ${cells} cell(s)`);
  }
}

// Initialize app
const app = new App();

// Expose for debugging
window.app = app;