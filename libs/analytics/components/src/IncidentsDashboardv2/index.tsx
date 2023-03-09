import { defineMessage, useIntl } from 'react-intl'
import AutoSizer                  from 'react-virtualized-auto-sizer'

import { incidentSeverities, IncidentFilter }                                       from '@acx-ui/analytics/utils'
import { HistoricalCard, Loader, NoActiveData, DonutChart, DonutChartData, cssStr } from '@acx-ui/components'

import { useIncidentsBySeverityDashboardv2Query } from './services'
import * as UI                                    from './styledComponents'

export function IncidentsDashboardv2 ({ filters }: { filters: IncidentFilter }) {
  const { $t } = useIntl()

  const response = useIncidentsBySeverityDashboardv2Query(filters)
  const { data: severities } = response

  const incidentsCount: Boolean[] = []
  const incidentCountBySeverity: { [severity: string] : number } = {}
  severities && Object.entries(severities).forEach(([severity, data]) => {
    incidentsCount.push(data.incidentsCount > 0)
    incidentCountBySeverity[severity] = data?.incidentsCount
  })

  const noData = incidentsCount.every(value => !value)

  const chartData: DonutChartData[] = []
  for (let prop in incidentCountBySeverity ) {
    chartData.push({
      name: prop,
      value: incidentCountBySeverity[prop],
      color: cssStr(incidentSeverities[prop as keyof typeof incidentSeverities].color)
    })
  }

  return <Loader states={[response]}>
    <HistoricalCard title={$t(defineMessage({ defaultMessage: 'Incidents' }))}>
      <AutoSizer>
        {({ width, height }) => (
          noData
            ? <NoActiveData text={$t({ defaultMessage: 'No active incidents' })} />
            : <UI.Container style={{ width, height }}>
              <DonutChart
                style={{ width, height }}
                data={chartData}
                showLabel={false}
                showTotal={true}
                showLegend={false}
                size={'small'}
              />
            </UI.Container>
        )}
      </AutoSizer>
    </HistoricalCard>
  </Loader>
}
