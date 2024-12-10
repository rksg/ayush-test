import { useContext, useEffect } from 'react'

import { Form, Switch, Space } from 'antd'
import { useIntl }             from 'react-intl'

import { Tooltip, Alert } from '@acx-ui/components'

import { SoftgreProfileAndDHCP82Context } from './SoftGREProfileAndDHCP82Context'
import { SoftGREProfileSettings }         from './SoftGREProfileSettings'
import { FieldLabel }                     from './styledComponents'

interface SoftGRETunnelSettingsProps {
  isSoftGRETunnelToggleDisable: boolean,
  index: number
  softgreProfileId: string
  softgreTunnelEnable: boolean
  setSoftgreTunnelEnable: Function
  onGUIChanged?: (fieldName: string) => void
}


export const SoftGRETunnelSettings = (props: SoftGRETunnelSettingsProps) => {
  const { $t } = useIntl()
  const { onChangeSoftgreTunnel } = useContext(SoftgreProfileAndDHCP82Context)
  const {
    isSoftGRETunnelToggleDisable,
    index,
    softgreProfileId,
    softgreTunnelEnable,
    setSoftgreTunnelEnable,
    onGUIChanged
  } = props
  const form = Form.useFormInstance()
  const softgreTunnelFieldName = ['lan', index, 'softgreTunnelEnable']

  useEffect(() => {
    form.setFieldValue(softgreTunnelFieldName, softgreTunnelEnable)
  }, [softgreTunnelEnable])

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
          name={softgreTunnelFieldName}
          children={
            <Switch
              disabled={isSoftGRETunnelToggleDisable}
              onClick={(checked) => {
                setSoftgreTunnelEnable(checked)
                onGUIChanged && onGUIChanged('softgreTunnelEnable')
                onChangeSoftgreTunnel && onChangeSoftgreTunnel(checked)
              }}
            />
          }
        />
      </FieldLabel>
      {
        softgreTunnelEnable && <>
          <Alert
            data-testId={'enable-softgre-tunnel-banner'}
            showIcon={true}
            style={{ verticalAlign: 'middle' }}
            message={$t({ defaultMessage: 'Enabling on the uplink will disconnect AP(s)' })}
          />
          <SoftGREProfileSettings
            index={index}
            softgreProfileId={softgreProfileId}
            onGUIChanged={onGUIChanged}
          />
        </>
      }
    </>
  )
}
