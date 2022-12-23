import { FormattedMessage as FormatMessage } from 'react-intl'

import { Activity } from '../../types'

import { replaceStrings } from './replaceStrings'

export const getActivityDescription = (
  descriptionTemplate: Activity['descriptionTemplate'],
  descriptionData: Activity['descriptionData']
) => {
  const template = replaceStrings(
    descriptionTemplate,
    Object.fromEntries(descriptionData?.map(({ name, value }) => [name, value])),
    (key, values) => `<b>${values[key]}</b>`
  )

  return <FormatMessage
    id='activities-description-template'
    defaultMessage={template}
    values={{ b: (chunks) => <b>{chunks}</b> }}
  />
}
