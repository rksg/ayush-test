import { useContext, useEffect } from 'react'

import {
  Form
} from 'antd'
import { useIntl } from 'react-intl'

import { GridCol, GridRow, StepsFormLegacy }                      from '@acx-ui/components'
import { GuestNetworkTypeEnum, NetworkSaveData, NetworkTypeEnum } from '@acx-ui/rc/utils'

import { NetworkDiagram }          from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext          from '../NetworkFormContext'
import { NetworkMoreSettingsForm } from '../NetworkMoreSettings/NetworkMoreSettingsForm'

import { DhcpCheckbox }                          from './DhcpCheckbox'
import { RedirectUrlInput }                      from './RedirectUrlInput'
import { BypassCaptiveNetworkAssistantCheckbox } from './SharedComponent/BypassCNA/BypassCaptiveNetworkAssistantCheckbox'
import { WalledGardenTextArea }                  from './SharedComponent/WalledGarden/WalledGardenTextArea'

export function OnboardingForm () {
  const {
    data,
    editMode,
    cloneMode
  } = useContext(NetworkFormContext)
  const intl = useIntl()
  const form = Form.useFormInstance()
  useEffect(()=>{
    if((editMode || cloneMode) && data){
      form.setFieldsValue({ ...data })
      if(data.guestPortal?.redirectUrl){
        form.setFieldValue('redirectCheckbox',true)
      }
    }
  }, [data])
  return (<>
    <GridRow>
      <GridCol col={{ span: 10 }}>
        <StepsFormLegacy.Title>{intl.$t({ defaultMessage: 'Onboarding' })}</StepsFormLegacy.Title>
        <RedirectUrlInput />
        <DhcpCheckbox />
        <BypassCaptiveNetworkAssistantCheckbox
          guestNetworkTypeEnum={GuestNetworkTypeEnum.ClickThrough} />
        <WalledGardenTextArea
          guestNetworkTypeEnum={GuestNetworkTypeEnum.ClickThrough}
          enableDefaultWalledGarden={false} />
      </GridCol>
      <GridCol col={{ span: 14 }}>
        <NetworkDiagram type={NetworkTypeEnum.CAPTIVEPORTAL}
          networkPortalType={GuestNetworkTypeEnum.ClickThrough} />
      </GridCol>
    </GridRow>
    {!(editMode) && <GridRow>
      <GridCol col={{ span: 24 }}>
        <NetworkMoreSettingsForm wlanData={data as NetworkSaveData} />
      </GridCol>
    </GridRow>}
  </>
  )
}


