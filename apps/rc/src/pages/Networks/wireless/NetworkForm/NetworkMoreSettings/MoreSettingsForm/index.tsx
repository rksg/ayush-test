import React, { useContext, useState } from 'react'

import { Form, RadioChangeEvent } from 'antd'
import { useWatch }               from 'antd/lib/form/Form'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  GuestNetworkTypeEnum,
  NetworkSaveData,
  NetworkTypeEnum,
  WlanSecurityEnum
} from '@acx-ui/rc/utils'



import NetworkFormContext                             from '../../NetworkFormContext'
import { hasAccountingRadius, hasVxLanTunnelProfile } from '../../utils'
import { RadioSwitch }                                from '../styledComponents'

import AdvancedOfMoreSettingsForm       from './AdvancedOfMoreSettingsForm'
import NetworkControlOfMoreSettingsForm from './NetworkControlOfMoreSettingsForm'
import NetworkingOfMoreSettingsForm     from './NetworkingOfMoreSettingsForm'
import RadioOfMoreSettingsForm          from './RadioOfMoreSettingsForm'
import VLANOfNetworkMoreSettingsForm    from './VLANOfMoreSettingsForm'

interface MoreSettingsFormProps {
  wlanData: NetworkSaveData | null;
}

export function MoreSettingsForm (props: MoreSettingsFormProps) {
  const { editMode, data } = useContext(NetworkFormContext)
  const enableBSSPriority = useIsSplitOn(Features.WIFI_EDA_BSS_PRIORITY_TOGGLE)
  const isRadiusOptionsSupport = useIsSplitOn(Features.RADIUS_OPTIONS)

  const form = Form.useFormInstance()
  let wlanData = editMode ? props.wlanData : form.getFieldsValue()

  const showDynamicWlan = data?.type === NetworkTypeEnum.AAA || data?.type === NetworkTypeEnum.DPSK
  const enableVxLan = hasVxLanTunnelProfile(wlanData)
  const isHasAccountingRadius = hasAccountingRadius(data, wlanData)
  const showSingleSessionIdAccounting = !isRadiusOptionsSupport && isHasAccountingRadius

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

  interface Tab {
    value: 'VLAN' | 'Network Control' | 'Radio' | 'Networking' | 'Advanced'
    visible: boolean
  }
  const tabs: Tab[] = [
    { value: 'VLAN', visible: true },
    { value: 'Network Control', visible: false },
    { value: 'Radio', visible: false },
    { value: 'Networking', visible: false },
    { value: 'Advanced', visible: false }
  ]

  const [selectedTabValue, setSelectedTabValue] = useState<string>(tabs[0].value)
  const onSelectedTabChange = ({ target }: RadioChangeEvent): void => {
    setSelectedTabValue(target.value)
    // hidden form except selected one
    tabs.forEach((tab) => tab.visible = tab.value === target.value)
  }

  function isHidden (tabValue: string) {
    const tab = tabs.find(tab => tab.value === tabValue)

    return tab?.value !== selectedTabValue
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

  return (
    <>
      <RadioSwitch
        defaultValue={selectedTabValue}
        onChange={onSelectedTabChange}
        value={selectedTabValue}
        options={tabs.map(tab => tab.value)}
        optionType={'button'}
        buttonStyle={'outline'}
        size={'large'}
        style={{ marginBottom: '30px', width: '100%', height: '100%' }}
      />
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
            showSingleSessionIdAccounting={showSingleSessionIdAccounting}
          />
        </div>
        <div hidden={isHidden('Radio') || false}>
          <RadioOfMoreSettingsForm form={form}
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
        <div hidden={isHidden('Advanced') || false}>
          <AdvancedOfMoreSettingsForm/>
        </div>
      </div>
    </>
  )
}

export default MoreSettingsForm

