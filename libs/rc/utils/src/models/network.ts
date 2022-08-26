import {
  NetworkTypeEnum,
  PassphraseExpirationEnum,
  PassphraseFormatEnum,
  WlanSecurityEnum
} from '../constants'

import { AAAWlanAdvancedCustomization }  from './AAAWlanAdvancedCustomization'
import { DpskWlanAdvancedCustomization } from './DpskWlanAdvancedCustomization'
import { NetworkVenue }                  from './NetworkVenue'
import { OpenWlanAdvancedCustomization } from './OpenWlanAdvancedCustomization'
import { PskWlanAdvancedCustomization }  from './PskWlanAdvancedCustomization'

export interface CreateNetworkFormFields {
  name: string;
  description?: string;
  type: NetworkTypeEnum;
  isCloudpathEnabled?: boolean;
  cloudpathServerId?: string;
  venues: NetworkVenueLight[];
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
  name?: string;
  id?: string;
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
      PskWlanAdvancedCustomization;
  };
  wlanSecurity?: WlanSecurityEnum;
  dpskWlanSecurity?: WlanSecurityEnum;
  authRadius?: {
    primary: {
      ip: string;
      port: string;
      sharedSecret: string;
    };
    secondary: {
      ip: string;
      port: string;
      sharedSecret: string;
    };
  };
  accountingRadius?: {
    primary: {
      ip: string;
      port: string;
      sharedSecret: string;
    };
    secondary: {
      ip: string;
      port: string;
      sharedSecret: string;
    };
  };
  passphraseLength?: number;
  passphraseFormat?: PassphraseFormatEnum;
  expiration?: PassphraseExpirationEnum;
}

export interface NetworkVenueLight {
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