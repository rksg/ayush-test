import { GuestNetworkTypeEnum }     from './GuestNetworkTypeEnum'
import { GuestPage }                from './GuestPage'
import { GuestSmsPasswordDuration } from './GuestSmsPasswordDuration'
import { HostGuestConfig }          from './HostGuestConfig'
import { SocialIdentities }         from './SocialIdentities'
import { WisprPage }                from './WisprPage'

export class GuestPortal {
  smsPasswordDuration?: GuestSmsPasswordDuration

  guestNetworkType?: GuestNetworkTypeEnum

  externalPortalKey?: string

  enableSelfService?: boolean

  enableSmsLogin?: boolean

  maxDevices?: number

  endOfDayReauthDelay?: boolean

  macCredentialsDuration?: number

  lockoutPeriod?: number

  lockoutPeriodEnabled?: boolean

  wisprPage?: WisprPage

  guestPage?: GuestPage

  socialIdentities?: SocialIdentities

  socialEmails?: boolean

  // List of domains (e.g. ruckuswireless.com) that is used to authenticate the username of sign-in network guest

  socialDomains?: string[]

  hostGuestConfig?: HostGuestConfig

  externalPortalUrl?: string

  redirectUrl?: string

  // User session timeout in minutes

  userSessionTimeout?: number

  // User session grace period in minutes

  userSessionGracePeriod?: number

  // Allow unauthenticated users to access the listed destinations.<br>Each destination should be configured as a separate string item.<br>Accepted formats:<br>* IPv4 (e.g. 10.11.12.13)<br>* IPv4 range (e.g. 10.11.12.13-10.11.12.15)<br>* IPv4 CIDR (e.g. 10.11.12.100/28)<br>* IPv4 and mask (e.g. 10.11.12.13 255.255.255.0)<br>* Precise web site (e.g. www.ruckus.com)<br>* Web site with wildcard: *.ruckus.com

  walledGardens?: string[]

  constructor () {
    this.smsPasswordDuration = new GuestSmsPasswordDuration()

    this.guestNetworkType = GuestNetworkTypeEnum.ClickThrough

    this.enableSelfService = true

    this.enableSmsLogin = false

    this.maxDevices = 1

    this.endOfDayReauthDelay = false

    this.macCredentialsDuration = 240

    this.lockoutPeriod = 120

    this.lockoutPeriodEnabled = false

    this.guestPage = new GuestPage()

    this.socialIdentities = {}

    this.socialEmails = false

    this.socialDomains = []

    this.userSessionTimeout = 1440

    this.userSessionGracePeriod = 60

    this.walledGardens = []
  }
}
