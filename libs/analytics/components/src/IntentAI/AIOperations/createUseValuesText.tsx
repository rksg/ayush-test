import { FormattedMessage, MessageDescriptor } from 'react-intl'

import { incidentScope } from '@acx-ui/analytics/utils'

import { richTextFormatValues } from '../common/richTextFormatValues'
import { useIntentContext }     from '../IntentContext'
import { Statuses }             from '../states'

export function createUseValuesText (config: {
  intro: MessageDescriptor
  action: MessageDescriptor
  reason: MessageDescriptor
  tradeoff: MessageDescriptor
  summary: MessageDescriptor
}) {
  return function useValuesText () {
    const { intent } = useIntentContext()
    const values = {
      ...richTextFormatValues,
      currentValue: intent.currentValue,
      recommendedValue: intent.recommendedValue,
      scope: incidentScope(intent)
    }
    config.summary = [ Statuses.paused, Statuses.na ]
      .includes(intent.status as Statuses) ? config.summary : config.action
    return {
      actionText: <FormattedMessage {...config.action} values={values} />,
      reasonText: <FormattedMessage {...config.reason} values={values} />,
      tradeoffText: <FormattedMessage {...config.tradeoff} values={values} />,
      introText: <FormattedMessage {...config.intro} values={values} />,
      summary: <FormattedMessage {...config.summary} values={values} />
    }
  }
}
