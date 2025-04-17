import { EdgeMvSdLanViewData, EnforceableFields, MacAuthMacFormatEnum, Persona, Venue, VenueDetail } from '..'
import {
  GuestNetworkTypeEnum,
  NetworkTypeEnum,
  WlanSecurityEnum
} from '../constants'
import { AAAWlanAdvancedCustomization }   from '../models/AAAWlanAdvancedCustomization'
import { DpskWlanAdvancedCustomization }  from '../models/DpskWlanAdvancedCustomization'
import { GuestPortal }                    from '../models/GuestPortal'
import { GuestWlanAdvancedCustomization } from '../models/GuestWlanAdvancedCustomization'
import { NetworkHotspot20Settings }       from '../models/NetworkHotspot20Settings'
import { NetworkVenue }                   from '../models/NetworkVenue'
import { OpenWlanAdvancedCustomization }  from '../models/OpenWlanAdvancedCustomization'
import { PskWlanAdvancedCustomization }   from '../models/PskWlanAdvancedCustomization'
import { Radius }                         from '../models/Radius'


export interface CreateNetworkFormFields {
  name: string;
  ssid?: string;
  description?: string;
  type: NetworkTypeEnum;
  isCloudpathEnabled?: boolean;
  cloudpathServerId?: string;
  venues: NetworkVenue[];
  enableAccountingService?: boolean;
  enableAuthProxy?: boolean;
  wlanSecurity?: WlanSecurityEnum;
  passphrase?: string;
  saePassphrase?: string;
  wepHexKey?: string;
  managementFrameProtection?: string;
  macAddressAuthentication?: boolean;
  macAuthMacFormat?: string;
}

export interface BaseNetwork {
  id: string
  name: string
  description: string
  nwSubType: string
  ssid: string
  vlan: number
  aps: number // non-RBAC only
  clients?: number  // non-RBAC only
  venues: { count: number, names: string[], ids: string[] }
  captiveType?: GuestNetworkTypeEnum
  deepNetwork?: NetworkDetail // non-RBAC only
  vlanPool?: { name: string } // non-RBAC only
  activated?: { isActivated: boolean, isDisabled?: boolean, errors?: string[] }
  allApDisabled?: boolean,
  incompatible?: number
}

export type DsaeOnboardNetwork = {
  id: string
  name: string
  description: string
  nwSubType: string
  ssid: string
  vlan: number
  vlanPool?: { name: string, vlanMembers: string[] }
  securityProtocol?: string
}

export interface Network extends BaseNetwork, EnforceableFields {
  children?: BaseNetwork[]
  dsaeOnboardNetwork?: DsaeOnboardNetwork
  securityProtocol?: string
  isOnBoarded?: boolean
  isOweMaster?: boolean
  owePairNetworkId?: string,
  certificateTemplateId?: string
  apSerialNumbers?: string[]
}

export interface WifiNetwork extends Network{
  apCount: number, // RBAC API only: replace the aps field
  clientCount: number,  // RBAC API only: replace the client field
  venueApGroups: VenueApGroup[], // RBAC API only: replace the venues field
  tunnelWlanEnable?: boolean
}

export interface NetworkExtended extends Network {
  deepVenue?: NetworkVenue,
  latitude?: string,
  longitude?: string
}

export interface NetworkDetail {
  type: NetworkTypeEnum
  tenantId: string
  name: string
  venues: NetworkVenue[]
  id: string
  wlan: {
    wlanSecurity: WlanSecurityEnum
    ssid?: string
    vlanId?: number
    enable?: boolean
    advancedCustomization?:
      OpenWlanAdvancedCustomization |
      AAAWlanAdvancedCustomization |
      DpskWlanAdvancedCustomization |
      PskWlanAdvancedCustomization;
  }
  isOweMaster?: boolean
}

export type ClientIsolationVenue = Pick<NetworkVenue, 'venueId' | 'clientIsolationAllowlistId'>

export interface NetworkSaveData extends EnforceableFields {
  id?: string
  name?: string
  tenantId?: string
  description?: string
  type?: NetworkTypeEnum
  enableAccountingService?: boolean
  enableAccountingProxy?: boolean
  enableAuthProxy?: boolean
  enableSecondaryAuthServer?: boolean
  enableSecondaryAcctServer?: boolean
  isCloudpathEnabled?: boolean
  cloudpathServerId?: string
  venues?: NetworkVenue[]
  redirectUrl?: string
  guestPortal?: GuestPortal
  portalServiceProfileId?: string
  authRadiusId?: string | null
  accountingRadiusId?: string
  enableDhcp?: boolean
  enableDeviceOs?: boolean
  wlan?: {
    accessControlEnabled?: boolean
    accessControlProfileId?: string
    ssid?: string
    vlanId?: number
    enable?: boolean
    bypassCNA?: boolean
    bypassCPUsingMacAddressAuthentication?: boolean
    passphrase?: string
    saePassphrase?: string
    isMacRegistrationList?: boolean
    managementFrameProtection?: string
    macAddressAuthentication?: boolean
    macRegistrationListId?: string
    macAuthMacFormat?: string
    wlanSecurity?: WlanSecurityEnum
    wepHexKey?: string
    advancedCustomization?:
      OpenWlanAdvancedCustomization |
      AAAWlanAdvancedCustomization |
      DpskWlanAdvancedCustomization |
      PskWlanAdvancedCustomization |
      GuestWlanAdvancedCustomization
    macAddressAuthenticationConfiguration?: {
      macAddressAuthentication?: boolean
      macAuthMacFormat?: string
    }
  };
  wlanSecurity?: WlanSecurityEnum
  dpskWlanSecurity?: WlanSecurityEnum
  authRadius?: Radius
  accountingRadius?: Radius
  dpskServiceProfileId?: string
  useDpskService?: boolean
  isOweMaster?: boolean
  owePairNetworkId?: string
  maxRate?: MaxRateEnum
  totalUplinkLimited? : boolean
  totalDownlinkLimited? : boolean
  accessControlProfileEnable?: boolean
  enableOwe?: boolean
  isDsaeServiceNetwork?: boolean
  dsaeNetworkPairId?: string
  hotspot20Settings?: NetworkHotspot20Settings
  useCertificateTemplate?: boolean
  certificateTemplateId?: string
  accountingInterimUpdates?: number
  sdLanAssociationUpdate?: NetworkTunnelSdLanAction[],
  softGreAssociationUpdate?: NetworkTunnelSoftGreAction
  ipsecAssociationUpdate?: NetworkTunnelIpsecAction,
  identityGroupId?: string,
  identity?: Persona,
  enableIdentityAssociation?: boolean,
  samlIdpProfilesId?: string
  samlIdpProfilesName?: string
}

export interface NetworkSummaryExtracData {
  directoryServer? : {
    id:string,
    name:string
  }
}

export enum MaxRateEnum {
  PER_AP = 'perAp',
  UNLIMITED = 'unlimited'
}

export interface ExternalProviders{
  providers: Providers[]
}

export interface ExternalWifiProviders extends ExternalProviders{
  wisprProviders: Providers[]
}
export interface Providers{
  customExternalProvider: boolean,
  name: string,
  regions: Regions[]
}
export interface Regions{
  name: string,
  showAnalyticsData: boolean,
  captivePortalUrl: string,
  redirectUrl: string,
  authRadius?: {
    primary: {
      ip: string;
      port: string;
      sharedSecret?: string;
    };
    secondary: {
      ip: string;
      port: string;
      sharedSecret?: string;
    };
  },
  accountingRadius?: {
    primary: {
      ip: string;
      port: string;
      sharedSecret?: string;
    };
    secondary: {
      ip: string;
      port: string;
      sharedSecret?: string;
    };
  }
}

export interface ApGroupModalState { // subset of ApGroupModalWidgetProps
  visible: boolean,
  network?: NetworkSaveData | null,
  networkVenue?: NetworkVenue,
  venueName?: string
}

export interface VenueApGroup {
  venueId: string,
  isAllApGroups: boolean,
  apGroupIds: string[]
}

export type SchedulingModalState = {
  visible: boolean,
  networkVenue?: NetworkVenue,
  venue?: Venue | VenueDetail
  network?: Network
}

export interface NetworkRadiusSettings {
  enableAccountingProxy?: boolean
  enableAuthProxy?: boolean
  macAuthMacFormat?: MacAuthMacFormatEnum
}

export interface NetworkTunnelSdLanAction {
  serviceId: string,
  venueId: string,
  networkId: string,
  guestEnabled: boolean, // forward guest traffic
  enabled: boolean,      // is local breakout
  venueSdLanInfo?: EdgeMvSdLanViewData
}

export interface NetworkTunnelSoftGreAction {
  [name:string]: {
    newProfileId: string,
    newProfileName: string,
    oldProfileId: string
  }
}

export interface NetworkTunnelIpsecAction {
  [name:string]: {
    softGreProfileId: string,
    newProfileId: string,
    newProfileName: string,
    oldProfileId: string,
    enableIpsec: boolean
  }
}
