import React from 'react'

import { useIntl } from 'react-intl'

import { PageHeader } from '@acx-ui/components'
import { get }        from '@acx-ui/config'

import { aiFeaturesLabel, codes, icons } from '../config'
import { useIntentContext }              from '../IntentContext'

export function IntentWizardHeader () {
  const { $t } = useIntl()
  const { intent } = useIntentContext()
  const code = intent.code as keyof typeof codes
  const feature = codes[code]

  return <PageHeader
    breadcrumb={[
      { text: $t({ defaultMessage: 'AI Assurance' }) },
      { text: $t({ defaultMessage: 'AI Analytics' }) },
      { text: $t({ defaultMessage: 'IntentAI' }), link: '/analytics/intentAI' }
    ]}
    titlePrefix={React.cloneElement(icons[feature.aiFeature], {
      style: { width: 32, height: 32 }
    })}
    title={$t(aiFeaturesLabel[feature.aiFeature])}
    subTitle={[
      {
        label: $t({ defaultMessage: 'Intent' }),
        value: [$t(feature.intent)]
      },
      {
        label: get('IS_MLISA_SA')
          ? $t({ defaultMessage: 'Zone' })
          : $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
        value: [intent.sliceValue]
      }
    ]}
  />
}
