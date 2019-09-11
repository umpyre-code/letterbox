module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: [
    'airbnb-typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:eslint-comments/recommended',
    'plugin:jest/recommended',
    // "plugin:promise/recommended",
    // "plugin:unicorn/recommended",
    'prettier',
    'prettier/react',
    'prettier/@typescript-eslint'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2018,
    sourceType: 'module',
    useJSXTextNode: true,
    project: './tsconfig.json'
  },

  plugins: ['@typescript-eslint', 'react', 'eslint-comments', 'jest', 'promise', 'unicorn'],

  parser: '@typescript-eslint/parser',
  rules: {
    'react/jsx-boolean-value': 'off',
    'react/prop-types': 'off',
    'react/require-default-props': 'off',
    'react/forbid-prop-types': 'off',
    // note you must disable the base rule as it can report incorrect errors
    camelcase: 'off',
    '@typescript-eslint/camelcase': [
      'error',
      {
        properties: 'never'
      }
    ],
    // Too restrictive, writing ugly code to defend against a very unlikely scenario: https://eslint.org/docs/rules/no-prototype-builtins
    'no-prototype-builtins': 'off',
    // https://basarat.gitbooks.io/typescript/docs/tips/defaultIsBad.html
    'import/prefer-default-export': 'off',
    // "import/no-default-export": "error",
    // Too restrictive: https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/destructuring-assignment.md
    'react/destructuring-assignment': 'off',
    // No jsx extension: https://github.com/facebook/create-react-app/issues/87#issuecomment-234627904
    'react/jsx-filename-extension': 'off',
    // Use function hoisting to improve code readability
    'no-use-before-define': [
      'error',
      {
        functions: false,
        classes: true,
        variables: true
      }
    ],
    // Makes no sense to allow type inferrence for expression parameters, but require typing the response
    '@typescript-eslint/explicit-function-return-type': [
      'off',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true
      }
    ],
    '@typescript-eslint/no-use-before-define': [
      'error',
      {
        functions: false,
        classes: true,
        variables: true,
        typedefs: true
      }
    ],
    // Common abbreviations are known and readable
    'unicorn/prevent-abbreviations': 'off',
    'unicorn/filename-case': [
      'error',
      {
        cases: {
          camelCase: true,
          pascalCase: true
        }
      }
    ],
    // "react/prop-types": ["warn"],
    // "import/no-default-export": ["warn"],
    'jsx-a11y/accessible-emoji': ['off']
  }
}
