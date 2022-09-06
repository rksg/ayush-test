import {
  NetworkTypeEnum,
  PassphraseExpirationEnum,
  PassphraseFormatEnum,
  WlanSecurityEnum
} from '../constants'
import { AAAWlanAdvancedCustomization }  from '../models/AAAWlanAdvancedCustomization'
import { DpskWlanAdvancedCustomization } from '../models/DpskWlanAdvancedCustomization'
import { OpenWlanAdvancedCustomization } from '../models/OpenWlanAdvancedCustomization'
import { PskWlanAdvancedCustomization }  from '../models/PskWlanAdvancedCustomization'

import { GuestPortal }                    from './wifi/GuestPortal'
import { GuestWlanAdvancedCustomization } from './wifi/GuestWlanAdvancedCustomization'
import { Radius }                         from './wifi/Radius'

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

export interface NetworkVenue {
  id?: string
  name?: string
  apGroups: string[],
  scheduler: {
    type: string
  },
  isAllApGroups: boolean,
  allApGroupsRadio: string,
  allApGroupsRadioTypes: string[],
  venueId: string,
  networkId: string
}