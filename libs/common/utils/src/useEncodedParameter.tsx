import { useMemo } from 'react'

import { useSearchParams } from 'react-router-dom'

import { fixedEncodeURIComponent } from './encodeParameter'

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
      search.set(name, fixedEncodeURIComponent(JSON.stringify(value)))
      setSearch(search, { replace: true })
    }
  }), [name, search, setSearch])
}