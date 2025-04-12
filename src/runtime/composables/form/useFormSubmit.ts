// composables/form/useFormSubmit.ts
import { ref, type Ref } from 'vue'
import type {
  FormSubmission,
  FormSubmitOptions,
} from './types'

/**
 * Composable for form submission handling
 */
export function useFormSubmit<T extends Record<string, unknown>, R = unknown>(
  options: FormSubmitOptions<T, R>,
): FormSubmission<R> {
  const { validate, onSubmit, transform, onSuccess, onError } = options

  const isSubmitting = ref(false)
  const submitted = ref(false)
  const submitCount = ref(0)
  const result = ref<R | null>(null) as Ref<R | null>

  // Transform values before submission
  const transformValues = (data: T): T => {
    if (transform) {
      return transform(data)
    }
    return data
  }

  // Submit the form
  const submitForm = async (): Promise<R | undefined> => {
    isSubmitting.value = true
    submitted.value = true
    submitCount.value++

    try {
      // Validate form data
      const validData = await validate()

      // Transform data if needed
      const transformedData = transformValues(validData)

      // Submit the data if handler is provided
      if (onSubmit) {
        try {
          const submissionResult = await onSubmit(transformedData)
          result.value = submissionResult

          if (onSuccess) {
            onSuccess(submissionResult)
          }

          return submissionResult
        }
        catch (error) {
          if (onError) {
            onError(error)
          }
          throw error
        }
      }
    }
    catch (error) {
      if (onError) {
        onError(error)
      }
      throw error
    }
    finally {
      isSubmitting.value = false
    }
  }

  // Reset submission state
  const resetSubmission = () => {
    isSubmitting.value = false
    submitted.value = false
    submitCount.value = 0
    result.value = null
  }

  return {
    isSubmitting,
    submitted,
    submitCount,
    result,
    submitForm,
    resetSubmission,
  }
}
