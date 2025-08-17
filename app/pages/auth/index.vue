<script setup lang="ts">
import type { FormSubmitEvent } from '@eslamdevui/ui'
import * as z from 'zod'

definePageMeta({
  layout: 'auth'
})

const toast = useToast()
const router = useRouter()
const loading = ref(false)

const fields = [
  {
    name: 'email',
    type: 'text' as const,
    label: 'Email',
    placeholder: 'Enter your email',
    required: true
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password' as const,
    placeholder: 'Enter your password',
    required: true
  }
]

const providers = [
  {
    label: 'GitHub',
    icon: 'i-simple-icons-github',
    onClick: () => {
      toast.add({ title: 'GitHub', description: 'Login with GitHub' })
    }
  }
]

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Must be at least 8 characters')
})

type Schema = z.output<typeof schema>

async function onSubmit({ data }: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    const res = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email: data.email,
        password: data.password
      }
    })
    if (res.success) {
      toast.add({ title: 'Success', description: 'Logged in successfully', color: 'success' })
      router.push('/')
    } else {
      toast.add({ title: 'Error', description: res.message || 'Login failed', color: 'error' })
    }
  } catch (err: any) {
    toast.add({ title: 'Error', description: err?.data?.message || 'Login failed', color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm :schema="schema" title="Login" description="Enter your credentials to access your account."
        icon="i-lucide-user" :fields="fields" :providers="providers" :loading="loading" @submit="onSubmit" />
      <div class="mt-4 text-center text-sm">
        <span>Don't have an account?</span>
        <NuxtLink to="/auth/signup" class="text-primary font-medium ml-1">Sign up</NuxtLink>
      </div>
    </UPageCard>
  </div>
</template>
