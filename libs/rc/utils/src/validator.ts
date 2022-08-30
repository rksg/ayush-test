import { isEqual }   from 'lodash'
import { IntlShape } from 'react-intl'

import { validationMessages } from '@acx-ui/utils'


export function networkWifiIpRegExp ({ $t }: IntlShape, value: string) {
  // eslint-disable-next-line max-len
  const re = new RegExp('^((22[0-3]|2[0-1][0-9]|1[0-9][0-9]|[1-9][0-9]|[1-9])\\.)((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){2}((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))$')
  if (value!=='' && !re.test(value)) {
    return Promise.reject($t(validationMessages.ipAddress))
  }
  return Promise.resolve()
}

export function networkWifiPortRegExp (value: number) {
  if (value && value <= 0){
    return Promise.reject('This value should be higher than or equal to 1')
  } else if (value && value > 65535) {
    return Promise.reject('This value should be lower than or equal to 65535')
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

export function URLRegExp (value: string) {
  // eslint-disable-next-line max-len
  const re = new RegExp('^(http:\\/\\/www\\.|https:\\/\\/www\\.|http:\\/\\/|https:\\/\\/)?[a-z0-9]+([\\-\\.]{1}[a-z0-9]+)*\\.[a-z]{2,5}(:[0-9]{1,5})?(\\/.*)?$')
  if (value!=='' && !re.test(value)) {
    return Promise.reject('Please enter a valid URL')
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

export function hexRegExp ({ $t }: IntlShape, value: string) {
  const re = new RegExp(/^[0-9a-fA-F]{26}$/)
  if (value!=='' && !re.test(value)) {
    return Promise.reject($t(validationMessages.invalidHex))
  }
  return Promise.resolve()
}
