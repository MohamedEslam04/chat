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
    dbPath: process.env.DB_PATH || 'sqlite.db',
    dbHost: process.env.DB_HOST || 'localhost',
    dbUser: process.env.DB_USER || 'root',
    dbPassword: process.env.DB_PASSWORD || 'mypassword',
    dbName: process.env.DB_NAME || 'mysql',
    dbPort: process.env.DB_PORT || '3306',
    ai: {
      cancerChat: {
        enabled: process.env.NUXT_AI_CANCER_CHAT_ENABLED === 'true',
        name: process.env.NUXT_AI_CANCER_CHAT_NAME || 'Custom AI Model',
        apiKey: process.env.NUXT_AI_CANCER_CHAT_API_KEY,
        baseUrl: process.env.NUXT_AI_CANCER_CHAT_BASE_URL || 'https://dev-aimodel.atwdemo.com',
        endpoint: process.env.NUXT_AI_CANCER_CHAT_ENDPOINT || '/get_answer',
        method: process.env.NUXT_AI_CANCER_CHAT_METHOD || 'POST'
      },
      aiPentest: {
        enabled: process.env.NUXT_AI_AI_PENTEST_ENABLED === 'true',
        name: process.env.NUXT_AI_AI_PENTEST_NAME || 'Custom AI Model 2',
        apiKey: process.env.NUXT_AI_AI_PENTEST_API_KEY,
        baseUrl: process.env.NUXT_AI_AI_PENTEST_BASE_URL || 'https://ml-test.atwdemo.com',
        endpoint: process.env.NUXT_AI_AI_PENTEST_ENDPOINT || '/smart_chef',
        method: process.env.NUXT_AI_AI_PENTEST_METHOD || 'POST'
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
