module.exports = {
  root: true,
  parser: 'babel-eslint',

  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },

  plugins: ['prettier', 'babel', 'node'],
  extends: ['eslint:recommended', 'plugin:prettier/recommended', 'plugin:node/recommended'],

  env: {
    node: true,
  },

  rules: {
    'node/no-unsupported-features/es-syntax': 0,
    'node/no-unpublished-import': 0,
  },

  overrides: [
    {
      files: ['__tests__/**/*.js'],
      env: {
        jest: true,
      },
    },
  ],
};
