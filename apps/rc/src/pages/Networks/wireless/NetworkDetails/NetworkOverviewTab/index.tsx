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
  AnalyticsFilter,
  defaultNetworkPath,
  kpiConfig
} from '@acx-ui/analytics/utils'
import {
  GridRow,
  GridCol,
  Loader,
  Card
} from '@acx-ui/components'
import { NetworkTypeEnum } from '@acx-ui/rc/utils'
import { useDateFilter }   from '@acx-ui/utils'

import { networkTypes }                     from '../../NetworkForm/contentsMap'
import { extractSSIDFilter, useGetNetwork } from '../services'

export function NetworkOverviewTab () {
  const { $t } = useIntl()
  const { dateFilter } = useDateFilter()
  const network = useGetNetwork()
  const ssids = extractSSIDFilter(network)
  const filters = {
    ...dateFilter,
    path: defaultNetworkPath,
    filter: { ssids }
  } as AnalyticsFilter
  const title = network.data?.type
    ? $t(networkTypes[network.data?.type as NetworkTypeEnum])
    : ''
  return (<Loader states={[network]}>
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ height: '142px' }}>
        <Card>
          <Card.Title>{title}</Card.Title>
          <GridRow style={{ flexGrow: '1' }}>
            <GridCol col={{ span: 2 }} />
            <GridCol col={{ span: 4 }} style={{ margin: 'auto' }}>
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
        </Card>
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
