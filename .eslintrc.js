module.exports = {
  root: true,
  extends: ['@react-native', 'plugin:react-hooks/recommended'],
  rules: {
    'jest/expect-expect': [
      'error',
      { assertFunctionNames: ['expect', 'measureRenders'] },
    ],
  },
};
