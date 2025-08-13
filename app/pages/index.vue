<script setup lang="ts">
const input = ref('')
const loading = ref(false)

const { model } = useLLM()

async function createChat(prompt: string) {
  input.value = prompt
  loading.value = true
  const chat = await $fetch('/api/chats', {
    method: 'POST',
    body: { input: prompt }
  })

  refreshNuxtData('chats')
  navigateTo(`/chat/${chat.id}`)
}

function onSubmit() {
  createChat(input.value)
}

const quickChats = [
  {
    label: 'Tell me about artificial intelligence',
    icon: 'i-lucide-brain'
  },
  {
    label: 'Explain machine learning concepts',
    icon: 'i-lucide-cpu'
  },
  {
    label: 'How does natural language processing work?',
    icon: 'i-lucide-message-square'
  },
  {
    label: 'What are neural networks?',
    icon: 'i-lucide-network'
  },
  {
    label: 'Explain deep learning algorithms',
    icon: 'i-lucide-layers'
  }
]
</script>

<template>
  <UDashboardPanel id="home" :ui="{ body: 'p-0 sm:p-0' }">
    <template #header>
      <DashboardNavbar />
    </template>

    <template #body>
      <UContainer class="flex-1 flex flex-col justify-center gap-4 sm:gap-6 py-8">
        <h1 class="text-3xl sm:text-4xl text-highlighted font-bold">
          How can I help you today?
        </h1>

        <UChatPrompt
          v-model="input"
          :status="loading ? 'streaming' : 'ready'"
          class="[view-transition-name:chat-prompt]"
          variant="subtle"
          @submit="onSubmit"
        >
          <UChatPromptSubmit color="neutral" />

          <template #footer>
            <ModelSelect v-model="model" />
          </template>
        </UChatPrompt>

        <div class="flex flex-wrap gap-2">
          <UButton
            v-for="quickChat in quickChats"
            :key="quickChat.label"
            :icon="quickChat.icon"
            :label="quickChat.label"
            size="sm"
            color="neutral"
            variant="outline"
            class="rounded-full"
            @click="createChat(quickChat.label)"
          />
        </div>
        <SecurityModelModalRequierments />
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
