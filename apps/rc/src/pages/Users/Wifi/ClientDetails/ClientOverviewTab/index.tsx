/* eslint-disable max-len */
import { useEffect, useState, useMemo } from 'react'


import { TrafficByBand, TrafficByUsage }       from '@acx-ui/analytics/components'
import { GridCol, GridRow }                    from '@acx-ui/components'
import {
  useLazyGetApQuery,
  useLazyGetApCapabilitiesQuery,
  useLazyGetClientDetailsQuery,
  useLazyGetHistoricalClientListQuery,
  useLazyGetHistoricalStatisticsReportsQuery
} from '@acx-ui/rc/services'
import {
  Client,
  ClientStatistic,
  ClientStatusEnum
} from '@acx-ui/rc/utils'
import {
  useParams,
  useSearchParams
} from '@acx-ui/react-router-dom'
import { useDateFilter } from '@acx-ui/utils'

import { ClientOverviewWidget } from './ClientOverviewWidget'
import { ClientProperties }     from './ClientProperties'
import * as UI                  from './styledComponents'
import { TopApplications }      from './TopApplications'

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
  const [getHistoricalStatisticsReports] = useLazyGetHistoricalStatisticsReportsQuery()
  const [getAp] = useLazyGetApQuery()
  const [getApCapabilities] = useLazyGetApCapabilitiesQuery()

  const [clientStatus, setClientStatus]
    = useState(searchParams.get('clientStatus') || ClientStatusEnum.CONNECTED)
  const [clientDetails, setClientDetails] = useState({} as Client)
  const [clientStatistics, setClientStatistics] = useState({} as ClientStatistic)
  const [isTribandAp, setIsTribandAp] = useState(false)

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

  useEffect(() => {
    const serialNumber = clientDetails?.apSerialNumber || clientDetails?.serialNumber
    const isApNotExists = clientDetails.isApExists === false
    if (serialNumber && !isApNotExists) {
      const checkTribandAp = async () => {
        await Promise.all([
          getAp({ params: { tenantId, serialNumber } }, true),
          getApCapabilities({ params: { tenantId, serialNumber } }, true)
        ]).then(([ apDetails, capabilities ]) => {
          const apCapabilities = capabilities?.data?.apModels?.find(cap => cap.model === apDetails?.data?.model)
          setIsTribandAp(apCapabilities?.supportTriRadio ?? false)
        }).catch((error) => {
          console.log(error) // eslint-disable-line no-console
        })
      }
      checkTribandAp()
    }
  }, [clientDetails])

  useEffect(() => {
    const getClientData = async () => {
      try {
        const clientStatistics = await getHistoricalStatisticsReports({
          params: { tenantId },
          payload: {
            filters: {
              clientMAC: [clientId],
              dateFilter,
              isTribandAp: isTribandAp
            }
          }
        }, true)?.unwrap()
        setClientStatistics(clientStatistics as ClientStatistic)
      } catch (error) {
        console.log(error) // eslint-disable-line no-console
      }
    }
    getClientData()
  }, [filters, isTribandAp])

  return <GridRow>
    <GridCol col={{ span: 18 }}>
      <GridRow>
        <GridCol col={{ span: 24 }}>
          <UI.CardWrapper>
            <ClientOverviewWidget
              clientStatistic={clientStatistics}
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
