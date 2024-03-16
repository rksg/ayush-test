import { omit } from 'lodash'

export function updateRowIds<T extends Object> (data: Array<T>) {
  return data.map((item, i) => ({
    ...item,
    rowId: i
  }))
}

export function removeRowIds<T extends Object> (data: Array<T>) {
  return data.map((item) => ( omit(item, ['rowId'])))
}