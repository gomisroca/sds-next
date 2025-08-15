/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  semi: true,
  singleQuote: true,
  printWidth: 120,
  useTabs: false,
  tabWidth: 2,
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: true,
  arrowParens: 'always',
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindConfig: './tailwind.config.ts',
};

export default config;
