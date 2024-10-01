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

export function encodeParameter<ValueType> (value: ValueType): string {
  return fixedEncodeURIComponent(JSON.stringify(value))
}