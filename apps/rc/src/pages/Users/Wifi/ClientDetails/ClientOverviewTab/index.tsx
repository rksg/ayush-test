import { useMemo } from 'react'


import { TrafficByBand, TrafficByUsage }             from '@acx-ui/analytics/components'
import { getDefaultEarliestStart, GridCol, GridRow } from '@acx-ui/components'
import { Features, useIsSplitOn }                    from '@acx-ui/feature-toggle'
import {
  useGetClientsQuery,
  useGetHistoryClientDetailQuery
} from '@acx-ui/rc/services'
import {
  Client,
  ClientInfo,
  ClientStatusEnum
} from '@acx-ui/rc/utils'
import {
  useParams
} from '@acx-ui/react-router-dom'
import { getUserProfile, isCoreTier } from '@acx-ui/user'
import { useDateFilter }              from '@acx-ui/utils'

import { ClientOverviewWidget }     from './ClientOverviewWidget'
import { ClientProperties }         from './ClientProperties'
import { RbacClientProperties }     from './RbacClientProperties'
import { useClientStatisticsQuery } from './service'
import * as UI                      from './styledComponents'
import { TopApplications }          from './TopApplications'

export function ClientOverviewTab () {
  const showResetMsg = useIsSplitOn(Features.ACX_UI_DATE_RANGE_RESET_MSG)
  const { dateFilter } = useDateFilter({ showResetMsg,
    earliestStart: getDefaultEarliestStart() })
  const filters = useMemo(() => ({
    filter: {},
    ...dateFilter
  }), [dateFilter])

  const { clientId } = useParams()
  const clientMac = clientId?.toUpperCase()

  const { accountTier } = getUserProfile()
  const isCore = isCoreTier(accountTier)
  const clientStats = useClientStatisticsQuery({ ...filters, clientMac: clientId!.toUpperCase() })

  // connect client
  const clientInfo = useGetClientsQuery({
    payload: {
      filters: {
        macAddress: [clientId]
      }
    } })
  const connectClientInfo = clientInfo?.data?.data[0] ?? {} as ClientInfo
  const clientStatus = clientInfo?.data ? ClientStatusEnum.CONNECTED : ClientStatusEnum.HISTORICAL

  // historical client
  const clientResult = useGetHistoryClientDetailQuery({
    params: { clientId }
  }, { skip: clientStatus !== ClientStatusEnum.HISTORICAL })
  const historicalClientDetails = clientResult?.data?.data || {} as Client


  return <GridRow>
    <GridCol col={{ span: 18 }}>
      <GridRow>
        <GridCol col={{ span: 24 }}>
          <UI.CardWrapper>
            <ClientOverviewWidget
              clientStatistic={clientStats.data}
              clientStatus={clientStatus}
              filters={filters}
              connectedTimeStamp={
                connectClientInfo?.connectedTime ?? (new Date()).toISOString()
              }
            />
          </UI.CardWrapper>
        </GridCol>
        {!isCore && <>
          <GridCol col={{ span: 8 }} style={{ height: '292px' }}>
            <TopApplications filters={{ ...filters, mac: clientMac }} type='donut' />
          </GridCol>
          <GridCol col={{ span: 16 }} style={{ height: '292px' }}>
            <TopApplications filters={{ ...filters, mac: clientMac }} type='line' />
          </GridCol>
        </>}
        <GridCol col={{ span: 24 }} style={{ height: '292px' }}>
          <TrafficByUsage filters={{ ...filters, mac: clientMac }} />
        </GridCol>
        <GridCol col={{ span: 24 }} style={{ height: '292px' }}>
          <TrafficByBand filters={{ ...filters, mac: clientMac }} />
        </GridCol>
      </GridRow>
    </GridCol>
    <GridCol col={{ span: 6 }}>
      {(clientStatus === ClientStatusEnum.CONNECTED)
        ? <RbacClientProperties clientDetails={connectClientInfo} />
        : <ClientProperties clientDetails={historicalClientDetails} />
      }
    </GridCol>
  </GridRow>
}
