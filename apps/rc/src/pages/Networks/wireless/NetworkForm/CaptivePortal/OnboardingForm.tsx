import { useContext, useEffect } from 'react'

import {
  Form
} from 'antd'
import { useIntl } from 'react-intl'

import { GridCol, GridRow, StepsForm }                            from '@acx-ui/components'
import { GuestNetworkTypeEnum, NetworkSaveData, NetworkTypeEnum } from '@acx-ui/rc/utils'

import { NetworkDiagram }          from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext          from '../NetworkFormContext'
import { NetworkMoreSettingsForm } from '../NetworkMoreSettings/NetworkMoreSettingsForm'

import { DhcpCheckbox }     from './DhcpCheckbox'
import { RedirectUrlInput } from './RedirectUrlInput'

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
  return (
    <GridRow>
      <GridCol col={{ span: 10 }}>
        <StepsForm.Title>{intl.$t({ defaultMessage: 'Onboarding' })}</StepsForm.Title>
        <RedirectUrlInput />
        <DhcpCheckbox />
        {!(editMode) && <NetworkMoreSettingsForm wlanData={data as NetworkSaveData} />}
      </GridCol>
      <GridCol col={{ span: 14 }}>
        <NetworkDiagram type={NetworkTypeEnum.CAPTIVEPORTAL}
          networkPortalType={GuestNetworkTypeEnum.ClickThrough} />
      </GridCol>
    </GridRow>
  )
}


