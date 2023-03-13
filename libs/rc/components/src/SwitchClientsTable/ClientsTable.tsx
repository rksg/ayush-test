import { useIntl } from 'react-intl'

import { Table, TableProps, Loader, ColumnType } from '@acx-ui/components'
import { useGetSwitchClientListQuery }           from '@acx-ui/rc/services'
import {
  SwitchClient,
  useTableQuery,
  SWITCH_CLIENT_TYPE,
  TableQuery,
  RequestPayload
} from '@acx-ui/rc/utils'
import { useParams, TenantLink } from '@acx-ui/react-router-dom'

export const defaultSwitchClientPayload = {
  searchString: '',
  searchTargetFields: ['clientMac', 'clientDesc', 'clientType', 'venueName',
    'switchName', 'vlanName'],
  fields: ['switchId','clientVlan','venueId','switchSerialNumber','clientMac',
    'clientName','clientDesc','clientType','switchPort','vlanName',
    'switchName', 'venueName' ,'cog','id'],
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

  defaultSwitchClientPayload.filters =
    params.switchId ? { switchId: [params.switchId] } :
      params.venueId ? { venueId: [params.venueId] } : {}


  const inlineTableQuery = useTableQuery({
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

  function getCols (intl: ReturnType<typeof useIntl>) {
    const columns: TableProps<SwitchClient>['columns'] = [{
      key: 'clientMac',
      title: intl.$t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'clientMac',
      sorter: true,
      searchable: searchable,
      render: (data, row) => {
        const name = data ? data.toString().toUpperCase() : '--'
        return <TenantLink to={`users/switch/clients/${row.id}`}>{name}</TenantLink>
      }
    }, {
      key: 'clientName',
      title: intl.$t({ defaultMessage: 'Hostname' }),
      dataIndex: 'clientName',
      sorter: true,
      render: (data) => {
        return data || '--'
      }
    }, {
      key: 'clientDesc',
      title: intl.$t({ defaultMessage: 'Description' }),
      dataIndex: 'clientDesc',
      sorter: true,
      searchable: searchable,
      render: (data) => {
        return data || '--'
      }
    }, {
      key: 'clientType',
      title: intl.$t({ defaultMessage: 'Device Type' }),
      dataIndex: 'clientType',
      sorter: true,
      searchable: searchable,
      render: (data) => {
        switch(data){
          case SWITCH_CLIENT_TYPE.AP:
            return 'AP'
          case SWITCH_CLIENT_TYPE.ROUTER:
            return 'Router'
          default:
            return data || '--'
        }
      }
    }, {
      key: 'venueName',
      title: intl.$t({ defaultMessage: 'Venue' }),
      dataIndex: 'venueName',
      sorter: true,
      show: !params.switchId,
      searchable: searchable,
      filterKey: 'venueId',
      filterable: filterableKeys ? filterableKeys['venueId'] : false,
      render: (data, row) => {
        const name = data ? data.toString().toUpperCase() : '--'
        // eslint-disable-next-line max-len
        return <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>{name}</TenantLink>
      }
    }, {
      key: 'switchName',
      title: intl.$t({ defaultMessage: 'Switch' }),
      dataIndex: 'switchName',
      sorter: false,
      show: !params.switchId,
      searchable: searchable,
      filterKey: 'switchId',
      filterable: filterableKeys ? filterableKeys['switchId'] : false,
      render: (data, row) => {
        const name = data ? data.toString().toUpperCase() : '--'
        const link = `/devices/switch/${row.switchId}/${row.switchSerialNumber}/details/overview`
        return (row.switchId && data) ?
          <TenantLink to={link}>{name}</TenantLink> :
          <span>{name}</span>
      }
    }, {
      key: 'switchPort',
      title: intl.$t({ defaultMessage: 'Port' }),
      dataIndex: 'switchPort',
      sorter: true
    }, {
      key: 'vlanName',
      title: intl.$t({ defaultMessage: 'VLAN' }),
      dataIndex: 'vlanName',
      sorter: true,
      align: 'center',
      searchable: searchable,
      render: (data, row) => {
        return data === 'DEFAULT-VLAN'
          ? `${row.clientVlan} (${intl.$t({ defaultMessage: 'Default VLAN' })})`
          : (row.clientVlan ?? '--')
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
          columns={getCols(useIntl())}
          dataSource={tableQuery.data?.data}
          pagination={false}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter={true}
          rowKey='clientMac'
        />
      </Loader>
    </div>
  )
}
