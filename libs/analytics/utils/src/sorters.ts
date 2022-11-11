import _      from 'lodash'
import moment from 'moment-timezone'

import { noDataSymbol } from '../src/constants'

type SortResult = -1 | 0 | 1

export function defaultSort (a: string | number, b: string | number): SortResult {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export function dateSort (a: string, b: string): SortResult {
  return Math.sign(moment(a).diff(moment(b))) as SortResult
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
  sortFn:
    ((a: string | number, b: string | number) => SortResult) |
    ((a: string, b: string) => SortResult) |
    ((a: unknown, b: unknown) => SortResult)
) {
  return (a: RecordType, b: RecordType) => {
    const valueA = _.get(a, prop)
    const valueB = _.get(b, prop)
    return sortFn(valueA, valueB)
  }
}
