import { useEffect } from 'react'

import { useIntl } from 'react-intl'

import { Table, TableProps, Loader }   from '@acx-ui/components'
import { useGetSwitchClientListQuery } from '@acx-ui/rc/services'
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
  fields: ['switchId','clientVlan','venueId','switchSerialNumber','clientMac',
    'clientName','clientDesc','clientType','switchPort','vlanName',
    'switchName', 'venueName' ,'cog','id'],
  sortField: 'clientMac',
  sortOrder: 'DESC',
  filters: {}
}

export function ClientsTable (props: {
  searchString?: string,
  tableQuery?: TableQuery<SwitchClient, RequestPayload<unknown>, unknown>
}) {
  const params = useParams()
  const { searchString } = props

  defaultSwitchClientPayload.filters =
    params.switchId ? { switchId: [params.switchId] } : {}


  const inlineTableQuery = useTableQuery({
    useQuery: useGetSwitchClientListQuery,
    defaultPayload: { ...defaultSwitchClientPayload, searchString },
    option: { skip: !!props.tableQuery }
  })
  const tableQuery = props.tableQuery || inlineTableQuery

  useEffect(() => {
    if (searchString !== undefined && tableQuery.payload.searchString !== searchString) {
      tableQuery.setPayload({
        ...(tableQuery.payload as typeof defaultSwitchClientPayload), searchString })
    }
  }, [searchString])

  function getCols (intl: ReturnType<typeof useIntl>) {
    const columns: TableProps<SwitchClient>['columns'] = [{
      key: 'clientMac',
      title: intl.$t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'clientMac',
      sorter: true,
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
      render: (data) => {
        return data || '--'
      }
    }, {
      key: 'clientType',
      title: intl.$t({ defaultMessage: 'Device Type' }),
      dataIndex: 'clientType',
      sorter: true,
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
      render: (data, row) => {
        return row.clientVlan ? `${data ? data : ''} (${row.clientVlan})`: '--'
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
          rowKey='clientMac'
        />
      </Loader>
    </div>
  )
}
