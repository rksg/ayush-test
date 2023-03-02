import _      from 'lodash'
import moment from 'moment-timezone'

import { getIntl } from '@acx-ui/utils'

import { noDataSymbol } from '../src/constants'

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

export function dateSort (a: unknown, b: unknown): SortResult {
  a = a || '1970-01-01T00:00:00Z'
  b = b || '1970-01-01T00:00:00Z'
  return Math.sign(moment(String(a)).diff(moment(String(b)))) as SortResult
}

export function clientImpactSort (a: unknown, b: unknown): SortResult {
  let c = (a === noDataSymbol) ? -1 : parseFloat(a as string)
  let d = (b === noDataSymbol) ? -1 : parseFloat(b as string)
  if (isNaN(c)) c = -2
  if (isNaN(d)) d = -2
  if (c > d) return 1
  if (c < d) return -1
  return 0
}

export function severitySort (a: unknown, b: unknown): SortResult {
  if (typeof a !== 'number' && typeof b !== 'number') return 0
  const isDefined = typeof a !== 'undefined' && typeof b !== 'undefined'
  const c = a as number
  const d = b as number
  if (isDefined && c > d) return 1
  if (isDefined && c < d) return -1
  return 0
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
