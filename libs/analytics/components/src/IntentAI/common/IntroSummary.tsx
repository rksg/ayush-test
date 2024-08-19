import { useIntl } from 'react-intl'

import { Descriptions }              from '@acx-ui/components'
import { get }                       from '@acx-ui/config'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'

import { states, codes }    from '../config'
import { useIntentContext } from '../IntentContext'

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
  // TODO: change to displayStatus of Intent
  const state = states[intent.status as unknown as keyof typeof states]
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
        label={get('IS_MLISA_SA')
          ? $t({ defaultMessage: 'Zone' })
          : $t({ defaultMessage: '<VenueSingular></VenueSingular>' })
        }
        children={intent.sliceValue}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Status' })}
        // TODO: remove ternary when switch to Intent
        children={state ? $t(state.text) : intent.status}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Last update' })}
        children={formatter(DateFormatEnum.DateTimeFormat)(intent.updatedAt)}
      />
    </Descriptions>
  )
}
