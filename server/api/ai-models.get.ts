export default defineEventHandler(async () => {
  const models = getEnabledAIModels()

  return {
    models: models.map(model => ({
      id: model.id,
      name: model.name,
      enabled: model.enabled
    }))
  }
})
