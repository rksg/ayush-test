import { useIntl } from 'react-intl'

import { healthApi }                      from '@acx-ui/analytics/services'
import { AnalyticsFilter, kpiConfig }     from '@acx-ui/analytics/utils'
import { Card, GridRow, GridCol, Loader } from '@acx-ui/components'

import { KpiWidget } from '../KpiWidget'

import * as UI from './styledComponents'

export { VenueHealthWidget as VenueHealth }

function VenueHealthWidget ({
  filters
}: {
  filters: AnalyticsFilter;
}){
  const { $t } = useIntl()
  const queryResults= healthApi.useGetKpiThresholdsQuery({ ...filters,
    kpis: ['timeToConnect','clientThroughput'] })
  const { data } = queryResults

  return(
    <Loader states={[queryResults]}>
      <Card>
        <GridRow style={{ width: '100%' }}>
          <GridCol col={{ span: 3 }}>
            <UI.Wrapper>
              <UI.Title>
                {$t({ defaultMessage: 'Client Experience' })}
              </UI.Title>
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
