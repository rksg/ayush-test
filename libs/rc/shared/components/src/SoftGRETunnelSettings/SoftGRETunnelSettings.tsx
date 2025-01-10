import { Form, Switch, Space } from 'antd'
import { useWatch }            from 'antd/lib/form/Form'
import { useIntl }             from 'react-intl'

import { Tooltip, Alert, StepsForm } from '@acx-ui/components'

import { SoftGREProfileSettings } from './SoftGREProfileSettings'
import { FieldLabel }             from './styledComponents'

interface SoftGRETunnelSettingsProps {
  index: number;
  portId?: string;
  onGUIChanged?: (fieldName: string) => void;
  readonly: boolean;
  toggleButtonToolTip?: string
}

export const SoftGRETunnelSettings = (props: SoftGRETunnelSettingsProps) => {
  const { $t } = useIntl()
  const {
    index,
    portId,
    onGUIChanged,
    readonly,
    toggleButtonToolTip
  } = props

  const softgreTunnelFieldName = ['lan', index, 'softGreEnabled']
  const form = Form.useFormInstance()
  const isSoftGreTunnelToggleEnabled = useWatch<boolean>(softgreTunnelFieldName, form)
  const softGreProfileId = useWatch<string>(['lan', index, 'softGreProfileId'], form)
  return (
    <>
      <StepsForm.StepForm>
        <FieldLabel width='220px'>
          <Space>
            {$t({ defaultMessage: 'Enable SoftGRE Tunnel' })}
            <Tooltip.Question
              title={toggleButtonToolTip ||
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
                onChange={() => {
                  onGUIChanged?.('softGreEnabled')
                }}
              />
            }
          />
        </FieldLabel>
      </StepsForm.StepForm>
      {
        isSoftGreTunnelToggleEnabled && <>
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
            portId={portId}
          />
        </>
      }
    </>
  )
}
