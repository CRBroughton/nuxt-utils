import { ref, type Ref } from 'vue'
import type {
  NestedPaths,
  PathValue,
  TouchedFields,
  FormState,
  FormStateOptions } from './types'
import { getValueByPath, setValueByPath } from './utils'

/**
 * Composable for managing form state
 */
export function useFormState<T extends Record<string, unknown>>(
  options: FormStateOptions<T>,
): FormState<T> {
  const values = ref(options.initialValues) as Ref<T>
  const touched = ref({}) as Ref<TouchedFields<T>>

  // Default options
  const touchOnChange = options.touchOnChange !== false

  // Set a field value by path (supports nested fields)
  const setFieldValue = <P extends NestedPaths<T>>(
    path: P,
    value: PathValue<T, P>,
  ) => {
    // Update the value using the path
    values.value = setValueByPath(values.value, path as string, value)

    // Mark field as touched if needed
    if (touchOnChange) {
      touchField(path)
    }
  }

  // Mark a field as touched
  const touchField = <P extends NestedPaths<T>>(path: P) => {
    touched.value = {
      ...touched.value,
      [path]: true,
    } as TouchedFields<T>
  }

  // Reset the form values
  const resetValues = (newValues?: T) => {
    values.value = { ...(newValues || options.initialValues) }
    touched.value = {}
  }

  // Create v-model compatible binder for a field
  const fieldBinder = <P extends NestedPaths<T>>(path: P) => {
    return {
      get: () => getValueByPath(values.value, path as string) as PathValue<T, P>,
      set: (value: PathValue<T, P>) => setFieldValue(path, value),
    }
  }

  return {
    values,
    setFieldValue,
    touchField,
    resetValues,
    touched,
    fieldBinder,
  }
}
