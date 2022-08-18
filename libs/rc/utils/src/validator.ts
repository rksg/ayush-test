import { isEqual }   from 'lodash'
import { IntlShape } from 'react-intl'

import { validationMessages } from '@acx-ui/utils'


export function networkWifiIpRegExp ({ $t }: IntlShape, value: string) {
  // eslint-disable-next-line max-len
  const re = new RegExp(/^(([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(%[\p{N}\p{L}]+)?$/)
  if (value!=='' && !re.test(value)) {
    return Promise.reject($t(validationMessages.ipAddress))
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
