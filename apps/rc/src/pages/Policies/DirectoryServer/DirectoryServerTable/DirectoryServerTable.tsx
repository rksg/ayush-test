import { useIntl } from 'react-intl'

import { Button, Loader, PageHeader, Table, TableProps } from '@acx-ui/components'
import { SimpleListTooltip }                             from '@acx-ui/rc/components'
import {
  doProfileDelete,
  useDeleteDirectoryServerMutation,
  useGetDirectoryServerViewDataListQuery,
  useWifiNetworkListQuery
} from '@acx-ui/rc/services'
import {
  DirectoryServerProfileEnum,
  DirectoryServerViewData,
  DIRECTORY_SERVER_LIMIT_NUMBER,
  filterByAccessForServicePolicyMutation,
  getPolicyDetailsLink,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  getScopeKeyByPolicy,
  PolicyOperation,
  PolicyType,
  useTableQuery,
  getPolicyAllowedOperation
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { noDataDisplay }                                           from '@acx-ui/utils'

export default function DirectoryServerTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const tenantBasePath: Path = useTenantLink('')
  const [ deleteFn ] = useDeleteDirectoryServerMutation()

  const settingsId = 'policies-directory-server-table'
  const defaultPayload = {
    fields: ['id', 'name', 'domainName', 'host', 'port', 'type', 'wifiNetworkIds'],
    searchString: '',
    filters: {}
  }

  const tableQuery = useTableQuery<DirectoryServerViewData>({
    useQuery: useGetDirectoryServerViewDataListQuery,
    defaultPayload,
    pagination: { settingsId },
    search: {
      searchString: '',
      searchTargetFields: ['name']
    }
  })

  const doDelete = (selectedRows: DirectoryServerViewData[], callback: () => void) => {
    doProfileDelete(
      selectedRows,
      $t({ defaultMessage: 'Polic{plural}' }, { plural: selectedRows.length > 1 ? 'ies' : 'y' }),
      selectedRows[0].name,
      [{ fieldName: 'wifiNetworkIds', fieldText: $t({ defaultMessage: 'Network' }) }],
      async () => deleteFn({
        params, payload: selectedRows.map(row => row.id) }).then(callback)
    )
  }

  const rowActions: TableProps<DirectoryServerViewData>['rowActions'] = [
    {
      rbacOpsIds: getPolicyAllowedOperation(PolicyType.DIRECTORY_SERVER, PolicyOperation.DELETE),
      scopeKey: getScopeKeyByPolicy(PolicyType.DIRECTORY_SERVER, PolicyOperation.DELETE),
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (selectedRows: DirectoryServerViewData[], clearSelection) => {
        doDelete(selectedRows, clearSelection)
      }
    },
    {
      rbacOpsIds: getPolicyAllowedOperation(PolicyType.DIRECTORY_SERVER, PolicyOperation.EDIT),
      scopeKey: getScopeKeyByPolicy(PolicyType.DIRECTORY_SERVER, PolicyOperation.EDIT),
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedRows) => selectedRows?.length === 1,
      onClick: ([{ id }]) => {
        navigate({
          ...tenantBasePath,
          pathname: `${tenantBasePath.pathname}/` + getPolicyDetailsLink({
            type: PolicyType.DIRECTORY_SERVER,
            oper: PolicyOperation.EDIT,
            policyId: id!
          })
        })
      }
    }
  ]

  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)

  return (
    <>
      <PageHeader
        title={
          // eslint-disable-next-line max-len
          $t({ defaultMessage: 'Directory Server ({count})' }, { count: tableQuery.data?.totalCount })
        }
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          }
        ]}
        extra={filterByAccessForServicePolicyMutation([
          <TenantLink
            // eslint-disable-next-line max-len
            to={getPolicyRoutePath({ type: PolicyType.DIRECTORY_SERVER, oper: PolicyOperation.CREATE })}
            // eslint-disable-next-line max-len
            rbacOpsIds={getPolicyAllowedOperation(PolicyType.DIRECTORY_SERVER, PolicyOperation.CREATE)}
            scopeKey={getScopeKeyByPolicy(PolicyType.DIRECTORY_SERVER, PolicyOperation.CREATE)}
          >
            <Button type='primary'
              disabled={tableQuery.data?.totalCount
                ? tableQuery.data?.totalCount >= DIRECTORY_SERVER_LIMIT_NUMBER
                : false} >{$t({ defaultMessage: 'Add Directory Server' })}</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[tableQuery]}>
        <Table<DirectoryServerViewData>
          settingsId={settingsId}
          columns={useColumns()}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowActions={allowedRowActions}
          rowSelection={allowedRowActions.length > 0 && { type: 'checkbox' }}
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter={true}
        />
      </Loader>
    </>
  )
}

function useColumns () {
  const { $t } = useIntl()
  const params = useParams()
  const emptyNetworks: { key: string, value: string }[] = []
  const { networkNameMap } = useWifiNetworkListQuery({
    params: { tenantId: params.tenantId },
    payload: {
      fields: ['name', 'id'],
      sortField: 'name',
      sortOrder: 'ASC',
      page: 1,
      pageSize: 2048
    }
  }, {
    selectFromResult: ({ data }) => ({
      networkNameMap: data?.data
        ? data.data.map(network => ({ key: network.id, value: network.name }))
        : emptyNetworks
    })
  })
  const columns: TableProps<DirectoryServerViewData>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      fixed: 'left',
      render: function (_, row,__,highlightFn) {
        return (
          <TenantLink
            to={getPolicyDetailsLink({
              type: PolicyType.DIRECTORY_SERVER,
              oper: PolicyOperation.DETAIL,
              policyId: row.id!
            })}>
            {highlightFn(row.name)}
          </TenantLink>
        )
      }
    },
    {
      key: 'type',
      title: $t({ defaultMessage: 'Server Type' }),
      dataIndex: 'type',
      sorter: true,
      render: (_, row) => {
        switch (row?.type) {
          case DirectoryServerProfileEnum.LDAP:
            return $t({ defaultMessage: 'LDAP' })
          case DirectoryServerProfileEnum.AD:
            return $t({ defaultMessage: 'Active Directory' })
          default:
            return row?.type || noDataDisplay
        }
      }
    },
    {
      key: 'serverAddress',
      title: $t({ defaultMessage: 'Server Address' }),
      dataIndex: 'host',
      sorter: true,
      render: (_, row) => {
        const host = row?.host
        const port = row?.port
        return host && port ? `${host}:${port}` : noDataDisplay
      }
    },
    {
      key: 'domainName',
      title: $t({ defaultMessage: 'Domain Name' }),
      dataIndex: 'domainName',
      sorter: true
    },
    {
      key: 'wifiNetworkIds',
      title: $t({ defaultMessage: 'Networks' }),
      dataIndex: 'wifiNetworkIds',
      align: 'center',
      sorter: true,
      filterable: networkNameMap,
      render: (_,row) =>{
        const networkIds = row.wifiNetworkIds
        if (!networkIds || networkIds.length === 0) return 0
        // eslint-disable-next-line max-len
        const tooltipItems = networkNameMap.filter(v => networkIds!.includes(v.key)).map(v => v.value)
        return <SimpleListTooltip items={tooltipItems} displayText={networkIds.length} />
      }
    }
  ]

  return columns
}
