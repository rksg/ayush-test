import { useContext, useEffect } from 'react'

import {
  Form
} from 'antd'
import { useWatch } from 'antd/lib/form/Form'
import { useIntl }  from 'react-intl'

import { GridCol, GridRow, StepsFormLegacy }                      from '@acx-ui/components'
import { useIsSplitOn, Features }                                 from '@acx-ui/feature-toggle'
import { GuestNetworkTypeEnum, NetworkSaveData, NetworkTypeEnum } from '@acx-ui/rc/utils'

import { NetworkDiagram }          from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext          from '../NetworkFormContext'
import { NetworkMoreSettingsForm } from '../NetworkMoreSettings/NetworkMoreSettingsForm'
import { AccountingServiceInput }  from '../SharedComponent'

import { DhcpCheckbox }                          from './DhcpCheckbox'
import { RedirectUrlInput }                      from './RedirectUrlInput'
import { BypassCaptiveNetworkAssistantCheckbox } from './SharedComponent/BypassCNA/BypassCaptiveNetworkAssistantCheckbox'
import { WalledGardenTextArea }                  from './SharedComponent/WalledGarden/WalledGardenTextArea'
import { WlanSecurityFormItems }                 from './SharedComponent/WlanSecurity/WlanSecuritySettings'

export function OnboardingForm () {
  const {
    data,
    editMode,
    isRuckusAiMode,
    cloneMode
  } = useContext(NetworkFormContext)
  const intl = useIntl()
  const form = Form.useFormInstance()

  const networkSecurity = useWatch('networkSecurity', form)
  const enableAccountingProxy = useWatch('enableAccountingProxy', form)
  const enableAccountingService = useWatch('enableAccountingService', form)

  // eslint-disable-next-line max-len
  const isSupportNetworkRadiusAccounting = useIsSplitOn(Features.WIFI_NETWORK_RADIUS_ACCOUNTING_TOGGLE)

  useEffect(()=>{
    if((editMode || cloneMode) && data){
      form.setFieldsValue({ ...data })
    }
  }, [data?.id])
  return (<>
    <GridRow>
      <GridCol col={{ span: 10 }}>
        <StepsFormLegacy.Title>{intl.$t({ defaultMessage: 'Onboarding' })}</StepsFormLegacy.Title>
        <WlanSecurityFormItems />
        <RedirectUrlInput />
        <DhcpCheckbox />
        <BypassCaptiveNetworkAssistantCheckbox/>
        <WalledGardenTextArea
          enableDefaultWalledGarden={false} />
        {isSupportNetworkRadiusAccounting &&
          <AccountingServiceInput
            isProxyModeConfigurable={true}
          />
        }
      </GridCol>
      <GridCol col={{ span: 14 }}>
        <NetworkDiagram
          type={NetworkTypeEnum.CAPTIVEPORTAL}
          networkPortalType={GuestNetworkTypeEnum.ClickThrough}
          wlanSecurity={data?.wlan?.wlanSecurity}
          networkSecurity={networkSecurity}
          enableAccountingService={enableAccountingService}
          enableAccountingProxy={enableAccountingProxy}
        />
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
