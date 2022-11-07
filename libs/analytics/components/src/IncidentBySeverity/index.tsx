
import { IncidentFilter } from '@acx-ui/analytics/utils'

import { IncidentBySeverityBarChart }   from './IncidentBySeverityBarChart'
import { IncidentBySeverityDonutChart } from './IncidentBySeverityDonutChart'

export type IncidentBySeverityProps = {
  type: 'bar' | 'donut'
  filters: IncidentFilter
}

export function IncidentBySeverity ({ type, filters }: IncidentBySeverityProps) {
  const Chart = type === 'bar' ? IncidentBySeverityBarChart : IncidentBySeverityDonutChart
  return <Chart filters={filters} />
}
