import _                                     from 'lodash'
import { FormattedMessage as FormatMessage } from 'react-intl'

import { Activity } from './types'

export function replaceStrings <Data> (
  template: string | undefined,
  data: Data,
  callback?: (key: keyof Data, data: Data) => string
) {
  if (template === undefined) return ''

  callback = callback ?? ((key: keyof Data, data: Data) => _.get(data, key, ''))

  const matches = template.match(new RegExp(/(@@|%%)\w+/, 'g')) || []
  for (const match of matches) {
    const value = callback(match.slice(2) as keyof Data, data)
    template = template.replace(match, value)
  }

  return template
}

export const getDescription = (
  descriptionTemplate: Activity['descriptionTemplate'],
  descriptionData: Activity['descriptionData']
) => {
  const template = replaceStrings(
    descriptionTemplate,
    Object.fromEntries(descriptionData?.map(({ name, value }) => [name, value])),
    (key, values) => `<b>${values[key]}</b>`
  )

  return <FormatMessage
    id='activities-table-template'
    defaultMessage={template}
    values={{ b: (chunks) => <b>{chunks}</b> }}
  />
}
