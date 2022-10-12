export function transformDisplayText (value?: string) {
  return value ? value : '--'
}

export function transformDisplayNumber (value?: number) {
  return value ? value : 0
}

export function transformTitleCase (value: string) {
  return value.replace(
    /\w\S*/g,
    value => value.charAt(0).toUpperCase() + value.substr(1).toLowerCase()
  )
}