<script setup lang="ts">
import { LazyModalConfirm } from '#components'

// Composables
const route = useRoute()
const toast = useToast()
const overlay = useOverlay()
const { loggedIn, openInPopup } = useUserSession()

// Reactive state
const open = ref(false)

// Modal configuration
const deleteModal = overlay.create(LazyModalConfirm, {
  props: {
    title: 'Delete chat',
    description: 'Are you sure you want to delete this chat? This cannot be undone.'
  }
})

// Fetch chats with optimized transform and error handling
const { data: chats, refresh: refreshChats, pending: chatsPending, error: chatsError } = await useFetch('/api/chats', {
  key: 'chats',
  transform: (data) => data.map(chat => ({
    id: chat.id,
    label: chat.title || 'Untitled',
    to: `/chat/${chat.id}`,
    icon: 'i-lucide-message-circle',
    createdAt: chat.createdAt
  }))
})

// Intelligent prefetching for better UX
onNuxtReady(async () => {
  // Only prefetch if user is logged in and has chats
  if (!loggedIn.value || !chats.value?.length) return

  const first5 = chats.value.slice(0, 5) // Reduced to 5 for better performance
  try {
    // Use Promise.allSettled to handle individual failures gracefully
    await Promise.allSettled(
      first5.map(chat => $fetch(`/api/chats/${chat.id}`))
    )
  } catch (error) {
    // Silently fail prefetching - it's not critical
    console.debug('Prefetch failed:', error)
  }
})

// Watch for login state changes
watch(loggedIn, () => {
  refreshChats()
  open.value = false
})

// Chat groups
const { groups } = useChats(chats)

// Computed navigation items with memoization
const items = computed(() => {
  if (!groups.value) return []

  return groups.value.flatMap((group) => [
    {
      label: group.label,
      type: 'label' as const
    },
    ...group.items.map(item => ({
      ...item,
      slot: 'chat' as const,
      icon: undefined,
      class: item.label === 'Untitled' ? 'text-muted' : ''
    }))
  ])
})

// Computed search groups for better performance
const searchGroups = computed(() => [
  {
    id: 'links',
    items: [{
      label: 'New chat',
      to: '/',
      icon: 'i-lucide-square-pen'
    }]
  },
  ...(groups.value || [])
])

// Chat deletion handler
async function deleteChat(id: string) {
  const instance = deleteModal.open()
  const result = await instance.result

  if (!result) return

  try {
    await $fetch(`/api/chats/${id}`, { method: 'DELETE' })

    toast.add({
      title: 'Chat deleted',
      description: 'Your chat has been deleted',
      icon: 'i-lucide-trash'
    })

    refreshChats()

    // Navigate away if current chat was deleted
    if (route.params.id === id) {
      navigateTo('/')
    }
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to delete chat',
      icon: 'i-lucide-alert-circle',
      color: 'error'
    })
  }
}

// Keyboard shortcuts
defineShortcuts({
  c: () => navigateTo('/'),
  'ctrl+r': () => refreshChats(),
  'cmd+r': () => refreshChats()
})
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar id="default" v-model:open="open" :min-size="12" collapsible resizable class="bg-elevated/50">
      <template #header="{ collapsed }">
        <Logo class="h-10 top-4 left-4 w-auto shrink-0" />
        <div v-if="!collapsed" class="flex items-center gap-1.5 ms-auto">

          <UDashboardSearchButton collapsed />
          <UDashboardSidebarCollapse />
        </div>
      </template>

      <template #default="{ collapsed }">
        <div class="flex flex-col gap-1.5">
          <UButton v-bind="collapsed ? { icon: 'i-lucide-plus' } : { label: 'New chat' }" variant="soft" block to="/"
            @click="open = false" />

          <template v-if="collapsed">
            <UDashboardSearchButton collapsed />
            <UDashboardSidebarCollapse />
          </template>
        </div>

        <!-- Loading state -->
        <div v-if="chatsPending" class="flex items-center justify-center py-8">
          <UIcon name="i-lucide-loader-2" class="animate-spin text-muted" />
        </div>

        <!-- Error state -->
        <div v-else-if="chatsError" class="flex flex-col items-center justify-center py-8 text-center">
          <UIcon name="i-lucide-alert-circle" class="text-red-500 mb-2" />
          <p class="text-sm text-muted">Failed to load chats</p>
          <UButton variant="ghost" size="sm" @click="() => refreshChats()" class="mt-2">
            Retry
          </UButton>
        </div>

        <!-- Navigation menu -->
        <UNavigationMenu v-else-if="!collapsed && items.length > 0" :items="items" :collapsed="collapsed"
          orientation="vertical" :ui="{ link: 'overflow-hidden' }">
          <template #chat-trailing="{ item }">
            <div class="flex -mr-1.25 translate-x-full group-hover:translate-x-0 transition-transform">
              <UButton icon="i-lucide-x" color="neutral" variant="ghost" size="xs"
                class="text-muted hover:text-primary hover:bg-accented/50 focus-visible:bg-accented/50 p-0.5"
                tabindex="-1" @click.stop.prevent="deleteChat((item as any).id)" />
            </div>
          </template>
        </UNavigationMenu>

        <!-- Empty state -->
        <div v-else-if="!collapsed && !chatsPending && !chatsError && items.length === 0"
          class="flex flex-col items-center justify-center py-8 text-center">
          <UIcon name="i-lucide-message-circle" class="text-muted mb-2" />
          <p class="text-sm text-muted">No chats yet</p>
          <p class="text-xs text-muted">Start a new conversation to get started</p>
        </div>
      </template>

      <template #footer="{ collapsed }">
        <UserMenu v-if="loggedIn" :collapsed="collapsed" />
        <div v-else class="flex flex-col gap-2">
          <UButton :label="collapsed ? '' : 'Login'" icon="line-md:login" color="primary" variant="soft" class="w-full"
            to="/auth" />
          <UButton :label="collapsed ? '' : 'Sign up'" icon="i-lucide-user-plus" color="neutral" variant="ghost"
            class="w-full" to="/auth/signup" />
        </div>
      </template>
    </UDashboardSidebar>

    <UDashboardSearch placeholder="Search chats..." :groups="searchGroups" />

    <slot />
  </UDashboardGroup>
</template>
