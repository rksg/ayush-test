/* eslint-disable max-len */
import { PhoneNumberType, PhoneNumberUtil } from 'google-libphonenumber'
import { isEqual, includes }                from 'lodash'

import { getIntl, validationMessages } from '@acx-ui/utils'


export function networkWifiIpRegExp (value: string) {
  const { $t } = getIntl()
  const re = new RegExp('^((22[0-3]|2[0-1][0-9]|1[0-9][0-9]|[1-9][0-9]|[1-9])\\.)((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){2}((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))$')
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.ipAddress))
  }
  return Promise.resolve()
}

export function serverIpAddressRegExp (value: string) {
  const { $t } = getIntl()
  const re = new RegExp(/^([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])(\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])){2}\.([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-4])$/)
  if (value!=='' && !re.test(value)) {
    return Promise.reject($t(validationMessages.ipAddress))
  }
  return Promise.resolve()
}

export function networkWifiPortRegExp (value: number) {
  const { $t } = getIntl()
  if (value && value <= 0){
    return Promise.reject($t(validationMessages.validateEqualOne))
  } else if (value && value > 65535) {
    return Promise.reject($t(validationMessages.validateLowerThan65535))
  }
  return Promise.resolve()
}

export function networkWifiSecretRegExp (value: string) {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const re = new RegExp('^[\\x21-\\x7E]+([\\x20-\\x7E]*[\\x21-\\x7E]+)*$')
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.invalid))
  }
  return Promise.resolve()
}

export function URLRegExp (value: string) {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const re = new RegExp('^(http:\\/\\/www\\.|https:\\/\\/www\\.|http:\\/\\/|https:\\/\\/)?[a-z0-9]+([\\-\\.]{1}[a-z0-9]+)*\\.[a-z]{2,5}(:[0-9]{1,5})?(\\/.*)?$')
  if (value!=='' && !re.test(value)) {
    return Promise.reject($t(validationMessages.validateURL))
  }
  return Promise.resolve()
}

export function domainNameRegExp (value: string) {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const re = new RegExp(/^(\*(\.[0-9A-Za-z]{1,63})+(\.\*)?|([0-9A-Za-z]{1,63}\.)+\*|([0-9A-Za-z]{1,63}(\.[0-9A-Za-z]{1,63})+))$/)
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.invalid))
  }
  return Promise.resolve()
}

export function syslogServerRegExp (value: string) {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const re = new RegExp('^(\\b([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\b)\\.(\\b([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\b)\\.(\\b([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\b)\\.(\\b([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\b)$')
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.invalid))
  }
  return Promise.resolve()
}

export function trailingNorLeadingSpaces (value: string) {
  const { $t } = getIntl()
  if (value && (value.endsWith(' ') || value.startsWith(' '))) {
    return Promise.reject($t(validationMessages.leadingTrailingWhitespace))
  }
  return Promise.resolve()
}

export function hasGraveAccentAndDollarSign (value: string) {
  const { $t } = getIntl()
  if (value.includes('`') && value.includes('$(')) {
    return Promise.reject($t(validationMessages.hasGraveAccentAndDollarSign))
  } else if (value.includes('`')) {
    return Promise.reject($t(validationMessages.hasGraveAccent))
  } else if (value.includes('$(')) {
    return Promise.reject($t(validationMessages.hasDollarSign))
  }
  return Promise.resolve()
}

export function passphraseRegExp (value: string) {
  const { $t } = getIntl()
  const re = new RegExp('^[!-_a-~]((?!\\$\\()[ !-_a-~]){6,61}[!-_a-~]$|^[A-Fa-f0-9]{64}$')
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.invalid))
  }
  return Promise.resolve()
}

export function checkObjectNotExists <ItemType> (
  list: ItemType[],
  value: ItemType,
  entityName: string,
  key = 'name',
  extra?: string
) {
  const { $t } = getIntl()
  if (list.filter(item => isEqual(item, value)).length !== 0) {
    return Promise.reject($t(validationMessages.duplication, { entityName, key, extra }))
  }
  return Promise.resolve()
}

export function checkItemNotIncluded (
  list: string[],
  value: string,
  entityName: string,
  exclusionItems: string
) {
  const { $t } = getIntl()
  if (list.filter(item => includes(value, item)).length !== 0) {
    return Promise.reject($t(validationMessages.exclusion, { entityName, exclusionItems }))
  }
  return Promise.resolve()
}

export function hexRegExp (value: string) {
  const { $t } = getIntl()
  const re = new RegExp(/^[0-9a-fA-F]{26}$/)
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.invalidHex))
  }
  return Promise.resolve()
}

export function notAllDigitsRegExp (value: string) {
  const { $t } = getIntl()
  const re = new RegExp(/^([0-9]+)$/)
  if (value!=='' && re.test(value)) {
    return Promise.reject($t(validationMessages.invalidNotAllDigits))
  }
  return Promise.resolve()
}

export function excludeExclamationRegExp (value: string) {
  const { $t } = getIntl()
  const re = new RegExp(/^(?:(?!")(?!!)(?!\s).)*$/)
  if (value!=='' && !re.test(value)) {
    return Promise.reject($t(validationMessages.excludeExclamationRegExp))
  }
  return Promise.resolve()
}

export function excludeQuoteRegExp (value: string) {
  const { $t } = getIntl()
  const re = new RegExp(/^(?:(?!")(?!\s).)*$/)
  if (value!=='' && !re.test(value)) {
    return Promise.reject($t(validationMessages.excludeQuoteRegExp))
  }
  return Promise.resolve()
}

export function excludeSpaceRegExp (value: string) {
  const { $t } = getIntl()
  const re = new RegExp(/^(?:(?!\s).)*$/)
  if (value!=='' && !re.test(value)) {
    return Promise.reject($t(validationMessages.excludeSpaceRegExp))
  }
  return Promise.resolve()
}

export function excludeSpaceExclamationRegExp (value: string) {
  const { $t } = getIntl()
  const re = new RegExp(/^(?:(?!!)(?!\s).)*$/)
  if (value!=='' && !re.test(value)) {
    return Promise.reject($t(validationMessages.excludeSpaceExclamationRegExp))
  }
  return Promise.resolve()
}

export function portRegExp (value: string) {
  const { $t } = getIntl()
  const re = new RegExp(/^([0-9]|[1-9][0-9]{1,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/)
  if (value!=='' && !re.test(value)) {
    return Promise.reject($t(validationMessages.portRegExp))
  }
  return Promise.resolve()
}

export function validateUsername (value: string) {
  const { $t } = getIntl()
  const re = new RegExp(/^(?!admin$).*/)
  if (value!=='' && !re.test(value)) {
    return Promise.reject($t(validationMessages.validateUsername))
  }
  return Promise.resolve()
}

export function validateUserPassword (value: string) {
  const { $t } = getIntl()
  if (value && value.length >= 8) {
    let restriction = 0
    if (/[a-z]/.test(value)) { // lowercase
      restriction++
    }
    if (/[A-Z]/.test(value)) { // uppercase
      restriction++
    }
    if (/["#$%&'()*+,./:;<=>?@\^_`{|}~-]+/.test(value)) { // non-alphanumeric ASCII (Except ! and '')
      restriction++
    }
    if (/[0-9]/.test(value)) { // ASCII digits (numeric)
      restriction++
    }
    if (restriction !== 4) {
      return Promise.reject($t(validationMessages.validateUserPassword))
    }
    return Promise.resolve()
  } else {
    return Promise.resolve()
  }
}
export function subnetMaskIpRegExp (value: string) {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const re = new RegExp('^((128|192|224|240|248|252|254)\.0\.0\.0)|(255\.(((0|128|192|224|240|248|252|254)\.0\.0)|(255\.(((0|128|192|224|240|248|252|254)\.0)|255\.(0|128|192|224|240|248|252|254)))))$')
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.subnetMask))
  }
  return Promise.resolve()
}

export function checkVlanMember (value: string) {
  const { $t } = getIntl()
  const items = value.toString().split(',')
  const isValid = items.map((item: string) => {
    const num = item.includes('-') ? item : Number(item)
    if (item.includes('-')) {
      const nums = item.split('-').map((x: string) => Number(x))
      return nums[1] > nums[0] && nums[1] < 4095 && nums[0] > 0
    }
    return num > 0 && num < 4095
  }).filter((x:boolean) => !x).length === 0

  if (isValid) {
    return Promise.resolve()
  }
  return Promise.reject($t(validationMessages.invalid))
}

export function checkValues (value: string, checkValue: string, checkEqual?: boolean) {
  const { $t } = getIntl()
  const valid = checkEqual ? isEqual(value, checkValue) : !isEqual(value, checkValue)
  if (value && !valid) {
    return Promise.reject($t(validationMessages.invalid))
  }
  return Promise.resolve()
}

export function apNameRegExp (value: string) {
  const { $t } = getIntl()
  const re = new RegExp('(?=^((?!`|\\$\\()[ -_a-~]){2,32}$)^(\\S.*\\S)$')
  if (value!=='' && !re.test(value)) {
    return Promise.reject($t(validationMessages.invalid))
  }
  return Promise.resolve()
}

export function gpsRegExp (lat: string, lng: string) {
  const { $t } = getIntl()
  const latitudeRe = new RegExp('^$|^(-?(?:90(?:\\.0{1,6})?|(?:[1-8]?\\d(?:\\.\\d{1,6})?)))$')
  const longitudeRe = new RegExp('^$|^(-?(?:180(?:\\.0{1,6})?|(?:[1-9]?\\d(?:\\.\\d{1,6})?)|(?:1[0-7]?\\d(?:\\.\\d{1,6})?)))$')

  if (!lat || !lng || !latitudeRe.test(lat) || !longitudeRe.test(lng)) {
    return Promise.reject($t(validationMessages.gpsCoordinates))
  }
  return Promise.resolve()
}

export function serialNumberRegExp (value: string) {
  const { $t } = getIntl()
  const re = new RegExp('^[1-9][0-9]{11}$')
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.invalid))
  }
  return Promise.resolve()
}

export function targetHostRegExp (value: string) {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const re = new RegExp('(^((22[0-3]|2[0-1][0-9]|1[0-9][0-9]|[1-9][0-9]|[1-9]?)\\.)((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){2}((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))$)|(^(\\b((?=[a-z0-9-]{1,63}\\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\\.)+[a-z]{2,63}\\b)$)')
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.targetHost))
  }
  return Promise.resolve()
}

export function MacAddressFilterRegExp (value: string){
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const re = new RegExp(/^(?:[0-9A-Fa-f]{2}([-:]?))(?:[0-9A-Fa-f]{2}\1){4}[0-9A-Fa-f]{2}|([0-9A-Fa-f]{4}\.){2}[0-9A-Fa-f]{4}$/)
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.invalid))
  }
  return Promise.resolve()
}

export function emailRegExp (value: string) {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const re = new RegExp (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)

  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.emailAddress))
  }
  return Promise.resolve()
}

export function phoneRegExp (value: string) {
  const { $t } = getIntl()
  const re = new RegExp (/^[+][1-9]{1,3}\s?([0-9s-]|[- ]){10,16}$/)

  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.phoneNumber))
  }

  if (value && !ValidatePhoneNumber(value)){
    return Promise.reject($t(validationMessages.phoneNumber))
  }
  return Promise.resolve()
}

export function ValidatePhoneNumber (phoneNumber: string) {
  const phoneNumberUtil = PhoneNumberUtil.getInstance()
  let number
  let phoneNumberType
  try {
    number = phoneNumberUtil.parse(phoneNumber, '')
    phoneNumberType = phoneNumberUtil.getNumberType(number)
  } catch (e) {
    return false
  }
  if (!number) {
    return false
  } else {
    if (!phoneNumberUtil.isValidNumber(number) ||
      (phoneNumberType !== PhoneNumberType.MOBILE && phoneNumberType !== PhoneNumberType.FIXED_LINE_OR_MOBILE)) {
      return false
    }
  }
  return true
}