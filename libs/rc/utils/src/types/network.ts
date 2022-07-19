import {
  PassphraseExpirationEnum,
  PassphraseFormatEnum,
  WlanSecurityEnum
} from '../constants'

import { AAAWlanAdvancedCustomization }  from './AAAWlanAdvancedCustomization'
import { DpskWlanAdvancedCustomization } from './DpskWlanAdvancedCustomization'
import { OpenWlanAdvancedCustomization } from './OpenWlanAdvancedCustomization'
import { PskWlanAdvancedCustomization }  from './PskWlanAdvancedCustomization'

export interface CreateNetworkFormFields {
  name: string;
  description?: string;
  type: string;
  isCloudpathEnabled?: boolean;
  cloudpathServerId?: string;
  venues: any;
  enableAccountingService?: boolean;
  enableAuthProxy?: boolean;
  wlanSecurity?: WlanSecurityEnum;
  passphrase?: string;
  saePassphrase?: string;
  managementFrameProtection?: string;
  macAddressAuthentication?: boolean;
  macAuthMacFormat?: string;
}

export interface NetworkSaveData {
  name?: string;
  description?: string;
  type?: string;
  enableAccountingService?: boolean;
  enableAccountingProxy?: boolean;
  enableAuthProxy?: boolean;
  enableSecondaryAuthServer?: boolean;
  enableSecondaryAcctServer?: boolean;
  isCloudpathEnabled?: boolean;
  cloudpathServerId?: string;
  venues?: { venueId: string; name: string }[];
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