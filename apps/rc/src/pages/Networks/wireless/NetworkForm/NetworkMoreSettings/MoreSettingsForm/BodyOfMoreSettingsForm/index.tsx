import React, { useContext } from 'react'

import { Form }     from 'antd'
import { useWatch } from 'antd/lib/form/Form'

import { Features, useIsSplitOn }                                                   from '@acx-ui/feature-toggle'
import { GuestNetworkTypeEnum, NetworkSaveData, NetworkTypeEnum, WlanSecurityEnum } from '@acx-ui/rc/utils'

import NetworkFormContext from '../../../../NetworkForm/NetworkFormContext'
import {
  hasAccountingRadius,
  hasAuthRadius,
  hasVxLanTunnelProfile
} from '../../../../NetworkForm/utils'


import AdvancedOfMoreSettingsForm       from './AdvancedOfMoreSettingsForm'
import NetworkControlOfMoreSettingsForm from './NetworkControlOfMoreSettingsForm'
import NetworkingOfMoreSettingsForm     from './NetworkingOfMoreSettingsForm'
import RadioOfMoreSettingsForm          from './RadioOfMoreSettingsForm'
import RadiusOptionsOfMoreSettingsForm  from './RadiusOptionsOfMoreSettingsForm'
import UserConnectionOfMoreSettingsForm from './UserConnectionOfMoreSettingsForm'
import VLANOfNetworkMoreSettingsForm    from './VLANOfMoreSettingsForm'


interface BodyOfMoreSettingsFormProps {
    selectedTabValue: string
    wlanData: NetworkSaveData | null
}
export default function BodyOfMoreSettingsForm (props: BodyOfMoreSettingsFormProps) {
  const { editMode, data } = useContext(NetworkFormContext)
  const enableBSSPriority = useIsSplitOn(Features.WIFI_EDA_BSS_PRIORITY_TOGGLE)
  const isRadiusOptionsSupport = useIsSplitOn(Features.RADIUS_OPTIONS)

  const form = Form.useFormInstance()
  let wlanData = editMode ? props.wlanData : form.getFieldsValue()

  const showDynamicWlan = data?.type === NetworkTypeEnum.AAA || data?.type === NetworkTypeEnum.DPSK
  const enableVxLan = hasVxLanTunnelProfile(wlanData)
  const showSingleSessionIdAccounting = hasAccountingRadius(data, wlanData)
  const showRadiusOptionsForm = isRadiusOptionsSupport && hasAuthRadius(data, wlanData)
  const enableWPA3_80211R = useIsSplitOn(Features.WPA3_80211R)
  const networkWPASecuredList = getNetworkWPASecuredList(enableWPA3_80211R)

  const [
    enableDhcp,
    enableOfdmOnly,
    enableFastRoaming,
    enableAirtimeDecongestion,
    enableJoinRSSIThreshold,
    enableTransientClientManagement,
    enableOce,
    enableVlanPooling,
    bssMinimumPhyRate //BSS Min Rate
  ] = [
    useWatch<boolean>('enableDhcp'),
    useWatch<boolean>('enableOfdmOnly'),
    useWatch<boolean>(['wlan', 'advancedCustomization', 'enableFastRoaming']),
    useWatch<boolean>(['wlan', 'advancedCustomization', 'enableAirtimeDecongestion']),
    useWatch<boolean>(['wlan', 'advancedCustomization', 'enableJoinRSSIThreshold']),
    useWatch<boolean>(['wlan', 'advancedCustomization', 'enableTransientClientManagement']),
    useWatch<boolean>(['wlan', 'advancedCustomization', 'enableOptimizedConnectivityExperience']),
    useWatch<boolean>('enableVlanPooling'),
    useWatch<string>('bssMinimumPhyRate')
  ]

  const isPortalDefaultVLANId = (data?.enableDhcp || enableDhcp) &&
            data?.type === NetworkTypeEnum.CAPTIVEPORTAL &&
            data.guestPortal?.guestNetworkType !== GuestNetworkTypeEnum.Cloudpath

  if (isPortalDefaultVLANId) {
    delete data?.wlan?.vlanId
    form.setFieldValue(['wlan', 'vlanId'], 3000)
  }

  function getNetworkWPASecuredList (enableWPA3_80211R: boolean) : WlanSecurityEnum[] {
    const networkWPASecuredList = [
      WlanSecurityEnum.WPA2Personal,
      WlanSecurityEnum.WPAPersonal,
      WlanSecurityEnum.WPA2Enterprise
    ]

    if (!enableWPA3_80211R)
      return networkWPASecuredList

    return networkWPASecuredList.concat([WlanSecurityEnum.WPA23Mixed, WlanSecurityEnum.WPA3])
  }

  const tabs: string[] = [
    // eslint-disable-next-line max-len
    'VLAN', 'Network Control' , 'Radio' , 'Networking' ,'Radius Options' , 'User Connection' , 'Advanced'
  ]

  const isHidden = (subject: string) => {
    const tab = tabs.find(tab => tab === subject)

    return tab !== props.selectedTabValue
  }


  return (
    <div style={{ marginLeft: '23px' }}>
      <div hidden={isHidden('VLAN') || false}>
        <VLANOfNetworkMoreSettingsForm
          enableVlanPooling={enableVlanPooling}
          enableVxLan={enableVxLan}
          isPortalDefaultVLANId={isPortalDefaultVLANId}
          showDynamicWlan={showDynamicWlan}
        />
      </div>
      <div hidden={isHidden('Network Control') || false}>
        <NetworkControlOfMoreSettingsForm
          showSingleSessionIdAccounting={!isRadiusOptionsSupport && showSingleSessionIdAccounting}
        />
      </div>
      <div hidden={isHidden('Radio') || false}>
        <RadioOfMoreSettingsForm
          form={form}
          bssMinimumPhyRate={bssMinimumPhyRate}
          enableOfdmOnly={enableOfdmOnly}
          enableFastRoaming={enableFastRoaming}
          enableAirtimeDecongestion={enableAirtimeDecongestion}
          enableJoinRSSIThreshold={enableJoinRSSIThreshold}
          enableTransientClientManagement={enableTransientClientManagement}
          enableOce={enableOce}
          enableBSSPriority={enableBSSPriority}
          data={data}
          networkWPASecuredList={networkWPASecuredList}
          wlanData={wlanData}
        />
      </div>
      <div hidden={isHidden('Networking') || false}>
        <NetworkingOfMoreSettingsForm
          wlanData={wlanData}
          data={data}
          enableFastRoaming={enableFastRoaming}
          enableAirtimeDecongestion={enableAirtimeDecongestion}
          enableJoinRSSIThreshold={enableJoinRSSIThreshold}
          enableTransientClientManagement={enableTransientClientManagement}
          enableOce={enableOce}
          enableBSSPriority={enableBSSPriority}
          networkWPASecuredList={networkWPASecuredList}
        />
      </div>
      <div hidden={isHidden('Radius Options') || false}>
        {showRadiusOptionsForm && <RadiusOptionsOfMoreSettingsForm
          context='network'
          /* eslint-disable-next-line max-len */
          isWispr={data?.guestPortal?.guestNetworkType === GuestNetworkTypeEnum.WISPr}
          showSingleSessionIdAccounting={showSingleSessionIdAccounting}
        />
        }
      </div>
      <div hidden={isHidden('User Connection') || false}>
        <UserConnectionOfMoreSettingsForm />
      </div>
      <div hidden={isHidden('Advanced') || false}>
        <AdvancedOfMoreSettingsForm />
      </div>
    </div>
  )
}