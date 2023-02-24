import { useEffect } from 'react'

import { Form, Radio }            from 'antd'
import { NamePath }               from 'antd/es/form/interface'
import { defineMessage, useIntl } from 'react-intl'

import {
  StepsFormNew,
  Tooltip,
  useStepFormContext
} from '@acx-ui/components'
import { formatter } from '@acx-ui/utils'

import {
  Band,
  ClientType as ClientTypeEnum,
  NetworkHealthFormDto
} from '../../types'

import { ClientType } from './ClientType'

const name = ['configs', 0, 'radio'] as const
const label = defineMessage({ defaultMessage: 'Radio Band' })
const format = formatter('radioFormat')

export function RadioBand () {
  const { $t } = useIntl()
  const { form } = useStepFormContext<NetworkHealthFormDto>()
  const fieldName = name as unknown as NamePath

  const [clientType, radio] = [
    Form.useWatch(ClientType.fieldName, form),
    Form.useWatch(fieldName, form)
  ]

  const tooltipTitle = $t({ defaultMessage: '6 GHz is not supported for Virtual Client test' })
  const mainLabel = clientType === ClientTypeEnum.VirtualClient
    ? <>
      {$t(label)}
      <Tooltip.Question title={tooltipTitle} />
    </>
    : $t(label)

  useEffect(() => {
    if (clientType === ClientTypeEnum.VirtualWirelessClient) return
    if (radio !== Band.Band6) return
    form.setFieldValue(fieldName, Band.Band2_4)
  }, [form, clientType, radio])

  return <Form.Item label={mainLabel}>
    <Form.Item noStyle name={fieldName} label={$t(label)}>
      <Radio.Group>
        <Radio value={Band.Band2_4}>{format('2.4')}</Radio>
        <Radio value={Band.Band5}>{format('5')}</Radio>
        <Radio
          value={Band.Band6}
          disabled={clientType === ClientTypeEnum.VirtualClient}
          children={format('6')}
        />
      </Radio.Group>
    </Form.Item>
  </Form.Item>
}

RadioBand.fieldName = name
RadioBand.label = label

RadioBand.FieldSummary = function RadioBandFieldSummary () {
  const { $t } = useIntl()
  return <Form.Item
    name={name as unknown as NamePath}
    label={$t(label)}
    children={<StepsFormNew.FieldSummary<Band>
      convert={(value) => format(value)}
    />}
  />
}
