import { useContext, useEffect } from 'react'

import {
  Form, Switch
} from 'antd'
import { useIntl } from 'react-intl'

import { GridCol, GridRow, StepsFormLegacy, Tooltip }                                                    from '@acx-ui/components'
import { GuestNetworkTypeEnum, NetworkSaveData, NetworkTypeEnum, WifiNetworkMessages, WlanSecurityEnum } from '@acx-ui/rc/utils'

import { NetworkDiagram }          from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext          from '../NetworkFormContext'
import { NetworkMoreSettingsForm } from '../NetworkMoreSettings/NetworkMoreSettingsForm'

import { DhcpCheckbox }                          from './DhcpCheckbox'
import { RedirectUrlInput }                      from './RedirectUrlInput'
import { BypassCaptiveNetworkAssistantCheckbox } from './SharedComponent/BypassCNA/BypassCaptiveNetworkAssistantCheckbox'
import { WalledGardenTextArea }                  from './SharedComponent/WalledGarden/WalledGardenTextArea'


export function GuestPassForm () {
  const {
    data,
    editMode,
    cloneMode
  } = useContext(NetworkFormContext)
  const intl = useIntl()
  const form = Form.useFormInstance()
  const enableOweEncryption = useIsSplitOn(Features.WIFI_EDA_OWE_TOGGLE)
  useEffect(()=>{
    if((editMode || cloneMode) && data){
      form.setFieldsValue({ ...data })
      if(data.guestPortal?.redirectUrl){
        form.setFieldValue('redirectCheckbox',true)
      }
      if(data.wlan?.wlanSecurity){
        form.setFieldValue('enableOwe',
          data.wlan.wlanSecurity === WlanSecurityEnum.OWE ? true : false)
      }
    }
  }, [data])
  return (
    <GridRow>
      <GridCol col={{ span: 10 }}>
        <StepsFormLegacy.Title children={intl.$t({ defaultMessage: 'Host Settings' })} />
        <RedirectUrlInput></RedirectUrlInput>
        {enableOweEncryption && <Form.Item>
          <Form.Item noStyle
            name='enableOwe'
            initialValue={false}
            valuePropName='checked'
            children={<Switch
              onChange={function (checked: boolean) {
                form.setFieldValue(['wlan', 'wlanSecurity'],
                  checked ? WlanSecurityEnum.OWE : WlanSecurityEnum.None)
              }} />}
          />
          <span>{intl.$t({ defaultMessage: 'Enable OWE encryption' })}</span>
          <Tooltip.Question
            title={intl.$t(WifiNetworkMessages.ENABLE_OWE_TOOLTIP)}
            placement='bottom'
          />
        </Form.Item>}
        <DhcpCheckbox />
        <BypassCaptiveNetworkAssistantCheckbox
          guestNetworkTypeEnum={GuestNetworkTypeEnum.GuestPass} />
        <WalledGardenTextArea
          guestNetworkTypeEnum={GuestNetworkTypeEnum.GuestPass}
          enableDefaultWalledGarden={false} />
        {!(editMode) && <NetworkMoreSettingsForm wlanData={data as NetworkSaveData} />}
      </GridCol>
      <GridCol col={{ span: 14 }}>
        <NetworkDiagram type={NetworkTypeEnum.CAPTIVEPORTAL}
          networkPortalType={GuestNetworkTypeEnum.GuestPass}/>
      </GridCol>
    </GridRow>
  )
}
