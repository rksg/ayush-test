import { FormattedMessage as FormatMessage } from 'react-intl'

import { replaceStrings } from './replaceStrings'
import { Activity }       from './types'

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
