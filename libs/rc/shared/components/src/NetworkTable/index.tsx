import { ReactNode, useEffect, useState } from 'react'

import { omit }                      from 'lodash'
import { useIntl, FormattedMessage } from 'react-intl'
import { useNavigate, useParams }    from 'react-router-dom'

import {
  Loader,
  TableProps,
  Table,
  cssStr,
  Tooltip
} from '@acx-ui/components'
import { useEnforcedStatus }                                      from '@acx-ui/config-template/utils'
import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { useDeleteNetworkMutation }                               from '@acx-ui/rc/services'
import {
  NetworkTypeEnum,
  Network,
  NetworkType,
  GuestNetworkTypeEnum,
  WlanSecurityEnum,
  WifiNetwork,
  WifiRbacUrlsInfo,
  useConfigTemplate,
  ConfigTemplateUrlsInfo,
  ConfigTemplateType,
  doProfileDelete } from '@acx-ui/rc/utils'
import { TenantLink, useTenantLink }              from '@acx-ui/react-router-dom'
import { ColumnType, RequestPayload, WifiScopes } from '@acx-ui/types'
import {
  filterByAccess,
  getUserProfile,
  hasAllowedOperations,
  hasCrossVenuesPermission,
  hasPermission
} from '@acx-ui/user'
import {
  getIntl,
  getOpsApi,
  noDataDisplay,
  useTrackLoadTime,
  widgetsMapping,
  TableQuery,
  FILTER,
  SEARCH
} from '@acx-ui/utils'


// eslint-disable-next-line max-len
function getCols (intl: ReturnType<typeof useIntl>, searchable?: boolean, filterables?: { [key: string]: ColumnType['filterable'] }) {
  const { $t } = intl
  function getSecurityProtocol (securityProtocol: WlanSecurityEnum, oweMaster?: boolean) {
    let _securityProtocol: string = ''
    switch (securityProtocol) {
      case WlanSecurityEnum.WPA2Personal:
        _securityProtocol = $t({ defaultMessage: 'WPA2 (Recommended)' })
        break
      case WlanSecurityEnum.WPAPersonal:
        _securityProtocol = $t({ defaultMessage: 'WPA' })
        break
      case WlanSecurityEnum.WPA23Mixed:
        _securityProtocol = $t({ defaultMessage: 'WPA2/WPA3 mixed mode' })
        break
      case WlanSecurityEnum.OWE:
        _securityProtocol = $t({ defaultMessage: 'OWE' })
        break
      case WlanSecurityEnum.OWETransition:
        _securityProtocol = oweMaster === false ?
          $t({ defaultMessage: 'OWE' }) : $t({ defaultMessage: 'Open' })
        break
      case WlanSecurityEnum.WPA3:
        _securityProtocol = $t({ defaultMessage: 'WPA3' })
        break
      case WlanSecurityEnum.WPA2Enterprise:
        _securityProtocol = $t({ defaultMessage: 'WPA2 Enterprise' })
        break
      case WlanSecurityEnum.WEP:
        _securityProtocol = $t({ defaultMessage: 'WEP' })
        break
      case WlanSecurityEnum.Open:
        _securityProtocol = $t({ defaultMessage: 'Open' })
        break
      case WlanSecurityEnum.OpenCaptivePortal:
        _securityProtocol = $t({ defaultMessage: 'Open Captive Portal' })
        break
    }
    return _securityProtocol
  }

  const columns: TableProps<Network|WifiNetwork>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      fixed: 'left',
      sorter: true,
      defaultSortOrder: 'ascend',
      searchable: searchable,
      render: function (_, row, __, highlightFn) {
        const { isOnBoarded, isOweMaster, owePairNetworkId, id, name, ssid } = row
        const networkName = searchable? highlightFn(name) : name

        return (isOnBoarded
          ? <span>{networkName}</span>
          : <TenantLink to={
            (isOweMaster === false && owePairNetworkId !== undefined) ?
              `/networks/wireless/${id}/network-details/overview-no-config` :
              `/networks/wireless/${id}/network-details/overview`}
          >
            {networkName}
            {row.name !== row.ssid &&
                <> {$t({ defaultMessage: '(SSID: {ssid})' }, { ssid: ssid })}</>
            }
          </TenantLink>
        )
      }
    },
    {
      key: 'description',
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'description',
      sorter: true
    },
    {
      key: 'nwSubType',
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'nwSubType',
      sorter: true,
      filterable: filterables? filterables['nwSubType'] : false,
      filterComponent: { type: 'cascader' },
      filterMultiple: true,
      render: (_, row) => <NetworkType
        networkType={row.nwSubType as NetworkTypeEnum}
        row={row}
      />
    },
    {
      key: 'venues',
      title: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }),
      dataIndex: ['venues', 'count'],
      sorter: false,
      sortDirections: ['descend', 'ascend', 'descend'],
      align: 'center',
      render: function (_, row) {
        const { venues, isOnBoarded, id } = row
        return (
          isOnBoarded
            ? <span>{venues?.count || noDataDisplay}</span>
            : <TenantLink
              to={`/networks/wireless/${id}/network-details/venues`}
              children={venues?.count ?? 0}
            />
        )
      }
    },
    {
      key: 'aps',
      title: $t({ defaultMessage: 'APs' }),
      dataIndex: 'aps',
      sorter: false,
      sortDirections: ['descend', 'ascend', 'descend'],
      align: 'center',
      render: function (_, row) {
        const { aps: apCount, isOnBoarded, id, incompatible=0 } = row

        return (<>
          {isOnBoarded
            ? <span>{apCount || noDataDisplay}</span>
            : <TenantLink to={`/networks/wireless/${id}/network-details/aps`}
              children={apCount}
            />}
          {(incompatible > 0) &&
            <Tooltip.Warning isFilled
              isTriangle
              title={$t({
                defaultMessage: 'Some access points may not be compatible with ' +
                    'certain features on this network.'
              })}
              placement='right'
              iconStyle={{
                position: 'absolute',
                height: '16px',
                width: '16px',
                marginBottom: '-3px',
                marginLeft: '4px',
                color: cssStr('--acx-semantics-yellow-50'),
                borderColor: cssStr('--acx-accents-orange-30')
              }}
            />
          }
        </>)
      }
    },
    {
      key: 'clients',
      title: $t({ defaultMessage: 'Clients' }),
      dataIndex: 'clients',
      sorter: false, // API does not seem to be working
      align: 'center',
      render: function (_, row) {
        const { clients: clientCount, isOnBoarded } = row
        return (
          isOnBoarded
            ? <span>{clientCount || noDataDisplay}</span>
            : <TenantLink to={`/networks/wireless/${row.id}/network-details/clients`}>
              {clientCount}
            </TenantLink>
        )
      }
    },
    // { TODO: Wait for Services
    //   key: 'services',
    //   title: $t({ defaultMessage: 'Services' }),
    //   dataIndex: 'services',
    //   sorter: true,
    //   align: 'center',
    //   show: isServicesEnabled
    // },
    {
      key: 'vlan',
      title: $t({ defaultMessage: 'VLAN' }),
      dataIndex: 'vlan',
      sorter: true,
      render: function (_, row) {
        return transformVLAN(row)
      }
    },
    {
      key: 'securityProtocol',
      title: $t({ defaultMessage: 'Security Protocol' }),
      dataIndex: 'securityProtocol',
      sorter: false,
      render: (_, row) => {
        const { securityProtocol, isOweMaster } = row
        return getSecurityProtocol(securityProtocol as WlanSecurityEnum, isOweMaster) ||
          noDataDisplay
      }
    }
    // { // TODO: Waiting for HEALTH feature support
    //   key: 'health',
    //   title: $t({ defaultMessage: 'Health' }),
    //   dataIndex: 'health',
    //   sorter: true
    // },
    // { // TODO: Waiting for TAG feature support
    //   key: 'tags',
    //   title: $t({ defaultMessage: 'Tags' }),
    //   dataIndex: 'tags',
    //   sorter: true
    // }
  ]
  return columns
}


const transformVLAN = (row: Network) => {
  const { $t } = getIntl()
  if (row.vlanPool) {
    const vlanPool = row.vlanPool
    return $t({ defaultMessage: 'VLAN Pool: {poolName}' }, { poolName: vlanPool?.name ?? '' })
  }
  return $t({ defaultMessage: 'VLAN-{id}' }, { id: row.vlan })
}

export const defaultNetworkPayload = {
  searchString: '',
  fields: [
    'check-all',
    'name',
    'description',
    'nwSubType',
    'venues',
    'aps',
    'clients',
    'vlan',
    'cog',
    'ssid',
    'vlanPool',
    'captiveType',
    'id',
    'securityProtocol',
    'dsaeOnboardNetwork',
    'isOweMaster',
    'owePairNetworkId'
  ],
  page: 1,
  pageSize: 2048
}

export const defaultRbacNetworkPayload = {
  searchString: '',
  searchTargetFields: ['name'],
  fields: [
    'name',
    'description',
    'nwSubType',
    'venueApGroups',
    'apSerialNumbers',
    'apCount',
    'clientCount',
    'vlan',
    'cog',
    'ssid',
    'vlanPool',
    'captiveType',
    'id',
    'securityProtocol',
    'dsaeOnboardNetwork',
    'isOweMaster',
    'owePairNetworkId',
    'tunnelWlanEnable',
    'isEnforced'
  ],
  page: 1,
  pageSize: 2048
}

/* eslint-disable max-len */
const getDeleteMessage = (messageKey: string) => {
  const { $t } = getIntl()
  const deleteMessageMap = {
    deletingGuestPass: $t({ defaultMessage: 'Deleting Guest Pass network will invalidate all its related guest passes.' }),
    deletingDPSK: $t({ defaultMessage: 'Deleting DPSK network will remove all its related DPSK User Credentials (Passphrases).' }),
    hasAdvertisedVenues: $t({ defaultMessage: 'Note that this will affect the service on all <venuePlural></venuePlural> and APs that the network is activated on.' })
  }
  return deleteMessageMap?.[messageKey as keyof typeof deleteMessageMap]
}
/* eslint-enable max-len */

interface NetworkTableProps {
  settingsId?: string
  tableQuery: TableQuery<Network|WifiNetwork, RequestPayload<unknown>, unknown>,
  selectable?: boolean
  searchable?: boolean
  filterables?: { [key: string]: ColumnType['filterable'] }
}

export function NetworkTable ({
  settingsId = 'network-table', tableQuery, selectable, searchable, filterables
}: NetworkTableProps) {
  const isWpaDsae3Toggle = useIsSplitOn(Features.WIFI_EDA_WPA3_DSAE_TOGGLE)
  const isBetaDPSK3FeatureEnabled = useIsTierAllowed(TierFeatures.BETA_DPSK3)
  const isMonitoringPageEnabled = useIsSplitOn(Features.MONITORING_PAGE_LOAD_TIMES)

  const [expandOnboardingNetworks, setExpandOnboardingNetworks] = useState<boolean>(false)
  const [showOnboardNetworkToggle, setShowOnboardNetworkToggle] = useState<boolean>(false)
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([])
  const intl = useIntl()
  const { $t } = intl
  const { isTemplate } = useConfigTemplate()
  const { rbacOpsApiEnabled } = getUserProfile()
  const navigate = useNavigate()
  const linkToEditNetwork = useTenantLink('/networks/wireless/')
  const { hasEnforcedItem, getEnforcedActionMsg } = useEnforcedStatus(ConfigTemplateType.NETWORK)

  const addNetworkOpsApi = getOpsApi(isTemplate
    ? ConfigTemplateUrlsInfo.addNetworkTemplateRbac
    : WifiRbacUrlsInfo.addNetworkDeep)

  const updateNetworkOpsApi = getOpsApi(isTemplate
    ? ConfigTemplateUrlsInfo.updateNetworkTemplateRbac
    : WifiRbacUrlsInfo.updateNetworkDeep)

  const deleteNetworkOpsApi = getOpsApi(isTemplate
    ? ConfigTemplateUrlsInfo.deleteNetworkTemplateRbac
    : WifiRbacUrlsInfo.deleteNetwork)


  useEffect(() => {
    if (tableQuery?.data?.data) {
      const _rows: string[] = []

      tableQuery?.data?.data.forEach((record: Network) => {
        if (record?.children) _rows.push(record.id)
      })

      setShowOnboardNetworkToggle(!!_rows.length)

      const exRowKeys = expandOnboardingNetworks ? _rows : []
      setExpandedRowKeys(exRowKeys)
    }

  }, [tableQuery?.data?.data, expandOnboardingNetworks])

  const { tenantId } = useParams()
  const [
    deleteNetwork, { isLoading: isDeleteNetworkUpdating }
  ] = useDeleteNetworkMutation()

  // eslint-disable-next-line max-len
  const isActionDisabled = (selectedRows: Array<Network|WifiNetwork>, actionType: 'edit' | 'delete' | 'clone') => {
    // eslint-disable-next-line max-len
    const isDsaeEnabled = (isBetaDPSK3FeatureEnabled && !isWpaDsae3Toggle) && (!!selectedRows[0]?.dsaeOnboardNetwork)

    if (['edit', 'clone'].includes(actionType)) {
      return isDsaeEnabled
    }

    return isDsaeEnabled || hasEnforcedItem(selectedRows)
  }

  const rowActions: TableProps<Network|WifiNetwork>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      scopeKey: [WifiScopes.UPDATE],
      rbacOpsIds: [updateNetworkOpsApi],
      onClick: (selectedRows) => {
        navigate(`${linkToEditNetwork.pathname}/${selectedRows[0].id}/edit`, { replace: false })
      },
      disabled: (selectedRows) => isActionDisabled(selectedRows, 'edit')
    },
    {
      label: $t({ defaultMessage: 'Clone' }),
      scopeKey: [WifiScopes.CREATE],
      rbacOpsIds: [addNetworkOpsApi],
      onClick: (selectedRows) => {
        navigate(`${linkToEditNetwork.pathname}/${selectedRows[0].id}/clone`, { replace: false })
      },
      disabled: (selectedRows) => isActionDisabled(selectedRows, 'clone')
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      scopeKey: [WifiScopes.DELETE],
      rbacOpsIds: [deleteNetworkOpsApi],
      onClick: ([selected], clearSelection) => {
        doDelete([selected as WifiNetwork], clearSelection)
      },
      disabled: (selectedRows) => isActionDisabled(selectedRows, 'delete'),
      tooltip: getEnforcedActionMsg
    }
  ]

  const doDelete = (selectedRows: WifiNetwork[], callback: () => void) => {
    const isDeletingDPSK = isSelectedDpskNetwork(selectedRows)
    const isDeletingGuestPass = isSelectedGuestNetwork(selectedRows)

    doProfileDelete(
      selectedRows,
      $t({ defaultMessage: 'Network' }),
      selectedRows[0].name,
      // eslint-disable-next-line max-len
      [{ fieldName: 'venueApGroups', fieldText: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }) }],
      async () => deleteNetwork({
        params: { tenantId, networkId: selectedRows[0].id },
        enableRbac: true
      }).then(callback),
      <FormattedMessage
        defaultMessage={`
            <br></br>
            {deletingGuestPass}
            {deletingDPSK}`}
        values={{
          deletingGuestPass: isDeletingGuestPass ? getDeleteMessage('deletingGuestPass') : '',
          deletingDPSK: isDeletingDPSK ? getDeleteMessage('deletingDPSK') : '',
          br: () => <br />
        }}
      />
    )
  }

  function toggleOnboardNetworks () {
    setExpandOnboardingNetworks(!expandOnboardingNetworks)
  }

  const expandable = {
    expandedRowKeys
  }

  const hasAddNetworkPermission = rbacOpsApiEnabled ?
    hasAllowedOperations([ addNetworkOpsApi, updateNetworkOpsApi, deleteNetworkOpsApi ])
    : (hasCrossVenuesPermission()
    && hasPermission({ scopes: [WifiScopes.CREATE, WifiScopes.UPDATE, WifiScopes.DELETE] }) )

  const showRowSelection = (selectable && hasAddNetworkPermission)

  useTrackLoadTime({
    itemName: widgetsMapping.NETWORK_TABLE,
    states: [tableQuery],
    isEnabled: isMonitoringPageEnabled
  })

  const handleFilterChange = (
    customFilters: FILTER,
    customSearch: SEARCH
  ) => {
    let customGroupFilters: { field: string; value: string }[][] = []
    let _customFilters = {
      ...customFilters
    }

    if (customFilters?.nwSubType) {
      const nwSubType = customFilters?.nwSubType
      customGroupFilters = nwSubType.map((item: unknown) => {
        const itemArray = item as string[]
        if (itemArray.length === 2) {
          return [{ field: 'captiveType', value: itemArray[1] }]
        } else {
          return [{ field: 'nwSubType', value: itemArray[0] }]
        }
      })

      _customFilters = omit(customFilters, ['nwSubType'])
    }

    const customPayload = {
      ...tableQuery.payload,
      ...customSearch,
      filters: _customFilters,
      groupFilters: customGroupFilters
    }

    tableQuery.setPayload(customPayload)
  }

  return (
    <Loader states={[
      tableQuery,
      { isLoading: false, isFetching: isDeleteNetworkUpdating }
    ]}>
      <Table
        settingsId={settingsId}
        columns={getCols(intl, searchable, filterables)}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        onFilterChange={(filterables?.nwSubType)
          ? handleFilterChange
          : tableQuery.handleFilterChange}
        rowKey='id'
        expandedRowKeys={expandedRowKeys}
        expandIconColumnIndex={-1}
        expandIcon={() => <></>}
        expandable={expandable}
        enableApiFilter={true}
        rowActions={filterByAccess(rowActions)}
        rowSelection={showRowSelection && {
          type: 'radio',
          getCheckboxProps: (record: Network) => {
            const { isOnBoarded, isOweMaster, owePairNetworkId } = record || {}
            const isOweTransition = (isOweMaster === false && owePairNetworkId !== undefined)
            return {
              disabled: !!isOnBoarded || isOweTransition
            }},
          renderCell: (checked: boolean, record: Network, index: number, node: ReactNode) => {
            if (record?.isOnBoarded) {
              return null
            }
            return node
          } }}
        actions={isBetaDPSK3FeatureEnabled && isWpaDsae3Toggle && showOnboardNetworkToggle ? [{
          key: 'toggleOnboardNetworks',
          label: expandOnboardingNetworks
            ? $t({ defaultMessage: 'Hide Onboard Networks' })
            : $t({ defaultMessage: 'Show Onboard Networks' }),
          onClick: () => toggleOnboardNetworks()
        }]: []}
      />
    </Loader>
  )
}

function isSelectedGuestNetwork (networks: Network[]|WifiNetwork[]) {
  /*
  const guestNetworks = networks.filter(network => {
    const { nwSubType, captiveType } = network
    return (nwSubType === NetworkTypeEnum.CAPTIVEPORTAL &&
      captiveType === GuestNetworkTypeEnum.GuestPass)
  })

  return guestNetworks?.length > 0
  */
  const findGuestNetwork = networks.find(network => {
    const { nwSubType, captiveType } = network
    return (nwSubType === NetworkTypeEnum.CAPTIVEPORTAL &&
      captiveType === GuestNetworkTypeEnum.GuestPass)
  })
  return !!findGuestNetwork
}

function isSelectedDpskNetwork (networks: Network[]|WifiNetwork[]) {
  //const dpskNetworks = networks.filter(network => network.nwSubType === NetworkTypeEnum.DPSK)
  //return dpskNetworks?.length > 0
  const findDpskNetwork = networks.find(network => network.nwSubType === NetworkTypeEnum.DPSK)
  return !!findDpskNetwork
}
