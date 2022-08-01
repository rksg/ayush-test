
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

export const deviceStatusColors = {
  CONNECTED: '--acx-semantics-green-50',
  INITIAL: '--acx-neutrals-50',
  ALERTING: '--acx-semantics-yellow-40',
  DISCONNECTED: '--acx-semantics-red-50'
}