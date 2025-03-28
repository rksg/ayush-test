import { useContext, useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Table, TableProps, Tooltip, Loader, ColumnType, Button } from '@acx-ui/components'
import type { TableHighlightFnArgs }                              from '@acx-ui/components'
import { Features, useIsSplitOn }                                 from '@acx-ui/feature-toggle'
import {
  useGetFlexAuthenticationProfilesQuery,
  useGetSwitchClientListQuery,
  useLazyGetLagListQuery
}    from '@acx-ui/rc/services'
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
  SwitchRow,
  SwitchPortStatus,
  SwitchRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { useParams, TenantLink }                       from '@acx-ui/react-router-dom'
import { RequestPayload, SwitchScopes }                from '@acx-ui/types'
import { hasPermission }                               from '@acx-ui/user'
import { getOpsApi, useTrackLoadTime, widgetsMapping } from '@acx-ui/utils'

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

import { getClientAuthType } from './index'

export const defaultSwitchClientPayload = {
  searchString: '',
  searchTargetFields: ['clientName', 'clientMac', 'clientDesc', 'clientType', 'vni',
    'venueName', 'switchName', 'clientVlan', 'switchPort', 'clientIpv4Addr', 'clientIpv6Addr'],
  fields: [
    'clientDesc', 'clientIpv4Addr', 'clientIpv6Addr', 'clientMac',
    'clientName', 'clientType', 'clientVlan', 'cog',
    'deviceType', 'dhcpClientDeviceTypeName', 'dhcpClientHostName',
    'dhcpClientModelName', 'dhcpClientOsVendorName', 'id',
    'switchId', 'switchName', 'switchPort', 'switchPortFormatted',
    'switchPortId', 'switchSerialNumber', 'venueId', 'venueName',
    'vlanName', 'vni', 'clientAuthType'
  ],
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
  const networkSegmentationSwitchEnabled = useIsSplitOn(Features.NETWORK_SEGMENTATION_SWITCH)
  const portLinkEnabled = useIsSplitOn(Features.SWITCH_PORT_HYPERLINK)
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const isSwitchFlexAuthEnabled = useIsSplitOn(Features.SWITCH_FLEXIBLE_AUTHENTICATION)
  const isMonitoringPageEnabled = useIsSplitOn(Features.MONITORING_PAGE_LOAD_TIMES)

  const [editLagModalVisible, setEditLagModalVisible] = useState(false)
  const [editLag, setEditLag] = useState([] as Lag[])
  const [editPortDrawerVisible, setEditPortDrawerVisible] = useState(false)
  const [selectedPorts, setSelectedPorts] = useState([] as SwitchPortStatus[])
  const [lagDrawerParams, setLagDrawerParams] = useState({} as SwitchLagParams)
  const [switchList, setSwitchList] = useState([] as SwitchRow[])
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
      searchString: '',
      searchTargetFields: defaultSwitchClientPayload.searchTargetFields
    },
    option: { skip: !!props.tableQuery },
    sorter: {
      sortField: 'clientName',
      sortOrder: 'ASC'
    },
    pagination: { settingsId },
    enableRbac: isSwitchRbacEnabled
  })
  const tableQuery = props.tableQuery || inlineTableQuery
  useEffect(() => {
    setSwitchCount?.(tableQuery.data?.totalCount || 0)
  }, [tableQuery.data])

  useTrackLoadTime({
    itemName: widgetsMapping.WIRED_CLIENTS_TABLE,
    states: [tableQuery],
    isEnabled: isMonitoringPageEnabled
  })

  const { authenticationProfiles } = useGetFlexAuthenticationProfilesQuery({
    payload: {
      pageSize: 10000,
      sortField: 'profileName',
      sortOrder: 'ASC'
    }
  }, {
    skip: !isSwitchFlexAuthEnabled,
    selectFromResult: ( { data } ) => ({
      authenticationProfiles: data?.data
    })
  })

  const handleFilterChange = (filters: FILTER, search: SEARCH, groupBy: string | undefined) => {
    setTableQueryFilters?.(filters)
    tableQuery.handleFilterChange(filters, search, groupBy)
  }

  function getCols (intl: ReturnType<typeof useIntl>) {
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
      render: (_, { clientMac }, __, highlightFn) => {
        const mac = searchable ? highlightFn(clientMac) : clientMac
        return mac || '--'
      }
    }, {
      key: 'clientIpv4Addr',
      title: intl.$t({ defaultMessage: 'IP Address' }),
      dataIndex: 'clientIpv4Addr',
      sorter: true,
      searchable: searchable,
      render: (_, row, __, highlightFn) => {
        const clientIpAddr = getClientIpAddr(row)
        return searchable ? highlightFn(clientIpAddr) : clientIpAddr
      }
    }, {
      key: 'clientDesc',
      title: intl.$t({ defaultMessage: 'Description' }),
      dataIndex: 'clientDesc',
      sorter: true,
      searchable: searchable,
      render: (_, { clientDesc }, __, highlightFn) => {
        const desc = searchable ? highlightFn(clientDesc) : clientDesc
        return desc || '--'
      }
    },
    ...(params.switchId || params.venueId ? [] : [{
      key: 'venueName',
      title: intl.$t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      dataIndex: 'venueName',
      sorter: true,
      searchable: searchable,
      filterKey: 'venueId',
      filterMultiple: false,
      filterSearchable: true,
      filterable: filterableKeys ? filterableKeys['venueId'] : false,
      coordinatedKeys: ['switchId'],
      render: (
        _: React.ReactNode, row: SwitchClient, __: number, highlightFn: TableHighlightFnArgs
      ) => {
        const name = row.venueName ? row.venueName : '--'
        const venueName = searchable ? highlightFn(name) : name
        // eslint-disable-next-line max-len
        return <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>{venueName}</TenantLink>
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
      render: (
        _: React.ReactNode, row: SwitchClient, __: number, highlightFn: TableHighlightFnArgs
      ) => {
        const name = row.switchName ? row.switchName : '--'
        const switchName = searchable ? highlightFn(name) : name
        const link = `/devices/switch/${row.switchId}/${row.switchSerialNumber}/details/overview`
        return (row.switchId && row.switchName) ?
          <TenantLink to={link}>{switchName}</TenantLink> :
          <span>{switchName}</span>
      }
    }]),
    {
      key: 'switchPort',
      title: intl.$t({ defaultMessage: 'Port' }),
      dataIndex: 'switchPortFormatted',
      sorter: true,
      render: (_, row) => {
        if (!portLinkEnabled || !hasPermission({
          scopes: [SwitchScopes.UPDATE],
          rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.savePortsSetting)]
        })) {
          return row['switchPort']
        }

        const { switchPortStatus } = row || {}
        const port = row['switchPort']
        const disablePortEdit = !switchPortStatus ||
        !isOperationalSwitchPort(switchPortStatus) || isStackPort(switchPortStatus)

        if (disablePortEdit) {
          const tooltip = switchPortStatus ? getInactiveTooltip(switchPortStatus) :
            intl.$t({
              defaultMessage:
                'The port cannot be edited since it is on a switch that is not operational'
            })

          return (<Tooltip title={tooltip}> {port} </Tooltip>)
        }

        const onEditLag = async () => {
          const { data: lagList } = await getLagList({
            params: {
              ...params,
              switchId: switchPortStatus.switchMac,
              venueId: switchPortStatus.venueId
            },
            enableRbac: isSwitchRbacEnabled
          })
          const lagData = lagList?.find((item: Lag) =>
            item.lagId?.toString() === switchPortStatus.lagId) as Lag

          setLagDrawerParams({
            switchMac: switchPortStatus.switchMac,
            serialNumber: switchPortStatus.switchSerial
          })
          setEditLag([lagData])
          setEditPortDrawerVisible(false)
          setEditLagModalVisible(true)
        }

        const onEditPort = () => {
          setSwitchList([{ id: row.switchId, firmware: row?.switchFirmware }] as SwitchRow[])
          setSelectedPorts([switchPortStatus])
          setEditLagModalVisible(false)
          setEditPortDrawerVisible(true)
        }

        const onClickHandler = isLAGMemberPort(switchPortStatus) ? onEditLag : onEditPort

        return <Button type='link' onClick={onClickHandler}> {port} </Button>
      }

    }, {
      key: 'vlanName',
      title: intl.$t({ defaultMessage: 'VLAN' }),
      dataIndex: 'clientVlan',
      sorter: true,
      align: 'center',
      searchable: searchable,
      render: (_, row, __, highlightFn) => {
        const clientVlan = searchable ? highlightFn(row.clientVlan) : row.clientVlan
        return row.vlanName === 'DEFAULT-VLAN'
          ? `${clientVlan} (${intl.$t({ defaultMessage: 'Default VLAN' })})`
          : (clientVlan ?? '--')
      }
    },
    ...(networkSegmentationSwitchEnabled ? [{
      key: 'vni',
      title: intl.$t({ defaultMessage: 'VNI' }),
      dataIndex: 'vni',
      sorter: true,
      searchable: searchable,
      render: (
        _: React.ReactNode, { vni }: SwitchClient, __: number, highlightFn: TableHighlightFnArgs
      ) => {
        return searchable && vni ? highlightFn(vni) : vni
      }
    }]: []),
    ...(isSwitchFlexAuthEnabled ? [{
      key: 'clientAuthType',
      title: intl.$t({ defaultMessage: 'Authentication Type' }),
      dataIndex: 'clientAuthType',
      sorter: true,
      //TODO: BE checking
      // searchable: searchable,
      // render: (
      //   _: React.ReactNode, { clientAuthType }: SwitchClient, __: number, highlightFn: TableHighlightFnArgs
      // ) => {
      render: (_:React.ReactNode, { clientAuthType }: SwitchClient) => {
        //TODO: BE checking
        // return searchable && authType ? highlightFn(authType) : authType
        return getClientAuthType(clientAuthType)
      }
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

        return <UI.IconContainer>
          <Tooltip title={deviceType}>{ getDeviceTypeIcon(deviceType as string) }</Tooltip>
        </UI.IconContainer>
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

    return columns
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
          filterPersistence={true}
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
          switchList={switchList}
          authProfiles={authenticationProfiles}
        />
        }
      </Loader>
    </div>
  )
}
