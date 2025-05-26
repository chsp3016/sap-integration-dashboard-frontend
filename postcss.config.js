module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' ? {
      '@fullhuman/postcss-purgecss': {
        content: [
          './src/**/*.{js,jsx,ts,tsx}',
          './public/index.html',
        ],
        safelist: [
          // Preserve Chart.js styles
          /^chartjs-/,
          // Preserve React transition classes
          /^react-transition-/,
          // Preserve utility classes that might be dynamically added
          /^bg-/,
          /^text-/,
          /^border-/,
          /^hover:/,
          /^focus:/,
          /^active:/,
          // Preserve animation classes
          /^animate-/,
          /^transition-/,
          /^duration-/,
          /^ease-/,
          // Preserve responsive classes
          /^sm:/,
          /^md:/,
          /^lg:/,
          /^xl:/,
          /^2xl:/,
        ]
      },
      cssnano: {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
          normalizeWhitespace: true,
          minifySelectors: true,
          minifyParams: true,
        }]
      }
    } : {})
  },
};