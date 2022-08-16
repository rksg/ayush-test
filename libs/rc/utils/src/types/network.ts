import {
  PassphraseExpirationEnum,
  PassphraseFormatEnum,
  WlanSecurityEnum
} from '../constants'

import { GuestPortal } from './wifi/GuestPortal'
import { Radius }      from './wifi/Radius'
export interface CreateNetworkFormFields {
  id?: string
  name: string;
  description?: string;
  type: string;
  isCloudpathEnabled?: boolean;
  cloudpathServerId?: string;
  venues?: NetworkVenue[];
  redirectUrl?: string;
  guestPortal?: GuestPortal;
  enableSecondaryAuthServer?: boolean
  enableAuthProxy?: boolean
  enableAccountingProxy?: boolean
  enableAccountingService?: boolean
  enableSecondaryAcctServer?: boolean
  passphraseLength?: number | undefined
  passphraseFormat?: PassphraseFormatEnum
  expiration?: PassphraseExpirationEnum
  authRadius?: Radius
  accountingRadius?: Radius
  tenantId?: string
  // Enable DHCP (requires a bound DHCP Profile)
  enableDhcp?: boolean
  dpskWlanSecurity?: WlanSecurityEnum
}

export interface NetworkVenue {
  id?: string
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