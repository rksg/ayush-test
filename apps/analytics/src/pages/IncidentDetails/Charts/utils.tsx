import { Incident } from '@acx-ui/analytics/utils'

export interface ImpactedTableProps {
  incident: Incident
}

export const defaultSort = (a: string | number, b: string | number) => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}
