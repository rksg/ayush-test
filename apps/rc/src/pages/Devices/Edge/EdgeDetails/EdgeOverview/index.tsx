import { useParams } from 'react-router-dom'
import styled        from 'styled-components/macro'

import { GridCol, GridRow }   from '@acx-ui/components'
import {
  EdgeInfoWidget,
  EdgePortsByTrafficWidget,
  EdgeResourceUtilizationWidget,
  EdgeTrafficByVolumeWidget
} from '@acx-ui/rc/components'
import {
  useEdgeBySerialNumberQuery, useGetDnsServersQuery, useGetEdgePortsStatusListQuery
} from '@acx-ui/rc/services'
import { EdgePortStatus } from '@acx-ui/rc/utils'

import { EdgeUpTimeWidget } from './EdgeUpTimeWidget'

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
      'tags'
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

  return (
    <GridRow className={className}>
      <GridCol col={{ span: 24 }}>
        <EdgeInfoWidget
          currentEdge={currentEdge}
          edgePortsSetting={portStatusList}
          dnsServers={dnsServers}
          isEdgeStatusLoading={isLoadingEdgeStatus}
          isPortListLoading={isPortListLoading}
        />
      </GridCol>

      {/* TODO: wait for API*/}
      <GridCol col={{ span: 24 }} className='statistic upTimeWidget'>
        <EdgeUpTimeWidget />
      </GridCol>

      {/* TODO: wait for API*/}
      <GridCol col={{ span: 12 }} className='statistic'>
        <EdgeTrafficByVolumeWidget />
      </GridCol>
      {/* TODO: wait for API*/}
      <GridCol col={{ span: 12 }} className='statistic'>
        <EdgeResourceUtilizationWidget />
      </GridCol>
      {/* TODO: wait for API*/}
      <GridCol col={{ span: 12 }} className='statistic'>
        <EdgePortsByTrafficWidget
          edgePortsSetting={portStatusList as EdgePortStatus[]}
          isLoading={isPortListLoading}
        />
      </GridCol>
    </GridRow>

  )
})`
div.statistic {
    height: 280px;

    &.upTimeWidget {
      height: 100px;
    }
}
`