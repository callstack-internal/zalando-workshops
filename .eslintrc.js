module.exports = {
  root: true,
  extends: ['@react-native', 'plugin:react-hooks/recommended'],
  rules: {
    'jest/expect-expect': [
      'error',
      { assertFunctionNames: ['expect', 'measureRenders'] },
    ],
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'date-fns',
            message:
              'Use per-method imports (e.g. date-fns/format) instead of importing from date-fns directly.',
          },
        ],
      },
    ],
  },
};
