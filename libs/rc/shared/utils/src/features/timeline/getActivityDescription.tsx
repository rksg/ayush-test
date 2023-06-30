// rename to prevent it being parse by extraction process
import { camelCase  }                        from 'lodash'
import { FormattedMessage as FormatMessage } from 'react-intl'

import { Activity } from '../../types'

import { replaceStrings } from './replaceStrings'

export const getActivityDescription = (
  descriptionTemplate: Activity['descriptionTemplate'],
  descriptionData: Activity['descriptionData']
) => {
  descriptionTemplate = descriptionTemplate
    // escape ' by replacing with ''
    .replaceAll("'", "''")
    // escape < { by replacing with '<' or '{'
    .replaceAll(/([<{])/g, "'$1'")
  const values = Object.fromEntries((descriptionData||[])
    .map(({ name, value }) => [camelCase(name), value]))
  const template = replaceStrings(
    descriptionTemplate,
    values,
    (key, values) => values[camelCase(String(key))]
      ? `<b>{${camelCase(String(key))}}</b>`
      : undefined
  )

  return <FormatMessage
    id='activities-description-template'
    defaultMessage={template}
    values={{ ...values, b: (chunks) => <b>{chunks}</b> }}
  />
}
