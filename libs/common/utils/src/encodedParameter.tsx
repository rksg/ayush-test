import { useMemo } from 'react'

import { useSearchParams } from 'react-router-dom'

/*
taken from
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
to address special characters
*/
export function fixedEncodeURIComponent (str: string) {
  return encodeURIComponent(str).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  )
}

export function useEncodedParameter<ValueType> (name: string, isString? : boolean) {
  const [search, setSearch] = useSearchParams()
  return useMemo(() => ({
    read: () => {
      try {
        return isString
          ? decodeURIComponent(search.get(name) as string)
          : JSON.parse(decodeURIComponent(search.get(name) as string))
      } catch {
        return null // if parameter not present or obsolete
      }
    },
    write: (value: ValueType) => {
      search.set(
        name,
        isString
          ? fixedEncodeURIComponent(value as unknown as string)
          : fixedEncodeURIComponent(JSON.stringify(value))
      )
      setSearch(search, { replace: true })
    }
  }), [name, search, setSearch])
}

export function encodeParameter<ValueType> (value: ValueType): string {
  return fixedEncodeURIComponent(JSON.stringify(value))
}