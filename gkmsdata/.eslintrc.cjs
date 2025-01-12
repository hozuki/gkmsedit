module.exports = {
    root: true,
    env: {browser: true, es2020: true},
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
    ignorePatterns: [".eslintrc.cjs", "prettier.config.cjs", "dist", "typings"],
    parser: "@typescript-eslint/parser",
    plugins: [],
    rules: {
        "@typescript-eslint/no-unused-vars": ["off"],
    },
};
