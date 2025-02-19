import { ReactNode, useEffect, useState } from 'react'

import { useIntl, FormattedMessage } from 'react-intl'
import { useNavigate, useParams }    from 'react-router-dom'

import { showActionModal,
  Loader,
  TableProps,
  Table,
  cssStr,
  Tooltip
} from '@acx-ui/components'
import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { useDeleteNetworkMutation, useLazyVenuesListQuery }       from '@acx-ui/rc/services'
import {
  NetworkTypeEnum,
  Network,
  NetworkType,
  TableQuery,
  GuestNetworkTypeEnum,
  checkVenuesNotInSetup,
  WlanSecurityEnum,
  WifiNetwork,
  WifiRbacUrlsInfo,
  useConfigTemplate,
  ConfigTemplateUrlsInfo
} from '@acx-ui/rc/utils'
import { TenantLink, useTenantLink }  from '@acx-ui/react-router-dom'
import { RequestPayload, WifiScopes } from '@acx-ui/types'
import {
  filterByAccess,
  getUserProfile,
  hasAllowedOperations,
  hasCrossVenuesPermission,
  hasPermission
} from '@acx-ui/user'
import { getIntl, getOpsApi, noDataDisplay, useTrackLoadTime, widgetsMapping } from '@acx-ui/utils'

import { useEnforcedStatus } from '../configTemplates/EnforcedButton'


const disabledType: NetworkTypeEnum[] = []

function getCols (intl: ReturnType<typeof useIntl>, isUseWifiRbacApi: boolean) {
  function getSecurityProtocol (securityProtocol: WlanSecurityEnum, oweMaster?: boolean) {
    let _securityProtocol: string = ''
    switch (securityProtocol) {
      case WlanSecurityEnum.WPA2Personal:
        _securityProtocol = intl.$t({ defaultMessage: 'WPA2 (Recommended)' })
        break
      case WlanSecurityEnum.WPAPersonal:
        _securityProtocol = intl.$t({ defaultMessage: 'WPA' })
        break
      case WlanSecurityEnum.WPA23Mixed:
        _securityProtocol = intl.$t({ defaultMessage: 'WPA2/WPA3 mixed mode' })
        break
      case WlanSecurityEnum.OWE:
        _securityProtocol = intl.$t({ defaultMessage: 'OWE' })
        break
      case WlanSecurityEnum.OWETransition:
        _securityProtocol = oweMaster === false ?
          intl.$t({ defaultMessage: 'OWE' }) : intl.$t({ defaultMessage: 'Open' })
        break
      case WlanSecurityEnum.WPA3:
        _securityProtocol = intl.$t({ defaultMessage: 'WPA3' })
        break
      case WlanSecurityEnum.WPA2Enterprise:
        _securityProtocol = intl.$t({ defaultMessage: 'WPA2 Enterprise' })
        break
      case WlanSecurityEnum.WEP:
        _securityProtocol = intl.$t({ defaultMessage: 'WEP' })
        break
      case WlanSecurityEnum.Open:
        _securityProtocol = intl.$t({ defaultMessage: 'Open' })
        break
      case WlanSecurityEnum.OpenCaptivePortal:
        _securityProtocol = intl.$t({ defaultMessage: 'Open Captive Portal' })
        break
    }
    return _securityProtocol
  }
  const columns: TableProps<Network|WifiNetwork>['columns'] = [
    {
      key: 'name',
      title: intl.$t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      fixed: 'left',
      defaultSortOrder: 'ascend',
      render: function (_, row) {
        if(disabledType.indexOf(row.nwSubType as NetworkTypeEnum) > -1){
          return row.name
        }else{
          return (row?.isOnBoarded
            ? <span>
              {row.name}
            </span>
            : <TenantLink to={`/networks/wireless/${row.id}/network-details/overview`}>
              {row.name}
              {row.name !== row.ssid &&
                <> {intl.$t({ defaultMessage: '(SSID: {ssid})' }, { ssid: row.ssid })}</>
              }
            </TenantLink>
          )
        }
      }
    },
    {
      key: 'description',
      title: intl.$t({ defaultMessage: 'Description' }),
      dataIndex: 'description',
      sorter: true
    },
    {
      key: 'nwSubType',
      title: intl.$t({ defaultMessage: 'Type' }),
      dataIndex: 'nwSubType',
      sorter: true,
      render: (_, row) => <NetworkType
        networkType={row.nwSubType as NetworkTypeEnum}
        row={row}
      />
    },
    {
      key: 'venues',
      title: intl.$t({ defaultMessage: '<VenuePlural></VenuePlural>' }),
      dataIndex: ['venues', 'count'],
      sorter: !isUseWifiRbacApi,
      sortDirections: ['descend', 'ascend', 'descend'],
      align: 'center',
      render: function (_, row) {
        if(disabledType.indexOf(row.nwSubType as NetworkTypeEnum) > -1){
          return row.venues?.count
        }else{
          return (
            row?.isOnBoarded
              ? <span>{row.venues?.count || noDataDisplay}</span>
              : <TenantLink
                to={`/networks/wireless/${row.id}/network-details/venues`}
                children={row.venues?.count ? row.venues?.count : 0}
              />
          )
        }
      }
    },
    {
      key: 'aps',
      title: intl.$t({ defaultMessage: 'APs' }),
      dataIndex: 'aps',
      sorter: !isUseWifiRbacApi,
      sortDirections: ['descend', 'ascend', 'descend'],
      align: 'center',
      render: function (_, row) {
        const apCount = row.aps
        if(disabledType.indexOf(row.nwSubType as NetworkTypeEnum) > -1){
          return apCount
        }else{
          return (
            <>
              {row?.isOnBoarded
                ? <span>{apCount || noDataDisplay}</span>
                : <TenantLink to={`/networks/wireless/${row.id}/network-details/aps`}>
                  {apCount}
                </TenantLink>}
              {row?.incompatible && row.incompatible > 0 ?
                <Tooltip.Warning isFilled
                  isTriangle
                  title={intl.$t({
                    defaultMessage: 'Some access points may not be compatible with ' +
                    'certain features on this network.'
                  })}
                  placement='right'
                  iconStyle={{
                    height: '16px',
                    width: '16px',
                    marginBottom: '-3px',
                    marginLeft: '4px',
                    color: cssStr('--acx-semantics-yellow-50'),
                    borderColor: cssStr('--acx-accents-orange-30')
                  }}
                /> : []
              }
            </>
          )
        }
      }
    },
    {
      key: 'clients',
      title: intl.$t({ defaultMessage: 'Clients' }),
      dataIndex: 'clients',
      sorter: false, // API does not seem to be working
      align: 'center',
      render: function (_, row) {
        const clientCount = row.clients

        return (
          row?.isOnBoarded
            ? <span>{clientCount || noDataDisplay}</span>
            : <TenantLink to={`/networks/wireless/${row.id}/network-details/clients`}>
              {clientCount}
            </TenantLink>
        )
      }
    },
    // { TODO: Wait for Services
    //   key: 'services',
    //   title: intl.$t({ defaultMessage: 'Services' }),
    //   dataIndex: 'services',
    //   sorter: true,
    //   align: 'center',
    //   show: isServicesEnabled
    // },
    {
      key: 'vlan',
      title: intl.$t({ defaultMessage: 'VLAN' }),
      dataIndex: 'vlan',
      sorter: true,
      render: function (_, row) {
        return transformVLAN(row)
      }
    },
    {
      key: 'securityProtocol',
      title: intl.$t({ defaultMessage: 'Security Protocol' }),
      dataIndex: 'securityProtocol',
      sorter: false,
      render: (data, row) =>
        getSecurityProtocol(row?.securityProtocol as WlanSecurityEnum, row?.isOweMaster) ||
        noDataDisplay
    }
    // { // TODO: Waiting for HEALTH feature support
    //   key: 'health',
    //   title: intl.$t({ defaultMessage: 'Health' }),
    //   dataIndex: 'health',
    //   sorter: true
    // },
    // { // TODO: Waiting for TAG feature support
    //   key: 'tags',
    //   title: intl.$t({ defaultMessage: 'Tags' }),
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
    'isEnforced',
    'isManagedByTemplate'
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
}

export function NetworkTable ({
  settingsId = 'network-table', tableQuery, selectable
}: NetworkTableProps) {
  const isWpaDsae3Toggle = useIsSplitOn(Features.WIFI_EDA_WPA3_DSAE_TOGGLE)
  const isBetaDPSK3FeatureEnabled = useIsTierAllowed(TierFeatures.BETA_DPSK3)
  const isUseWifiRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const isMonitoringPageEnabled = useIsSplitOn(Features.MONITORING_PAGE_LOAD_TIMES)

  const [expandOnBoaroardingNetworks, setExpandOnBoaroardingNetworks] = useState<boolean>(false)
  const [showOnboardNetworkToggle, setShowOnboardNetworkToggle] = useState<boolean>(false)
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([])
  const intl = useIntl()
  const { $t } = intl
  const { isTemplate } = useConfigTemplate()
  const { rbacOpsApiEnabled } = getUserProfile()
  const navigate = useNavigate()
  const linkToEditNetwork = useTenantLink('/networks/wireless/')
  const { hasEnforcedItem, getEnforcedActionMsg } = useEnforcedStatus()

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

      const exRowKeys = expandOnBoaroardingNetworks ? _rows : []
      setExpandedRowKeys(exRowKeys)
    }

  }, [tableQuery?.data?.data, expandOnBoaroardingNetworks])

  const { tenantId } = useParams()
  const [
    deleteNetwork, { isLoading: isDeleteNetworkUpdating }
  ] = useDeleteNetworkMutation()
  const [venuesList] = useLazyVenuesListQuery()

  async function getAdvertisedVenuesStatus (selectedNetwork: Network) {
    const payload = { fields: ['name', 'status'], filters: { name: selectedNetwork.venues.names } }
    const list = (await venuesList({ params: { tenantId }, payload }, true).unwrap()).data
    return list
  }

  const isActionDisabled = (selectedRows: Array<Network|WifiNetwork>) => {
    // eslint-disable-next-line max-len
    const isDsaeEnabled = (isBetaDPSK3FeatureEnabled && !isWpaDsae3Toggle) && (!!selectedRows[0]?.dsaeOnboardNetwork)
    const isEnforced = hasEnforcedItem(selectedRows)

    return isDsaeEnabled || isEnforced
  }

  const getRowActionTooltip = (selectedRows: Array<Network|WifiNetwork>) => {
    return getEnforcedActionMsg(selectedRows)
  }

  const rowActions: TableProps<Network|WifiNetwork>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      scopeKey: [WifiScopes.UPDATE],
      rbacOpsIds: [updateNetworkOpsApi],
      onClick: (selectedRows) => {
        navigate(`${linkToEditNetwork.pathname}/${selectedRows[0].id}/edit`, { replace: false })
      },
      disabled: isActionDisabled,
      tooltip: getRowActionTooltip
    },
    {
      label: $t({ defaultMessage: 'Clone' }),
      scopeKey: [WifiScopes.CREATE],
      rbacOpsIds: [addNetworkOpsApi],
      onClick: (selectedRows) => {
        navigate(`${linkToEditNetwork.pathname}/${selectedRows[0].id}/clone`, { replace: false })
      },
      disabled: (selectedRows) => (isBetaDPSK3FeatureEnabled
        && !isWpaDsae3Toggle) && (!!selectedRows[0]?.dsaeOnboardNetwork)
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      scopeKey: [WifiScopes.DELETE],
      rbacOpsIds: [deleteNetworkOpsApi],
      onClick: async ([selected], clearSelection) => {
        const isDeletingDPSK = isSelectedDpskNetwork([selected])
        const isDeletingGuestPass = isSelectedGuestNetwork([selected])
        const networkAdvertisedVenues = await getAdvertisedVenuesStatus(selected)
        const hideConfirmation = selected?.venues?.count === 0
          ? true : !checkVenuesNotInSetup(networkAdvertisedVenues)

        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Network' }),
            entityValue: selected.name,
            extraContent: <FormattedMessage
              defaultMessage={`
              <br></br>
              {deletingGuestPass}
              {deletingDPSK}
              <br></br>
              {confirmation}`}
              values={{
                deletingGuestPass: isDeletingGuestPass ? getDeleteMessage('deletingGuestPass') : '',
                deletingDPSK: isDeletingDPSK ? getDeleteMessage('deletingDPSK') : '',
                confirmation: !hideConfirmation ? getDeleteMessage('hasAdvertisedVenues') : '',
                br: () => <br />
              }}
            />,
            ...( !hideConfirmation && { confirmationText: 'Delete' })
          },
          onOk: () => deleteNetwork({
            params: { tenantId, networkId: selected.id },
            enableRbac: isUseWifiRbacApi
          }).then(clearSelection)
        })
      },
      disabled: isActionDisabled,
      tooltip: getRowActionTooltip
    }
  ]

  function toggleOnboardNetworks () {
    setExpandOnBoaroardingNetworks(!expandOnBoaroardingNetworks)
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

  return (
    <Loader states={[
      tableQuery,
      { isLoading: false, isFetching: isDeleteNetworkUpdating }
    ]}>
      <Table
        settingsId={settingsId}
        columns={getCols(intl, isUseWifiRbacApi)}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
        expandedRowKeys={expandedRowKeys}
        expandIconColumnIndex={-1}
        expandIcon={
          () => <></>
        }
        expandable={expandable}
        rowActions={filterByAccess(rowActions)}
        rowSelection={showRowSelection && {
          type: 'radio',
          getCheckboxProps: (record: Network) => ({
            disabled: !!record?.isOnBoarded
              || disabledType.indexOf(record.nwSubType as NetworkTypeEnum) > -1
              || (record?.isOweMaster === false && record?.owePairNetworkId !== undefined)
          }),
          renderCell: (checked: boolean, record: Network, index: number, node: ReactNode) => {
            if (record?.isOnBoarded) {
              return <></>
            }
            return node
          } }}
        actions={isBetaDPSK3FeatureEnabled && isWpaDsae3Toggle && showOnboardNetworkToggle ? [{
          key: 'toggleOnboardNetworks',
          label: expandOnBoaroardingNetworks
            ? $t({ defaultMessage: 'Hide Onboard Networks' })
            : $t({ defaultMessage: 'Show Onboard Networks' }),
          onClick: () => toggleOnboardNetworks()
        }]: []}
      />
    </Loader>
  )
}

function isSelectedGuestNetwork (networks: Network[]|WifiNetwork[]) {
  const guestNetworks = networks.filter(network => {
    const { nwSubType, captiveType } = network
    return (nwSubType === NetworkTypeEnum.CAPTIVEPORTAL &&
      captiveType === GuestNetworkTypeEnum.GuestPass)
  })

  return guestNetworks?.length > 0
}

function isSelectedDpskNetwork (networks: Network[]|WifiNetwork[]) {
  const dpskNetworks = networks.filter(network => network.nwSubType === NetworkTypeEnum.DPSK)
  return dpskNetworks?.length > 0
}
