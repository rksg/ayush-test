import React from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { IntentConfigurationConfig } from '../IntentContext'
import { IntentDetail }              from '../useIntentDetailsQuery'

export const ConfigurationField: React.FC<{
    configuration: IntentConfigurationConfig, intent: IntentDetail
}> = ({ configuration, intent }) => {
  const { $t } = useIntl()
  return <Form.Item label={$t(configuration.label)}>
    <span>{$t(
      { defaultMessage: 'Recommended Configuration: {value}' },
      { value: configuration.valueFormatter?.(intent.recommendedValue) }
    )}</span>
  </Form.Item>
}
