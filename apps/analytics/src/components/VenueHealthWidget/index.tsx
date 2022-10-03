import { useIntl } from 'react-intl'

import { AnalyticsFilter }                from '@acx-ui/analytics/utils'
import { Card, GridRow, GridCol, Loader } from '@acx-ui/components'

import { KpiWidget } from '../KpiWidget'

import { useFetchKpiThresholdsQuery } from './services'
import * as UI                        from './styledComponents'


export default function VenueHealthWidget ({
  filters
}: {
  filters: AnalyticsFilter;
}){
  const { $t } = useIntl()
  const queryResults= useFetchKpiThresholdsQuery(filters)
  const { data } = queryResults

  return(
    <Loader states={[queryResults]}>
      <Card>
        <GridRow style={{ width: '100%' }}>
          <GridCol col={{ span: 3 }}>
            <UI.Title>
              {$t({ defaultMessage: 'Client Experience' })}
            </UI.Title>
          </GridCol>
          <GridCol col={{ span: 7 }}>
            <KpiWidget filters={filters} name='connectionSuccess'/>
          </GridCol>
          <GridCol col={{ span: 7 }}>
            <KpiWidget filters={filters}
              name='timeToConnect'
              threshold={data?.timeToConnectThreshold.value}/>
          </GridCol>
          <GridCol col={{ span: 7 }}>
            <KpiWidget filters={filters}
              name='clientThroughput'
              threshold={data?.clientThroughputThreshold.value}/>
          </GridCol>
        </GridRow>
      </Card>
    </Loader>)
}