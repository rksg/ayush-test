import { get } from 'lodash'

import {
  NetworkTypeEnum,
  CreateNetworkFormFields,
  NetworkSaveData,
  IClientIsolationOptions, 
  IWlanRadioCustomization, 
  IOpenWlanAdvancedCustomization, 
  RfBandUsageEnum, 
  BssMinimumPhyRateEnum, 
  BssMinimumPhyRateEnum6G, 
  PhyTypeConstraintEnum,
  ManagementFrameMinimumPhyRateEnum,
  ManagementFrameMinimumPhyRateEnum6G
} from '@acx-ui/rc/utils'

const clientIsolationOptions: IClientIsolationOptions = {
  autoVrrp: false
}

const radioCustomization: IWlanRadioCustomization = {
  rfBandUsage: RfBandUsageEnum.BOTH,
  bssMinimumPhyRate: BssMinimumPhyRateEnum._default,
  bssMinimumPhyRate6G: BssMinimumPhyRateEnum6G._6,
  phyTypeConstraint: PhyTypeConstraintEnum.OFDM,
  managementFrameMinimumPhyRate: ManagementFrameMinimumPhyRateEnum._6,
  managementFrameMinimumPhyRate6G: ManagementFrameMinimumPhyRateEnum6G._6
}

const OpenWlanAdvancedCustomization: IOpenWlanAdvancedCustomization = {
  clientIsolation: true,
  maxClientsOnWlanPerRadio: 100,
  enableBandBalancing: true,
  clientIsolationOptions: clientIsolationOptions,
  hideSsid: false,
  forceMobileDeviceDhcp: false,
  clientLoadBalancingEnable: true,
  directedThreshold: 5,
  enableNeighborReport: true,
  radioCustomization: radioCustomization,
  enableSyslog: false,
  clientInactivityTimeout: 120,
  accessControlEnable: false,
  respectiveAccessControl: true,
  vlanPool: null,
  applicationPolicyEnable: false,
  l2AclEnable: false,
  l3AclEnable: false,
  wifiCallingEnabled: false,
  wifiCallingIds: [], //@Size(    max: 5 )
  proxyARP: false,
  enableAirtimeDecongestion: false,
  enableJoinRSSIThreshold: false,
  joinRSSIThreshold: -85,
  enableTransientClientManagement: false,
  joinWaitTime: 30,
  joinExpireTime: 300,
  joinWaitThreshold: 10,
  enableOptimizedConnectivityExperience: false,
  broadcastProbeResponseDelay: 15,
  rssiAssociationRejectionThreshold: -75,
  enableAntiSpoofing: false,
  enableArpRequestRateLimit: true,
  arpRequestRateLimit: 15,
  enableDhcpRequestRateLimit: true,
  dhcpRequestRateLimit: 15,
  dnsProxyEnabled: false
}

const parseAaaSettingDataToSave = (data: NetworkSaveData) => {
  let saveData = {}

  saveData = {
    wlan: {
      wlanSecurity: data.wlanSecurity
    }
  }

  if (data.isCloudpathEnabled) {
    saveData = {
      ...saveData,
      ...{
        cloudpathServerId: data.cloudpathServerId,
        enableAccountingProxy: false,
        enableAuthProxy: false
      }
    }
  } else {
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
    if (get(data, 'authRadius.secondary.ip')) {
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
        enableAccountingProxy: data.enableAccountingProxy,
        enableAuthProxy: data.enableAuthProxy,
        authRadius
      }
    }

    if (data.enableAccountingService === true) {
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

      if (get(data, 'accountingRadius.secondary.ip')) {
        accountingRadius = {
          ...accountingRadius,
          ...{
            secondary: {
              ip: get(data, 'accountingRadius.secondary.ip'),
              port: get(data, 'accountingRadius.secondary.port'),
              sharedSecret: get(data, 'accountingRadius.secondary.sharedSecret')
            }
          }
        }
      }

      saveData = {
        ...saveData,
        ...{
          accountingRadius
        }
      }
    }
  }

  return saveData
}

const parseOpenSettingDataToSave = (data: NetworkSaveData) => {
  let saveData = {}

  if (data.cloudpathServerId) {
    saveData = {
      ...saveData,
      ...{
        cloudpathServerId: data.cloudpathServerId
      }
    }
  }

  saveData = {
    ...saveData,
    ...{
      wlan: {
        advancedCustomization: OpenWlanAdvancedCustomization,
        enable: true,
        vlanId: 1
      }
    }
  }
  
  return saveData
}

const parseDpskSettingDataToSave = (data: NetworkSaveData) => {
  let saveData = {}

  if (data.cloudpathServerId) {
    saveData = {
      cloudpathServerId: data.cloudpathServerId
    }
  } else {
    saveData = {
      dpskPassphraseGeneration: {
        length: data.passphraseLength,
        format: data.passphraseFormat,
        expiration: data.expiration
      }
    }
  }

  saveData = {
    ...saveData,
    ...{
      wlan: {
        advancedCustomization: OpenWlanAdvancedCustomization,
        enable: true,
        vlanId: 1
      }
    }
  }
  
  return saveData
}

export function transferDetailToSave (data: CreateNetworkFormFields) {
  return {
    name: data.name,
    description: data.description ?? '',
    venues: data.venues ?? null,
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
    [NetworkTypeEnum.DPSK]: parseDpskSettingDataToSave(data)
  }
  return networkSaveDataParser[data.type as keyof typeof networkSaveDataParser]
}

export const transformNetworkType = (value: any) => {
  let displayValue = ''
  switch (value) {
    case NetworkTypeEnum.OPEN:
      displayValue = 'Open Network'
      break
    case NetworkTypeEnum.PSK:
      displayValue = 'Pre-Shared Key (PSK)'
      break
    case NetworkTypeEnum.DPSK:
      displayValue = 'Dynamic Pre-Shared Key (DPSK)'
      break
    case NetworkTypeEnum.AAA:
      displayValue = 'Enterprise AAA (802.1X)'
      break
    case NetworkTypeEnum.CAPTIVEPORTAL:
      //TODO
      break
  }
  return displayValue
}