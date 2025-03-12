import { useIntl } from 'react-intl'

import { PageHeader } from '@acx-ui/components'

import { aiFeaturesLabel, codes } from '../config'
import { useIntentContext }       from '../IntentContext'

import { Icon } from './IntentIcon'

export function IntentWizardHeader () {
  const { $t } = useIntl()
  const { intent } = useIntentContext()
  const feature = codes[intent.code]

  return <PageHeader
    breadcrumb={[
      { text: $t({ defaultMessage: 'AI Assurance' }) },
      { text: $t({ defaultMessage: 'AI Analytics' }) },
      { text: $t({ defaultMessage: 'IntentAI' }), link: '/analytics/intentAI' }
    ]}
    titlePrefix={<Icon feature={feature.aiFeature} size='small' />}
    title={$t(aiFeaturesLabel[feature.aiFeature])}
    subTitle={[
      {
        label: $t({ defaultMessage: 'Intent' }),
        value: [$t(feature.intent)]
      },
      {
        label: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
        value: [intent.sliceValue]
      }
    ]}
  />
}
