import { useContext, useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Table, TableProps, Tooltip, Loader, ColumnType, Button } from '@acx-ui/components'
import { Features, useIsSplitOn }                                 from '@acx-ui/feature-toggle'
import { useGetSwitchClientListQuery, useLazyGetLagListQuery }    from '@acx-ui/rc/services'
import {
  FILTER,
  getOsTypeIcon,
  getDeviceTypeIcon,
  getClientIpAddr,
  SEARCH,
  SwitchClient,
  usePollingTableQuery,
  SWITCH_CLIENT_TYPE,
  TableQuery,
  Lag,
  SwitchPortStatus
} from '@acx-ui/rc/utils'
import { useParams, TenantLink } from '@acx-ui/react-router-dom'
import { RequestPayload }        from '@acx-ui/types'

import { SwitchLagModal, SwitchLagParams } from '../SwitchLagDrawer/SwitchLagModal'
import {
  getInactiveTooltip,
  isLAGMemberPort,
  isOperationalSwitchPort,
  isStackPort
} from '../SwitchPortTable'
import { EditPortDrawer } from '../SwitchPortTable/editPortDrawer'

import { SwitchClientContext } from './context'
import * as UI                 from './styledComponents'

type TableQueryPayload = React.SetStateAction<{
  searchString: string;
  searchTargetFields: string[];
  fields: string[];
  sortField: string;
  sortOrder: string;
  filters: {};
}> & React.SetStateAction<RequestPayload<unknown>>

export const defaultSwitchClientPayload = {
  searchString: '',
  searchTargetFields: ['clientName', 'clientMac', 'clientDesc', 'clientType', 'vni',
    'venueName', 'switchName', 'clientVlan', 'switchPort'],
  fields: [
    'clientDesc', 'clientIpv4Addr', 'clientIpv6Addr', 'clientMac',
    'clientName', 'clientType', 'clientVlan', 'cog',
    'deviceType', 'dhcpClientDeviceTypeName', 'dhcpClientHostName',
    'dhcpClientModelName', 'dhcpClientOsVendorName', 'id',
    'switchId', 'switchName', 'switchPort', 'switchPortFormatted',
    'switchPortId', 'switchSerialNumber', 'venueId', 'venueName',
    'vlanName', 'vni'
  ],
  sortField: 'clientMac',
  sortOrder: 'DESC',
  filters: {}
}

export function ClientsTable (props: {
  settingsId?: string
  tableQuery?: TableQuery<SwitchClient, RequestPayload<unknown>, unknown>
  searchable?: boolean
  filterableKeys?: { [key: string]: ColumnType['filterable'] }
}) {
  const params = useParams()
  const { searchable, filterableKeys, settingsId = 'switch-clients-table' } = props
  const { setSwitchCount, setTableQueryFilters } = useContext(SwitchClientContext)
  const isDhcpClientsEnabled = useIsSplitOn(Features.SWITCH_DHCP_CLIENTS)
  const networkSegmentationSwitchEnabled = useIsSplitOn(Features.NETWORK_SEGMENTATION_SWITCH)
  const portLinkEnabled = useIsSplitOn(Features.SWITCH_PORT_HYPERLINK)

  const [editLagModalVisible, setEditLagModalVisible] = useState(false)
  const [editLag, setEditLag] = useState([] as Lag[])
  const [editPortDrawerVisible, setEditPortDrawerVisible] = useState(false)
  const [selectedPorts, setSelectedPorts] = useState([] as SwitchPortStatus[])
  const [lagDrawerParams, setLagDrawerParams] = useState({} as SwitchLagParams)
  const [ getLagList ] = useLazyGetLagListQuery()


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
    option: { skip: !!props.tableQuery },
    pagination: { settingsId }
  })
  const tableQuery = props.tableQuery || inlineTableQuery
  useEffect(() => {
    setSwitchCount?.(tableQuery.data?.totalCount || 0)
  }, [tableQuery.data])

  const handleFilterChange = (filters: FILTER, search: SEARCH, groupBy: string | undefined) => {
    const payload = {
      ...tableQuery.payload,
      filters: {
        ...defaultSwitchClientPayload.filters,
        ...filters
      }, ...search, groupBy
    }
    setTableQueryFilters?.(filters)
    tableQuery.handleFilterChange(filters, search, groupBy)
    tableQuery.setPayload(payload as TableQueryPayload)
  }

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
          row?.dhcpClientHostName || row?.clientName || row?.clientMac || '--'
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
      filterMultiple: false,
      filterSearchable: true,
      filterable: filterableKeys ? filterableKeys['venueId'] : false,
      coordinatedKeys: ['switchId'],
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
      filterMultiple: false,
      filterSearchable: true,
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
      render: (_, row) => {
        if (!portLinkEnabled) { // FF
          return row['switchPort']
        }

        const { switchPortStatus } = row || {}
        const disableLink = !switchPortStatus ||
        !isOperationalSwitchPort(switchPortStatus) || isStackPort(switchPortStatus)
        const tooltip = switchPortStatus ? getInactiveTooltip(switchPortStatus) :
          intl.$t({
            defaultMessage:
              'The port cannot be edited since it is on a switch that is not operational'
          })

        if (disableLink) {
          return (<Tooltip title={tooltip}>
            {row['switchPort']}
          </Tooltip>)
        } else if (isLAGMemberPort(switchPortStatus)) {
          const onEditLag = async () => {
            const { data: lagList } =
              await getLagList({ params: { ...params, switchId: switchPortStatus.switchMac } })
            const lagData =
              lagList?.find(item => item.lagId?.toString() === switchPortStatus.lagId) as Lag
            setLagDrawerParams({
              switchMac: switchPortStatus.switchMac,
              serialNumber: switchPortStatus.switchSerial
            })
            setEditLag([lagData])
            setEditPortDrawerVisible(false)
            setEditLagModalVisible(true)
          }
          return <Button type='link' onClick={onEditLag}>
            {row['switchPort'] + 'LLAAGG'}
          </Button>
        } else {
          const onPortClick = () => {
            setEditLagModalVisible(false)
            setSelectedPorts([switchPortStatus])
            setEditPortDrawerVisible(true)
          }
          return <Button type='link' onClick={onPortClick}>
            {row['switchPort'] + 'LINK'}
          </Button>
        }
      }

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
    },
    ...(networkSegmentationSwitchEnabled ? [{
      key: 'vni',
      title: intl.$t({ defaultMessage: 'VNI' }),
      dataIndex: 'vni',
      sorter: true,
      searchable: searchable
    }]: []),
    {
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
          settingsId={settingsId}
          columns={getCols(useIntl())}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          onFilterChange={handleFilterChange}
          enableApiFilter={true}
          rowKey='id'
        />
        {editLagModalVisible && <SwitchLagModal
          isEditMode={true}
          editData={editLag}
          visible={editLagModalVisible}
          setVisible={setEditLagModalVisible}
          params={lagDrawerParams}
          type='drawer'
        />}
        {editPortDrawerVisible && <EditPortDrawer
          key='edit-port'
          visible={editPortDrawerVisible}
          setDrawerVisible={setEditPortDrawerVisible}
          isCloudPort={selectedPorts.map(item => item.cloudPort).includes(true)}
          isMultipleEdit={selectedPorts?.length > 1}
          isVenueLevel={false}
          selectedPorts={selectedPorts}
        />
        }
      </Loader>
    </div>
  )
}
