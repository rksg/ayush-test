import { get } from 'lodash'

import {
  NetworkTypeEnum,
  NetworkSaveData,
  OpenWlanAdvancedCustomization,
  AAAWlanAdvancedCustomization,
  DpskWlanAdvancedCustomization,
  PskWlanAdvancedCustomization,
  GuestWlanAdvancedCustomization,
  WlanSecurityEnum,
  RfBandUsageEnum,
  PhyTypeConstraintEnum
} from '@acx-ui/rc/utils'

const parseAaaSettingDataToSave = (data: NetworkSaveData) => {
  let saveData = {
    enableAccountingService: data.enableAccountingService,
    isCloudpathEnabled: data.isCloudpathEnabled
  }

  if (data.isCloudpathEnabled) {
    delete data?.accountingRadius
    delete data?.authRadius
    saveData = {
      ...saveData,
      ...{
        cloudpathServerId: data.cloudpathServerId,
        enableAccountingProxy: false,
        enableAuthProxy: false
      }
    }
  } else {
    delete data?.cloudpathServerId
    let authRadius = {}
    if (get(data, 'authRadius.primary.ip')) {
      authRadius = {
        ...authRadius,
        ...{
          primary: {
            ip: get(data, 'authRadius.primary.ip'),
            port: get(data, 'authRadius.primary.port'),
            sharedSecret: get(data, 'authRadius.primary.sharedSecret')
          }
        }
      }
    }
    if (data.enableSecondaryAuthServer) {
      authRadius = {
        ...authRadius,
        ...{
          secondary: {
            ip: get(data, 'authRadius.secondary.ip'),
            port: get(data, 'authRadius.secondary.port'),
            sharedSecret: get(data, 'authRadius.secondary.sharedSecret')
          }
        }
      }
    }

    saveData = {
      ...saveData,
      ...{
        enableAuthProxy: data.enableAuthProxy,
        enableSecondaryAuthServer: data.enableSecondaryAuthServer,
        authRadius
      }
    }

    if (data.enableAccountingService) {
      let accountingRadius = {}
      accountingRadius = {
        ...accountingRadius,
        ...{
          primary: {
            ip: get(data, 'accountingRadius.primary.ip'),
            port: get(data, 'accountingRadius.primary.port'),
            sharedSecret: get(data, 'accountingRadius.primary.sharedSecret')
          }
        }
      }

      if (data.enableSecondaryAcctServer) {
        accountingRadius = {
          ...accountingRadius,
          ...{
            secondary: {
              ip: get(data, 'accountingRadius.secondary.ip'),
              port: get(data, 'accountingRadius.secondary.port'),
              sharedSecret: get(
                data,
                'accountingRadius.secondary.sharedSecret'
              )
            }
          }
        }
      }

      saveData = {
        ...saveData,
        ...{
          enableAccountingProxy: data.enableAccountingProxy,
          enableSecondaryAcctServer: data.enableSecondaryAcctServer,
          accountingRadius
        }
      }
    }
  }
  saveData = {
    ...saveData,
    ...{
      wlan: {
        wlanSecurity: data.wlanSecurity,
        advancedCustomization: new AAAWlanAdvancedCustomization(),
        bypassCNA: false,
        bypassCPUsingMacAddressAuthentication: false,
        enable: true,
        managementFrameProtection: 'Disabled',
        vlanId: 1
      }
    }
  }

  return saveData
}

const parseOpenSettingDataToSave = (data: NetworkSaveData) => {
  let saveData = { ...data }

  saveData = {
    ...saveData,
    ...{
      wlan: {
        advancedCustomization: new OpenWlanAdvancedCustomization(),
        enable: true,
        vlanId: 1
      }
    }
  }

  return saveData
}

const parseCaptivePortalDataToSave = (data: NetworkSaveData) => {
  let saveData = { ...data,
    ...{
      wlan: {
        wlanSecurity: WlanSecurityEnum.None,
        bypassCPUsingMacAddressAuthentication: true,
        advancedCustomization: new GuestWlanAdvancedCustomization(),
        macAddressAuthentication: false,
        vlanId: 1,
        enabled: true,
        bypassCNA: false
      }
    }
  }
  saveData.type = data.type
  saveData.guestPortal = { ...data.guestPortal }
  return saveData
}

const parseDpskSettingDataToSave = (data: NetworkSaveData) => {
  let saveData = { ...data,
    ...{
      wlan: {
        wlanSecurity: data.dpskWlanSecurity,
        enable: true,
        vlanId: 1,
        advancedCustomization: new DpskWlanAdvancedCustomization()
      }
    }
  }

  if (data.cloudpathServerId) {
    saveData = {
      ...saveData,
      cloudpathServerId: data.cloudpathServerId
    }
  }
  return saveData
}

const parsePskSettingDataToSave = (data: NetworkSaveData) => {
  let saveData = {
    enableAccountingService: data.enableAccountingService
  }
  if (data.wlan?.macAddressAuthentication) {
    let authRadius = {
      primary: {
        ip: get(data, 'authRadius.primary.ip'),
        port: get(data, 'authRadius.primary.port'),
        sharedSecret: get(data, 'authRadius.primary.sharedSecret')
      }
    }
    if (data.enableSecondaryAuthServer) {
      authRadius = {
        ...authRadius,
        ...{
          secondary: {
            ip: get(data, 'authRadius.secondary.ip'),
            port: get(data, 'authRadius.secondary.port'),
            sharedSecret: get(data, 'authRadius.secondary.sharedSecret')
          }
        }
      }
    }

    saveData = {
      ...saveData,
      ...{
        enableSecondaryAuthServer: data.enableSecondaryAuthServer,
        authRadius
      }
    }

    if (data.enableAccountingService) {
      let accountingRadius = {
        primary: {
          ip: get(data, 'accountingRadius.primary.ip'),
          port: get(data, 'accountingRadius.primary.port'),
          sharedSecret: get(data, 'accountingRadius.primary.sharedSecret')
        }

      }

      if (data.enableSecondaryAcctServer) {
        accountingRadius = {
          ...accountingRadius,
          ...{
            secondary: {
              ip: get(data, 'accountingRadius.secondary.ip'),
              port: get(data, 'accountingRadius.secondary.port'),
              sharedSecret: get(
                data,
                'accountingRadius.secondary.sharedSecret'
              )
            }
          }
        }
      }

      saveData = {
        ...saveData,
        ...{
          enableSecondaryAcctServer: data.enableSecondaryAcctServer,
          accountingRadius
        }
      }
    }
  }

  saveData = {
    ...saveData,
    ...{
      type: data.type,
      wlan: {
        ...data.wlan,
        advancedCustomization: new PskWlanAdvancedCustomization(),
        enable: true,
        vlanId: 1
      }
    }
  }

  return saveData
}

export function transferDetailToSave (data: NetworkSaveData) {
  return {
    name: data.name,
    description: data.description,
    type: data.type,
    wlan: {
      ssid: data.name
    }
  }
}

export function tranferSettingsToSave (data: NetworkSaveData) {
  const networkSaveDataParser = {
    [NetworkTypeEnum.AAA]: parseAaaSettingDataToSave(data),
    [NetworkTypeEnum.OPEN]: parseOpenSettingDataToSave(data),
    [NetworkTypeEnum.DPSK]: parseDpskSettingDataToSave(data),
    [NetworkTypeEnum.CAPTIVEPORTAL]: parseCaptivePortalDataToSave(data),
    [NetworkTypeEnum.PSK]: parsePskSettingDataToSave(data)
  }
  return networkSaveDataParser[data.type as keyof typeof networkSaveDataParser]
}

export function transferMoreSettingsToSave (data: NetworkSaveData, originalData: NetworkSaveData) {
  let advancedCustomization = {
    ...originalData?.wlan?.advancedCustomization,
    ...data?.wlan?.advancedCustomization
  } as OpenWlanAdvancedCustomization |
       AAAWlanAdvancedCustomization |
       DpskWlanAdvancedCustomization |
       PskWlanAdvancedCustomization

  if (get(data, 'wlan.advancedCustomization.dnsProxyEnabled')) {
    advancedCustomization.dnsProxy = { dnsProxyRules: get(data, 'dnsProxyRules') }
  }
  
  
  if (get(data, 'wlan.advancedCustomization.radioCustomization')) {
    advancedCustomization.radioCustomization = {
      ...advancedCustomization.radioCustomization,
      rfBandUsage: RfBandUsageEnum.BOTH,
      bssMinimumPhyRate: get(data, 'wlan.bssMinimumPhyRate'),
      phyTypeConstraint: get(data, 'wlan.enableOfdmOnly') ? 
        PhyTypeConstraintEnum.OFDM: PhyTypeConstraintEnum.NONE,
      managementFrameMinimumPhyRate: get(data, 'wlan.managementFrameMinimumPhyRate')
    }
  }

  if (get(data, 'wlan.advancedCustomization.vlanPool')) {
    advancedCustomization.vlanPool = JSON.parse(get(data, 'wlan.advancedCustomization.vlanPool'))
  }

  let saveData:NetworkSaveData = {
    ...originalData,
    wlan: {
      ...originalData?.wlan,
      vlanId: data?.wlan?.vlanId ?? originalData?.wlan?.vlanId,
      advancedCustomization
    }
  }

  return saveData
}