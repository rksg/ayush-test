import { defineMessage, MessageDescriptor } from 'react-intl'

import { NetworkTypeEnum } from '@acx-ui/rc/utils'

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
