interface AIModelConfig {
  id: string
  name: string
  enabled: boolean
  apiKey?: string
  baseUrl: string
  endpoint?: string
  method: 'get' | 'GET' | 'head' | 'HEAD' | 'post' | 'POST' | 'put' | 'PUT' | 'delete' | 'DELETE' | 'patch' | 'PATCH' | 'connect' | 'CONNECT' | 'options' | 'OPTIONS' | 'trace' | 'TRACE'
  model?: string
}

interface AIResponse {
  content: string
  error?: string
}

export function getEnabledAIModels(): AIModelConfig[] {
  const config = useRuntimeConfig()
  const models: AIModelConfig[] = []

  // OpenAI
  if (config.ai?.openai?.enabled) {
    models.push({
      id: 'openai',
      name: 'OpenAI GPT',
      enabled: true,
      apiKey: config.ai.openai.apiKey,
      baseUrl: config.ai.openai.baseUrl,
      endpoint: '/chat/completions',
      method: 'POST',
      model: config.ai.openai.model
    })
  }

  // Claude
  if (config.ai?.claude?.enabled) {
    models.push({
      id: 'claude',
      name: 'Claude',
      enabled: true,
      apiKey: config.ai.claude.apiKey,
      baseUrl: config.ai.claude.baseUrl,
      endpoint: '/messages',
      method: 'POST',
      model: config.ai.claude.model
    })
  }

  // Gemini
  if (config.ai?.gemini?.enabled) {
    models.push({
      id: 'gemini',
      name: 'Gemini',
      enabled: true,
      apiKey: config.ai.gemini.apiKey,
      baseUrl: config.ai.gemini.baseUrl,
      endpoint: `/models/${config.ai.gemini.model}:generateContent`,
      method: 'POST',
      model: config.ai.gemini.model
    })
  }

  // Custom Model 1
  if (config.ai?.custom?.enabled) {
    models.push({
      id: 'custom',
      name: config.ai.custom.name || 'Custom AI Model',
      enabled: true,
      apiKey: config.ai.custom.apiKey,
      baseUrl: config.ai.custom.baseUrl,
      endpoint: config.ai.custom.endpoint,
      method: config.ai.custom.method || 'POST'
    })
  }

  // Custom Model 2
  if (config.ai?.custom2?.enabled) {
    models.push({
      id: 'custom2',
      name: config.ai.custom2.name || 'Custom AI Model 2',
      enabled: true,
      apiKey: config.ai.custom2.apiKey,
      baseUrl: config.ai.custom2.baseUrl,
      endpoint: config.ai.custom2.endpoint,
      method: config.ai.custom2.method || 'POST'
    })
  }

  return models
}

export async function callAIModel(modelId: string, message: string, conversationHistory: Array<{ role: string, content: string }> = []): Promise<AIResponse> {
  const models = getEnabledAIModels()
  const model = models.find(m => m.id === modelId)

  if (!model) {
    return { content: '', error: 'Model not found or not enabled' }
  }

  try {
    const url = `${model.baseUrl}${model.endpoint}`
    let requestBody: any
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    // Add authentication headers
    if (model.apiKey) {
      switch (modelId) {
        case 'openai':
          headers['Authorization'] = `Bearer ${model.apiKey}`
          break
        case 'claude':
          headers['x-api-key'] = model.apiKey
          headers['anthropic-version'] = '2023-06-01'
          break
        case 'gemini':
          // Gemini uses API key in URL
          break
        default:
          headers['Authorization'] = `Bearer ${model.apiKey}`
          break
      }
    }

    // Prepare request body based on model type
    switch (modelId) {
      case 'openai':
        requestBody = {
          model: model.model,
          messages: [
            ...conversationHistory,
            { role: 'user', content: message }
          ],
          stream: false
        }
        break

      case 'claude':
        requestBody = {
          model: model.model,
          max_tokens: 1000,
          messages: [
            ...conversationHistory,
            { role: 'user', content: message }
          ]
        }
        break

      case 'gemini':
        requestBody = {
          contents: [{
            parts: [{ text: message }]
          }]
        }
        // Add API key to URL for Gemini
        const geminiUrl = `${url}?key=${model.apiKey}`
        const geminiResponse = await $fetch(geminiUrl, {
          method: model.method,
          headers,
          body: requestBody
        })
        return {
          content: (geminiResponse as any)?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini'
        }

      case 'custom':
        requestBody = {
          message: message
        }
        break

      case 'custom2':
        requestBody = {
          question: message
        }
        break

      default:
        requestBody = {
          message: message,
          context: conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')
        }
        break
    }

    const response = await $fetch(url, {
      method: model.method,
      headers,
      body: requestBody
    })

    // Parse response based on model type
    let content = ''
    switch (modelId) {
      case 'openai':
        content = (response as any)?.choices?.[0]?.message?.content || 'No response from OpenAI'
        break

      case 'claude':
        content = (response as any)?.content?.[0]?.text || 'No response from Claude'
        break

      case 'custom':
        content = (response as any)?.response || 'No response from Custom AI'
        break

      case 'custom2':
        // Handle the smart chef response format
        if (typeof response === 'object' && response !== null && 'meals' in response) {
          const meals = (response as any).meals
          if (Array.isArray(meals) && meals.length > 0 && meals[0]?.calorie_per_component) {
            content = meals[0].calorie_per_component
          } else {
            content = 'No meal information available'
          }
        } else {
          content = 'Invalid response format from Smart Chef AI'
        }
        break

      default:
        content = (response as any)?.reply || (response as any)?.content || 'No response from AI model'
        break
    }

    return { content }
  } catch (error) {
    console.error(`Error calling ${modelId} model:`, error)
    return {
      content: '',
      error: `Failed to get response from ${model.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}
