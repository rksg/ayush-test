import { useContext } from 'react'

import { Form, Switch, Space } from 'antd'
import { useIntl }             from 'react-intl'

import { Tooltip, Alert } from '@acx-ui/components'

import { SoftgreProfileAndDHCP82Context } from './SoftGREProfileAndDHCP82Context'
import { SoftGREProfileSettings }         from './SoftGREProfileSettings'
import { FieldLabel }                     from './styledComponents'

interface SoftGRETunnelSettingsProps {
  isSoftGRETunnelToggleDisable: boolean
}


export const SoftGRETunnelSettings = (props: SoftGRETunnelSettingsProps) => {
  const { $t } = useIntl()
  const { softgreProfile, toggleSoftgreTunnel } = useContext(SoftgreProfileAndDHCP82Context)

  const {
    isSoftGRETunnelToggleDisable
  } = props

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
              checked={softgreProfile.isSoftgreTunnelEnable}
              disabled={isSoftGRETunnelToggleDisable}
              onClick={(checked) => toggleSoftgreTunnel(checked)}
            />
          }
        />
      </FieldLabel>
      {
        softgreProfile.isSoftgreTunnelEnable && <>
          <Alert
            data-testId={'enable-softgre-tunnel-banner'}
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