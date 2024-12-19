import { Form, Space, Switch } from 'antd'
import { useIntl }             from 'react-intl'

import { Tooltip, Alert, StepsForm } from '@acx-ui/components'

import { SoftGREProfileSettings } from './SoftGREProfileSettings'

interface SoftGRETunnelSettingsProps {
  index: number
  softGreProfileId: string
  softGreTunnelEnable: boolean
  onGUIChanged?: (fieldName: string) => void
  readonly: boolean
}

export const SoftGRETunnelSettings = (props: SoftGRETunnelSettingsProps) => {
  const { $t } = useIntl()
  const {
    index,
    softGreProfileId,
    softGreTunnelEnable,
    onGUIChanged,
    readonly
  } = props

  const softgreTunnelFieldName = ['lan', index, 'softGreTunnelEnable']

  return (
    <>
      <StepsForm.FieldLabel width={'220px'}>
        <Space>
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
          name={softgreTunnelFieldName}
          children={
            <Switch
              data-testid={'softgre-tunnel-switch'}
              disabled={readonly}
              onClick={() => {
                onGUIChanged && onGUIChanged('softGreTunnelEnable')
              }}
            />
          }
        />
      </StepsForm.FieldLabel>
      {
        softGreTunnelEnable && <>
          <Alert
            data-testid={'enable-softgre-tunnel-banner'}
            showIcon={true}
            style={{ verticalAlign: 'middle' }}
            message={$t({ defaultMessage: 'Enabling on the uplink will disconnect AP(s)' })}
          />
          <SoftGREProfileSettings
            index={index}
            softGreProfileId={softGreProfileId}
            onGUIChanged={onGUIChanged}
            readonly={readonly}
          />
        </>
      }
    </>
  )
}
