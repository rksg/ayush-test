import { useMemo } from 'react'

import { useSearchParams } from 'react-router-dom'

import { fixedEncodeURIComponent } from './encodeURIComponent'

export function useEncodedParameter<ValueType> (name: string) {
  const [search, setSearch] = useSearchParams()
  return useMemo(() => ({
    read: () => {
      try {
        return JSON.parse(decodeURIComponent(search.get(name) as string))
      } catch {
        return null // if parameter not present or obsolete
      }
    },
    write: (value: ValueType) => {
      const currentValue = search.get(name)
      const newValue = fixedEncodeURIComponent(JSON.stringify(value))
      const hasChanged = currentValue !== newValue
      if (hasChanged) {
        search.set(name, newValue)
        setSearch(search, { replace: true })
      }
    }
  }), [name, search, setSearch])
}