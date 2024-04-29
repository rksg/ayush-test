import { Badge }   from 'antd'
import { useIntl } from 'react-intl'

import { Button, ColumnType, Loader, PageHeader, Table, TableProps }                       from '@acx-ui/components'
import { useGetVenuesQuery, useRwgListQuery }                                              from '@acx-ui/rc/services'
import { defaultSort, FILTER, RWG, SEARCH, sortProp, transformDisplayText, useTableQuery } from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useParams }                                              from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess }                                                       from '@acx-ui/user'

import { useRwgActions } from '../useRwgActions'


function useColumns (
  searchable?: boolean,
  filterables?: { [key: string]: ColumnType['filterable'] }
) {
  const { $t } = useIntl()

  const columns: TableProps<RWG>['columns'] = [
    {
      title: $t({ defaultMessage: 'Gateway' }),
      key: 'name',
      dataIndex: 'name',
      sorter: { compare: sortProp('name', defaultSort) },
      fixed: 'left',
      searchable: searchable,
      defaultSortOrder: 'ascend',
      render: function (_, row, __, highlightFn) {
        return (
          <TenantLink
            to={`/ruckus-wan-gateway/${row.venueId}/${row.rwgId}/gateway-details/overview`}>
            {searchable ? highlightFn(row.name) : row.name}</TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Gateway Status' }),
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
    },
    {
      title: $t({ defaultMessage: 'FQDN / IP' }),
      dataIndex: 'hostname',
      key: 'hostname',
      filterMultiple: false,
      sorter: false,
      render: function (_, row) {
        return row.hostname
      }
    }
  ]

  return columns
}

export function RWGTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { tenantId } = useParams()
  const rwgActions = useRwgActions()

  const rwgPayload = {
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'RwgHostname'
  }

  const tableQuery = useTableQuery({
    useQuery: useRwgListQuery,
    defaultPayload: rwgPayload,
    search: {
      searchTargetFields: ['name']
    },
    enableSelectAllPagesData: ['rwgId', 'name']
  })


  const { venueFilterOptions } = useGetVenuesQuery({ params: useParams(), payload: {
    fields: ['name', 'rwgId'],
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

  const rowActions: TableProps<RWG>['rowActions'] = [{
    visible: (selectedRows) => selectedRows.length === 1,
    label: $t({ defaultMessage: 'Edit' }),
    onClick: (selectedRows) => {
      navigate(`${selectedRows[0].venueId}/${selectedRows[0].rwgId}/edit`, { replace: false })
    }
  },
  {
    label: $t({ defaultMessage: 'Delete' }),
    onClick: (rows, clearSelection) => {
      rwgActions.deleteGateways(rows, tenantId, clearSelection)
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
        tableQuery
      ]}>
        <Table
          settingsId='rgw-table'
          columns={columns}
          dataSource={tableQuery?.data?.data}
          onFilterChange={handleFilterChange}
          rowKey='rwgId'
          rowActions={filterByAccess(rowActions)}
          rowSelection={hasAccess() && { type: 'checkbox' }}
        />
      </Loader>
    </>
  )
}
