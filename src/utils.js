// Simple utility functions to reduce code duplication

// Create a truncated preview of text
function createPreview(text) {
  if (!text) return '';
  const maxLength = 50;
  return text.length > maxLength 
    ? text.substring(0, maxLength) + '...' 
    : text;
}

// Show user notification
function showNotification(message, type = 'info') {
  // Remove any existing notification
  const existing = document.querySelector('.notification');
  if (existing) {
    existing.remove();
  }
  
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Fade in
  requestAnimationFrame(() => {
    notification.classList.add('show');
  });
  
  // Auto remove after 2 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// Export for use in other files
window.utils = {
  createPreview,
  showNotification
};