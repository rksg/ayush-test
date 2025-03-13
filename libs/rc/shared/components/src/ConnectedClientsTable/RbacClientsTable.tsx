/* eslint-disable max-len */
import React, { useState, useEffect } from 'react'

import { Space }              from 'antd'
import { cloneDeep }          from 'lodash'
import { IntlShape, useIntl } from 'react-intl'

import { Subtitle, Tooltip, Table, TableProps, Loader, showActionModal  } from '@acx-ui/components'
import { AsyncColumnLoader }                                              from '@acx-ui/components'
import { Features, useIsSplitOn }                                         from '@acx-ui/feature-toggle'
import {
  useVenuesListQuery,
  useApListQuery,
  useRevokeClientMutation,
  useDisconnectClientMutation,
  useLazyApListQuery,
  useWifiNetworkListQuery,
  useGetClientsQuery
} from '@acx-ui/rc/services'
import {
  getDeviceTypeIcon,
  getOsTypeIcon,
  usePollingTableQuery,
  networkTypes,
  ClientInfo,
  getClientHealthClass,
  ClientUrlsInfo
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'
import { WifiScopes }            from '@acx-ui/types'
import {
  filterByAccess,
  getUserProfile,
  hasAllowedOperations,
  hasPermission
} from '@acx-ui/user'
import { getOpsApi, noDataDisplay, useTrackLoadTime, widgetsMapping } from '@acx-ui/utils'

import { ClientHealthIcon } from '../ClientHealthIcon'

import * as UI from './styledComponents'

import { ClientsTableProps, defaultRbacClientPayload, isEqualCaptivePortal, networkDisplayTransformer } from '.'

function GetVenueFilterOptions (tenantId: string|undefined) {
  const { venueFilterOptions } = useVenuesListQuery({ params: { tenantId }, payload: {
    fields: ['name', 'country', 'latitude', 'longitude', 'id'],
    pageSize: 10000,
    sortField: 'name',
    sortOrder: 'ASC'
  } }, {
    selectFromResult: ({ data }) => ({
      venueFilterOptions: data?.data?.map(v=>({ key: v.id, value: v.name })) || true
    })
  })
  return venueFilterOptions
}

function GetApFilterOptions (tenantId: string|undefined, venueId: string|undefined) {
  const { apFilterOptions } = useApListQuery({
    params: { tenantId },
    payload: {
      fields: ['name', 'serialNumber'],
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC',
      filters: venueId ? { venueId: [venueId] } : {}
    },
    enableRbac: true
  }, {
    selectFromResult: ({ data }) => ({
      apFilterOptions: data?.data?.map(v=>({ key: v.serialNumber, value: v.name? v.name : v.serialNumber })) || true
    })
  })
  return apFilterOptions
}

function GetNetworkFilterOptions (tenantId: string|undefined) {
  const { networkFilterOptions } = useWifiNetworkListQuery({ params: { tenantId }, payload: {
    fields: ['name', 'ssid'],
    pageSize: 10000,
    sortField: 'name',
    sortOrder: 'ASC'
  } }, {
    selectFromResult: ({ data }) => ({
      networkFilterOptions: data?.data?.map(v=>({
        key: v.ssid,
        value: v.name === v.ssid ? v.name : `${v.name} (SSID: ${v.ssid})`
      })) || true
    })
  })
  return networkFilterOptions
}

const AsyncLoadingInColumn = (
  row: ClientInfo,
  callBack: Function,
  loadingCondition?: (row: ClientInfo) => boolean,
  animation?: boolean
): React.ReactNode => {
  if (!animation) {
    return callBack()
  }

  const defaultCondition = (row: ClientInfo) => !!row.apInformation?.name || !!row.venueInformation?.name

  if ((loadingCondition ?? defaultCondition)(row)) {
    return callBack()
  }
  return <AsyncColumnLoader />
}


export const RbacClientsTable = (props: ClientsTableProps<ClientInfo>) => {
  const { $t } = useIntl()
  const params = useParams()
  const { rbacOpsApiEnabled } = getUserProfile()
  const disconnectRevokeClientOpsApi = getOpsApi(ClientUrlsInfo.disconnectClient)
  const wifiEDAClientRevokeToggle = useIsSplitOn(Features.WIFI_EDA_CLIENT_REVOKE_TOGGLE)
  const enabledUXOptFeature = useIsSplitOn(Features.UX_OPTIMIZATION_FEATURE_TOGGLE)
  const isMonitoringPageEnabled = useIsSplitOn(Features.MONITORING_PAGE_LOAD_TIMES)

  const { showAllColumns, searchString, setConnectedClientCount } = props
  const [ tableSelected, setTableSelected] = useState({
    selectedRowKeys: [] as string[],
    selectRows: [] as ClientInfo[],
    actionButton: {
      revoke: {
        disable: false,
        showModal: false
      }
    }
  })
  const [ sendRevoke ] = useRevokeClientMutation()
  const [ sendDisconnect ] = useDisconnectClientMutation()
  const [ getApList] = useLazyApListQuery()
  defaultRbacClientPayload.filters = params.venueId ? { 'venueInformation.id': [params.venueId] } :
    params.serialNumber ? { 'apInformation.serialNumber': [params.serialNumber] } :
      params.apId ? { 'apInformation.serialNumber': [params.apId] } :
        params.networkId ? { 'networkInformation.id': [params.networkId] } : {}

  const settingsId = 'connected-clients-table'
  const inlineTableQuery = usePollingTableQuery({
    useQuery: useGetClientsQuery,
    defaultPayload: { ...defaultRbacClientPayload, searchString },
    search: {
      searchTargetFields: defaultRbacClientPayload.searchTargetFields,
      searchString: searchString
    },
    option: { skip: !!props.tableQuery },
    pagination: { settingsId }
  })

  // Backend API will send Client Mac by uppercase, that will make Ant Table
  // treats same UE as two different UE and cause sending duplicate mac in
  // disconnect/revoke request. The API should be fixed in near future.
  const tableQuery = props.tableQuery || inlineTableQuery
  useEffect(() => {
    // Remove selection when UE is disconnected.
    const connectedClientList = tableQuery.data?.data

    if (!connectedClientList) {
      setTableSelected({
        ...tableSelected,
        selectedRowKeys: [] as string[],
        selectRows: [] as ClientInfo[]
      })
    }
    else {
      if (setConnectedClientCount) {
        setConnectedClientCount(tableQuery.data?.totalCount ?? 0)
      }
      const clonedSelection = cloneDeep(tableSelected)
      const newSelectRows = clonedSelection.selectRows.filter((row) => {
        return connectedClientList?.find((client) => client.macAddress === row.macAddress)
      })
      const newSelectRowkeys = clonedSelection.selectedRowKeys.filter((key) => {
        return connectedClientList?.find((client) => client.macAddress === key)
      })
      setTableSelected({
        ...tableSelected,
        selectedRowKeys: newSelectRowkeys,
        selectRows: newSelectRows
      })
    }
  }, [tableQuery.data?.data, tableQuery.data?.totalCount])

  useEffect(() => {
    if (searchString !== undefined && tableQuery.payload.searchString !== searchString) {
      tableQuery.setPayload({
        ...(tableQuery.payload as typeof defaultRbacClientPayload), searchString })
    }
  }, [searchString])

  function GetCols (intl: IntlShape, showAllColumns?: boolean) {
    const { $t } = useIntl()
    const wifi7MLOToggle = useIsSplitOn(Features.WIFI_EDA_WIFI7_MLO_TOGGLE)
    const { tenantId, venueId, apId, networkId } = useParams()

    const clientStatuses = () => [
      { key: null, text: $t({ defaultMessage: 'All Health Levels' }) },
      { key: 'Poor', text: $t({ defaultMessage: 'Poor' }) },
      { key: 'Average', text: $t({ defaultMessage: 'Average' }) },
      { key: 'Good', text: $t({ defaultMessage: 'Good' }) }
    ] as Array<{ key: string, text: string }>

    const statusFilterOptions = clientStatuses().map(({ key, text }) => ({
      key, value: text
    }))

    const columns: TableProps<ClientInfo>['columns'] = [
      {
        key: 'hostname',
        title: intl.$t({ defaultMessage: 'Hostname' }),
        dataIndex: 'hostname',
        sorter: true,
        fixed: 'left',
        defaultSortOrder: 'ascend',
        render: (_, row) => {
          return <TenantLink
            to={`users/wifi/clients/${row.macAddress}/details/overview?clientStatus=connected`}
          >{row.hostname || noDataDisplay}</TenantLink>
        }
      },
      {
        key: 'osType',
        width: 60,
        title: intl.$t({ defaultMessage: 'OS' }),
        dataIndex: 'osType',
        align: 'center',
        sorter: true,
        render: (_, { osType }) => {
          return <UI.IconContainer>
            <Tooltip title={osType}>
              { getOsTypeIcon(osType) }
            </Tooltip>
          </UI.IconContainer>
        }
      },
      {
        key: 'signalStatus.health',
        width: 70,
        title: intl.$t({ defaultMessage: 'Health' }),
        dataIndex: 'signalStatus.health',
        align: 'center',
        sorter: true,
        filterMultiple: false,
        filterValueNullable: false,
        filterable: statusFilterOptions,
        render: (_, row) => {
          return AsyncLoadingInColumn(row, () => {
            const health = row.signalStatus?.health
            const healthClass = getClientHealthClass(health)

            return <Tooltip title={health}>
              <Space>
                <ClientHealthIcon type={healthClass} />
              </Space>
            </Tooltip>
          })
        }
      },
      {
        key: 'macAddress',
        title: intl.$t({ defaultMessage: 'MAC Address' }),
        dataIndex: 'macAddress',
        sorter: true,
        disable: true,
        render: (_, { macAddress }) => {
          const mac = macAddress || undefined
          return <Tooltip title={mac}>
            {mac || noDataDisplay}
          </Tooltip>
        }
      },
      ...(wifi7MLOToggle ? [{
        key: 'mldMacAddress',
        title: intl.$t({ defaultMessage: 'MLD MAC Address' }),
        dataIndex: 'mldMacAddress',
        sorter: true,
        disable: false,
        show: false,
        render: (_: React.ReactNode, row: ClientInfo) => {
          return AsyncLoadingInColumn(row, () => {
            const mac = row.mldMacAddress?.toLowerCase() || undefined
            return <Tooltip title={mac}>
              {mac || noDataDisplay}
            </Tooltip>
          }, (row) => row.mldMacAddress !== undefined || !!row.apInformation?.name || !!row.venueInformation?.name)
        }
      }] : []),
      {
        key: 'ipAddress',
        title: intl.$t({ defaultMessage: 'IP Address' }),
        dataIndex: 'ipAddress',
        sorter: true,
        render: (_, { ipAddress }) => {
          return <Tooltip title={ipAddress}>
            {ipAddress || noDataDisplay}
          </Tooltip>
        }
      },
      {
        key: 'username',
        title: intl.$t({ defaultMessage: 'Username' }),
        dataIndex: 'username',
        sorter: true,
        render: (_, row) => {
          return AsyncLoadingInColumn(row, () => {
            return <Tooltip title={row.username}>
              {row.username || noDataDisplay}
            </Tooltip>
          })
        }
      },
      ...(venueId ? [] : [{
        key: 'venueInformation.id',
        title: intl.$t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
        dataIndex: 'venueInformation.name',
        sorter: true,
        filterKey: 'venueInformation.id',
        filterable: apId ? false : venueId ? false : GetVenueFilterOptions(tenantId),
        render: (_: React.ReactNode, row: ClientInfo) => {
          return AsyncLoadingInColumn(row, () => {
            const { venueInformation } = row
            return (
              <TenantLink to={`/venues/${venueInformation.id}/venue-details/overview`}>
                {venueInformation.name}
              </TenantLink>
            )
          })
        }
      }]),
      {
        key: 'apInformation.serialNumber',
        title: intl.$t({ defaultMessage: 'AP' }),
        dataIndex: 'apInformation.name',
        sorter: true,
        filterKey: 'apInformation.serialNumber',
        filterable: apId ? false : GetApFilterOptions(tenantId, venueId),
        render: (_, row) => {
          return AsyncLoadingInColumn(row, () => {
            const { apInformation } = row
            if (apInformation.serialNumber === undefined) {
              return apInformation.name
            } else {
              return (
                <TenantLink to={`/devices/wifi/${apInformation.serialNumber}/details/overview`}>
                  {apInformation.name}
                </TenantLink>
              )
            }
          })
        }
      },
      {
        key: 'switchInformation.serialNumber',
        title: intl.$t({ defaultMessage: 'Switch' }),
        dataIndex: 'switchInformation.name',
        sorter: false, // switch information doesn't existed in the client viewmodel
        render: (_: React.ReactNode, row: ClientInfo) => {
          return AsyncLoadingInColumn(row, () => {
            const { name, id, serialNumber } = row.switchInformation || {}
            if (!name) {
              return noDataDisplay
            } else {
              return (
                <TenantLink to={`/devices/switch/${id}/${serialNumber}/details/overview`}>{name}</TenantLink>
              )
            }
          })
        }
      },
      ...(networkId ? [] : [{
        key: 'networkInformation.ssid',
        title: intl.$t({ defaultMessage: 'Network' }),
        dataIndex: 'networkInformation.ssid',
        sorter: true,
        filterable: networkId ? false : GetNetworkFilterOptions(tenantId),
        render: (_: React.ReactNode, row: ClientInfo) => {
          return AsyncLoadingInColumn(row, () => {
            if (!row.networkInformation?.id) {
              return row.networkInformation.ssid
            } else {
              const { networkInformation } = row
              return (
                <TenantLink to={`/networks/wireless/${networkInformation.id}/network-details/overview`}>
                  {networkInformation.ssid}
                </TenantLink>
              )
            }
          })
        }
      }]),
      ...(wifiEDAClientRevokeToggle ?[{
        key: 'networkInformation.type',
        title: intl.$t({ defaultMessage: 'Network Type' }),
        dataIndex: 'networkInformation.type',
        sorter: true,
        filterable: Object.entries(networkTypes).map(([key, value]) => {return { key: key, value: $t(value) }}),
        render: (_: React.ReactNode, row: ClientInfo) => {
          return AsyncLoadingInColumn(row, () => {
            return networkDisplayTransformer(intl, row.networkInformation.type)
          })
        }
      }] : []),
      {
        key: 'connectedTime',
        title: intl.$t({ defaultMessage: 'Time Connected' }),
        dataIndex: 'connectedTime',
        sorter: true,
        render: (_, row) => {
          return row.connectedTimeString
        }
      },
      {
        key: 'networkInformation.vlan',
        title: intl.$t({ defaultMessage: 'VLAN' }),
        dataIndex: 'networkInformation.vlan',
        sorter: true,
        align: 'center',
        show: !!showAllColumns,
        render: (_, { networkInformation }) => networkInformation?.vlan || noDataDisplay
      },
      {
        key: 'networkInformation.vni',
        title: intl.$t({ defaultMessage: 'VNI' }),
        dataIndex: 'networkInformation.vni',
        sorter: true,
        align: 'center',
        show: !!showAllColumns,
        render: (_, row) => {
          return AsyncLoadingInColumn(row, () => {
            return row.networkInformation.vni || noDataDisplay
          })
        }
      },
      {
        key: 'deviceType',
        title: intl.$t({ defaultMessage: 'Device Type' }),
        dataIndex: 'deviceType',
        sorter: true,
        align: 'center',
        show: !!showAllColumns,
        render: (_, row) => {
          return AsyncLoadingInColumn(row, () => {
            return <UI.IconContainer>
              <Tooltip title={row.deviceType}>
                {getDeviceTypeIcon(row.deviceType)}
              </Tooltip>
            </UI.IconContainer>
          })
        }
      },
      {
        key: 'modelName',
        title: intl.$t({ defaultMessage: 'Model Name' }),
        dataIndex: 'modelName',
        sorter: true,
        show: !!showAllColumns,
        render: (_, { modelName }) => modelName || noDataDisplay
      },
      {
        key: 'trafficStatus.totalTraffic',
        title: intl.$t({ defaultMessage: 'Traffic (Session)' }),
        dataIndex: 'trafficStatus.totalTraffic',
        sorter: true,
        show: !!showAllColumns,
        render: (_, row) => {
          return AsyncLoadingInColumn(row, () => {
            return row.trafficStatus?.totalTraffic || noDataDisplay
          })
        }
      },
      {
        key: 'trafficStatus.trafficToClient',
        title: intl.$t({ defaultMessage: 'Traffic To Client' }),
        dataIndex: 'trafficStatus.trafficToClient',
        sorter: true,
        show: !!showAllColumns,
        render: (_, { trafficStatus }) => trafficStatus?.trafficToClient || noDataDisplay
      },
      {
        key: 'trafficStatus.trafficFromClient',
        title: intl.$t({ defaultMessage: 'Traffic From Client' }),
        dataIndex: 'trafficStatus.trafficFromClient',
        sorter: true,
        show: !!showAllColumns,
        render: (_, { trafficStatus }) => trafficStatus?.trafficFromClient || noDataDisplay
      },
      {
        key: 'signalStatus.rssi',
        title: intl.$t({ defaultMessage: 'RSSI' }),
        dataIndex: 'signalStatus.rssi',
        sorter: true,
        align: 'center',
        show: !!showAllColumns,
        render: (_, row) => {
          return AsyncLoadingInColumn(row, () => {
            return row.signalStatus?.rssi || noDataDisplay
          })
        }
      },
      {
        key: 'signalStatus.snr',
        title: intl.$t({ defaultMessage: 'SNR' }),
        dataIndex: 'signalStatus.snr',
        sorter: true,
        align: 'center',
        show: !!showAllColumns,
        render: (_, row) => {
          return AsyncLoadingInColumn(row, () => {
            return row.signalStatus?.snr || noDataDisplay
          })
        }
      },
      {
        key: 'radioStatus.type',
        title: intl.$t({ defaultMessage: 'Radio Type' }),
        dataIndex: 'radioStatus.type',
        sorter: true,
        show: !!showAllColumns,
        render: (_, row) => {
          return AsyncLoadingInColumn(row, () => {
            return row.radioStatus?.type || noDataDisplay
          })
        }
      },
      {
        key: 'cpeMacAddress',
        title: intl.$t({ defaultMessage: 'CPE MAC Address' }),
        dataIndex: 'cpeMacAddress',
        sorter: true,
        show: !!showAllColumns,
        render: (_, row) => {
          return AsyncLoadingInColumn(row, () => {
            return row.cpeMacAddress || noDataDisplay
          })
        }
      },
      {
        key: 'networkInformation.authenticationMethod',
        title: intl.$t({ defaultMessage: 'Auth Method' }),
        dataIndex: 'networkInformation.authenticationMethod',
        sorter: true,
        show: !!showAllColumns,
        render: (_, { networkInformation }) => networkInformation?.authenticationMethod || noDataDisplay
      },
      {
        key: 'authenticationStatus',
        title: intl.$t({ defaultMessage: 'Auth Status' }),
        dataIndex: 'authenticationStatus',
        sorter: true,
        show: !!showAllColumns,
        render: (_, { authenticationStatus }) => {
          if (!authenticationStatus) return noDataDisplay

          let statusText = noDataDisplay as string
          if (authenticationStatus === 1) {
            statusText = intl.$t({ defaultMessage: 'Authorized' })
          } else if (authenticationStatus === 0) {
            statusText = intl.$t({ defaultMessage: 'Unauthorized' })
          } else if (authenticationStatus === -1) {
            statusText = intl.$t({ defaultMessage: 'N/A' })
          }
          return statusText
        }
      },
      {
        key: 'networkInformation.encryptionMethod',
        title: intl.$t({ defaultMessage: 'Encryption' }),
        dataIndex: 'networkInformation.encryptionMethod',
        sorter: true,
        show: !!showAllColumns,
        render: (_, { networkInformation }) => networkInformation?.encryptionMethod || noDataDisplay
      },
      {
        key: 'trafficStatus.packetsToClient',
        title: intl.$t({ defaultMessage: 'Packets To Client' }),
        dataIndex: 'trafficStatus.packetsToClient',
        sorter: true,
        align: 'center',
        show: !!showAllColumns,
        render: (_, { trafficStatus }) => trafficStatus?.packetsToClient || noDataDisplay
      },
      {
        key: 'trafficStatus.packetsFromClient',
        title: intl.$t({ defaultMessage: 'Packets From Client' }),
        dataIndex: 'trafficStatus.packetsFromClient',
        sorter: true,
        align: 'center',
        show: !!showAllColumns,
        render: (_, { trafficStatus }) => trafficStatus?.packetsFromClient || noDataDisplay
      },
      {
        key: 'trafficStatus.framesDropped',
        title: intl.$t({ defaultMessage: 'Packets Dropped' }),
        dataIndex: 'trafficStatus.framesDropped',
        sorter: true,
        align: 'center',
        show: !!showAllColumns,
        render: (_, row) => {
          return AsyncLoadingInColumn(row, () => {
            return row.trafficStatus?.framesDropped || noDataDisplay
          })
        }
      },
      {
        key: 'radioStatus.channel',
        title: intl.$t({ defaultMessage: 'RF Channel' }),
        dataIndex: 'radioStatus.channel',
        sorter: true,
        align: 'center',
        show: !!showAllColumns,
        render: (_, row) => {
          return AsyncLoadingInColumn(row, () => {
            if (!row.radioStatus) return noDataDisplay
            const channel = row.radioStatus.channel || noDataDisplay
            const band = row.band ? ` (${row.band})` : ''
            return channel + band
          })
        }
      }
      // { // TODO: Waiting for TAG feature support
      //   key: 'tags',
      //   title: intl.$t({ defaultMessage: 'Tags' }),
      //   dataIndex: 'tags'
      // }
    ]
    return columns
  }

  const rowSelection = {
    selectedRowKeys: tableSelected.selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[], newSelectedRows: ClientInfo[]) => {
      const isNoGuestNetworkExist = newSelectedRows.filter((row) => isEqualCaptivePortal(row.networkInformation.type)).length === 0
      const isOtherNetworkExist = newSelectedRows.filter((row) => {
        if (row.apInformation?.serialNumber === undefined) {
          return false
        }
        return !isEqualCaptivePortal(row.networkInformation.type)
      }).length !== 0
      setTableSelected({
        selectedRowKeys: newSelectedRowKeys as string[],
        selectRows: newSelectedRows,
        actionButton: {
          revoke: {
            disable: isNoGuestNetworkExist,
            showModal: isOtherNetworkExist
          }
        }
      })
    }
  }

  const rowActions: TableProps<ClientInfo>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Disconnect' }),
      scopeKey: [WifiScopes.UPDATE],
      rbacOpsIds: [disconnectRevokeClientOpsApi],
      onClick: async (selectedRows, clearRowSelections) => {
        const selectedVenues = selectedRows.map((row) => row.venueInformation.id)
        const allAps = (await getApList({ params,
          payload: {
            fields: ['serialNumber', 'apMac'],
            filters: { venueId: selectedVenues }
          },
          enableRbac: true
        })).data
        selectedRows.forEach((row) => {
          sendDisconnect({
            params: {
              venueId: row.venueInformation.id,
              clientMacAddress: row.macAddress,
              serialNumber: allAps?.data.find((ap) => ap.apMac === row.apInformation.macAddress)?.serialNumber
            }, payload: {
              status: 'DISCONNECTED'
            } })
        })
        clearRowSelections()
      }
    },
    {
      label: $t({ defaultMessage: 'Revoke' }),
      scopeKey: [WifiScopes.UPDATE],
      rbacOpsIds: [disconnectRevokeClientOpsApi],
      tooltip: (tableSelected.actionButton.revoke.disable ?
        $t({ defaultMessage: 'Only clients connected to captive portal networks may have their access revoked' })
        :''
      ),
      disabled: tableSelected.actionButton.revoke.disable,
      onClick: (selectedRows, clearRowSelections) => {
        if (tableSelected.actionButton.revoke.showModal){
          showActionModal({
            type: 'info',
            width: 450,
            title: $t({ defaultMessage: 'Revoking Client Access' }),
            content: $t({ defaultMessage: 'Only clients connected to captive portal networks may have their access revoked' }),
            okText: $t({ defaultMessage: 'OK' }),
            onOk: async () => {
              selectedRows.filter((row) => isEqualCaptivePortal(row.networkInformation.type)).forEach((row) => {
                sendRevoke({ params: {
                  venueId: row.venueInformation.id,
                  clientMacAddress: row.macAddress,
                  serialNumber: row.apInformation.serialNumber
                } })
              })
            }
          })
        } else {
          selectedRows.filter((row) => isEqualCaptivePortal(row.networkInformation.type)).forEach((row) => {
            sendRevoke({ params: {
              venueId: row.venueInformation.id,
              clientMacAddress: row.macAddress,
              serialNumber: row.apInformation.serialNumber
            } })
          })
        }

        clearRowSelections()
      }
    }
  ]

  const showRowSelection = (wifiEDAClientRevokeToggle && (rbacOpsApiEnabled
    ? hasAllowedOperations([disconnectRevokeClientOpsApi])
    : hasPermission({ scopes: [ WifiScopes.UPDATE, WifiScopes.DELETE] })))

  useTrackLoadTime({
    itemName: widgetsMapping.WIRELESS_CLIENTS_TABLE,
    states: [tableQuery],
    isEnabled: isMonitoringPageEnabled
  })

  return (
    <UI.ClientTableDiv>
      <Loader states={[
        tableQuery
      ]}>
        <Subtitle level={4}>
          {$t({ defaultMessage: 'Connected Clients' })}
        </Subtitle>
        <Table<ClientInfo>
          rowSelection={(showRowSelection && rowSelection)}
          rowActions={(wifiEDAClientRevokeToggle ? filterByAccess(rowActions) : undefined)}
          settingsId={settingsId}
          columns={GetCols(useIntl(), showAllColumns)}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter={true}
          floatRightFilters={true}
          rowKey='macAddress'
          filterPersistence={enabledUXOptFeature}
        />
      </Loader>
    </UI.ClientTableDiv>
  )
}
