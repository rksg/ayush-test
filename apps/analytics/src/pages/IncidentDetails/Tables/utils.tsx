import { Incident } from '@acx-ui/analytics/utils'

export interface ImpactedTableProps {
  incident: Incident
}

export const defaultSort = (a: string | number, b: string | number) => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export const json2keymap = (keyFields: string[], field: string, filter: string[]) =>
  (...mappings: any[]) => mappings
  // (...mappings: Array<{id: number, code: string, text: string}>[]) => mappings
    .flatMap(items => items)
    .filter(item => !filter.includes(item[field]))
    .reduce((map, item) => map.set(
      keyFields.map(keyField => item[keyField]).join('-'),
      item[field]
    ), new Map())
