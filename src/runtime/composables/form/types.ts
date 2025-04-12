import type { ComputedRef, Ref } from 'vue'
import type { z } from 'zod'

// Utility type to get all possible nested paths in an object type
export type NestedPaths<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends object
    ? { [K in keyof T]-?: K extends string | number
        ? `${K}` | Join<K, NestedPaths<T[K], Prev[D]>>
        : never
      }[keyof T]
    : ''

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
type Join<K extends string | number, P extends string> = `${K}${P extends '' ? '' : '.'}${P}`

// Get type of a value at a specific path
export type PathValue<T, P extends NestedPaths<T>> =
  P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? Rest extends NestedPaths<T[K]>
        ? PathValue<T[K], Rest>
        : never
      : never
    : P extends keyof T
      ? T[P]
      : never

// Type for form errors
export type FormErrors<T> = Partial<Record<NestedPaths<T>, string>>

// Type for touched fields
export type TouchedFields<T> = Partial<Record<NestedPaths<T>, boolean>>

// Form state interface
export interface FormState<T> {
  values: Ref<T>
  setFieldValue: <P extends NestedPaths<T>>(path: P, value: PathValue<T, P>) => void
  touchField: <P extends NestedPaths<T>>(path: P) => void
  resetValues: (newValues?: T) => void
  touched: Ref<TouchedFields<T>>
  fieldBinder: <P extends NestedPaths<T>>(path: P) => ComputedRef<PathValue<T, P>>
}

// Validation result interface
export interface ValidationResult<T> {
  errors: Ref<FormErrors<T>>
  errorMessage: Ref<string>
  isValid: Ref<boolean>
  validate: () => Promise<T>
  validateField: <P extends NestedPaths<T>>(path: P) => Promise<boolean>
  getFieldError: <P extends NestedPaths<T>>(path: P) => string | undefined
  clearErrors: () => void
  // Helper to check if a field should show error (touched or submitted)
  shouldShowError: <P extends NestedPaths<T>>(path: P) => boolean
}

// Form submission interface
export interface FormSubmission<R = unknown> {
  isSubmitting: Ref<boolean>
  successMessage: Ref<string>
  submitted: Ref<boolean>
  submitCount: Ref<number>
  result: Ref<R | null>
  submitForm: () => Promise<R | undefined>
  resetSubmission: () => void
}

// Submission options
export interface FormSubmitOptions<T, R> {
  values: Ref<T>
  validate: () => Promise<T>
  onSubmit?: (values: T) => Promise<R>
  transform?: (values: T) => T
  onSuccess?: (result: R) => void
  onError?: (error: unknown) => void
}

// Validation options
export interface ValidationOptions<T> {
  values: Ref<T>
  schema: z.ZodType<T>
  touched: Ref<TouchedFields<T>>
  submitted: Ref<boolean>
  onValidationError?: (errors: FormErrors<T>) => void
}

// Form state options
export interface FormStateOptions<T> {
  initialValues: T
  validateOnChange?: boolean
  touchOnChange?: boolean
}
