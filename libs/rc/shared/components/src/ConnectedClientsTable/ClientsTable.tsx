/* eslint-disable max-len */
import React, { useState, useEffect } from 'react'

import { Space }              from 'antd'
import { cloneDeep }          from 'lodash'
import { IntlShape, useIntl } from 'react-intl'

import { Subtitle, Tooltip, Table, TableProps, Loader, showActionModal  } from '@acx-ui/components'
import { AsyncColumnLoader }                                              from '@acx-ui/components'
import { Features, useIsSplitOn }                                         from '@acx-ui/feature-toggle'
import {
  useGetClientListQuery,
  useVenuesListQuery,
  useApListQuery,
  useNetworkListQuery,
  useRevokeClientMutation,
  useDisconnectClientMutation,
  useLazyApListQuery
} from '@acx-ui/rc/services'
import {
  ClientList,
  getDeviceTypeIcon,
  getOsTypeIcon,
  usePollingTableQuery,
  networkTypes } from '@acx-ui/rc/utils'
import { TenantLink, useParams }         from '@acx-ui/react-router-dom'
import { WifiScopes }                    from '@acx-ui/types'
import { filterByAccess, hasPermission } from '@acx-ui/user'
import { noDataDisplay }                 from '@acx-ui/utils'

import { ClientHealthIcon } from '../ClientHealthIcon'

import * as UI from './styledComponents'

import { ClientsTableProps, defaultClientPayload, isEqualCaptivePortal, networkDisplayTransformer } from '.'

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
    }
  }, {
    selectFromResult: ({ data }) => ({
      apFilterOptions: data?.data?.map(v=>({ key: v.serialNumber, value: v.name? v.name : v.serialNumber })) || true
    })
  })
  return apFilterOptions
}

function GetNetworkFilterOptions (tenantId: string|undefined) {
  const { networkFilterOptions } = useNetworkListQuery({ params: { tenantId }, payload: {
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
  row: ClientList,
  callBack: Function,
  loadingCondition?: (row: ClientList) => boolean,
  animation?: boolean
): React.ReactNode => {
  if (!animation) {
    return callBack()
  }

  const defaultCondition = (row: ClientList) =>
    row.apName === undefined && row.venueName === undefined

  if ((loadingCondition ?? defaultCondition)(row)) {
    return <AsyncColumnLoader />
  }
  return callBack()
}


export const ClientsTable = (props: ClientsTableProps<ClientList>) => {
  const { $t } = useIntl()
  const params = useParams()
  const wifiEDAClientRevokeToggle = useIsSplitOn(Features.WIFI_EDA_CLIENT_REVOKE_TOGGLE)
  const enabledUXOptFeature = useIsSplitOn(Features.UX_OPTIMIZATION_FEATURE_TOGGLE)

  const { showAllColumns, searchString, setConnectedClientCount } = props
  const [ tableSelected, setTableSelected] = useState({
    selectedRowKeys: [] as string[],
    selectRows: [] as ClientList[],
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
  defaultClientPayload.filters = params.venueId ? { venueId: [params.venueId] } :
    params.serialNumber ? { serialNumber: [params.serialNumber] } :
      params.apId ? { serialNumber: [params.apId] } :
        params.networkId ? { networkId: [params.networkId] } : {}

  const settingsId = 'connected-clients-table'
  const inlineTableQuery = usePollingTableQuery({
    useQuery: useGetClientListQuery,
    defaultPayload: { ...defaultClientPayload, searchString },
    search: {
      searchTargetFields: defaultClientPayload.searchTargetFields,
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
        selectRows: [] as ClientList[]
      })
    }
    else {
      if (setConnectedClientCount) {
        setConnectedClientCount(tableQuery.data?.totalCount ?? 0)
      }
      const clonedSelection = cloneDeep(tableSelected)
      const newSelectRows = clonedSelection.selectRows.filter((row) => {
        return connectedClientList?.find((client) => client.clientMac === row.clientMac)
      })
      const newSelectRowkeys = clonedSelection.selectedRowKeys.filter((key) => {
        return connectedClientList?.find((client) => client.clientMac === key)
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
        ...(tableQuery.payload as typeof defaultClientPayload), searchString })
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

    const columns: TableProps<ClientList>['columns'] = [
      {
        key: 'hostname',
        title: intl.$t({ defaultMessage: 'Hostname' }),
        dataIndex: 'hostname',
        sorter: true,
        fixed: 'left',
        defaultSortOrder: 'ascend',
        render: (_, row) => {
          return <TenantLink
            to={`users/wifi/clients/${row.clientMac}/details/overview?clientStatus=connected`}
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
        key: 'healthCheckStatus',
        width: 70,
        title: intl.$t({ defaultMessage: 'Health' }),
        dataIndex: 'healthCheckStatus',
        align: 'center',
        sorter: true,
        filterMultiple: false,
        filterValueNullable: false,
        filterable: statusFilterOptions,
        render: (_, row) => {
          return AsyncLoadingInColumn(row, () => {
            return <Tooltip title={row.healthCheckStatus}>
              <Space>
                <ClientHealthIcon type={row.healthClass} />
              </Space>
            </Tooltip>
          })
        }
      },
      {
        key: 'clientMac',
        title: intl.$t({ defaultMessage: 'MAC Address' }),
        dataIndex: 'clientMac',
        sorter: true,
        disable: true,
        render: (_, { clientMac }) => {
          const mac = clientMac?.toLowerCase() || undefined
          return <Tooltip title={mac}>
            {mac || noDataDisplay}
          </Tooltip>
        }
      },
      ...(wifi7MLOToggle ? [{
        key: 'mldAddr',
        title: intl.$t({ defaultMessage: 'MLD MAC Address' }),
        dataIndex: 'mldAddr',
        sorter: true,
        disable: false,
        show: false,
        render: (_: React.ReactNode, row: ClientList) => {
          return AsyncLoadingInColumn(row, () => {
            const mac = row.mldAddr?.toLowerCase() || undefined
            return <Tooltip title={mac}>
              {mac || noDataDisplay}
            </Tooltip>
          }, (row) => row.mldAddr === undefined && row.apName === undefined && row.venueName === undefined)
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
        key: 'Username',
        title: intl.$t({ defaultMessage: 'Username' }),
        dataIndex: 'Username',
        sorter: true,
        render: (_, row) => {
          return AsyncLoadingInColumn(row, () => {
            return <Tooltip title={row.Username}>
              {row.Username || noDataDisplay}
            </Tooltip>
          })
        }
      },
      ...(venueId ? [] : [{
        key: 'venueId',
        title: intl.$t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
        dataIndex: 'venueName',
        sorter: true,
        filterKey: 'venueId',
        filterable: apId ? false : venueId ? false : GetVenueFilterOptions(tenantId),
        render: (_: React.ReactNode, row: ClientList) => {
          return AsyncLoadingInColumn(row, () => {
            return (
              <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>{row.venueName}</TenantLink>
            )
          })
        }
      }]),
      {
        key: 'serialNumber',
        title: intl.$t({ defaultMessage: 'AP' }),
        dataIndex: 'apName',
        sorter: true,
        filterKey: 'serialNumber',
        filterable: apId ? false : GetApFilterOptions(tenantId, venueId),
        render: (_, row) => {
          return AsyncLoadingInColumn(row, () => {
            return (
              <TenantLink to={`/devices/wifi/${row.serialNumber}/details/overview`}>{row.apName}</TenantLink>
            )
          })
        }
      },
      {
        key: 'switchSerialNumber',
        title: intl.$t({ defaultMessage: 'Switch' }),
        dataIndex: 'switchName',
        sorter: true,
        render: (_: React.ReactNode, row: ClientList) => {
          return AsyncLoadingInColumn(row, () => {
            if(!row.switchName){
              return noDataDisplay
            } else {
              return (
                <TenantLink to={`/devices/switch/${row.switchId}/${row.switchSerialNumber}/details/overview`}>{row.switchName}</TenantLink>
              )
            }
          })
        }
      },
      ...(networkId ? [] : [{
        key: 'ssid',
        title: intl.$t({ defaultMessage: 'Network' }),
        dataIndex: 'ssid',
        sorter: true,
        filterKey: 'ssid',
        filterable: networkId ? false : GetNetworkFilterOptions(tenantId),
        render: (_: React.ReactNode, row: ClientList) => {
          return AsyncLoadingInColumn(row, () => {
            if (!row.healthCheckStatus) {
              return row.ssid
            } else {
              return (
                <TenantLink to={`/networks/wireless/${row.networkId}/network-details/overview`}>{row.ssid}</TenantLink>
              )
            }
          })
        }
      }]),
      ...(wifiEDAClientRevokeToggle ?[{
        key: 'networkType',
        title: intl.$t({ defaultMessage: 'Network Type' }),
        dataIndex: ['networkType'],
        sorter: true,
        filterable: Object.entries(networkTypes).map(([key, value]) => {return { key: key, value: $t(value) }}),
        render: (_: React.ReactNode, row: ClientList) => {
          return AsyncLoadingInColumn(row, () => {
            return networkDisplayTransformer(intl, row.networkType)
          })
        }
      }] : []),
      {
        key: 'sessStartTime',
        title: intl.$t({ defaultMessage: 'Time Connected' }),
        dataIndex: 'sessStartTime',
        sorter: true,
        render: (_, row) => row.sessStartTimeString
      },
      {
        key: 'clientVlan',
        title: intl.$t({ defaultMessage: 'VLAN' }),
        dataIndex: 'clientVlan',
        sorter: true,
        align: 'center',
        show: !!showAllColumns,
        render: (_, { clientVlan }) => clientVlan || noDataDisplay
      },
      {
        key: 'vni',
        title: intl.$t({ defaultMessage: 'VNI' }),
        dataIndex: 'vni',
        sorter: true,
        align: 'center',
        show: !!showAllColumns,
        render: (_, row) => {
          return AsyncLoadingInColumn(row, () => {
            return row.vni || noDataDisplay
          })
        }
      },
      {
        key: 'deviceTypeStr',
        title: intl.$t({ defaultMessage: 'Device Type' }),
        dataIndex: 'deviceTypeStr',
        sorter: true,
        align: 'center',
        show: !!showAllColumns,
        render: (_, row) => {
          return AsyncLoadingInColumn(row, () => {
            return <UI.IconContainer>
              <Tooltip title={row.deviceTypeStr}>
                {getDeviceTypeIcon(row.deviceTypeStr)}
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
        key: 'totalTraffic',
        title: intl.$t({ defaultMessage: 'Traffic (Session)' }),
        dataIndex: 'totalTraffic',
        sorter: true,
        show: !!showAllColumns,
        render: (_, row) => {
          return AsyncLoadingInColumn(row, () => {
            return row.totalTraffic || noDataDisplay
          })
        }
      },
      {
        key: 'trafficToClient',
        title: intl.$t({ defaultMessage: 'Traffic To Client' }),
        dataIndex: 'trafficToClient',
        sorter: true,
        show: !!showAllColumns,
        render: (_, { trafficToClient }) => trafficToClient || noDataDisplay
      },
      {
        key: 'trafficFromClient',
        title: intl.$t({ defaultMessage: 'Traffic From Client' }),
        dataIndex: 'trafficFromClient',
        sorter: true,
        show: !!showAllColumns,
        render: (_, { trafficFromClient }) => trafficFromClient || noDataDisplay
      },
      {
        key: 'receiveSignalStrength',
        title: intl.$t({ defaultMessage: 'RSSI' }),
        dataIndex: 'receiveSignalStrength',
        sorter: true,
        align: 'center',
        show: !!showAllColumns,
        render: (_, row) => {
          return AsyncLoadingInColumn(row, () => {
            return row.receiveSignalStrength || noDataDisplay
          })
        }
      },
      {
        key: 'rssi',
        title: intl.$t({ defaultMessage: 'SNR' }),
        dataIndex: 'rssi',
        sorter: true,
        align: 'center',
        show: !!showAllColumns,
        render: (_, row) => {
          return AsyncLoadingInColumn(row, () => {
            return row.rssi || noDataDisplay
          })
        }
      },
      {
        key: 'radio.mode',
        title: intl.$t({ defaultMessage: 'Radio Type' }),
        dataIndex: ['radio', 'mode'],
        sorter: true,
        show: !!showAllColumns,
        render: (_, row) => {
          return AsyncLoadingInColumn(row, () => {
            return row.radio?.mode || noDataDisplay
          })
        }
      },
      {
        key: 'cpeMac',
        title: intl.$t({ defaultMessage: 'CPE MAC Address' }),
        dataIndex: 'cpeMac',
        sorter: true,
        show: !!showAllColumns,
        render: (_, row) => {
          return AsyncLoadingInColumn(row, () => {
            return row.cpeMac || noDataDisplay
          })
        }
      },
      {
        key: 'authmethod',
        title: intl.$t({ defaultMessage: 'Auth Method' }),
        dataIndex: 'authmethod',
        sorter: true,
        show: !!showAllColumns,
        render: (_, { authmethod }) => authmethod || noDataDisplay
      },
      {
        key: 'status',
        title: intl.$t({ defaultMessage: 'Auth Status' }),
        dataIndex: 'status',
        sorter: true,
        show: !!showAllColumns,
        render: (_, { status }) => {
          const statusInt = parseInt(status, 10)
          if (isNaN(statusInt)) return noDataDisplay

          let statusText = noDataDisplay as string
          if (statusInt === 1) {
            statusText = intl.$t({ defaultMessage: 'Authorized' })
          } else if (statusInt === 0) {
            statusText = intl.$t({ defaultMessage: 'Unauthorized' })
          } else if (statusInt === -1) {
            statusText = intl.$t({ defaultMessage: 'N/A' })
          }
          return statusText
        }
      },
      {
        key: 'encryptMethod',
        title: intl.$t({ defaultMessage: 'Encryption' }),
        dataIndex: 'encryptMethod',
        sorter: true,
        show: !!showAllColumns,
        render: (_, { encryptMethod }) => encryptMethod || noDataDisplay
      },
      {
        key: 'packetsToClient',
        title: intl.$t({ defaultMessage: 'Packets To Client' }),
        dataIndex: 'packetsToClient',
        sorter: true,
        align: 'center',
        show: !!showAllColumns,
        render: (_, { packetsToClient }) => packetsToClient || noDataDisplay
      },
      {
        key: 'packetsFromClient',
        title: intl.$t({ defaultMessage: 'Packets From Client' }),
        dataIndex: 'packetsFromClient',
        sorter: true,
        align: 'center',
        show: !!showAllColumns,
        render: (_, { packetsFromClient }) => packetsFromClient || noDataDisplay
      },
      {
        key: 'packetsDropFrom',
        title: intl.$t({ defaultMessage: 'Packets Dropped' }),
        dataIndex: 'packetsDropFrom',
        sorter: true,
        align: 'center',
        show: !!showAllColumns,
        render: (_, row) => {
          return AsyncLoadingInColumn(row, () => {
            return row.packetsDropFrom || noDataDisplay
          })
        }
      },
      {
        key: 'radio.channel',
        title: intl.$t({ defaultMessage: 'RF Channel' }),
        dataIndex: ['radio', 'channel'],
        sorter: true,
        align: 'center',
        show: !!showAllColumns,
        render: (_, row) => {
          return AsyncLoadingInColumn(row, () => {
            return row.radio?.channel || noDataDisplay
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
    onChange: (newSelectedRowKeys: React.Key[], newSelectedRows: ClientList[]) => {
      const isNoGuestNetworkExist = newSelectedRows.filter((row) => isEqualCaptivePortal(row.networkType)).length === 0
      const isOtherNetworkExist = newSelectedRows.filter((row) => {
        if (row.serialNumber === undefined) {
          return false
        }
        return !isEqualCaptivePortal(row.networkType)
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

  const rowActions: TableProps<ClientList>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Disconnect' }),
      scopeKey: [WifiScopes.UPDATE, WifiScopes.DELETE],
      onClick: async (selectedRows, clearRowSelections) => {
        const selectedVenues = selectedRows.map((row) => row.venueId)
        const allAps = (await getApList({ params,
          payload: {
            fields: ['serialNumber', 'apMac'],
            filters: { venueId: selectedVenues }
          }
        })).data
        selectedRows.forEach((row) => {
          sendDisconnect({
            params: {
              venueId: row.venueId,
              clientMacAddress: row.clientMac,
              serialNumber: allAps?.data.find((ap) => ap.apMac === row.apMac)?.serialNumber
            }, payload: {
              status: 'DISCONNECTED'
            } })
        })
        clearRowSelections()
      }
    },
    {
      label: $t({ defaultMessage: 'Revoke' }),
      scopeKey: [WifiScopes.UPDATE, WifiScopes.DELETE],
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
              selectedRows.filter((row) => isEqualCaptivePortal(row.networkType)).forEach((row) => {
                sendRevoke({ params: {
                  venueId: row.venueId,
                  clientMacAddress: row.clientMac,
                  serialNumber: row.serialNumber
                } })
              })
            }
          })
        } else {
          selectedRows.filter((row) => isEqualCaptivePortal(row.networkType)).forEach((row) => {
            sendRevoke({ params: {
              venueId: row.venueId,
              clientMacAddress: row.clientMac,
              serialNumber: row.serialNumber
            } })
          })
        }

        clearRowSelections()
      }
    }
  ]

  const showRowSelection = (wifiEDAClientRevokeToggle &&
    hasPermission({ scopes: [ WifiScopes.UPDATE, WifiScopes.DELETE] }) )

  return (
    <UI.ClientTableDiv>
      <Loader states={[
        tableQuery
      ]}>
        <Subtitle level={4}>
          {$t({ defaultMessage: 'Connected Clients' })}
        </Subtitle>
        <Table<ClientList>
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
          rowKey='clientMac'
          filterPersistence={enabledUXOptFeature}
        />
      </Loader>
    </UI.ClientTableDiv>
  )
}
