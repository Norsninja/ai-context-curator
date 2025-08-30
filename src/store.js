/**
 * Data Store Module
 * Handles all data operations with event emission for UI updates
 */

class DataStore {
  constructor() {
    this.STORAGE_KEY = 'ai-context-curator';
    this.VERSION = '2.1';
    this.data = null;
    this.listeners = new Map();
    this.nextCellId = 1;
    
    this.load();
  }

  // Event system
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, ...args) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(...args));
    }
  }

  // Load data from localStorage
  load() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // Handle migration if needed
        if (!parsed.version || parsed.version !== this.VERSION) {
          this.data = this.migrate(parsed);
        } else {
          this.data = parsed;
        }
        
        // Calculate next cell ID
        this.calculateNextCellId();
      } else {
        this.initializeEmpty();
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      this.initializeEmpty();
    }
    
    return this.data;
  }

  // Save data to localStorage
  save() {
    try {
      // Update last modified for active project
      if (this.data.activeProject && this.data.projects[this.data.activeProject]) {
        this.data.projects[this.data.activeProject].lastModified = Date.now();
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
      this.emit('data:saved');
    } catch (error) {
      console.error('Failed to save data:', error);
      this.emit('data:save-error', error);
    }
  }

  // Initialize empty data structure
  initializeEmpty() {
    this.data = {
      version: this.VERSION,
      activeProject: 'my-first-project',
      projects: {
        'my-first-project': {
          name: 'My First Project',
          mainPrompt: '',
          cells: [],
          created: Date.now(),
          lastModified: Date.now()
        }
      }
    };
    this.save();
  }

  // Migrate old data formats
  migrate(oldData) {
    console.log('Migrating data to version', this.VERSION);
    
    const migrated = {
      version: this.VERSION,
      activeProject: oldData.activeProject || 'newsplanet',
      projects: {}
    };

    // Handle v1 format (direct workspace objects)
    if (oldData.newsplanet || Object.keys(oldData).some(key => 
      typeof oldData[key] === 'object' && 'cells' in oldData[key])) {
      
      Object.keys(oldData).forEach(key => {
        if (typeof oldData[key] === 'object' && oldData[key].cells !== undefined) {
          migrated.projects[key] = {
            name: key === 'newsplanet' ? 'NewsplanetAI' : key,
            mainPrompt: oldData[key].mainPrompt || '',
            cells: oldData[key].cells || [],
            created: Date.now(),
            lastModified: Date.now()
          };
        }
      });
    } 
    // Handle v2 format
    else if (oldData.projects) {
      migrated.projects = oldData.projects;
    }

    this.emit('data:migrated', migrated);
    return migrated;
  }

  // Calculate next cell ID
  calculateNextCellId() {
    Object.values(this.data.projects).forEach(project => {
      if (project.cells) {
        project.cells.forEach(cell => {
          if (cell.id >= this.nextCellId) {
            this.nextCellId = cell.id + 1;
          }
        });
      }
    });
  }

  // Get current project
  getCurrentProject() {
    return this.data.projects[this.data.activeProject] || null;
  }

  // Get all projects
  getProjects() {
    return this.data.projects;
  }

  // Create new project
  createProject(name) {
    const id = this.generateProjectId(name);
    
    if (this.data.projects[id]) {
      throw new Error('Project with similar name already exists');
    }

    this.data.projects[id] = {
      name: name.trim(),
      mainPrompt: '',
      cells: [],
      created: Date.now(),
      lastModified: Date.now()
    };

    this.data.activeProject = id;
    this.save();
    this.emit('project:created', id);
    this.emit('project:switched', id);
    
    return id;
  }

  // Switch project
  switchProject(projectId) {
    if (this.data.projects[projectId]) {
      this.data.activeProject = projectId;
      this.save();
      this.emit('project:switched', projectId);
    }
  }

  // Delete project
  deleteProject(projectId) {
    if (Object.keys(this.data.projects).length <= 1) {
      throw new Error('Cannot delete the last project');
    }

    delete this.data.projects[projectId];
    
    if (this.data.activeProject === projectId) {
      this.data.activeProject = Object.keys(this.data.projects)[0];
    }
    
    this.save();
    this.emit('project:deleted', projectId);
    this.emit('project:switched', this.data.activeProject);
  }

  // Update main prompt
  updateMainPrompt(content) {
    const project = this.getCurrentProject();
    if (!project) return;

    project.mainPrompt = content;
    this.save();
    this.emit('mainprompt:updated', this.data.activeProject);
  }

  // Add cell
  addCell() {
    const project = this.getCurrentProject();
    if (!project) return null;

    if (!project.cells) {
      project.cells = [];
    }

    const cell = {
      id: this.nextCellId++,
      title: `New Cell (${new Date().toLocaleDateString()})`,
      content: '',
      created: Date.now()
    };

    project.cells.push(cell);
    this.save();
    this.emit('cell:added', cell);
    
    return cell;
  }

  // Update cell
  updateCell(cellId, updates) {
    const project = this.getCurrentProject();
    if (!project) return;

    const cell = project.cells.find(c => c.id === cellId);
    if (!cell) return;

    Object.assign(cell, updates);
    this.save();
    this.emit('cell:updated', cellId, updates);
  }

  // Delete cell
  deleteCell(cellId) {
    const project = this.getCurrentProject();
    if (!project) return;

    const index = project.cells.findIndex(c => c.id === cellId);
    if (index === -1) return;

    project.cells.splice(index, 1);
    this.save();
    this.emit('cell:deleted', cellId);
  }

  // Move cell
  moveCell(cellId, direction) {
    const project = this.getCurrentProject();
    if (!project) return;

    const index = project.cells.findIndex(c => c.id === cellId);
    if (index === -1) return;

    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= project.cells.length) return;

    // Swap cells
    [project.cells[index], project.cells[newIndex]] = 
    [project.cells[newIndex], project.cells[index]];
    
    this.save();
    this.emit('cells:reordered', project.cells);
  }

  // Generate project ID from name
  generateProjectId(name) {
    return name.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
  }
}

// Export as singleton
window.dataStore = new DataStore();