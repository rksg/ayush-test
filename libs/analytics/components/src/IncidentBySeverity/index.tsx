
import { IncidentFilter }                   from '@acx-ui/analytics/utils'
import { Features, useIsSplitOn }           from '@acx-ui/feature-toggle'
import { useTrackLoadTime, widgetsMapping } from '@acx-ui/utils'

import { IncidentsBySeverityData, useIncidentsBySeverityQuery } from '../IncidentBySeverity/services'
import { useIncidentToggles }                                   from '../useIncidentToggles'

import { IncidentBySeverityBarChart }   from './IncidentBySeverityBarChart'
import { IncidentBySeverityDonutChart } from './IncidentBySeverityDonutChart'

export type IncidentBySeverityProps = {
  type: 'bar' | 'donut'
  filters: IncidentFilter,
  setIncidentCount?: (incidentCount: number) => void
}

export function IncidentBySeverity ({ type, filters, setIncidentCount }: IncidentBySeverityProps) {
  const toggles = useIncidentToggles()
  const isMonitoringPageEnabled = useIsSplitOn(Features.MONITORING_PAGE_LOAD_TIMES)

  const queryResult = useIncidentsBySeverityQuery({ ...filters, toggles }, {
    selectFromResult: ({ data, ...rest }) => ({
      data: { ...data } as IncidentsBySeverityData,
      ...rest
    })
  })

  useTrackLoadTime({
    itemName: widgetsMapping.INCIDENT_BY_SEVERITY,
    states: [queryResult],
    isEnabled: isMonitoringPageEnabled
  })

  setIncidentCount &&
  setIncidentCount(Object.values(queryResult.data).reduce(
    (accumulator, currentValue) => {
      return accumulator + currentValue
    }, 0))

  const Chart = type === 'bar' ? IncidentBySeverityBarChart : IncidentBySeverityDonutChart
  return <Chart filters={filters} />
}
