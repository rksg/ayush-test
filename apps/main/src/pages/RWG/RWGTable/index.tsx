import { Badge }   from 'antd'
import { useIntl } from 'react-intl'

import { Button, ColumnType, Loader, PageHeader, Table, TableProps }                                                          from '@acx-ui/components'
import { useGetVenuesQuery, useRwgListQuery }                                                                                 from '@acx-ui/rc/services'
import { defaultSort, FILTER, getRwgStatus, RWGRow, SEARCH, seriesMappingRWG, sortProp, transformDisplayText, useTableQuery } from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useParams }                                                                                 from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess }                                                                                          from '@acx-ui/user'

import { useRwgActions } from '../useRwgActions'


function useColumns (
  searchable?: boolean,
  filterables?: { [key: string]: ColumnType['filterable'] }
) {
  const { $t } = useIntl()

  const columns: TableProps<RWGRow>['columns'] = [
    {
      title: $t({ defaultMessage: 'Gateway' }),
      key: 'name',
      dataIndex: 'name',
      sorter: { compare: sortProp('name', defaultSort) },
      fixed: 'left',
      searchable: searchable,
      defaultSortOrder: 'ascend',
      render: function (_, row, __, highlightFn) {
        return row?.isCluster ? (searchable ? highlightFn(row.name) : row.name) : (
          <TenantLink
            to={
              row?.isNode
                // eslint-disable-next-line max-len
                ? `/ruckus-wan-gateway/${row.venueId}/${row.clusterId}/gateway-details/overview/${row.rwgId}`
                : `/ruckus-wan-gateway/${row.venueId}/${row.rwgId}/gateway-details/overview`}>
            {searchable ? highlightFn(row.name) : row.name}</TenantLink>
        )
      }
    },{
      title: $t({ defaultMessage: 'Cluster Status' }),
      dataIndex: 'status',
      key: 'status',
      filterMultiple: false,
      filterValueNullable: true,
      filterKey: 'status',
      filterable: filterables ? filterables['status'] : false,
      sorter: { compare: sortProp('status', defaultSort) },
      render: function (_, row) {
        const { name, color } = getRwgStatus(row.status)

        return row.isCluster ?
          (
            <span>
              <Badge
                color={`var(${color})`}
                text={transformDisplayText(name)}
              />
            </span>
          ) : <></>
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
        const { name, color } = getRwgStatus(row.status)
        return !row.isCluster ? (
          <span>
            <Badge
              color={`var(${color})`}
              text={transformDisplayText(name)}
            />
          </span>
        ) : <></>
      }
    },
    {
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      dataIndex: 'venueName',
      key: 'venueName',
      filterMultiple: false,
      filterValueNullable: true,
      filterKey: 'venueName',
      filterable: filterables ? filterables['venueName'] : false,
      sorter: { compare: sortProp('venueName', defaultSort) },
      render: function (_, row) {
        return !row.isCluster ? (
          <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>
            {row.venueName}
          </TenantLink>
        ) : <></>
      }
    },
    {
      title: $t({ defaultMessage: 'FQDN / IP' }),
      dataIndex: 'hostname',
      key: 'hostname',
      filterMultiple: false,
      sorter: false,
      render: function (_, row) {
        return !row.isCluster ? row.hostname : ''
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

  const columns = useColumns(true, { venueName: venueFilterOptions,
    status: seriesMappingRWG().map(({ key, name }) => {
      return {
        key,
        value: name
      }
    }) })

  const rowActions: TableProps<RWGRow>['rowActions'] = [{
    visible: (selectedRows) => selectedRows.length === 1 && !selectedRows[0].isCluster,
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

  const rowSelection = () => {
    return {
      getCheckboxProps: (record: RWGRow) => ({
        disabled: !!record.isNode
      })
    }
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
          rowKey='rowId'
          rowActions={filterByAccess(rowActions)}
          rowSelection={hasAccess() && { ...rowSelection() }}
        />
      </Loader>
    </>
  )
}
