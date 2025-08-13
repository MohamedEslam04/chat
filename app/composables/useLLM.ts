export function useLLM() {
  const models = [
    'custom-ai-model'
  ]
  const model = useCookie<string>('llm-model', { default: () => 'custom-ai-model' })

  return {
    models,
    model
  }
}
