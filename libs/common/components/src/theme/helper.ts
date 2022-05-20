
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
