export function useLLM() {
  const models = [
    '@atw/pintest',
    '@hf/thebloke/deepseek-coder-6.7b-instruct-awq'
  ]
  const model = useCookie<string>('llm-model', { default: () => '@cf/meta/llama-3.2-3b-instruct' })

  return {
    models,
    model
  }
}
