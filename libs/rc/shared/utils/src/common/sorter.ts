import _      from 'lodash'
import moment from 'moment-timezone'

import { getIntl } from '@acx-ui/utils'

export type SortResult = -1 | 0 | 1

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

export function dateSort (a: unknown, b: unknown): SortResult {
  a = a || '1970-01-01T00:00:00Z'
  b = b || '1970-01-01T00:00:00Z'
  return Math.sign(moment(String(a)).diff(moment(String(b)))) as SortResult
}

export function arraySizeSort (a?: string[], b?: string[]): SortResult {
  // handle null case
  const valueA = a ? a.length : -1
  const valueB = b ? b.length : -1
  if (valueA < valueB) return -1
  if (valueA > valueB) return 1
  return 0
}

export function sortProp<RecordType, PropType = unknown> (
  prop: string,
  sortFn: (a: PropType, b: PropType) => SortResult
) {
  return (a: RecordType, b: RecordType) => {
    const valueA = _.get(a, prop)
    const valueB = _.get(b, prop)
    return sortFn(valueA, valueB)
  }
}
