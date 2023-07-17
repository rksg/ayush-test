import _ from 'lodash'

export function replaceStrings <Data> (
  template: string | undefined,
  data: Data,
  callback?: (key: keyof Data, data: Data) => string|undefined
) {
  if (template === undefined) return ''

  callback = callback ?? ((key: keyof Data, data: Data) => _.get(data, key, ''))

  const matches = template.match(new RegExp(/(@@|%%)\w+/, 'g')) || []
  for (const match of matches) {
    const value = callback(match.slice(2) as keyof Data, data)
    if (!value) return '-'
    template = template.replace(match, value)
  }

  return template
}
