// @ts-check
import { defineConfig, envField } from 'astro/config'

import tailwindcss from '@tailwindcss/vite'

import react from '@astrojs/react'

import sitemap from '@astrojs/sitemap'

import cloudflare from '@astrojs/cloudflare'

import rehypeExternalLinks from 'rehype-external-links'

// https://astro.build/config
export default defineConfig({
  site: import.meta.env.PROD
    ? 'https://your-domain.com'
    : 'https://frontend.your-domain.com',

  adapter: cloudflare({
    platformProxy: {
      enabled: false
    },
    imageService: 'compile'
  }),

  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ['.your-domain.com']
    },
    preview: {
      host: true,
      allowedHosts: ['.your-domain.com']
    },
    resolve: {
      alias: {
        '@': '/src',
        ...(import.meta.env.PROD && {
          'react-dom/server': 'react-dom/server.edge'
        })
      }
    },
    build: {
      minify: import.meta.env.PROD
    }
  },

  integrations: [
    react(),
    sitemap({
      filter: page => {
        const excludedPaths = ['/platform/', '/su/', '/account/', '/legal/']

        return !excludedPaths.some(path => page.includes(path))
      }
    })
  ],

  output: 'static',

  env: {
    schema: {
      API_URL: envField.string({
        context: 'client',
        access: 'public',
        optional: false
      }),
      STRIPE_PUBLISHABLE_KEY: envField.string({
        context: 'client',
        access: 'public',
        optional: false
      })
    }
  },

  markdown: {
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      ]
    ]
  },

  devToolbar: {
    enabled: false
  }
})
