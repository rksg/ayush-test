import _ from 'lodash'

import { getIntl } from '@acx-ui/utils'

type SortResult = -1 | 0 | 1

export function defaultSort (a: unknown, b: unknown): SortResult {
  if (typeof a === 'number' && typeof b === 'number') {
    if (a < b) return -1
    if (a > b) return 1
    return 0
  }
  a = a || ''
  b = b || ''
  return String(a).localeCompare(String(b), getIntl().locale, { sensitivity: 'base' }) as SortResult
}

export function sortProp<RecordType> (
  prop: string,
  sortFn: (a: unknown, b: unknown) => SortResult
) {
  return (a: RecordType, b: RecordType) => {
    const valueA = _.get(a, prop)
    const valueB = _.get(b, prop)
    return sortFn(valueA, valueB)
  }
}