import { useIntl } from 'react-intl'

import { PageHeader, TableProps, Loader, Table, Button } from '@acx-ui/components'
import {
  SimpleListTooltip,
  friendlyNameEnumOptions,
  FriendlyNameEnum,
  WIFI_OPERATOR_MAX_COUNT
} from '@acx-ui/rc/components'
import {
  doProfileDelete,
  useDeleteWifiOperatorMutation,
  useGetWifiOperatorListQuery,
  useWifiNetworkListQuery
} from '@acx-ui/rc/services'
import {
  KeyValue,
  PolicyOperation,
  PolicyType,
  WifiNetwork,
  WifiOperatorViewModel,
  getPolicyDetailsLink,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  useTableQuery
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess }                               from '@acx-ui/user'



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
      $t({ defaultMessage: 'Policy' }),
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
      onClick: (selectedRows: WifiOperatorViewModel[], clearSelection) => {
        doDelete(selectedRows, clearSelection)
      }
    },
    {
      label: $t({ defaultMessage: 'Edit' }),
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
        extra={filterByAccess([
          <TenantLink to={getPolicyRoutePath({
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
          rowActions={filterByAccess(rowActions)}
          rowSelection={hasAccess() && { type: 'radio' }}
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
      searchable: true,
      fixed: 'left',
      render: (_, row) => (
        <TenantLink
          to={getPolicyDetailsLink({
            type: PolicyType.WIFI_OPERATOR,
            oper: PolicyOperation.DETAIL,
            policyId: row.id!
          })}>
          {row.name}
        </TenantLink>
      )
    },
    {
      key: 'domainNames',
      title: $t({ defaultMessage: 'Domain' }),
      dataIndex: 'domainNames',
      sorter: true,
      render: (_, { domainNames }) => domainNames.join(', ')
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
            `[${$t(friendlyNameEnumOptions[FriendlyNameEnum[fn.language as FriendlyNameEnum]])}]
            : ${fn.name}` )}
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