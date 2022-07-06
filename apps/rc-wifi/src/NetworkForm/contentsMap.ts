import { NetworkTypeEnum } from '@acx-ui/rc/utils'

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
  [NetworkTypeEnum.DPSK]: 'DPSK Settings'
}
