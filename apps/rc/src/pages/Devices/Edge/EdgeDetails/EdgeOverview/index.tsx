import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'
import styled        from 'styled-components/macro'

import { GridCol, GridRow, Tabs }  from '@acx-ui/components'
import { EdgeInfoWidget }          from '@acx-ui/rc/components'
import {
  useEdgeBySerialNumberQuery,
  useGetDnsServersQuery,
  useGetEdgePortsStatusListQuery
} from '@acx-ui/rc/services'
import {  EdgePortStatus } from '@acx-ui/rc/utils'

import { MonitorTab }   from './MonitorTab'
import { PortsTab }     from './PortsTab'
import { wrapperStyle } from './styledComponents'

enum OverviewInfoType {
    MONITOR = 'monitor',
    PORTS = 'ports',
    SUB_INTERFACES = 'subInterfaces'
}
export const EdgeOverview = styled(({ className }:{ className?: string }) => {
  const { $t } = useIntl()
  const { serialNumber, activeSubTab } = useParams()

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
    filters: { serialNumber: [serialNumber] } }

  const {
    data: currentEdge,
    isLoading: isLoadingEdgeStatus
  } = useEdgeBySerialNumberQuery({
    params: { serialNumber },
    payload: edgeStatusPayload
  })

  const { data: dnsServers } = useGetDnsServersQuery({ params: { serialNumber } })

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
    filters: { serialNumber: [serialNumber] },
    sortField: 'sort_idx',
    sortOrder: 'ASC'
  }

  const {
    data: portStatusList,
    isLoading: isPortListLoading
  } = useGetEdgePortsStatusListQuery({
    params: { serialNumber },
    payload: edgePortStatusPayload
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
      <GridCol col={{ span: 24 }}>
        <Tabs
          type='card'
          defaultActiveKey={activeSubTab || OverviewInfoType.MONITOR}
        >
          <Tabs.TabPane
            tab={$t({ defaultMessage: 'Monitor' })}
            key={OverviewInfoType.MONITOR}
          >
            <MonitorTab/>
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={$t({ defaultMessage: 'Ports' })}
            key={OverviewInfoType.PORTS}
          >
            <PortsTab data={portStatusList as EdgePortStatus[]}/>
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={$t({ defaultMessage: 'Sub-Interfaces' })}
            key={OverviewInfoType.SUB_INTERFACES}
          >
          Sub-Interfaces
          </Tabs.TabPane>
        </Tabs>
      </GridCol>
    </GridRow>
  )
})`${wrapperStyle}`