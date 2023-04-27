import { Form } from 'antd'

import { NetworkSaveData, NetworkTypeEnum, WlanSecurityEnum } from '@acx-ui/rc/utils'
import { Provider }                                           from '@acx-ui/store'

import NetworkFormContext, { NetworkFormContextType } from '../NetworkFormContext'

import { MoreSettingsForm } from './NetworkMoreSettingsForm'


// eslint-disable-next-line max-len
export function MockedMoreSettingsForm (wlanData: NetworkSaveData, networkFormContext: NetworkFormContextType) {
  return (
    <Provider>
      <NetworkFormContext.Provider value={networkFormContext}>
        <Form>
          <MoreSettingsForm wlanData={wlanData} />
        </Form>
      </NetworkFormContext.Provider>
    </Provider>
  )
}

export const MoreSettingsFormTestCase = {

  // eslint-disable-next-line max-len
  shouldBeEnabled (wlanSecurity: WlanSecurityEnum,networkType: NetworkTypeEnum, isToggleEnabled: boolean) {

    const rules = isToggleEnabled ? this.toggleOn : this.toggleOff

    return rules.find((rule) => {
      return rule.networkType === networkType && rule.allowSecurityProtocal.includes(wlanSecurity)
    }) ? true : false

  },
  toggleOn: [
    {
      networkType: NetworkTypeEnum.PSK,
      allowSecurityProtocal: [
        WlanSecurityEnum.WPA2Personal,
        WlanSecurityEnum.WPAPersonal,
        WlanSecurityEnum.WPA2Enterprise,
        WlanSecurityEnum.WPA23Mixed,
        WlanSecurityEnum.WPA3
      ]
    },
    {
      networkType: NetworkTypeEnum.AAA,
      allowSecurityProtocal: [
        WlanSecurityEnum.Open,
        WlanSecurityEnum.WPAPersonal,
        WlanSecurityEnum.WPA2Personal,
        WlanSecurityEnum.WPAEnterprise,
        WlanSecurityEnum.WPA2Enterprise,
        WlanSecurityEnum.OpenCaptivePortal,
        WlanSecurityEnum.WEP,
        WlanSecurityEnum.None,
        WlanSecurityEnum.WPA23Mixed,
        WlanSecurityEnum.WPA3
      ] },
    {
      networkType: NetworkTypeEnum.CAPTIVEPORTAL,
      allowSecurityProtocal: [
        WlanSecurityEnum.WPA2Personal,
        WlanSecurityEnum.WPAPersonal,
        WlanSecurityEnum.WPA2Enterprise,
        WlanSecurityEnum.WPA23Mixed,
        WlanSecurityEnum.WPA3
      ]
    },
    {
      networkType: NetworkTypeEnum.DPSK,
      allowSecurityProtocal: []
    }
  ],
  toggleOff: [
    {
      networkType: NetworkTypeEnum.PSK,
      allowSecurityProtocal: [
        WlanSecurityEnum.WPA2Personal,
        WlanSecurityEnum.WPAPersonal,
        WlanSecurityEnum.WPA2Enterprise
      ]
    },
    {
      networkType: NetworkTypeEnum.AAA,
      allowSecurityProtocal: [
        WlanSecurityEnum.Open,
        WlanSecurityEnum.WPAPersonal,
        WlanSecurityEnum.WPA2Personal,
        WlanSecurityEnum.WPAEnterprise,
        WlanSecurityEnum.WPA2Enterprise,
        WlanSecurityEnum.OpenCaptivePortal,
        WlanSecurityEnum.WEP,
        WlanSecurityEnum.None
      ] },
    {
      networkType: NetworkTypeEnum.CAPTIVEPORTAL,
      allowSecurityProtocal: [
        WlanSecurityEnum.WPA2Personal,
        WlanSecurityEnum.WPAPersonal,
        WlanSecurityEnum.WPA2Enterprise
      ]
    },
    {
      networkType: NetworkTypeEnum.DPSK,
      allowSecurityProtocal: []
    }
  ]
}