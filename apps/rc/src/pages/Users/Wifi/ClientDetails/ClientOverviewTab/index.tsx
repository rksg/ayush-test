import React, { useEffect, useState } from 'react'

import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import {
  useAnalyticsFilter
} from '@acx-ui/analytics/utils'
import {
  useGetHistoricalStatisticsReportsQuery,
  useLazyGetApCapabilitiesQuery,
  useLazyGetApQuery,
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

import { ClientOverviewWidget } from './ClientOverviewWidget'
import * as UI                  from './styledComponents'

const clientPayload = {
  searchString: '',
  searchTargetFields: [
    'clientMac', 'ipAddress', 'Username', 'hostname', 'ssid', 'clientVlan', 'osType'],
  fields: [
    'hostname', 'osType', 'healthCheckStatus', 'clientMac', 'ipAddress', 'Username',
    'serialNumber', 'venueId', 'switchSerialNumber', 'ssid', 'wifiCallingClient',
    'sessStartTime', 'clientAnalytics', 'clientVlan', 'deviceTypeStr', 'modelName', 'totalTraffic',
    'trafficToClient', 'trafficFromClient', 'receiveSignalStrength', 'rssi',
    'radio.mode', 'cpeMac', 'authmethod', 'status', 'encryptMethod', 'packetsToClient',
    'packetsFromClient', 'packetsDropFrom', 'radio.channel', 'noiseFloor', 'cog', 'venueName',
    'apName', 'clientVlan', 'networkId', 'switchName', 'healthStatusReason', 'lastUpdateTime']
}

const historicalPayload = {
  fields: ['clientMac', 'clientIP', 'userId', 'hostname', 'venueId',
    'serialNumber', 'networkId', 'disconnectTime', 'ssid', 'osType',
    'sessionDuration', 'venueName', 'apName', 'bssid'],
  sortField: 'event_datetime',
  searchTargetFields: ['clientMac']
}

export function ClientOverviewTab () {
  const { $t } = useIntl()
  const { filters } = useAnalyticsFilter()
  const { tenantId, clientId } = useParams()
  const [searchParams] = useSearchParams()

  const [getClientDetails] = useLazyGetClientDetailsQuery()
  const [getHistoricalClientList] = useLazyGetHistoricalClientListQuery()
  const [getAp] = useLazyGetApQuery()
  const [getApCapabilities] = useLazyGetApCapabilitiesQuery()

  const [clientStatus, setClientStatus]
    = useState(searchParams.get('clientStatus') || ClientStatusEnum.CONNECTED)
  const [clientDetails, setClientDetails] = useState({} as Client)
  const [isTribandAp, setIsTribandAp] = useState(false)

  const { data: statisticsReports } = useGetHistoricalStatisticsReportsQuery({
    params: { tenantId },
    payload: {
      filters: {
        clientMAC: [clientId],
        fromTime: filters.startDate,
        toTime: filters.endDate,
        isTribandAp: isTribandAp
      }
    }
  })

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
        getHistoricalClientData()
      }
    }

    const getHistoricalClientData = async () => {
      const historicalisData = await getHistoricalClientList({
        params: { tenantId },
        payload: { ...historicalPayload, searchString: clientId }
      }, true)?.unwrap()
      setClientDetails((historicalisData?.data?.[0] ?? {}) as Client)
    }

    clientStatus === ClientStatusEnum.CONNECTED
      ? getClientData()
      : getHistoricalClientData()
  }, [])

  useEffect(() => {
    if (clientDetails?.apSerialNumber) {
      const checkTribandAp = async () => {
        const apDetails = await getAp({
          params: { tenantId, serialNumber: clientDetails?.apSerialNumber }
        }, true)?.unwrap()

        const capabilities = await getApCapabilities({
          params: { tenantId, serialNumber: clientDetails?.apSerialNumber }
        }, true)?.unwrap()

        const apCapabilities = capabilities.apModels.find(cap => cap.model === apDetails?.model)
        setIsTribandAp(apCapabilities?.supportTriRadio ?? false)
      }

      checkTribandAp()
    }
  }, [clientDetails])

  return <Row gutter={24}>
    <Col span={18}>
      <UI.CardWrapper>
        <ClientOverviewWidget
          clientStatistic={statisticsReports}
          clientStatus={clientStatus}
          clientDetails={clientDetails}
        />
      </UI.CardWrapper>
    </Col>
    <Col span={6}>
      {$t({ defaultMessage: 'ClientProperties' })}
    </Col>
  </Row>
}