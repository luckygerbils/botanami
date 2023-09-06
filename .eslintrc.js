module.exports = {
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended-type-checked',
      'plugin:@typescript-eslint/stylistic-type-checked',
      "plugin:react/recommended",
      "plugin:react-hooks/recommended"
    ],
    plugins: [
        '@typescript-eslint',
        'react',
        'react-hooks',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
    },
    rules: {
        "@typescript-eslint/no-unused-vars": "off", // Annoying during development
        "@typescript-eslint/require-await": "off", // Annoying during development
        "@typescript-eslint/no-empty-interface": "off", // Annoying during development
        "@typescript-eslint/no-empty-function": "off", // Disagree
        "@typescript-eslint/no-misused-promises": [
            "error",
            {
              "checksVoidReturn": {
                "arguments": false,
                "attributes": false
              }
            }
          ]
    },
    ignorePatterns: [
        ".eslintrc.js",
    ],
    "settings": {
        "react": {
            "version": "detect"
        }
    },
  };