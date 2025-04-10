import { useContext, useEffect, useState } from 'react'

import { Col }       from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { GridRow, Tabs }           from '@acx-ui/components'
import {
  useGetEdgeLagsStatusListQuery,
  useGetEdgePortsStatusListQuery
} from '@acx-ui/rc/services'
import { ClusterStatusEnum } from '@acx-ui/rc/utils'

import { EdgeClusterDetailsDataContext } from '../EdgeClusterDetailsDataProvider'

import { EdgeClusterInfoWidget } from './EdgeClusterInfoWidget'
import { LagsTab }               from './LagsTab'
import { MonitorTab }            from './MonitorTab'
import { PortsTab }              from './PortsTab'

enum OverviewInfoType {
    MONITOR = 'monitor',
    PORTS = 'ports',
    LAGS = 'lags',
    SUB_INTERFACES = 'subInterfaces'
}
export const EdgeClusterOverview = () => {
  const { $t } = useIntl()
  const { clusterId, activeSubTab } = useParams()
  const [currentTab, setCurrentTab] = useState<string | undefined>(undefined)
  const {
    currentCluster,
    isClusterLoading
  } = useContext(EdgeClusterDetailsDataContext)

  const isConfigurable = currentCluster?.clusterStatus !== ClusterStatusEnum.CLUSTER_CONFIGS_NEEDED

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
    filters: { clusterId: [clusterId] },
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
    params: { clusterId },
    payload: edgePortStatusPayload
  }, { selectFromResult: ({ data, isLoading }) => ({
    portStatusList: data?.data ?? [],
    isPortListLoading: isLoading
  }) })

  const {
    lagStatusList = [],
    isLagListLoading
  } = useGetEdgeLagsStatusListQuery({
    params: { clusterId },
    payload: edgeLagStatusPayload
  }, {
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
    children: <MonitorTab clusterId={currentCluster?.clusterId} />
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
  }, {
    label: $t({ defaultMessage: 'LAGs' }),
    value: 'lags',
    children: <LagsTab
      isConfigurable={isConfigurable}
      data={lagStatusList}
      isLoading={isLagListLoading}
    />
  }]

  return (
    <GridRow>
      <Col span={24}>
        <EdgeClusterInfoWidget
          currentCluster={currentCluster}
          clusterPortsSetting={portStatusList}
          isEdgeClusterLoading={isClusterLoading}
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