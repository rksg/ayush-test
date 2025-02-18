import { defineMessage, MessageDescriptor } from 'react-intl'

import {
  PortalViewEnum,
  PortalComponentsEnum, GuestNetworkTypeEnum
} from '@acx-ui/rc/utils'

export const portalViewTypes: Record<PortalViewEnum, MessageDescriptor> = {
  [PortalViewEnum.ClickThrough]: defineMessage({ defaultMessage: 'Click Through' }),
  [PortalViewEnum.GuestPassConnect]: defineMessage({ defaultMessage: 'Guest Pass - Connect' }),
  [PortalViewEnum.GuestPassForgot]:
    defineMessage({ defaultMessage: 'Guest Pass - Forgot password' }),
  [PortalViewEnum.SelfSignIn]: defineMessage({ defaultMessage: 'Self Sign In - Connect' }),
  [PortalViewEnum.SelfSignInRegister]:
    defineMessage({ defaultMessage: 'Self Sign In - Register/Confirm' }),
  [PortalViewEnum.HostApproval]:
    defineMessage({ defaultMessage: 'Host Approval - Register/Confirm' }),
  [PortalViewEnum.Directory]:
    defineMessage({ defaultMessage: 'Active Directory/ LDAP Server' }),
  [PortalViewEnum.SAML]:
    defineMessage({ defaultMessage: 'SSO via SAML Identity Provider (IdP)' }),
  [PortalViewEnum.ConnectionConfirmed]: defineMessage({ defaultMessage: 'Connection confirmed' }),
  [PortalViewEnum.TermCondition]: defineMessage({ defaultMessage: 'Terms & Conditions' })
}

export const portalComponentsValue: Record<PortalComponentsEnum, MessageDescriptor> = {
  [PortalComponentsEnum.Logo]: defineMessage({ defaultMessage: 'Logo' }),
  [PortalComponentsEnum.Welcome]: defineMessage({ defaultMessage: 'Welcome text' }),
  [PortalComponentsEnum.Photo]: defineMessage({ defaultMessage: 'Photo' }),
  [PortalComponentsEnum.SecondaryText]: defineMessage({ defaultMessage: 'Secondary text' }),
  [PortalComponentsEnum.TermsConditions]: defineMessage({ defaultMessage: 'Terms & conditions' }),
  [PortalComponentsEnum.PoweredBy]: defineMessage({ defaultMessage: 'Powered By' }),
  [PortalComponentsEnum.Wifi4eu]: defineMessage({ defaultMessage: 'WiFi4EU Snippet' })
}

/* eslint-disable max-len */
export const captiveTypesDescription: Record<GuestNetworkTypeEnum, MessageDescriptor> = {
  [GuestNetworkTypeEnum.ClickThrough]: defineMessage({
    defaultMessage: 'Users just need to accept Terms and Conditions in order to access the network',
    description: 'Description for Click-Through'
  }),
  [GuestNetworkTypeEnum.SelfSignIn]: defineMessage({
    defaultMessage: 'Users can sign in with their social media account or register their details in the portal and get personal password',
    description: 'Description for Self Sign In'
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
  }),
  [GuestNetworkTypeEnum.Directory]: defineMessage({
    defaultMessage: 'Users are required to enter an organizational username and password to gain access to the network',
    description: 'Description for Active Directory/ LDAP Server'
  }),
  [GuestNetworkTypeEnum.SAML]: defineMessage({
    defaultMessage: 'Users authenticate through the organization\'s SAML Identity Provider (IdP) for secure Single Sign-On (SSO) using their credentials.',
    description: 'SSO via SAML Identity Provider (IdP)'
  })
}

