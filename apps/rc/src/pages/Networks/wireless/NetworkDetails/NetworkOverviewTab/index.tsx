import { useIntl } from 'react-intl'

import {
  IncidentBySeverityDonutChart,
  KpiWidget,
  TtcTimeWidget,
  ConnectedClientsOverTime,
  NetworkHistory,
  TopApplicationsByTraffic,
  TrafficByVolume
} from '@acx-ui/analytics/components'
import {
  kpiConfig
} from '@acx-ui/analytics/utils'
import {
  GridRow,
  GridCol,
  Loader,
  HistoricalCard
} from '@acx-ui/components'
import { NetworkTypeEnum }                    from '@acx-ui/rc/utils'
import { useDateFilter, generateVenueFilter } from '@acx-ui/utils'
import type { AnalyticsFilter }               from '@acx-ui/utils'

import { networkTypes }                     from '../../NetworkForm/contentsMap'
import { extractSSIDFilter, useGetNetwork } from '../services'

export function NetworkOverviewTab ({ selectedVenues }: { selectedVenues?: string[] }) {
  const { $t } = useIntl()
  const { dateFilter } = useDateFilter()
  const network = useGetNetwork()
  let filter = { ssids: extractSSIDFilter(network) }
  if (selectedVenues?.length) {
    filter = { ...filter, ...generateVenueFilter(selectedVenues) }
  }
  const filters = { ...dateFilter, filter } as AnalyticsFilter
  const title = network.data?.type
    ? $t(networkTypes[network.data?.type as NetworkTypeEnum])
    : ''
  return (<Loader states={[network]}>
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ height: '152px' }}>
        <HistoricalCard title={title}>
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
        <TopApplicationsByTraffic filters={filters} />
      </GridCol>
    </GridRow>
  </Loader>)
}
