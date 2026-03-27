// Create a single Intl.Collator instance for efficient string comparisons
const collator = new Intl.Collator();

/**
 * Optimized string comparison using a shared Intl.Collator instance.
 * More performant than String.prototype.localeCompare() when called repeatedly.
 */
export const localeCompare = (a: string, b: string): number => {
  return collator.compare(a, b);
};
