import { useIntl } from 'react-intl'

import { Descriptions }              from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'

import { codes }            from '../config'
import { useIntentContext } from '../IntentContext'

import { getIntentStatus } from './getIntentStatus'
/**
 * Common helper to render summary of intent introduction
 * NOTE:
 * Please create another component and
 * not adding conditions to determine which part to render
 */
export function IntroSummary () {
  const { $t } = useIntl()
  const { intent } = useIntentContext()
  const feature = codes[intent.code as keyof typeof codes]
  return (
    <Descriptions noSpace>
      <Descriptions.Item
        label={$t({ defaultMessage: 'Intent' })}
        children={$t(feature.intent)}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Category' })}
        children={$t(feature.category)}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
        children={intent.sliceValue}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Status' })}
        children={getIntentStatus(intent.displayStatus)}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Last Update' })}
        children={formatter(DateFormatEnum.DateTimeFormat)(intent.updatedAt)}
      />
    </Descriptions>
  )
}
