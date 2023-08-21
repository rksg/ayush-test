import { useEffect, useState } from 'react'

import { Col }       from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { GridRow, Tabs }           from '@acx-ui/components'
import { Features, useIsSplitOn }  from '@acx-ui/feature-toggle'
import { EdgeInfoWidget }          from '@acx-ui/rc/components'
import {
  useEdgeBySerialNumberQuery,
  useGetEdgePortsStatusListQuery
} from '@acx-ui/rc/services'
import {  EdgePortStatus } from '@acx-ui/rc/utils'

import { MonitorTab }           from './MonitorTab'
import { PortsTab }             from './PortsTab'
import { EdgeSubInterfacesTab } from './SubInterfacesTab'

enum OverviewInfoType {
    MONITOR = 'monitor',
    PORTS = 'ports',
    SUB_INTERFACES = 'subInterfaces'
}
export const EdgeOverview = () => {
  const { $t } = useIntl()
  const { serialNumber, activeSubTab } = useParams()
  const [currentTab, setCurrentTab] = useState<string | undefined>(undefined)
  const isEdgeReady = useIsSplitOn(Features.EDGES_TOGGLE)

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
      'diskTotalKb',
      'description'
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
      'sort_idx',
      'interface_name',
      'ip_mode'
    ],
    filters: { serialNumber: [serialNumber] },
    sortField: 'sortIdx',
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

  const tabs = [{
    label: $t({ defaultMessage: 'Monitor' }),
    value: 'monitor',
    children: <MonitorTab />
  }, {
    label: $t({ defaultMessage: 'Ports' }),
    value: 'ports',
    children: <PortsTab isLoading={isPortListLoading} data={portStatusList as EdgePortStatus[]}/>
  }, {
    label: $t({ defaultMessage: 'Sub-Interfaces' }),
    value: 'subInterfaces',
    children: <EdgeSubInterfacesTab
      isLoading={isPortListLoading}
      ports={portStatusList as EdgePortStatus[]}
    />
  }].filter(i => i.value !== 'monitor' || isEdgeReady)

  return (
    <GridRow>
      <Col span={24}>
        <EdgeInfoWidget
          currentEdge={currentEdge}
          edgePortsSetting={portStatusList}
          isEdgeStatusLoading={isLoadingEdgeStatus}
          isPortListLoading={isPortListLoading}
          onClickWidget={handleClickWidget}
        />
      </Col>
      <Col span={24}>
        <Tabs
          type='second'
          activeKey={currentTab}
          defaultActiveKey={activeSubTab || tabs[0].value}
          onChange={handleTabChange}
        >
          {tabs.map((tab) => (
            <Tabs.TabPane
              tab={tab.label}
              key={tab.value}
            >
              {tab.children}
            </Tabs.TabPane>
          ))}
        </Tabs>
      </Col>
    </GridRow>
  )
}
