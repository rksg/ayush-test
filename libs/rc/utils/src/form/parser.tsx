
import { 
  IClientIsolationOptions, 
  IWlanRadioCustomization, 
  IOpenWlanAdvancedCustomization, 
  RfBandUsageEnum, 
  BssMinimumPhyRateEnum, 
  BssMinimumPhyRateEnum6G, 
  PhyTypeConstraintEnum,
  ManagementFrameMinimumPhyRateEnum,
  ManagementFrameMinimumPhyRateEnum6G
} from './interface'

export function transferDetailToSave (data: any) {
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

export function tranferSettingsToSave (data: any) {
  let saveData = {}

  if(data.type === 'aaa'){
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
      let authRadius = {
        primary: {
          ip: data['authRadius.primary.ip'],
          port: data['authRadius.primary.port'],
          sharedSecret: data['authRadius.primary.sharedSecret']
        }
      }
      if (data['authRadius.secondary.ip']) {
        authRadius = {
          ...authRadius,
          ...{
            secondary: {
              ip: data['authRadius.secondary.ip'],
              port: data['authRadius.secondary.port'],
              sharedSecret: data['authRadius.secondary.sharedSecret']
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
              ip: data['accountingRadius.primary.ip'],
              port: data['accountingRadius.primary.port'],
              sharedSecret: data['accountingRadius.primary.sharedSecret']
            }
          }
        }
  
        if (data['accountingRadius.secondary.ip']) {
          accountingRadius = {
            ...accountingRadius,
            ...{
              secondary: {
                ip: data['accountingRadius.secondary.ip'],
                port: data['accountingRadius.secondary.port'],
                sharedSecret: data['accountingRadius.secondary.sharedSecret']
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
  }else if(data.type === 'open'){
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
  }
  return saveData
}
  