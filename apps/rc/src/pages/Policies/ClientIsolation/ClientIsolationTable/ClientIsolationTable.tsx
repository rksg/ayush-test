import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Button, PageHeader, Table, TableProps, Loader, showActionModal } from '@acx-ui/components'
import { SimpleListTooltip }                                              from '@acx-ui/rc/components'
import {
  useDeleteClientIsolationMutation,
  useGetEnhancedClientIsolationListQuery,
  useGetVenuesQuery
} from '@acx-ui/rc/services'
import {
  PolicyType,
  useTableQuery,
  getPolicyDetailsLink,
  PolicyOperation,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  ClientIsolationViewModel,
  FILTER,
  SEARCH
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess }                                          from '@acx-ui/user'

const defaultPayload = {
  fields: ['id', 'name', 'tenantId', 'clientEntries', 'venueIds', 'description'],
  searchString: '',
  filters: {}
}

export default function ClientIsolationTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const tenantBasePath: Path = useTenantLink('')
  const [ deleteFn ] = useDeleteClientIsolationMutation()

  const tableQuery = useTableQuery<ClientIsolationViewModel>({
    useQuery: useGetEnhancedClientIsolationListQuery,
    defaultPayload
  })

  const rowActions: TableProps<ClientIsolationViewModel>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: ([{ id, name }], clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Policy' }),
            entityValue: name
          },
          onOk: () => {
            deleteFn({ params: { ...params, policyId: id } }).then(clearSelection)
          }
        })
      }
    },
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: ([{ id }]) => {
        navigate({
          ...tenantBasePath,
          pathname: `${tenantBasePath.pathname}/` + getPolicyDetailsLink({
            type: PolicyType.CLIENT_ISOLATION,
            oper: PolicyOperation.EDIT,
            policyId: id!
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
      searchString: search.searchString,
      filters
    })
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Client Isolation' })}
        breadcrumb={[
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          }
        ]}
        extra={filterByAccess([
          // eslint-disable-next-line max-len
          <TenantLink to={getPolicyRoutePath({ type: PolicyType.CLIENT_ISOLATION, oper: PolicyOperation.CREATE })}>
            <Button type='primary'>{$t({ defaultMessage: 'Add Client Isolation Pofile' })}</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[tableQuery]}>
        <Table<ClientIsolationViewModel>
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

  const columns: TableProps<ClientIsolationViewModel>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      render: function (data, row) {
        return (
          <TenantLink
            to={getPolicyDetailsLink({
              type: PolicyType.CLIENT_ISOLATION,
              oper: PolicyOperation.DETAIL,
              policyId: row.id!
            })}>
            {data}
          </TenantLink>
        )
      }
    },
    {
      key: 'description',
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'description'
    },
    {
      key: 'clientEntries',
      title: $t({ defaultMessage: 'Client Entries' }),
      dataIndex: 'clientEntries',
      align: 'center',
      render: function (data) {
        return data
          ? <SimpleListTooltip
            items={data as string[]}
            displayText={(data as string[]).length}
            title={$t({ defaultMessage: 'MAC Address' })}
          />
          : 0
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

        // eslint-disable-next-line max-len
        const tooltipItems = venueNameMap.filter(v => row.venueIds!.includes(v.key)).map(v => v.value)
        return <SimpleListTooltip items={tooltipItems} displayText={row.venueIds.length} />
      }
    }
  ]

  return columns
}
