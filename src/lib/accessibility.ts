// Accessibility utilities and helpers

// ARIA labels and descriptions
export const ariaLabels = {
  // Navigation
  mainNavigation: 'Main navigation',
  breadcrumbNavigation: 'Breadcrumb navigation',
  userMenu: 'User account menu',
  searchForm: 'Search form',
  
  // Actions
  createPost: 'Create new post',
  editPost: 'Edit post',
  deletePost: 'Delete post',
  publishPost: 'Publish post',
  schedulePost: 'Schedule post for later',
  
  // Status indicators
  loadingContent: 'Loading content',
  errorOccurred: 'An error occurred',
  successMessage: 'Action completed successfully',
  
  // Form elements
  requiredField: 'Required field',
  optionalField: 'Optional field',
  characterCount: (current: number, max: number) => `${current} of ${max} characters used`,
  
  // Media
  postImage: 'Post image',
  profileImage: 'Profile image',
  mediaUpload: 'Upload media files',
};

// Focus management utilities
export class FocusManager {
  private focusHistory: HTMLElement[] = [];
  
  // Store current focus for later restoration
  storeFocus() {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement !== document.body) {
      this.focusHistory.push(activeElement);
    }
  }
  
  // Restore previously stored focus
  restoreFocus() {
    const lastFocused = this.focusHistory.pop();
    if (lastFocused && lastFocused.isConnected) {
      lastFocused.focus();
    }
  }
  
  // Focus first interactive element in container
  focusFirstInteractive(container: HTMLElement) {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }
  
  // Get all focusable elements in container
  getFocusableElements(container: HTMLElement): HTMLElement[] {
    const selector = [
      'button:not([disabled])',
      '[href]:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"]):not([disabled])',
      'details:not([disabled])',
      'summary:not(:disabled)'
    ].join(',');
    
    return Array.from(container.querySelectorAll(selector)) as HTMLElement[];
  }
  
  // Trap focus within container
  trapFocus(container: HTMLElement) {
    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    container.addEventListener('keydown', handleKeydown);
    return () => container.removeEventListener('keydown', handleKeydown);
  }
}

// Keyboard navigation utilities
export const keyboardNavigation = {
  // Handle arrow key navigation for grids/lists
  handleArrowNavigation: (
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    columns?: number
  ) => {
    let newIndex = currentIndex;
    
    switch (event.key) {
      case 'ArrowDown':
        if (columns) {
          newIndex = Math.min(items.length - 1, currentIndex + columns);
        } else {
          newIndex = Math.min(items.length - 1, currentIndex + 1);
        }
        break;
      case 'ArrowUp':
        if (columns) {
          newIndex = Math.max(0, currentIndex - columns);
        } else {
          newIndex = Math.max(0, currentIndex - 1);
        }
        break;
      case 'ArrowRight':
        if (columns) {
          newIndex = Math.min(items.length - 1, currentIndex + 1);
        }
        break;
      case 'ArrowLeft':
        if (columns) {
          newIndex = Math.max(0, currentIndex - 1);
        }
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = items.length - 1;
        break;
      default:
        return currentIndex;
    }
    
    if (newIndex !== currentIndex) {
      event.preventDefault();
      items[newIndex]?.focus();
    }
    
    return newIndex;
  },
  
  // Handle Enter/Space activation
  handleActivation: (event: KeyboardEvent, callback: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  }
};

// Screen reader utilities
export const screenReader = {
  // Announce message to screen readers
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.classList.add('sr-only');
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },
  
  // Create visually hidden text for screen readers
  createSROnlyText: (text: string): HTMLSpanElement => {
    const span = document.createElement('span');
    span.classList.add('sr-only');
    span.textContent = text;
    return span;
  }
};

// Color contrast utilities
export const colorContrast = {
  // Check if high contrast mode is enabled
  isHighContrastMode: (): boolean => {
    return window.matchMedia('(prefers-contrast: high)').matches;
  },
  
  // Check if user prefers reduced motion
  prefersReducedMotion: (): boolean => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },
  
  // Get high contrast class names
  getHighContrastClasses: (baseClasses: string): string => {
    if (colorContrast.isHighContrastMode()) {
      return `${baseClasses} high-contrast:border-2 high-contrast:border-foreground`;
    }
    return baseClasses;
  }
};

// Form accessibility helpers
export const formAccessibility = {
  // Generate accessible form field props
  getFieldProps: (id: string, label: string, required = false, error?: string) => ({
    id,
    'aria-label': label,
    'aria-required': required,
    'aria-invalid': !!error,
    'aria-describedby': error ? `${id}-error` : undefined,
  }),
  
  // Generate error message props
  getErrorProps: (fieldId: string) => ({
    id: `${fieldId}-error`,
    role: 'alert',
    'aria-live': 'polite' as const,
  }),
  
  // Generate description props
  getDescriptionProps: (fieldId: string) => ({
    id: `${fieldId}-description`,
  })
};

// Create a global focus manager instance
export const focusManager = new FocusManager();