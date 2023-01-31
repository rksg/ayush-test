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

const parseAaaSettingDataToSave = (data: NetworkSaveData, editMode: boolean) => {
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
  if (editMode) {
    saveData = {
      ...saveData,
      ...{
        wlan: {
          wlanSecurity: data.wlanSecurity
        }
      }
    }
  } else {
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
  }


  return saveData
}

const parseOpenSettingDataToSave = (data: NetworkSaveData, editMode: boolean) => {
  let saveData = { ...data }

  if (!editMode) {
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

const parseDpskSettingDataToSave = (data: NetworkSaveData, editMode: boolean) => {
  let saveData
  if (editMode) {
    saveData = {
      ...data,
      ...{
        wlan: {
          wlanSecurity: data.dpskWlanSecurity
        }
      }
    }
  } else {
    saveData = {
      ...data,
      ...{
        wlan: {
          wlanSecurity: data.dpskWlanSecurity,
          enable: true,
          vlanId: 1,
          advancedCustomization: new DpskWlanAdvancedCustomization()
        }
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

const parsePskSettingDataToSave = (data: NetworkSaveData, editMode: boolean) => {
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

  if (editMode) {
    saveData = {
      ...saveData,
      ...{
        type: data.type,
        wlan: {
          ...data.wlan
        }
      }
    }
  } else {
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
  }

  return saveData
}

export function transferDetailToSave (data: NetworkSaveData) {
  return {
    name: data.name,
    description: data.description,
    type: data.type,
    wlan: {
      ssid: data.wlan?.ssid || data.name
    }
  }
}

export function tranferSettingsToSave (data: NetworkSaveData, editMode: boolean) {
  const networkSaveDataParser = {
    [NetworkTypeEnum.AAA]: parseAaaSettingDataToSave(data, editMode),
    [NetworkTypeEnum.OPEN]: parseOpenSettingDataToSave(data, editMode),
    [NetworkTypeEnum.DPSK]: parseDpskSettingDataToSave(data, editMode),
    [NetworkTypeEnum.CAPTIVEPORTAL]: parseCaptivePortalDataToSave(data),
    [NetworkTypeEnum.PSK]: parsePskSettingDataToSave(data, editMode)
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

  // radioCustomization
  advancedCustomization.radioCustomization = {
    ...advancedCustomization.radioCustomization,
    rfBandUsage: RfBandUsageEnum.BOTH,
    bssMinimumPhyRate: get(data, 'bssMinimumPhyRate'),
    phyTypeConstraint: get(data, 'enableOfdmOnly') ?
      PhyTypeConstraintEnum.OFDM : PhyTypeConstraintEnum.NONE,
    managementFrameMinimumPhyRate: get(data, 'managementFrameMinimumPhyRate')
  }

  // loadControlForm
  if(get(data, 'totalUplinkLimited') === false) {
    advancedCustomization.totalUplinkRateLimiting = 0
  }

  if(get(data, 'totalDownlinkLimited') === false) {
    advancedCustomization.totalDownlinkRateLimiting = 0
  }
  // accessControlForm
  if (!get(data, 'wlan.advancedCustomization.devicePolicyId')) {
    advancedCustomization.devicePolicyId = null
  }

  if (!get(data, 'wlan.advancedCustomization.applicationPolicyEnable')) {
    advancedCustomization.applicationPolicyId = null
  }

  if (!get(data, 'accessControlProfileEnable')) {
    advancedCustomization.accessControlProfileId = null
  }

  if (get(data, 'accessControlProfileEnable')
    && get(data, 'wlan.advancedCustomization.accessControlProfileId')) {
    advancedCustomization.l2AclEnable = false
    advancedCustomization.l2AclPolicyId = null
    advancedCustomization.l3AclEnable = false
    advancedCustomization.l3AclPolicyId = null

    advancedCustomization.accessControlEnable = true
    // eslint-disable-next-line max-len
    advancedCustomization.accessControlProfileId = get(data, 'wlan.advancedCustomization.accessControlProfileId')
  }

  advancedCustomization.urlFilteringPolicyId = null

  if (get(data, 'wlan.advancedCustomization.vlanPool')) {
    advancedCustomization.vlanPool = JSON.parse(get(data, 'wlan.advancedCustomization.vlanPool'))
  }
  // accessControlForm
  if (!Number.isInteger(get(data, 'wlan.advancedCustomization.userUplinkRateLimiting'))) {
    advancedCustomization.userUplinkRateLimiting = 0
  }
  if (!Number.isInteger(get(data, 'wlan.advancedCustomization.userDownlinkRateLimiting'))) {
    advancedCustomization.userDownlinkRateLimiting = 0
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
