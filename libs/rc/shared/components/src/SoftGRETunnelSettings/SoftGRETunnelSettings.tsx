import { useEffect, useRef, useState } from 'react'

import { Form, Switch, Space }       from 'antd'
import { useWatch }                  from 'antd/lib/form/Form'
import { DefaultOptionType }         from 'antd/lib/select'
import { isEqual }                   from 'lodash'
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
  const isIpsecToggleEnabled = useWatch<boolean>(ipsecFieldName, form)
  const softGreProfileId = useWatch<string>(['lan', index, 'softGreProfileId'], form)
  const ipsecProfileId = useWatch<string>(['lan', index, 'ipsecProfileId'], form)
  const [isSoftGreProfileDisabled, setSoftGreProfileDisabled] = useState(false)
  const [isIpsecDisabled, setIsIpsecDisabled] = useState(false)

  function usePrevious (value: {
    data: SoftGreIpsecProfile[];
    operations: SoftGreIpsecProfile[];
  } | undefined) {
    const ref = useRef<{
      data: SoftGreIpsecProfile[];
      operations: SoftGreIpsecProfile[];
  }>()
    useEffect(() => {
      ref.current = value
    }, [value])
    return ref.current
  }
  const previous = usePrevious(usedProfileData)

  const onFormChange = () => {
    if (!isEqual(usedProfileData, previous)) {
      onGUIChanged && onGUIChanged('ipsecEnabled')
    }
  }

  useEffect(() => {
    //eslint-disable-next-line no-console
    console.log('portId:', portId,
      '\tsoftGreProfileId:', softGreProfileId,
      '\tipsecProfileId:', ipsecProfileId,
      '\tisSoftGreTunnelToggleEnabled:', isSoftGreTunnelToggleEnabled,
      '\tisIpsecToggleEnabled:', isIpsecToggleEnabled,
      '\tusedProfileData: ', usedProfileData?.data,
      '\t\toperations: ', usedProfileData?.operations)
    const target = usedProfileData?.data || []
    const operations = usedProfileData?.operations || []
    if (!isSoftGreTunnelToggleEnabled) {
      form.setFieldValue(['lan', index, 'softGreProfileId'], '')
      form.setFieldValue(['lan', index, 'ipsecProfileId'], '')
      form.setFieldValue(ipsecFieldName, false)
      setSoftGreProfileDisabled(false)
      setIsIpsecDisabled(false)
      return
    }
    if (target.length > 0) {
      let standardOp = target.find(a => isUnderAPNetworking ?
        a.portId === portId && a.serialNumber === serialNumber :
        a.portId === portId && a.apModel === apModel)
      let isDbData = true
      if (!!!standardOp) {
        isDbData = false
        standardOp = target[0]
      }
      if (!!standardOp.ipsecId) {
        setIsIpsecDisabled(true)
        setSoftGreProfileDisabled(true)
        form.setFieldValue(ipsecFieldName, true)
        form.setFieldValue(['lan', index, 'softGreProfileId'], target[0].softGreId)
        if (ipsecProfileId !== standardOp.ipsecId) {
          form.setFieldValue(['lan', index, 'ipsecProfileId'], target[0].ipsecId)
          onFormChange()
        }
      } else if (!!standardOp.softGreId) {
        setIsIpsecDisabled(true)
        form.setFieldValue(ipsecFieldName, false)
        if (isDbData) {
          setSoftGreProfileDisabled(true)
          form.setFieldValue(['lan', index, 'softGreProfileId'], standardOp.softGreId)
          onFormChange()
        }
      }
    } else if (operations.length > 0) {
      const currentOps = isUnderAPNetworking ?
        operations.filter(a => a.portId === portId && a.serialNumber === serialNumber)
        : operations.filter(a => a.portId === portId && a.apModel === apModel)
      if (currentOps.length > 0) {
        if (operations.length > 1) {
          const standardOps = isUnderAPNetworking ?
            operations.filter(a => a.serialNumber !== serialNumber || a.portId !== portId) :
            operations.filter(a => a.apModel !== apModel || a.portId !== portId)
          if (!!standardOps[0].ipsecId) {
            if (ipsecProfileId !== standardOps[0].ipsecId) {
              form.setFieldValue(['lan', index, 'softGreProfileId'], standardOps[0].softGreId)
              form.setFieldValue(['lan', index, 'ipsecProfileId'], standardOps[0].ipsecId)
              ipsecOptionDispatch && ipsecOptionDispatch({
                state: IpsecOptionChangeState.OnChange,
                index, portId, apModel, serialNumber
              })
            }
            setIsIpsecDisabled(true)
            setSoftGreProfileDisabled(true)
            form.setFieldValue(ipsecFieldName, true)
            onFormChange()
          } else if (!!standardOps[0].softGreId) {
            setIsIpsecDisabled(true)
            form.setFieldValue(ipsecFieldName, false)
            onFormChange()
          }
        } else {
          setSoftGreProfileDisabled(false)
          setIsIpsecDisabled(false)
        }
      }
    } else {
      form.setFieldValue(ipsecFieldName, false)
      setSoftGreProfileDisabled(false)
      setIsIpsecDisabled(false)
      onFormChange()
    }

  }, [usedProfileData])

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
          readonly={readonly || isSoftGreProfileDisabled}
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
              children={
                <Switch
                  data-testid={'ipsec-switch'}
                  disabled={readonly || isIpsecDisabled}
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
        {isIpSecOverNetworkEnabled &&
          <IPSecProfileSettings
            index={index}
            portId={portId}
            ipsecProfileId={ipsecProfileId}
            onGUIChanged={onGUIChanged}
            readonly={readonly || isIpsecDisabled}
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
