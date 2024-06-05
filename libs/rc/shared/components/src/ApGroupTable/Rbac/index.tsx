import { useContext, useEffect, useState } from 'react'

import { Space }                               from 'antd'
import _                                       from 'lodash'
import { IntlShape, useIntl }                  from 'react-intl'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { IncidentsBySeverityData, useIncidentToggles, useLazyIncidentsListBySeverityQuery }        from '@acx-ui/analytics/components'
import { Loader, StackedBarChart, Table, TableProps, cssStr, deviceStatusColors, showActionModal } from '@acx-ui/components'
import { useDeleteApGroupsMutation, useNewApGroupsViewModelListQuery }                             from '@acx-ui/rc/services'
import {
  CountAndNames,
  FILTER,
  NewApGroupViewModelExtended,
  getFilters,
  transformDisplayNumber,
  usePollingTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink, useTenantLink }     from '@acx-ui/react-router-dom'
import { filterByAccess }                from '@acx-ui/user'
import { DateRange, getDateRangeFilter } from '@acx-ui/utils'

import { ApGroupsTabContext }   from '../'
import { CountAndNamesTooltip } from '../..'
import { ApGroupTableProps }    from '../types'

export const defaultRbacApGroupPayload = {
  fields: ['id', 'name', 'venueId', 'apSerialNumbers', 'wifiNetworkIds', 'clientCount'],
  searchTargetFields: ['name'],
  sortField: 'name',
  sortOrder: 'ASC',
  filters: { isDefault: [false] }
}

const genIncidentsPayload = (apGroupsData: NewApGroupViewModelExtended[]) => {
  const { startDate, endDate } = getDateRangeFilter(DateRange.last24Hours)

  const paths: Record<string, { type: string,name?: string }[]> = {}
  apGroupsData.forEach((apg: NewApGroupViewModelExtended, index: number) => {
    const path = [
      { type: 'network', name: 'Network' },
      { type: 'apGroup', name: apg.id }
    ]
    paths[`path${index}`] = path
  })

  const variables = {
    ...paths,
    start: startDate,
    end: endDate
  }

  return { paths, variables }
}

const defaultTableData: NewApGroupViewModelExtended[] = []

export const ApGroupTableRbac = (props : ApGroupTableProps<NewApGroupViewModelExtended>) => {
  const intl = useIntl()
  const { $t } = intl
  const toggles = useIncidentToggles()
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const filters = getFilters(params) as FILTER
  const { settingsId = 'ap-group-table' } = props
  const { setApGroupsCount } = useContext(ApGroupsTabContext)
  const apGroupListTableQuery = usePollingTableQuery({
    useQuery: useNewApGroupsViewModelListQuery,
    defaultPayload: {
      ...defaultRbacApGroupPayload,
      filters: { ...filters, ...defaultRbacApGroupPayload.filters }
    },
    search: {
      searchTargetFields: defaultRbacApGroupPayload.searchTargetFields
    },
    sorter: {
      sortField: (params.venueId) ? 'name' : defaultRbacApGroupPayload.sortField,
      sortOrder: defaultRbacApGroupPayload.sortOrder
    },
    option: { skip: Boolean(props.tableQuery) },
    enableSelectAllPagesData: ['id', 'name'],
    pagination: { settingsId },
    enableRbac: true
  })

  const tableQuery = props.tableQuery || apGroupListTableQuery
  const [ deleteApGroups ] = useDeleteApGroupsMutation()
  const [ getIncidentsList ] = useLazyIncidentsListBySeverityQuery()

  const [tableData, setTableData] = useState(defaultTableData)


  useEffect(() => {
    const { totalCount = 0, data: apGroupsData = [] } = tableQuery.data || {}
    setApGroupsCount?.(totalCount)

    const addIncidentsData = async () => {
      const incidentsPayload = { ...genIncidentsPayload(apGroupsData), toggles }
      const { data: incidentsData } = await getIncidentsList(incidentsPayload, true)

      const newTableData = _.cloneDeep(apGroupsData)

      newTableData.forEach((item, index) => {
        item.incidents = incidentsData?.[index]
      })

      setTableData(newTableData)
    }

    if (apGroupsData.length > 0) {
      addIncidentsData()
    } else {
      setTableData([])
    }

  }, [tableQuery.data])


  const linkToEditApGroup = useTenantLink('/devices/apgroups')

  const showDeleteApGroups = async (rows: NewApGroupViewModelExtended[],
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
        deleteApGroups({
          params: { tenantId },
          payload: rows.map(row => row.id),
          enableRbac: true
        })
          .then(callBack)
      }
    })
  }

  const columns = getTableColumns(intl, props, params?.venueId)



  const rowActions: TableProps<NewApGroupViewModelExtended>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    visible: (selectedRows) => selectedRows.length === 1,
    onClick: (selectedRows) => {
      //redirect to edit AP group page url
      const apGroupId = selectedRows[0].id
      navigate(`${linkToEditApGroup.pathname}/${apGroupId}/edit/general`, { replace: false })
    }
  }, {
    label: $t({ defaultMessage: 'Delete' }),
    onClick: async (selectedRows, clearSelection) => {
      showDeleteApGroups(selectedRows, params.tenantId, clearSelection)
    }
  }]


  const basePath = useTenantLink('/devices')

  return (
    <Loader states={[tableQuery]}>
      <Table<NewApGroupViewModelExtended>
        {...props}
        settingsId={settingsId}
        columns={columns}
        dataSource={tableData}
        getAllPagesData={tableQuery.getAllPagesData}
        rowKey='id'
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        onFilterChange={tableQuery.handleFilterChange}
        enableApiFilter={true}
        rowActions={filterByAccess(rowActions)}
        actions={props.enableActions ? filterByAccess([{
          label: $t({ defaultMessage: 'Add AP Group' }),
          onClick: () => {
            navigate({
              ...basePath,
              pathname: `${basePath.pathname}/apgroups/add`
            }, { state: {
              venueId: params.venueId,
              history: location.pathname
            } })
          }
        }]) : []}
        searchableWidth={260}
        filterableWidth={150}
      />
    </Loader>
  )
}

// eslint-disable-next-line max-len
const getTableColumns = (intl: IntlShape, props : ApGroupTableProps<NewApGroupViewModelExtended>, venueId: string | undefined) => {
  const { $t } = intl
  const { searchable, filterables } = props

  let columns1: TableProps<NewApGroupViewModelExtended>['columns']
  const columns2: TableProps<NewApGroupViewModelExtended>['columns'] = [{
    key: 'members',
    title: $t({ defaultMessage: 'Members' }),
    dataIndex: 'members',
    align: 'center',
    render: (_data, row: NewApGroupViewModelExtended) => {
      const data: CountAndNames = {
        count: row.apSerialNumbers?.length ?? 0,
        names: _.values(row.apInfos)
      }
      return <CountAndNamesTooltip data={data}
        linkUrl={`/devices/apgroups/${row.id}/details/members`}
      />
    }
  }, {
    key: 'networks',
    title: $t({ defaultMessage: 'Networks' }),
    dataIndex: 'networks',
    align: 'center',
    render: (_data, row: NewApGroupViewModelExtended) => {
      const data: CountAndNames = {
        count: row.wifiNetworkIds?.length ?? 0,
        names: _.values(row.networkInfos)
      }
      return <CountAndNamesTooltip data={data}
        linkUrl={`/devices/apgroups/${row.id}/details/networks`}
      />
    }
  }, {
    key: 'incidents',
    title: () => (<>
      { $t({ defaultMessage: 'Incidents' }) }
      <Table.SubTitle children={$t({ defaultMessage: 'Last 24 hours' })} />
    </>),
    dataIndex: 'incidents',
    align: 'center',
    sorter: false,
    render: (_data, row: NewApGroupViewModelExtended) => {
      const incidents = row?.incidents as IncidentsBySeverityData
      const { P1=0, P2=0, P3=0, P4=0 } = incidents || {}
      let total = P1 + P2 + P3 + P4
      let series = (total > 0) ? [
        { name: 'P1',
          value: (P1 / total)*100 },
        { name: 'P2',
          value: (P2 / total)*100 },
        { name: 'P3',
          value: (P3 / total)*100 },
        { name: 'P4',
          value: (P4 / total)*100 }
      ] : [{
        name: '',
        value: 1
      }]

      return (<Space direction='horizontal'>
        <StackedBarChart
          style={{ height: 10, width: 40 }}
          data={[{
            category: 'incidents',
            series: series
          }]}
          showTooltip={false}
          showLabels={false}
          barColors={[cssStr(deviceStatusColors.empty)]}
        />
        <TenantLink to={`/devices/apgroups/${row.id}/details/incidents`}>
          {total}
        </TenantLink>
      </Space>)
    }
  }, {
    key: 'clients',
    title: $t({ defaultMessage: 'Clients' }),
    dataIndex: 'clients',
    align: 'center',
    sorter: true,
    render: (_data, row: NewApGroupViewModelExtended) => {
      return transformDisplayNumber(row.clientCount)
    }
  }]

  if (venueId) {
    columns1 = [{
      key: 'name',
      title: $t({ defaultMessage: 'AP Group' }),
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      fixed: 'left',
      searchable: searchable,
      render: (_data, row: NewApGroupViewModelExtended, __, highlightFn) => (
        <TenantLink to={`/devices/apgroups/${row.id}/details/members`}>
          {searchable ? highlightFn(row.name || '--') : row.name}</TenantLink>
      )
    }]
  } else {
    columns1 = [{
      key: 'name',
      title: $t({ defaultMessage: 'AP Group' }),
      dataIndex: 'name',
      sorter: true,
      fixed: 'left',
      searchable: searchable,
      render: (_data, row: NewApGroupViewModelExtended, __, highlightFn) => (
        <TenantLink to={`/devices/apgroups/${row.id}/details/members`}>
          {searchable ? highlightFn(row.name || '--') : row.name}</TenantLink>
      )
    },
    {
      key: 'venueName',
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      dataIndex: 'venueName',
      filterKey: 'venueId',
      filterable: filterables ? filterables['venueId'] : false,
      render: (_data: React.ReactNode, row: NewApGroupViewModelExtended) => (
        <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>
          {row.venueName}
        </TenantLink>
      )
    }]
  }

  return columns1.concat(columns2)
}
