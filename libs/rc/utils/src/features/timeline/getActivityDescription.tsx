// rename to prevent it being parse by extraction process
import { FormattedMessage as FormatMessage } from 'react-intl'

import { Activity } from '../../types'

import { replaceStrings } from './replaceStrings'

export const getActivityDescription = (
  descriptionTemplate: Activity['descriptionTemplate'],
  descriptionData: Activity['descriptionData']
) => {
  const template = replaceStrings(
    descriptionTemplate,
    Object.fromEntries((descriptionData||[]).map(({ name, value }) => [name, value])),
    (key, values) => values[key] ? `<b>${values[key]}</b>` : undefined
  )

  return <FormatMessage
    id='activities-description-template'
    // escape ' by replacing with '' as it is special character of formatjs
    defaultMessage={template.replaceAll("'", "''")}
    values={{ b: (chunks) => <b>{chunks}</b> }}
  />
}
