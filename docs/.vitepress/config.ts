import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Currency',
  description: 'A lightweight TypeScript library for precise monetary operations.',

  lang: 'en-US',
  base: '/currency/',

  head: [
    ['link', { rel: 'icon', href: '/money-bag.png', type: 'image/x-icon' }],
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { property: 'og:title', content: 'Currency' }],
    [
      'meta',
      {
        property: 'og:description',
        content: 'Immutable, float-safe monetary operations for TypeScript.',
      },
    ],
  ],

  cleanUrls: true,

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started', activeMatch: '/guide/' },
      { text: 'API', link: '/api/creation', activeMatch: '/api/' },
      { text: 'Reference', link: '/reference/types', activeMatch: '/reference/' },
      { text: 'Recipes', link: '/recipes/cart-total', activeMatch: '/recipes/' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Core Concepts', link: '/guide/concepts' },
            { text: 'Error Handling', link: '/guide/error-handling' },
          ],
        },
      ],

      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Creation', link: '/api/creation' },
            { text: 'Arithmetic', link: '/api/arithmetic' },
            { text: 'Comparison', link: '/api/comparison' },
            { text: 'Transformation', link: '/api/transformation' },
            { text: 'Business', link: '/api/business' },
            { text: 'Collection', link: '/api/collection' },
            { text: 'Display', link: '/api/display' },
            { text: 'Accessors', link: '/api/accessors' },
          ],
        },
      ],

      '/reference/': [
        {
          text: 'Reference',
          items: [
            { text: 'Types', link: '/reference/types' },
            { text: 'Supported Countries', link: '/reference/supported-countries' },
            { text: 'Rounding Modes', link: '/reference/rounding-modes' },
            { text: 'Format Options', link: '/reference/format-options' },
            { text: 'Errors', link: '/reference/errors' },
          ],
        },
      ],

      '/recipes/': [
        {
          text: 'Recipes',
          items: [
            { text: 'Cart Total', link: '/recipes/cart-total' },
            { text: 'Installments', link: '/recipes/installments' },
            { text: 'Serialization', link: '/recipes/serialization' },
            { text: 'Sorting', link: '/recipes/sorting' },
            { text: 'Discount Chain', link: '/recipes/discount-chain' },
            { text: 'Presets', link: '/recipes/presets' },
          ],
        },
      ],
    },

    search: {
      provider: 'local',
    },

    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/eriveltondasilva/currency',
      },
      {
        icon: 'npm',
        link: 'https://www.npmjs.com/package/@eriveltondasilva/currency',
      },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright:
        'Copyright © 2026-present <a href="https://github.com/eriveltondasilva">Erivelton Silva</a>',
    },

    lastUpdated: {
      text: 'Last updated',
      formatOptions: {
        dateStyle: 'medium',
      },
    },

    editLink: {
      pattern: 'https://github.com/eriveltondasilva/currency/edit/main/docs/:path',
      text: 'Edit this page',
    },

    outline: {
      level: [2, 3],
      label: 'On this page',
    },
  },
});
