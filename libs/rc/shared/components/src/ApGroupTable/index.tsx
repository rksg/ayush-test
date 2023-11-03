import { useContext, useEffect } from 'react'

import { Space }                  from 'antd'
import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { ColumnType, Loader, StackedBarChart, Table, TableProps, cssStr, deviceStatusColors, showActionModal, Tooltip } from '@acx-ui/components'
import { useApGroupsListQuery, useDeleteApGroupsMutation }                                                              from '@acx-ui/rc/services'
import { ApGroupViewModel, FILTER, TableQuery, getFilters, transformDisplayNumber, usePollingTableQuery }               from '@acx-ui/rc/utils'
import { TenantLink, useTenantLink }                                                                                    from '@acx-ui/react-router-dom'
import { RequestPayload }                                                                                               from '@acx-ui/types'
import { filterByAccess }                                                                                               from '@acx-ui/user'

import { CountAndNamesTooltip } from '..'

import { ApGroupsTabContext } from './context'


export const defaultApGroupPayload = {
  fields: ['id', 'name', 'venueId', 'venueName', 'members', 'networks', 'clients'],
  searchTargetFields: ['name'],
  sortField: 'name',
  sortOrder: 'ASC',
  filters: { isDefault: [false] }
}


interface ApGroupTableProps extends Omit<TableProps<ApGroupViewModel>, 'columns'> {
  tableQuery?: TableQuery<ApGroupViewModel, RequestPayload<unknown>, unknown>
  enableActions?: boolean
  searchable?: boolean
  filterables?: { [key: string]: ColumnType['filterable'] }
}

export const ApGroupTable = (props : ApGroupTableProps) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const filters = getFilters(params) as FILTER
  const { searchable, filterables } = props
  const { setApGroupsCount } = useContext(ApGroupsTabContext)
  const apGroupListTableQuery = usePollingTableQuery({
    useQuery: useApGroupsListQuery,
    defaultPayload: {
      ...defaultApGroupPayload,
      filters: { ...filters, ...defaultApGroupPayload.filters }
    },
    search: {
      searchTargetFields: defaultApGroupPayload.searchTargetFields
    },
    option: { skip: Boolean(props.tableQuery) },
    enableSelectAllPagesData: ['id', 'name']
  })

  const tableQuery = props.tableQuery || apGroupListTableQuery
  const [ deleteApGroups ] = useDeleteApGroupsMutation()


  useEffect(() => {
    setApGroupsCount?.(tableQuery.data?.totalCount || 0)
  }, [tableQuery.data])


  const tableData = tableQuery?.data?.data ?? []
  const linkToEditAp = useTenantLink('/devices/apgroups')


  const showDeleteApGroups = async (rows: ApGroupViewModel[],
    tenantId?: string, callBack?: () => void) => {
    const numOfEntities = rows.length
    const entityValue = numOfEntities === 1 ? rows[0].name : undefined
    showActionModal({
      type: 'confirm',
      customContent: {
        action: 'DELETE',
        entityName: $t({ defaultMessage: 'AP Group' }),
        entityValue,
        numOfEntities
      },
      onOk: () => {
        deleteApGroups({ params: { tenantId }, payload: rows.map(row => row.id) })
          .then(callBack)
      }
    })
  }

  const columns: TableProps<ApGroupViewModel>['columns'] = [{
    key: 'name',
    title: $t({ defaultMessage: 'AP Group' }),
    dataIndex: 'name',
    sorter: true,
    fixed: 'left',
    searchable: searchable,
    render: (_, row: ApGroupViewModel, __, highlightFn) => (
      <TenantLink to={`/devices/wifi/apgroup/${row.id}/details/members`}>
        {searchable ? highlightFn(row.name || '--') : row.name}</TenantLink>
    )
  },
  ...(params.venueId ? [] : [{
    key: 'venueName',
    title: $t({ defaultMessage: 'Venue' }),
    dataIndex: 'venueName',
    filterKey: 'venueId',
    filterable: filterables ? filterables['venueId'] : false,
    sorter: true,
    render: (_: React.ReactNode, row: ApGroupViewModel) => (
      <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>
        {row.venueName}
      </TenantLink>
    )
  }]
  ),
  {
    key: 'members',
    title: $t({ defaultMessage: 'Members' }),
    dataIndex: 'members',
    align: 'center',
    //sorter: true,
    render: (_, row: ApGroupViewModel) => (
      <CountAndNamesTooltip data={row.members}
        linkUrl={`/devices/wifi/apgroup/${row.id}/details/members`}
      />
    )
  }, {
    key: 'networks',
    title: $t({ defaultMessage: 'Networks' }),
    dataIndex: 'networks',
    align: 'center',
    //sorter: true,
    render: (_, row: ApGroupViewModel) => (
      <CountAndNamesTooltip data={row.networks}
        linkUrl={`/devices/wifi/apgroup/${row.id}/details/networks`}
      />
    )
  }, {
    key: 'incidents',
    title: () => (<>
      { $t({ defaultMessage: 'Incidents' }) }
      <Table.SubTitle children={$t({ defaultMessage: 'Last 24 hours' })} />
    </>),
    dataIndex: 'incidents',
    align: 'center',
    sorter: false,
    render: (data, row: ApGroupViewModel) => {
      //TODO: Shows breakdown by severity - with a counter for each severity
      return (<Space direction='horizontal'>
        <StackedBarChart
          style={{ height: 10, width: 40 }}
          data={[{
            category: 'emptyStatus',
            series: [{
              name: '',
              value: 1
            }]
          }]}
          showTooltip={false}
          showLabels={false}
          showTotal={false}
          barColors={[cssStr(deviceStatusColors.empty)]}
        />
        <TenantLink to={`/devices/wifi/apgroup/${row.id}/details/analytics/incidents/overview`}>
          {data ? data: 0}
        </TenantLink>
      </Space>)
    }
  }, {
    key: 'clients',
    title: $t({ defaultMessage: 'Connected Clients' }),
    dataIndex: 'clients',
    align: 'center',
    sorter: true,
    render: (_, row: ApGroupViewModel) => {
      return transformDisplayNumber(row.clients)
    }
  }]

  const rowActions: TableProps<ApGroupViewModel>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    visible: (selectedRows) => selectedRows.length === 1,
    onClick: (selectedRows) => {
      //redirect to edit AP group page url
      navigate(`${linkToEditAp.pathname}/${selectedRows[0].id}/edit`, { replace: false })
    }
  }, {
    label: $t({ defaultMessage: 'Delete' }),
    onClick: async (selectedRows, clearSelection) => {
      showDeleteApGroups(selectedRows, params.tenantId, clearSelection)
    }
  }]


  const basePath = useTenantLink('/devices')
  const handleTableChange: TableProps<ApGroupViewModel>['onChange'] = (
    pagination, filters, sorter, extra
  ) => {
    const customSorter = Array.isArray(sorter)
      ? sorter[0] : sorter
    tableQuery.handleTableChange?.(pagination, filters, customSorter, extra)
  }
  return (
    <Loader states={[tableQuery]}>
      <Table<ApGroupViewModel>
        {...props}
        settingsId='ap-group-table'
        columns={columns}
        dataSource={tableData}
        getAllPagesData={tableQuery.getAllPagesData}
        rowKey='id'
        pagination={tableQuery.pagination}
        onChange={handleTableChange}
        onFilterChange={tableQuery.handleFilterChange}
        enableApiFilter={true}
        rowActions={filterByAccess(rowActions)}
        actions={props.enableActions ? filterByAccess([{
          label: $t({ defaultMessage: 'Add AP Group' }),
          onClick: () => {
            navigate({
              ...basePath,
              pathname: `${basePath.pathname}/apgroups/add`
            })
          }
        }]) : []}
        searchableWidth={260}
        filterableWidth={150}
      />
    </Loader>
  )
}