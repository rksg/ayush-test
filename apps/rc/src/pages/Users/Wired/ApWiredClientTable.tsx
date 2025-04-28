import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { ColumnType, Loader, Table, TableHighlightFnArgs, TableProps, Tooltip } from '@acx-ui/components'
import { useApListQuery, useGetApWiredClientsQuery, useVenuesListQuery }        from '@acx-ui/rc/services'
import {
  defaultSort,
  getDeviceTypeIcon,
  getOsTypeIcon,
  sortProp,
  TableQuery,
  usePollingTableQuery,
  WiredClientInfo
} from '@acx-ui/rc/utils'
import { TenantLink }     from '@acx-ui/react-router-dom'
import { RequestPayload } from '@acx-ui/types'
import { noDataDisplay }  from '@acx-ui/utils'

import * as UI from './styledComponents'

export const defaultApWiredClientPayload = {
  searchString: '',
  searchTargetFields: ['clientMac','ipAddress','hostname','apMac'],
  filters: {},
  fields: [
    'hostname', 'username', 'clientMac', 'ipAddress',
    'deviceTypeStr', 'osType', 'modelName',
    'venueName', 'venueId', 'apName', 'apIp', 'apMac',
    'connectSince', 'apEthId', 'ethProfileId',
    'portNumber', 'vlan', 'status', 'connectSince'
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
    tableQuery?: TableQuery<WiredClientInfo, RequestPayload<unknown>, unknown>
    searchable?: boolean
    filterableKeys?: { [key: string]: ColumnType['filterable'] }
}) => {
  const params = useParams()
  const { searchable, settingsId = 'ap-wired-clients-table' } = props

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
    const columns: TableProps<WiredClientInfo>['columns'] = [{
      key: 'hostName',
      title: $t({ defaultMessage: 'Hostname' }),
      dataIndex: 'hostName',
      defaultSortOrder: 'ascend',
      sorter: true,
      fixed: 'left',
      render: (_, { hostname }, __, highlightFn) => {
        const host = searchable ? highlightFn(hostname) : hostname
        return host ?? noDataDisplay
      }
    }, {
      key: 'osType',
      width: 60,
      title: intl.$t({ defaultMessage: 'OS' }),
      dataIndex: 'osType',
      align: 'center',
      sorter: { compare: sortProp('osType', defaultSort) },
      render: (_, { osType }) => {
        return <UI.IconContainer>
          <Tooltip title={osType}>
            { getOsTypeIcon(osType) }
          </Tooltip>
        </UI.IconContainer>
      }
    }, {
      key: 'clientMac',
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'clientMac',
      sorter: true,
      searchable: searchable,
      render: (_, { clientMac }, __, highlightFn) => {
        const mac = searchable ? highlightFn(clientMac) : clientMac
        return mac ?? noDataDisplay
      }
    }, {
      key: 'ipAddress',
      title: $t({ defaultMessage: 'IP Address' }),
      dataIndex: 'ipAddress',
      sorter: true,
      render: (_, { ipAddress }) => {
        return <Tooltip title={ipAddress}>
          {ipAddress || noDataDisplay}
        </Tooltip>
      }
    },

    ...((params.apId || params.venueId) ? [] : [{
      key: 'venueName',
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      dataIndex: 'venueName',
      //sorter: true,
      //searchable: searchable,
      filterKey: 'venueId',
      filterMultiple: false,
      filterSearchable: true,
      filterable: (params.apId || params.venueId) ? false : GetVenueFilterOptions(),
      render: (_: React.ReactNode, row: WiredClientInfo) => {
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
      //sorter: true,
      //searchable: searchable,
      filterKey: 'serialNumber',
      filterMultiple: false,
      filterSearchable: true,
      filterable: params.serialNumber ? false : GetApFilterOptions(params.venueId),
      render: (_: React.ReactNode, row: WiredClientInfo) => {
        const { serialNumber, apName } = row
        const displayApName = apName ?? noDataDisplay
        const link = `/devices/wifi/${serialNumber}/details/overview`
        return (serialNumber && apName) ?
          <TenantLink to={link}>{displayApName}</TenantLink> :
          <span>{displayApName}</span>
      }
    }, {
      key: 'apMac',
      title: $t({ defaultMessage: 'AP MAC' }),
      dataIndex: 'apMac',
      sorter: true,
      render: (
        _: React.ReactNode, row: WiredClientInfo, __: number, highlightFn: TableHighlightFnArgs
      ) => {
        const { apMac } = row
        const displayApName = apMac?
          (searchable ? highlightFn(apMac) : apMac) :
          noDataDisplay
        return displayApName
      }
    }]),
    {
      key: 'apEthId',
      title: intl.$t({ defaultMessage: 'LAN Port' }),
      dataIndex: 'apEthId',
      sorter: true,
      render: (_, { apEthId }) => {
        return apEthId ? `LAN ${apEthId}` : noDataDisplay
      }
    }, {
      key: 'vlan',
      title: intl.$t({ defaultMessage: 'VLAN' }),
      dataIndex: 'vlan',
      sorter: true,
      align: 'center'
    }, {
      key: 'status',
      title: intl.$t({ defaultMessage: 'Auth Status' }),
      dataIndex: 'status',
      sorter: true,
      render: (_, { status }) => {
        let statusText = noDataDisplay as string
        if (status === 1) {
          statusText = intl.$t({ defaultMessage: 'Authorized' })
        } else if (status === 0) {
          statusText = intl.$t({ defaultMessage: 'Unauthorized' })
        } else if (status === -1) {
          statusText = intl.$t({ defaultMessage: 'N/A' })
        }
        return statusText
      }
    }, {
      key: 'deviceTypeStr',
      width: 60,
      title: $t({ defaultMessage: 'Device Type' }),
      dataIndex: 'deviceTypeStr',
      align: 'center',
      sorter: true,
      render: (_, { deviceTypeStr }) => {
        return <UI.IconContainer>
          <Tooltip title={deviceTypeStr}>
            { getDeviceTypeIcon(deviceTypeStr) }
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
      </Loader>
    </div>
  )
}