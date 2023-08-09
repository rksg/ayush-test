import { useContext, useEffect } from 'react'

import { useIntl } from 'react-intl'

import { Table, TableProps, Tooltip, Loader, ColumnType } from '@acx-ui/components'
import { Features, useIsSplitOn }                         from '@acx-ui/feature-toggle'
import { useGetSwitchClientListQuery }                    from '@acx-ui/rc/services'
import {
  getOsTypeIcon,
  getDeviceTypeIcon,
  getClientIpAddr,
  SwitchClient,
  usePollingTableQuery,
  SWITCH_CLIENT_TYPE,
  TableQuery
} from '@acx-ui/rc/utils'
import { useParams, TenantLink } from '@acx-ui/react-router-dom'
import { RequestPayload }        from '@acx-ui/types'

import { SwitchClientContext } from './context'
import * as UI                 from './styledComponents'

export const defaultSwitchClientPayload = {
  searchString: '',
  searchTargetFields: ['clientName', 'clientMac', 'clientDesc', 'clientType',
    'venueName', 'switchName', 'clientVlan', 'switchPort'],
  fields: ['switchId','clientVlan','venueId','switchSerialNumber','clientMac',
    'clientName','clientDesc','clientType','deviceType','switchPort','vlanName',
    'switchName', 'venueName' ,'cog','id','switchPortFormatted', 'clientIpv4Addr', 'clientIpv6Addr',
    'dhcpClientOsVendorName', 'dhcpClientHostName',
    'dhcpClientDeviceTypeName', 'dhcpClientModelName'],
  sortField: 'clientMac',
  sortOrder: 'DESC',
  filters: {}
}

export function ClientsTable (props: {
  tableQuery?: TableQuery<SwitchClient, RequestPayload<unknown>, unknown>
  searchable?: boolean
  filterableKeys?: { [key: string]: ColumnType['filterable'] }
}) {
  const params = useParams()
  const { searchable, filterableKeys } = props
  const { setSwitchCount } = useContext(SwitchClientContext)
  const isDhcpClientsEnabled = useIsSplitOn(Features.SWITCH_DHCP_CLIENTS)

  defaultSwitchClientPayload.filters =
    params.switchId ? { switchId: [params.switchId] } :
      params.venueId ? { venueId: [params.venueId] } : {}


  const inlineTableQuery = usePollingTableQuery({
    useQuery: useGetSwitchClientListQuery,
    defaultPayload: {
      ...defaultSwitchClientPayload
    },
    search: {
      searchTargetFields: defaultSwitchClientPayload.searchTargetFields
    },
    option: { skip: !!props.tableQuery }
  })
  const tableQuery = props.tableQuery || inlineTableQuery
  useEffect(() => {
    setSwitchCount?.(tableQuery.data?.totalCount || 0)
  }, [tableQuery.data])

  function getCols (intl: ReturnType<typeof useIntl>) {
    const dhcpClientsColumns = ['dhcpClientOsVendorName', 'clientIpv4Addr', 'dhcpClientModelName']
    const columns: TableProps<SwitchClient>['columns'] = [{
      key: 'clientName',
      title: intl.$t({ defaultMessage: 'Hostname' }),
      dataIndex: 'clientName',
      defaultSortOrder: 'ascend',
      sorter: true,
      fixed: 'left',
      render: (_, row) => {
        return <TenantLink to={`users/switch/clients/${row.id}`}>{
          row?.dhcpClientHostName || row?.clientName || '--'
        }</TenantLink>
      }
    }, {
      key: 'dhcpClientOsVendorName',
      title: intl.$t({ defaultMessage: 'OS' }),
      dataIndex: 'dhcpClientOsVendorName',
      align: 'center',
      sorter: true,
      render: (_, { dhcpClientOsVendorName }) => {
        return <UI.IconContainer>
          <Tooltip title={dhcpClientOsVendorName}>
            { getOsTypeIcon(dhcpClientOsVendorName as string) }
          </Tooltip>
        </UI.IconContainer>
      }
    }, {
      key: 'clientMac',
      title: intl.$t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'clientMac',
      sorter: true,
      disable: true,
      searchable: searchable,
      render: (_, { clientMac }) => {
        return clientMac || '--'
      }
    }, {
      key: 'clientIpv4Addr',
      title: intl.$t({ defaultMessage: 'IP Address' }),
      dataIndex: 'clientIpv4Addr',
      sorter: true,
      render: (_, row) => getClientIpAddr(row)
    }, {
      key: 'clientDesc',
      title: intl.$t({ defaultMessage: 'Description' }),
      dataIndex: 'clientDesc',
      sorter: true,
      searchable: searchable,
      render: (_, { clientDesc }) => {
        return clientDesc || '--'
      }
    },
    ...(params.switchId || params.venueId ? [] : [{
      key: 'venueName',
      title: intl.$t({ defaultMessage: 'Venue' }),
      dataIndex: 'venueName',
      sorter: true,
      searchable: searchable,
      filterKey: 'venueId',
      filterable: filterableKeys ? filterableKeys['venueId'] : false,
      render: (_: React.ReactNode, row: SwitchClient) => {
        const name = row.venueName ? row.venueName : '--'
        // eslint-disable-next-line max-len
        return <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>{name}</TenantLink>
      }
    }]),
    ...(params.switchId ? [] : [{
      key: 'switchName',
      title: intl.$t({ defaultMessage: 'Switch' }),
      dataIndex: 'switchName',
      sorter: true,
      searchable: searchable,
      filterKey: 'switchId',
      filterable: filterableKeys ? filterableKeys['switchId'] : false,
      render: (_: React.ReactNode, row: SwitchClient) => {
        const name = row.switchName ? row.switchName : '--'
        const link = `/devices/switch/${row.switchId}/${row.switchSerialNumber}/details/overview`
        return (row.switchId && row.switchName) ?
          <TenantLink to={link}>{name}</TenantLink> :
          <span>{name}</span>
      }
    }]),
    {
      key: 'switchPort',
      title: intl.$t({ defaultMessage: 'Port' }),
      dataIndex: 'switchPortFormatted',
      sorter: true,
      render: (_, row) => row['switchPort']
    }, {
      key: 'vlanName',
      title: intl.$t({ defaultMessage: 'VLAN' }),
      dataIndex: 'clientVlan',
      sorter: true,
      align: 'center',
      searchable: searchable,
      render: (_, row) => {
        return row.vlanName === 'DEFAULT-VLAN'
          ? `${row.clientVlan} (${intl.$t({ defaultMessage: 'Default VLAN' })})`
          : (row.clientVlan ?? '--')
      }
    }, {
      key: 'clientType',
      title: intl.$t({ defaultMessage: 'Device Type' }),
      dataIndex: 'deviceType',
      sorter: true,
      align: 'center',
      searchable: searchable,
      render: (_, row) => {
        const type = row?.dhcpClientDeviceTypeName || row?.clientType
        const convertType = (type: string) => {
          switch(type){
            case SWITCH_CLIENT_TYPE.AP:
              return 'AP'
            case SWITCH_CLIENT_TYPE.ROUTER:
              return 'Router'
            default:
              return type || '--'
          }
        }
        const deviceType = convertType(type)

        if (isDhcpClientsEnabled) {
          return <UI.IconContainer>
            <Tooltip title={deviceType}>{ getDeviceTypeIcon(deviceType as string) }</Tooltip>
          </UI.IconContainer>
        } else {
          return deviceType
        }
      }
    }, {
      key: 'dhcpClientModelName',
      title: intl.$t({ defaultMessage: 'Model Name' }),
      dataIndex: 'dhcpClientModelName',
      sorter: true,
      render: (_, { dhcpClientModelName }) => {
        return dhcpClientModelName || '--'
      }
    }]

    return columns.filter(({ key }) => {
      return isDhcpClientsEnabled ? key : !dhcpClientsColumns.includes(key)
    })
  }

  return (
    <div>
      <Loader states={[
        tableQuery
      ]}>
        <Table
          settingsId='switch-clients-table'
          columns={getCols(useIntl())}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter={true}
          rowKey='id'
        />
      </Loader>
    </div>
  )
}
