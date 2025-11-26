// Performance measurement utilities with start/stop API
import performance, {PerformanceObserver} from 'react-native-performance';

// Observe native launch marks to derive higher-level measures
if (typeof PerformanceObserver !== 'undefined') {
  const nativeObserver = new PerformanceObserver(list => {
    const hasRunJsBundleEnd = list
      .getEntries()
      .some(entry => entry.name === 'runJsBundleEnd');
    if (hasRunJsBundleEnd) {
      performance.measure(
        'nativeLaunch',
        'nativeLaunchStart',
        'nativeLaunchEnd',
      );
      performance.measure('runJsBundle', 'runJsBundleStart', 'runJsBundleEnd');
    }
  });
  nativeObserver.observe({type: 'react-native-mark', buffered: true});

  // Log every measure duration for quick visibility
  const measureObserver = new PerformanceObserver(list => {
    list.getEntries().forEach(entry => {
      console.log(`[Performance] ${entry.name}: ${entry.duration}ms`);
    });
  });
  measureObserver.observe({type: 'measure', buffered: true});
}

const activeStartMarks = new Set<string>();

const performanceUtils = {
  // Start measuring a performance metric
  start: (name: string) => {
    if (performance && performance.mark) {
      const startMarkName = `${name}-start`;
      performance.mark(startMarkName);
      activeStartMarks.add(startMarkName);
    } else {
      console.warn('[Performance] Performance API not available');
    }
  },

  // Stop measuring and automatically log the result
  stop: (name: string) => {
    if (performance && performance.mark && performance.measure) {
      const startMarkName = `${name}-start`;
      if (!activeStartMarks.has(startMarkName)) {
        return;
      }
      activeStartMarks.delete(startMarkName);

      const endMarkName = `${name}-end`;
      const measureName = name;

      // Check if the start mark exists
      const startMarks = performance.getEntriesByName(startMarkName);
      if (startMarks.length === 0) {
        return;
      }

      // Mark the end time
      performance.mark(endMarkName);

      try {
        // Measure between start and end marks
        performance.measure(measureName, startMarkName, endMarkName);

        // Get the measurement and log it
        const entries = performance.getEntriesByName(measureName);
        if (entries.length > 0) {
          // Clean up marks and measures to avoid memory leaks
          performance.clearMarks(startMarkName);
          performance.clearMarks(endMarkName);
          performance.clearMeasures(measureName);
        }
      } catch (error) {
        console.warn(`[Performance] Could not measure ${name}:`, error);
      }
    } else {
      console.warn('[Performance] Performance API not available');
    }
  },

  // Get all performance entries (for debugging)
  getAllEntries: () => {
    if (performance && performance.getEntries) {
      return performance.getEntries();
    }
    return [];
  },

  // Clear all performance data
  clearAll: () => {
    if (performance) {
      performance.clearMarks && performance.clearMarks();
      performance.clearMeasures && performance.clearMeasures();
    }
  },

  // Measure a function execution time
  measureFunction: async <T>(
    name: string,
    fn: () => T | Promise<T>,
  ): Promise<T> => {
    performanceUtils.start(name);
    try {
      const result = await fn();
      performanceUtils.stop(name);
      return result;
    } catch (error) {
      performanceUtils.stop(name);
      throw error;
    }
  },

  // Measure React component render time (use in useEffect)
  measureRender: (componentName: string) => {
    performanceUtils.start(`${componentName}-render`);

    // Return cleanup function to call in useEffect cleanup
    return () => {
      performanceUtils.stop(`${componentName}-render`);
    };
  },
};

export default performanceUtils;
