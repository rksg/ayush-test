import { useMemo } from 'react'


import { TrafficByBand, TrafficByUsage } from '@acx-ui/analytics/components'
import { GridCol, GridRow }              from '@acx-ui/components'
import {
  useGetClientOrHistoryDetailQuery
} from '@acx-ui/rc/services'
import {
  Client,
  ClientStatusEnum
} from '@acx-ui/rc/utils'
import {
  useParams,
  useSearchParams
} from '@acx-ui/react-router-dom'
import { useDateFilter } from '@acx-ui/utils'

import { ClientOverviewWidget }     from './ClientOverviewWidget'
import { ClientProperties }         from './ClientProperties'
import { useClientStatisticsQuery } from './service'
import * as UI                      from './styledComponents'
import { TopApplications }          from './TopApplications'

export function ClientOverviewTab () {
  const { dateFilter } = useDateFilter()
  const filters = useMemo(() => ({
    filter: {},
    ...dateFilter
  }), [dateFilter])
  const { tenantId, clientId } = useParams()
  const [searchParams] = useSearchParams()

  const clientStats = useClientStatisticsQuery({ ...filters, clientMac: clientId!.toUpperCase() })
  const clientResult = useGetClientOrHistoryDetailQuery({
    params: {
      tenantId,
      clientId,
      status: searchParams.get('clientStatus') || ClientStatusEnum.CONNECTED
    } })
  const clientDetails = clientResult?.data?.data || {} as Client
  const clientStatus = (clientResult?.data?.isHistorical && ClientStatusEnum.HISTORICAL)
  || searchParams.get('clientStatus') || ClientStatusEnum.CONNECTED

  return <GridRow>
    <GridCol col={{ span: 18 }}>
      <GridRow>
        <GridCol col={{ span: 24 }}>
          <UI.CardWrapper>
            <ClientOverviewWidget
              clientStatistic={clientStats.data}
              clientStatus={clientStatus}
              clientDetails={clientDetails}
              filters={filters}
            />
          </UI.CardWrapper>
        </GridCol>
        <GridCol col={{ span: 8 }} style={{ height: '292px' }}>
          <TopApplications filters={{ ...filters, mac: clientId?.toUpperCase() }} type='donut' />
        </GridCol>
        <GridCol col={{ span: 16 }} style={{ height: '292px' }}>
          <TopApplications filters={{ ...filters, mac: clientId?.toUpperCase() }} type='line' />
        </GridCol>
        <GridCol col={{ span: 24 }} style={{ height: '292px' }}>
          <TrafficByUsage filters={{ ...filters, mac: clientId?.toUpperCase() }} />
        </GridCol>
        <GridCol col={{ span: 24 }} style={{ height: '292px' }}>
          <TrafficByBand filters={{ ...filters, mac: clientId?.toUpperCase() }} />
        </GridCol>
      </GridRow>
    </GridCol>
    <GridCol col={{ span: 6 }}>
      <ClientProperties
        clientStatus={clientStatus}
        clientDetails={clientDetails}
      />
    </GridCol>
  </GridRow>
}
