import { useIntl } from 'react-intl'

import { Button, Loader, PageHeader, showActionModal, Table, TableColumn, TableProps } from '@acx-ui/components'
import { Features, useIsSplitOn }                                                      from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }                                                       from '@acx-ui/rc/components'
import {
  useDeleteTunnelProfileMutation,
  useGetEdgePinViewDataListQuery,
  useGetEdgeSdLanViewDataListQuery,
  useGetTunnelProfileViewDataListQuery,
  useNetworkListQuery,
  useWifiNetworkListQuery
} from '@acx-ui/rc/services'
import {
  filterByAccessForServicePolicyMutation,
  getPolicyAllowedOperation,
  getPolicyDetailsLink,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  getScopeKeyByPolicy,
  getTunnelTypeString, hasPolicyPermission,
  isDefaultTunnelProfile,
  MtuTypeEnum,
  NetworkSegmentTypeEnum,
  PolicyOperation,
  PolicyType,
  TunnelProfileViewData,
  useTableQuery
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

const defaultTunnelProfileTablePayload = {}

const TunnelProfileTable = () => {
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)

  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath: Path = useTenantLink('')
  const isEdgeSdLanReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_TOGGLE)
  const isEdgeSdLanHaReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_HA_TOGGLE)
  const isEdgePinReady = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)
  const isEdgeVxLanKaReady = useIsEdgeFeatureReady(Features.EDGE_VXLAN_TUNNEL_KA_TOGGLE)
  const tableQuery = useTableQuery({
    useQuery: useGetTunnelProfileViewDataListQuery,
    defaultPayload: defaultTunnelProfileTablePayload,
    sorter: {
      sortField: 'name',
      sortOrder: 'ASC'
    },
    search: {
      searchTargetFields: ['name']
    }
  })
  const { pinOptions } = useGetEdgePinViewDataListQuery({
    payload: {
      fields: ['name', 'id'],
      sortField: 'name',
      sortOrder: 'ASC',
      pageSize: 10000
    }
  }, {
    skip: !isEdgePinReady,
    selectFromResult: ({ data }) => ({
      pinOptions: data?.data
        ? data.data.map(item => ({ key: item.id, value: item.name }))
        : []
    })
  })

  const getNetworkListQuery = isWifiRbacEnabled? useWifiNetworkListQuery : useNetworkListQuery
  const { networkOptions } = getNetworkListQuery({
    payload: {
      fields: ['name', 'id'],
      sortField: 'name',
      sortOrder: 'ASC',
      pageSize: 10000
    }
  }, {
    selectFromResult: ({ data }) => ({
      networkOptions: data?.data
        ? data.data.map(item => ({ key: item.id, value: item.name }))
        : []
    })
  })

  const { sdLanOptions } = useGetEdgeSdLanViewDataListQuery({
    payload: {
      fields: ['name', 'id'],
      sortField: 'name',
      sortOrder: 'ASC',
      pageSize: 10000
    }
  }, {
    skip: !(isEdgeSdLanReady || isEdgeSdLanHaReady),
    selectFromResult: ({ data }) => ({
      sdLanOptions: data?.data
        ? data.data.map(item => ({ key: item.id, value: item.name }))
        : []
    })
  })

  const [deleteTunnelProfile] = useDeleteTunnelProfileMutation()

  const columns: TableProps<TunnelProfileViewData>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'name',
      dataIndex: 'name',
      searchable: true,
      sorter: true,
      defaultSortOrder: 'ascend',
      render: (_, row) => {
        return (
          <TenantLink to={getPolicyDetailsLink({
            type: PolicyType.TUNNEL_PROFILE,
            oper: PolicyOperation.DETAIL,
            policyId: row.id
          })}>
            {row.name}
          </TenantLink>
        )
      }
    },
    ...((isEdgeVxLanKaReady)
      ? [{
        title: $t({ defaultMessage: 'Network Segment Type' }),
        key: 'type',
        dataIndex: 'type',
        sorter: true,
        render: (_, row) => getTunnelTypeString($t, row.type || NetworkSegmentTypeEnum.VXLAN,
          isEdgeVxLanKaReady)
      }] as TableColumn<TunnelProfileViewData, 'text'>[]
      : []
    ),
    {
      title: $t({ defaultMessage: 'Gateway Path MTU Mode' }),
      key: 'mtuType',
      dataIndex: 'mtuType',
      sorter: true,
      render: (_, row) => {
        return MtuTypeEnum.AUTO === row.mtuType ?
          $t({ defaultMessage: 'Auto' }) :
          `${$t({ defaultMessage: 'Manual' })} (${row.mtuSize})`
      }
    },
    {
      title: $t({ defaultMessage: 'Force Fragmentation' }),
      key: 'forceFragmentation',
      dataIndex: 'forceFragmentation',
      sorter: true,
      render: (_, row) => {
        return row.forceFragmentation ?
          $t({ defaultMessage: 'ON' }) :
          $t({ defaultMessage: 'OFF' })
      }
    },
    {
      title: $t({ defaultMessage: 'Personal Identity Network' }),
      key: 'personalIdentityNetworkIds',
      dataIndex: 'personalIdentityNetworkIds',
      align: 'center',
      show: isEdgePinReady,
      filterable: isEdgePinReady? pinOptions : false,
      sorter: true,
      render: (_, row) => row.personalIdentityNetworkIds?.length || 0
    },
    ...((isEdgeSdLanReady || isEdgeSdLanHaReady)
      ? [{
        title: $t({ defaultMessage: 'SD-LAN' }),
        key: 'sdLanIds',
        dataIndex: 'sdLanIds',
        align: 'center',
        filterable: sdLanOptions,
        sorter: true,
        render: (_, row) => row.sdLanIds?.length || 0
      }] as TableColumn<TunnelProfileViewData, 'text'>[]
      : []
    ),
    {
      title: $t({ defaultMessage: 'Networks' }),
      key: 'networkIds',
      dataIndex: 'networkIds',
      align: 'center',
      filterable: networkOptions,
      sorter: true,
      render: (_, row) => row.networkIds?.length || 0
    }
    // {
    //   title: $t({ defaultMessage: 'Tags' }),
    //   key: 'tags',
    //   dataIndex: 'tags',
    //   sorter: true,
    //   render: (data) => {
    //     return `${data}`
    //   }
    // }
  ]

  const rowActions: TableProps<TunnelProfileViewData>['rowActions'] = [
    {
      scopeKey: getScopeKeyByPolicy(PolicyType.TUNNEL_PROFILE, PolicyOperation.EDIT),
      rbacOpsIds: getPolicyAllowedOperation(PolicyType.TUNNEL_PROFILE, PolicyOperation.EDIT),
      // Default Tunnel profile cannot Edit
      visible: (selectedRows) => selectedRows.length === 1
            && !isDefaultTunnelProfile(selectedRows[0]),
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        navigate({
          ...basePath,
          pathname: `${basePath.pathname}/` + getPolicyDetailsLink({
            type: PolicyType.TUNNEL_PROFILE,
            oper: PolicyOperation.EDIT,
            policyId: selectedRows[0].id
          })
        })
      }
    },
    {
      scopeKey: getScopeKeyByPolicy(PolicyType.TUNNEL_PROFILE, PolicyOperation.DELETE),
      rbacOpsIds: getPolicyAllowedOperation(PolicyType.TUNNEL_PROFILE, PolicyOperation.DELETE),
      visible: (selectedRows) => !selectedRows.some(row => isDefaultTunnelProfile(row)),
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Policy' }),
            entityValue: rows.length === 1 ? rows[0].name : undefined,
            numOfEntities: rows.length
          },
          onOk: () => {
            Promise.all(rows.map(row => deleteTunnelProfile({ params: { id: row.id } })))
              .then(clearSelection)
          }
        })
      }
    }
  ]

  const isSelectionVisible = hasPolicyPermission({
    type: PolicyType.TUNNEL_PROFILE, oper: PolicyOperation.EDIT
  }) && hasPolicyPermission({
    type: PolicyType.TUNNEL_PROFILE, oper: PolicyOperation.DELETE
  })

  return (
    <>
      <PageHeader
        title={
          $t(
            { defaultMessage: 'Tunnel Profile ({count})' },
            { count: tableQuery.data?.totalCount }
          )
        }
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          }
        ]}
        extra={filterByAccessForServicePolicyMutation([
          // eslint-disable-next-line max-len
          <TenantLink scopeKey={getScopeKeyByPolicy(PolicyType.TUNNEL_PROFILE, PolicyOperation.CREATE)}
          // eslint-disable-next-line max-len
            to={getPolicyRoutePath({ type: PolicyType.TUNNEL_PROFILE, oper: PolicyOperation.CREATE })}
            // eslint-disable-next-line max-len
            rbacOpsIds={getPolicyAllowedOperation(PolicyType.TUNNEL_PROFILE, PolicyOperation.CREATE)}
          >
            <Button type='primary'>{$t({ defaultMessage: 'Add Tunnel Profile' })}</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[tableQuery]}>
        <Table
          rowKey='id'
          columns={columns}
          rowActions={filterByAccessForServicePolicyMutation(rowActions)}
          rowSelection={isSelectionVisible && { type: 'checkbox' }}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter={true}
        />
      </Loader>
    </>
  )
}

export default TunnelProfileTable
