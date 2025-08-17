<script setup lang="ts">
const { model, models, modelNames } = useLLM()

const modelOptions = computed(() =>
  models.value.map(modelId => ({
    value: modelId,
    label: modelNames.value[modelId] || modelId
  }))
)
</script>

<template>
  <USelectMenu v-model="model" value-key="value" label-key="label" :items="modelOptions" variant="ghost"
    class="hover:bg-default focus:bg-default data-[state=open]:bg-default" :ui="{
      trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
    }">
    <template #item-label="{ item }">
      <UTooltip :text="item.label" arrow :content="{ side: 'left' }">
        <span class="text-xs text-default-foreground truncate">
          {{ item.label }}
        </span>
      </UTooltip>
    </template>
  </USelectMenu>
</template>
