
import { useState, useContext, useEffect } from 'react'

import {
  Checkbox,
  Form
} from 'antd'
import { useIntl } from 'react-intl'

import { GridCol, GridRow, StepsForm }    from '@acx-ui/components'
import { CaptivePassphraseExpirationEnum, NetworkSaveData,
  GuestNetworkTypeEnum, NetworkTypeEnum } from '@acx-ui/rc/utils'

import { captivePasswordExpiration } from '../contentsMap'
import { NetworkDiagram }            from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext            from '../NetworkFormContext'
import { NetworkMoreSettingsForm }   from '../NetworkMoreSettings/NetworkMoreSettingsForm'

import { DhcpCheckbox }     from './DhcpCheckbox'
import { DomainsInput }     from './DomainsInput'
import { RedirectUrlInput } from './RedirectUrlInput'


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
        <StepsForm.Title>{$t({ defaultMessage: 'Host Settings' })}</StepsForm.Title>
        <DomainsInput required={true}/>
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
        {!(editMode) && <NetworkMoreSettingsForm wlanData={data as NetworkSaveData} />}
      </GridCol>
      <GridCol col={{ span: 14 }}>
        <NetworkDiagram type={NetworkTypeEnum.CAPTIVEPORTAL}
          networkPortalType={GuestNetworkTypeEnum.HostApproval}/>
      </GridCol>
    </GridRow>
  )
}
