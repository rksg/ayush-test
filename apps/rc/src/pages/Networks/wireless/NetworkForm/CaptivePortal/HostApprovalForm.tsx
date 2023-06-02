
import { useState, useContext, useEffect } from 'react'

import {
  Checkbox,
  Form,
  Input
} from 'antd'
import { useIntl } from 'react-intl'

import { GridCol, GridRow, StepsFormLegacy, Tooltip }        from '@acx-ui/components'
import { CaptivePassphraseExpirationEnum, NetworkSaveData,
  GuestNetworkTypeEnum, NetworkTypeEnum, domainsNameRegExp } from '@acx-ui/rc/utils'

import { captivePasswordExpiration } from '../contentsMap'
import { NetworkDiagram }            from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext            from '../NetworkFormContext'
import { NetworkMoreSettingsForm }   from '../NetworkMoreSettings/NetworkMoreSettingsForm'

import { DhcpCheckbox }                          from './DhcpCheckbox'
import { RedirectUrlInput }                      from './RedirectUrlInput'
import { BypassCaptiveNetworkAssistantCheckbox } from './SharedComponent/BypassCNA/BypassCaptiveNetworkAssistantCheckbox'
import { WalledGardenTextArea }                  from './SharedComponent/WalledGarden/WalledGardenTextArea'


export function HostApprovalForm () {
  const {
    data,
    editMode,
    cloneMode
  } = useContext(NetworkFormContext)
  const { $t } = useIntl()
  const { useWatch } = Form
  const form = Form.useFormInstance()
  const passwordExpiration = useWatch(['guestPortal','hostGuestConfig','hostDurationChoices'])
  const [passwordExp, setPasswordExp]=useState((passwordExpiration||[
    '1','4','24']))
  const expirationKey = Object.keys(CaptivePassphraseExpirationEnum) as Array<
  keyof typeof CaptivePassphraseExpirationEnum>
  useEffect(()=>{
    if((editMode || cloneMode) && data){
      form.setFieldsValue({ ...data })
      setPasswordExp(data.guestPortal?.hostGuestConfig?.hostDurationChoices.toString().split(','))
      if(data.guestPortal?.redirectUrl){
        form.setFieldValue('redirectCheckbox',true)
      }
    }
  }, [data])
  return (
    <GridRow>
      <GridCol col={{ span: 10 }}>
        <StepsFormLegacy.Title>{$t({ defaultMessage: 'Host Settings' })}</StepsFormLegacy.Title>
        <Form.Item
          name={['guestPortal','hostGuestConfig', 'hostDomains']}
          label={<>
            {$t({ defaultMessage: 'Host Domains' })}
            <Tooltip.Question title={$t({ defaultMessage:
            'Only hosts from these domains will be allowed to approve guest requests' })}
            placement='bottom' />
          </>}
          rules={[
            { required: true },
            { validator: (_, value) => domainsNameRegExp(
              (Array.isArray(value)? value : value.split(',')), true)
            }]
          }
          validateFirst
          hasFeedback
          children={
            <Input onChange={(e)=>
              form.setFieldValue(['guestPortal','hostGuestConfig', 'hostDomains'],
                e.target.value.split(','))
            }
            placeholder={$t({ defaultMessage: 'Enter domain(s) separated by comma' })}
            />
          }
        />
        <Form.Item
          name={['guestPortal','hostGuestConfig', 'hostDurationChoices']}
          initialValue={['1','4','24']}
          label={<>
            {$t({ defaultMessage: 'Password Expiration Options:' })}<br/>
            {$t({ defaultMessage: '(Host will see only selected options)' })}
          </>}
          children={<>
            {expirationKey.map((key) => <div key={key+'hostDiv'} style={{ marginBottom: 5 }}>
              <Checkbox key={key+'host'}
                checked={passwordExp.findIndex((val:string)=> {
                  return val===CaptivePassphraseExpirationEnum[key]})>-1}
                disabled={passwordExp.length===1&&
                  passwordExp.findIndex((val:string)=> {
                    return val===CaptivePassphraseExpirationEnum[key]})>-1}
                onChange={(e)=>{
                  const expirationArray = [...passwordExp]
                  if(e.target.checked){
                    expirationArray.push(CaptivePassphraseExpirationEnum[key])

                  }else{
                    expirationArray.map((val, i)=>{
                      if(val===CaptivePassphraseExpirationEnum[key]){
                        return expirationArray.splice(i,1)
                      }
                      return true
                    })
                  }
                  setPasswordExp(expirationArray)
                  form.setFieldValue(['guestPortal','hostGuestConfig', 'hostDurationChoices'],
                    expirationArray)
                }}
              >
                {$t(captivePasswordExpiration[CaptivePassphraseExpirationEnum[key]])}
              </Checkbox></div>)}
          </>
          }
        />
        <RedirectUrlInput/>
        <DhcpCheckbox />
        <BypassCaptiveNetworkAssistantCheckbox
          guestNetworkTypeEnum={GuestNetworkTypeEnum.HostApproval} />
        <WalledGardenTextArea
          guestNetworkTypeEnum={GuestNetworkTypeEnum.HostApproval}
          enableDefaultWalledGarden={false} />
        {!(editMode) && <NetworkMoreSettingsForm wlanData={data as NetworkSaveData} />}
      </GridCol>
      <GridCol col={{ span: 14 }}>
        <NetworkDiagram type={NetworkTypeEnum.CAPTIVEPORTAL}
          networkPortalType={GuestNetworkTypeEnum.HostApproval}/>
      </GridCol>
    </GridRow>
  )
}
