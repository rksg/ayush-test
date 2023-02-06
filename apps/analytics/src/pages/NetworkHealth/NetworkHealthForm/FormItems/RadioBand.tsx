import { useEffect } from 'react'

import { Form, Radio } from 'antd'
import { useIntl }     from 'react-intl'

import {
  Tooltip,
  useStepFormContext,
  useWatch
} from '@acx-ui/components'

import {
  Band,
  ClientType,
  NetworkHealthFormDto
} from '../../types'

export function RadioBand () {
  const { $t } = useIntl()
  const { form } = useStepFormContext<NetworkHealthFormDto>()

  const [clientType, radio] = [
    useWatch('clientType', form),
    useWatch('radio', form)
  ]

  const label = $t({ defaultMessage: 'Radio Band' })
  const tooltipTitle = $t({ defaultMessage: '6 GHz is not supported for Virtual Client test' })
  const mainLabel = clientType === ClientType.VirtualClient
    ? <>
      {label}
      <Tooltip.Info title={tooltipTitle} />
    </>
    : label

  useEffect(() => {
    if (clientType === ClientType.VirtualWirelessClient) return
    if (radio !== Band.Band6) return
    form.setFieldValue('radio', Band.Band2_4)
  }, [form, clientType, radio])

  return <Form.Item label={mainLabel}>
    <Form.Item noStyle name='radio' label={label}>
      <Radio.Group>
        <Radio value={Band.Band2_4}>{$t({ defaultMessage: '2.4 GHz' })}</Radio>
        <Radio value={Band.Band5}>{$t({ defaultMessage: '5 GHz' })}</Radio>
        <Radio
          value={Band.Band6}
          disabled={clientType === ClientType.VirtualClient}
          children={$t({ defaultMessage: '6 GHz' })}
        />
      </Radio.Group>
    </Form.Item>
  </Form.Item>
}
