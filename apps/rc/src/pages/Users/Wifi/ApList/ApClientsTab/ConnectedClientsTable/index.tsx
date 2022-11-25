import { ReactNode } from 'react'

import { useIntl } from 'react-intl'

import { Subtitle, Tooltip }                                                        from '@acx-ui/components'
import { Button, PageHeader, Table, TableProps, Loader, showActionModal } from '@acx-ui/components'
import { useNetworkListQuery }                  from '@acx-ui/rc/services'
import {
  NetworkTypeEnum,
  useTableQuery,
  Network,
  NetworkType
}                                                            from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useTenantLink, useParams } from '@acx-ui/react-router-dom'
import { getIntl }                          from '@acx-ui/utils'

const disabledType = [NetworkTypeEnum.DPSK, NetworkTypeEnum.CAPTIVEPORTAL]

function getCols (intl: ReturnType<typeof useIntl>) {
  const columns: TableProps<Network>['columns'] = [
    {
      key: 'hostname',
      title: intl.$t({ defaultMessage: 'Hostname' }),
      dataIndex: 'hostname',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: (data, row) => 
      <TenantLink to={`/networks/${row.id}/network-details/aps`}>{data}</TenantLink>
    },
    {
      key: 'name',
      title: intl.$t({ defaultMessage: 'Network Name' }),
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        if(disabledType.indexOf(row.nwSubType as NetworkTypeEnum) > -1){
          return data
        }else{
          return (
            <TenantLink to={`/networks/${row.id}/network-details/aps`}>{data}</TenantLink>
          )
        }
      }
    },
    {
      key: 'description',
      title: intl.$t({ defaultMessage: 'Description' }),
      dataIndex: 'description',
      sorter: true
    },
    {
      key: 'nwSubType',
      title: intl.$t({ defaultMessage: 'Type' }),
      dataIndex: 'nwSubType',
      sorter: true,
      render: (data: unknown, row) => <NetworkType
        networkType={data as NetworkTypeEnum}
        row={row}
      />
    },
    {
      key: 'venues',
      title: intl.$t({ defaultMessage: 'Venues' }),
      dataIndex: ['venues', 'count'],
      sorter: true,
      align: 'center',
      render: function (count, row) {
        if(disabledType.indexOf(row.nwSubType as NetworkTypeEnum) > -1){
          return count
        }else{
          return (
            <TenantLink
              to={`/networks/${row.id}/network-details/venues`}
              children={count ? count : 0}
            />
          )
        }
      }
    },
    {
      key: 'aps',
      title: intl.$t({ defaultMessage: 'APs' }),
      dataIndex: 'aps',
      sorter: true,
      align: 'center',
      render: function (data, row) {
        if(disabledType.indexOf(row.nwSubType as NetworkTypeEnum) > -1){
          return data
        }else{
          return (
            <TenantLink to={`/networks/${row.id}/network-details/aps`}>{data}</TenantLink>
          )
        }
      }
    },
    {
      key: 'clients',
      title: intl.$t({ defaultMessage: 'Clients' }),
      dataIndex: 'clients',
      sorter: true,
      align: 'center'
    },
    {
      key: 'services',
      title: intl.$t({ defaultMessage: 'Services' }),
      dataIndex: 'services',
      sorter: true,
      align: 'center'
    },
    {
      key: 'vlan',
      title: intl.$t({ defaultMessage: 'VLAN' }),
      dataIndex: 'vlan',
      sorter: true,
      render: function (data, row) {
        return transformVLAN(row)
      }
    },
    {
      key: 'health',
      title: intl.$t({ defaultMessage: 'Health' }),
      dataIndex: 'health',
      sorter: true
    },
    {
      key: 'tags',
      title: intl.$t({ defaultMessage: 'Tags' }),
      dataIndex: 'tags',
      sorter: true
    }
  ]
  return columns
}


const transformVLAN = (row: Network) => {
  const { $t } = getIntl()
  if (row.vlanPool) {
    const vlanPool = row.vlanPool
    return $t({ defaultMessage: 'VLAN Pool: {poolName}' }, { poolName: vlanPool?.name ?? '' })
  }
  return $t({ defaultMessage: 'VLAN-{id}' }, { id: row.vlan })
}

const defaultPayload = {
  searchString: '',
  fields: [
    'check-all',
    'name',
    'description',
    'nwSubType',
    'venues',
    'aps',
    'clients',
    'vlan',
    'cog',
    'ssid',
    'vlanPool',
    'captiveType',
    'id'
  ]
}

export default function ConnectedClientsTable () {
  const { $t } = useIntl()
  const ConnectedClientsTable = () => {
    const navigate = useNavigate()
    const linkToEditNetwork = useTenantLink('/networks/')
    const tableQuery = useTableQuery({
      useQuery: useNetworkListQuery,
      defaultPayload
    })
    const { tenantId } = useParams()

    return (
      <Loader states={[
        tableQuery
      ]}>
        <Subtitle level={4}>
          {$t({ defaultMessage: 'Connected Clients' })} 
        </Subtitle>
        <Table
          columns={getCols(useIntl())}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
        />
      </Loader>
    )
  }

  return (
    <>
      <ConnectedClientsTable />
    </>
  )
}
