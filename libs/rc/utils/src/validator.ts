import { isEqual, includes } from 'lodash'
import { IntlShape }         from 'react-intl'

import { validationMessages } from '@acx-ui/utils'


export function networkWifiIpRegExp ({ $t }: IntlShape, value: string) {
  // eslint-disable-next-line max-len
  const re = new RegExp('^((22[0-3]|2[0-1][0-9]|1[0-9][0-9]|[1-9][0-9]|[1-9])\\.)((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){2}((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))$')
  if (value!=='' && !re.test(value)) {
    return Promise.reject($t(validationMessages.ipAddress))
  }
  return Promise.resolve()
}

export function networkWifiSecretRegExp ({ $t }: IntlShape, value: string) {
  // eslint-disable-next-line max-len
  const re = new RegExp('^[\\x21-\\x7E]+([\\x20-\\x7E]*[\\x21-\\x7E]+)*$')
  if (value!=='' && !re.test(value)) {
    return Promise.reject($t(validationMessages.invalid))
  }
  return Promise.resolve()
}

export function domainNameRegExp ({ $t }: IntlShape, value: string) {
  // eslint-disable-next-line max-len
  const re = new RegExp(/^(\*(\.[0-9A-Za-z]{1,63})+(\.\*)?|([0-9A-Za-z]{1,63}\.)+\*|([0-9A-Za-z]{1,63}(\.[0-9A-Za-z]{1,63})+))$/)
  if (value!=='' && !re.test(value)) {
    return Promise.reject($t(validationMessages.invalid))
  }
  return Promise.resolve()
}

export function trailingNorLeadingSpaces ({ $t }: IntlShape, value: string) {
  if (value && (value.endsWith(' ') || value.startsWith(' '))) {
    return Promise.reject($t(validationMessages.leadingTrailingWhitespace))
  }
  return Promise.resolve()
}

export function checkObjectNotExists <ItemType> (
  intl: IntlShape,
  list: ItemType[],
  value: ItemType,
  entityName: string,
  key = 'name'
) {
  if (list.filter(item => isEqual(item, value)).length !== 0) {
    return Promise.reject(intl.$t(validationMessages.duplication, { entityName, key }))
  }
  return Promise.resolve()
}

export function checkItemNotIncluded (
  intl: IntlShape,
  list: string[],
  value: string,
  entityName: string,
  exclusionItems: string
) {
  if (list.filter(item => includes(value, item)).length !== 0) {
    return Promise.reject(intl.$t(validationMessages.exclusion, { entityName, exclusionItems }))
  }
  return Promise.resolve()
}

export function hexRegExp ({ $t }: IntlShape, value: string) {
  const re = new RegExp(/^[0-9a-fA-F]{26}$/)
  if (value!=='' && !re.test(value)) {
    return Promise.reject($t(validationMessages.invalidHex))
  }
  return Promise.resolve()
}

export function subnetMaskIpRegExp ({ $t }: IntlShape, value: string) {
  // eslint-disable-next-line max-len
  const re = new RegExp('^((128|192|224|240|248|252|254)\.0\.0\.0)|(255\.(((0|128|192|224|240|248|252|254)\.0\.0)|(255\.(((0|128|192|224|240|248|252|254)\.0)|255\.(0|128|192|224|240|248|252|254)))))$')
  if (value!=='' && !re.test(value)) {
    return Promise.reject($t(validationMessages.subnetMask))
  }
  return Promise.resolve()
}
