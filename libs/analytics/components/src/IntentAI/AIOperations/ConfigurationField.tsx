import React from 'react'

import { useIntl } from 'react-intl'

import { StepsForm } from '@acx-ui/components'

import { IntentConfigurationConfig } from '../IntentContext'
import { Intent }                    from '../useIntentDetailsQuery'

export const ConfigurationField: React.FC<{
    configuration: IntentConfigurationConfig, intent: Intent
}> = ({ configuration, intent }) => {
  const { $t } = useIntl()
  return <div>
    <StepsForm.Subtitle children={$t(configuration.label)} />
    <span>{$t(
      { defaultMessage: 'Recommended Configuration: {value}' },
      { value: configuration.valueFormatter?.(intent.recommendedValue) }
    )}</span>
  </div>
}
