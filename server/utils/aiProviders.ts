// utils/aiProviders.ts
import { LanguageModelV1 } from 'ai'
import { callAIModel } from './aiModels' // Your existing AI model utility

export function createCustomProvider(config: {
  baseURL?: string
  apiKey?: string
  // Add other config options as needed
}) {
  return function createModel(modelId: string): LanguageModelV1 {
    return {
      specificationVersion: 'v1',
      provider: 'custom',
      modelId,

      async doGenerate(options) {
        try {
          // Convert AI SDK messages format to your callAIModel format
          const conversationHistory = options.prompt.messages.slice(0, -1).map(msg => ({
            role: msg.role,
            content: typeof msg.content === 'string' ? msg.content : msg.content.map(c => c.text).join(' ')
          }))

          const lastMessage = options.prompt.messages[options.prompt.messages.length - 1]
          const userMessage = typeof lastMessage.content === 'string'
            ? lastMessage.content
            : lastMessage.content.map(c => c.text).join(' ')

          const response = await callAIModel(modelId, userMessage, conversationHistory)

          if (response.error) {
            throw new Error(response.error)
          }

          const text = response.content || 'I apologize, but I could not generate a response.'

          return {
            text,
            finishReason: 'stop' as const,
            usage: {
              promptTokens: 0, // You can calculate or estimate these if needed
              completionTokens: 0,
            }
          }
        } catch (error) {
          throw new Error(`Custom AI model error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      },

      async doStream(options) {
        // For streaming, you might need to adapt this based on whether your callAIModel supports streaming
        // If not, you can simulate streaming by chunking the complete response
        try {
          const result = await this.doGenerate(options)

          // Simulate streaming by yielding the text in chunks
          const words = result.text.split(' ')
          const chunks: any[] = []

          for (let i = 0; i < words.length; i++) {
            const word = words[i] + (i < words.length - 1 ? ' ' : '')
            chunks.push({
              type: 'text-delta',
              textDelta: word
            })
          }

          chunks.push({
            type: 'finish',
            finishReason: 'stop' as const,
            usage: result.usage
          })

          return {
            stream: (async function* () {
              for (const chunk of chunks) {
                yield chunk
                // Add small delay to simulate streaming
                await new Promise(resolve => setTimeout(resolve, 50))
              }
            })(),
            rawCall: { rawPrompt: null, rawSettings: {} }
          }
        } catch (error) {
          throw new Error(`Custom AI streaming error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
    }
  }
}
