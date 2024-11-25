import { Form, Switch, Space } from 'antd'
import { useIntl }             from 'react-intl'

import { Tooltip, Alert } from '@acx-ui/components'

import { SoftGREProfileSettings } from './SoftGREProfileSettings'
import { FieldLabel }             from './styledComponents'

interface SoftGRETunnelSettingsProps {
  enableSoftGRETunnel: boolean
  setEnableSoftGRETunnel: (visible: boolean) => void
}


export const SoftGRETunnelSettings = (props: SoftGRETunnelSettingsProps) => {
  const { $t } = useIntl()

  const { enableSoftGRETunnel, setEnableSoftGRETunnel } = props

  return (
    <>
      <FieldLabel width='180px'>
        <Space style={{ marginBottom: '10px' }}>
          {$t({ defaultMessage: 'Enable SoftGRE Tunnel' })}
          <Tooltip.Question
            title={
              $t({ defaultMessage: 'Tunnel the traffic to a SoftGRE gateway. '+
              'Please note that the uplink port does not support ' +
              'SoftGRE tunneling, which will cause the AP(s) to disconnect.' })
            }
            placement='right'
            iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
          />
        </Space>
        <Form.Item
          valuePropName='checked'
          style={{ marginTop: '-5px' }}
          children={
            <Switch
              checked={enableSoftGRETunnel}
              onClick={(checked) => setEnableSoftGRETunnel(checked)}
            />
          }
        />
      </FieldLabel>
      {
        enableSoftGRETunnel && <>
          <Alert
            showIcon={true}
            style={{ verticalAlign: 'middle' }}
            message={$t({ defaultMessage: 'Enabling on the uplink will disconnect AP(s)' })}
          />
          <SoftGREProfileSettings />
        </>
      }
    </>
  )
}