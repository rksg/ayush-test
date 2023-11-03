import { useCallback, useState } from 'react'

export function useClientRect () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rect, setRect] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useCallback((node: any) => {
    if (node !== null) {
      setRect(node.getBoundingClientRect())
    }
  }, [])
  return [rect, ref]
}
