import { Form, Switch, Space }       from 'antd'
import { useWatch }                  from 'antd/lib/form/Form'
import { DefaultOptionType }         from 'antd/lib/select'
import { FormattedMessage, useIntl } from 'react-intl'

import { Tooltip, Alert, StepsForm } from '@acx-ui/components'
import { Features, useIsSplitOn }    from '@acx-ui/feature-toggle'
import {
  IpsecOptionChangeDispatcher,
  IpsecOptionChangeState,
  SoftGreDuplicationChangeDispatcher,
  SoftGreDuplicationChangeState
} from '@acx-ui/rc/utils'

import { IPSecProfileSettings }   from './IPSecProfileSettings'
import { SoftGREProfileSettings } from './SoftGREProfileSettings'
import { FieldLabel }             from './styledComponents'
import { SoftGreIpsecProfile }    from './useIpsecProfileLimitedSelection'

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
  usedProfileData?: { data: SoftGreIpsecProfile[], operations: SoftGreIpsecProfile[] },
  ipsecOptionList?: DefaultOptionType[],
  ipsecOptionDispatch?: React.Dispatch<IpsecOptionChangeDispatcher>
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
    usedProfileData,
    ipsecOptionList,
    ipsecOptionDispatch
  } = props

  const isIpSecOverNetworkEnabled = useIsSplitOn(Features.WIFI_IPSEC_PSK_OVER_NETWORK_TOGGLE)

  const softgreTunnelFieldName = ['lan', index, 'softGreEnabled']
  const ipsecFieldName = ['lan', index, 'ipsecEnabled']
  const form = Form.useFormInstance()
  const isSoftGreTunnelToggleEnabled = useWatch<boolean>(softgreTunnelFieldName, form)
  const isIpSecToggleEnabled = useWatch<boolean>(ipsecFieldName, form)
  const softGreProfileId = useWatch<string>(['lan', index, 'softGreProfileId'], form)
  const ipsecProfileId = useWatch<string>(['lan', index, 'ipsecProfileId'], form)

  const isIpsecDisabled = () => {
    const target = [...usedProfileData?.data || [], ...usedProfileData?.operations || []]
    if (isUnderAPNetworking) {
      return target.filter(item => !(apModel === item.apModel && portId === item.portId))
        .some((item) => !!item.ipsecId)
    } else {
      return target.filter(item => !(serialNumber === item.serialNumber && portId === item.portId))
        .some((item) => !!item.ipsecId)
    }
  }

  const isIpsecChecked = () => {
    const target = [...usedProfileData?.data || [], ...usedProfileData?.operations || []]
    if (isUnderAPNetworking) {
      return target.filter(item => !(apModel === item.apModel && portId === item.portId))
        .some((item) => !!item.ipsecId) ? 'checked' : ''
    } else {
      return target.filter(item => !(serialNumber === item.serialNumber && portId === item.portId))
        .some((item) => !!item.ipsecId) ? 'checked' : ''
    }
  }
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
                  if (isIpSecOverNetworkEnabled) {
                    ipsecOptionDispatch && ipsecOptionDispatch({
                      state: IpsecOptionChangeState.OnChange,
                      index, portId, apModel, serialNumber
                    })
                  }
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
      {isSoftGreTunnelToggleEnabled && <>
        <Alert
          data-testid={'enable-softgre-tunnel-banner'}
          showIcon={true}
          style={{ verticalAlign: 'middle' }}
          message={$t({
            defaultMessage: 'Enabling on the uplink/WAN port will disconnect AP(s)' })
          }
        />
        {isIpSecOverNetworkEnabled &&
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
            />}
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
          ipsecOptionDispatch={isIpSecOverNetworkEnabled ? ipsecOptionDispatch : undefined}
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
              initialValue={isIpsecChecked()}
              children={
                <Switch
                  data-testid={'ipsec-switch'}
                  disabled={readonly || isIpsecDisabled()}
                  onChange={() => {
                    onGUIChanged?.('ipsecEnabled')
                    ipsecOptionDispatch && ipsecOptionDispatch({
                      state: IpsecOptionChangeState.OnChange,
                      portId, apModel, serialNumber
                    })
                  }}
                />
              }
            />
          </FieldLabel>}
        {isIpSecToggleEnabled &&
          <IPSecProfileSettings
            index={index}
            portId={portId}
            ipsecProfileId={ipsecProfileId}
            onGUIChanged={onGUIChanged}
            readonly={readonly}
            softGreProfileId={softGreProfileId}
            ipsecProfileOptionList={ipsecOptionList || []}
            ipsecOptionDispatch={ipsecOptionDispatch}
            apModel={apModel}
            serialNumber={serialNumber}
          />}
      </>
      }
    </>
  )
}
