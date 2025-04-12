export function getValueByPath<T>(obj: T, path: string): unknown {
  return path.split('.').reduce((value, key) =>
    value && typeof value === 'object' ? value[key] : undefined,
  obj as unknown)
}

export function setValueByPath<T>(obj: T, path: string, value: unknown): T {
  if (!path.includes('.')) {
    return { ...obj, [path]: value }
  }

  const pathArray = path.split('.')
  const firstKey = pathArray[0]
  const remainingPath = pathArray.slice(1).join('.')

  return {
    ...obj,
    [firstKey]: setValueByPath(
      (obj as unknown)[firstKey] || {},
      remainingPath,
      value,
    ),
  }
}
