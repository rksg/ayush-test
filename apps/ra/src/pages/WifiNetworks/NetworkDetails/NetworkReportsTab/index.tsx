import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  IncidentBySeverityDonutChart,
  KpiWidget,
  TtcTimeWidget,
  ConnectedClientsOverTime,
  NetworkHistory,
  TopApplicationsByTraffic,
  TrafficByVolume
} from '@acx-ui/analytics/components'
import { kpiConfig }                        from '@acx-ui/analytics/utils'
import { GridRow, GridCol, HistoricalCard } from '@acx-ui/components'
import { useDateFilter }                    from '@acx-ui/utils'
import type { AnalyticsFilter }             from '@acx-ui/utils'

export function NetworkDetailsReportTab () {
  const { $t } = useIntl()
  const { dateFilter } = useDateFilter()
  const { networkId } = useParams()

  const ssidFilter = { ssids: [networkId] }
  const filters = { ...dateFilter, filter: ssidFilter } as AnalyticsFilter

  return (
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ height: '152px' }}>
        <HistoricalCard title={$t({ defaultMessage: 'Network Overview' })}>
          <GridRow style={{ flexGrow: '1', marginTop: '8px' }}>
            <GridCol col={{ span: 6 }} style={{ margin: 'auto', alignItems: 'center' }}>
              <IncidentBySeverityDonutChart type='no-card-style' filters={filters}/>
            </GridCol>
            <GridCol col={{ span: 6 }} style={{ margin: 'auto' }}>
              <KpiWidget type='no-chart-style' filters={filters} name='connectionSuccess' />
            </GridCol>
            <GridCol col={{ span: 6 }} style={{ margin: 'auto' }}>
              <TtcTimeWidget filters={filters}/>
            </GridCol>
            <GridCol col={{ span: 6 }} style={{ margin: 'auto' }}>
              <KpiWidget
                type='no-chart-style'
                filters={filters}
                name='clientThroughput'
                threshold={kpiConfig.clientThroughput.histogram.initialThreshold}
              />
            </GridCol>
          </GridRow>
        </HistoricalCard>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TrafficByVolume filters={filters} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <NetworkHistory filters={filters} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <ConnectedClientsOverTime filters={filters} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopApplicationsByTraffic filters={filters} tabId={'network-report-ap-top-traffic'} />
      </GridCol>
    </GridRow>
  )
}
