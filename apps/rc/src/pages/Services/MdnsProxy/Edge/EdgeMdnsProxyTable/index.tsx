import { groupBy } from 'lodash'
import { useIntl } from 'react-intl'

import {
  Button,
  PageHeader,
  Table,
  TableProps,
  Loader,
  showActionModal,
  Tooltip
} from '@acx-ui/components'
import { MdnsProxyForwardingRulesTable, SimpleListTooltip }                                        from '@acx-ui/rc/components'
import { useDeleteEdgeMdnsProxyMutation, useGetEdgeMdnsProxyViewDataListQuery, useGetVenuesQuery } from '@acx-ui/rc/services'
import {
  ServiceType,
  getServiceDetailsLink,
  ServiceOperation,
  getServiceListRoutePath,
  getServiceRoutePath,
  getScopeKeyByService,
  filterByAccessForServicePolicyMutation,
  useTableQuery,
  EdgeMdnsProxyViewData
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

const settingsId = 'services-edge-mdns-proxy-table'
export function EdgeMdnsProxyTable () {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')
  const [ deleteFn, { isLoading: isDeleting } ] = useDeleteEdgeMdnsProxyMutation()

  const tableQuery = useTableQuery({
    useQuery: useGetEdgeMdnsProxyViewDataListQuery,
    defaultPayload: {
      fields: ['id', 'name', 'forwardingProxyRules', 'venueInfo'],
      filters: {}
    },
    sorter: {
      sortField: 'name',
      sortOrder: 'ASC'
    },
    search: {
      searchTargetFields: ['name']
    },
    pagination: { settingsId }
  })

  const rowActions: TableProps<EdgeMdnsProxyViewData>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: ([{ id }]) => {
        navigate({
          ...tenantBasePath,
          pathname: `${tenantBasePath.pathname}/` + getServiceDetailsLink({
            type: ServiceType.EDGE_MDNS_PROXY,
            oper: ServiceOperation.EDIT,
            serviceId: id!
          })
        })
      },
      scopeKey: getScopeKeyByService(ServiceType.EDGE_MDNS_PROXY, ServiceOperation.EDIT)
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: ([{ id, name }], clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Service' }),
            entityValue: name
          },
          onOk: () => {
            deleteFn({
              params: { tenantId, serviceId: id }
            }).unwrap().then(clearSelection)
          }
        })
      },
      scopeKey: getScopeKeyByService(ServiceType.EDGE_MDNS_PROXY, ServiceOperation.DELETE)
    }
  ]

  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)

  return (
    <>
      <PageHeader
        title={
          $t({ defaultMessage: 'mDNS Proxy for RUCKUS Edge ({count})' },
            { count: tableQuery.data?.totalCount })
        }
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) }
        ]}
        extra={filterByAccessForServicePolicyMutation([
          <TenantLink
            scopeKey={getScopeKeyByService(ServiceType.EDGE_MDNS_PROXY, ServiceOperation.CREATE)}
            // eslint-disable-next-line max-len
            to={getServiceRoutePath({ type: ServiceType.EDGE_MDNS_PROXY, oper: ServiceOperation.CREATE })}
          >
            <Button type='primary'>
              {$t({ defaultMessage: 'Add mDNS Proxy Service' })}</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[tableQuery, { isLoading: false, isFetching: isDeleting }]}>
        <Table
          rowKey='id'
          settingsId={settingsId}
          columns={useColumns()}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          rowActions={allowedRowActions}
          rowSelection={(allowedRowActions.length > 0) && { type: 'radio' }}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter
        />
      </Loader>
    </>
  )
}

function useColumns () {
  const { $t } = useIntl()
  const params = useParams()
  const emptyVenues: { key: string, value: string }[] = []
  const { venueNameMap } = useGetVenuesQuery({
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
      venueNameMap: data?.data
        ? data.data.map(venue => ({ key: venue.id, value: venue.name }))
        : emptyVenues
    })
  })

  const columns: TableProps<EdgeMdnsProxyViewData>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      fixed: 'left',
      render: function (_, row) {
        return (
          <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.EDGE_MDNS_PROXY,
              oper: ServiceOperation.DETAIL,
              serviceId: row.id!
            })}>
            {row.name}
          </TenantLink>
        )
      }
    },
    {
      key: 'forwardingProxyRules',
      title: $t({ defaultMessage: 'Forwarding Rules' }),
      dataIndex: 'forwardingProxyRules',
      align: 'center',
      sorter: true,
      render: function (_, { forwardingProxyRules }) {
        return forwardingProxyRules?.length
          ? <Tooltip
            overlayInnerStyle={{ minWidth: '380px' }}
            title={<MdnsProxyForwardingRulesTable
              readonly
              tableType={'compactBordered'}
              rules={forwardingProxyRules}
            />}
            children={forwardingProxyRules.length}
            dottedUnderline
          />
          : 0
      }
    },
    {
      key: 'venueInfo',
      title: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }),
      dataIndex: 'venueInfo',
      align: 'center',
      filterKey: 'venueInfo.venueId',
      filterable: venueNameMap,
      sorter: true,
      render: function (_, row) {
        if (!row.venueInfo || row.venueInfo.length === 0) return 0

        const venueIds = Object.keys(groupBy(row.venueInfo, 'venueId'))
        const tooltipItems = venueNameMap.filter(v => venueIds!.includes(v.key)).map(v => v.value)
        return <SimpleListTooltip items={tooltipItems} displayText={venueIds.length} />
      }
    }
  ]

  return columns
}