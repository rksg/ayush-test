import { Badge }   from 'antd'
import { useIntl } from 'react-intl'

import { Button, ColumnType, Loader, PageHeader, showActionModal, Table, TableProps }      from '@acx-ui/components'
import { useDeleteGatewayMutation, useGetVenuesQuery, useRwgListQuery }                    from '@acx-ui/rc/services'
import { defaultSort, FILTER, RWG, SEARCH, sortProp, transformDisplayText, useTableQuery } from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useParams }                                              from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess }                                                       from '@acx-ui/user'



function useColumns (
  searchable?: boolean,
  filterables?: { [key: string]: ColumnType['filterable'] }
) {
  const { $t } = useIntl()

  const columns: TableProps<RWG>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      fixed: 'left',
      searchable: searchable,
      defaultSortOrder: 'ascend',
      render: function (_, row, __, highlightFn) {
        return (
          <TenantLink to={'/'}>
            {searchable ? highlightFn(row.name) : row.name}</TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status',
      key: 'status',
      filterMultiple: false,
      filterValueNullable: true,
      filterKey: 'status',
      filterable: filterables ? filterables['status'] : false,
      sorter: { compare: sortProp('status', defaultSort) },
      render: function (_, row) {
        const iconColor = (row.status === 'Operational')
          ? '--acx-semantics-green-50'
          : '--acx-neutrals-50'
        const statusText = row.status === 'Operational'
          ? $t({ defaultMessage: 'Operational' })
          : $t({ defaultMessage: 'Offline' })

        return (
          <span>
            <Badge
              color={`var(${iconColor})`}
              text={transformDisplayText(statusText)}
            />
          </span>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Hostname' }),
      dataIndex: 'loginUrl',
      key: 'loginUrl',
      filterMultiple: false,
      sorter: false,
      render: function (_, row) {
        return row.loginUrl
      }
    },
    {
      title: $t({ defaultMessage: 'Venue' }),
      dataIndex: 'venueName',
      key: 'venueName',
      filterMultiple: false,
      filterValueNullable: true,
      filterKey: 'venueName',
      filterable: filterables ? filterables['venueName'] : false,
      sorter: { compare: sortProp('venueName', defaultSort) },
      render: function (_, row) {
        return (
          <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>
            {row.venueName}
          </TenantLink>
        )
      }
    }
  ]

  return columns
}

export function RWGTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { tenantId } = useParams()

  const rwgPayload = {
    fields: [
      'check-all',
      'name',
      'status',
      'id'
    ],
    searchTargetFields: ['name'],
    filters: {},
    sortField: 'name',
    sortOrder: 'ASC'
  }

  const tableQuery = useTableQuery({
    useQuery: useRwgListQuery,
    defaultPayload: rwgPayload,
    search: {
      searchTargetFields: rwgPayload.searchTargetFields as string[]
    },
    enableSelectAllPagesData: ['id', 'name']
  })


  const { venueFilterOptions } = useGetVenuesQuery({ params: useParams(), payload: {
    fields: ['name', 'id'],
    sortField: 'name',
    sortOrder: 'ASC',
    page: 1,
    pageSize: 2048
  } }, {
    selectFromResult: ({ data }) => ({
      venueFilterOptions: data?.data?.map(v =>({
        key: v.name,
        value: v.name
      })) || true
    })
  })

  const columns = useColumns(true, { venueName: venueFilterOptions, status: [{
    key: 'Operational',
    value: 'Operational'
  }, {
    key: 'OFFLINE',
    value: 'Offline'
  }] })

  const [
    deleteGateway,
    { isLoading: isDeleteGatewayUpdating }
  ] = useDeleteGatewayMutation()

  const rowActions: TableProps<RWG>['rowActions'] = [{
    visible: (selectedRows) => selectedRows.length === 1,
    label: $t({ defaultMessage: 'Edit' }),
    onClick: (selectedRows) => {
      navigate(`${selectedRows[0].id}/edit`, { replace: false })
    }
  },
  {
    label: $t({ defaultMessage: 'Delete' }),
    onClick: (rows, clearSelection) => {
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: rows.length === 1? $t({ defaultMessage: 'Gateway' })
            : $t({ defaultMessage: 'Gateways' }),
          entityValue: rows.length === 1 ? rows[0].name : undefined,
          numOfEntities: rows.length,
          confirmationText: 'Delete'
        },
        onOk: () => { rows.length === 1 ?
          deleteGateway({ params: { tenantId, rwgId: rows[0].id } })
            .then(clearSelection) :
          deleteGateway({ params: { tenantId }, payload: rows.map(item => item.id) })
            .then(clearSelection)
        }
      })
    }
  }]

  const handleFilterChange = (customFilters: FILTER, customSearch: SEARCH) => {
    const payload = { ...tableQuery.payload, filters: { name: customSearch?.searchString ?? '' } }
    tableQuery.setPayload(payload)
  }


  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'RUCKUS WAN Gateway' })}
        extra={filterByAccess([
          <TenantLink to='/ruckus-wan-gateway/add'>
            <Button type='primary'>{ $t({ defaultMessage: 'Add Gateway' }) }</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[
        tableQuery,
        { isLoading: false, isFetching: isDeleteGatewayUpdating }
      ]}>
        <Table
          settingsId='rgw-table'
          columns={columns}
          dataSource={tableQuery?.data?.data}
          onFilterChange={handleFilterChange}
          rowKey='id'
          rowActions={filterByAccess(rowActions)}
          rowSelection={hasAccess() && { type: 'checkbox' }}
        />
      </Loader>
    </>
  )
}
