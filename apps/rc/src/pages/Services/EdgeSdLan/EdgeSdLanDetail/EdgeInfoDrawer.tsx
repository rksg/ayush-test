import { useEffect, useState } from 'react'

import { Row }     from 'antd'
import { useIntl } from 'react-intl'

import { Drawer, Loader, Table, TableProps } from '@acx-ui/components'
import { EdgeStatusLight }                   from '@acx-ui/rc/components'
import { useGetEdgeClusterListQuery }        from '@acx-ui/rc/services'
import {
  ClusterHighAvailabilityModeEnum,
  CommonOperation, Device,
  EdgeSdLanDcTunnelInfo,
  EdgeSdLanDmzTunnelInfo,
  EdgeStatusEnum, getUrl,
  NodeClusterRoleEnum
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import { HaStatusBadge } from '../../../Devices/Edge/HaStatusBadge'

import * as UI from './styledComponents'

interface EdgeInfoDrawerProps {
  visible: boolean
  setVisible: React.Dispatch<React.SetStateAction<boolean>>
  currentEdgeInfo?: CurrentEdgeInfo
  edgeClusterTunnelInfo?: EdgeSdLanDcTunnelInfo[]
  guestEdgeClusterTunnelInfo?: EdgeSdLanDmzTunnelInfo[]
}

export interface CurrentEdgeInfo {
  clusterId?: string
  clusterName?: string
  isDmzCluster: boolean
}

interface EdgeInfoDrawerTableDataType {
  edgeNodeId: string
  edgeNodeName: string
  status: EdgeStatusEnum
  haStatus: NodeClusterRoleEnum
  activeDeviceCount: number
  allocatedDeviceCount?: number
}

export const EdgeInfoDrawer = (props: EdgeInfoDrawerProps) => {
  const {
    visible, setVisible, currentEdgeInfo, edgeClusterTunnelInfo,
    guestEdgeClusterTunnelInfo
  } = props
  const { $t } = useIntl()
  const [tableData, setTableData] = useState<EdgeInfoDrawerTableDataType[]>()
  const { clusterInfo, isLoading, isFetching } = useGetEdgeClusterListQuery({
    payload: {
      filters: {
        clusterId: [currentEdgeInfo?.clusterId],
        isCluster: [true]
      }
    }
  },{
    skip: !currentEdgeInfo?.clusterId,
    pollingInterval: 5 * 60 * 1000,
    selectFromResult: ({ data, isLoading, isFetching }) => {
      return {
        clusterInfo: data?.data?.[0],
        isLoading,
        isFetching
      }
    }
  })

  useEffect(() => {
    if(!clusterInfo) return
    setTableData(clusterInfo?.edgeList?.map(item => ({
      edgeNodeId: item.serialNumber,
      edgeNodeName: item.name,
      status: item.deviceStatus as EdgeStatusEnum,
      haStatus: item.haStatus as NodeClusterRoleEnum,
      activeDeviceCount: (currentEdgeInfo?.isDmzCluster ?
        guestEdgeClusterTunnelInfo?.find(tunnelInfo =>
          item.serialNumber === tunnelInfo.serialNumber)?.activeNodeCount :
        edgeClusterTunnelInfo?.find(tunnelInfo =>
          item.serialNumber === tunnelInfo.serialNumber)?.activeApCount) ?? 0,
      allocatedDeviceCount: (currentEdgeInfo?.isDmzCluster ?
        guestEdgeClusterTunnelInfo?.find(tunnelInfo =>
          item.serialNumber === tunnelInfo.serialNumber)?.allocatedNodeCount :
        edgeClusterTunnelInfo?.find(tunnelInfo =>
          item.serialNumber === tunnelInfo.serialNumber)?.allocatedApCount) ?? 0
    })))
  }, [clusterInfo])

  const columns: TableProps<EdgeInfoDrawerTableDataType>['columns'] = [
    {
      title: $t({ defaultMessage: 'RUCKUS Edge' }),
      key: 'edgeNodeId',
      dataIndex: 'edgeNodeId',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: (_, row) => (
        <TenantLink
          to={`${getUrl({
            feature: Device.Edge,
            oper: CommonOperation.Detail,
            params: { id: row.edgeNodeId } })}/overview`}
          children={row.edgeNodeName}
        />
      )
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'status',
      dataIndex: 'status',
      sorter: true,
      render: (_, row) => (
        <EdgeStatusLight data={row.status} showText />
      )
    },
    {
      title: $t({ defaultMessage: 'HA Status' }),
      key: 'haStatus',
      dataIndex: 'haStatus',
      align: 'center',
      sorter: true,
      render: (_, row) => (
        <HaStatusBadge haStatus={row.haStatus} />
      )
    },
    {
      title: $t(
        { defaultMessage: 'Active {deviceType}' },
        { deviceType: currentEdgeInfo?.isDmzCluster ? 'Edges' : 'APs' }
      ),
      key: 'activeDeviceCount',
      dataIndex: 'activeDeviceCount',
      sorter: true
    },
    ...(
      clusterInfo?.highAvailabilityMode === ClusterHighAvailabilityModeEnum.ACTIVE_ACTIVE ?
        [{
          title: $t(
            { defaultMessage: 'Primary {deviceType}' },
            { deviceType: currentEdgeInfo?.isDmzCluster ? 'Edges' : 'APs' }
          ),
          key: 'allocatedDeviceCount',
          dataIndex: 'allocatedDeviceCount',
          sorter: true
        }] : []
    )
  ]

  const handleClose = () => {
    setVisible(false)
  }

  const drawerContent = <>
    <Row justify='end'>
      <UI.StyledTableInfoText>
        {$t({ defaultMessage: '(Stats updated every 5 mins)' })}
      </UI.StyledTableInfoText>
    </Row>
    <Loader states={[{ isLoading, isFetching }]}>
      <Table
        rowKey='edgeNodeId'
        columns={columns}
        dataSource={tableData}
      />
    </Loader>
  </>

  return (
    <Drawer
      title={$t(
        { defaultMessage: '{edgeClusterName}: RUCKUS Edges' },
        { edgeClusterName: currentEdgeInfo?.clusterName }
      )}
      visible={visible}
      onClose={handleClose}
      children={drawerContent}
      destroyOnClose={true}
      width={900}
    />
  )
}