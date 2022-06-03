import { useMemo } from 'react'

import { trimEnd } from 'lodash'

/**
 * Return the path set in the `<base href=''>`
 */
export function getBasePath () {
  return trimEnd(new URL(document.baseURI).pathname, '/')
}

export function useBasePath () {
  return useMemo(getBasePath, [])
}
