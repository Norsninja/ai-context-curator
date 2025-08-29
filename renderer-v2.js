// Version 2.0 - Multi-project support
const APP_VERSION = '2.0';
const STORAGE_KEY = 'ai-context-curator';

// Global state
let appData = {
  version: APP_VERSION,
  activeProject: null,
  projects: {}
};

let nextCellId = 1;
let collapsedCells = new Set();
let mainPromptCollapsed = false;

// Initialize unique ID for projects
function generateProjectId(name) {
  // Keep the name as-is for the ID to preserve user's intent
  // Just ensure it's a valid key
  return name.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
}

// Migrate v1 data to v2 format
function migrateData(oldData) {
  console.log('Migrating v1 data to v2 format...');
  
  const migrated = {
    version: APP_VERSION,
    activeProject: 'newsplanet',
    projects: {}
  };
  
  // Check if this is v1 data (has newsplanet directly)
  if (oldData.newsplanet || Object.keys(oldData).some(key => 
    typeof oldData[key] === 'object' && 'cells' in oldData[key])) {
    
    // Migrate each old workspace to a project
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
    
    // If no projects were migrated, create a default one with the data
    if (Object.keys(migrated.projects).length === 0 && oldData.newsplanet) {
      migrated.projects.newsplanet = {
        name: 'NewsplanetAI',
        mainPrompt: oldData.newsplanet.mainPrompt || '',
        cells: oldData.newsplanet.cells || [],
        created: Date.now(),
        lastModified: Date.now()
      };
    }
  }
  
  return migrated;
}

// Load data from localStorage
function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      
      // Check if migration is needed
      if (!parsed.version || parsed.version !== APP_VERSION) {
        appData = migrateData(parsed);
        saveData(); // Save migrated data
        console.log('Data migrated successfully');
      } else {
        appData = parsed;
      }
      
      // Find the highest cell ID across all projects
      Object.values(appData.projects).forEach(project => {
        if (project.cells) {
          project.cells.forEach(cell => {
            if (cell.id >= nextCellId) {
              nextCellId = cell.id + 1;
            }
          });
        }
      });
      
      // Set active project if not set
      if (!appData.activeProject && Object.keys(appData.projects).length > 0) {
        appData.activeProject = Object.keys(appData.projects)[0];
      }
      
    } catch (e) {
      console.error('Error loading saved data:', e);
      initializeEmptyData();
    }
  } else {
    initializeEmptyData();
  }
}

// Initialize empty data structure
function initializeEmptyData() {
  appData = {
    version: APP_VERSION,
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
  saveData();
}

// Save data to localStorage
function saveData() {
  // Update last modified time for active project
  if (appData.activeProject && appData.projects[appData.activeProject]) {
    appData.projects[appData.activeProject].lastModified = Date.now();
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

// Get current project
function getCurrentProject() {
  return appData.projects[appData.activeProject] || null;
}

// Update project dropdown
function updateProjectDropdown() {
  const selector = document.getElementById('project-selector');
  selector.innerHTML = '';
  
  // Add existing projects
  Object.keys(appData.projects).forEach(projectId => {
    const project = appData.projects[projectId];
    const option = document.createElement('option');
    option.value = projectId;
    option.textContent = project.name;
    if (projectId === appData.activeProject) {
      option.selected = true;
    }
    selector.appendChild(option);
  });
  
  // Add separator and "New Project" option
  const separator = document.createElement('option');
  separator.disabled = true;
  separator.textContent = '──────────';
  selector.appendChild(separator);
  
  const newOption = document.createElement('option');
  newOption.value = '__new__';
  newOption.textContent = '+ New Project...';
  selector.appendChild(newOption);
}

// Switch project
function switchProject(projectId) {
  if (projectId === '__new__') {
    createNewProject();
    return;
  }
  
  if (appData.projects[projectId]) {
    saveData(); // Save current project state
    appData.activeProject = projectId;
    collapsedCells.clear(); // Reset collapsed state
    mainPromptCollapsed = false;
    renderCells();
    updateProjectDropdown();
  }
}

// Create new project
function createNewProject() {
  // Create an inline input in the dropdown area
  const selector = document.getElementById('project-selector');
  
  // Create temporary input
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Enter project name...';
  input.style.width = '100%';
  input.style.padding = '8px';
  input.style.fontSize = '14px';
  input.style.border = '1px solid #007bff';
  input.style.borderRadius = '4px';
  
  // Replace selector with input temporarily
  const parent = selector.parentNode;
  parent.replaceChild(input, selector);
  input.focus();
  
  const finishCreation = (save) => {
    const name = input.value.trim();
    
    if (save && name) {
      const projectId = generateProjectId(name);
      
      // Check if project already exists
      if (appData.projects[projectId]) {
        // Show error somehow
        parent.replaceChild(selector, input);
        updateProjectDropdown();
        // Could show a temporary message
        return;
      }
      
      // Create new project
      appData.projects[projectId] = {
        name: name,
        mainPrompt: '',
        cells: [],
        created: Date.now(),
        lastModified: Date.now()
      };
      
      // Switch to new project
      appData.activeProject = projectId;
      saveData();
      collapsedCells.clear();
      mainPromptCollapsed = false;
    }
    
    // Restore dropdown
    parent.replaceChild(selector, input);
    updateProjectDropdown();
    renderCells();
  };
  
  // Handle Enter and Escape
  input.onkeydown = (e) => {
    if (e.key === 'Enter') {
      finishCreation(true);
    } else if (e.key === 'Escape') {
      finishCreation(false);
    }
  };
  
  // Handle blur
  input.onblur = () => {
    finishCreation(true);
  };
}

// Delete project
function deleteProject() {
  const project = getCurrentProject();
  if (!project) return;
  
  const projectCount = Object.keys(appData.projects).length;
  if (projectCount <= 1) {
    // Can't delete last project - show temporary message
    const deleteBtn = event.target;
    const originalText = deleteBtn.textContent;
    deleteBtn.textContent = '❌';
    deleteBtn.title = "Can't delete the last project";
    setTimeout(() => {
      deleteBtn.textContent = originalText;
      deleteBtn.title = "Delete Current Project";
    }, 2000);
    return;
  }
  
  // Visual confirmation - change button to confirm state
  const deleteBtn = event.target;
  if (deleteBtn.dataset.confirming === 'true') {
    // Second click - actually delete
    delete appData.projects[appData.activeProject];
    
    // Switch to first available project
    appData.activeProject = Object.keys(appData.projects)[0];
    saveData();
    collapsedCells.clear();
    mainPromptCollapsed = false;
    renderCells();
    updateProjectDropdown();
  } else {
    // First click - ask for confirmation
    deleteBtn.dataset.confirming = 'true';
    deleteBtn.textContent = '❓';
    deleteBtn.style.background = '#dc3545';
    deleteBtn.style.color = 'white';
    deleteBtn.title = `Click again to delete "${project.name}"`;
    
    // Reset after 3 seconds
    setTimeout(() => {
      deleteBtn.dataset.confirming = 'false';
      deleteBtn.textContent = '🗑';
      deleteBtn.style.background = '';
      deleteBtn.style.color = '';
      deleteBtn.title = "Delete Current Project";
    }, 3000);
  }
}

// Create a cell element
function createCellElement(cell) {
  const cellDiv = document.createElement('div');
  cellDiv.className = 'cell';
  if (collapsedCells.has(cell.id)) {
    cellDiv.className += ' collapsed';
  }
  cellDiv.id = `cell-${cell.id}`;
  
  const isCollapsed = collapsedCells.has(cell.id);
  const preview = cell.content && cell.content.length > 50 
    ? cell.content.substring(0, 50) + '...' 
    : cell.content || 'Empty';
  
  // Create header
  const header = document.createElement('div');
  header.className = 'cell-header';
  
  const collapseBtn = document.createElement('button');
  collapseBtn.className = 'collapse-btn';
  collapseBtn.textContent = isCollapsed ? '▶' : '▼';
  collapseBtn.onclick = () => toggleCollapse(cell.id);
  
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'cell-checkbox';
  checkbox.dataset.cellId = cell.id;
  
  const titleSpan = document.createElement('span');
  titleSpan.className = 'cell-title';
  titleSpan.textContent = cell.title || 'Untitled Cell';
  titleSpan.onclick = () => editCellTitle(cell.id);
  
  header.appendChild(collapseBtn);
  header.appendChild(checkbox);
  header.appendChild(titleSpan);
  
  if (isCollapsed && cell.content) {
    const previewSpan = document.createElement('span');
    previewSpan.className = 'cell-preview';
    previewSpan.textContent = ' - ' + preview;
    header.appendChild(previewSpan);
  }
  
  // Create body
  const body = document.createElement('div');
  body.className = 'cell-body';
  if (isCollapsed) {
    body.style.display = 'none';
  }
  
  const content = document.createElement('div');
  content.className = 'cell-content';
  
  const contentDisplay = document.createElement('div');
  contentDisplay.className = 'cell-content-display';
  contentDisplay.textContent = cell.content || 'Click to add content...';
  contentDisplay.onclick = () => editCellContent(cell.id);
  
  content.appendChild(contentDisplay);
  
  // Create actions
  const actions = document.createElement('div');
  actions.className = 'cell-actions';
  
  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit';
  editBtn.onclick = () => editCellContent(cell.id);
  
  const upBtn = document.createElement('button');
  upBtn.textContent = '↑';
  upBtn.onclick = () => moveCell(cell.id, -1);
  
  const downBtn = document.createElement('button');
  downBtn.textContent = '↓';
  downBtn.onclick = () => moveCell(cell.id, 1);
  
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '🗑';
  deleteBtn.onclick = () => deleteCell(cell.id);
  
  actions.appendChild(editBtn);
  actions.appendChild(upBtn);
  actions.appendChild(downBtn);
  actions.appendChild(deleteBtn);
  
  body.appendChild(content);
  body.appendChild(actions);
  
  cellDiv.appendChild(header);
  cellDiv.appendChild(body);
  
  return cellDiv;
}

// Render all cells
function renderCells() {
  const cellsList = document.getElementById('cells-list');
  const project = getCurrentProject();
  
  if (!project) {
    cellsList.innerHTML = '<div style="padding: 20px; text-align: center;">No project selected</div>';
    return;
  }
  
  // Update main prompt
  const mainPromptContent = document.getElementById('main-prompt-content');
  if (mainPromptContent) {
    // Only update if not currently editing
    if (!mainPromptContent.querySelector('textarea')) {
      mainPromptContent.textContent = project.mainPrompt || 'Click to set main prompt...';
    }
  }
  
  // Update main prompt preview and collapse state
  const mainPromptPreview = document.getElementById('main-prompt-preview');
  const mainPromptBody = document.getElementById('main-prompt-body');
  const mainPromptBtn = document.querySelector('#main-prompt-cell .collapse-btn');
  
  if (mainPromptCollapsed) {
    const preview = project.mainPrompt ? 
      (project.mainPrompt.length > 50 ? project.mainPrompt.substring(0, 50) + '...' : project.mainPrompt) : 
      'Not set';
    mainPromptPreview.textContent = ' - ' + preview;
    mainPromptPreview.style.display = 'inline';
    mainPromptBody.style.display = 'none';
    mainPromptBtn.textContent = '▶';
    document.getElementById('main-prompt-cell').classList.add('collapsed');
  } else {
    mainPromptPreview.style.display = 'none';
    mainPromptBody.style.display = 'block';
    mainPromptBtn.textContent = '▼';
    document.getElementById('main-prompt-cell').classList.remove('collapsed');
  }
  
  // Clear and render cells
  cellsList.innerHTML = '';
  
  if (project.cells && project.cells.length > 0) {
    project.cells.forEach(cell => {
      const cellElement = createCellElement(cell);
      cellsList.appendChild(cellElement);
    });
  }
}

// Edit cell title with inline editing
function editCellTitle(cellId) {
  const project = getCurrentProject();
  if (!project) return;
  
  const cell = project.cells.find(c => c.id === cellId);
  if (!cell) return;
  
  const cellDiv = document.getElementById(`cell-${cellId}`);
  const titleSpan = cellDiv.querySelector('.cell-title');
  
  const input = document.createElement('input');
  input.type = 'text';
  input.value = cell.title || '';
  input.className = 'cell-title-input';
  input.style.flex = '1';
  
  input.onblur = () => {
    cell.title = input.value || 'Untitled Cell';
    saveData();
    renderCells();
  };
  
  input.onkeypress = (e) => {
    if (e.key === 'Enter') {
      cell.title = input.value || 'Untitled Cell';
      saveData();
      renderCells();
    }
    if (e.key === 'Escape') {
      renderCells();
    }
  };
  
  titleSpan.replaceWith(input);
  input.focus();
  input.select();
}

// Edit cell content with inline editing
function editCellContent(cellId) {
  const project = getCurrentProject();
  if (!project) return;
  
  const cell = project.cells.find(c => c.id === cellId);
  if (!cell) return;
  
  const cellDiv = document.getElementById(`cell-${cellId}`);
  const contentDiv = cellDiv.querySelector('.cell-content');
  
  const textarea = document.createElement('textarea');
  textarea.value = cell.content || '';
  textarea.style.width = '100%';
  textarea.style.minHeight = '100px';
  textarea.style.padding = '8px';
  textarea.style.border = '1px solid #007bff';
  textarea.style.borderRadius = '3px';
  textarea.style.fontFamily = 'inherit';
  textarea.style.fontSize = 'inherit';
  
  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.style.marginTop = '5px';
  saveBtn.style.marginRight = '5px';
  saveBtn.onclick = () => {
    cell.content = textarea.value;
    saveData();
    renderCells();
  };
  
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.style.marginTop = '5px';
  cancelBtn.onclick = () => {
    renderCells();
  };
  
  const buttonDiv = document.createElement('div');
  buttonDiv.appendChild(saveBtn);
  buttonDiv.appendChild(cancelBtn);
  
  contentDiv.innerHTML = '';
  contentDiv.appendChild(textarea);
  contentDiv.appendChild(buttonDiv);
  
  textarea.focus();
  textarea.select();
}

// Add new cell
function addCell() {
  const project = getCurrentProject();
  if (!project) return;
  
  if (!project.cells) {
    project.cells = [];
  }
  
  const newCell = {
    id: nextCellId++,
    title: `New Cell (${new Date().toLocaleDateString()})`,
    content: '',
    order: project.cells.length
  };
  
  project.cells.push(newCell);
  saveData();
  renderCells();
  
  // Auto-edit the new cell content
  setTimeout(() => editCellContent(newCell.id), 100);
}

// Delete cell
function deleteCell(cellId) {
  const deleteBtn = event.target;
  
  // Visual confirmation instead of dialog
  if (deleteBtn.dataset.confirming === 'true') {
    // Second click - actually delete
    const project = getCurrentProject();
    if (!project) return;
    
    project.cells = project.cells.filter(c => c.id !== cellId);
    
    saveData();
    renderCells();
  } else {
    // First click - ask for confirmation
    deleteBtn.dataset.confirming = 'true';
    const originalText = deleteBtn.textContent;
    deleteBtn.textContent = '❓';
    deleteBtn.style.background = '#dc3545';
    deleteBtn.style.color = 'white';
    
    // Reset after 2 seconds
    setTimeout(() => {
      deleteBtn.dataset.confirming = 'false';
      deleteBtn.textContent = originalText;
      deleteBtn.style.background = '';
      deleteBtn.style.color = '';
    }, 2000);
  }
}

// Move cell up or down
function moveCell(cellId, direction) {
  const project = getCurrentProject();
  if (!project) return;
  
  const index = project.cells.findIndex(c => c.id === cellId);
  
  if (index === -1) return;
  
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= project.cells.length) return;
  
  // Swap cells
  [project.cells[index], project.cells[newIndex]] = 
  [project.cells[newIndex], project.cells[index]];
  
  saveData();
  renderCells();
}

// Edit main prompt - inline editing
function startEditingMainPrompt() {
  const mainPromptContent = document.getElementById('main-prompt-content');
  const project = getCurrentProject();
  if (!project) return;
  
  const textarea = document.createElement('textarea');
  textarea.id = 'main-prompt-edit';
  textarea.style.width = '100%';
  textarea.style.minHeight = '100px';
  textarea.value = project.mainPrompt || '';
  
  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.style.marginTop = '5px';
  saveBtn.style.marginRight = '5px';
  saveBtn.onclick = () => saveMainPrompt();
  
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.style.marginTop = '5px';
  cancelBtn.onclick = () => cancelMainPrompt();
  
  const buttonDiv = document.createElement('div');
  buttonDiv.appendChild(saveBtn);
  buttonDiv.appendChild(cancelBtn);
  
  mainPromptContent.innerHTML = '';
  mainPromptContent.appendChild(textarea);
  mainPromptContent.appendChild(buttonDiv);
  
  textarea.focus();
}

// Save main prompt
function saveMainPrompt() {
  const project = getCurrentProject();
  if (!project) return;
  
  const textarea = document.getElementById('main-prompt-edit');
  project.mainPrompt = textarea.value;
  saveData();
  renderCells();
}

// Cancel main prompt editing
function cancelMainPrompt() {
  renderCells();
}

// Toggle collapse state of a cell
function toggleCollapse(cellId) {
  if (collapsedCells.has(cellId)) {
    collapsedCells.delete(cellId);
  } else {
    collapsedCells.add(cellId);
  }
  renderCells();
}

// Toggle main prompt collapse
function toggleMainPrompt() {
  mainPromptCollapsed = !mainPromptCollapsed;
  renderCells();
}

// Collapse all cells
function collapseAll() {
  const project = getCurrentProject();
  if (project && project.cells) {
    project.cells.forEach(cell => {
      collapsedCells.add(cell.id);
    });
  }
  mainPromptCollapsed = true;
  renderCells();
}

// Expand all cells
function expandAll() {
  collapsedCells.clear();
  mainPromptCollapsed = false;
  renderCells();
}

// Copy selected cells to clipboard
function copySelected() {
  const project = getCurrentProject();
  if (!project) return;
  
  const mainCheckbox = document.getElementById('main-checkbox');
  const cellCheckboxes = document.querySelectorAll('.cell-checkbox:checked');
  
  let combined = '';
  
  // Include main prompt if checked
  if (mainCheckbox && mainCheckbox.checked && project.mainPrompt) {
    combined = project.mainPrompt;
  }
  
  // Add selected cells
  cellCheckboxes.forEach(checkbox => {
    const cellId = parseInt(checkbox.dataset.cellId);
    const cell = project.cells.find(c => c.id === cellId);
    if (cell) {
      if (combined) {
        combined += `\n\n--- ${cell.title} ---\n`;
      } else {
        combined = `--- ${cell.title} ---\n`;
      }
      combined += cell.content;
    }
  });
  
  if (combined) {
    // Try multiple methods to copy to clipboard
    let copied = false;
    
    // Method 1: Try Electron API
    if (window.electronAPI && window.electronAPI.copyToClipboard) {
      try {
        window.electronAPI.copyToClipboard(combined);
        copied = true;
      } catch (e) {
        console.error('Electron API failed:', e);
      }
    }
    
    // Method 2: Try navigator.clipboard if not copied yet
    if (!copied && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        navigator.clipboard.writeText(combined);
        copied = true;
      } catch (e) {
        console.error('Navigator clipboard failed:', e);
      }
    }
    
    // Method 3: Fallback to textarea method
    if (!copied) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = combined;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        copied = true;
      } catch (e) {
        console.error('Textarea method failed:', e);
        alert('Failed to copy to clipboard. Please try selecting the text manually.');
      }
    }
    
    // Visual feedback
    const copyBtn = document.getElementById('copy-btn');
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '✓ Copied!';
    copyBtn.style.background = '#28a745';
    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.style.background = '';
    }, 2000);
  } else {
    alert('Please select at least one item to copy');
  }
}

// Clear selection
function clearSelection() {
  // Clear main prompt checkbox
  const mainCheckbox = document.getElementById('main-checkbox');
  if (mainCheckbox) {
    mainCheckbox.checked = false;
  }
  
  // Clear all cell checkboxes
  document.querySelectorAll('.cell-checkbox').forEach(checkbox => {
    checkbox.checked = false;
  });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  updateProjectDropdown();
  renderCells();
  
  // Event listeners
  document.getElementById('add-cell-btn').addEventListener('click', addCell);
  document.getElementById('copy-btn').addEventListener('click', copySelected);
  document.getElementById('clear-btn').addEventListener('click', clearSelection);
  
  // Project selector change
  document.getElementById('project-selector').addEventListener('change', (e) => {
    switchProject(e.target.value);
  });
  
  // Click main prompt to edit
  document.getElementById('main-prompt-content').addEventListener('click', function(e) {
    if (!e.target.closest('button') && !e.target.closest('textarea')) {
      startEditingMainPrompt();
    }
  });
});

// Make functions globally available for onclick handlers
window.moveCell = moveCell;
window.deleteCell = deleteCell;
window.saveMainPrompt = saveMainPrompt;
window.cancelMainPrompt = cancelMainPrompt;
window.toggleCollapse = toggleCollapse;
window.toggleMainPrompt = toggleMainPrompt;
window.collapseAll = collapseAll;
window.expandAll = expandAll;
window.editCellTitle = editCellTitle;
window.editCellContent = editCellContent;
window.deleteProject = deleteProject;