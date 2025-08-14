// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@eslamdevui/ui',
    '@nuxtjs/mdc',
    'nuxt-auth-utils'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  mdc: {
    highlight: {
      // noApiRoute: true
      shikiEngine: 'javascript'
    }
  },

  runtimeConfig: {
    dbPath: process.env.DB_PATH || '.data/sqlite.db',
    ai: {
      openai: {
        enabled: process.env.NUXT_AI_OPENAI_ENABLED === 'true',
        apiKey: process.env.NUXT_AI_OPENAI_API_KEY,
        baseUrl: process.env.NUXT_AI_OPENAI_BASE_URL || 'https://api.openai.com/v1',
        model: process.env.NUXT_AI_OPENAI_MODEL || 'gpt-3.5-turbo'
      },
      claude: {
        enabled: process.env.NUXT_AI_CLAUDE_ENABLED === 'true',
        apiKey: process.env.NUXT_AI_CLAUDE_API_KEY,
        baseUrl: process.env.NUXT_AI_CLAUDE_BASE_URL || 'https://api.anthropic.com/v1',
        model: process.env.NUXT_AI_CLAUDE_MODEL || 'claude-3-sonnet-20240229'
      },
      gemini: {
        enabled: process.env.NUXT_AI_GEMINI_ENABLED === 'true',
        apiKey: process.env.NUXT_AI_GEMINI_API_KEY,
        baseUrl: process.env.NUXT_AI_GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta',
        model: process.env.NUXT_AI_GEMINI_MODEL || 'gemini-pro'
      },
      custom: {
        enabled: process.env.NUXT_AI_CUSTOM_ENABLED === 'true',
        name: process.env.NUXT_AI_CUSTOM_NAME || 'Custom AI Model',
        apiKey: process.env.NUXT_AI_CUSTOM_API_KEY,
        baseUrl: process.env.NUXT_AI_CUSTOM_BASE_URL || 'https://dev-aimodel.atwdemo.com',
        endpoint: process.env.NUXT_AI_CUSTOM_ENDPOINT || '/get_answer',
        method: process.env.NUXT_AI_CUSTOM_METHOD || 'POST'
      },
      custom2: {
        enabled: process.env.NUXT_AI_CUSTOM2_ENABLED === 'true',
        name: process.env.NUXT_AI_CUSTOM2_NAME || 'Custom AI Model 2',
        apiKey: process.env.NUXT_AI_CUSTOM2_API_KEY,
        baseUrl: process.env.NUXT_AI_CUSTOM2_BASE_URL || 'https://ml-test.atwdemo.com',
        endpoint: process.env.NUXT_AI_CUSTOM2_ENDPOINT || '/smart_chef',
        method: process.env.NUXT_AI_CUSTOM2_METHOD || 'POST'
      }
    }
  },

  experimental: {
    viewTransition: true
  },

  compatibilityDate: '2024-07-11',

  nitro: {
    preset: 'node-server',
    experimental: {
      openAPI: true
    }
  },

  vite: {
    $server: {
      build: {
        rollupOptions: {
          output: {
            preserveModules: true
          }
        }
      }
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
