/**
 * UI Renderer Module
 * Handles all UI updates with differential rendering
 */

class UIRenderer {
  constructor(store) {
    this.store = store;
    this.elements = {};
    this.state = {
      collapsedCells: new Set(),
      mainPromptCollapsed: false,
      editingCells: new Set(),
      confirmingDelete: new Set()
    };
    
    this.cacheElements();
    this.attachEventListeners();
    this.bindStoreEvents();
  }

  // Cache DOM elements for performance
  cacheElements() {
    this.elements = {
      projectSelector: document.getElementById('project-selector'),
      deleteProjectBtn: document.getElementById('delete-project-btn'),
      mainPromptCell: document.getElementById('main-prompt-cell'),
      mainPromptContent: document.getElementById('main-prompt-content'),
      mainPromptPreview: document.getElementById('main-prompt-preview'),
      mainPromptBody: document.getElementById('main-prompt-body'),
      mainPromptCheckbox: document.getElementById('main-checkbox'),
      cellsList: document.getElementById('cells-list'),
      addCellBtn: document.getElementById('add-cell-btn'),
      copyBtn: document.getElementById('copy-btn'),
      clearBtn: document.getElementById('clear-btn'),
      expandAllBtn: document.getElementById('expand-all-btn'),
      collapseAllBtn: document.getElementById('collapse-all-btn')
    };
  }

  // Bind store events for reactive updates
  bindStoreEvents() {
    this.store.on('project:created', () => this.updateProjectSelector());
    this.store.on('project:deleted', () => this.updateProjectSelector());
    this.store.on('project:switched', () => this.renderProject());
    this.store.on('mainprompt:updated', () => this.updateMainPrompt());
    this.store.on('cell:added', (cell) => this.addCellElement(cell));
    this.store.on('cell:updated', (id, updates) => this.updateCellElement(id, updates));
    this.store.on('cell:deleted', (id) => this.removeCellElement(id));
    this.store.on('cells:reordered', () => this.reorderCells());
  }

  // Attach event listeners using delegation
  attachEventListeners() {
    // Project selector
    this.elements.projectSelector?.addEventListener('change', (e) => {
      const value = e.target.value;
      if (value === '__new__') {
        this.showNewProjectInput();
      } else {
        this.store.switchProject(value);
      }
    });

    // Delete project button
    this.elements.deleteProjectBtn?.addEventListener('click', () => {
      this.handleDeleteProject();
    });

    // Main prompt editing
    this.elements.mainPromptContent?.addEventListener('click', (e) => {
      if (!e.target.closest('button') && !e.target.closest('textarea')) {
        this.editMainPrompt();
      }
    });

    // Cells list - event delegation for all cell events
    this.elements.cellsList?.addEventListener('click', (e) => {
      const cell = e.target.closest('.cell');
      if (!cell) return;
      
      const cellId = parseInt(cell.dataset.cellId);
      
      // Handle different click targets
      if (e.target.classList.contains('collapse-btn')) {
        this.toggleCellCollapse(cellId);
      } else if (e.target.classList.contains('cell-title')) {
        this.editCellTitle(cellId);
      } else if (e.target.classList.contains('cell-content-display')) {
        this.editCellContent(cellId);
      } else if (e.target.classList.contains('edit-btn')) {
        this.editCellContent(cellId);
      } else if (e.target.classList.contains('delete-btn')) {
        this.handleDeleteCell(cellId, e.target);
      } else if (e.target.classList.contains('move-up-btn')) {
        this.store.moveCell(cellId, -1);
      } else if (e.target.classList.contains('move-down-btn')) {
        this.store.moveCell(cellId, 1);
      }
    });

    // Control buttons
    this.elements.addCellBtn?.addEventListener('click', () => {
      const cell = this.store.addCell();
      if (cell) {
        window.utils.showNotification('New cell added', 'success');
        setTimeout(() => this.editCellContent(cell.id), 100);
      }
    });

    this.elements.copyBtn?.addEventListener('click', () => this.copySelected());
    this.elements.clearBtn?.addEventListener('click', () => this.clearSelection());
    this.elements.expandAllBtn?.addEventListener('click', () => this.expandAll());
    this.elements.collapseAllBtn?.addEventListener('click', () => this.collapseAll());

    // Main prompt collapse button
    document.querySelector('#main-prompt-cell .collapse-btn')?.addEventListener('click', () => {
      this.toggleMainPromptCollapse();
    });
  }

  // Update project selector dropdown
  updateProjectSelector() {
    const selector = this.elements.projectSelector;
    if (!selector) return;

    const currentValue = this.store.data.activeProject;
    selector.innerHTML = '';

    // Add projects
    Object.entries(this.store.getProjects()).forEach(([id, project]) => {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = project.name;
      selector.appendChild(option);
    });

    // Add separator and new project option
    const separator = document.createElement('option');
    separator.disabled = true;
    separator.textContent = '──────────';
    selector.appendChild(separator);

    const newOption = document.createElement('option');
    newOption.value = '__new__';
    newOption.textContent = '+ New Project...';
    selector.appendChild(newOption);

    selector.value = currentValue;
  }

  // Show new project input
  showNewProjectInput() {
    const selector = this.elements.projectSelector;
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter project name...';
    input.className = 'project-name-input';
    
    const parent = selector.parentNode;
    parent.replaceChild(input, selector);
    input.focus();

    const finishCreation = (save) => {
      const name = input.value.trim();
      
      if (save && name) {
        try {
          this.store.createProject(name);
          window.utils.showNotification(`Project '${name}' created`, 'success');
        } catch (error) {
          console.error('Failed to create project:', error);
          window.utils.showNotification('Failed to create project', 'error');
        }
      }
      
      parent.replaceChild(selector, input);
      // Don't call updateProjectSelector here - it's already called by the event listener
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') finishCreation(true);
      else if (e.key === 'Escape') finishCreation(false);
    });

    input.addEventListener('blur', () => finishCreation(true));
  }

  // Handle delete project
  handleDeleteProject() {
    const btn = this.elements.deleteProjectBtn;
    const project = this.store.getCurrentProject();
    
    if (!project) return;

    if (Object.keys(this.store.getProjects()).length <= 1) {
      this.showMessage(btn, '❌', 2000);
      return;
    }

    if (btn.dataset.confirming === 'true') {
      try {
        this.store.deleteProject(this.store.data.activeProject);
        window.utils.showNotification('Project deleted', 'info');
      } catch (error) {
        console.error('Failed to delete project:', error);
        window.utils.showNotification('Failed to delete project', 'error');
      }
    } else {
      btn.dataset.confirming = 'true';
      btn.textContent = '❓';
      btn.classList.add('confirming');
      
      setTimeout(() => {
        btn.dataset.confirming = 'false';
        btn.textContent = '🗑';
        btn.classList.remove('confirming');
      }, 3000);
    }
  }

  // Render entire project
  renderProject() {
    this.updateProjectSelector();
    this.updateMainPrompt();
    this.renderCells();
  }

  // Update main prompt display
  updateMainPrompt() {
    const project = this.store.getCurrentProject();
    if (!project) return;

    const content = this.elements.mainPromptContent;
    if (content) {
      // Always update the display, removing any edit interface
      content.innerHTML = '';
      const displayDiv = document.createElement('div');
      displayDiv.className = 'main-prompt-display';
      displayDiv.style.whiteSpace = 'pre-wrap';
      displayDiv.textContent = project.mainPrompt || 'Click to set main prompt...';
      content.appendChild(displayDiv);
    }

    this.updateMainPromptCollapse();
  }

  // Toggle main prompt collapse
  toggleMainPromptCollapse() {
    this.state.mainPromptCollapsed = !this.state.mainPromptCollapsed;
    this.updateMainPromptCollapse();
  }

  // Update main prompt collapse state
  updateMainPromptCollapse() {
    const project = this.store.getCurrentProject();
    if (!project) return;

    const isCollapsed = this.state.mainPromptCollapsed;
    const btn = document.querySelector('#main-prompt-cell .collapse-btn');
    
    if (btn) btn.textContent = isCollapsed ? '▶' : '▼';
    
    if (isCollapsed) {
      const preview = project.mainPrompt ? 
        window.utils.createPreview(project.mainPrompt) : 
        'Not set';
      
      this.elements.mainPromptPreview.textContent = ' - ' + preview;
      this.elements.mainPromptPreview.style.display = 'inline';
      this.elements.mainPromptBody.style.display = 'none';
      this.elements.mainPromptCell.classList.add('collapsed');
    } else {
      this.elements.mainPromptPreview.style.display = 'none';
      this.elements.mainPromptBody.style.display = 'block';
      this.elements.mainPromptCell.classList.remove('collapsed');
    }
  }

  // Edit main prompt
  editMainPrompt() {
    const project = this.store.getCurrentProject();
    if (!project) return;

    const content = this.elements.mainPromptContent;
    const textarea = document.createElement('textarea');
    textarea.className = 'main-prompt-edit';
    textarea.value = project.mainPrompt || '';

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.className = 'save-btn';
    saveBtn.onclick = () => {
      this.store.updateMainPrompt(textarea.value);
      this.updateMainPrompt();  // This already restores the display
      window.utils.showNotification('Main prompt saved', 'success');
    };

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'cancel-btn';
    cancelBtn.onclick = () => this.updateMainPrompt();

    const buttonDiv = document.createElement('div');
    buttonDiv.className = 'edit-buttons';
    buttonDiv.appendChild(saveBtn);
    buttonDiv.appendChild(cancelBtn);

    content.innerHTML = '';
    content.appendChild(textarea);
    content.appendChild(buttonDiv);
    textarea.focus();
  }

  // Render all cells
  renderCells() {
    const project = this.store.getCurrentProject();
    if (!project) return;

    this.elements.cellsList.innerHTML = '';
    
    if (project.cells && project.cells.length > 0) {
      project.cells.forEach(cell => this.addCellElement(cell));
    }
  }

  // Add cell element to DOM
  addCellElement(cell) {
    const cellDiv = document.createElement('div');
    cellDiv.className = 'cell';
    cellDiv.dataset.cellId = cell.id;
    
    const isCollapsed = this.state.collapsedCells.has(cell.id);
    if (isCollapsed) cellDiv.classList.add('collapsed');

    const preview = cell.content 
      ? window.utils.createPreview(cell.content)
      : 'Empty';

    cellDiv.innerHTML = `
      <div class="cell-header">
        <button class="collapse-btn">${isCollapsed ? '▶' : '▼'}</button>
        <input type="checkbox" class="cell-checkbox" data-cell-id="${cell.id}">
        <span class="cell-title">${cell.title || 'Untitled Cell'}</span>
        ${isCollapsed && cell.content ? `<span class="cell-preview"> - ${preview}</span>` : ''}
      </div>
      <div class="cell-body" ${isCollapsed ? 'style="display: none;"' : ''}>
        <div class="cell-content">
          <div class="cell-content-display">${cell.content || 'Click to add content...'}</div>
        </div>
        <div class="cell-actions">
          <button class="edit-btn">Edit</button>
          <button class="move-up-btn">↑</button>
          <button class="move-down-btn">↓</button>
          <button class="delete-btn">🗑</button>
        </div>
      </div>
    `;

    this.elements.cellsList.appendChild(cellDiv);
  }

  // Update cell element
  updateCellElement(cellId, updates) {
    const cellDiv = document.querySelector(`[data-cell-id="${cellId}"]`);
    if (!cellDiv) return;

    if (updates.title !== undefined) {
      const titleEl = cellDiv.querySelector('.cell-title');
      if (titleEl) titleEl.textContent = updates.title;
    }

    if (updates.content !== undefined) {
      const contentEl = cellDiv.querySelector('.cell-content-display');
      if (contentEl) contentEl.textContent = updates.content || 'Click to add content...';
      
      // Update preview if collapsed
      if (this.state.collapsedCells.has(cellId)) {
        const preview = updates.content 
          ? window.utils.createPreview(updates.content)
          : 'Empty';
        
        const previewEl = cellDiv.querySelector('.cell-preview');
        if (previewEl) previewEl.textContent = ' - ' + preview;
      }
    }
  }

  // Remove cell element
  removeCellElement(cellId) {
    const cellDiv = document.querySelector(`[data-cell-id="${cellId}"]`);
    if (cellDiv) cellDiv.remove();
  }

  // Reorder cells in DOM
  reorderCells() {
    const project = this.store.getCurrentProject();
    if (!project || !project.cells) return;

    const cellsList = this.elements.cellsList;
    const cells = Array.from(cellsList.children);
    
    project.cells.forEach((cell, index) => {
      const cellElement = cells.find(el => 
        parseInt(el.dataset.cellId) === cell.id
      );
      if (cellElement) {
        cellsList.appendChild(cellElement);
      }
    });
  }

  // Toggle cell collapse
  toggleCellCollapse(cellId) {
    if (this.state.collapsedCells.has(cellId)) {
      this.state.collapsedCells.delete(cellId);
    } else {
      this.state.collapsedCells.add(cellId);
    }
    
    const cellDiv = document.querySelector(`[data-cell-id="${cellId}"]`);
    if (!cellDiv) return;

    const isCollapsed = this.state.collapsedCells.has(cellId);
    const btn = cellDiv.querySelector('.collapse-btn');
    const body = cellDiv.querySelector('.cell-body');
    
    btn.textContent = isCollapsed ? '▶' : '▼';
    body.style.display = isCollapsed ? 'none' : 'block';
    cellDiv.classList.toggle('collapsed', isCollapsed);
    
    // Update preview
    if (isCollapsed) {
      const project = this.store.getCurrentProject();
      const cell = project.cells.find(c => c.id === cellId);
      if (cell && cell.content) {
        const preview = window.utils.createPreview(cell.content);
        
        const header = cellDiv.querySelector('.cell-header');
        const previewEl = header.querySelector('.cell-preview');
        if (!previewEl) {
          const span = document.createElement('span');
          span.className = 'cell-preview';
          span.textContent = ' - ' + preview;
          header.appendChild(span);
        }
      }
    } else {
      const previewEl = cellDiv.querySelector('.cell-preview');
      if (previewEl) previewEl.remove();
    }
  }

  // Edit cell title
  editCellTitle(cellId) {
    const cellDiv = document.querySelector(`[data-cell-id="${cellId}"]`);
    const titleSpan = cellDiv.querySelector('.cell-title');
    const project = this.store.getCurrentProject();
    const cell = project.cells.find(c => c.id === cellId);
    
    if (!cell) return;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = cell.title || '';
    input.className = 'cell-title-input';

    const save = () => {
      this.store.updateCell(cellId, { title: input.value || 'Untitled Cell' });
      window.utils.showNotification('Cell title updated', 'success');
    };

    input.addEventListener('blur', save);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') save();
      else if (e.key === 'Escape') this.updateCellElement(cellId, { title: cell.title });
    });

    titleSpan.replaceWith(input);
    input.focus();
    input.select();
  }

  // Edit cell content
  editCellContent(cellId) {
    const cellDiv = document.querySelector(`[data-cell-id="${cellId}"]`);
    const contentDiv = cellDiv.querySelector('.cell-content');
    const project = this.store.getCurrentProject();
    const cell = project.cells.find(c => c.id === cellId);
    
    if (!cell) return;

    const textarea = document.createElement('textarea');
    textarea.value = cell.content || '';
    textarea.className = 'cell-content-edit';

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.className = 'save-btn';
    saveBtn.onclick = () => {
      this.store.updateCell(cellId, { content: textarea.value });
      // Restore normal display immediately
      const updatedContent = textarea.value || 'Click to add content...';
      contentDiv.innerHTML = '';
      const displayDiv = document.createElement('div');
      displayDiv.className = 'cell-content-display';
      displayDiv.textContent = updatedContent;
      contentDiv.appendChild(displayDiv);
      window.utils.showNotification('Cell content saved', 'success');
    };

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'cancel-btn';
    cancelBtn.onclick = () => {
      this.updateCellElement(cellId, { content: cell.content });
    };

    const buttonDiv = document.createElement('div');
    buttonDiv.className = 'edit-buttons';
    buttonDiv.appendChild(saveBtn);
    buttonDiv.appendChild(cancelBtn);

    contentDiv.innerHTML = '';
    contentDiv.appendChild(textarea);
    contentDiv.appendChild(buttonDiv);
    textarea.focus();
  }

  // Handle delete cell
  handleDeleteCell(cellId, btn) {
    if (btn.dataset.confirming === 'true') {
      this.store.deleteCell(cellId);
      window.utils.showNotification('Cell deleted', 'info');
    } else {
      btn.dataset.confirming = 'true';
      const originalText = btn.textContent;
      btn.textContent = '❓';
      btn.classList.add('confirming');
      
      setTimeout(() => {
        btn.dataset.confirming = 'false';
        btn.textContent = originalText;
        btn.classList.remove('confirming');
      }, 2000);
    }
  }

  // Copy selected cells to clipboard
  copySelected() {
    const project = this.store.getCurrentProject();
    if (!project) return;

    const mainCheckbox = this.elements.mainPromptCheckbox;
    const cellCheckboxes = document.querySelectorAll('.cell-checkbox:checked');
    
    let combined = '';
    
    if (mainCheckbox?.checked && project.mainPrompt) {
      combined = project.mainPrompt;
    }
    
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
      this.copyToClipboard(combined);
      this.showMessage(this.elements.copyBtn, '✓ Copied!', 2000);
    } else {
      this.showMessage(this.elements.copyBtn, 'Nothing selected', 1000);
    }
  }

  // Copy to clipboard with fallbacks
  copyToClipboard(text) {
    // Try Electron API
    if (window.electronAPI?.copyToClipboard) {
      try {
        window.electronAPI.copyToClipboard(text);
        return;
      } catch (e) {}
    }
    
    // Try navigator.clipboard
    if (navigator.clipboard?.writeText) {
      try {
        navigator.clipboard.writeText(text);
        return;
      } catch (e) {}
    }
    
    // Fallback to textarea
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  // Clear selection
  clearSelection() {
    this.elements.mainPromptCheckbox.checked = false;
    document.querySelectorAll('.cell-checkbox').forEach(cb => cb.checked = false);
  }

  // Expand all
  expandAll() {
    this.state.collapsedCells.clear();
    this.state.mainPromptCollapsed = false;
    this.updateMainPromptCollapse();
    
    // Update all cell displays directly without toggling
    document.querySelectorAll('.cell').forEach(cell => {
      const cellId = parseInt(cell.dataset.cellId);
      if (cellId) {
        this.updateCellElement(cellId);
      }
    });
  }

  // Collapse all
  collapseAll() {
    this.state.mainPromptCollapsed = true;
    this.updateMainPromptCollapse();
    
    const project = this.store.getCurrentProject();
    if (project?.cells) {
      project.cells.forEach(cell => {
        if (!this.state.collapsedCells.has(cell.id)) {
          this.toggleCellCollapse(cell.id);
        }
      });
    }
  }

  // Show temporary message
  showMessage(element, message, duration) {
    const originalText = element.textContent;
    element.textContent = message;
    setTimeout(() => {
      element.textContent = originalText;
    }, duration);
  }
}

// Export
window.UIRenderer = UIRenderer;