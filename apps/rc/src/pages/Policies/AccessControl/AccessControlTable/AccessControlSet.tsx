import { useEffect, useState } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Loader, Table, TableProps } from '@acx-ui/components'
import { defaultNetworkPayload }     from '@acx-ui/rc/components'
import {
  doProfileDelete,
  useDeleteAccessControlProfilesMutation,
  useGetEnhancedAccessControlProfileListQuery,
  useNetworkListQuery
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
import { filterByAccess, hasAccess }                               from '@acx-ui/user'

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
    'networkIds',
    'networkCount'
  ],
  page: 1
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

  const [ deleteFn ] = useDeleteAccessControlProfilesMutation()

  const doDelete = (selectedRows: EnhancedAccessControlInfoType[], callback: () => void) => {
    doProfileDelete(
      selectedRows,
      $t({ defaultMessage: 'Policy' }),
      selectedRows[0].name,
      [{ fieldName: 'networkIds', fieldText: $t({ defaultMessage: 'Network' }) }],
      async () => deleteFn({ params, payload: selectedRows.map(row => row.id) }).then(callback)
    )
  }


  const rowActions: TableProps<EnhancedAccessControlInfoType>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Delete' }),
      visible: (selectedItems => selectedItems.length > 0),
      onClick: (rows, clearSelection) => {
        doDelete(rows, clearSelection)
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
      settingsId='policies-access-control-set-table'
      enableApiFilter={true}
      columns={useColumns(networkFilterOptions)}
      dataSource={tableQuery?.data?.data}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
      onFilterChange={tableQuery.handleFilterChange}
      rowKey='id'
      rowActions={filterByAccess(rowActions)}
      rowSelection={hasAccess() && { type: 'checkbox' }}
    />
  </Loader>
}

function useColumns (networkFilterOptions: AclOptionType[]) {
  const { $t } = useIntl()
  const form = Form.useFormInstance()

  const columns: TableProps<EnhancedAccessControlInfoType>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      defaultSortOrder: 'ascend',
      fixed: 'left',
      render: function (_, row) {
        return (
          <TenantLink
            to={getPolicyDetailsLink({
              type: PolicyType.ACCESS_CONTROL,
              oper: PolicyOperation.DETAIL,
              policyId: row.id!
            })}>
            {row.name}
          </TenantLink>
        )
      }
    },
    {
      key: 'l2AclPolicyName',
      title: $t({ defaultMessage: 'Layer 2' }),
      dataIndex: 'l2AclPolicyName',
      sorter: true,
      render: function (_, row) {
        return row.l2AclPolicyId
          ? <Form form={form}><Layer2Drawer
            isOnlyViewMode={true}
            onlyViewMode={{ id: row.l2AclPolicyId, viewText: row.l2AclPolicyName }}
          /></Form>
          : '-'
      }
    },
    {
      key: 'l3AclPolicyName',
      title: $t({ defaultMessage: 'Layer 3' }),
      dataIndex: 'l3AclPolicyName',
      sorter: true,
      render: function (_, row) {
        return row.l3AclPolicyId
          ? <Form form={form}><Layer3Drawer
            isOnlyViewMode={true}
            onlyViewMode={{ id: row.l3AclPolicyId, viewText: row.l3AclPolicyName }}
          /></Form>
          : '-'
      }
    },
    {
      key: 'devicePolicyName',
      title: $t({ defaultMessage: 'Device & OS' }),
      dataIndex: 'devicePolicyName',
      sorter: true,
      render: function (_, row) {
        return row.devicePolicyId
          ? <Form form={form}><DeviceOSDrawer
            isOnlyViewMode={true}
            onlyViewMode={{ id: row.devicePolicyId, viewText: row.devicePolicyName }}
          /></Form>
          : '-'
      }
    },
    {
      key: 'applicationPolicyName',
      title: $t({ defaultMessage: 'Applications' }),
      dataIndex: 'applicationPolicyName',
      sorter: true,
      render: function (_, row) {
        return row.applicationPolicyId
          ? <Form form={form}><ApplicationDrawer
            isOnlyViewMode={true}
            onlyViewMode={{
              id: row.applicationPolicyId,
              viewText: row.applicationPolicyName
            }}
          /></Form>
          : '-'
      }
    },
    {
      key: 'clientRateLimit',
      title: $t({ defaultMessage: 'Client Rate Limit' }),
      dataIndex: 'clientRateLimit',
      sorter: true,
      render: function (_, row) {
        return <ClientRateLimitComponent
          clientRateUpLinkLimit={row.clientRateUpLinkLimit}
          clientRateDownLinkLimit={row.clientRateDownLinkLimit}
        />
      }
    },
    {
      key: 'networkCount',
      title: $t({ defaultMessage: 'Networks' }),
      dataIndex: 'networkCount',
      align: 'center',
      filterable: networkFilterOptions,
      sorter: true,
      sortDirections: ['descend', 'ascend', 'descend'],
      render: (_, row) => row.networkIds.length
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
