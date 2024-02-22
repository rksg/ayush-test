/* eslint-disable max-len */
import React, { useState, useEffect } from 'react'

import { Space }              from 'antd'
import { IntlShape, useIntl } from 'react-intl'

import { Subtitle, Tooltip, Table, TableProps, Loader, showActionModal  } from '@acx-ui/components'
import { Features, useIsSplitOn }                                         from '@acx-ui/feature-toggle'
import {
  useGetClientListQuery,
  useVenuesListQuery,
  useApListQuery,
  useNetworkListQuery,
  useDisconnectClientMutation,
  useRevokeClientMutation
} from '@acx-ui/rc/services'
import {
  ClientList,
  getDeviceTypeIcon,
  getOsTypeIcon,
  TableQuery,
  usePollingTableQuery,
  networkTypes,
  NetworkTypeEnum
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'
import { RequestPayload }        from '@acx-ui/types'
import { noDataDisplay }         from '@acx-ui/utils'

import { ClientHealthIcon } from '../ClientHealthIcon'

import * as UI from './styledComponents'

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
  const { apFilterOptions } = useApListQuery({ params: { tenantId }, payload: {
    fields: ['name', 'serialNumber'],
    pageSize: 10000,
    sortField: 'name',
    sortOrder: 'ASC',
    filters: venueId ? { venueId: [venueId] } : {}
  } }, {
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
      networkFilterOptions: data?.data?.map(v=>({ key: v.ssid, value: v.name })) || true
    })
  })
  return networkFilterOptions
}

export const defaultClientPayload = {
  searchString: '',
  searchTargetFields: ['clientMac','ipAddress','Username','hostname','ssid','clientVlan','osType','vni'],
  filters: {},
  fields: [
    'hostname','osType','healthCheckStatus','clientMac','ipAddress','Username','serialNumber','venueId','switchSerialNumber',
    'ssid','wifiCallingClient','sessStartTime','clientAnalytics','clientVlan','deviceTypeStr','modelName','totalTraffic',
    'trafficToClient','trafficFromClient','receiveSignalStrength','rssi','radio.mode','cpeMac','authmethod','status',
    'encryptMethod','packetsToClient','packetsFromClient','packetsDropFrom','radio.channel',
    'cog','venueName','apName','clientVlan','networkId','switchName','healthStatusReason','lastUpdateTime', 'networkType', 'mldAddr', 'vni']
}

export const networkDisplayTransformer = (intl: ReturnType<typeof useIntl>, networkType?: string) => {
  if(!networkType) return noDataDisplay
  const displayText = networkTypes[networkType as NetworkTypeEnum]
  if(displayText) {
    return intl.$t(displayText)
  } else {
    return networkType
  }
}

export const isEqualCaptivePortal = (networkType?: string) : boolean => {
  if(!networkType){
    return false
  }
  return networkType === NetworkTypeEnum.CAPTIVEPORTAL
}


export const ConnectedClientsTable = (props: {
  showAllColumns?: boolean,
  searchString?: string,
  setConnectedClientCount?: (connectClientCount: number) => void,
  tableQuery?: TableQuery<ClientList, RequestPayload<unknown>, unknown>
}) => {
  const { $t } = useIntl()
  const params = useParams()
  const wifiEDAClientRevokeToggle = useIsSplitOn(Features.WIFI_EDA_CLIENT_REVOKE_TOGGLE)
  const { showAllColumns, searchString, setConnectedClientCount } = props
  const [ tableSelected, setTableSelected] = useState({
    selectedRowKeys: [] as React.Key[],
    selectRows: [] as ClientList[],
    actionButton: {
      revoke: {
        disable: false,
        showModal: false
      }
    }
  })
  const [ sendDisconnect ] = useDisconnectClientMutation()
  const [ sendRevoke ] = useRevokeClientMutation()
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
  const tableQuery = props.tableQuery || inlineTableQuery

  useEffect(() => {
    if (tableQuery.data?.data && setConnectedClientCount) {
      setConnectedClientCount(tableQuery.data?.totalCount)
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
    const listOfClientsPerWlanFlag = useIsSplitOn(Features.LIST_OF_CLIENTS_PER_WLAN)

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
        sorter: true,
        filterMultiple: false,
        filterValueNullable: false,
        filterable: statusFilterOptions,
        render: (_, row) => {
          return <Tooltip title={row.healthCheckStatus}>
            <Space>
              <ClientHealthIcon type={row.healthClass} />
            </Space>
          </Tooltip>
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
          const mac = row.mldAddr?.toLowerCase() || undefined
          return <Tooltip title={mac}>
            {mac || noDataDisplay}
          </Tooltip>
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
        render: (_, { Username }) => {
          return <Tooltip title={Username}>
            {Username || noDataDisplay}
          </Tooltip>
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
          return (
            <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>{row.venueName}</TenantLink>
          )
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
          return (
            <TenantLink to={`/devices/wifi/${row.serialNumber}/details/overview`}>{row.apName}</TenantLink>
          )
        }
      },
      {
        key: 'switchSerialNumber',
        title: intl.$t({ defaultMessage: 'Switch' }),
        dataIndex: 'switchName',
        sorter: true,
        render: (_, row) => {
          if(!row.switchName){
            return noDataDisplay
          }else{
            return (
              <TenantLink to={`/devices/switch/${row.switchId}/${row.switchSerialNumber}/details/overview`}>{row.switchName}</TenantLink>
            )
          }
        }
      },
      ...(networkId ? [] : [{
        key: 'ssid',
        title: intl.$t({ defaultMessage: 'Network' }),
        dataIndex: 'ssid',
        sorter: true,
        filterKey: 'ssid',
        filterable: networkId ? false : listOfClientsPerWlanFlag ? GetNetworkFilterOptions(tenantId) : false,
        render: (_: React.ReactNode, row: ClientList) => {
          if (!row.healthCheckStatus) {
            return row.ssid
          } else {
            return (
              <TenantLink to={`/networks/wireless/${row.networkId}/network-details/overview`}>{row.ssid}</TenantLink>
            )
          }
        }
      }]),
      ...(wifiEDAClientRevokeToggle ?[{
        key: 'networkType',
        title: intl.$t({ defaultMessage: 'Network Type' }),
        dataIndex: ['networkType'],
        sorter: true,
        filterable: Object.entries(networkTypes).map(([key, value]) => {return { key: key, value: $t(value) }}),
        render: (_: React.ReactNode, row: ClientList) => networkDisplayTransformer(intl, row.networkType)
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
        show: !!showAllColumns,
        render: (_, { clientVlan }) => clientVlan || noDataDisplay
      },
      {
        key: 'vni',
        title: intl.$t({ defaultMessage: 'VNI' }),
        dataIndex: 'vni',
        sorter: true,
        show: !!showAllColumns,
        render: (_, { vni }) => vni || noDataDisplay
      },
      {
        key: 'deviceTypeStr',
        title: intl.$t({ defaultMessage: 'Device Type' }),
        dataIndex: 'deviceTypeStr',
        sorter: true,
        show: !!showAllColumns,
        render: (_, { deviceTypeStr }) => {
          return <UI.IconContainer>
            <Tooltip title={deviceTypeStr}>
              {getDeviceTypeIcon(deviceTypeStr)}
            </Tooltip>
          </UI.IconContainer>
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
        render: (_, { totalTraffic }) => totalTraffic || noDataDisplay
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
        show: !!showAllColumns,
        render: (_, { receiveSignalStrength }) => receiveSignalStrength || noDataDisplay
      },
      {
        key: 'rssi',
        title: intl.$t({ defaultMessage: 'SNR' }),
        dataIndex: 'rssi',
        sorter: true,
        show: !!showAllColumns,
        render: (_, { rssi }) => rssi || noDataDisplay
      },
      {
        key: 'radio.mode',
        title: intl.$t({ defaultMessage: 'Radio Type' }),
        dataIndex: ['radio', 'mode'],
        sorter: true,
        show: !!showAllColumns,
        render: (_, { radio }) => radio?.mode || noDataDisplay
      },
      {
        key: 'cpeMac',
        title: intl.$t({ defaultMessage: 'CPE MAC Address' }),
        dataIndex: 'cpeMac',
        sorter: true,
        show: !!showAllColumns,
        render: (_, { cpeMac }) => cpeMac || noDataDisplay
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
        show: !!showAllColumns,
        render: (_, { packetsToClient }) => packetsToClient || noDataDisplay
      },
      {
        key: 'packetsFromClient',
        title: intl.$t({ defaultMessage: 'Packets From Client' }),
        dataIndex: 'packetsFromClient',
        sorter: true,
        show: !!showAllColumns,
        render: (_, { packetsFromClient }) => packetsFromClient || noDataDisplay
      },
      {
        key: 'packetsDropFrom',
        title: intl.$t({ defaultMessage: 'Packets Dropped' }),
        dataIndex: 'packetsDropFrom',
        sorter: true,
        show: !!showAllColumns,
        render: (_, { packetsDropFrom }) => packetsDropFrom || noDataDisplay
      },
      {
        key: 'radio.channel',
        title: intl.$t({ defaultMessage: 'RF Channel' }),
        dataIndex: ['radio', 'channel'],
        sorter: true,
        show: !!showAllColumns,
        render: (_, { radio }) => radio?.channel || noDataDisplay
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
      const isOtherNetworkExist = newSelectedRows.filter((row) => !isEqualCaptivePortal(row.networkType)).length !== 0
      setTableSelected({
        selectedRowKeys: newSelectedRowKeys,
        selectRows: newSelectedRows,
        actionButton: {
          revoke: {
            disable: isNoGuestNetworkExist,
            showModal: isOtherNetworkExist
          }
        }
      })
    },
    getCheckboxProps: (record: ClientList) => ({
      disabled: record.serialNumber === undefined
    })
  }

  const rowActions: TableProps<ClientList>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Disconnect' }),
      onClick: (selectedRows, clearRowSelections) => {
        const disconnectList = selectedRows.map((row) => {
          return {
            clientMac: row.clientMac,
            serialNumber: row.serialNumber
          }
        })
        sendDisconnect({
          payload: disconnectList
        })
        clearRowSelections()
      }
    },
    {
      label: $t({ defaultMessage: 'Revoke' }),
      tooltip: (tableSelected.actionButton.revoke.disable ?
        $t({ defaultMessage: 'Only clients connected to captive portal networks may have their access revoked' })
        :''
      ),
      disabled: tableSelected.actionButton.revoke.disable,
      onClick: (selectedRows, clearRowSelections) => {
        const revokeList = selectedRows.filter((row) => isEqualCaptivePortal(row.networkType)).map((row) => {
          return {
            clientMac: row.clientMac,
            serialNumber: row.serialNumber
          }
        })

        if (tableSelected.actionButton.revoke.showModal){
          showActionModal({
            type: 'info',
            width: 450,
            title: $t({ defaultMessage: 'Revoking Client Access' }),
            content: $t({ defaultMessage: 'Only clients connected to captive portal networks may have their access revoked' }),
            okText: $t({ defaultMessage: 'OK' }),
            onOk: async () => {
              sendRevoke({ payload: revokeList })
            }
          })
        } else {
          sendRevoke({ payload: revokeList })
        }

        clearRowSelections()
      }
    }
  ]

  return (
    <UI.ClientTableDiv>
      <Loader states={[
        tableQuery
      ]}>
        <Subtitle level={4}>
          {$t({ defaultMessage: 'Connected Clients' })}
        </Subtitle>
        <Table<ClientList>
          rowSelection={(wifiEDAClientRevokeToggle ? rowSelection : undefined)}
          rowActions={(wifiEDAClientRevokeToggle ? rowActions : undefined)}
          settingsId={settingsId}
          columns={GetCols(useIntl(), showAllColumns)}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter={true}
          floatRightFilters={true}
          rowKey='clientMac'
        />
      </Loader>
    </UI.ClientTableDiv>
  )
}
