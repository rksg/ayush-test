import React from 'react'

import moment from 'moment-timezone'
import {
  defineMessage,
  FormattedMessage,
  IntlShape,
  MessageDescriptor,
  useIntl
} from 'react-intl'


import {
  GuestNetworkTypeEnum,
  NetworkTypeEnum,
  PassphraseExpirationEnum,
  PassphraseFormatEnum,
  WlanSecurityEnum
} from '../constants'
import { ExpirationType } from '../types'
import { Network }        from '../types/network'

import * as UI from './styledComponents'

export enum DpskNetworkType {
  FORMAT = 'PassphraseFormat',
  LENGTH = 'PassphraseLength',
  EXPIRATION = 'PassphraseExpiration'
}

export const EXPIRATION_DATE_FORMAT = 'YYYY-MM-DD'
export const EXPIRATION_TIME_FORMAT = EXPIRATION_DATE_FORMAT + ' hh:mm A'

const passphraseFormatLabel: Record<PassphraseFormatEnum, MessageDescriptor> = {
  [PassphraseFormatEnum.MOST_SECURED]: defineMessage({ defaultMessage: 'Most Secured' }),
  [PassphraseFormatEnum.KEYBOARD_FRIENDLY]: defineMessage({ defaultMessage: 'Keyboard Friendly' }),
  [PassphraseFormatEnum.NUMBERS_ONLY]: defineMessage({ defaultMessage: 'Numbers Only' })
}

const passphraseExpirationLabel: Record<PassphraseExpirationEnum, MessageDescriptor> = {
  [PassphraseExpirationEnum.UNLIMITED]: defineMessage({ defaultMessage: 'Unlimited' }),
  [PassphraseExpirationEnum.ONE_DAY]: defineMessage({ defaultMessage: '1 day' }),
  [PassphraseExpirationEnum.TWO_DAYS]: defineMessage({ defaultMessage: '2 days' }),
  [PassphraseExpirationEnum.ONE_WEEK]: defineMessage({ defaultMessage: '1 week' }),
  [PassphraseExpirationEnum.TWO_WEEKS]: defineMessage({ defaultMessage: '2 weeks' }),
  [PassphraseExpirationEnum.ONE_MONTH]: defineMessage({ defaultMessage: '1 month' }),
  [PassphraseExpirationEnum.SIX_MONTHS]: defineMessage({ defaultMessage: '6 months' }),
  [PassphraseExpirationEnum.ONE_YEAR]: defineMessage({ defaultMessage: '1 year' }),
  [PassphraseExpirationEnum.TWO_YEARS]: defineMessage({ defaultMessage: '2 years' })
}

const advancedPassphraseExpirationLabel: Record<ExpirationType, MessageDescriptor> = {
  [ExpirationType.SPECIFIED_DATE]: defineMessage({ defaultMessage: '{date}' }),
  // eslint-disable-next-line max-len
  [ExpirationType.MINUTES_AFTER_TIME]: defineMessage({ defaultMessage: '{offset} {offset, plural, one {minute} other {minutes}}' }),
  // eslint-disable-next-line max-len
  [ExpirationType.HOURS_AFTER_TIME]: defineMessage({ defaultMessage: '{offset} {offset, plural, one {hour} other {hours}}' }),
  // eslint-disable-next-line max-len
  [ExpirationType.DAYS_AFTER_TIME]: defineMessage({ defaultMessage: '{offset} {offset, plural, one {day} other {days}}' }),
  // eslint-disable-next-line max-len
  [ExpirationType.WEEKS_AFTER_TIME]: defineMessage({ defaultMessage: '{offset} {offset, plural, one {week} other {weeks}}' }),
  // eslint-disable-next-line max-len
  [ExpirationType.MONTHS_AFTER_TIME]: defineMessage({ defaultMessage: '{offset} {offset, plural, one {month} other {months}}' }),
  // eslint-disable-next-line max-len
  [ExpirationType.YEARS_AFTER_TIME]: defineMessage({ defaultMessage: '{offset} {offset, plural, one {year} other {years}}' })
}

interface AdvancedPassphraseExpirationProps {
  expirationType: ExpirationType | null;
  expirationOffset?: number;
  expirationDate?: string;
  displayTime?: boolean;
}

export function transformAdvancedDpskExpirationText (
  { $t }: IntlShape,
  props: AdvancedPassphraseExpirationProps
) {
  const { expirationType, expirationOffset, expirationDate, displayTime = false } = props
  if (!expirationType) {
    return $t(passphraseExpirationLabel[PassphraseExpirationEnum.UNLIMITED])
  } else if (expirationType === ExpirationType.SPECIFIED_DATE) {
    const expirationDateMoment = moment(expirationDate)
    const text = $t(advancedPassphraseExpirationLabel[ExpirationType.SPECIFIED_DATE], {
      // eslint-disable-next-line max-len
      date: expirationDateMoment.format(displayTime ? EXPIRATION_TIME_FORMAT : EXPIRATION_DATE_FORMAT)
    })
    const isSameOrBeforeToday = expirationDateMoment.isSameOrBefore(new Date())

    return isSameOrBeforeToday
      ? <UI.ExpiredDateWrapper>{text}</UI.ExpiredDateWrapper>
      : text
  } else {
    return $t(advancedPassphraseExpirationLabel[expirationType], { offset: expirationOffset })
  }
}

export function transformDpskNetwork (
  { $t }: IntlShape,
  type: DpskNetworkType,
  value?: string | number | AdvancedPassphraseExpirationProps
) {
  let displayValue = ''
  if (type === DpskNetworkType.FORMAT) {
    if (!value) {
      return $t({ defaultMessage: 'Error: Can not detect passphrase format value' })
    }
    displayValue = $t(passphraseFormatLabel[value as PassphraseFormatEnum])
  } else if (type === DpskNetworkType.LENGTH) {
    displayValue = $t({ defaultMessage: '{count} Characters' }, { count: value as number })
  } else if (type === DpskNetworkType.EXPIRATION) {
    if (!value) {
      return $t({ defaultMessage: 'Error: Can not detect passphrase expiration value' })
    }
    displayValue = $t(passphraseExpirationLabel[value as PassphraseExpirationEnum])
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
  }),
  [WlanSecurityEnum.OWE]: defineMessage({
    defaultMessage: 'OWE',
    description: 'Opportunistic Wireless Encryption - OWE'
  }),
  [WlanSecurityEnum.None]: defineMessage({
    defaultMessage: 'None',
    description: 'WLAN security type - None'
  }),
  [WlanSecurityEnum.OWE]: defineMessage({
    defaultMessage: 'OWE',
    description: 'WLAN security type - OWE'
  }),
  [WlanSecurityEnum.OWETransition]: defineMessage({
    defaultMessage: 'OWETransition',
    description: 'WLAN security type - OWETransition'
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
