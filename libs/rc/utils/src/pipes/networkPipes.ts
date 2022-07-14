import { PassphraseExpirationEnum, PassphraseFormatEnum, WlanSecurityEnum } from '../constants'

export enum DpskNetworkType {
  FORMAT = 'PassphraseFormat',
  LENGTH = 'PassphraseLength',
  EXPIRATION = 'PassphraseExpiration'
}

export function transformDpskNetwork (type: DpskNetworkType, value?: string | number) {
  let displayValue = ''
  if (type === DpskNetworkType.FORMAT) {
    switch (value) {
      case PassphraseFormatEnum.MOST_SECURED:
        displayValue = 'Most Secured'
        break
      case PassphraseFormatEnum.KEYBOARD_FRIENDLY:
        displayValue = 'Keyboard Friendly'
        break
      case PassphraseFormatEnum.NUMBERS_ONLY:
        displayValue = 'Numbers Only'
        break
      default:
        displayValue = 'Error: Can not detect passphrase format value'
    }
  } else if (type === 'PassphraseLength') {
    displayValue = value + ' Characters'
  } else if (type === 'PassphraseExpiration') {
    switch (value) {
      case PassphraseExpirationEnum.UNLIMITED:
        displayValue = 'Unlimited'
        break
      case PassphraseExpirationEnum.ONE_DAY:
        displayValue = '1 day'
        break
      case PassphraseExpirationEnum.TWO_DAYS:
        displayValue = '2 days'
        break
      case PassphraseExpirationEnum.ONE_WEEK:
        displayValue = '1 week'
        break
      case PassphraseExpirationEnum.TWO_WEEKS:
        displayValue = '2 weeks'
        break
      case PassphraseExpirationEnum.ONE_MONTH:
        displayValue = '1 month'
        break
      case PassphraseExpirationEnum.SIX_MONTHS:
        displayValue = '6 months'
        break
      case PassphraseExpirationEnum.ONE_YEAR:
        displayValue = '1 year'
        break
      case PassphraseExpirationEnum.TWO_YEARS:
        displayValue = '2 years'
        break
      default:
        displayValue = 'Error: Can not detect passphrase expiration value'
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