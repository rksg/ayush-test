import { Checkbox, Form }         from 'antd'
import { NamePath }               from 'antd/es/form/interface'
import { defineMessage, useIntl } from 'react-intl'

import { StepsForm, Tooltip } from '@acx-ui/components'

const name = ['configs', 0, 'speedTestEnabled'] as const
const label = defineMessage({ defaultMessage: 'Speed Test' })

export function SpeedTest () {
  const { $t } = useIntl()
  return <Form.Item
    name={name as unknown as NamePath}
    label={<>
      {$t(label)}
      <Tooltip.Question title={$t({ defaultMessage: 'Using speedtest.net servers' })} />
    </>}
    valuePropName='checked'
    children={<Checkbox children={$t({ defaultMessage: 'Enable' })} />}
  />
}

SpeedTest.fieldName = name
SpeedTest.label = label

SpeedTest.FieldSummary = function SpeedTestFieldSummary () {
  const { $t } = useIntl()
  return <Form.Item
    name={name as unknown as NamePath}
    label={$t(label)}
    children={<StepsForm.FieldSummary<boolean>
      convert={(value) => value
        ? $t({ defaultMessage: 'Enabled' })
        : $t({ defaultMessage: 'Disabled' })}
    />}
  />
}
