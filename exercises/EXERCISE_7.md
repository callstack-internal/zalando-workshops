# Exercise 7: Create a custom ESLint rule to prevent String.prototype.localeCompare

## Exercise overview
- Estimated time: 15 mins
- Tools required: ESLint

## Learning objectives
- Learn how to create custom ESLint rules
- Learn how to enforce code standards automatically

## Prerequisites

- Basic understanding of ESLint

## Background

This week we had a major performance regression in staging environment. The team quickly found an offending PR and reverted it. Turned out, a performance regression was caused by using String.prototype.localeCompare used by a developer.

## Objective

Create a custom ESLint rule that prevents the use of `String.prototype.localeCompare()` and suggests using `localeCompare` function from `stringUtils`.

## Reproduction steps

1. Search the codebase for `localeCompare` usage
2. Identify performance-sensitive areas where it's used (e.g., sorting functions)

## The fix

1. Create a new directory: `eslint-rules/` in the project root
2. Create the custom rule file: `eslint-rules/prefer-optimized-locale-compare.js`
3. Create the plugin index: `eslint-rules/index.js`
4. Configure ESLint to use the custom rule with Module monkey-patching
5. Fix any violations found

<details>
  <summary>Solution</summary>
  
  Create `eslint-rules/prefer-optimized-locale-compare.js`:
  ```javascript
  module.exports = {
    meta: {
      type: 'problem',
      docs: {
        description:
          'Enforce using the optimized localeCompare from stringUtils.ts instead of String.prototype.localeCompare',
        category: 'Performance',
        recommended: true,
      },
      fixable: null,
      schema: [],
      messages: {
        useOptimizedLocaleCompare:
          'Use the optimized localeCompare function from stringUtils.ts instead of String.prototype.localeCompare for better performance.',
      },
    },

    create(context) {
      return {
        CallExpression(node) {
          // Check if this is a method call (.localeCompare())
          if (
            node.callee.type === 'MemberExpression' &&
            node.callee.property.type === 'Identifier' &&
            node.callee.property.name === 'localeCompare'
          ) {
            context.report({
              node: node.callee.property,
              messageId: 'useOptimizedLocaleCompare',
            });
          }
        },
      };
    },
  };
  ```

  Create `eslint-rules/index.js`:
  ```javascript
  module.exports = {
    rules: {
      'prefer-optimized-locale-compare': require('./prefer-optimized-locale-compare'),
    },
  };
  ```

  Update `.eslintrc.js`:
  ```javascript
  // Monkey-patch to register custom rules
  const Module = require('module');
  const originalResolve = Module._resolveFilename;

  Module._resolveFilename = function (request, parent, isMain) {
    if (request === 'eslint-plugin-custom-rules') {
      return require.resolve('./eslint-rules/index.js');
    }
    return originalResolve.call(this, request, parent, isMain);
  };

  module.exports = {
    root: true,
    extends: ['@react-native', 'plugin:react-hooks/recommended'],
    plugins: ['custom-rules'],
    rules: {
      'jest/expect-expect': [
        'error',
        { assertFunctionNames: ['expect', 'measureRenders'] },
      ],
      'custom-rules/prefer-optimized-locale-compare': 'error',
    },
  };
  ```
</details>

## Verification

1. Run: `npm run lint` - verify the custom rule is active
2. Try replacing `localeCompare` in HomeScreen for `title` with
```javascript
return a.title.localeCompare(b.title);
```
3. Verify the rule throws an error

