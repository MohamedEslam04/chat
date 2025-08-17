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

  // Cancer Chat
  if (config.ai?.cancerChat?.enabled) {
    models.push({
      id: 'cancerChat',
      name: config.ai.cancerChat.name || 'Cancer Chat',
      enabled: true,
      apiKey: config.ai.cancerChat.apiKey,
      baseUrl: config.ai.cancerChat.baseUrl,
      endpoint: config.ai.cancerChat.endpoint,
      method: config.ai.cancerChat.method || 'POST'
    })
  }

  // AI Pentest
  if (config.ai?.aiPentest?.enabled) {
    models.push({
      id: 'aiPentest',
      name: config.ai.aiPentest.name || 'AI Pentest',
      enabled: true,
      apiKey: config.ai.aiPentest.apiKey,
      baseUrl: config.ai.aiPentest.baseUrl,
      endpoint: config.ai.aiPentest.endpoint,
      method: config.ai.aiPentest.method || 'POST'
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
      case 'cancerChat':
        requestBody = {
          message: message
        }
        break

      case 'aiPentest':
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
      case 'cancerChat':
        content = (response as any)?.reply || 'No response from cancerChat AI'
        break

      case 'aiPentest':
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
