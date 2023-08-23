/* eslint-disable max-len */
import { Form, Select, Space, Switch } from 'antd'
import { useWatch }                    from 'antd/lib/form/Form'
import { get }                         from 'lodash'
import { useIntl }                     from 'react-intl'

import { Tooltip }         from '@acx-ui/components'
import { NetworkSaveData } from '@acx-ui/rc/utils'

import * as UI from '../../../NetworkMoreSettings/styledComponents'

export enum QoSMirroringScope {
    MSCS_REQUESTS_ONLY = 'MSCS_REQUESTS_ONLY',
    ALL_CLIENTS = 'ALL_CLIENTS'
}

function QoSMirroring ({ wlanData }: { wlanData: NetworkSaveData | null }) {
  const { $t } = useIntl()
  const qoSMirroringScopeOptions: {
        type: QoSMirroringScope
        label: string
        value: 'MSCS_REQUESTS_ONLY' | 'ALL_CLIENTS'
        key: 'MSCS_REQUESTS_ONLY' | 'ALL_CLIENTS'
        message: string
    }[] = [
      {
        type: QoSMirroringScope.MSCS_REQUESTS_ONLY,
        label: $t({ defaultMessage: 'MSCS requests only' }),
        value: 'MSCS_REQUESTS_ONLY',
        key: 'MSCS_REQUESTS_ONLY',
        message: $t({ defaultMessage: `Mirroring for clients sending MSCS 
                    (Multimedia and Streaming Control Server) requests` })
      },
      {
        type: QoSMirroringScope.ALL_CLIENTS,
        label: $t({ defaultMessage: 'All clients' }),
        value: 'ALL_CLIENTS',
        key: 'ALL_CLIENTS',
        message: $t({ defaultMessage: 'Mirroring for all clients connected to this Wi-Fi network.' })
      }
    ]

  const [
    qosMirroringEnabled,
    qosMirroringScope
  ] = [
    useWatch<boolean>(['wlan', 'advancedCustomization', 'qosMirroringEnabled']),
    useWatch<string>(['wlan', 'advancedCustomization', 'qosMirroringScope'])
  ]

  const initQosMirroringEnabled =
            get(wlanData, ['wlan', 'advancedCustomization', 'qosMirroringEnabled'], true)
  const initQosMirroringScope =
            get(wlanData, ['wlan', 'advancedCustomization', 'qosMirroringScope'],
              QoSMirroringScope.MSCS_REQUESTS_ONLY)

  return (
    <>
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
          name={['wlan', 'advancedCustomization', 'qosMirroringEnabled']}
          style={{ marginBottom: '10px', width: '300px' }}
          valuePropName='checked'
          initialValue={initQosMirroringEnabled}
          children={<Switch />}
        />
      </UI.FieldLabel>
      { qosMirroringEnabled &&
              <Form.Item
                label={$t({ defaultMessage: 'QoS Mirroring Scope' })}
                extra={
                  <div style={{ width: '250px' }}>
                    { qoSMirroringScopeOptions.find(option =>
                      option.value === qosMirroringScope)?.message }
                  </div>
                }
                name={['wlan', 'advancedCustomization', 'qosMirroringScope']}
                initialValue={initQosMirroringScope}
                children={
                  <Select
                    style={{ width: '280px', height: '30px', fontSize: '11px' }}
                    options={qoSMirroringScopeOptions}
                  />
                }
              />
      }
    </>
  )
}

export default QoSMirroring