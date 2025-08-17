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
  },
  {
    name: 'confirmPassword',
    label: 'Confirm Password',
    type: 'password' as const,
    placeholder: 'Confirm your password',
    required: true
  }
]

const providers = [
  {
    label: 'GitHub',
    icon: 'i-simple-icons-github',
    onClick: () => {
      toast.add({ title: 'GitHub', description: 'Sign up with GitHub' })
    }
  }
]

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Must be at least 8 characters')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
})

type Schema = z.output<typeof schema>

async function onSubmit({ data }: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    const res = await $fetch('/api/auth/signup', {
      method: 'POST',
      body: {
        email: data.email,
        password: data.password
      }
    })
    if (res.success) {
      toast.add({ title: 'Success', description: 'Account created successfully', color: 'success' })
      router.push('/auth')
    } else {
      toast.add({ title: 'Error', description: res.message || 'Sign up failed', color: 'error' })
    }
  } catch (err: any) {
    toast.add({ title: 'Error', description: err?.data?.message || 'Sign up failed', color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm :schema="schema" title="Sign Up" description="Create a new account to get started."
        icon="i-lucide-user-plus" :fields="fields" :providers="providers" :loading="loading" @submit="onSubmit" />
      <div class="mt-4 text-center text-sm">
        <span>Already have an account?</span>
        <NuxtLink to="/auth" class="text-primary font-medium ml-1">Login</NuxtLink>
      </div>
    </UPageCard>
  </div>
</template>

<style></style>
