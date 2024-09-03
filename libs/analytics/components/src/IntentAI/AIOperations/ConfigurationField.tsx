import React from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { IntentConfigurationConfig } from '../IntentContext'
import { Intent }                    from '../useIntentDetailsQuery'

export const ConfigurationField: React.FC<{
    configuration: IntentConfigurationConfig, intent: Intent
}> = ({ configuration, intent }) => {
  const { $t } = useIntl()
  return <Form.Item label={$t(configuration.label)}>
    <span>{$t(
      { defaultMessage: 'Recommended Configuration: {value}' },
      { value: configuration.valueFormatter?.(intent.recommendedValue) }
    )}</span>
  </Form.Item>
}
