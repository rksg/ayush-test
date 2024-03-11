import { omit } from 'lodash'

export function updateRowId<T extends Object> (data: Array<T>) {
  return data.map((item, i) => ({
    ...item,
    rowId: i
  }))
}

export function removeRowId<T extends Object> (data: Array<T>) {
  return data.map((item) => ( omit(item, ['rowId'])))
}