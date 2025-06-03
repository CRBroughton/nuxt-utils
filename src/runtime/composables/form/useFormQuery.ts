// composables/form/useFormQuery.ts
import { useUrlSearchParams } from '@vueuse/core'
import { watch, type Ref } from 'vue'
import type { NestedPaths } from './types'
import { getValueByPath, setValueByPath } from './utils'

// Types for URL parameter values
type UrlParamValue = string | string[]
type UrlParams = Record<string, UrlParamValue>

export interface UseFormQueryOptions<T> {
  /**
   * Reactive form values to sync with URL
   */
  values: Ref<T>

  /**
   * Callback to update form values programmatically
   */
  updateValues?: (values: Partial<T>) => void

  /**
   * URL mode for useUrlSearchParams
   * @default 'history'
   */
  urlMode?: 'history' | 'hash' | 'hash-params'

  /**
   * Options for URL param handling
   */
  urlOptions?: {
    /**
     * Remove null and undefined values from URL
     * @default true
     */
    removeNullishValues?: boolean

    /**
     * Remove falsy values from URL
     * @default false
     */
    removeFalsyValues?: boolean

    /**
     * Write back to URL automatically
     * @default true
     */
    write?: boolean

    /**
     * Write mode for URL history
     * @default 'replace'
     */
    writeMode?: 'replace' | 'push'
  }

  /**
   * Fields to include in URL parameters
   * If not provided, all form fields will be synced
   */
  urlFields?: Array<NestedPaths<T>>

  /**
   * Array format options for serializing arrays to URL
   */
  arrayFormat?: {
    /**
     * Default format to use for arrays
     * @default 'comma'
     */
    default: 'comma' | 'bracket' | 'index' | 'repeat'

    /**
     * Field-specific formats
     * This lets you override the default format for specific fields
     */
    fields?: Partial<Record<NestedPaths<T>, 'comma' | 'bracket' | 'index' | 'repeat'>>
  }
  
  /**
   * Only include values in URL that have changed from initial values
   * @default false
   */
  onlyDirtyValues?: boolean
  
  /**
   * Initial values to compare against when determining if a value is dirty
   * If not provided, the initial values from the values ref will be used
   */
  initialValues?: T

  /**
   * Transform values before sending to URL
   * Useful for converting complex objects to string representation
   */
  toUrl?: (values: T) => Record<string, string | string[]>

  /**
   * Transform URL parameters to form values
   * Useful for converting string parameters to proper types
   */
  fromUrl?: (params: UrlParams) => Partial<T>
}

export interface UseFormQueryResult {
  /**
   * URL parameters object
   */
  urlParams: UrlParams

  /**
   * Update URL parameters directly
   */
  updateUrlParams: (params: Record<string, string>) => void

  /**
   * Clear URL parameters
   */
  clearUrlParams: () => void

  /**
   * Initial values derived from URL parameters
   */
  initialValuesFromUrl: <U>() => Partial<U>
  
  /**
   * Reset what's considered the "initial" values for dirty checking
   */
  resetInitialValues: (newInitialValues?: Record<string, unknown>) => void
  
  /**
   * Check if a specific field is dirty (different from initial value)
   */
  isFieldDirty: <T>(path: NestedPaths<T>) => boolean
  
  /**
   * Get all fields that are currently dirty
   */
  getDirtyFields: <T>() => Array<NestedPaths<T>>
}

/**
 * Composable for syncing form values with URL parameters
 */
export function useFormQuery<T extends Record<string, unknown>>(
  options: UseFormQueryOptions<T>
): UseFormQueryResult {
  // Default options
  const urlMode = options.urlMode || 'history'
  const urlOptions = {
    removeNullishValues: true,
    removeFalsyValues: false,
    write: true,
    writeMode: 'replace' as const,
    ...options.urlOptions,
  }
  
  // Store initial values for dirty checking if onlyDirtyValues is enabled
  const initialValues = ref(options.initialValues || JSON.parse(JSON.stringify(options.values.value))) as Ref<T>
  const onlyDirtyValues = options.onlyDirtyValues || false

  // Initialize URL params
  const urlParams = useUrlSearchParams(urlMode, urlOptions)
  
  // Helper function to check if a value is dirty (changed from initial)
  const isDirty = (path: string, value: any): boolean => {
    if (!onlyDirtyValues) return true
    
    const initialValue = getValueByPath(initialValues.value, path)
    
    // Handle primitive values
    if (typeof value !== 'object' || value === null) {
      return value !== initialValue
    }
    
    // Handle arrays
    if (Array.isArray(value) && Array.isArray(initialValue)) {
      if (value.length !== initialValue.length) return true
      
      // Check if arrays have different values
      return value.some((v, i) => v !== initialValue[i])
    }
    
    // Handle dates
    if (value instanceof Date && initialValue instanceof Date) {
      return value.getTime() !== initialValue.getTime()
    }
    
    // For other objects, do a JSON comparison
    return JSON.stringify(value) !== JSON.stringify(initialValue)
  }

  // Transform functions for URL parameters
  const toUrlParams = (values: T): Record<string, string | string[]> => {
    if (options.toUrl) {
      return options.toUrl(values)
    }

    // Default implementation: flatten object to URL params
    const params: Record<string, string | string[]> = {}
    const fieldsToInclude = options.urlFields || Object.keys(values) as Array<NestedPaths<T>>
    
    // Default array format
    const defaultArrayFormat = options.arrayFormat?.default || 'comma'

    fieldsToInclude.forEach((field) => {
      const value = getValueByPath(values, field as string)
      const fieldKey = field as string

      // Only include non-nullish values
      if (value != null) {
        // Check if value is dirty when onlyDirtyValues is enabled
        if (!isDirty(fieldKey, value)) {
          return
        }
        
        // Simple serialization for primitive types
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          params[fieldKey] = String(value)
        }
        // Handle dates
        else if (value instanceof Date) {
          params[fieldKey] = value.toISOString()
        }
        // Handle arrays using the specified format
        else if (Array.isArray(value)) {
          if (value.length > 0) {
            // Get format for this specific field, or use default
            const arrayFormat = options.arrayFormat?.fields?.[field] || defaultArrayFormat
            
            // Format the array according to the specified format
            switch (arrayFormat) {
              case 'comma':
                // Format: field=value1,value2,value3
                params[fieldKey] = value.join(',')
                break
                
              case 'bracket':
                // Format: field[]=value1&field[]=value2
                const bracketKey = `${fieldKey}[]`
                params[bracketKey] = value.map(item => String(item))
                break
                
              case 'index':
                // Format: field[0]=value1&field[1]=value2
                value.forEach((item, index) => {
                  params[`${fieldKey}[${index}]`] = String(item)
                })
                break
                
              case 'repeat':
                // Format: field=value1&field=value2
                params[fieldKey] = value.map(item => String(item))
                break
            }
          }
        }
        // For objects, serialize to JSON
        else if (typeof value === 'object') {
          params[fieldKey] = JSON.stringify(value)
        }
      }
    })

    return params
  }

  const fromUrlParams = (params: UrlParams): Partial<T> => {
    if (options.fromUrl) {
      return options.fromUrl(params)
    }

    // Default implementation: convert URL params to appropriate types
    let result = {} as Partial<T>
    
    // We'll need to have a reference value to determine types
    const referenceValues = options.values.value
    
    // Store processed keys to avoid duplicates
    const processedKeys = new Set<string>()
    
    // Default array format
    const defaultArrayFormat = options.arrayFormat?.default || 'comma'
    
    // First pass: identify and group array parameters by their base name
    const arrayParamGroups: Record<string, Array<{ key: string, value: string | string[] }>> = {}
    
    Object.entries(params).forEach(([key, value]) => {
      // Check for array notation patterns
      const bracketMatch = key.match(/^(.+)\[\]$/)            // field[]
      const indexMatch = key.match(/^(.+)\[(\d+)\]$/)         // field[0]
      
      if (bracketMatch) {
        // Bracket notation (field[])
        const baseKey = bracketMatch[1]
        if (!arrayParamGroups[baseKey]) {
          arrayParamGroups[baseKey] = []
        }
        arrayParamGroups[baseKey].push({ key, value })
      } 
      else if (indexMatch) {
        // Index notation (field[0])
        const baseKey = indexMatch[1]
        if (!arrayParamGroups[baseKey]) {
          arrayParamGroups[baseKey] = []
        }
        arrayParamGroups[baseKey].push({ key, value })
      }
    })
    
    // Process and combine array parameters
    Object.entries(arrayParamGroups).forEach(([baseKey, items]) => {
      // Skip if this field is not in our include list
      if (options.urlFields && !options.urlFields.includes(baseKey as NestedPaths<T>)) {
        return
      }
      
      // Mark as processed
      processedKeys.add(baseKey)
      items.forEach(item => processedKeys.add(item.key))
      
      // Get the reference value to determine type
      const currentValue = getValueByPath(referenceValues, baseKey)
      
      // Only process if the field is actually an array in our model
      if (Array.isArray(currentValue)) {
        let arrayValues: string[] = []
        
        // Collect all values
        items.forEach(item => {
          if (Array.isArray(item.value)) {
            arrayValues = [...arrayValues, ...item.value]
          } else {
            arrayValues.push(item.value)
          }
        })
        
        // Convert values to appropriate type if needed
        let typedValues: any[] = arrayValues
        
        // If the reference array has elements, use the first element's type as a guide
        if (currentValue.length > 0) {
          const sampleItem = currentValue[0]
          if (typeof sampleItem === 'number') {
            typedValues = arrayValues.map(Number)
          } else if (typeof sampleItem === 'boolean') {
            typedValues = arrayValues.map(v => v === 'true')
          }
          // More type conversions can be added here if needed
        }
        
        // Set the combined array value
        result = setValueByPath(result, baseKey, typedValues)
      }
    })
    
    // Second pass: process standard parameters
    Object.entries(params).forEach(([key, paramValue]) => {
      // Skip already processed keys
      if (processedKeys.has(key)) {
        return
      }
      
      // Skip if this field is not in our include list
      if (options.urlFields && !options.urlFields.includes(key as NestedPaths<T>)) {
        return
      }
      
      // Handle array values (string[])
      const strValue = Array.isArray(paramValue) ? paramValue.join(',') : paramValue

      // For type conversion, we check the expected type in the current values
      const currentValue = getValueByPath(referenceValues, key)

      let convertedValue: any

      if (currentValue === undefined) {
        convertedValue = strValue // String as default
      }
      else if (typeof currentValue === 'number') {
        convertedValue = Number(strValue)
      }
      else if (typeof currentValue === 'boolean') {
        convertedValue = strValue === 'true'
      }
      else if (currentValue instanceof Date) {
        convertedValue = new Date(strValue)
      }
      else if (Array.isArray(currentValue)) {
        // Check the array format for this field
        const arrayFormat = options.arrayFormat?.fields?.[key as NestedPaths<T>] || defaultArrayFormat
        
        // For repeat format where we get an array directly
        if (arrayFormat === 'repeat' && Array.isArray(paramValue)) {
          convertedValue = paramValue
        } else {
          // Default: split by comma
          convertedValue = strValue.split(',')
        }
        
        // Filter out empty strings
        if (Array.isArray(convertedValue)) {
          convertedValue = convertedValue.filter(v => v !== '')
        }
      }
      else if (typeof currentValue === 'object' && currentValue !== null) {
        try {
          convertedValue = JSON.parse(strValue)
        }
        catch (e) {
          convertedValue = strValue
        }
      }
      else {
        convertedValue = strValue
      }

      // Set the value in our result object using the path
      result = setValueByPath(result, key, convertedValue)
    })

    return result
  }

  // Get initial values from URL (for initial form setup)
  const initialValuesFromUrl = <U>(): Partial<U> => {
    return fromUrlParams(urlParams) as unknown as Partial<U>
  }

  // Sync form values to URL when they change
  watch(
    () => options.values.value,
    (newValues) => {
      // Update URL params
      const newParams = toUrlParams(newValues)
      
      // Before updating, clear any existing array parameters that might conflict
      if (options.urlFields) {
        options.urlFields.forEach(field => {
          const fieldStr = field as string
          // Check if this is potentially an array field
          const value = getValueByPath(newValues, fieldStr)
          if (Array.isArray(value)) {
            // Clear all possible array notation formats for this field
            delete urlParams[fieldStr] // Clear comma-separated value
            delete urlParams[`${fieldStr}[]`] // Clear bracket notation
            // Clear indexed notations
            for (let i = 0; i < Math.max(20, value.length + 5); i++) {
              delete urlParams[`${fieldStr}[${i}]`]
            }
          }
        })
      }

      // Update URL without triggering the URL watcher
      Object.entries(newParams).forEach(([key, value]) => {
        // Skip array formats with bracket notation - use index notation instead
        if (key.endsWith('[]')) {
          const baseKey = key.slice(0, -2)
          if (Array.isArray(value)) {
            // Use index notation as fallback
            value.forEach((item, index) => {
              urlParams[`${baseKey}[${index}]`] = item
            })
          } else {
            // Handle single value case
            urlParams[`${baseKey}[0]`] = value
          }
        } else {
          urlParams[key] = value
        }
      })

      // Remove params that are no longer in the form
      Object.keys(urlParams).forEach((key) => {
        // Skip checking array index notation params, as we handle those specially
        if (!/\[\d+\]$/.test(key) && key.indexOf('[]') === -1) {
          const isBaseParam = Object.keys(newParams).some(
            paramKey => paramKey === key || paramKey.startsWith(`${key}[`)
          )
          if (!isBaseParam && (options.urlFields?.includes(key as NestedPaths<T>) || options.urlFields === undefined)) {
            delete urlParams[key]
          }
        }
      })
    },
    { deep: true },
  )

  // Sync URL changes back to form (for browser navigation)
  watch(
    urlParams,
    () => {
      const urlValues = fromUrlParams(urlParams)
      
      // If there's an update function provided, use it
      if (options.updateValues) {
        options.updateValues(urlValues)
      }
    },
    { deep: true },
  )

  // Update URL parameters directly
  const updateUrlParams = (params: Record<string, string>) => {
    // Clear existing parameters first
    Object.keys(urlParams).forEach(key => {
      delete urlParams[key]
    })
    
    // Then add new parameters
    Object.entries(params).forEach(([key, value]) => {
      urlParams[key] = value
    })
  }
  
  // Clear URL parameters
  const clearUrlParams = () => {
    if (options.urlFields) {
      options.urlFields.forEach((field) => {
        delete urlParams[field as string]
        // Also clear array format variations
        delete urlParams[`${field as string}[]`]
        for (let i = 0; i < 10; i++) {
          delete urlParams[`${field as string}[${i}]`]
        }
      })
    }
    else {
      // Clear all URL parameters
      Object.keys(urlParams).forEach((key) => {
        delete urlParams[key]
      })
    }
  }

  return {
    urlParams,
    updateUrlParams,
    clearUrlParams,
    initialValuesFromUrl,
    
    /**
     * Reset what's considered the "initial" values for dirty checking
     */
    resetInitialValues: (newInitialValues?: T) => {
      initialValues.value = newInitialValues || JSON.parse(JSON.stringify(options.values.value))
    },
    
    /**
     * Check if a specific field is dirty (different from initial value)
     */
    isFieldDirty: (path: NestedPaths<T>) => {
      const value = getValueByPath(options.values.value, path as string)
      return isDirty(path as string, value)
    },
    
    /**
     * Get all fields that are currently dirty
     */
    getDirtyFields: () => {
      const fields = options.urlFields || Object.keys(options.values.value) as Array<NestedPaths<T>>
      return fields.filter(field => {
        const value = getValueByPath(options.values.value, field as string)
        return isDirty(field as string, value)
      })
    }
  }
}