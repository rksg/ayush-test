/* eslint-disable max-len */
import { useEffect, useState, useMemo } from 'react'


import { TrafficByBand, TrafficByUsage } from '@acx-ui/analytics/components'
import { GridCol, GridRow }              from '@acx-ui/components'
import {
  useLazyGetClientDetailsQuery,
  useLazyGetHistoricalClientListQuery
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

const clientPayload = {
  searchString: '',
  searchTargetFields: [
    'clientMac', 'ipAddress', 'Username', 'hostname', 'ssid', 'clientVlan', 'osType'],
  fields: [
    'hostname', 'osType', 'healthCheckStatus', 'clientMac', 'ipAddress', 'Username',
    'serialNumber', 'venueId', 'switchSerialNumber', 'ssid', 'wifiCallingClient',
    'sessStartTime', 'clientAnalytics', 'clientVlan', 'deviceTypeStr', 'modelName',
    'totalTraffic', 'trafficToClient', 'trafficFromClient', 'receiveSignalStrength', 'rssi',
    'radio.mode', 'cpeMac', 'authmethod', 'status', 'encryptMethod', 'packetsToClient',
    'packetsFromClient', 'packetsDropFrom', 'radio.channel',
    'cog', 'venueName', 'apName', 'clientVlan', 'networkId', 'switchName', 'healthStatusReason', 'lastUpdateTime']
}

const historicalPayload = {
  fields: ['clientMac', 'clientIP', 'userId', 'username', 'userName', 'hostname', 'venueId',
    'serialNumber', 'networkId', 'disconnectTime', 'ssid', 'osType',
    'sessionDuration', 'venueName', 'apName', 'bssid'],
  sortField: 'event_datetime',
  searchTargetFields: ['clientMac'],
  page: 1,
  pageSize: 1
}

export function ClientOverviewTab () {
  const { dateFilter } = useDateFilter()
  const filters = useMemo(() => ({
    filter: {},
    ...dateFilter
  }), [dateFilter])
  const { tenantId, clientId } = useParams()
  const [searchParams] = useSearchParams()

  const [getClientDetails] = useLazyGetClientDetailsQuery()
  const [getHistoricalClientList] = useLazyGetHistoricalClientListQuery()

  const [clientStatus, setClientStatus]
    = useState(searchParams.get('clientStatus') || ClientStatusEnum.CONNECTED)
  const [clientDetails, setClientDetails] = useState({} as Client)
  const clientStats = useClientStatisticsQuery({ ...filters, clientMac: clientId!.toUpperCase() })

  useEffect(() => {
    const getClientData = async () => {
      try {
        const clientData = await getClientDetails({
          params: { tenantId, clientId },
          payload: clientPayload
        }, true)?.unwrap()
        setClientDetails(clientData as Client)
      } catch {
        setClientStatus(ClientStatusEnum.HISTORICAL)
        await getHistoricalClientData()
      }
    }

    const getHistoricalClientData = async () => {
      try {
        const historicalisData = await getHistoricalClientList({
          params: { tenantId },
          payload: { ...historicalPayload, searchString: clientId }
        }, true)?.unwrap()
        setClientDetails((historicalisData?.data?.[0] ?? {}) as Client)
      } catch {
        setClientDetails({} as Client)
      }
    }

    clientStatus === ClientStatusEnum.CONNECTED
      ? getClientData()
      : getHistoricalClientData()
  }, [clientId])

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
