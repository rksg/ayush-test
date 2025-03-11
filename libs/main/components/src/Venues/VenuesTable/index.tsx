/* eslint-disable max-len */
import { useEffect, useState } from 'react'

import { Badge }                         from 'antd'
import { cloneDeep, findIndex, isEmpty } from 'lodash'
import { useIntl }                       from 'react-intl'

import {
  Button,
  ColumnType,
  cssStr,
  Loader,
  PageHeader,
  showActionModal,
  Table,
  TableProps,
  Tooltip
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  getAPStatusDisplayName,
  useEnforcedStatus,
  useIsEdgeFeatureReady,
  useIsEdgeReady
} from '@acx-ui/rc/components'
import {
  useDeleteVenueMutation,
  useEnhanceVenueTableQuery,
  useGetVenueCityListQuery,
  useLazyGetVenueEdgeCompatibilitiesQuery,
  useLazyGetVenueEdgeCompatibilitiesV1_1Query,
  useVenuesTableQuery
} from '@acx-ui/rc/services'
import {
  ApVenueStatusEnum,
  CommonUrlsInfo,
  TableQuery,
  usePollingTableQuery,
  Venue,
  WifiRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useParams } from '@acx-ui/react-router-dom'
import {
  EdgeScopes,
  RequestPayload,
  RolesEnum,
  SwitchScopes,
  WifiScopes
} from '@acx-ui/types'
import {
  filterByAccess,
  getUserProfile,
  hasAllowedOperations,
  hasCrossVenuesPermission,
  hasPermission,
  hasRoles
} from '@acx-ui/user'
import { getOpsApi, transformToCityListOptions } from '@acx-ui/utils'

const incompatibleIconStyle = {
  position: 'absolute' as const,
  height: '16px',
  width: '16px',
  marginBottom: '-3px',
  marginLeft: '4px',
  color: cssStr('--acx-semantics-yellow-50'),
  borderColor: cssStr('--acx-accents-orange-30')
}

const statusColorMapping = (status: keyof ApVenueStatusEnum) => {
  switch (status) {
    case ApVenueStatusEnum.REQUIRES_ATTENTION:
      return cssStr('--acx-semantics-red-50')
    case ApVenueStatusEnum.TRANSIENT_ISSUE:
      return cssStr('--acx-semantics-yellow-40')
    case ApVenueStatusEnum.IN_SETUP_PHASE:
      return cssStr('--acx-neutrals-50')
    case ApVenueStatusEnum.OPERATIONAL:
      return cssStr('--acx-semantics-green-50')
    default:
      return cssStr('--acx-neutrals-50')
  }
}

function useColumns (
  searchable?: boolean,
  filterables?: { [key: string]: ColumnType['filterable'] }
) {
  const { $t } = useIntl()
  const isEdgeEnabled = useIsEdgeReady()
  const isStatusColumnEnabled = useIsSplitOn(Features.VENUE_TABLE_ADD_STATUS_COLUMN)

  const columns: TableProps<Venue>['columns'] = [
    {
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
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
      key: 'addressLine',
      dataIndex: 'country',
      sorter: true,
      filterKey: 'city',
      searchable: searchable,
      filterable: filterables ? filterables['city'] : false,
      render: function (_, row, __, highlightFn) {
        return searchable ? highlightFn(row.addressLine as string)
          : row.addressLine
      }
    },
    ...(isStatusColumnEnabled ? [{
      title: $t({ defaultMessage: 'Status' }),
      key: 'status',
      dataIndex: 'status',
      sorter: true,
      render: function (_: React.ReactNode, row: Venue) {
        return <Badge
          color={statusColorMapping(row.status as keyof typeof statusColorMapping)}
          text={getAPStatusDisplayName(row.status as ApVenueStatusEnum, false)}
        />
      }
    }] : []),
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
            {row?.incompatible && row.incompatible > 0 ?
              <Tooltip.Warning isFilled
                isTriangle
                title={$t({ defaultMessage: 'Some access points may not be compatible with certain features in this <venueSingular></venueSingular>.' })}
                placement='right'
                iconStyle={incompatibleIconStyle}
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
    {
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
    },
    {
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
    },
    {
      title: $t({ defaultMessage: 'RUCKUS Edges' }),
      key: 'edges',
      dataIndex: 'edges',
      align: 'center',
      render: function (_, row) {
        return (
          <>
            <TenantLink
              to={`/venues/${row.id}/venue-details/devices/edge`}
              children={row.edges ? row.edges : 0}
            />
            {row?.incompatibleEdges && row.incompatibleEdges > 0 ?
              <Tooltip.Warning isFilled
                isTriangle
                title={$t({ defaultMessage: 'Some RUCKUS Edges may not be compatible with certain features in this <venueSingular></venueSingular>.' })}
                placement='right'
                iconStyle={incompatibleIconStyle}
              />:[]
            }
          </>
        )
      }
    }
  ]

  return columns.filter(({ key }) =>
    (key !== 'edges' || (key === 'edges' && isEdgeEnabled)))
}

export const useDefaultVenuePayload = (): RequestPayload => {
  const isEdgeEnabled = useIsEdgeReady()

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
      'id',
      'isEnforced',
      'isManagedByTemplate',
      'addressLine'
    ],
    searchTargetFields: ['name', 'addressLine'],
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
  tableData?: Venue[]
}

export const VenueTable = ({ settingsId = 'venues-table',
  tableQuery, rowSelection, searchable, filterables, tableData }: VenueTableProps) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { tenantId } = useParams()
  const { rbacOpsApiEnabled } = getUserProfile()
  const columns = useColumns(searchable, filterables)
  const [ deleteVenue, { isLoading: isDeleteVenueUpdating } ] = useDeleteVenueMutation()
  const { hasEnforcedItem, getEnforcedActionMsg } = useEnforcedStatus()

  const hasDeletePermission = rbacOpsApiEnabled
    ? hasAllowedOperations([getOpsApi(CommonUrlsInfo.deleteVenues)])
    : hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR]) && hasCrossVenuesPermission()

  const rowActions: TableProps<Venue>['rowActions'] = [{
    visible: (selectedRows) => selectedRows.length === 1,
    label: $t({ defaultMessage: 'Edit' }),
    rbacOpsIds: [
      getOpsApi(CommonUrlsInfo.updateVenue),
      getOpsApi(WifiRbacUrlsInfo.updateVenueRadioCustomization),
      getOpsApi(CommonUrlsInfo.updateVenueSwitchSetting)
    ],
    scopeKey: [WifiScopes.UPDATE, EdgeScopes.UPDATE, SwitchScopes.UPDATE],
    onClick: (selectedRows) => {
      navigate(`${selectedRows[0].id}/edit/`, { replace: false })
    },
    disabled: (selectedRows) => hasEnforcedItem(selectedRows),
    tooltip: (selectedRows) => getEnforcedActionMsg(selectedRows)
  },
  {
    label: $t({ defaultMessage: 'Delete' }),
    visible: hasDeletePermission,
    disabled: (selectedRows) => hasEnforcedItem(selectedRows),
    tooltip: (selectedRows) => getEnforcedActionMsg(selectedRows),
    onClick: (rows, clearSelection) => {
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: rows.length === 1? $t({ defaultMessage: '<VenueSingular></VenueSingular>' })
            : $t({ defaultMessage: '<VenuePlural></VenuePlural>' }),
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
        dataSource={tableData ?? tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        onFilterChange={tableQuery.handleFilterChange}
        enableApiFilter={true}
        rowKey='id'
        rowActions={filterByAccess(rowActions)}
        rowSelection={hasPermission({
          scopes: [WifiScopes.UPDATE, EdgeScopes.UPDATE, SwitchScopes.UPDATE],
          rbacOpsIds: [
            getOpsApi(CommonUrlsInfo.updateVenue),
            getOpsApi(WifiRbacUrlsInfo.updateVenueRadioCustomization),
            getOpsApi(CommonUrlsInfo.updateVenueSwitchSetting)
          ]
        }) && rowSelection}
      />
    </Loader>
  )
}

export function VenuesTable () {
  const isApCompatibilitiesByModel = useIsSplitOn(Features.WIFI_COMPATIBILITY_BY_MODEL)
  const { $t } = useIntl()
  const venuePayload = useDefaultVenuePayload()

  const settingsId = 'venues-table'
  const tableQuery = usePollingTableQuery<Venue>({
    useQuery: isApCompatibilitiesByModel? useEnhanceVenueTableQuery: useVenuesTableQuery,
    defaultPayload: venuePayload,
    search: {
      searchTargetFields: venuePayload.searchTargetFields as string[]
    },
    enableSelectAllPagesData: ['id', 'name'],
    pagination: { settingsId }
  })


  const { cityFilterOptions } = useGetVenueCityList()
  const tableData = useVenueEdgeCompatibilities(tableQuery)

  const count = tableQuery?.currentData?.totalCount || 0


  const { rbacOpsApiEnabled } = getUserProfile()
  const hasAddVenuePermissions = rbacOpsApiEnabled
    ? hasAllowedOperations([getOpsApi(CommonUrlsInfo.addVenue)])
    : hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR]) &&
      hasCrossVenuesPermission()

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: '<VenuePlural></VenuePlural> ({count})' }, { count })}
        extra={hasAddVenuePermissions && [
          <TenantLink to='/venues/add'>
            <Button type='primary'>{ $t({ defaultMessage: 'Add <VenueSingular></VenueSingular>' }) }</Button>
          </TenantLink>
        ]}
      />
      <VenueTable settingsId={settingsId}
        tableQuery={tableQuery}
        tableData={tableData}
        rowSelection={{ type: 'checkbox' }}
        searchable={true}
        filterables={{ city: cityFilterOptions }}
      />
    </>
  )
}

function shouldShowConfirmation (selectedVenues: Venue[]) {
  const venues = selectedVenues.filter(v => {
    return v['status'] !== ApVenueStatusEnum.IN_SETUP_PHASE || !isEmpty(v['aggregatedApStatus'])
  })
  return venues.length > 0
}

function useGetVenueCityList () {
  const params = useParams()
  const isRbacEnabled = useIsSplitOn(Features.ABAC_POLICIES_TOGGLE)

  const venueCityList = useGetVenueCityListQuery({
    params,
    enableRbac: isRbacEnabled
  }, {
    selectFromResult: ({ data }) => ({
      cityFilterOptions: transformToCityListOptions(data)
    })
  })

  return venueCityList
}

const useVenueEdgeCompatibilities = (tableQuery: TableQuery<Venue, RequestPayload<unknown>, unknown>) => {
  const isEdgeCompatibilityEnabled = useIsEdgeFeatureReady(Features.EDGE_COMPATIBILITY_CHECK_TOGGLE)
  const isEdgeCompatibilityEnhancementEnabled = useIsEdgeFeatureReady(Features.EDGE_ENG_COMPATIBILITY_CHECK_ENHANCEMENT_TOGGLE)
  const [getVenueEdgeCompatibilities] = useLazyGetVenueEdgeCompatibilitiesQuery()
  const [getVenueEdgeCompatibilitiesV1_1] = useLazyGetVenueEdgeCompatibilitiesV1_1Query()

  const [tableData, setTableData] = useState<Venue[]>()

  useEffect(() => {
    const fetchVenueEdgeCompatibilities = async (tableData: Venue[]) => {
      const res = isEdgeCompatibilityEnhancementEnabled
        ? await getVenueEdgeCompatibilitiesV1_1({
          payload: {
            filters: { venueIds: tableData.map(i => i.id) }
          }
        }).unwrap()
        : await getVenueEdgeCompatibilities({
          payload: {
            filters: { venueIds: tableData.map(i => i.id) }
          }
        }).unwrap()

      const result = cloneDeep(tableData) ?? []
      res?.compatibilities?.forEach((item) => {
        const idx = findIndex(tableQuery.data?.data, { id: item.id })
        if (idx !== -1)
          result[idx].incompatibleEdges = item.incompatible ?? 0
      })

      setTableData(result)
    }

    if (isEdgeCompatibilityEnabled && tableQuery.data)
      fetchVenueEdgeCompatibilities(tableQuery.data.data)

  }, [isEdgeCompatibilityEnabled, tableQuery.data?.data])

  return tableData
}
