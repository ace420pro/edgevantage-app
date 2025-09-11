// Performance optimization utilities

/**
 * Debounce function to limit the rate of function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute immediately if true
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

/**
 * Throttle function to limit function execution frequency
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Check if the current device has reduced motion preference
 * @returns {boolean} True if user prefers reduced motion
 */
export const prefersReducedMotion = () => {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get viewport dimensions
 * @returns {Object} Viewport width and height
 */
export const getViewportDimensions = () => {
  return {
    width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
    height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
  };
};

/**
 * Check if element is in viewport
 * @param {HTMLElement} element - Element to check
 * @param {number} offset - Offset in pixels (default: 0)
 * @returns {boolean} True if element is in viewport
 */
export const isElementInViewport = (element, offset = 0) => {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  const viewport = getViewportDimensions();
  
  return (
    rect.top >= -offset &&
    rect.left >= -offset &&
    rect.bottom <= viewport.height + offset &&
    rect.right <= viewport.width + offset
  );
};

/**
 * Preload critical resources
 * @param {Array} resources - Array of resource URLs
 * @param {string} type - Resource type (image, script, style)
 */
export const preloadResources = (resources, type = 'image') => {
  if (!Array.isArray(resources)) return;
  
  resources.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = type;
    if (type === 'image') {
      link.type = 'image/*';
    }
    document.head.appendChild(link);
  });
};

/**
 * Memory-efficient array chunking for large data sets
 * @param {Array} array - Array to chunk
 * @param {number} size - Chunk size
 * @returns {Array} Array of chunks
 */
export const chunkArray = (array, size) => {
  if (!Array.isArray(array) || size <= 0) return [];
  
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Performance measurement utility
 * @param {string} name - Performance mark name
 * @param {Function} callback - Function to measure
 * @returns {Promise} Promise that resolves with the result
 */
export const measurePerformance = async (name, callback) => {
  const startMark = `${name}-start`;
  const endMark = `${name}-end`;
  const measureName = `${name}-duration`;
  
  performance.mark(startMark);
  const result = await callback();
  performance.mark(endMark);
  
  performance.measure(measureName, startMark, endMark);
  
  const measurement = performance.getEntriesByName(measureName)[0];
  console.log(`${name} took ${measurement.duration.toFixed(2)}ms`);
  
  // Clean up marks and measures
  performance.clearMarks(startMark);
  performance.clearMarks(endMark);
  performance.clearMeasures(measureName);
  
  return result;
};

/**
 * Create an optimized scroll handler with RAF
 * @param {Function} callback - Scroll callback
 * @returns {Function} Optimized scroll handler
 */
export const createOptimizedScrollHandler = (callback) => {
  let ticking = false;
  
  return () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        callback();
        ticking = false;
      });
      ticking = true;
    }
  };
};

/**
 * Dynamic import with error handling and loading states
 * @param {Function} importFn - Dynamic import function
 * @param {Object} options - Options object
 * @returns {Promise} Promise that resolves with the component
 */
export const safeDynamicImport = async (importFn, options = {}) => {
  const { 
    fallback = null, 
    maxRetries = 3, 
    retryDelay = 1000,
    onError = console.error 
  } = options;
  
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      return await importFn();
    } catch (error) {
      retries++;
      onError(`Import failed (attempt ${retries}/${maxRetries}):`, error);
      
      if (retries >= maxRetries) {
        if (fallback) return { default: fallback };
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay * retries));
    }
  }
};

/**
 * Web Vitals measurement utilities
 */
export const webVitals = {
  // Largest Contentful Paint
  onLCP: (callback) => {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      callback(lastEntry);
    }).observe({ entryTypes: ['largest-contentful-paint'] });
  },

  // First Input Delay
  onFID: (callback) => {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        callback(entry);
      }
    }).observe({ entryTypes: ['first-input'] });
  },

  // Cumulative Layout Shift
  onCLS: (callback) => {
    let clsValue = 0;
    let clsEntries = [];
    
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          clsEntries.push(entry);
        }
      }
      callback({ value: clsValue, entries: clsEntries });
    }).observe({ entryTypes: ['layout-shift'] });
  }
};

/**
 * Resource loading optimization
 */
export const optimizeResourceLoading = () => {
  // Preload critical fonts
  const criticalFonts = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
  ];
  
  criticalFonts.forEach(font => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = font;
    link.as = 'style';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });

  // Preconnect to external domains
  const externalDomains = [
    'https://www.google-analytics.com',
    'https://connect.facebook.net',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ];
  
  externalDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

/**
 * Memory usage monitoring (for development)
 */
export const monitorMemoryUsage = () => {
  if (performance.memory) {
    const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance.memory;
    const usedMB = Math.round(usedJSHeapSize / 1048576);
    const totalMB = Math.round(totalJSHeapSize / 1048576);
    const limitMB = Math.round(jsHeapSizeLimit / 1048576);
    
    console.log(`Memory Usage: ${usedMB}MB / ${totalMB}MB (Limit: ${limitMB}MB)`);
    return { used: usedMB, total: totalMB, limit: limitMB };
  }
  
  return null;
};