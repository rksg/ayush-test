import { Form, Switch, Space }       from 'antd'
import { useWatch }                  from 'antd/lib/form/Form'
import { DefaultOptionType }         from 'antd/lib/select'
import { FormattedMessage, useIntl } from 'react-intl'

import { Tooltip, Alert, StepsForm } from '@acx-ui/components'
import { Features, useIsSplitOn }    from '@acx-ui/feature-toggle'
import {
  SoftGreDuplicationChangeDispatcher,
  SoftGreDuplicationChangeState
} from '@acx-ui/rc/utils'

import { Label } from '../policies'

import { IPSecProfileSettings }                 from './IPSecProfileSettings'
import { BoundSoftGreIpsec, SoftGreIpSecState } from './SoftGreIpSecState'
import { SoftGREProfileSettings }               from './SoftGREProfileSettings'
import { FieldLabel }                           from './styledComponents'

interface SoftGRETunnelSettingsProps {
  index: number;
  portId?: string;
  onGUIChanged?: (fieldName: string) => void;
  readonly: boolean;
  toggleButtonToolTip?: string
  softGREProfileOptionList?: DefaultOptionType[];
  apModel?: string
  serialNumber?: string
  isUnderAPNetworking: boolean
  optionDispatch?: React.Dispatch<SoftGreDuplicationChangeDispatcher>
  validateIsFQDNDuplicate: (softGreProfileId: string) => boolean,
  isVenueBoundIpsec?: boolean,
  boundSoftGreIpsecList?: BoundSoftGreIpsec[],
  softGreIpsecProfileValidator: (
    enabledSoftGre: boolean,
    softGreId: string,
    enabledIpsec: boolean,
    ipsecId: string) => Promise<void>
}

export const SoftGRETunnelSettings = (props: SoftGRETunnelSettingsProps) => {
  const { $t } = useIntl()
  const {
    index,
    portId,
    onGUIChanged,
    readonly,
    toggleButtonToolTip,
    softGREProfileOptionList,
    apModel,
    serialNumber,
    isUnderAPNetworking,
    optionDispatch,
    validateIsFQDNDuplicate,
    isVenueBoundIpsec,
    boundSoftGreIpsecList,
    softGreIpsecProfileValidator
  } = props

  const isIpSecOverNetworkEnabled = useIsSplitOn(Features.WIFI_IPSEC_PSK_OVER_NETWORK_TOGGLE)

  const softgreTunnelFieldName = ['lan', index, 'softGreEnabled']
  const ipsecFieldName = ['lan', index, 'ipsecEnabled']
  const form = Form.useFormInstance()
  const isSoftGreTunnelToggleEnabled = useWatch<boolean>(softgreTunnelFieldName, form)
  const isIpSecToggleEnabled = useWatch<boolean>(ipsecFieldName, form)
  const softGreProfileId = useWatch<string>(['lan', index, 'softGreProfileId'], form)
  const ipsecProfileId = useWatch<string>(['lan', index, 'ipsecProfileId'], form)
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
                onChange={(value) => {
                  onGUIChanged?.('softGreEnabled')
                  const voter = (isUnderAPNetworking ?
                    { serialNumber, portId: portId ?? '0' }:
                    { model: apModel, portId: portId ?? '0' })
                  if (value) {
                    optionDispatch && optionDispatch ({
                      state: SoftGreDuplicationChangeState.TurnOnSoftGre,
                      softGreProfileId: form.getFieldValue(['lan', index, 'softGreProfileId']),
                      voter: voter
                    })
                  }
                  else {
                    optionDispatch && optionDispatch ({
                      state: SoftGreDuplicationChangeState.TurnOffSoftGre,
                      voter: voter
                    })
                  }
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
            message={$t({
              defaultMessage: 'Enabling on the uplink/WAN port will disconnect AP(s)' })
            }
          />
          {isIpSecOverNetworkEnabled &&
          <>
            <Alert
              data-testid={'enable-ipsec-banner'}
              showIcon={true}
              style={{ verticalAlign: 'middle' }}
              message={
                <FormattedMessage
                // eslint-disable-next-line max-len
                  defaultMessage={'A <venueSingular></venueSingular> supports <b>up to 3 SoftGRE activated profiles without IPsec</b> or <b>1 SoftGRE with IPsec.</b>'}
                  values={{
                    b: chunks => <b>{chunks}</b>
                  }}
                />}
            />
            {(boundSoftGreIpsecList && boundSoftGreIpsecList.length > 0) &&
              boundSoftGreIpsecList.map(boundProfile => {
                return <><Label style={{ width: '220px' }}>{
                  // eslint-disable-next-line max-len
                  $t({ defaultMessage: 'SoftGRE: {softGreName}, IPsec: {ipsecName}, ActionLevel: {actionLevel}' },
                    {
                      softGreName: boundProfile.softGreName,
                      ipsecName: boundProfile.ipsecName,
                      actionLevel: boundProfile.actionLevel
                    })}</Label><br /></>
              })
            }
            <Form.Item
              style={{ textAlign: 'left', marginTop: '-15px', minHeight: '0px' }}
              name={['lan', index, 'softGreIpsecValidator']}
              rules={[{ validator: () => softGreIpsecProfileValidator(
                form.getFieldValue(['lan', index, 'softGreEnabled']),
                form.getFieldValue(['lan', index, 'softGreProfileId']),
                form.getFieldValue(['lan', index, 'ipsecEnabled']),
                form.getFieldValue(['lan', index, 'ipsecProfileId'])
              ) }]}></Form.Item>
          </>}
          <SoftGREProfileSettings
            index={index}
            softGreProfileId={softGreProfileId}
            onGUIChanged={onGUIChanged}
            readonly={readonly}
            portId={portId}
            softGREProfileOptionList={softGREProfileOptionList}
            apModel={apModel}
            serialNumber={serialNumber}
            isUnderAPNetworking={isUnderAPNetworking}
            optionDispatch={optionDispatch}
            validateIsFQDNDuplicate={validateIsFQDNDuplicate}
          />
          {isIpSecOverNetworkEnabled &&
          <FieldLabel width='220px'>
            <Space>
              {$t({ defaultMessage: 'Enable IPsec' })}
              <Tooltip.Question
                title={toggleButtonToolTip ||
                  $t({ defaultMessage: 'Enable IPsec' })
                }
                placement='right'
                iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
              />
            </Space>
            <Form.Item
              valuePropName='checked'
              style={{ marginTop: '-5px' }}
              name={ipsecFieldName}
              children={
                <Switch
                  data-testid={'ipsec-switch'}
                  disabled={readonly}
                  onChange={() => {
                    onGUIChanged?.('ipsecEnabled')
                  }}
                />
              }
            />
          </FieldLabel>}
          {isIpSecToggleEnabled &&
          <IPSecProfileSettings
            index={index}
            ipsecProfileId={ipsecProfileId}
            onGUIChanged={onGUIChanged}
            readonly={readonly}
            softGreProfileId={softGreProfileId}
          />}
        </>
      }
    </>
  )
}
