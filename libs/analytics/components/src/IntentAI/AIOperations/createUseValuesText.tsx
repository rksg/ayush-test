import { FormattedMessage, MessageDescriptor } from 'react-intl'

import { incidentScope } from '@acx-ui/analytics/utils'

import { isIntentInactive }     from '../common/isIntentActive'
import { richTextFormatValues } from '../common/richTextFormatValues'
import { useIntentContext }     from '../IntentContext'

export function createUseValuesText (config: {
  intro: MessageDescriptor
  action: MessageDescriptor
  reason: MessageDescriptor
  tradeoff: MessageDescriptor
  inactive: MessageDescriptor
}) {
  return function useValuesText () {
    const { intent } = useIntentContext()
    const values = {
      ...richTextFormatValues,
      currentValue: intent.currentValue,
      recommendedValue: intent.recommendedValue,
      scope: incidentScope(intent)
    }
    const summary = isIntentInactive(intent) ? config.inactive : config.action
    return {
      actionText: <FormattedMessage {...config.action} values={values} />,
      reasonText: <FormattedMessage {...config.reason} values={values} />,
      tradeoffText: <FormattedMessage {...config.tradeoff} values={values} />,
      introText: <FormattedMessage {...config.intro} values={values} />,
      summary: <FormattedMessage {...summary} values={values} />
    }
  }
}
