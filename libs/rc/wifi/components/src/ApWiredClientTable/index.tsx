import { useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, ColumnType, Loader, Table, TableHighlightFnArgs, TableProps, Tooltip } from '@acx-ui/components'
import { useApListQuery, useGetApWiredClientsQuery, useVenuesListQuery }                from '@acx-ui/rc/services'
import {
  getDeviceTypeIcon,
  getOsTypeIcon,
  TableQuery,
  usePollingTableQuery,
  ApWiredClientInfo
} from '@acx-ui/rc/utils'
import { TenantLink }     from '@acx-ui/react-router-dom'
import { RequestPayload } from '@acx-ui/types'
import { noDataDisplay }  from '@acx-ui/utils'

import LanPortProfileDetailsDrawer from '../LanPortProfileDetailDrawer'

import * as UI from './styledComponents'

export const defaultApWiredClientPayload = {
  searchString: '',
  searchTargetFields: ['macAddress','ipAddress','hostname','apMacAddress'],
  filters: {},
  fields: [
    'hostname', 'macAddress', 'ipAddress',
    'deviceType', 'osType', 'authStatus',
    'venueName', 'venueId',
    'apId', 'apMacAddress', 'apName',
    'portNumber', 'vlanId'
  ]
}

function GetVenueFilterOptions () {
  const { venueFilterOptions } = useVenuesListQuery({ params: {}, payload: {
    fields: ['name', 'id'],
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

function GetApFilterOptions (venueId: string|undefined) {
  const { apFilterOptions } = useApListQuery({
    params: {},
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
      apFilterOptions: data?.data?.map(v=>({
        key: v.serialNumber,
        value: v.name? v.name : v.serialNumber
      })) || true
    })
  })
  return apFilterOptions
}

export const ApWiredClientTable = (props: {
    settingsId?: string
    tableQuery?: TableQuery<ApWiredClientInfo, RequestPayload<unknown>, unknown>
    searchable?: boolean
    filterableKeys?: { [key: string]: ColumnType['filterable'] }
}) => {
  const params = useParams()
  const { $t } = useIntl()
  const { searchable, settingsId = 'ap-wired-clients-table' } = props
  const [detailVisible, setDetailVisible]=useState(false)
  const [apName, setApName] = useState<string>()
  const [portNumber, setPortNumber]=useState<number>()
  const [apSerialNumber, setApSerialNumber] = useState<string>()
  const [venueId, setVenueId] = useState<string>()

  defaultApWiredClientPayload.filters =
  params.venueId ? { venueId: [params.venueId] } :
    params.apId ? { apId: [params.apId] } : {}

  const inlineTableQuery = usePollingTableQuery({
    useQuery: useGetApWiredClientsQuery,
    defaultPayload: { ...defaultApWiredClientPayload },
    search: {
      searchTargetFields: defaultApWiredClientPayload.searchTargetFields,
      searchString: ''
    },
    option: { skip: !!props.tableQuery },
    pagination: { settingsId },
    sorter: {
      sortField: 'hostname',
      sortOrder: 'ASC'
    }
  })

  const tableQuery = props.tableQuery || inlineTableQuery

  function getCols (intl: ReturnType<typeof useIntl>) {
    const { $t } = intl
    const columns: TableProps<ApWiredClientInfo>['columns'] = [{
      key: 'hostname',
      title: $t({ defaultMessage: 'Hostname' }),
      dataIndex: 'hostname',
      defaultSortOrder: 'ascend',
      sorter: true,
      fixed: 'left',
      searchable: searchable,
      render: (_, { hostname, macAddress }, __, highlightFn) => {
        const host = searchable ? highlightFn(hostname) : hostname

        return host? <TenantLink
          to={`users/wired/wifi/clients/${macAddress}/details/overview`}
        >{host}</TenantLink> : noDataDisplay
      }
    }, {
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
    }, {
      key: 'macAddress',
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'macAddress',
      sorter: true,
      searchable: searchable,
      render: (_, { macAddress }, __, highlightFn) => {
        const mac = searchable ? highlightFn(macAddress) : macAddress
        return mac ?? noDataDisplay
      }
    }, {
      key: 'ipAddress',
      title: $t({ defaultMessage: 'IP Address' }),
      dataIndex: 'ipAddress',
      sorter: true,
      searchable: searchable,
      render: (_, { ipAddress }, __, highlightFn) => {
        const ipAddr = searchable ? highlightFn(ipAddress) : ipAddress
        return ipAddr ?? noDataDisplay
      }
    },

    ...((params.apId || params.venueId) ? [] : [{
      key: 'venueName',
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      dataIndex: 'venueName',
      sorter: true,
      //searchable: searchable,
      filterKey: 'venueId',
      filterMultiple: false,
      filterSearchable: true,
      filterable: (params.apId || params.venueId) ? false : GetVenueFilterOptions(),
      render: (_: React.ReactNode, row: ApWiredClientInfo) => {
        const { venueName, venueId } = row
        const displayVenueName = venueName ?? noDataDisplay
        const link = `/venues/${venueId}/venue-details/overview`
        return (venueId && venueName) ?
          <TenantLink to={link}>{displayVenueName}</TenantLink> :
          <span>{displayVenueName}</span>
      }
    }]),
    ...(params.apId ? [] : [{
      key: 'apName',
      title: $t({ defaultMessage: 'AP' }),
      dataIndex: 'apName',
      sorter: true,
      //searchable: searchable,
      filterKey: 'apId',
      filterMultiple: false,
      filterSearchable: true,
      filterable: params.serialNumber ? false : GetApFilterOptions(params.venueId),
      render: (_: React.ReactNode, row: ApWiredClientInfo) => {
        const { apId, apName } = row
        const displayApName = apName ?? noDataDisplay
        const link = `/devices/wifi/${apId}/details/overview`
        return (apId && apName) ?
          <TenantLink to={link}>{displayApName}</TenantLink> :
          <span>{displayApName}</span>
      }
    }, {
      key: 'apMacAddress',
      title: $t({ defaultMessage: 'AP MAC' }),
      dataIndex: 'apMacAddress',
      sorter: true,
      searchable: searchable,
      render: (
        _: React.ReactNode, row: ApWiredClientInfo, __: number, highlightFn: TableHighlightFnArgs
      ) => {
        const { apMacAddress } = row
        const displayApName = apMacAddress?
          (searchable ? highlightFn(apMacAddress) : apMacAddress) :
          noDataDisplay
        return displayApName
      }
    }]),
    {
      key: 'portNumber',
      title: intl.$t({ defaultMessage: 'LAN Port' }),
      dataIndex: 'portNumber',
      sorter: true,
      render: (_: React.ReactNode, row: ApWiredClientInfo) => {
        const { portNumber } = row
        return portNumber ? <Button type='link'
          onClick={()=> {
            setApName(row.apName)
            setPortNumber(row.portNumber)
            setApSerialNumber(row.apId)
            setVenueId(row.venueId)
            setDetailVisible(true)}}>
          {$t({ defaultMessage: 'LAN {portNumber}' }, { portNumber })}
        </Button> : noDataDisplay
      }
    }, {
      key: 'vlanId',
      title: intl.$t({ defaultMessage: 'VLAN' }),
      dataIndex: 'vlanId',
      sorter: true,
      align: 'center'
    }, {
      key: 'authStatus',
      title: intl.$t({ defaultMessage: 'Auth Status' }),
      dataIndex: 'authStatus',
      sorter: true,
      render: (_, { authStatus }) => {
        let statusText = noDataDisplay as string
        if (authStatus === 1) {
          statusText = intl.$t({ defaultMessage: 'Authorized' })
        } else if (authStatus === 0) {
          statusText = intl.$t({ defaultMessage: 'Unauthorized' })
        } else if (authStatus === -1) {
          statusText = intl.$t({ defaultMessage: 'N/A' })
        }
        return statusText
      }
    }, {
      key: 'deviceType',
      width: 60,
      title: $t({ defaultMessage: 'Device Type' }),
      dataIndex: 'deviceType',
      align: 'center',
      sorter: true,
      render: (_, { deviceType }) => {
        return <UI.IconContainer>
          <Tooltip title={deviceType}>
            { getDeviceTypeIcon(deviceType) }
          </Tooltip>
        </UI.IconContainer>
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
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter={true}
          rowKey='macAddress'
          filterPersistence={true}
        />
        {detailVisible && <LanPortProfileDetailsDrawer
          title={$t(
            { defaultMessage: '{apName} - LAN {portNumber}' },
            { apName, portNumber }
          )}
          visible={detailVisible}
          wiredPortVisible={true}
          serialNumber={apSerialNumber}
          venueId={venueId}
          portId={portNumber?.toString()}
          setVisible={()=>setDetailVisible(false)}
        />}
      </Loader>
    </div>
  )
}