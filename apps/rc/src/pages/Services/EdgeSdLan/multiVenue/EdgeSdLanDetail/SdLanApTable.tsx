import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, Table, TableProps }  from '@acx-ui/components'
import { Features, useIsSplitOn }     from '@acx-ui/feature-toggle'
import { useApGroupsFilterOpts }      from '@acx-ui/rc/components'
import { useGetEdgeClusterListQuery } from '@acx-ui/rc/services'
import {
  APExtended,
  ApExtraParams,
  ClusterHighAvailabilityModeEnum,
  NodeClusterRoleEnum,
  TableQuery,
  VxlanTunnelStatus
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

export interface SdLanApTableProps extends Omit<TableProps<APExtended>, 'columns'> {
  tableQuery?: TableQuery<
    APExtended,
    {
      filters: {
        venueId: string[];
      };
      fields: string[];
    },
    ApExtraParams
  >,
  venueList: {
    venueId: string;
    venueName: string;
  }[],
  clusterId: string
}

const clusterQueryPayload = {
  fields: ['clusterId', 'haStatus', 'highAvailabilityMode', 'edgeList'],
  pageSize: 1
}

export const SdLanApTable = (props: SdLanApTableProps) => {

  const { $t } = useIntl()
  const isUseWifiRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)

  const apListTableQuery = props.tableQuery
  const [tableData, setTableData] = useState<APExtended[]>([])
  const [
    apGroupOptions,
    setApGroupOptions
  ] = useState<{ key: string, value: string }[] | boolean>(false)

  const { cluster, isClusterLoading, isClusterFetching } = useGetEdgeClusterListQuery({
    payload: {
      ...clusterQueryPayload,
      filters: { clusterId: [props.clusterId] }
    }
  }, {
    selectFromResult: ({ data, isLoading, isFetching }) => ({
      cluster: data?.data[0],
      isClusterLoading: isLoading,
      isClusterFetching: isFetching
    })
  })

  const isAaCluster = () => {
    return cluster?.highAvailabilityMode === ClusterHighAvailabilityModeEnum.ACTIVE_ACTIVE
  }

  const findEdge = (deviceId: string) => {
    return cluster?.edgeList
      ?.map(e => ({
        serialNumber: e.serialNumber,
        name: e.name
      }))
      ?.find(e => e.serialNumber === deviceId)
  }

  const findActiveEdge = () => {
    return cluster?.edgeList
      ?.map(e => ({
        serialNumber: e.serialNumber,
        name: e.name,
        haStatus: e.haStatus
      }))
      ?.find(e => e.haStatus === NodeClusterRoleEnum.CLUSTER_ROLE_ACTIVE)
  }

  const rawApGroupOptions = useApGroupsFilterOpts({
    venueId: props.venueList.map(v => v.venueId)
  })

  const getTunnelStatusDiaplayText = (tunStatus?: VxlanTunnelStatus) => {
    return tunStatus ? {
      [VxlanTunnelStatus.CONNECTED]: $t({ defaultMessage: 'Connected' }),
      [VxlanTunnelStatus.DISCONNECTED]: $t({ defaultMessage: 'Disconnected' })
    }[tunStatus] || '' : ''
  }

  const buildEdgeLink = (edge: { serialNumber: string, name: string }) => {
    return (
      <TenantLink to={`/devices/edge/${edge.serialNumber}/details/overview`}>
        {edge.name}
      </TenantLink>
    )
  }

  useEffect(() => {
    setApGroupOptions(Array.isArray(rawApGroupOptions) ?
      rawApGroupOptions.filter(option => option.value) :
      rawApGroupOptions)

    setTableData(apListTableQuery?.data?.data ?? [])
  }, [apListTableQuery?.data, cluster, rawApGroupOptions])

  const columns : TableProps<APExtended>['columns'] = [
    {
      title: $t({ defaultMessage: 'AP Name' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      searchable: true,
      fixed: 'left' as const,
      render: (_, row: APExtended, __, highlightFn) => (
        <TenantLink to={`/devices/wifi/${row.serialNumber}/details/overview`}>
          {highlightFn(row.name || '--')}
        </TenantLink>
      )
    },
    {
      key: 'venueName',
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      dataIndex: 'venueName',
      filterKey: 'venueId',
      filterable: props.venueList.map(v => ({ key: v.venueId, value: v.venueName })),
      sorter: !isUseWifiRbacApi,
      render: (_, row: APExtended) => (
        <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>
          {row.venueName}
        </TenantLink>
      )
    },
    {
      key: 'deviceGroupName',
      title: $t({ defaultMessage: 'AP Group' }),
      dataIndex: 'deviceGroupName',
      filterKey: 'deviceGroupId',
      filterable: apGroupOptions,
      sorter: !isUseWifiRbacApi,
      render: (_, row: APExtended) => (
        <TenantLink to={`/devices/apgroups/${row.deviceGroupId}/details/members`}>
          {row.deviceGroupName}
        </TenantLink>
      )
    },
    {
      key: 'connectedEdge',
      title: $t({ defaultMessage: 'Connected RUCKUS Edge Node' }),
      dataIndex: 'apStatusData.vxlanStatus.activeRvtepInfo.deviceId',
      sorter: false,
      render: (_, row: APExtended) => {
        const deviceId = row?.apStatusData?.vxlanStatus?.activeRvtepInfo?.deviceId
        if (!deviceId) {
          return ''
        }
        const connectedEdge = isAaCluster() ? findEdge(deviceId) : findActiveEdge()
        return connectedEdge ? buildEdgeLink(connectedEdge) : ''
      }
    },
    {
      title: $t({ defaultMessage: 'Tunnel Status' }),
      key: 'tunStatus',
      dataIndex: 'apStatusData.vxlanStatus.tunStatus',
      sorter: false,
      render: (_, row) => {
        return getTunnelStatusDiaplayText(row?.apStatusData?.vxlanStatus?.tunStatus)
      }
    },
    {
      title: $t({ defaultMessage: 'VxLAN PMTU Value' }),
      key: 'vxlanMtu',
      dataIndex: 'apStatusData.vxlanStatus.vxlanMtu',
      sorter: true,
      render: (_, row) => {
        return row?.apStatusData?.vxlanStatus?.vxlanMtu
      }
    }
  ]

  return (
    <Loader states={[{
      isLoading: apListTableQuery?.isLoading || isClusterLoading,
      isFetching: apListTableQuery?.isFetching || isClusterFetching
    }]}>
      <Table
        columns={columns}
        rowKey='serialNumber'
        settingsId={'sdlan-ap-table'}
        dataSource={tableData}
        enableApiFilter={true}
        enablePagination={true}
        onChange={apListTableQuery?.handleTableChange}
        onFilterChange={apListTableQuery?.handleFilterChange}
        getAllPagesData={apListTableQuery?.getAllPagesData}
        pagination={apListTableQuery?.pagination}
      />
    </Loader>
  )
}
