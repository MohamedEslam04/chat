<script setup lang="ts">
const { model, models } = useLLM()
</script>

<template>
  <USelectMenu
    v-model="model"
    :items="models"
    variant="ghost"
    class="hover:bg-default focus:bg-default data-[state=open]:bg-default"
    :ui="{
      trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
    }"
  >
    <template #item-label="{ item }">
      <UTooltip :text="item" arrow :content="{ side: 'left' }">
        <span class="text-xs text-default-foreground truncate">
          {{ item === 'custom-ai-model' ? 'Custom AI Model' : item }}
        </span>
      </UTooltip>
    </template>
  </USelectMenu>
</template>
