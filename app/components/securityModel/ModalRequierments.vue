<template>
  <!-- Modal Overlay -->
  <UDrawer
    v-model:open="isFirstOpen"
    should-scale-background
    set-background-color-on-scale
    inset
    side="top"
    :ui="{ footer: 'justify-end' }"
  >
    <UButton label="Open" color="neutral" variant="subtle" />
    <template #body>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
        <UDrawer
          v-model:open="isSecondOpen"
          nested
          inset
          :ui="{ content: 'h-full', overlay: 'bg-inverted/30' }"
        >
          <UPageCard
            title="Tailwind CSS"
            description="Nuxt UI v3 integrates with latest Tailwind CSS v4, bringing significant improvements."
            icon="i-simple-icons-tailwindcss"
            orientation="horizontal"
            spotlight
            spotlight-color="primary"
          />
          <!-- <img src="/tailwindcss-v4.svg" alt="Tailwind CSS" class="w-full" /> -->
          <!-- </UPageCard> -->
          <template #body>
            <UCard class="divide-y-0">
              <template #header>
                <div class="flex items-center justify-between">
                  <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                    Setup Configuration
                  </h3>
                </div>
              </template>

              <div class="space-y-6">
                <!-- Option Selection -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Choose an option
                  </label>
                  <URadioGroup
                    v-model="selectedOption"
                    :options="optionChoices"
                    :ui-radio="{ wrapper: 'flex items-center h-4 w-4' }"
                  />
                </div>

                <!-- Free Models Form -->
                <div v-if="selectedOption === 'free'" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Models
                    </label>
                    <div class="grid grid-cols-2 gap-2">
                      <UCheckbox
                        v-for="model in freeModels"
                        :key="model.value"
                        v-model="selectedModels"
                        :value="model.value"
                        :label="model.label"
                      />
                    </div>
                    <p v-if="modelError" class="text-sm text-red-500 mt-1">
                      Please select at least one model
                    </p>
                  </div>

                  <UFormField label="Target Domain" required>
                    <UInput
                      v-model="freeFormData.targetDomain"
                      placeholder="Enter target domain"
                      :error="domainError"
                    />
                  </UFormField>
                </div>

                <!-- OpenAI Form -->
                <div v-if="selectedOption === 'openai'" class="space-y-4">
                  <UFormField label="Target Domain" required>
                    <UInput
                      v-model="openAIFormData.targetDomain"
                      placeholder="Enter target domain"
                      :error="domainError"
                    />
                  </UFormField>

                  <UFormField label="Task Name" required>
                    <UInput v-model="openAIFormData.taskName" placeholder="Enter task name" :error="taskNameError" />
                  </UFormField>

                  <UFormField label="Description" required>
                    <UTextarea
                      v-model="openAIFormData.description"
                      placeholder="Enter description"
                      :rows="3"
                      :error="descriptionError"
                    />
                  </UFormField>
                </div>
              </div>

              <template #footer>
                <div class="flex justify-end space-x-3">
                  <UButton color="gray" variant="soft" @click="isOpen = false">
                    Cancel
                  </UButton>
                  <UButton
                    color="primary"
                    :loading="isSubmitting"
                    :disabled="!selectedOption"
                    @click="handleSubmit"
                  >
                    Submit
                  </UButton>
                </div>
              </template>
            </UCard>
          </template>
        </UDrawer>
        <UDrawer
          v-model:open="isSecondOpen"
          nested
          inset
          :ui="{ content: 'h-full', overlay: 'bg-inverted/30' }"
        >
          <UPageCard
            title="Tailwind CSS"
            description="Nuxt UI v3 integrates with latest Tailwind CSS v4, bringing significant improvements."
            icon="i-simple-icons-tailwindcss"
            orientation="horizontal"
            spotlight
            spotlight-color="primary"
          />
          <template #body>
            <UCard class="divide-y-0">
              <template #header>
                <div class="flex items-center justify-between">
                  <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                    Setup Configuration
                  </h3>
                </div>
              </template>

              <div class="space-y-6">
                <!-- Option Selection -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Choose an option
                  </label>
                  <URadioGroup
                    v-model="selectedOption"
                    :options="optionChoices"
                    :ui-radio="{ wrapper: 'flex items-center h-4 w-4' }"
                  />
                </div>

                <!-- Free Models Form -->
                <div v-if="selectedOption === 'free'" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Models
                    </label>
                    <div class="grid grid-cols-2 gap-2">
                      <UCheckbox
                        v-for="model in freeModels"
                        :key="model.value"
                        v-model="selectedModels"
                        :value="model.value"
                        :label="model.label"
                      />
                    </div>
                    <p v-if="modelError" class="text-sm text-red-500 mt-1">
                      Please select at least one model
                    </p>
                  </div>

                  <UFormField label="Target Domain" required>
                    <UInput
                      v-model="freeFormData.targetDomain"
                      placeholder="Enter target domain"
                      :error="domainError"
                    />
                  </UFormField>
                </div>

                <!-- OpenAI Form -->
                <div v-if="selectedOption === 'openai'" class="space-y-4">
                  <UFormField label="Target Domain" required>
                    <UInput
                      v-model="openAIFormData.targetDomain"
                      placeholder="Enter target domain"
                      :error="domainError"
                    />
                  </UFormField>

                  <UFormField label="Task Name" required>
                    <UInput v-model="openAIFormData.taskName" placeholder="Enter task name" :error="taskNameError" />
                  </UFormField>

                  <UFormField label="Description" required>
                    <UTextarea
                      v-model="openAIFormData.description"
                      placeholder="Enter description"
                      :rows="3"
                      :error="descriptionError"
                    />
                  </UFormField>
                </div>
              </div>

              <template #footer>
                <div class="flex justify-end space-x-3">
                  <UButton color="gray" variant="soft" @click="isOpen = false">
                    Cancel
                  </UButton>
                  <UButton
                    color="primary"
                    :loading="isSubmitting"
                    :disabled="!selectedOption"
                    @click="handleSubmit"
                  >
                    Submit
                  </UButton>
                </div>
              </template>
            </UCard>
          </template>
        </UDrawer>
      </div>
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'

// Modal state
const isFirstOpen = ref(false)
const isSecondOpen = ref(false)
const isSubmitting = ref(false)

// Form state
const selectedOption = ref('')
const selectedModels = ref([])

// Form data
const freeFormData = reactive({
  targetDomain: ''
})

const openAIFormData = reactive({
  targetDomain: '',
  taskName: '',
  description: ''
})

// Options for radio buttons
const optionChoices = [
  { value: 'free', label: 'Free Models' },
  { value: 'openai', label: 'OpenAI' }
]

// Free models data (will be populated from API)
const freeModels = ref([])

// Validation errors
const domainError = ref('')
const modelError = ref('')
const taskNameError = ref('')
const descriptionError = ref('')

// Fetch free models from API
const fetchFreeModels = async () => {
  try {
    // Replace with your actual API endpoint
    const response = await $fetch('/api/free-models')
    freeModels.value = response.models || [
      // Fallback data if API is not available
      { value: 'model1', label: 'Model 1' },
      { value: 'model2', label: 'Model 2' },
      { value: 'model3', label: 'Model 3' },
      { value: 'model4', label: 'Model 4' },
      { value: 'model5', label: 'Model 5' },
      { value: 'model6', label: 'Model 6' }
    ]
  } catch (error) {
    console.error('Failed to fetch free models:', error)
    // Use fallback data
    freeModels.value = [
      { value: 'model1', label: 'Model 1' },
      { value: 'model2', label: 'Model 2' },
      { value: 'model3', label: 'Model 3' },
      { value: 'model4', label: 'Model 4' },
      { value: 'model5', label: 'Model 5' },
      { value: 'model6', label: 'Model 6' }
    ]
  }
}

// Clear form data when option changes
watch(selectedOption, (newValue) => {
  clearValidationErrors()
  if (newValue === 'free') {
    selectedModels.value = []
    freeFormData.targetDomain = ''
  } else if (newValue === 'openai') {
    openAIFormData.targetDomain = ''
    openAIFormData.taskName = ''
    openAIFormData.description = ''
  }
})

// Clear validation errors
const clearValidationErrors = () => {
  domainError.value = ''
  modelError.value = ''
  taskNameError.value = ''
  descriptionError.value = ''
}

// Validate form
const validateForm = () => {
  clearValidationErrors()
  let isValid = true

  if (selectedOption.value === 'free') {
    if (!freeFormData.targetDomain.trim()) {
      domainError.value = 'Target domain is required'
      isValid = false
    }
    if (selectedModels.value.length === 0) {
      modelError.value = 'Please select at least one model'
      isValid = false
    }
  } else if (selectedOption.value === 'openai') {
    if (!openAIFormData.targetDomain.trim()) {
      domainError.value = 'Target domain is required'
      isValid = false
    }
    if (!openAIFormData.taskName.trim()) {
      taskNameError.value = 'Task name is required'
      isValid = false
    }
    if (!openAIFormData.description.trim()) {
      descriptionError.value = 'Description is required'
      isValid = false
    }
  }

  return isValid
}

// Handle form submission
const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    let submitData = {}

    if (selectedOption.value === 'free') {
      submitData = {
        type: 'free',
        targetDomain: freeFormData.targetDomain,
        selectedModels: selectedModels.value
      }
    } else if (selectedOption.value === 'openai') {
      submitData = {
        type: 'openai',
        targetDomain: openAIFormData.targetDomain,
        taskName: openAIFormData.taskName,
        description: openAIFormData.description
      }
    }

    // Submit to your API
    // await $fetch('/api/submit-form', {
    //   method: 'POST',
    //   body: submitData
    // })

    console.log('Form submitted:', submitData)

    // Close modal and navigate to home page
    isFirstOpen.value = false
    await navigateTo('/')
  } catch (error) {
    console.error('Submission failed:', error)
    // Handle error (show toast notification, etc.)
  } finally {
    isSubmitting.value = false
  }
}

// Load free models when component mounts
onMounted(() => {
  fetchFreeModels()
})
</script>

<style scoped>
/* Add any custom styles here if needed */
</style>
