import { IntlShape } from 'react-intl'

import { PassphraseExpirationEnum, PassphraseFormatEnum, WlanSecurityEnum } from '../constants'

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
