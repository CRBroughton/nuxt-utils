import { ref, watch, type Ref } from 'vue'
import type { z } from 'zod'
import type { NestedPaths, PathValue } from './types'
import { useFormState } from './useFormState'
import { useZodValidation } from './useZodValidation'
import { useFormSubmit } from './useFormSubmit'
import { useFormQuery, type UseFormQueryOptions } from './useFormQuery'
import { getValueByPath } from './utils'

export interface UseFormOptions<T, R> {
  // Initial values for the form
  initialValues: T
  // Zod schema for validation
  schema: z.ZodType<T>
  // Function to handle form submission
  onSubmit?: (values: T) => Promise<R>
  // Optional transform function applied before submission
  transform?: (values: T) => T
  // Callback when submission is successful
  onSuccess?: (result: R) => void
  // Callback when validation errors occur
  onValidationError?: (errors: unknown) => void
  // Callback when other errors occur
  onError?: (error: unknown) => void
  // Whether to validate on field change
  validateOnChange?: boolean
  // Whether to mark fields as touched on change
  touchOnChange?: boolean
}

export function useForm<T extends Record<string, unknown>, R = unknown>(
  options: UseFormOptions<T, R>,
) {
  // Create the form state
  const formState = useFormState<T>({
    initialValues: options.initialValues,
    validateOnChange: options.validateOnChange,
    touchOnChange: options.touchOnChange,
  })

  // Create a submitted ref for validation
  const submitted = ref(false)

  // Create the validation
  const validation = useZodValidation<T>({
    values: formState.values,
    schema: options.schema,
    touched: formState.touched,
    submitted,
    onValidationError: options.onValidationError,
  })

  // Create the submission handler
  const submission = useFormSubmit<T, R>({
    values: formState.values,
    validate: validation.validate,
    onSubmit: options.onSubmit,
    transform: options.transform,
    onSuccess: options.onSuccess,
    onError: options.onError,
  })

  // Make submitted ref reactive to submission state
  watch(() => submission.submitted.value, (newValue) => {
    submitted.value = newValue
  })

  // Reset the entire form
  const resetForm = () => {
    formState.resetValues()
    validation.clearErrors()
    submission.resetSubmission()
    submitted.value = false
  }

  if (options.validateOnChange) {
    watch(() => formState.values.value, () => {
      validation.validate()
    },
    {
      deep: true,
    },
    )
  }

  // Set field value with validation
  const setFieldValue = async <P extends NestedPaths<T>>(
    path: P,
    value: PathValue<T, P>,
    validate = true,
  ) => {
    formState.setFieldValue(path, value)

    if (validate && options.validateOnChange !== false) {
      await validation.validateField(path)
    }
  }

  const updateValues = (newValues: T) => {
    // Replace the form values with new values
    formState.values.value = { ...newValues }

    // Reset touched states, etc.
    formState.touched.value = {}
  }

  return {
    // Form state
    values: formState.values,
    touched: formState.touched,
    errors: validation.errors,
    isValid: validation.isValid,

    // Submission state
    isSubmitting: submission.isSubmitting,
    successMessage: submission.successMessage,
    submitted: submission.submitted,
    submitCount: submission.submitCount,
    result: submission.result,

    // Field interaction
    setFieldValue,
    touchField: formState.touchField,
    fieldBinder: formState.fieldBinder,
    getFieldError: validation.getFieldError,
    shouldShowError: validation.shouldShowError,
    updateValues: updateValues,

    // Form actions
    validate: validation.validate,
    validateField: validation.validateField,
    submitForm: submission.submitForm,
    errorMessage: validation.errorMessage,
    resetForm,
  }
}

// Add to useForm.ts

export interface UseFormWithQueryOptions<T, R> extends UseFormOptions<T, R> {
  // Query-specific options
  queryOptions?: Omit<UseFormQueryOptions<T>, 'values' | 'updateValues'>
}

export function useFormWithQuery<T extends Record<string, unknown>, R = unknown>(
  options: UseFormWithQueryOptions<T, R>,
) {
  // If queryOptions is provided, handle URL parameters
  if (options.queryOptions) {
    // Get initial values from URL to merge with form's initial values
    const formQuery = useFormQuery<T>({
      // This is just a temporary ref for initialization
      values: ref(options.initialValues) as Ref<T>,
      ...options.queryOptions,
    })

    // Merge URL values with initial values
    const urlValues = formQuery.initialValuesFromUrl<T>()
    const mergedInitialValues = {
      ...options.initialValues,
      ...urlValues,
    }

    // Create the form with merged initial values
    const form = useForm<T, R>({
      ...options,
      initialValues: mergedInitialValues,
    })

    // Now create the real query handler with the form's values
    const query = useFormQuery<T>({
      values: form.values,
      updateValues: (newValues) => {
        // Update form values without full validation
        Object.entries(newValues).forEach(([key, value]) => {
          const path = key as NestedPaths<T>
          const currentValue = getValueByPath(form.values.value, key)

          // Only update if value changed to avoid circular updates
          if (JSON.stringify(currentValue) !== JSON.stringify(value)) {
            form.setFieldValue(path, value as PathValue<T, typeof path>, false)
          }
        })
      },
      ...options.queryOptions,
    })

    // Enhanced reset that also clears URL
    const resetFormAndQuery = () => {
      form.resetForm()
      query.clearUrlParams()
    }

    return {
      ...form,
      query,
      resetForm: resetFormAndQuery,
    }
  }

  // If no queryOptions, just return regular form
  return useForm<T, R>(options)
}
