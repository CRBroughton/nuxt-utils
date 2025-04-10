/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AsyncData, AsyncDataOptions, NuxtError } from 'nuxt/app'
import { useAsyncData } from 'nuxt/app'

/**
 * Type for any function that returns a Promise
 */
type FetchFunction<T> = () => Promise<T>

export type PickFrom<T, K extends Array<string>> = T extends Array<any> ? T : T extends Record<string, any> ? keyof T extends K[number] ? T : K[number] extends never ? T : Pick<T, K[number]> : T
export type KeysOf<T> = Array<T extends T ? keyof T extends string ? keyof T : never : never>

/**
 * Fetches multiple resources in parallel and combines them into a single result object. Expands on useAsyncData and accepts the useAsyncData options object for additional configuration.
 * @template T - The combined result type, a record with keys corresponding to different resources
 * @param key - Unique key for caching with useAsyncData
 * @param fetchMap - Object where each key corresponds to a function that fetches a resource
 * @param options - Options to pass to useAsyncData
 * @returns AsyncData object with combined results from all fetches
 */
export function useManualParallelFetch<T extends Record<string, unknown>>(
  key: string,
  fetchMap: { [K in keyof T]: FetchFunction<T[K]> },
  options?: AsyncDataOptions<T>,
): AsyncData<PickFrom<T, KeysOf<T>> | null, NuxtError<unknown> | null> {
  return useAsyncData<T>(key, async () => {
    try {
      const entries = Object.entries(fetchMap) as [keyof T, FetchFunction<unknown>][]
      const results = await Promise.all(
        entries.map(([_, fetchFn]) => fetchFn()),
      )

      const result = {} as T
      entries.forEach(([key], index) => {
        result[key as keyof T] = results[index] as T[keyof T]
      })

      return result
    }
    catch (error) {
      console.error(`Error in useFetchMultiple(${key}):`, error)
      throw error
    }
  }, options)
}

/**
 * Creates an instance of useParallelFetch with the given fetch function.
 *
 * @param fetchFn - The fetch function to use for requests ($fetch),
 * @param fetchOptions - Options to pass to $fetch for all requests
 * @returns A configured useParallelFetch hook
 */
export function createUseParallelFetch(
  fetchFn: typeof $fetch,
  fetchOptions?: FetchOptions,
) {
  /**
   * Fetches multiple URL endpoints in parallel and combines them into a single result object. Expands on useAsyncData and accepts
   * the useAsyncData options object for additional configuration.
   *
   * @template T - The combined result type, a record with keys corresponding to different resources
   * @param key - Unique key for caching with useAsyncData
   * @param urlMap - Object where each key corresponds to a URL endpoint to fetch
   * @param asyncDataOptions - Options to pass to useAsyncData
   * @returns AsyncData object with combined results from all fetches
   */
  return function useParallelFetch<T extends Record<string, unknown>>(
    key: string,
    urlMap: { [K in keyof T]: string },
    asyncDataOptions?: AsyncDataOptions<T>,
  ) {
    const fetchMap: { [K in keyof T]: FetchFunction<T[K]> } = Object.fromEntries(
      Object.entries(urlMap).map(([k, url]) => [
        k,
        () => fetchFn(url, fetchOptions) as Promise<T[typeof k & keyof T]>,
      ]),
    ) as { [K in keyof T]: FetchFunction<T[K]> }

    return useManualParallelFetch<T>(key, fetchMap, asyncDataOptions)
  }
}

type FetchOptions = Parameters<typeof $fetch>[1]
