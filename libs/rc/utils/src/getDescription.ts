import _ from 'lodash'

import { Activity } from './types'

export function replaceStrings <Data> (
  template: string | undefined,
  data: Data
) {
  if (template === undefined) return ''

  const matches = template.match(new RegExp(/(@@|%%)\w+/, 'g')) || []
  for (const match of matches) {
    const value = String(_.get(data, match.slice(2), ''))
    template = template.replace(match, value)
  }

  return template
}

export const getDescription = (
  descriptionTemplate: Activity['descriptionTemplate'],
  descriptionData: Activity['descriptionData']
) => {
  const values = descriptionData?.reduce((agg, data) =>
    ({ ...agg, [data.name]: data.value })
  , {} as Record<string, string>)
  return replaceStrings(descriptionTemplate, values)
}
