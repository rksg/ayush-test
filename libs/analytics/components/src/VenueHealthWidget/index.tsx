import { useIntl } from 'react-intl'

import { healthApi }                               from '@acx-ui/analytics/services'
import { AnalyticsFilter, kpiConfig }              from '@acx-ui/analytics/utils'
import { Card, GridRow, GridCol, Loader, Tooltip } from '@acx-ui/components'

import { KpiWidget } from '../KpiWidget'

import * as UI from './styledComponents'

export { VenueHealthWidget as VenueHealth }

function VenueHealthWidget ({
  filters
}: {
  filters: AnalyticsFilter;
}){
  const { $t } = useIntl()
  const venueFilter = filters.filter?.networkNodes?.at(0)?.at(0)
  const queryResults= healthApi.useGetKpiThresholdsQuery({ ...filters,
    path: venueFilter ? [...filters.path, venueFilter] : filters.path,
    kpis: ['timeToConnect','clientThroughput'] })
  const { data } = queryResults

  return(
    <Loader states={[queryResults]}>
      <Card>
        <GridRow style={{ flexGrow: '1' }}>
          <GridCol col={{ span: 3 }}>
            <UI.Wrapper>
              <Card.Title>
                {$t({ defaultMessage: 'Client Experience' })}
                <Tooltip
                  title={$t({ defaultMessage:
                    'Historical data is slightly delayed, and not real-time' })}>
                  <UI.HistoricalIcon />
                </Tooltip>
              </Card.Title>
            </UI.Wrapper>
          </GridCol>
          <GridCol col={{ span: 7 }}>
            <UI.Wrapper>
              <KpiWidget filters={filters} name='connectionSuccess'/>
            </UI.Wrapper>
          </GridCol>
          <GridCol col={{ span: 7 }}>
            <UI.Wrapper>
              <KpiWidget filters={filters}
                name='timeToConnect'
                threshold={data?.timeToConnectThreshold?.value ??
                  kpiConfig.timeToConnect.histogram.initialThreshold}/>
            </UI.Wrapper>
          </GridCol>
          <GridCol col={{ span: 7 }}>
            <UI.Wrapper>
              <KpiWidget filters={filters}
                name='clientThroughput'
                threshold={data?.clientThroughputThreshold?.value ??
                  kpiConfig.clientThroughput.histogram.initialThreshold}/>
            </UI.Wrapper>
          </GridCol>
        </GridRow>
      </Card>
    </Loader>)
}
