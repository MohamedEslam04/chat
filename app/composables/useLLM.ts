export function useLLM() {
  const { data: modelsData } = useFetch('/api/ai-models', {
    key: 'ai-models',
    default: () => ({ models: [] })
  })

  const models = computed(() =>
    modelsData.value?.models?.map(model => model.id) || []
  )

  const modelNames = computed(() =>
    modelsData.value?.models?.reduce((acc, model) => {
      acc[model.id] = model.name
      return acc
    }, {} as Record<string, string>) || {}
  )

  const model = useCookie<string>('llm-model', {
    default: () => models.value[0] || 'custom'
  })

  // Update model if current selection is not available
  watch(models, (newModels) => {
    if (newModels.length > 0 && !newModels.includes(model.value)) {
      model.value = newModels[0]
    }
  }, { immediate: true })

  return {
    models,
    modelNames,
    model
  }
}
