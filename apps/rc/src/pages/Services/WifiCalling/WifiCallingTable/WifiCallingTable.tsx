import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, PageHeader, Table, TableProps, Loader }                       from '@acx-ui/components'
import { Features, useIsSplitOn }                                              from '@acx-ui/feature-toggle'
import { defaultNetworkPayload, defaultRbacNetworkPayload, SimpleListTooltip } from '@acx-ui/rc/components'
import {
  doProfileDelete,
  useDeleteWifiCallingServicesMutation,
  useGetEnhancedWifiCallingServiceListQuery,
  useNetworkListQuery,
  useWifiNetworkListQuery
} from '@acx-ui/rc/services'
import {
  getServiceAllowedOperation,
  ServiceType,
  useTableQuery,
  getServiceDetailsLink,
  ServiceOperation,
  getServiceListRoutePath,
  getServiceRoutePath,
  Network,
  AclOptionType,
  WifiCallingSetting,
  QosPriorityEnum,
  wifiCallingQosPriorityLabelMapping,
  filterByAccessForServicePolicyMutation,
  getScopeKeyByService
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

const defaultPayload = {
  searchString: '',
  fields: [
    'id',
    'name',
    'qosPriority',
    'tenantId',
    'epdgs',
    'networkIds'
  ]
}

export default function WifiCallingTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const tenantBasePath: Path = useTenantLink('')
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const [ deleteFn ] = useDeleteWifiCallingServicesMutation()
  const WIFICALLING_LIMIT_NUMBER = 5

  const [networkFilterOptions, setNetworkFilterOptions] = useState([] as AclOptionType[])
  const [networkIds, setNetworkIds] = useState([] as string[])

  const tableQuery = useTableQuery({
    useQuery: useGetEnhancedWifiCallingServiceListQuery,
    defaultPayload,
    enableRbac
  })

  const networkTableQuery = useTableQuery<Network>({
    useQuery: isWifiRbacEnabled? useWifiNetworkListQuery : useNetworkListQuery,
    defaultPayload: {
      ...(isWifiRbacEnabled? defaultRbacNetworkPayload: defaultNetworkPayload),
      filters: {
        id: [...networkIds]
      }
    }
  })

  const doDelete = (selectedRows: WifiCallingSetting[], callback: () => void) => {
    doProfileDelete(
      selectedRows,
      $t({ defaultMessage: 'Service' }),
      selectedRows[0].name,
      [{ fieldName: 'networkIds', fieldText: $t({ defaultMessage: 'Network' }) }],
      async () => deleteFn({
        params,
        payload: selectedRows.map(row => row.id),
        enableRbac
      }).then(callback)
    )
  }

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

  const rowActions: TableProps<WifiCallingSetting>['rowActions'] = [
    {
      rbacOpsIds: getServiceAllowedOperation(ServiceType.WIFI_CALLING, ServiceOperation.DELETE),
      scopeKey: getScopeKeyByService(ServiceType.WIFI_CALLING, ServiceOperation.DELETE),
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        doDelete(rows, clearSelection)
      }
    },
    {
      rbacOpsIds: getServiceAllowedOperation(ServiceType.WIFI_CALLING, ServiceOperation.EDIT),
      scopeKey: getScopeKeyByService(ServiceType.WIFI_CALLING, ServiceOperation.EDIT),
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedItems => selectedItems.length === 1),
      onClick: ([{ id }]) => {
        navigate({
          ...tenantBasePath,
          pathname: `${tenantBasePath.pathname}/` + getServiceDetailsLink({
            type: ServiceType.WIFI_CALLING,
            oper: ServiceOperation.EDIT,
            serviceId: id!
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
          $t({ defaultMessage: 'Wi-Fi Calling ({count})' },
            { count: tableQuery.data?.totalCount })
        }
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) }
        ]}
        extra={filterByAccessForServicePolicyMutation([
          <TenantLink
            // eslint-disable-next-line max-len
            to={getServiceRoutePath({ type: ServiceType.WIFI_CALLING, oper: ServiceOperation.CREATE })}
            // eslint-disable-next-line max-len
            rbacOpsIds={getServiceAllowedOperation(ServiceType.WIFI_CALLING, ServiceOperation.CREATE)}
            scopeKey={getScopeKeyByService(ServiceType.WIFI_CALLING, ServiceOperation.CREATE)}
          >
            <Button
              disabled={tableQuery.data?.totalCount
                ? tableQuery.data?.totalCount >= WIFICALLING_LIMIT_NUMBER
                : false}
              type='primary'>
              {$t({ defaultMessage: 'Add Wi-Fi Calling Service' })}
            </Button>
          </TenantLink>
        ])}
      />
      <Loader states={[tableQuery]}>
        <Table<WifiCallingSetting>
          enableApiFilter={true}
          columns={useColumns(networkFilterOptions)}
          dataSource={tableQuery?.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          rowKey='id'
          rowActions={allowedRowActions}
          rowSelection={allowedRowActions.length > 0 && { type: 'checkbox' }}
        />
      </Loader>
    </>
  )
}

function useColumns (networkFilterOptions: AclOptionType[]) {
  const { $t } = useIntl()

  const columns: TableProps<WifiCallingSetting>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      searchable: true,
      sorter: true,
      defaultSortOrder: 'ascend',
      fixed: 'left',
      render: function (_, row) {
        return (
          <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.WIFI_CALLING,
              oper: ServiceOperation.DETAIL,
              serviceId: row.id!
            })}>
            {row.name}
          </TenantLink>
        )
      }
    },
    {
      key: 'qosPriority',
      title: $t({ defaultMessage: 'QoS Priority' }),
      dataIndex: 'qosPriority',
      sorter: true,
      render: (_, value) => {
        return $t(wifiCallingQosPriorityLabelMapping[value.qosPriority as QosPriorityEnum])
      }
    },
    {
      key: 'ePDGs',
      title: $t({ defaultMessage: 'ePDG' }),
      dataIndex: 'ePDGs',
      sorter: true,
      sortDirections: ['descend', 'ascend', 'descend'],
      align: 'center',
      render: (_, row) => row.epdgs?.length
    },
    {
      key: 'networkIds',
      title: $t({ defaultMessage: 'Networks' }),
      dataIndex: 'networkIds',
      filterable: networkFilterOptions,
      align: 'center',
      sorter: true,
      sortDirections: ['descend', 'ascend', 'descend'],
      render: (_, row) => {
        if (!row.networkIds || row.networkIds.length === 0) return 0
        const networkIds = row.networkIds
        // eslint-disable-next-line max-len
        const tooltipItems = networkFilterOptions.filter(v => networkIds!.includes(v.key)).map(v => v.value)
        return <SimpleListTooltip items={tooltipItems} displayText={networkIds.length} />
      }
    }
  ]

  return columns
}
