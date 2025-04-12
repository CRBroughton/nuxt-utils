# TypeSafeZodForm.vue
<script setup lang="ts">
import { z } from 'zod'

// Define your form schema using Zod
const userFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),

  email: z.string()
    .email('Please enter a valid email address'),

  age: z.number()
    .int('Age must be a whole number')
    .min(18, 'You must be at least 18 years old')
    .max(120, 'Age must be less than 120'),

  preferences: z.object({
    newsletter: z.boolean(),
    theme: z.enum(['light', 'dark', 'system'], {
      errorMap: () => ({ message: 'Please select a valid theme' }),
    }),
  }),
})

// Define your form's data type from the schema
type UserFormData = z.infer<typeof userFormSchema>

// Form initial values
const initialValues = ref<UserFormData>({
  name: '',
  email: '',
  age: 30,
  preferences: {
    newsletter: false,
    theme: 'system',
  },
})

// Success and error messages
const successMessage = ref('')
const errorMessage = ref('')

// Use our form composable
const {
  result,
  values,
  errors,
  isSubmitting,
  touched,
  submitted,
  submitForm,
  fieldBinder,
  // updateValues,
  resetForm,
  shouldShowError,
  getFieldError,
} = useForm({
  initialValues: initialValues.value,
  schema: userFormSchema,

  // Optional transform before submission
  transform: values => ({
    ...values,
    name: values.name.trim(), // Example transformation
  }),

  // Submit handler - would normally call an API
  onSubmit: async (values) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // For demo purposes, let's say email must be unique
    if (values.email === 'taken@example.com') {
      throw new Error('This email is already taken')
    }

    return {
      id: Math.random().toString(36).substring(2, 9),
      ...values,
      createdAt: new Date().toISOString(),
    }
  },

  // Success handler
  onSuccess: (result) => {
    successMessage.value = `User ${result.name} created successfully!`
    errorMessage.value = ''
  },

  // Validation error handler
  onValidationError: (formErrors) => {
    console.log(formErrors)
    errorMessage.value = 'Please fix the validation errors'
    successMessage.value = ''
  },

  // Submission error handler
  onError: (error) => {
    errorMessage.value = error instanceof Error
      ? error.message
      : 'An unknown error occurred'
    successMessage.value = ''
  },
})

// Create reactive refs for each field using the fieldBinder
// All these are now fully type-safe
const name = fieldBinder('name')
const email = fieldBinder('email')
const age = fieldBinder('age')
const newsletter = fieldBinder('preferences.newsletter')
const theme = fieldBinder('preferences.theme')

// Handler for form submission
const handleSubmit = async () => {
  successMessage.value = ''
  errorMessage.value = ''

  try {
    await submitForm()
  }
  catch (error) {
    // Errors are already handled by callbacks
    console.error('Form submission failed')
  }
}

// onMounted(() => {
//   updateValues({
//     name: 'asdd',
//     email: '',
//     age: 'asd',
//     preferences: {
//       newsletter: false,
//       theme: 'system',
//     },
//   })
// })
</script>

<template>
  <div class="form-container">
    {{ result }}
    {{ values }}
    <h2>User Registration</h2>

    <!-- Success/error messages -->
    <div
      v-if="successMessage"
      class="alert alert-success"
    >
      {{ successMessage }}
    </div>
    <div
      v-if="errorMessage"
      class="alert alert-error"
    >
      {{ errorMessage }}
    </div>

    <!-- Form -->
    <form
      class="user-form"
      @submit.prevent="handleSubmit"
    >
      <!-- Name field - simplified v-model -->
      <div
        class="form-group"
        :class="{ 'has-error': shouldShowError('name') }"
      >
        <label for="name">Name</label>
        <input
          id="name"
          v-model="name"
          :class="{ error: shouldShowError('name') }"
          type="text"
          placeholder="Enter your name"
        >
        <div
          v-if="shouldShowError('name')"
          class="error-message"
        >
          {{ getFieldError('name') }}
        </div>
      </div>

      <!-- Email field - simplified v-model -->
      <div
        class="form-group"
        :class="{ 'has-error': shouldShowError('email') }"
      >
        <label for="email">Email</label>
        <input
          id="email"
          v-model="email"
          :class="{ error: shouldShowError('email') }"
          type="email"
          placeholder="Enter your email"
        >
        <div
          v-if="shouldShowError('email')"
          class="error-message"
        >
          {{ getFieldError('email') }}
        </div>
        <div class="field-hint">
          Try entering "taken@example.com" to see error handling
        </div>
      </div>

      <!-- Age field - simplified v-model -->
      <div
        class="form-group"
        :class="{ 'has-error': shouldShowError('age') }"
      >
        <label for="age">Age</label>
        <input
          id="age"
          v-model="age"
          :class="{ error: shouldShowError('age') }"
          type="number"
          placeholder="Enter your age"
        >
        <div
          v-if="shouldShowError('age')"
          class="error-message"
        >
          {{ getFieldError('age') }}
        </div>
      </div>

      <!-- Preferences section -->
      <fieldset class="preferences-section">
        <legend>Preferences</legend>

        <!-- Newsletter checkbox - simplified v-model -->
        <div class="form-group checkbox-group">
          <input
            id="newsletter"
            v-model="newsletter"
            type="checkbox"
          >
          <label for="newsletter">Subscribe to newsletter</label>
        </div>

        <!-- Theme selection - simplified v-model -->
        <div
          class="form-group"
          :class="{ 'has-error': shouldShowError('preferences.theme') }"
        >
          <label for="theme">Theme</label>
          <select
            id="theme"
            v-model="theme"
          >
            <option value="light">
              Light
            </option>
            <option value="dark">
              Dark
            </option>
            <option value="system">
              System Default
            </option>
          </select>
          <div
            v-if="shouldShowError('preferences.theme')"
            class="error-message"
          >
            {{ getFieldError('preferences.theme') }}
          </div>
        </div>
      </fieldset>

      <!-- Form actions -->
      <div class="form-actions">
        <button
          type="button"
          :disabled="isSubmitting"
          @click="resetForm"
        >
          Reset
        </button>
        <button
          type="submit"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Submitting...' : 'Submit' }}
        </button>
      </div>

      <DevOnly>
        <details
          class="debug-panel"
        >
          <summary>Form State</summary>
          <pre>{{ {
            touched,
            errors,
            isSubmitting,
            submitted,
          } }}</pre>
        </details>
      </DevOnly>
    </form>
  </div>
</template>

<style scoped>
.form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
  text-align: center;
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.user-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.form-group input.error,
.form-group select.error {
  border-color: #dc3545;
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-group input {
  margin: 0;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
}

.field-hint {
  color: #666;
  font-size: 0.8rem;
  font-style: italic;
}

.preferences-section {
  border: 1px solid #e1e1e1;
  padding: 1.5rem;
  border-radius: 4px;
  background-color: white;
}

.preferences-section legend {
  padding: 0 0.5rem;
  font-weight: 500;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

button {
  padding: 0.6rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

button[type="submit"] {
  background-color: #4a90e2;
  color: white;
}

button[type="submit"]:hover:not(:disabled) {
  background-color: #3a7bc8;
}

button[type="button"] {
  background-color: #e1e1e1;
  color: #333;
}

button[type="button"]:hover:not(:disabled) {
  background-color: #d1d1d1;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.has-error label {
  color: #dc3545;
}

.debug-panel {
  margin-top: 2rem;
  border-top: 1px solid #e1e1e1;
  padding-top: 1rem;
}

.debug-panel summary {
  cursor: pointer;
  color: #666;
  font-weight: 500;
}

.debug-panel pre {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  overflow: auto;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}
</style>
