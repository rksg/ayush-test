import { useContext, useEffect, useMemo, useState } from 'react'

import { Col }       from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { GridRow, Tabs }                  from '@acx-ui/components'
import {
  useGetEdgeGeneralLagsStatusListQuery,
  useGetEdgeGeneralPortsStatusListQuery
} from '@acx-ui/rc/services'
import { ClusterStatusEnum, EdgePortTypeEnum } from '@acx-ui/rc/utils'

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

const edgeLagStatusPayload = {
  fields: [
    'lagId',
    'serialNumber',
    'edgeClusterId',
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
    'lacpTimeout',
    'linkHealthMonitoring'
  ],
  sortField: 'lagId',
  sortOrder: 'ASC'
}

const edgePortStatusPayload = {
  fields: [
    'portId',
    'name',
    'type',
    'serialNumber',
    'edgeClusterId',
    'ip',
    'status',
    'adminStatus',
    'speedKbps',
    'mac',
    'duplex',
    'sortIdx',
    'interfaceName',
    'ipMode',
    'linkHealthMonitoring'
  ],
  sortField: 'sortIdx',
  sortOrder: 'ASC'
}

export const EdgeClusterOverview = () => {
  const { $t } = useIntl()
  const { clusterId, activeSubTab } = useParams()
  const [currentTab, setCurrentTab] = useState<string | undefined>(undefined)
  const {
    clusterInfo,
    isClusterLoading
  } = useContext(EdgeClusterDetailsDataContext)

  const isConfigurable = clusterInfo?.clusterStatus !== ClusterStatusEnum.CLUSTER_CONFIGS_NEEDED

  const {
    portStatusList,
    isPortListLoading
  } = useGetEdgeGeneralPortsStatusListQuery({
    payload: {
      ...edgePortStatusPayload,
      filters: { edgeClusterId: [clusterId] }
    }
  }, {
    skip: !clusterId,
    selectFromResult: ({ data, isLoading }) => ({
      portStatusList: data?.data ?? [],
      isPortListLoading: isLoading
    }) })

  const {
    lagStatusList = [],
    isLagListLoading
  } = useGetEdgeGeneralLagsStatusListQuery({
    payload: {
      ...edgeLagStatusPayload,
      filters: { edgeClusterId: [clusterId] }
    }
  }, {
    skip: !clusterId,
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

  const wanPortIfNames = useMemo(() => {
    return portStatusList
      .filter(port => port.type === EdgePortTypeEnum.WAN)
      .map(port => ({ edgeId: port.serialNumber!, ifName: port.interfaceName! }))
      .concat(lagStatusList
        .filter(lag => lag.portType === EdgePortTypeEnum.WAN)
        // eslint-disable-next-line max-len
        .map(lag => ({ edgeId: lag.serialNumber!, ifName: `lag${lag.lagId}` })))
  }, [portStatusList, lagStatusList])

  const tabs = [{
    label: $t({ defaultMessage: 'Monitor' }),
    value: 'monitor',
    children: <MonitorTab
      wanPortIfNames={wanPortIfNames}
    />
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
          currentCluster={clusterInfo}
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