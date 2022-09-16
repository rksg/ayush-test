import {
  GuestNetworkTypeEnum,
  NetworkTypeEnum,
  PassphraseExpirationEnum,
  PassphraseFormatEnum,
  WlanSecurityEnum
} from '../constants'
import { AAAWlanAdvancedCustomization }   from '../models/AAAWlanAdvancedCustomization'
import { DpskWlanAdvancedCustomization }  from '../models/DpskWlanAdvancedCustomization'
import { GuestPortal }                    from '../models/GuestPortal'
import { GuestWlanAdvancedCustomization } from '../models/GuestWlanAdvancedCustomization'
import { NetworkVenue }                   from '../models/NetworkVenue'
import { OpenWlanAdvancedCustomization }  from '../models/OpenWlanAdvancedCustomization'
import { PskWlanAdvancedCustomization }   from '../models/PskWlanAdvancedCustomization'
import { Radius }                         from '../models/Radius'


export interface CreateNetworkFormFields {
  name: string;
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

export interface Network { // TODO: Move all Network type from libs/rc/services/src/type
  id: string
  name: string
  description: string
  nwSubType: string
  ssid: string
  vlan: number
  aps: number
  clients: number
  venues: { count: number, names: string[] }
  captiveType: GuestNetworkTypeEnum
  deepNetwork?: NetworkDetail
  vlanPool?: { name: string }
  activated: { isActivated: boolean, isDisabled?: boolean, errors?: string[] }
  allApDisabled?: boolean
}

export interface NetworkDetail {
  type: NetworkTypeEnum
  tenantId: string
  name: string
  venues: NetworkVenue[]
  id: string,
  wlan: {
    wlanSecurity: WlanSecurityEnum,
    ssid?: string;
    vlanId?: number;
    enable?: boolean;
    advancedCustomization?:  
      OpenWlanAdvancedCustomization |
      AAAWlanAdvancedCustomization |
      DpskWlanAdvancedCustomization |
      PskWlanAdvancedCustomization;
  },
}

export interface NetworkSaveData {
  id?: string;
  name?: string;
  tenantId?: string;
  description?: string;
  type?: NetworkTypeEnum;
  enableAccountingService?: boolean;
  enableAccountingProxy?: boolean;
  enableAuthProxy?: boolean;
  enableSecondaryAuthServer?: boolean;
  enableSecondaryAcctServer?: boolean;
  isCloudpathEnabled?: boolean;
  cloudpathServerId?: string;
  venues?: NetworkVenue[];
  redirectUrl?: string;
  guestPortal?: GuestPortal;
  wlan?: {
    ssid?: string;
    vlanId?: number;
    enable?: boolean;
    bypassCNA?: boolean;
    bypassCPUsingMacAddressAuthentication?: boolean;
    passphrase?: string;
    saePassphrase?: string;
    managementFrameProtection?: string;
    macAddressAuthentication?: boolean;
    macAuthMacFormat?: string;
    wlanSecurity?: WlanSecurityEnum;
    wepHexKey?: string;
    advancedCustomization?: 
      OpenWlanAdvancedCustomization |
      AAAWlanAdvancedCustomization |
      DpskWlanAdvancedCustomization |
      PskWlanAdvancedCustomization |
      GuestWlanAdvancedCustomization
  };
  wlanSecurity?: WlanSecurityEnum;
  dpskWlanSecurity?: WlanSecurityEnum;
  authRadius?: Radius;
  accountingRadius?: Radius;
  passphraseLength?: number;
  passphraseFormat?: PassphraseFormatEnum;
  expiration?: PassphraseExpirationEnum;
  dpskPassphraseGeneration?: {
    length?: number;
    format?: PassphraseFormatEnum;
    expiration?: PassphraseExpirationEnum;
  }
}
