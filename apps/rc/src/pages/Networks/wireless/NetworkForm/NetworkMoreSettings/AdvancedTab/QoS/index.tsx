import { useEffect, useState } from 'react'

import { Form, Select, Space, Switch } from 'antd'
import { useIntl }                     from 'react-intl'

import { Tooltip } from '@acx-ui/components'

import * as UI from '../../../NetworkMoreSettings/styledComponents'

export interface MirroringScopeOption {
    label: string
    value: string
    key: string
    message: string
}

// eslint-disable-next-line max-len
export const findTargetMirroringScopeOption =
        // eslint-disable-next-line max-len
        (targetValue: string, mirroringScopeOptions: MirroringScopeOption[]): MirroringScopeOption =>
          mirroringScopeOptions.find(option =>
            option.value === targetValue) || mirroringScopeOptions[0]


function QoS () {
  const { $t } = useIntl()
  const form = Form.useFormInstance()

  const mirroringScopeOptions: MirroringScopeOption[] = [
    {
      label: $t({ defaultMessage: 'MSCS requests only' }),
      value: 'MSCS_REQUESTS_ONLY',
      key: 'MSCS_REQUESTS_ONLY',
      message: $t({ defaultMessage: `Mirroring for clients sending MSCS 
                    (Multimedia and Streaming Control Server) requests` })
    },
    {
      label: $t({ defaultMessage: 'All clients' }),
      value: 'ALL_CLIENTS',
      key: 'ALL_CLIENTS',
      message: $t({ defaultMessage: 'Mirroring for all clients connected to this Wi-Fi network.' })
    }
  ]

  const [enabledQosMirroring, setEnabledQosMirroring] = useState(true)
  const [mirroringScopeOption, setMirroringScopeOption] = useState(mirroringScopeOptions[0])

  useEffect(() => {
    // eslint-disable-next-line max-len
    form.setFieldValue(['wlan', 'advancedCustomization', 'qosMirroringEnabled'], enabledQosMirroring)
    // eslint-disable-next-line max-len
    form.setFieldValue(['wlan', 'advancedCustomization', 'qosMirroringScope'], mirroringScopeOption.value)
  }, [mirroringScopeOption, form, enabledQosMirroring])

  const onEnabledQosMirroringChange = (checked: boolean) => setEnabledQosMirroring(checked)
  const onMirroringScopeOptionChange = (value: string) => {
    const selection = findTargetMirroringScopeOption(value, mirroringScopeOptions)
    setMirroringScopeOption(selection)
  }

  return (
    <>
      <UI.Subtitle>
        {$t({ defaultMessage: 'QoS' })}
      </UI.Subtitle>
      <UI.FieldLabel width='250px'>
        <Space>
          {$t({ defaultMessage: 'QoS Mirroring' })}
          <Tooltip.Question
            /* eslint-disable-next-line max-len */
            title={$t({ defaultMessage: `QoS mirroring duplicates network traffic to ensure quality of service for 
          specific multimedia clients or all clients on your Wi-Fi network` })}
            placement='right'
            iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
          />
        </Space>
        <Form.Item
          style={{ marginBottom: '10px', width: '300px' }}
          valuePropName='checked'
          children={
            <Switch
              onChange={onEnabledQosMirroringChange}
              defaultChecked={enabledQosMirroring}
            />
          }
        />
        { enabledQosMirroring &&
                  <Form.Item
                    label={$t({ defaultMessage: 'QoS Mirroring Scope' })}
                    extra={mirroringScopeOption.message}
                  >
                    <Select
                      style={{ width: '280px', height: '30px', fontSize: '11px' }}
                      defaultValue={mirroringScopeOption.value}
                      value={mirroringScopeOption.value}
                      options={mirroringScopeOptions}
                      onChange={onMirroringScopeOptionChange}
                    />
                  </Form.Item>
        }
      </UI.FieldLabel>
    </>
  )
}


export default QoS