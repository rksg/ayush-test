import { useMemo } from 'react'


import { TrafficByBand, TrafficByUsage }             from '@acx-ui/analytics/components'
import { getDefaultEarliestStart, GridCol, GridRow } from '@acx-ui/components'
import { Features, useIsSplitOn }                    from '@acx-ui/feature-toggle'
import {
  useGetClientOrHistoryDetailQuery,
  useGetClientsQuery
} from '@acx-ui/rc/services'
import {
  Client,
  ClientInfo,
  ClientStatusEnum
} from '@acx-ui/rc/utils'
import {
  useParams,
  useSearchParams
} from '@acx-ui/react-router-dom'
import { useDateFilter } from '@acx-ui/utils'

import { ClientOverviewWidget }     from './ClientOverviewWidget'
import { ClientProperties }         from './ClientProperties'
import { RbacClientProperties }     from './RbacClientProperties'
import { useClientStatisticsQuery } from './service'
import * as UI                      from './styledComponents'
import { TopApplications }          from './TopApplications'

export function ClientOverviewTab () {
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const showResetMsg = useIsSplitOn(Features.ACX_UI_DATE_RANGE_RESET_MSG)
  const { dateFilter } = useDateFilter({ showResetMsg,
    earliestStart: getDefaultEarliestStart() })
  const filters = useMemo(() => ({
    filter: {},
    ...dateFilter
  }), [dateFilter])
  const { tenantId, clientId } = useParams()
  const [searchParams] = useSearchParams()
  const clientStatus = searchParams.get('clientStatus') || ClientStatusEnum.CONNECTED
  const clientStats = useClientStatisticsQuery({ ...filters, clientMac: clientId!.toUpperCase() })
  const clientInfo = useGetClientsQuery({ payload: {
    filters: {
      macAddress: [clientId]
    }
  } }, { skip: !isWifiRbacEnabled || clientStatus !== ClientStatusEnum.CONNECTED })
  const clientResult = useGetClientOrHistoryDetailQuery({
    params: {
      tenantId,
      clientId,
      status: clientStatus
    } }, { skip: isWifiRbacEnabled && clientStatus === ClientStatusEnum.CONNECTED })
  const clientDetails = clientResult?.data?.data || {} as Client


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
              connectedTimeStamp={
                clientInfo.data?.data[0].connectedTime ?? (new Date()).toISOString()
              }
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
      {
        (isWifiRbacEnabled && clientStatus === ClientStatusEnum.CONNECTED) ?
          <RbacClientProperties
            clientStatus={clientStatus}
            clientInfo={clientInfo.data?.data[0] ?? {} as ClientInfo}
          />
          :
          <ClientProperties
            clientStatus={clientStatus}
            clientDetails={clientDetails}
          />
      }

    </GridCol>
  </GridRow>
}
