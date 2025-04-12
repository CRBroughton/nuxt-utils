import { z } from 'zod'
import { ref, type Ref } from 'vue'
import type {
  NestedPaths,
  FormErrors,
  ValidationResult,
  ValidationOptions,
} from './types'
/**
 * Composable for Zod-based form validation
 */
export function useZodValidation<T extends Record<string, unknown>>(
  options: ValidationOptions<T>,
): ValidationResult<T> {
  const { values, schema, touched, submitted, onValidationError } = options

  const errors = ref<FormErrors<T>>({}) as Ref<FormErrors<T>>
  const errorMessage = ref('')
  const isValid = ref(true)

  // Parse Zod validation errors into a user-friendly format
  const parseValidationErrors = (error: z.ZodError): FormErrors<T> => {
    const formErrors: FormErrors<T> = {}

    error.errors.forEach((err) => {
      if (err.path.length > 0) {
        // Convert the path to a string key with dot notation
        const fieldPath = err.path.join('.') as NestedPaths<T>
        formErrors[fieldPath] = err.message
      }
    })

    return formErrors
  }

  // TODO - adjust validator to better catch
  // zod related errors and surface them

  // Validate the entire form
  const validate = async (): Promise<T> => {
    try {
      const validData = await schema.parseAsync(values.value)
      errors.value = {}
      isValid.value = true
      return validData
    }
    catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = parseValidationErrors(error)
        errors.value = validationErrors
        isValid.value = Object.keys(validationErrors).length === 0

        if (onValidationError) {
          onValidationError(validationErrors)
        }
      }
      throw error
    }
  }

  // Validate a specific field
  const validateField = async <P extends NestedPaths<T>>(path: P): Promise<boolean> => {
    try {
      // Validate the whole form
      await schema.parseAsync(values.value)

      // If we get here, this field is valid
      if (path in errors.value) {
        const newErrors = Object.fromEntries(
          Object.entries(errors.value).filter(([key]) => key !== path),
        ) as FormErrors<T>

        errors.value = newErrors
      }

      isValid.value = Object.keys(errors.value).length === 0
      return true
    }
    catch (error) {
      if (error instanceof z.ZodError) {
        // Filter errors related to this field
        const relevantErrors = error.errors.filter((err) => {
          const errorPath = err.path.join('.')
          return errorPath === path || errorPath.startsWith(`${path}.`)
        })

        if (relevantErrors.length > 0) {
          const validationErrors = parseValidationErrors(
            new z.ZodError(relevantErrors),
          )

          // Update errors, preserving other errors
          errors.value = {
            ...errors.value,
            ...validationErrors,
          }
        }
        else if (path in errors.value) {
          // Clear error for this field if it's now valid
          const { [path]: _, ...newErrors } = errors.value
          errors.value = newErrors as FormErrors<T>
        }
      }

      isValid.value = Object.keys(errors.value).length === 0
      return !(path in errors.value)
    }
  }

  // Get error for a specific field
  const getFieldError = <P extends NestedPaths<T>>(path: P): string | undefined => {
    return errors.value[path]
  }

  // Clear all errors
  const clearErrors = () => {
    errors.value = {}
    isValid.value = true
  }

  // Helper to determine if a field should show error message
  const shouldShowError = <P extends NestedPaths<T>>(path: P): boolean => {
    return !!errors.value[path] && (!!touched.value[path] || submitted.value)
  }

  return {
    errors,
    errorMessage,
    isValid,
    validate,
    validateField,
    getFieldError,
    clearErrors,
    shouldShowError,
  }
}
