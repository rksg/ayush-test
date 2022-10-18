import { useIntl } from 'react-intl'

import { AnalyticsFilter }                from '@acx-ui/analytics/utils'
import { Card, GridRow, GridCol, Loader } from '@acx-ui/components'

import { useFetchKpiThresholdsQuery } from '../../pages/Health/Kpi/services'
import { KpiWidget }                  from '../KpiWidget'

import * as UI from './styledComponents'

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
                threshold={data?.timeToConnectThreshold.value}/>
            </UI.Wrapper>
          </GridCol>
          <GridCol col={{ span: 7 }}>
            <UI.Wrapper>
              <KpiWidget filters={filters}
                name='clientThroughput'
                threshold={data?.clientThroughputThreshold.value}/>
            </UI.Wrapper>
          </GridCol>
        </GridRow>
      </Card>
    </Loader>)
}
