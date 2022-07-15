import { GuestNetworkTypeEnum, NetworkTypeEnum } from '@acx-ui/rc/utils'

/* eslint-disable max-len */
export const NetworkTypeDescription: Record<NetworkTypeEnum, string> = {
  [NetworkTypeEnum.PSK]: 'Require users to enter a passphrase (that you have defined for the network) to connect',
  [NetworkTypeEnum.DPSK]: 'Require users to enter a passphrase to connect. The passphrase is unique per device',
  [NetworkTypeEnum.AAA]: 'Use 802.1X standard and WPA2 security protocols to authenticate users using an authentication server on thenetwork',
  [NetworkTypeEnum.CAPTIVEPORTAL]: 'Users are authorized through a captive portal in various methods',
  [NetworkTypeEnum.OPEN]: 'Allow users to access the network without any authentication/security(not recommended)'
}
/* eslint-enable */

export const NetworkTypeLabel: Record<NetworkTypeEnum, string> = {
  [NetworkTypeEnum.PSK]: 'Pre-Shared Key (PSK)',
  [NetworkTypeEnum.DPSK]: 'Dynamic Pre-Shared Key (DPSK)',
  [NetworkTypeEnum.AAA]: 'Enterprise AAA (802.1X)',
  [NetworkTypeEnum.CAPTIVEPORTAL]: 'Captive portal',
  [NetworkTypeEnum.OPEN]: 'Open Network'
}

export const NetworkTypeTitle: Partial<Record<NetworkTypeEnum, string>> = {
  [NetworkTypeEnum.AAA]: 'AAA Settings',
  [NetworkTypeEnum.OPEN]: 'Settings',
  [NetworkTypeEnum.DPSK]: 'DPSK Settings',
  [NetworkTypeEnum.CAPTIVEPORTAL]: 'Portal Type'
}

export const GuestNetworkTypeLabel: Record<GuestNetworkTypeEnum, string> = {
  [GuestNetworkTypeEnum.ClickThrough]: 'Click-Through',
  [GuestNetworkTypeEnum.SelfSignIn]: 'Self Sign In',
  [GuestNetworkTypeEnum.Cloudpath]: 'Cloudpath Captive Portal',
  [GuestNetworkTypeEnum.HostApproval]: 'Host Approval',
  [GuestNetworkTypeEnum.GuestPass]: 'Guest Pass',
  [GuestNetworkTypeEnum.WISPr]: '3rd Party Captive Portal (WISPr)',
}

export const GuestNetworkTypeDescription: Record<GuestNetworkTypeEnum, string> = {
  [GuestNetworkTypeEnum.ClickThrough]: 'Users just need to accept Terms and Conditions in order to access the network',
  [GuestNetworkTypeEnum.SelfSignIn]: 'Users can sign in with their social media account or register their details in the portal and get personal password',
  [GuestNetworkTypeEnum.Cloudpath]: 'Users connect through an enhanced captive portal experience with Cloudpath',
  [GuestNetworkTypeEnum.HostApproval]: 'Users register their details in the portal including their host email - the host needs to approve the request',
  [GuestNetworkTypeEnum.GuestPass]: 'Users sign in with personal password which they need to get in advance from the network administration staff',
  [GuestNetworkTypeEnum.WISPr]: 'Users connect through a 3rd party captive portal, authenticated by a AAA server',
}
