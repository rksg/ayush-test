import { FormattedMessage, MessageDescriptor } from 'react-intl'

import { incidentScope } from '@acx-ui/analytics/utils'

import { richTextFormatValues } from '../common/richTextFormatValues'
import { useIntentContext }     from '../IntentContext'

export function createUseValuesText (config: {
  intro: MessageDescriptor
  action: MessageDescriptor
  reason: MessageDescriptor
  tradeoff: MessageDescriptor
}) {
  return function useValuesText () {
    const { intent } = useIntentContext()
    const values = {
      ...richTextFormatValues,
      currentValue: 'CURRENT_VALUE',
      recommendedValue: 'RECOMMENDED_VALUE',
      scope: incidentScope(intent)
    }
    return {
      actionText: <FormattedMessage {...config.action} values={values} />,
      reasonText: <FormattedMessage {...config.reason} values={values} />,
      tradeoffText: <FormattedMessage {...config.tradeoff} values={values} />,
      introText: <FormattedMessage {...config.intro} values={values} />
    }
  }
}
