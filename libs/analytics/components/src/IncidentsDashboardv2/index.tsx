import { defineMessage, useIntl } from 'react-intl'
import AutoSizer                  from 'react-virtualized-auto-sizer'

import { incidentSeverities, IncidentFilter }                                       from '@acx-ui/analytics/utils'
import { HistoricalCard, Loader, NoActiveData, DonutChart, DonutChartData, cssStr } from '@acx-ui/components'
import { Features, useIsSplitOn }                                                   from '@acx-ui/feature-toggle'
import { useNavigateToPath }                                                        from '@acx-ui/react-router-dom'
import { hasRaiPermission }                                                         from '@acx-ui/user'
import { useTrackLoadTime, widgetsMapping }                                         from '@acx-ui/utils'

import { useIncidentToggles } from '../useIncidentToggles'

import { useIncidentsBySeverityDashboardv2Query } from './services'
import * as UI                                    from './styledComponents'

export function IncidentsDashboardv2 ({ filters }: { filters: IncidentFilter }) {
  const { $t } = useIntl()
  const toggles = useIncidentToggles()
  const onArrowClick = useNavigateToPath('/analytics/incidents/')
  const isMonitoringPageEnabled = useIsSplitOn(Features.MONITORING_PAGE_LOAD_TIMES)

  const response = useIncidentsBySeverityDashboardv2Query({ ...filters, toggles })
  const { data: severities } = response

  useTrackLoadTime({
    itemName: widgetsMapping.INCIDENTS_DASHBOARD,
    states: [response],
    isEnabled: isMonitoringPageEnabled
  })

  const incidentCountBySeverity: { [severity: string] : number } = {}
  let noData = true
  severities && Object.entries(severities).forEach(([severity, data]) => {
    if(data.incidentsCount > 0) {
      noData = false
    }
    incidentCountBySeverity[severity] = data?.incidentsCount
  })

  const chartData: DonutChartData[] = []
  for (let prop in incidentCountBySeverity ) {
    chartData.push({
      name: prop,
      value: incidentCountBySeverity[prop],
      color: cssStr(incidentSeverities[prop as keyof typeof incidentSeverities].color)
    })
  }

  return <Loader states={[response]}>
    <HistoricalCard title={$t(defineMessage({ defaultMessage: 'Incidents' }))}
      onArrowClick={hasRaiPermission('READ_INCIDENTS') ? onArrowClick : undefined}>
      <AutoSizer>
        {({ width, height }) => (
          noData
            ? <NoActiveData text={$t({ defaultMessage: 'No reported incidents' })} />
            : <UI.Container
              hasAccess={hasRaiPermission('READ_INCIDENTS')}
              style={{ width, height }}
              onClick={hasRaiPermission('READ_INCIDENTS') ? onArrowClick : undefined}
            >
              <DonutChart
                style={{ width, height }}
                data={chartData}
                showLabel={false}
                showTotal={true}
                showLegend={false}
                size={'medium'}
              />
            </UI.Container>
        )}
      </AutoSizer>
    </HistoricalCard>
  </Loader>
}
