import { useEffect, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'
import styled        from 'styled-components/macro'

import { GridCol, GridRow, Tabs }  from '@acx-ui/components'
import { EdgeInfoWidget }          from '@acx-ui/rc/components'
import {
  useEdgeBySerialNumberQuery,
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
  const [currentTab, setCurrentTab] = useState<string | undefined>(undefined)

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

  const handleTabChange = (val: string) => {
    setCurrentTab(val)
  }

  const handleClickWidget = (type: string) => {
    if (type === 'port')
      handleTabChange(OverviewInfoType.PORTS)
  }

  useEffect(() => {
    if (activeSubTab && Object.values(OverviewInfoType).includes(activeSubTab as OverviewInfoType))
      setCurrentTab(activeSubTab)
  }, [activeSubTab])

  return (
    <GridRow className={className}>
      <GridCol col={{ span: 24 }}>
        <EdgeInfoWidget
          currentEdge={currentEdge}
          edgePortsSetting={portStatusList}
          isEdgeStatusLoading={isLoadingEdgeStatus}
          isPortListLoading={isPortListLoading}
          onClickWidget={handleClickWidget}
        />
      </GridCol>
      <GridCol col={{ span: 24 }}>
        <Tabs
          type='card'
          activeKey={currentTab}
          defaultActiveKey={activeSubTab || OverviewInfoType.MONITOR}
          onChange={handleTabChange}
        >
          <Tabs.TabPane
            tab={$t({ defaultMessage: 'Monitor' })}
            key={OverviewInfoType.MONITOR}
          >
            <MonitorTab />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={$t({ defaultMessage: 'Ports' })}
            key={OverviewInfoType.PORTS}
          >
            <PortsTab isLoading={isPortListLoading} data={portStatusList as EdgePortStatus[]}/>
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