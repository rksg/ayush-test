import { defineMessage, MessageDescriptor } from 'react-intl'

import {
  PortalViewEnum,
  PortalComponentsEnum
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
