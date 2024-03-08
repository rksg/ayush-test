import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import { Loader, Table, TableProps, Tooltip }                     from '@acx-ui/components'
import { EdgeStatusLight, useEdgeClusterActions }                 from '@acx-ui/rc/components'
import { useGetEdgeClusterListForTableQuery, useVenuesListQuery } from '@acx-ui/rc/services'
import {
  ClusterNodeStatusEnum,
  ClusterStatusEnum,
  CommonOperation,
  Device,
  EdgeClusterTableDataType,
  activeTab,
  allowRebootForStatus,
  allowSendOtpForStatus,
  getUrl,
  usePollingTableQuery,
  genUrl,
  CommonCategory
} from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess }                         from '@acx-ui/user'
import { getIntl }                                from '@acx-ui/utils'

import { HaStatusBadge } from './HaStatusBadge'

const defaultPayload = {
  fields: [
    'tenantId',
    'clusterId',
    'name',
    'virtualIp',
    'venueId',
    'venueName',
    'clusterStatus',
    'haStatus',
    'edgeList'
  ]
}

export const EdgeClusterTable = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('')
  const { deleteNodeAndCluster, reboot, sendEdgeOnboardOtp } = useEdgeClusterActions()
  const tableQuery = usePollingTableQuery({
    useQuery: useGetEdgeClusterListForTableQuery,
    defaultPayload: defaultPayload,
    sorter: {
      sortField: 'name',
      sortOrder: 'ASC'
    },
    search: {
      searchTargetFields: ['name', 'virtualIp']
    }
  })
  const { venueOptions = [] } = useVenuesListQuery(
    {
      payload: {
        fields: ['name', 'id'],
        pageSize: 10000,
        sortField: 'name',
        sortOrder: 'ASC'
      }
    }, {
      selectFromResult: ({ data }) => {
        return {
          venueOptions: data?.data.map(item => ({ value: item.name, key: item.id }))
        }
      }
    })

  const columns: TableProps<EdgeClusterTableDataType>['columns'] = [
    {
      title: $t({ defaultMessage: 'SmartEdge' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      searchable: true,
      fixed: 'left',
      render: (_, row) => {
        return row.isFirstLevel ?
          row.name :
          <TenantLink to={`${getUrl({
            feature: Device.Edge,
            oper: CommonOperation.Detail,
            params: { id: row.serialNumber } })}/overview`}>
            {row.name}
          </TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'Cluster Status' }),
      key: 'clusterStatus',
      dataIndex: 'clusterStatus',
      sorter: true,
      render: (_, row) => {
        return row.clusterStatus && getClusterStatus(row)
      }
    },
    {
      title: $t({ defaultMessage: 'Node Status' }),
      key: 'deviceStatus',
      dataIndex: 'deviceStatus',
      render: (_, row) => {
        return <EdgeStatusLight data={row.deviceStatus} showText />
      }
    },
    {
      title: $t({ defaultMessage: 'HA Status' }),
      key: 'haStatus',
      dataIndex: 'haStatus',
      align: 'center',
      render: (_, row) => {
        return (
          !row.isFirstLevel &&
          <HaStatusBadge
            haStatus={row.haStatus}
          />
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      key: 'type',
      dataIndex: 'type'
    },
    {
      title: $t({ defaultMessage: 'Model' }),
      key: 'model',
      dataIndex: 'model'
    },
    {
      title: $t({ defaultMessage: 'Serial Number' }),
      key: 'serialNumber',
      dataIndex: 'serialNumber'
    },
    {
      title: $t({ defaultMessage: 'Virtual IP' }),
      key: 'virtualIp',
      dataIndex: 'virtualIp',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      key: 'ip',
      dataIndex: 'ip'
    },
    {
      title: $t({ defaultMessage: 'Cluster Interface' }),
      key: 'clusterInterface',
      dataIndex: 'clusterInterface'
    },
    {
      title: $t({ defaultMessage: 'Venue' }),
      key: 'venueId',
      dataIndex: 'venueId',
      sorter: true,
      filterable: venueOptions,
      filterKey: 'venueId',
      render: (_, row) => {
        return (
          <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>
            {row.venueName}
          </TenantLink>
        )
      }
    }
  ]

  const rowActions: TableProps<EdgeClusterTableDataType>['rowActions'] = [
    {
      visible: (selectedRows) => (selectedRows.length === 1),
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        if(selectedRows[0].isFirstLevel) {
          navigate({
            ...basePath,
            pathname:
            `${basePath.pathname}${getUrl({
              feature: Device.EdgeCluster,
              oper: CommonOperation.Edit,
              after: [activeTab],
              params: {
                id: selectedRows[0].clusterId,
                activeTab: 'cluster-details'
              } })}`
          })
        } else {
          navigate({
            ...basePath,
            pathname:
            `${basePath.pathname}${getUrl({
              feature: Device.Edge,
              oper: CommonOperation.Edit,
              after: [activeTab],
              params: {
                id: selectedRows[0].serialNumber,
                activeTab: 'general-settings'
              } })}`
          })
        }
      }
    },
    {
      visible: (selectedRows) =>
        (selectedRows.filter(row =>
          row.isFirstLevel && (row.children?.length ?? 0) > 0).length === 0),
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (selectedRows, clearSelection) => {
        deleteNodeAndCluster(selectedRows, clearSelection)
      }
    },
    {
      visible: (selectedRows) =>
        (selectedRows.filter(row => row.isFirstLevel).length === 0 &&
          selectedRows.filter(row => !allowSendOtpForStatus(row?.deviceStatus)).length === 0),
      label: $t({ defaultMessage: 'Send OTP' }),
      onClick: (selectedRows, clearSelection) => {
        sendEdgeOnboardOtp(selectedRows, clearSelection)
      }
    },
    {
      visible: (selectedRows) =>
        (selectedRows.filter(row => row.isFirstLevel).length === 0 &&
        selectedRows.filter(row => !allowRebootForStatus(row?.deviceStatus)).length === 0),
      label: $t({ defaultMessage: 'Reboot' }),
      onClick: (selectedRows, clearSelection) => {
        reboot(selectedRows, clearSelection)
      }
    },
    {
      label: $t({ defaultMessage: 'Switchover' }),
      onClick: () => {},
      disabled: true
    },{
      label: $t({ defaultMessage: 'Run Cluster & SmartEdge configuration wizard' }),
      onClick: (selectedRows) => {
        if(selectedRows[0].isFirstLevel) {
          navigate({
            ...basePath,
            pathname:
              `${basePath.pathname}${genUrl([
                CommonCategory.Device,
                Device.EdgeCluster,
                selectedRows[0].clusterId!,
                'configure'
              ])}`
          })
        } else {
          // do nothing
        }
      },
      disabled: (selectedRows) => {
        return !selectedRows[0]?.isFirstLevel
      }
    }
  ]

  return (
    <Loader states={[tableQuery]}>
      <Table
        rowKey={(row: EdgeClusterTableDataType) => (row.serialNumber ?? `c-${row.clusterId}`)}
        rowSelection={{ type: 'checkbox' }}
        rowActions={filterByAccess(rowActions)}
        columns={columns}
        dataSource={tableQuery?.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        onFilterChange={tableQuery.handleFilterChange}
        enableApiFilter
      />
    </Loader>
  )
}

const getClusterStatus = (data: EdgeClusterTableDataType) => {
  const { $t } = getIntl()
  const defaultMessage = $t({ defaultMessage: 'Cluster Setup Required' })
  if((data.edgeList?.length ?? 0) < 2){
    return <Row align='middle' justify='center' gutter={[2, 0]}>
      <Col>
        {$t({ defaultMessage: 'Single Node' })}
      </Col>
      <Col>
        <Tooltip.Question
          title={$t({ defaultMessage: `The cluster function requires
        at least two nodes to operate` })}
          placement='bottom'
          iconStyle={{ width: 16, marginTop: 5 }}
        />
      </Col>
    </Row>
  }
  switch(data.clusterStatus) {
    case ClusterStatusEnum.CLUSTER_CONFIGS_NEEDED:
      return defaultMessage
    case ClusterStatusEnum.CLUSTER_IS_FORMING:
      return $t({ defaultMessage: 'Cluster Forming' })
    case ClusterStatusEnum.CLUSTER_READY:
      return $t({ defaultMessage: 'Ready ({ready}/{total})' }, {
        ready: data.edgeList?.filter(item =>
          item.clusterNodeStatus === ClusterNodeStatusEnum.CLUSTER_NODE_READY).length ?? 0,
        total: data.edgeList?.length ?? 0
      })
    case ClusterStatusEnum.CLUSTER_UNHEALTHY:
      return $t({ defaultMessage: 'Disconnected' })
    default:
      return defaultMessage
  }
}
