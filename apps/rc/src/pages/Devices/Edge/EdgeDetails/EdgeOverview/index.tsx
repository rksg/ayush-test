import { useParams } from 'react-router-dom'
import styled        from 'styled-components/macro'


import { GridCol, GridRow } from '@acx-ui/components'
import {
  EdgeInfoWidget,
  EdgePortsByTrafficWidget,
  EdgeResourceUtilizationWidget,
  EdgeTrafficByVolumeWidget,
  EdgeUpTimeWidget
} from '@acx-ui/rc/components'
import {
  useAlarmsListQuery,
  useEdgeBySerialNumberQuery, useGetDnsServersQuery, useGetEdgePortsStatusListQuery
} from '@acx-ui/rc/services'
import { CommonUrlsInfo, useTableQuery } from '@acx-ui/rc/utils'

import { wrapperStyle } from './styledComponents'

export const EdgeOverview = styled(({ className }:{ className?: string }) => {
  const params = useParams()
  const edgeStatusPayload = {
    fields: [
      'name',
      'venueName',
      'type',
      'serialNumber',
      'ports',
      'ip',
      'model',
      'firmwareVersion',
      'deviceStatus',
      'deviceSeverity',
      'venueId',
      'tags',
      'cpuCores',
      'cpuUsedPercentage',
      'memoryUsedKb',
      'memoryTotalKb',
      'diskUsedKb',
      'diskTotalKb'
    ],
    filters: { serialNumber: [params.serialNumber] } }

  const { data: currentEdge, isLoading: isLoadingEdgeStatus } = useEdgeBySerialNumberQuery({
    params, payload: edgeStatusPayload
  })

  const { data: dnsServers } = useGetDnsServersQuery({ params })

  const edgePortStatusPayload = {
    fields: [
      'port_id',
      'name',
      'type',
      'serial_number',
      'ip',
      'status',
      'admin_status',
      'speed_kbps',
      'mac',
      'duplex',
      'sort_idx'
    ],
    filters: { serialNumber: [params.serialNumber] },
    sortField: 'sort_idx',
    sortOrder: 'ASC'
  }

  const { data: portStatusList, isLoading: isPortListLoading } = useGetEdgePortsStatusListQuery({
    params, payload: edgePortStatusPayload
  })

  const alarmListPayload = {
    url: CommonUrlsInfo.getAlarmsList.url,
    fields: [
      'startTime',
      'severity',
      'message',
      'entity_id',
      'id',
      'serialNumber',
      'entityType',
      'entityId',
      'entity_type',
      'venueName'
    ]
  }

  const { data: alarmList, isLoading: isAlarmListLoading } = useTableQuery({
    useQuery: useAlarmsListQuery,
    defaultPayload: {
      ...alarmListPayload,
      filters: {
        serialNumber: [params.serialNumber]
      }
    },
    sorter: {
      sortField: 'startTime',
      sortOrder: 'DESC'
    },
    pagination: {
      pageSize: 10000,
      page: 1,
      total: 0
    }
  })

  return (
    <GridRow className={className}>
      <GridCol col={{ span: 24 }}>
        <EdgeInfoWidget
          currentEdge={currentEdge}
          edgePortsSetting={portStatusList}
          dnsServers={dnsServers}
          isEdgeStatusLoading={isLoadingEdgeStatus}
          isPortListLoading={isPortListLoading}
          isAlarmListLoading={isAlarmListLoading}
          alarmList={alarmList?.data || []}
        />
      </GridCol>
      <GridCol col={{ span: 24 }} className='statistic upTimeWidget'>
        <EdgeUpTimeWidget />
      </GridCol>
      <GridCol col={{ span: 12 }} className='statistic'>
        <EdgeTrafficByVolumeWidget />
      </GridCol>
      <GridCol col={{ span: 12 }} className='statistic'>
        <EdgeResourceUtilizationWidget />
      </GridCol>
      <GridCol col={{ span: 12 }} className='statistic'>
        <EdgePortsByTrafficWidget />
      </GridCol>
    </GridRow>
  )
})`${wrapperStyle}`