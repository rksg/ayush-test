/* eslint-disable max-len */
import { useEffect } from 'react'

import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { Subtitle, Tooltip, Table, TableProps, Loader  }                                  from '@acx-ui/components'
import { useGetClientListQuery, useVenuesListQuery, useApListQuery }                      from '@acx-ui/rc/services'
import { ClientList, getDeviceTypeIcon, getOsTypeIcon, TableQuery, usePollingTableQuery } from '@acx-ui/rc/utils'
import { TenantLink, useParams }                                                          from '@acx-ui/react-router-dom'
import { RequestPayload }                                                                 from '@acx-ui/types'

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

function GetCols (intl: ReturnType<typeof useIntl>, showAllColumns?: boolean) {
  const { $t } = useIntl()
  const { tenantId, venueId, apId } = useParams()

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
      render: (data, row) => {
        return <TenantLink to={`users/wifi/clients/${row.clientMac}/details/overview?hostname=${data}&clientStatus=connected`}>{data || '--'}</TenantLink>
      }
    },
    {
      key: 'osType',
      title: intl.$t({ defaultMessage: 'OS' }),
      dataIndex: 'osType',
      sorter: true,
      render: (data) => {
        return <UI.IconContainer>
          <Tooltip title={data}>
            { getOsTypeIcon(data as string) }
          </Tooltip>
        </UI.IconContainer>
      }
    },
    {
      key: 'healthCheckStatus',
      title: intl.$t({ defaultMessage: 'Health' }),
      dataIndex: 'healthCheckStatus',
      sorter: true,
      filterMultiple: false,
      filterValueNullable: false,
      filterable: statusFilterOptions,
      render: (data, row) => {
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
      render: (data) => {
        const mac = data?.toString().toLowerCase() || undefined
        return <Tooltip title={mac}>
          {mac || '--'}
        </Tooltip>
      }
    },
    {
      key: 'ipAddress',
      title: intl.$t({ defaultMessage: 'IP Address' }),
      dataIndex: 'ipAddress',
      sorter: true,
      render: (data) => {
        return <Tooltip title={data}>
          {data || '--'}
        </Tooltip>
      }
    },
    {
      key: 'Username',
      title: intl.$t({ defaultMessage: 'Username' }),
      dataIndex: 'Username',
      sorter: true,
      render: (data) => {
        return <Tooltip title={data}>
          {data || '--'}
        </Tooltip>
      }
    },
    ...(venueId ? [] : [{
      key: 'venueId',
      title: intl.$t({ defaultMessage: 'Venue' }),
      dataIndex: 'venueName',
      sorter: true,
      filterKey: 'venueId',
      filterable: apId ? false : venueId ? false : GetVenueFilterOptions(tenantId),
      render: (data: React.ReactNode, row: ClientList) => {
        return (
          <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>{data}</TenantLink>
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
      render: (data, row) => {
        return (
          <TenantLink to={`/devices/wifi/${row.serialNumber}/details/overview`}>{data}</TenantLink>
        )
      }
    },
    {
      key: 'switchSerialNumber',
      title: intl.$t({ defaultMessage: 'Switch' }),
      dataIndex: 'switchName',
      sorter: true,
      render: (data, row) => {
        if(!row.switchName){
          return '--'
        }else{
          return (
            <TenantLink to={`/devices/switch/${row.switchId}/${row.switchSerialNumber}/details/overview`}>{row.switchName}</TenantLink>
          )
        }
      }
    },
    {
      key: 'ssid',
      title: intl.$t({ defaultMessage: 'Network' }),
      dataIndex: 'ssid',
      sorter: true,
      render: (data, row) => {
        if (!row.healthCheckStatus) {
          return data
        } else {
          return (
            <TenantLink to={`/networks/wireless/${row.networkId}/network-details/overview`}>{data}</TenantLink>
          )
        }
      }
    },
    {
      key: 'sessStartTime',
      title: intl.$t({ defaultMessage: 'Time Connected' }),
      dataIndex: 'sessStartTime',
      sorter: true,
      render: (data, row) => row.sessStartTimeString
    },
    {
      key: 'clientVlan',
      title: intl.$t({ defaultMessage: 'VLAN' }),
      dataIndex: 'clientVlan',
      sorter: true,
      show: !!showAllColumns,
      render: (data) => data || '--'
    },
    {
      key: 'deviceTypeStr',
      title: intl.$t({ defaultMessage: 'Device Type' }),
      dataIndex: 'deviceTypeStr',
      sorter: true,
      show: !!showAllColumns,
      render: (data) => {
        return <UI.IconContainer>
          <Tooltip title={data}>
            {getDeviceTypeIcon(data as string)}
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
      render: (data) => data || '--'
    },
    {
      key: 'totalTraffic',
      title: intl.$t({ defaultMessage: 'Traffic (Session)' }),
      dataIndex: 'totalTraffic',
      sorter: true,
      show: !!showAllColumns,
      render: (data) => data || '--'
    },
    {
      key: 'trafficToClient',
      title: intl.$t({ defaultMessage: 'Traffic To Client' }),
      dataIndex: 'trafficToClient',
      sorter: true,
      show: !!showAllColumns,
      render: (data) => data || '--'
    },
    {
      key: 'trafficFromClient',
      title: intl.$t({ defaultMessage: 'Traffic From Client' }),
      dataIndex: 'trafficFromClient',
      sorter: true,
      show: !!showAllColumns,
      render: (data) => data || '--'
    },
    {
      key: 'receiveSignalStrength',
      title: intl.$t({ defaultMessage: 'RSSI' }),
      dataIndex: 'receiveSignalStrength',
      sorter: true,
      show: !!showAllColumns,
      render: (data) => data || '--'
    },
    {
      key: 'rssi',
      title: intl.$t({ defaultMessage: 'SNR' }),
      dataIndex: 'rssi',
      sorter: true,
      show: !!showAllColumns,
      render: (data) => data || '--'
    },
    {
      key: 'radio.mode',
      title: intl.$t({ defaultMessage: 'Radio Type' }),
      dataIndex: ['radio', 'mode'],
      sorter: true,
      show: !!showAllColumns,
      render: (data) => data || '--'
    },
    {
      key: 'cpeMac',
      title: intl.$t({ defaultMessage: 'CPE MAC Address' }),
      dataIndex: 'cpeMac',
      sorter: true,
      show: !!showAllColumns,
      render: (data) => data || '--'
    },
    {
      key: 'authmethod',
      title: intl.$t({ defaultMessage: 'Auth Method' }),
      dataIndex: 'authmethod',
      sorter: true,
      show: !!showAllColumns,
      render: (data) => data || '--'
    },
    {
      key: 'status',
      title: intl.$t({ defaultMessage: 'Auth Status' }),
      dataIndex: 'status',
      sorter: true,
      show: !!showAllColumns,
      render: (data) => data ?
        intl.$t({ defaultMessage: 'Authorized' }) :
        intl.$t({ defaultMessage: 'Unauthorized' })
    },
    {
      key: 'encryptMethod',
      title: intl.$t({ defaultMessage: 'Encryption' }),
      dataIndex: 'encryptMethod',
      sorter: true,
      show: !!showAllColumns,
      render: (data) => data || '--'
    },
    {
      key: 'packetsToClient',
      title: intl.$t({ defaultMessage: 'Packets To Client' }),
      dataIndex: 'packetsToClient',
      sorter: true,
      show: !!showAllColumns,
      render: (data) => data || '--'
    },
    {
      key: 'packetsFromClient',
      title: intl.$t({ defaultMessage: 'Packets From Client' }),
      dataIndex: 'packetsFromClient',
      sorter: true,
      show: !!showAllColumns,
      render: (data) => data || '--'
    },
    {
      key: 'packetsDropFrom',
      title: intl.$t({ defaultMessage: 'Packets Dropped' }),
      dataIndex: 'packetsDropFrom',
      sorter: true,
      show: !!showAllColumns,
      render: (data) => data || '--'
    },
    {
      key: 'radio.channel',
      title: intl.$t({ defaultMessage: 'RF Channel' }),
      dataIndex: ['radio', 'channel'],
      sorter: true,
      show: !!showAllColumns,
      render: (data) => data || '--'
    }
    // { // TODO: Waiting for TAG feature support
    //   key: 'tags',
    //   title: intl.$t({ defaultMessage: 'Tags' }),
    //   dataIndex: 'tags'
    // }
  ]
  return columns
}


export const defaultClientPayload = {
  searchString: '',
  searchTargetFields: ['clientMac','ipAddress','Username','hostname','ssid','clientVlan','osType'],
  filters: {},
  fields: [
    'hostname','osType','healthCheckStatus','clientMac','ipAddress','Username','serialNumber','venueId','switchSerialNumber',
    'ssid','wifiCallingClient','sessStartTime','clientAnalytics','clientVlan','deviceTypeStr','modelName','totalTraffic',
    'trafficToClient','trafficFromClient','receiveSignalStrength','rssi','radio.mode','cpeMac','authmethod','status',
    'encryptMethod','packetsToClient','packetsFromClient','packetsDropFrom','radio.channel',
    'cog','venueName','apName','clientVlan','networkId','switchName','healthStatusReason','lastUpdateTime']
}

export const ConnectedClientsTable = (props: {
  showAllColumns?: boolean,
  searchString?: string,
  setConnectedClientCount?: (connectClientCount: number) => void,
  tableQuery?: TableQuery<ClientList, RequestPayload<unknown>, unknown>
}) => {
  const { $t } = useIntl()
  const params = useParams()
  const { showAllColumns, searchString, setConnectedClientCount } = props

  defaultClientPayload.filters = params.venueId ? { venueId: [params.venueId] } :
    params.serialNumber ? { serialNumber: [params.serialNumber] } :
      params.apId ? { serialNumber: [params.apId] } : {}


  const inlineTableQuery = usePollingTableQuery({
    useQuery: useGetClientListQuery,
    defaultPayload: { ...defaultClientPayload, searchString },
    search: {
      searchTargetFields: defaultClientPayload.searchTargetFields,
      searchString: searchString
    },
    option: { skip: !!props.tableQuery }
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

  return (
    <UI.ClientTableDiv>
      <Loader states={[
        tableQuery
      ]}>
        <Subtitle level={4}>
          {$t({ defaultMessage: 'Connected Clients' })}
        </Subtitle>
        <Table<ClientList>
          settingsId='connected-clients-table'
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
