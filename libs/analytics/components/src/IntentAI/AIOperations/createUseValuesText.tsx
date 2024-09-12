import { FormattedMessage, MessageDescriptor } from 'react-intl'

import { incidentScope } from '@acx-ui/analytics/utils'

import { isIntentActive }       from '../common/isIntentActive'
import { richTextFormatValues } from '../common/richTextFormatValues'
import { useIntentContext }     from '../IntentContext'
import { Intent }               from '../useIntentDetailsQuery'

export function createUseValuesText<ValuesType = unknown> (
  config: {
    intro: MessageDescriptor
    action: MessageDescriptor
    reason: MessageDescriptor
    tradeoff: MessageDescriptor
    inactive: MessageDescriptor
  },
  getValuesFn?: (intent: Intent) => ValuesType
) {
  return function useValuesText () {
    const { intent, state } = useIntentContext()
    const values = {
      ...richTextFormatValues,
      currentValue: intent.currentValue,
      recommendedValue: intent.recommendedValue,
      scope: incidentScope(intent),
      ...(getValuesFn && getValuesFn(intent))
    }

    const summary = (!isIntentActive(intent) || state === 'no-data')
      ? config.inactive
      : config.action

    return {
      actionText: <FormattedMessage {...config.action} values={values} />,
      reasonText: <FormattedMessage {...config.reason} values={values} />,
      tradeoffText: <FormattedMessage {...config.tradeoff} values={values} />,
      introText: <FormattedMessage {...config.intro} values={values} />,
      summary: <FormattedMessage {...summary} values={values} />
    }
  }
}