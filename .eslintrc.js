module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly",
        "describe": "readonly",
        "beforeEach": "readonly",
        "afterEach": "readonly",
        "it": "readonly"
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module",
        "ecmaFeatures": {
            "jsx": true
        }
    },
    "plugins": [
        "@typescript-eslint",
        "react"
    ],
    "rules": {
        "semi": ["error", "never"],
        "no-trailing-spaces": "error"
    },
    "settings": {
        "react": {
            "version": "detect",
        }
    }
};