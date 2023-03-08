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
  ClientIsolationViewModel
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess }                                          from '@acx-ui/user'

const defaultPayload = {
  searchString: '',
  filters: {},
  fields: ['id', 'name', 'tenantId', 'clientEntries', 'venueIds']
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

  return (
    <>
      <PageHeader
        title={
          $t({
            defaultMessage: 'Client Isolation'
          })
        }
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

  const { data: venues } = useGetVenuesQuery({
    params: { tenantId: params.tenantId },
    payload: {
      fields: ['name', 'id'],
      sortField: 'name',
      sortOrder: 'ASC'
    }
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
          ? <SimpleListTooltip items={data as string[]} displayText={(data as string[]).length} />
          : 0
      }
    },
    {
      key: 'venueIds',
      title: $t({ defaultMessage: 'Venues' }),
      dataIndex: 'venueIds',
      align: 'center',
      filterKey: 'venueIds',
      filterable: venues?.data?.map(venue => ({ key: venue.id, value: venue.name })) ?? [],
      render: function (data) {
        // return data ? (data as Array<string>).length : 0

        if (!data) return 0

        const venueIds = data as string[]

        if (!venues?.data) return venueIds.length

        const venueTooltipItems = venues.data.filter(v => venueIds.includes(v.id)).map(v => v.name)
        return <SimpleListTooltip items={venueTooltipItems} displayText={venueIds.length} />
      }
    }
  ]

  return columns
}
