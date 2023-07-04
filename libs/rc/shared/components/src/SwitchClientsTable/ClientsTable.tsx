import { useContext, useEffect } from 'react'

import { useIntl } from 'react-intl'

import { Table, TableProps, Loader, ColumnType } from '@acx-ui/components'
import { useGetSwitchClientListQuery }           from '@acx-ui/rc/services'
import {
  SwitchClient,
  usePollingTableQuery,
  SWITCH_CLIENT_TYPE,
  TableQuery
} from '@acx-ui/rc/utils'
import { useParams, TenantLink } from '@acx-ui/react-router-dom'
import { RequestPayload }        from '@acx-ui/types'

import { SwitchClientContext } from './context'

export const defaultSwitchClientPayload = {
  searchString: '',
  searchTargetFields: ['clientName', 'clientMac', 'clientDesc', 'clientType',
    'venueName', 'switchName', 'clientVlan', 'switchPort'],
  fields: ['switchId','clientVlan','venueId','switchSerialNumber','clientMac',
    'clientName','clientDesc','clientType','deviceType','switchPort','vlanName',
    'switchName', 'venueName' ,'cog','id','switchPortFormatted'],
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
    const columns: TableProps<SwitchClient>['columns'] = [{
      key: 'clientName',
      title: intl.$t({ defaultMessage: 'Hostname' }),
      dataIndex: 'clientName',
      defaultSortOrder: 'ascend',
      sorter: true,
      fixed: 'left',
      render: (data, row) => {
        return <TenantLink to={`users/switch/clients/${row.id}`}>{data || '--'}</TenantLink>
      }
    },
    {
      key: 'clientMac',
      title: intl.$t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'clientMac',
      sorter: true,
      searchable: searchable,
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
      dataIndex: 'deviceType',
      sorter: true,
      searchable: searchable,
      render: (data, row) => {
        switch(row.clientType){
          case SWITCH_CLIENT_TYPE.AP:
            return 'AP'
          case SWITCH_CLIENT_TYPE.ROUTER:
            return 'Router'
          default:
            return row.clientType || '--'
        }
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
      render: (data: React.ReactNode, row: SwitchClient) => {
        const name = data ? data : '--'
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
      render: (data: React.ReactNode, row: SwitchClient) => {
        const name = data ? data : '--'
        const link = `/devices/switch/${row.switchId}/${row.switchSerialNumber}/details/overview`
        return (row.switchId && data) ?
          <TenantLink to={link}>{name}</TenantLink> :
          <span>{name}</span>
      }
    }]),
    {
      key: 'switchPort',
      title: intl.$t({ defaultMessage: 'Port' }),
      dataIndex: 'switchPortFormatted',
      sorter: true,
      render: (data, row) => row['switchPort']
    }, {
      key: 'vlanName',
      title: intl.$t({ defaultMessage: 'VLAN' }),
      dataIndex: 'clientVlan',
      sorter: true,
      align: 'center',
      searchable: searchable,
      render: (data, row) => {
        return row.vlanName === 'DEFAULT-VLAN'
          ? `${data} (${intl.$t({ defaultMessage: 'Default VLAN' })})` : (data ?? '--')
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
