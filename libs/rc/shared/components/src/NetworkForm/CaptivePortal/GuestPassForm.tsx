import { useContext, useEffect } from 'react'

import { Form }    from 'antd'
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
import { WlanSecurityFormItems }                 from './SharedComponent/WlanSecurity/WlanSecuritySettings'

export function GuestPassForm () {
  const {
    data,
    editMode,
    isRuckusAiMode,
    cloneMode
  } = useContext(NetworkFormContext)
  const intl = useIntl()
  const form = Form.useFormInstance()

  useEffect(()=>{
    if((editMode || cloneMode) && data){
      form.setFieldsValue({ ...data })
    }
  }, [data])
  return (<>
    <GridRow>
      <GridCol col={{ span: 10 }}>
        <StepsFormLegacy.Title children={intl.$t({ defaultMessage: 'Host Settings' })} />
        <WlanSecurityFormItems />
        <RedirectUrlInput></RedirectUrlInput>
        <DhcpCheckbox />
        <BypassCaptiveNetworkAssistantCheckbox/>
        <WalledGardenTextArea
          enableDefaultWalledGarden={false} />
      </GridCol>
      <GridCol col={{ span: 14 }}>
        <NetworkDiagram type={NetworkTypeEnum.CAPTIVEPORTAL}
          networkPortalType={GuestNetworkTypeEnum.GuestPass}
          wlanSecurity={data?.wlan?.wlanSecurity} />
      </GridCol>
    </GridRow>
    {!(editMode) && !(isRuckusAiMode) && <GridRow>
      <GridCol col={{ span: 24 }}>
        <NetworkMoreSettingsForm wlanData={data as NetworkSaveData} />
      </GridCol>
    </GridRow>}
  </>
  )
}
