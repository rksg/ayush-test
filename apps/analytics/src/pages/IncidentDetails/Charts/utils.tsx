import { Incident } from '@acx-ui/analytics/utils'

export interface ImpactedTableProps {
  incident: Incident
}

export const defaultSort = (a: string | number, b: string | number) => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

type map = {
  id: number
  code: string
  text: string
}

export const json2keymap = (keyFields: string[], field: string, filter: string[]) =>
  (...mappings : map[][]) => mappings
    .flatMap(items => items)
    .filter(item => !filter.includes(item[field as keyof map] as string))
    .reduce((map, item) => map.set(
      keyFields.map(keyField => item[keyField as keyof map]).join('-'),
      item[field as keyof map] as string
    ), new Map() as Map<string, string>)
