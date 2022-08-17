import React from 'react'

import { defineMessage, FormattedMessage, IntlShape, MessageDescriptor, useIntl } from 'react-intl'

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { Network } from '@acx-ui/rc/services'

import { GuestNetworkTypeEnum, NetworkTypeEnum, PassphraseExpirationEnum, PassphraseFormatEnum, WlanSecurityEnum } from '../constants'


export enum DpskNetworkType {
  FORMAT = 'PassphraseFormat',
  LENGTH = 'PassphraseLength',
  EXPIRATION = 'PassphraseExpiration'
}

export function transformDpskNetwork (
  { $t }: IntlShape,
  type: DpskNetworkType,
  value?: string | number
) {
  let displayValue = ''
  if (type === DpskNetworkType.FORMAT) {
    switch (value) {
      case PassphraseFormatEnum.MOST_SECURED:
        displayValue = $t({ defaultMessage: 'Most Secured' })
        break
      case PassphraseFormatEnum.KEYBOARD_FRIENDLY:
        displayValue = $t({ defaultMessage: 'Keyboard Friendly' })
        break
      case PassphraseFormatEnum.NUMBERS_ONLY:
        displayValue = $t({ defaultMessage: 'Numbers Only' })
        break
      default:
        displayValue = $t({ defaultMessage: 'Error: Can not detect passphrase format value' })
    }
  } else if (type === 'PassphraseLength') {
    displayValue = $t({ defaultMessage: '{count} Characters' }, { count: value })
  } else if (type === 'PassphraseExpiration') {
    switch (value) {
      case PassphraseExpirationEnum.UNLIMITED:
        displayValue = $t({ defaultMessage: 'Unlimited' })
        break
      case PassphraseExpirationEnum.ONE_DAY:
        displayValue = $t({ defaultMessage: '1 day' })
        break
      case PassphraseExpirationEnum.TWO_DAYS:
        displayValue = $t({ defaultMessage: '2 days' })
        break
      case PassphraseExpirationEnum.ONE_WEEK:
        displayValue = $t({ defaultMessage: '1 week' })
        break
      case PassphraseExpirationEnum.TWO_WEEKS:
        displayValue = $t({ defaultMessage: '2 weeks' })
        break
      case PassphraseExpirationEnum.ONE_MONTH:
        displayValue = $t({ defaultMessage: '1 month' })
        break
      case PassphraseExpirationEnum.SIX_MONTHS:
        displayValue = $t({ defaultMessage: '6 months' })
        break
      case PassphraseExpirationEnum.ONE_YEAR:
        displayValue = $t({ defaultMessage: '1 year' })
        break
      case PassphraseExpirationEnum.TWO_YEARS:
        displayValue = $t({ defaultMessage: '2 years' })
        break
      default:
        displayValue = $t({ defaultMessage: 'Error: Can not detect passphrase expiration value' })
    }
  }

  return displayValue
}

export function transformNetworkEncryption (type: WlanSecurityEnum | undefined) {
  const map: { [key: string]: string } = {
    [WlanSecurityEnum.WPA2Personal]: 'WPA2',
    [WlanSecurityEnum.WEP]: 'WEP',
    [WlanSecurityEnum.WPAPersonal]: 'WPA'
  }
  return type ? map[type] : ''
}

export const networkTypes: Record<NetworkTypeEnum, MessageDescriptor> = {
  [NetworkTypeEnum.OPEN]: defineMessage({ defaultMessage: 'Open Network' }),
  [NetworkTypeEnum.PSK]: defineMessage({ defaultMessage: 'Pre-Shared Key (PSK)' }),
  [NetworkTypeEnum.DPSK]: defineMessage({ defaultMessage: 'Dynamic Pre-Shared Key (DPSK)' }),
  [NetworkTypeEnum.AAA]: defineMessage({ defaultMessage: 'Enterprise AAA (802.1X)' }),
  [NetworkTypeEnum.CAPTIVEPORTAL]: defineMessage({ defaultMessage: 'Captive Portal' })
}

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

export const NetworkType: React.FC<{
  networkType: NetworkTypeEnum,
  row: Network
}> = ({ networkType, row }) => {
  const { $t } = useIntl()
  const captiveType = row.captiveType
  const wlan = row?.deepNetwork?.wlan

  switch (networkType) {
    case NetworkTypeEnum.OPEN:
      return <FormattedMessage
        {...networkTypes[NetworkTypeEnum.OPEN]}
      />
    case NetworkTypeEnum.PSK:
    case NetworkTypeEnum.DPSK:
    case NetworkTypeEnum.AAA:
      const message = networkTypes[networkType]
      return wlan?.wlanSecurity
        ? <FormattedMessage
          defaultMessage={'{networkType} - {authMethod}'}
          values={{
            networkType: $t(message),
            authMethod: $t(wlanSecurity[wlan?.wlanSecurity!])
          }}
        />
        : <FormattedMessage {...message} />
    case NetworkTypeEnum.CAPTIVEPORTAL:
      return <FormattedMessage
        defaultMessage={'Captive Portal - {captiveNetworkType}'}
        values={{
          captiveNetworkType: $t(captiveNetworkTypes[
            captiveType || GuestNetworkTypeEnum.Cloudpath
          ])
        }}
      />
  }
}