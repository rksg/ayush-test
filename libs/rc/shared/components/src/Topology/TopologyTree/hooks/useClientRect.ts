/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useState } from 'react'

export function useClientRect () {
  const [rect, setRect] = useState<any>(null)
  const ref = useCallback((node: any) => {
    if (node !== null) {
      setRect(node.getBoundingClientRect())
    }
  }, [])
  return [rect, ref]
}
