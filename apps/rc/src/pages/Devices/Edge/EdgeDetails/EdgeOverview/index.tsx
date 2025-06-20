import { useContext, useEffect, useState } from 'react'

import { Col }       from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { GridRow, Tabs }                         from '@acx-ui/components'
import { Features }                              from '@acx-ui/feature-toggle'
import { EdgeInfoWidget, useIsEdgeFeatureReady } from '@acx-ui/rc/components'
import {
  useGetEdgeLagsStatusListQuery,
  useGetEdgePortsStatusListQuery
} from '@acx-ui/rc/services'
import { isEdgeConfigurable } from '@acx-ui/rc/utils'

import { EdgeDetailsDataContext } from '../EdgeDetailsDataProvider'

import { LagsTab }              from './LagsTab'
import { MonitorTab }           from './MonitorTab'
import { PortsTab }             from './PortsTab'
import { EdgeSubInterfacesTab } from './SubInterfacesTab'

enum OverviewInfoType {
    MONITOR = 'monitor',
    PORTS = 'ports',
    LAGS = 'lags',
    SUB_INTERFACES = 'subInterfaces'
}
export const EdgeOverview = () => {
  const { $t } = useIntl()
  const { serialNumber, activeSubTab } = useParams()
  const [currentTab, setCurrentTab] = useState<string | undefined>(undefined)
  const {
    currentEdgeStatus: currentEdge,
    isEdgeStatusLoading: isLoadingEdgeStatus,
    currentCluster
  } = useContext(EdgeDetailsDataContext)
  const isEdgeLagEnabled = useIsEdgeFeatureReady(Features.EDGE_LAG)

  const isConfigurable = isEdgeConfigurable(currentEdge)

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

  const edgeLagStatusPayload = {
    fields: [
      'lagId',
      'name',
      'description',
      'lagType',
      'status',
      'adminStatus',
      'lagMembers',
      'portType',
      'mac',
      'ip',
      'ipMode',
      'lacpTimeout'
    ],
    sortField: 'lagId',
    sortOrder: 'ASC'
  }

  const {
    portStatusList,
    isPortListLoading
  } = useGetEdgePortsStatusListQuery({
    params: { serialNumber },
    payload: edgePortStatusPayload
  }, { selectFromResult: ({ data, isLoading }) => ({
    portStatusList: data?.data ?? [],
    isPortListLoading: isLoading
  }) })

  const {
    lagStatusList = [],
    isLagListLoading
  } = useGetEdgeLagsStatusListQuery({
    params: { serialNumber },
    payload: edgeLagStatusPayload
  }, {
    skip: !isEdgeLagEnabled,
    selectFromResult ({ data, isLoading }) {
      return {
        lagStatusList: data?.data,
        isLagListLoading: isLoading
      }
    }
  })

  const handleTabChange = (val: string) => {
    setCurrentTab(val)
  }

  const handleClickWidget = (type: string) => {
    if (type === 'port')
      handleTabChange(OverviewInfoType.PORTS)
  }

  const handleClickLagName = () => {
    handleTabChange(OverviewInfoType.LAGS)
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
    children: <PortsTab
      isConfigurable={isConfigurable}
      portData={portStatusList}
      lagData={lagStatusList}
      isLoading={isPortListLoading || isLagListLoading}
      handleClickLagName={handleClickLagName}
    />
  },
  ...(isEdgeLagEnabled ? [{
    label: $t({ defaultMessage: 'LAGs' }),
    value: 'lags',
    children: <LagsTab
      isConfigurable={isConfigurable}
      data={lagStatusList}
      isLoading={isLagListLoading}
    />
  }] : []),
  {
    label: $t({ defaultMessage: 'Sub-Interfaces' }),
    value: 'subInterfaces',
    children: <EdgeSubInterfacesTab
      isConfigurable={isConfigurable}
      isLoading={isPortListLoading || isLagListLoading}
      ports={portStatusList}
      lags={lagStatusList}
    />
  }]

  return (
    <GridRow>
      <Col span={24}>
        <EdgeInfoWidget
          currentEdge={currentEdge}
          currentCluster={currentCluster}
          edgePortsSetting={portStatusList}
          isEdgeStatusLoading={isLoadingEdgeStatus}
          isPortListLoading={isPortListLoading}
          onClickWidget={handleClickWidget}
        />
      </Col>
      <Col span={24}>
        <Tabs type='card'
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