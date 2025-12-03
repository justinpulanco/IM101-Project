// Accessibility Utility Functions

/**
 * Trap focus within a modal or dialog
 */
export const trapFocus = (element) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    }
  };

  element.addEventListener('keydown', handleTabKey);
  
  // Focus first element
  if (firstFocusable) {
    firstFocusable.focus();
  }

  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
};

/**
 * Handle Escape key to close modals
 */
export const handleEscapeKey = (callback) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      callback();
    }
  };

  document.addEventListener('keydown', handleKeyDown);

  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Announce message to screen readers
 */
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Generate unique ID for ARIA labels
 */
let idCounter = 0;
export const generateId = (prefix = 'id') => {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
};

/**
 * Check if element is visible to screen readers
 */
export const isVisibleToScreenReader = (element) => {
  return (
    element.offsetWidth > 0 &&
    element.offsetHeight > 0 &&
    window.getComputedStyle(element).visibility !== 'hidden' &&
    window.getComputedStyle(element).display !== 'none'
  );
};

/**
 * Keyboard navigation helper for lists
 */
export const handleArrowNavigation = (e, items, currentIndex, onSelect) => {
  let newIndex = currentIndex;

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      break;
    case 'ArrowUp':
      e.preventDefault();
      newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      break;
    case 'Home':
      e.preventDefault();
      newIndex = 0;
      break;
    case 'End':
      e.preventDefault();
      newIndex = items.length - 1;
      break;
    case 'Enter':
    case ' ':
      e.preventDefault();
      if (onSelect) onSelect(items[currentIndex]);
      return currentIndex;
    default:
      return currentIndex;
  }

  return newIndex;
};
