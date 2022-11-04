import { defineMessage, MessageDescriptor } from 'react-intl'

import {
  AaaServerOrderEnum,
  GuestNetworkTypeEnum,
  NetworkTypeEnum,
  WlanSecurityEnum,
  RadiusErrorsType
} from '@acx-ui/rc/utils'

export const networkTypes: Record<NetworkTypeEnum, MessageDescriptor> = {
  [NetworkTypeEnum.OPEN]: defineMessage({ defaultMessage: 'Open Network' }),
  [NetworkTypeEnum.PSK]: defineMessage({ defaultMessage: 'Pre-Shared Key (PSK)' }),
  [NetworkTypeEnum.DPSK]: defineMessage({ defaultMessage: 'Dynamic Pre-Shared Key (DPSK)' }),
  [NetworkTypeEnum.AAA]: defineMessage({ defaultMessage: 'Enterprise AAA (802.1X)' }),
  [NetworkTypeEnum.CAPTIVEPORTAL]: defineMessage({ defaultMessage: 'Captive Portal' })
}

/* eslint-disable max-len */
export const networkTypesDescription: Record<NetworkTypeEnum, MessageDescriptor> = {
  [NetworkTypeEnum.OPEN]: defineMessage({
    defaultMessage: 'Allow users to access the network without any authentication/security (not recommended)',
    description: 'Description for Open Network'
  }),
  [NetworkTypeEnum.PSK]: defineMessage({
    defaultMessage: 'Require users to enter a passphrase (that you have defined for the network) to connect',
    description: 'Description for Pre-Shared Key (PSK)'
  }),
  [NetworkTypeEnum.DPSK]: defineMessage({
    defaultMessage: 'Require users to enter a passphrase to connect. The passphrase is unique per device',
    description: 'Description for Dynamic Pre-Shared Key (DPSK)'
  }),
  [NetworkTypeEnum.AAA]: defineMessage({
    defaultMessage: 'Use 802.1X standard and WPA2 security protocols to authenticate users using an authentication server on thenetwork',
    description: 'Description for Enterprise AAA (802.1X)'
  }),
  [NetworkTypeEnum.CAPTIVEPORTAL]: defineMessage({
    defaultMessage: 'Users are authorized through a captive portal in various methods',
    description: 'Description for Captive Portal'
  })
}
/* eslint-enable */

export const wlanSecurity: Record<WlanSecurityEnum, MessageDescriptor> = {
  [WlanSecurityEnum.Open]: defineMessage({
    defaultMessage: 'Open',
    description: 'WLAN security type - Open'
  }),
  [WlanSecurityEnum.WPAPersonal]: defineMessage({
    defaultMessage: 'WPA',
    description: 'WLAN security type - WPA'
  }),
  [WlanSecurityEnum.WPA2Personal]: defineMessage({
    defaultMessage: 'WPA2',
    description: 'WLAN security type - WPA2'
  }),
  [WlanSecurityEnum.WPAEnterprise]: defineMessage({
    defaultMessage: 'WPA Enterprise',
    description: 'WLAN security type - WPA Enterprise'
  }),
  [WlanSecurityEnum.WPA2Enterprise]: defineMessage({
    defaultMessage: 'WPA2 Enterprise',
    description: 'WLAN security type - WPA2 Enterprise'
  }),
  [WlanSecurityEnum.OpenCaptivePortal]: defineMessage({
    defaultMessage: 'Open Captive Portal',
    description: 'WLAN security type - Open Captive Portal'
  }),
  [WlanSecurityEnum.WEP]: defineMessage({
    defaultMessage: 'WEP',
    description: 'WLAN security type - WEP'
  }),
  [WlanSecurityEnum.WPA23Mixed]: defineMessage({
    defaultMessage: 'WPA3/WPA2 Mixed',
    description: 'WLAN security type - WPA3/WPA2 Mixed'
  }),
  [WlanSecurityEnum.WPA3]: defineMessage({
    defaultMessage: 'WPA3',
    description: 'WLAN security type - WPA3'
  })
}

export const captiveNetworkTypes: Record<GuestNetworkTypeEnum, MessageDescriptor> = {
  [GuestNetworkTypeEnum.ClickThrough]: defineMessage({
    defaultMessage: 'Click-Through',
    description: 'Guest network type - Click-Through'
  }),
  [GuestNetworkTypeEnum.GuestPass]: defineMessage({
    defaultMessage: 'Managed Guest Pass',
    description: 'Guest network type - Managed Guest Pass'
  }),
  [GuestNetworkTypeEnum.SelfSignIn]: defineMessage({
    defaultMessage: 'Self Sign-In',
    description: 'Guest network type - Self Sign-In'
  }),
  [GuestNetworkTypeEnum.HostApproval]: defineMessage({
    defaultMessage: 'Host Approval',
    description: 'Guest network type - Host Approval'
  }),
  [GuestNetworkTypeEnum.WISPr]: defineMessage({
    defaultMessage: '3rd Party Captive Portal (WISPr)',
    description: 'Guest network type - 3rd Party Captive Portal (WISPr)'
  }),
  [GuestNetworkTypeEnum.Cloudpath]: defineMessage({
    defaultMessage: 'Captive Portal',
    description: 'Guest network type - Captive Portal'
  })
}

export const aaaServerTypes: Record<AaaServerOrderEnum, MessageDescriptor> = {
  [AaaServerOrderEnum.PRIMARY]: defineMessage({
    defaultMessage: 'Primary Server',
    description: 'AAA Server Order - Primary Server'
  }),
  [AaaServerOrderEnum.SECONDARY]: defineMessage({
    defaultMessage: 'Secondary Server',
    description: 'AAA Server Order - Secondary Server'
  })
}

export const NetworkTypeTitle: Partial<Record<NetworkTypeEnum, MessageDescriptor>> = {
  [NetworkTypeEnum.PSK]: defineMessage({ defaultMessage: 'Settings' }),
  [NetworkTypeEnum.AAA]: defineMessage({ defaultMessage: 'AAA Settings' }),
  [NetworkTypeEnum.OPEN]: defineMessage({ defaultMessage: 'Settings' }),
  [NetworkTypeEnum.DPSK]: defineMessage({ defaultMessage: 'DPSK Settings' })
}
export const states = {
  enabled: defineMessage({ defaultMessage: 'Enabled' }),
  disabled: defineMessage({ defaultMessage: 'Disabled' })
}

/* eslint-disable max-len */
export const multipleConflictMessage = {
  [RadiusErrorsType.AUTH_AND_ACC]: defineMessage({
    defaultMessage: 'The IP addresses you entered conflict with existing authentication and accounting server configuration in another network. Please change the IP address.'
  }),
  [RadiusErrorsType.AUTH]: defineMessage({
    defaultMessage: 'The IP addresses you entered conflict with existing authentication server configuration in another network. Please change the IP address.'
  }),
  [RadiusErrorsType.ACCOUNTING]: defineMessage({
    defaultMessage: 'The IP addresses you entered conflict with existing accounting server configuration in another network. Please change the IP address.'
  })
}

export const radiusErrorMessage = {
  [RadiusErrorsType.AUTH_AND_ACC]: defineMessage({
    defaultMessage: 'One of the values you entered conflicts with existing authentication and accounting server configurations in another network.'
  }),
  [RadiusErrorsType.AUTH]: defineMessage({
    defaultMessage: 'One of the values you entered conflicts with an existing authentication server configuration in another network.'
  }),
  [RadiusErrorsType.ACCOUNTING]: defineMessage({
    defaultMessage: 'One of the values you entered conflicts with an existing accounting server configuration in another network.'
  })
}
/* eslint-disable max-len */
export const capativeTypes: Record<GuestNetworkTypeEnum, MessageDescriptor> = {
  [GuestNetworkTypeEnum.ClickThrough]: defineMessage({ defaultMessage: 'Click-Through' }),
  [GuestNetworkTypeEnum.SelfSignIn]: defineMessage({ defaultMessage: 'Sefl Sign In' }),
  [GuestNetworkTypeEnum.Cloudpath]: defineMessage({ defaultMessage: 'Cloudpath Captive Portal' }),
  [GuestNetworkTypeEnum.HostApproval]: defineMessage({ defaultMessage: 'Host Approval' }),
  [GuestNetworkTypeEnum.GuestPass]: defineMessage({ defaultMessage: 'Guest Pass' }),
  [GuestNetworkTypeEnum.WISPr]: defineMessage({ defaultMessage: '3rd Party Captive Portal(WISPr)' })
}

/* eslint-disable max-len */
export const capativeTypesDescription: Record<GuestNetworkTypeEnum, MessageDescriptor> = {
  [GuestNetworkTypeEnum.ClickThrough]: defineMessage({
    defaultMessage: 'Users just need to accept Terms and Conditions in order to access the network',
    description: 'Description for Click-Through'
  }),
  [GuestNetworkTypeEnum.SelfSignIn]: defineMessage({
    defaultMessage: 'Users can sign in with their social media account or register their details in the portal and get personal password',
    description: 'Description for Sefl Sign In'
  }),
  [GuestNetworkTypeEnum.Cloudpath]: defineMessage({
    defaultMessage: 'Users connect through an enhanced captive portal experience with Cloudpath',
    description: 'Description for Cloudpath Captive Portal'
  }),
  [GuestNetworkTypeEnum.HostApproval]: defineMessage({
    defaultMessage: 'Users register their details in the portal including their host email - the host needs to approve the request',
    description: 'Description for Host Approval'
  }),
  [GuestNetworkTypeEnum.GuestPass]: defineMessage({
    defaultMessage: 'Users sign in with personal password which they need to get in advance from the network administration staff',
    description: 'Description for Guest Pass'
  }),
  [GuestNetworkTypeEnum.WISPr]: defineMessage({
    defaultMessage: 'Users connect through a 3rd party captive portal, authenticated by a AAA server',
    description: 'Description for 3rd Party Captive Portal(WISPr)'
  })
}
