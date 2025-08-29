// Data structure for workspaces
let workspaces = {
  newsplanet: {
    mainPrompt: '',
    cells: []
  }
};

let currentWorkspace = 'newsplanet';
let nextCellId = 1;
let collapsedCells = new Set();
let mainPromptCollapsed = false;

// Load data from localStorage
function loadData() {
  const saved = localStorage.getItem('ai-context-curator');
  if (saved) {
    try {
      workspaces = JSON.parse(saved);
      // Find the highest cell ID to continue from
      Object.values(workspaces).forEach(workspace => {
        if (workspace.cells) {
          workspace.cells.forEach(cell => {
            if (cell.id >= nextCellId) {
              nextCellId = cell.id + 1;
            }
          });
        }
      });
    } catch (e) {
      console.error('Error loading saved data:', e);
    }
  }
}

// Save data to localStorage
function saveData() {
  localStorage.setItem('ai-context-curator', JSON.stringify(workspaces));
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
  const workspace = workspaces[currentWorkspace];
  
  if (!workspace) {
    workspaces[currentWorkspace] = { mainPrompt: '', cells: [] };
    saveData();
    return;
  }
  
  // Update main prompt
  const mainPromptContent = document.getElementById('main-prompt-content');
  if (mainPromptContent) {
    // Only update if not currently editing
    if (!mainPromptContent.querySelector('textarea')) {
      mainPromptContent.textContent = workspace.mainPrompt || 'Click to set main prompt...';
    }
  }
  
  // Update main prompt preview and collapse state
  const mainPromptPreview = document.getElementById('main-prompt-preview');
  const mainPromptBody = document.getElementById('main-prompt-body');
  const mainPromptBtn = document.querySelector('#main-prompt-cell .collapse-btn');
  
  if (mainPromptCollapsed) {
    const preview = workspace.mainPrompt ? 
      (workspace.mainPrompt.length > 50 ? workspace.mainPrompt.substring(0, 50) + '...' : workspace.mainPrompt) : 
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
  
  if (workspace.cells && workspace.cells.length > 0) {
    workspace.cells.forEach(cell => {
      const cellElement = createCellElement(cell);
      cellsList.appendChild(cellElement);
    });
  }
}

// Edit cell title with inline editing
function editCellTitle(cellId) {
  const workspace = workspaces[currentWorkspace];
  const cell = workspace.cells.find(c => c.id === cellId);
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
  const workspace = workspaces[currentWorkspace];
  const cell = workspace.cells.find(c => c.id === cellId);
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
  const workspace = workspaces[currentWorkspace];
  if (!workspace.cells) {
    workspace.cells = [];
  }
  
  const newCell = {
    id: nextCellId++,
    title: `New Cell (${new Date().toLocaleDateString()})`,
    content: '',
    order: workspace.cells.length
  };
  
  workspace.cells.push(newCell);
  saveData();
  renderCells();
  
  // Auto-edit the new cell content
  setTimeout(() => editCellContent(newCell.id), 100);
}

// Delete cell
function deleteCell(cellId) {
  if (!confirm('Delete this cell?')) return;
  
  const workspace = workspaces[currentWorkspace];
  workspace.cells = workspace.cells.filter(c => c.id !== cellId);
  
  saveData();
  renderCells();
}

// Move cell up or down
function moveCell(cellId, direction) {
  const workspace = workspaces[currentWorkspace];
  const index = workspace.cells.findIndex(c => c.id === cellId);
  
  if (index === -1) return;
  
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= workspace.cells.length) return;
  
  // Swap cells
  [workspace.cells[index], workspace.cells[newIndex]] = 
  [workspace.cells[newIndex], workspace.cells[index]];
  
  saveData();
  renderCells();
}

// Edit main prompt - inline editing
function startEditingMainPrompt() {
  const mainPromptContent = document.getElementById('main-prompt-content');
  const workspace = workspaces[currentWorkspace];
  
  const textarea = document.createElement('textarea');
  textarea.id = 'main-prompt-edit';
  textarea.style.width = '100%';
  textarea.style.minHeight = '100px';
  textarea.value = workspace.mainPrompt || '';
  
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
  const workspace = workspaces[currentWorkspace];
  const textarea = document.getElementById('main-prompt-edit');
  workspace.mainPrompt = textarea.value;
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
  const workspace = workspaces[currentWorkspace];
  if (workspace.cells) {
    workspace.cells.forEach(cell => {
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
  const workspace = workspaces[currentWorkspace];
  const mainCheckbox = document.getElementById('main-checkbox');
  const cellCheckboxes = document.querySelectorAll('.cell-checkbox:checked');
  
  console.log('Copy Selected Debug:');
  console.log('Main checkbox checked:', mainCheckbox ? mainCheckbox.checked : 'not found');
  console.log('Main prompt content:', workspace.mainPrompt);
  console.log('Number of cells selected:', cellCheckboxes.length);
  
  let combined = '';
  
  // Include main prompt if checked
  if (mainCheckbox && mainCheckbox.checked && workspace.mainPrompt) {
    combined = workspace.mainPrompt;
    console.log('Added main prompt to combined');
  }
  
  // Add selected cells
  cellCheckboxes.forEach(checkbox => {
    const cellId = parseInt(checkbox.dataset.cellId);
    const cell = workspace.cells.find(c => c.id === cellId);
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
        console.log('Copied using Electron API');
      } catch (e) {
        console.error('Electron API failed:', e);
      }
    }
    
    // Method 2: Try navigator.clipboard if not copied yet
    if (!copied && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        navigator.clipboard.writeText(combined);
        copied = true;
        console.log('Copied using navigator.clipboard');
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
        console.log('Copied using textarea fallback');
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
    
    console.log('Copied combined text:', combined.substring(0, 100) + '...');
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
  renderCells();
  
  // Event listeners
  document.getElementById('add-cell-btn').addEventListener('click', addCell);
  document.getElementById('copy-btn').addEventListener('click', copySelected);
  document.getElementById('clear-btn').addEventListener('click', clearSelection);
  
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