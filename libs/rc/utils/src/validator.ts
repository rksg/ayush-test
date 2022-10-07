import { isEqual, includes } from 'lodash'

import { getIntl, validationMessages } from '@acx-ui/utils'

export function networkWifiIpRegExp (value: string) {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const re = new RegExp('^((22[0-3]|2[0-1][0-9]|1[0-9][0-9]|[1-9][0-9]|[1-9])\\.)((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){2}((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))$')
  if (value && !re.test(value)) {
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

export function subnetMaskIpRegExp (value: string) {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const re = new RegExp('^((128|192|224|240|248|252|254)\.0\.0\.0)|(255\.(((0|128|192|224|240|248|252|254)\.0\.0)|(255\.(((0|128|192|224|240|248|252|254)\.0)|255\.(0|128|192|224|240|248|252|254)))))$')
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.subnetMask))
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
