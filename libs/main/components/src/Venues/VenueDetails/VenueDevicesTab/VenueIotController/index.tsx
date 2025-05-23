import { Badge }   from 'antd'
import { useIntl } from 'react-intl'

import { ColumnType, Loader, Table, TableProps }                                                              from '@acx-ui/components'
import { useRwgActions }                                                                                      from '@acx-ui/rc/components'
import { useGetVenuesQuery, useRwgListQuery }                                                                 from '@acx-ui/rc/services'
import { defaultSort, getRwgStatus, RWGRow, seriesMappingRWG, sortProp, transformDisplayText, useTableQuery } from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useParams, useTenantLink }                                                  from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess, useUserProfileContext }                                                   from '@acx-ui/user'


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
        return row?.isCluster ? highlightFn(row.name) : (
          <TenantLink
            to={
              row?.isNode
                // eslint-disable-next-line max-len
                ? `/ruckus-wan-gateway/${row.venueId}/${row.clusterId}/gateway-details/overview/${row.rwgId}`
                : `/ruckus-wan-gateway/${row.venueId}/${row.rwgId}/gateway-details/overview`}>
            {highlightFn(row.name)}</TenantLink>
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
      sorter: false,
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
      sorter: false,
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
      title: $t({ defaultMessage: 'FQDN / IP' }),
      dataIndex: 'hostname',
      key: 'hostname',
      filterMultiple: false,
      sorter: { compare: sortProp('hostname', defaultSort) },
      render: function (_, row) {
        return !row.isCluster ? row.hostname : ''
      }
    }
  ]

  return columns
}

export function VenueIotController () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { tenantId, venueId } = useParams()
  const rwgActions = useRwgActions()
  const { isCustomRole } = useUserProfileContext()

  const rwgPayload = {
    filters: {}
  }

  const settingsId = 'venue-rwg-table'
  const tableQuery = useTableQuery({
    useQuery: useRwgListQuery,
    defaultPayload: rwgPayload,
    pagination: { settingsId },
    search: {
      searchTargetFields: ['name']
    }
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

  const basePath = useTenantLink(`/ruckus-wan-gateway/${venueId}/`)

  const rowActions: TableProps<RWGRow>['rowActions'] = [{
    visible: (selectedRows) => selectedRows.length === 1 && !selectedRows[0].isCluster,
    label: $t({ defaultMessage: 'Edit' }),
    onClick: (selectedRows) => {
      navigate({ ...basePath,
        pathname: `${basePath.pathname}/${selectedRows[0].rwgId}/edit`
      },
      { replace: false })
    }
  },
  {
    visible: (selectedRows) => selectedRows.length === 1,
    label: $t({ defaultMessage: 'Configure' }),
    onClick: (selectedRows) => {
      window.open('https://' + (selectedRows[0]?.hostname)?.toString() + '/admin',
        '_blank')
    }
  },
  {
    label: $t({ defaultMessage: 'Delete' }),
    onClick: (rows, clearSelection) => {
      rwgActions.deleteGateways(rows, tenantId, clearSelection)
    }
  }]

  const handleTableChange: TableProps<RWGRow>['onChange'] = (
    pagination, filters, sorter, extra
  ) => {
    tableQuery.setPayload({
      ...tableQuery.payload
    })
    tableQuery.handleTableChange?.(pagination, filters, sorter, extra)
  }

  const rowSelection = () => {
    return {
      getCheckboxProps: (record: RWGRow) => ({
        disabled: !!record.isNode
      })
    }
  }


  return (
    <Loader states={[
      tableQuery
    ]}>
      <Table
        settingsId={settingsId}
        columns={columns}
        dataSource={tableQuery?.data?.data}
        pagination={{ total: tableQuery?.data?.totalCount }}
        onFilterChange={tableQuery.handleFilterChange}
        rowKey='rowId'
        rowActions={isCustomRole ? [] : filterByAccess(rowActions)}
        rowSelection={hasAccess() && { ...rowSelection() }}
        onChange={handleTableChange}
      />
    </Loader>
  )
}
