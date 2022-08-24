import {
  NetworkTypeEnum,
  PassphraseExpirationEnum,
  PassphraseFormatEnum,
  WlanSecurityEnum
} from '../constants'

import { AnyWlan }     from './any-network'
import { GuestPortal } from './wifi/GuestPortal'
import { Radius }      from './wifi/Radius'

export interface NetworkSaveData {
  id?: string;
  tenantId?: string;
  name?: string;
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
  wlan?: AnyWlan;
  wlanSecurity?: WlanSecurityEnum;
  dpskWlanSecurity?: WlanSecurityEnum;
  authRadius?: Radius;
  accountingRadius?: Radius;
  passphraseLength?: number;
  passphraseFormat?: PassphraseFormatEnum;
  expiration?: PassphraseExpirationEnum;
}

export interface NetworkVenue {
  id?: string
  name?: string
  apGroups: string[]
  scheduler: {
    type: string
  },
  isAllApGroups?: boolean
  allApGroupsRadio?: string
  allApGroupsRadioTypes?: string[]
  venueId: string
  networkId: string
}