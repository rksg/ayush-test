import _           from 'lodash'
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
import { MdnsProxyForwardingRulesTable, SimpleListTooltip }                                from '@acx-ui/rc/components'
import { useDeleteMdnsProxyMutation, useGetEnhancedMdnsProxyListQuery, useGetVenuesQuery } from '@acx-ui/rc/services'
import {
  ServiceType,
  useTableQuery,
  getServiceDetailsLink,
  ServiceOperation,
  getServiceListRoutePath,
  getServiceRoutePath,
  MdnsProxyViewModel,
  MdnsProxyForwardingRule,
  FILTER,
  SEARCH
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess }                                          from '@acx-ui/user'

const defaultPayload = {
  fields: ['id', 'name', 'rules', 'venueIds'],
  searchString: '',
  filters: {}
}

export default function MdnsProxyTable () {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')
  const [ deleteFn ] = useDeleteMdnsProxyMutation()

  const tableQuery = useTableQuery({
    useQuery: useGetEnhancedMdnsProxyListQuery,
    defaultPayload
  })

  const rowActions: TableProps<MdnsProxyViewModel>['rowActions'] = [
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
            deleteFn({ params: { tenantId, serviceId: id } }).unwrap().then(clearSelection)
          }
        })
      }
    },
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: ([{ id }]) => {
        navigate({
          ...tenantBasePath,
          pathname: `${tenantBasePath.pathname}/` + getServiceDetailsLink({
            type: ServiceType.MDNS_PROXY,
            oper: ServiceOperation.EDIT,
            serviceId: id!
          })
        })
      }
    }
  ]

  const handleFilterChange = (filters: FILTER, search: SEARCH) => {
    const currentPayload = tableQuery.payload
    // eslint-disable-next-line max-len
    if (currentPayload.searchString === search.searchString && _.isEqual(currentPayload.filters, filters)) {
      return
    }
    tableQuery.setPayload({
      ...currentPayload,
      searchString: search.searchString ?? '',
      filters
    })
  }

  return (
    <>
      <PageHeader
        title={
          $t({ defaultMessage: 'mDNS Proxy ({count})' }, { count: tableQuery.data?.totalCount })
        }
        breadcrumb={[
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) }
        ]}
        extra={filterByAccess([
          // eslint-disable-next-line max-len
          <TenantLink to={getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.CREATE })}>
            <Button type='primary'>{$t({ defaultMessage: 'Add mDNS Proxy Service' })}</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[tableQuery]}>
        <Table<MdnsProxyViewModel>
          columns={useColumns()}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowActions={filterByAccess(rowActions)}
          rowSelection={{ type: 'radio' }}
          onFilterChange={handleFilterChange}
          enableApiFilter={true}
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
      sortOrder: 'ASC'
    }
  }, {
    selectFromResult: ({ data }) => ({
      venueNameMap: data?.data
        ? data.data.map(venue => ({ key: venue.id, value: venue.name }))
        : emptyVenues
    })
  })

  const columns: TableProps<MdnsProxyViewModel>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      fixed: 'left',
      render: function (data, row) {
        return (
          <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.MDNS_PROXY,
              oper: ServiceOperation.DETAIL,
              serviceId: row.id!
            })}>
            {data}
          </TenantLink>
        )
      }
    },
    {
      key: 'rules',
      title: $t({ defaultMessage: 'Forwarding Rules' }),
      dataIndex: 'rules',
      align: 'center',
      render: function (data) {
        const rules = data as MdnsProxyForwardingRule[]
        return (rules && rules.length > 0
          ? <Tooltip
            title={<MdnsProxyForwardingRulesTable readonly={true} rules={rules}/>}
            overlayStyle={{ maxWidth: 'none' }}
            children={rules.length}
          />
          : 0
        )
      }
    },
    {
      key: 'venueIds',
      title: $t({ defaultMessage: 'Venues' }),
      dataIndex: 'venueIds',
      align: 'center',
      filterKey: 'venueIds',
      filterable: venueNameMap,
      render: function (data, row) {
        if (!row.venueIds || row.venueIds.length === 0) return 0

        const venueIds = [...new Set(row.venueIds)]
        const tooltipItems = venueNameMap.filter(v => venueIds!.includes(v.key)).map(v => v.value)
        return <SimpleListTooltip items={tooltipItems} displayText={venueIds.length} />
      }
    }
  ]

  return columns
}
