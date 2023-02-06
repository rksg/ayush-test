import { Checkbox, Form } from 'antd'
import { useIntl }        from 'react-intl'

import { Tooltip } from '@acx-ui/components'

export function SpeedTest () {
  const { $t } = useIntl()
  return <Form.Item
    name='speedTestEnabled'
    label={<>
      {$t({ defaultMessage: 'Speed Test' })}
      <Tooltip.Info title={$t({ defaultMessage: 'Using speedtest.net servers' })} />
    </>}
    valuePropName='checked'
    children={<Checkbox children={$t({ defaultMessage: 'Enable' })} />}
  />
}
