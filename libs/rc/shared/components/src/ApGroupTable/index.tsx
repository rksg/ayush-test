import { useContext, useEffect, useState } from 'react'

import { Space }                               from 'antd'
import _                                       from 'lodash'
import { IntlShape, useIntl }                  from 'react-intl'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { IncidentsBySeverityData, useIncidentToggles, useLazyIncidentsListBySeverityQuery }        from '@acx-ui/analytics/components'
import { Loader, StackedBarChart, Table, TableProps, cssStr, deviceStatusColors, showActionModal } from '@acx-ui/components'
import { useIsSplitOn, Features }                                                                  from '@acx-ui/feature-toggle'
import { useApGroupsListQuery, useDeleteApGroupMutation }                                          from '@acx-ui/rc/services'
import {
  ApGroupViewModel,
  FILTER,
  getFilters,
  transformDisplayNumber,
  usePollingTableQuery,
  WifiRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { TenantLink, useTenantLink }                                                  from '@acx-ui/react-router-dom'
import { WifiScopes }                                                                 from '@acx-ui/types'
import { filterByAccess, hasPermission }                                              from '@acx-ui/user'
import { DateRange, getDateRangeFilter, getOpsApi, useTrackLoadTime, widgetsMapping } from '@acx-ui/utils'

import {  CountAndNamesTooltip } from '../'

import { ApGroupsTabContext } from './context'
import { ApGroupTableProps }  from './types'

export const defaultNonRbacApGroupPayload = {
  fields: ['id', 'name', 'venueId', 'venueName', 'members', 'networks', 'clients'],
  searchTargetFields: ['name'],
  sortField: 'venueName',
  sortOrder: 'ASC',
  filters: { isDefault: [false] }
}

const genIncidentsPayload = (apGroupsData: ApGroupViewModel[]) => {
  const { startDate, endDate } = getDateRangeFilter(DateRange.last24Hours)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paths: any = {}
  apGroupsData.forEach((apg: ApGroupViewModel, index: number) => {
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

const defaultTableData: ApGroupViewModel[] = []

export const ApGroupTable = (props : ApGroupTableProps<ApGroupViewModel>) => {
  const intl = useIntl()
  const { $t } = intl
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const isMonitoringPageEnabled = useIsSplitOn(Features.MONITORING_PAGE_LOAD_TIMES)
  const toggles = useIncidentToggles()
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const filters = getFilters(params) as FILTER
  const { settingsId = 'ap-group-table' } = props
  const { setApGroupsCount } = useContext(ApGroupsTabContext)

  const apGroupListTableQuery = usePollingTableQuery({
    useQuery: useApGroupsListQuery,
    defaultPayload: {
      ...defaultNonRbacApGroupPayload,
      filters: { ...filters, ...defaultNonRbacApGroupPayload.filters }
    },
    search: {
      searchTargetFields: defaultNonRbacApGroupPayload.searchTargetFields
    },
    sorter: {
      sortField: (params.venueId || isWifiRbacEnabled)
        ? 'name'
        : defaultNonRbacApGroupPayload.sortField,
      sortOrder: defaultNonRbacApGroupPayload.sortOrder
    },
    option: { skip: Boolean(props.tableQuery) },
    enableSelectAllPagesData: ['id', 'name'],
    pagination: { settingsId },
    enableRbac: isWifiRbacEnabled
  })

  const tableQuery = props.tableQuery || apGroupListTableQuery
  const [ deleteApGroup ] = useDeleteApGroupMutation()
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

  const showDeleteApGroups = async (rows: ApGroupViewModel[], callBack?: () => void) => {
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
        const actions = rows.map(row => deleteApGroup({
          params: {
            venueId: row.venueId,
            apGroupId: row.id
          },
          enableRbac: isWifiRbacEnabled
        }))

        Promise.all(actions)
          .then(callBack)
      }
    })
  }

  const columns = getTableColumns(intl, props, params?.venueId, isWifiRbacEnabled)

  const rowActions: TableProps<ApGroupViewModel>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    scopeKey: [WifiScopes.UPDATE],
    rbacOpsIds: [getOpsApi(WifiRbacUrlsInfo.updateApGroup)],
    visible: (selectedRows) => selectedRows.length === 1,
    onClick: (selectedRows) => {
      //redirect to edit AP group page url
      const apGroupId = selectedRows[0].id
      navigate(`${linkToEditApGroup.pathname}/${apGroupId}/edit/general`, { replace: false })
    }
  }, {
    label: $t({ defaultMessage: 'Delete' }),
    scopeKey: [WifiScopes.DELETE],
    rbacOpsIds: [getOpsApi(WifiRbacUrlsInfo.deleteApGroup)],
    onClick: async (selectedRows, clearSelection) => {
      showDeleteApGroups(selectedRows, clearSelection)
    }
  }]

  const basePath = useTenantLink('/devices')

  useTrackLoadTime({
    itemName: widgetsMapping.AP_GROUP_TABLE,
    states: [tableQuery],
    isEnabled: isMonitoringPageEnabled
  })

  return (
    <Loader states={[tableQuery]}>
      <Table<ApGroupViewModel>
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
          scopeKey: [WifiScopes.CREATE],
          rbacOpsIds: [getOpsApi(WifiRbacUrlsInfo.addApGroup)],
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
        rowSelection={hasPermission({
          scopes: [WifiScopes.UPDATE, WifiScopes.DELETE],
          rbacOpsIds: [
            getOpsApi(WifiRbacUrlsInfo.updateApGroup),
            getOpsApi(WifiRbacUrlsInfo.deleteApGroup)]
        }) && { type: 'checkbox' }}
        searchableWidth={260}
        filterableWidth={150}
      />
    </Loader>
  )
}

// eslint-disable-next-line max-len
const getTableColumns = (intl: IntlShape, props : ApGroupTableProps<ApGroupViewModel>, venueId: string | undefined, isWifiRbacEnabled: boolean) => {
  const { $t } = intl
  const { searchable, filterables } = props

  let columns1: TableProps<ApGroupViewModel>['columns']
  const columns2: TableProps<ApGroupViewModel>['columns'] = [{
    key: 'members',
    title: $t({ defaultMessage: 'Members' }),
    dataIndex: 'members',
    align: 'center',
    render: (_, row: ApGroupViewModel) => (
      <CountAndNamesTooltip data={row.members}
        linkUrl={`/devices/apgroups/${row.id}/details/members`}
      />
    )
  }, {
    key: 'networks',
    title: $t({ defaultMessage: 'Networks' }),
    dataIndex: 'networks',
    align: 'center',
    render: (_, row: ApGroupViewModel) => (
      <CountAndNamesTooltip data={row.networks}
        linkUrl={`/devices/apgroups/${row.id}/details/networks`}
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
    render: (_, row: ApGroupViewModel) => {
      return transformDisplayNumber(row.clients)
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
      render: (_, row: ApGroupViewModel, __, highlightFn) => (
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
      render: (_, row: ApGroupViewModel, __, highlightFn) => (
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
      sorter: !isWifiRbacEnabled,
      defaultSortOrder: isWifiRbacEnabled ? undefined : 'ascend',
      render: (_: React.ReactNode, row: ApGroupViewModel) => (
        <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>
          {row.venueName}
        </TenantLink>
      )
    }]
  }

  return columns1.concat(columns2)
}
