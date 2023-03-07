import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, showActionModal, Table, TableProps }                from '@acx-ui/components'
import { defaultNetworkPayload }                                     from '@acx-ui/rc/components'
import {
  useDeleteAccessControlProfileMutation,
  useGetEnhancedAccessControlProfileListQuery, useNetworkListQuery
} from '@acx-ui/rc/services'
import {
  AclOptionType,
  EnhancedAccessControlInfoType,
  getPolicyDetailsLink, Network,
  PolicyOperation,
  PolicyType,
  useTableQuery
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useTenantLink, useNavigate, useParams } from '@acx-ui/react-router-dom'

import ApplicationDrawer from '../AccessControlForm/ApplicationDrawer'
import DeviceOSDrawer    from '../AccessControlForm/DeviceOSDrawer'
import Layer2Drawer      from '../AccessControlForm/Layer2Drawer'
import Layer3Drawer      from '../AccessControlForm/Layer3Drawer'


const defaultPayload = {
  searchString: '',
  fields: [
    'id',
    'name',
    'l2AclPolicyName',
    'l2AclPolicyId',
    'l3AclPolicyName',
    'l3AclPolicyId',
    'devicePolicyName',
    'devicePolicyId',
    'applicationPolicyName',
    'applicationPolicyId',
    'clientRateUpLinkLimit',
    'clientRateDownLinkLimit',
    'networkIds'
  ],
  page: 1,
  pageSize: 25
}

const AccessControlSet = () => {
  const { $t } = useIntl()
  const tenantBasePath: Path = useTenantLink('')
  const navigate = useNavigate()
  const params = useParams()

  const [networkFilterOptions, setNetworkFilterOptions] = useState([] as AclOptionType[])
  const [networkIds, setNetworkIds] = useState([] as string[])

  const tableQuery = useTableQuery({
    useQuery: useGetEnhancedAccessControlProfileListQuery,
    defaultPayload
  })

  const networkTableQuery = useTableQuery<Network>({
    useQuery: useNetworkListQuery,
    defaultPayload: {
      ...defaultNetworkPayload,
      filters: {
        id: [...networkIds]
      }
    }
  })

  useEffect(() => {
    if (tableQuery.data) {
      let unionNetworkIds = [] as string[]
      tableQuery.data.data.map(policy => {
        if (policy.networkIds) {
          unionNetworkIds.push(...policy.networkIds)
        }
      })
      setNetworkIds([...new Set(unionNetworkIds)])

      networkTableQuery.setPayload({
        ...defaultPayload,
        filters: {
          id: [...networkIds]
        }
      })
    }
  }, [tableQuery.data])

  useEffect(() => {
    if (networkTableQuery.data && networkIds.length) {
      setNetworkFilterOptions(
        [...networkTableQuery.data.data.map(
          (network) => {
            return { key: network.id, value: network.name }
          })]
      )
    }
  }, [networkTableQuery.data, networkIds])

  const [ delAccessControl ] = useDeleteAccessControlProfileMutation()

  const rowActions: TableProps<EnhancedAccessControlInfoType>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: ([{ name, id, networkIds }], clearSelection) => {
        if (networkIds.length !== 0) {
          showActionModal({
            type: 'error',
            content: $t({
              defaultMessage: 'This policy has been applied in network'
            })
          })
        } else {
          showActionModal({
            type: 'confirm',
            customContent: {
              action: 'DELETE',
              entityName: $t({ defaultMessage: 'Policy' }),
              entityValue: name
            },
            onOk: () => {
              delAccessControl({ params: { ...params, policyId: id } }).then(clearSelection)
            }
          })
        }
      }
    },
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: ([{ id }]) => {
        navigate({
          ...tenantBasePath,
          pathname: `${tenantBasePath.pathname}/` + getPolicyDetailsLink({
            type: PolicyType.ACCESS_CONTROL,
            oper: PolicyOperation.EDIT,
            policyId: id!
          })
        })
      }
    }
  ]

  return <Loader states={[tableQuery]}>
    <Table<EnhancedAccessControlInfoType>
      enableApiFilter={true}
      columns={useColumns(networkFilterOptions)}
      dataSource={tableQuery?.data?.data}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
      onFilterChange={tableQuery.handleFilterChange}
      rowKey='id'
      rowActions={rowActions}
      rowSelection={{ type: 'radio' }}
    />
  </Loader>
}

function useColumns (networkFilterOptions: AclOptionType[]) {
  const { $t } = useIntl()

  const columns: TableProps<EnhancedAccessControlInfoType>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        return (
          <TenantLink
            to={getPolicyDetailsLink({
              type: PolicyType.ACCESS_CONTROL,
              oper: PolicyOperation.DETAIL,
              policyId: row.id!
            })}>
            {data}
          </TenantLink>
        )
      }
    },
    {
      key: 'l2AclPolicyName',
      title: $t({ defaultMessage: 'Layer 2' }),
      dataIndex: 'l2AclPolicyName',
      sorter: true,
      render: function (data, row) {
        return row.l2AclPolicyId
          ? <Layer2Drawer
            isOnlyViewMode={true}
            onlyViewMode={{ id: row.l2AclPolicyId, viewText: row.l2AclPolicyName }}
          />
          : '-'
      }
    },
    {
      key: 'l3AclPolicyName',
      title: $t({ defaultMessage: 'Layer 3' }),
      dataIndex: 'l3AclPolicyName',
      sorter: true,
      render: function (data, row) {
        return row.l3AclPolicyId
          ? <Layer3Drawer
            isOnlyViewMode={true}
            onlyViewMode={{ id: row.l3AclPolicyId, viewText: row.l3AclPolicyName }}
          />
          : '-'
      }
    },
    {
      key: 'devicePolicyName',
      title: $t({ defaultMessage: 'Device & OS' }),
      dataIndex: 'devicePolicyName',
      sorter: true,
      render: function (data, row) {
        return row.devicePolicyId
          ? <DeviceOSDrawer
            isOnlyViewMode={true}
            onlyViewMode={{ id: row.devicePolicyId, viewText: row.devicePolicyName }}
          />
          : '-'
      }
    },
    {
      key: 'applicationPolicyName',
      title: $t({ defaultMessage: 'Applications' }),
      dataIndex: 'applicationPolicyName',
      sorter: true,
      render: function (data, row) {
        return row.applicationPolicyId
          ? <ApplicationDrawer
            isOnlyViewMode={true}
            onlyViewMode={{
              id: row.applicationPolicyId,
              viewText: row.applicationPolicyName
            }}
          />
          : '-'
      }
    },
    {
      key: 'clientRateLimit',
      title: $t({ defaultMessage: 'Client Rate Limit' }),
      dataIndex: 'clientRateLimit',
      sorter: true,
      render: function (data, row) {
        return <ClientRateLimitComponent
          clientRateUpLinkLimit={row.clientRateUpLinkLimit}
          clientRateDownLinkLimit={row.clientRateDownLinkLimit}
        />
      }
    },
    {
      key: 'networkIds',
      title: $t({ defaultMessage: 'Networks' }),
      dataIndex: 'networkIds',
      align: 'center',
      filterable: networkFilterOptions,
      sorter: true,
      render: (data, row) => row.networkIds.length
    }
  ]

  return columns
}

const ClientRateLimitComponent = (
  props: { clientRateUpLinkLimit: number, clientRateDownLinkLimit: number }
) => {
  const { $t } = useIntl()
  const { clientRateUpLinkLimit, clientRateDownLinkLimit } = props
  const UNLIMITED = $t({ defaultMessage: 'Unlimited' })

  const uplink = clientRateUpLinkLimit
    ? $t({ defaultMessage: '{count} Mbps' }, {
      count: clientRateUpLinkLimit
    })
    : UNLIMITED
  const downlink = clientRateDownLinkLimit
    ? $t({ defaultMessage: '{count} Mbps' }, {
      count: clientRateDownLinkLimit
    })
    : UNLIMITED

  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
    <div style={{ textAlign: 'left', fontWeight: 'bold' }}>
      {$t({ defaultMessage: 'UP:  ' })}
    </div><div>{uplink}</div>
    <div style={{ textAlign: 'left', fontWeight: 'bold' }}>
      {$t({ defaultMessage: 'DOWN:' })}
    </div><div>{downlink}</div>
  </div>
}


export default AccessControlSet
