/* eslint-disable max-len */
import { isEqual, includes } from 'lodash'

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

export function networkWifiSecretRegExp (value: string) {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const re = new RegExp('^[\\x21-\\x7E]+([\\x20-\\x7E]*[\\x21-\\x7E]+)*$')
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.invalid))
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
  key = 'name'
) {
  const { $t } = getIntl()
  if (list.filter(item => isEqual(item, value)).length !== 0) {
    return Promise.reject($t(validationMessages.duplication, { entityName, key }))
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