
let cssPropsCache: ReturnType<typeof getComputedStyle>

/**
 * Read css property from document.documentElement
 */
export function cssStr (property: string): string {
  if (!cssPropsCache) cssPropsCache = getComputedStyle(document.documentElement)
  return cssPropsCache.getPropertyValue(property)
}

/**
 * Read css property from document.documentElement and parse as number
 */
export const cssNumber = (property: string) => {
  return parseInt(cssStr(property), 10)
}

export const getDeviceConnectionStatusColors = () => [
  cssStr('--acx-semantics-green-50'), // Operational
  cssStr('--acx-neutrals-50'), // Setup Phase
  cssStr('--acx-semantics-yellow-40'), // Transient Issue
  cssStr('--acx-semantics-red-50') // Requires Attention
]