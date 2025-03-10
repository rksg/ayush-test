import { useIntl } from 'react-intl'

import { Button, Loader, PageHeader, Table, TableProps } from '@acx-ui/components'
import {
  FriendlyNameEnum,
  friendlyNameEnumOptions,
  SimpleListTooltip,
  WIFI_OPERATOR_MAX_COUNT
} from '@acx-ui/rc/components'
import {
  doProfileDelete,
  useDeleteWifiOperatorMutation,
  useGetWifiOperatorListQuery,
  useWifiNetworkListQuery
} from '@acx-ui/rc/services'
import {
  filterByAccessForServicePolicyMutation,
  getPolicyAllowedOperation,
  getPolicyDetailsLink,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  getScopeKeyByPolicy,
  KeyValue,
  PolicyOperation,
  PolicyType,
  useTableQuery,
  WifiNetwork,
  WifiOperatorViewModel
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'


const defaultPayload = {
  fields: ['id', 'name', 'tenantId', 'domainNames', 'friendlyNames',
    'wifiNetworkIds', 'description'],
  searchString: '',
  filters: {}
}

export default function WifiOperatorTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')
  const [ deleteFn ] = useDeleteWifiOperatorMutation()

  const settingsId = 'policies-wifi-operator-table'
  const tableQuery = useTableQuery<WifiOperatorViewModel>({
    useQuery: useGetWifiOperatorListQuery,
    defaultPayload,
    pagination: { settingsId }
  })

  const doDelete = (selectedRows: WifiOperatorViewModel[], callback: () => void) => {
    doProfileDelete(
      selectedRows,
      $t({ defaultMessage: 'Profile(s)' }),
      selectedRows[0].name,
      [{ fieldName: 'wifiNetworkIds', fieldText: $t({ defaultMessage: 'Network' }) }],
      async () =>
        Promise.all(selectedRows.map(row => deleteFn({ params: { policyId: row.id } })))
          .then(callback)
    )
  }

  const rowActions: TableProps<WifiOperatorViewModel>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Delete' }),
      scopeKey: getScopeKeyByPolicy(PolicyType.WIFI_OPERATOR, PolicyOperation.DELETE),
      rbacOpsIds: getPolicyAllowedOperation(PolicyType.WIFI_OPERATOR, PolicyOperation.DELETE),
      onClick: (selectedRows: WifiOperatorViewModel[], clearSelection) => {
        doDelete(selectedRows, clearSelection)
      }
    },
    {
      label: $t({ defaultMessage: 'Edit' }),
      scopeKey: getScopeKeyByPolicy(PolicyType.WIFI_OPERATOR, PolicyOperation.EDIT),
      rbacOpsIds: getPolicyAllowedOperation(PolicyType.WIFI_OPERATOR, PolicyOperation.EDIT),
      visible: (selectedRows) => selectedRows?.length === 1,
      onClick: ([{ id }]) => {
        navigate({
          ...tenantBasePath,
          pathname: `${tenantBasePath.pathname}/` + getPolicyDetailsLink({
            type: PolicyType.WIFI_OPERATOR,
            oper: PolicyOperation.EDIT,
            policyId: id
          })
        })
      }
    }
  ]

  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)

  return (
    <>
      <PageHeader
        title={$t(
          { defaultMessage: 'Wi-Fi Operator ({count})' },
          { count: tableQuery.data?.totalCount }
        )}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          }
        ]}
        extra={filterByAccessForServicePolicyMutation([
          <TenantLink
            scopeKey={getScopeKeyByPolicy(PolicyType.WIFI_OPERATOR, PolicyOperation.CREATE)}
            rbacOpsIds={getPolicyAllowedOperation(PolicyType.WIFI_OPERATOR, PolicyOperation.CREATE)}
            to={getPolicyRoutePath({
              type: PolicyType.WIFI_OPERATOR,
              oper: PolicyOperation.CREATE })}>
            <Button
              type='primary'
              disabled={tableQuery.data?.totalCount! >= WIFI_OPERATOR_MAX_COUNT}>
              {$t({ defaultMessage: 'Add Wi-Fi Operator' })}
            </Button>
          </TenantLink>
        ])}
      />
      <Loader states={[tableQuery]}>
        <Table<WifiOperatorViewModel>
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
  const emptyResult: KeyValue<string, string>[] = []
  // eslint-disable-next-line max-len
  const { networkNameMap }: { networkNameMap: KeyValue<string, string>[] } = useWifiNetworkListQuery({
    params: { tenantId: params.tenantId },
    payload: {
      fields: ['name', 'id'],
      sortField: 'name',
      sortOrder: 'ASC',
      page: 1,
      pageSize: 2048
    }
  }, {
    selectFromResult: ({ data }: { data?: { data: WifiNetwork[] } }) => ({
      networkNameMap: data?.data
        ? data.data.map(network => ({ key: network.id, value: network.name }))
        : emptyResult
    })
  })

  const columns: TableProps<WifiOperatorViewModel>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      searchable: true,
      fixed: 'left',
      render: (_, row, __, highlightFn) => (
        <TenantLink
          to={getPolicyDetailsLink({
            type: PolicyType.WIFI_OPERATOR,
            oper: PolicyOperation.DETAIL,
            policyId: row.id!
          })}>
          {highlightFn(row.name || '--')}
        </TenantLink>
      )
    },
    {
      key: 'domainNames',
      title: $t({ defaultMessage: 'Domain' }),
      dataIndex: 'domainNames',
      sorter: true,
      render: (_, { domainNames }) => {
        return <SimpleListTooltip
          items={domainNames}
          displayText={domainNames.join(', ')} />
      }
    },
    {
      key: 'friendlyNames',
      title: $t({ defaultMessage: 'Operator Friendly Name' }),
      dataIndex: 'friendlyNames',
      align: 'center',
      sorter: true,
      render: (_, { friendlyNames }) => {
        if (!friendlyNames || friendlyNames.length === 0) return 0

        return <SimpleListTooltip
          items={friendlyNames.map(fn =>
            // eslint-disable-next-line max-len
            `[${$t(friendlyNameEnumOptions[FriendlyNameEnum[fn.language as FriendlyNameEnum]])}]: ${fn.name}` )}
          displayText={friendlyNames.length} />
      }
    },
    {
      key: 'wifiNetworkIds',
      title: $t({ defaultMessage: 'Networks' }),
      dataIndex: 'wifiNetworkIds',
      align: 'center',
      filterKey: 'wifiNetworkIds',
      filterable: networkNameMap,
      sorter: true,
      render: (_, { wifiNetworkIds }) => {
        if (!wifiNetworkIds || wifiNetworkIds.length === 0) return 0

        return <SimpleListTooltip
          items={networkNameMap.filter(kv => wifiNetworkIds.includes(kv.key)).map(kv => kv.value)}
          displayText={wifiNetworkIds.length} />
      }
    }
  ]

  return columns
}
