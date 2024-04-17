/* eslint-disable max-len */
import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  Button,
  ColumnType,
  PageHeader,
  Table,
  TableProps,
  Loader,
  showActionModal,
  cssStr,
  Tooltip
} from '@acx-ui/components'
import { Features, useIsSplitOn, TierFeatures, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  useVenuesListQuery,
  useVenuesTableQuery,
  useDeleteVenueMutation,
  useGetVenueCityListQuery,
  useGetVenueTemplateCityListQuery
} from '@acx-ui/rc/services'
import {
  Venue,
  ApVenueStatusEnum,
  TableQuery,
  usePollingTableQuery, useConfigTemplate
} from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useParams }                     from '@acx-ui/react-router-dom'
import { RequestPayload }                                         from '@acx-ui/types'
import { SwitchScopes, filterByAccess, hasAccess, hasPermission } from '@acx-ui/user'
import { transformToCityListOptions }                             from '@acx-ui/utils'

function useColumns (
  searchable?: boolean,
  filterables?: { [key: string]: ColumnType['filterable'] }
) {
  const { $t } = useIntl()
  const isEdgeEnabled = useIsTierAllowed(TierFeatures.SMART_EDGES)
  const isApCompatibleCheckEnabled = useIsSplitOn(Features.WIFI_COMPATIBILITY_CHECK_TOGGLE)

  const columns: TableProps<Venue>['columns'] = [
    {
      title: $t({ defaultMessage: 'Venue' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      fixed: 'left',
      searchable: searchable,
      defaultSortOrder: 'ascend',
      render: function (_, row, __, highlightFn) {
        return (
          <TenantLink to={`/venues/${row.id}/venue-details/overview`}>
            {searchable ? highlightFn(row.name) : row.name}</TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Address' }),
      width: Infinity,
      key: 'country',
      dataIndex: 'country',
      sorter: true,
      filterKey: 'city',
      filterable: filterables ? filterables['city'] : false,
      render: function (_, row) {
        return `${row.country}, ${row.city}`
      }
    },
    // { // TODO: Waiting for backend support
    //   key: 'incidents',
    //   dataIndex: 'incidents',
    //   title: () => {
    //     return (
    //       <>
    //         { $t({ defaultMessage: 'Incidents' }) }
    //         <Table.SubTitle children={$t({ defaultMessage: 'Last 24 hours' })} />
    //       </>
    //     )
    //   },
    //   align: 'center'
    // },
    // { // TODO: Waiting for backend support
    //   key: 'health',
    //   dataIndex: 'health',
    //   title: () => {
    //     return (
    //       <>
    //         { $t({ defaultMessage: 'Health Score' }) }
    //         <Table.SubTitle children={$t({ defaultMessage: 'Last 24 hours' })} />
    //       </>
    //     )
    //   },
    //   align: 'center'
    // },
    // { // TODO: Waiting for HEALTH feature support
    //   title: $t({ defaultMessage: 'Services' }),
    //   key: 'services',
    //   dataIndex: 'services',
    //   align: 'center'
    // },
    {
      title: $t({ defaultMessage: 'Wi-Fi APs' }),
      align: 'center',
      key: 'aggregatedApStatus',
      dataIndex: 'aggregatedApStatus',
      sorter: true,
      sortDirections: ['descend', 'ascend', 'descend'],
      render: function (_, row) {
        const count = row.aggregatedApStatus
          ? Object.values(row.aggregatedApStatus)
            .reduce((a, b) => a + b, 0)
          : 0
        return (
          <>
            <TenantLink
              to={`/venues/${row.id}/venue-details/devices`}
              children={count ? count : 0}
            />
            {isApCompatibleCheckEnabled && row?.incompatible && row.incompatible > 0 ?
              <Tooltip.Info isFilled
                title={$t({ defaultMessage: 'Some access points may not be compatible with certain features in this venue.' })}
                placement='right'
                iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px', marginLeft: '4px', color: cssStr('--acx-semantics-yellow-50') }}
              />:[]
            }
          </>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Wi-Fi Clients' }),
      key: 'clients',
      dataIndex: 'clients',
      sorter: true,
      sortDirections: ['descend', 'ascend', 'descend'],
      align: 'center',
      render: function (_, row) {
        return (
          <TenantLink
            to={`/venues/${row.id}/venue-details/clients`}
            children={row.clients ? row.clients : 0}
          />
        )
      }
    },
    ...( hasPermission({ scopes: [SwitchScopes.READ] }) ? [{
      title: $t({ defaultMessage: 'Switches' }),
      key: 'switches',
      dataIndex: 'switches',
      sorter: true,
      sortDirections: ['descend', 'ascend', 'descend'],
      align: 'center',
      render: function (_, row) {
        return (
          <TenantLink
            to={`/venues/${row.id}/venue-details/devices/switch`}
            children={row.switches ? row.switches : 0}
          />
        )
      }
    }] : []) as TableProps<Venue>['columns'],
    ...( hasPermission({ scopes: [SwitchScopes.READ] }) ? [{
      title: $t({ defaultMessage: 'Switch Clients' }),
      key: 'switchClients',
      dataIndex: 'switchClients',
      sorter: true,
      sortDirections: ['descend', 'ascend', 'descend'],
      align: 'center',
      render: function (_, row) {
        return (
          <TenantLink
            to={`/venues/${row.id}/venue-details/clients/switch`}
            children={row.switchClients ? row.switchClients : 0}
          />
        )
      }
    }] : []) as TableProps<Venue>['columns'],
    {
      title: $t({ defaultMessage: 'SmartEdges' }),
      key: 'edges',
      dataIndex: 'edges',
      align: 'center',
      render: function (_, row) {
        return (
          <TenantLink
            to={`/venues/${row.id}/venue-details/devices/edge`}
            children={row.edges ? row.edges : 0}
          />
        )
      }
    }
    // { // TODO: Waiting for TAG feature support
    //   key: 'tags',
    //   dataIndex: 'tags',
    //   title: $t({ defaultMessage: 'Tags' }),
    //   show: false
    // }
  ]

  return columns.filter(({ key }) =>
    (key !== 'edges' || (key === 'edges' && isEdgeEnabled)))
}

export const useDefaultVenuePayload = (): RequestPayload => {
  const isEdgeEnabled = useIsTierAllowed(TierFeatures.SMART_EDGES)

  return {
    fields: [
      'check-all',
      'name',
      'description',
      'city',
      'country',
      'networks',
      'aggregatedApStatus',
      'switches',
      'switchClients',
      'clients',
      ...(isEdgeEnabled ? ['edges'] : []),
      'cog',
      'latitude',
      'longitude',
      'status',
      'id'
    ],
    searchTargetFields: ['name'],
    filters: {},
    sortField: 'name',
    sortOrder: 'ASC'
  }
}

type VenueTableProps = {
  settingsId?: string,
  tableQuery: TableQuery<Venue, RequestPayload<unknown>, unknown>,
  rowSelection?: TableProps<Venue>['rowSelection'],
  searchable?: boolean
  filterables?: { [key: string]: ColumnType['filterable'] }
}

export const VenueTable = ({ settingsId = 'venues-table',
  tableQuery, rowSelection, searchable, filterables }: VenueTableProps) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { tenantId } = useParams()

  const columns = useColumns(searchable, filterables)
  const [
    deleteVenue,
    { isLoading: isDeleteVenueUpdating }
  ] = useDeleteVenueMutation()

  const rowActions: TableProps<Venue>['rowActions'] = [{
    visible: (selectedRows) => selectedRows.length === 1,
    label: $t({ defaultMessage: 'Edit' }),
    onClick: (selectedRows) => {
      navigate(`${selectedRows[0].id}/edit/details`, { replace: false })
    }
  },
  {
    label: $t({ defaultMessage: 'Delete' }),
    onClick: (rows, clearSelection) => {
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: rows.length === 1? $t({ defaultMessage: 'Venue' })
            : $t({ defaultMessage: 'Venues' }),
          entityValue: rows.length === 1 ? rows[0].name : undefined,
          numOfEntities: rows.length,
          confirmationText: shouldShowConfirmation(rows) ? 'Delete' : undefined
        },
        onOk: () => { rows.length === 1 ?
          deleteVenue({ params: { tenantId, venueId: rows[0].id } })
            .then(clearSelection) :
          deleteVenue({ params: { tenantId }, payload: rows.map(item => item.id) })
            .then(clearSelection)
        }
      })
    }
  }]

  return (
    <Loader states={[
      tableQuery,
      { isLoading: false, isFetching: isDeleteVenueUpdating }
    ]}>
      <Table
        settingsId={settingsId}
        columns={columns}
        getAllPagesData={tableQuery.getAllPagesData}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        onFilterChange={tableQuery.handleFilterChange}
        enableApiFilter={true}
        rowKey='id'
        rowActions={filterByAccess(rowActions)}
        rowSelection={hasAccess() && rowSelection}
      />
    </Loader>
  )
}

export function VenuesTable () {
  const { $t } = useIntl()
  const venuePayload = useDefaultVenuePayload()
  const isApCompatibleCheckEnabled = useIsSplitOn(Features.WIFI_COMPATIBILITY_CHECK_TOGGLE)

  const settingsId = 'venues-table'
  const tableQuery = usePollingTableQuery<Venue>({
    useQuery: isApCompatibleCheckEnabled ? useVenuesTableQuery: useVenuesListQuery,
    defaultPayload: venuePayload,
    search: {
      searchTargetFields: venuePayload.searchTargetFields as string[]
    },
    enableSelectAllPagesData: ['id', 'name'],
    pagination: { settingsId }
  })

  const { cityFilterOptions } = useGetVenueCityList()

  const count = tableQuery?.currentData?.totalCount || 0

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Venues ({count})' }, { count })}
        extra={filterByAccess([
          <TenantLink to='/venues/add'>
            <Button type='primary'>{ $t({ defaultMessage: 'Add Venue' }) }</Button>
          </TenantLink>
        ])}
      />
      <VenueTable settingsId={settingsId}
        tableQuery={tableQuery}
        rowSelection={{ type: 'checkbox' }}
        searchable={true}
        filterables={{ city: cityFilterOptions }} />
    </>
  )
}

function shouldShowConfirmation (selectedVenues: Venue[]) {
  const venues = selectedVenues.filter(v => {
    return v['status'] !== ApVenueStatusEnum.IN_SETUP_PHASE || !_.isEmpty(v['aggregatedApStatus'])
  })
  return venues.length > 0
}

function useGetVenueCityList () {
  const params = useParams()
  const { isTemplate } = useConfigTemplate()

  const venueCityListTemplate = useGetVenueTemplateCityListQuery({ params }, {
    selectFromResult: ({ data }) => ({
      cityFilterOptions: transformToCityListOptions(data)
    }),
    skip: !isTemplate
  })

  const venueCityList = useGetVenueCityListQuery({ params }, {
    selectFromResult: ({ data }) => ({
      cityFilterOptions: transformToCityListOptions(data)
    }),
    skip: isTemplate
  })

  return isTemplate ? venueCityListTemplate : venueCityList
}
