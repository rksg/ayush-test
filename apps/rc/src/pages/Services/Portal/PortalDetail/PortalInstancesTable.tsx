
import { useEffect } from 'react'

import { useIntl } from 'react-intl'

import { Table, TableProps, Card, Loader }                      from '@acx-ui/components'
import { useGetPortalProfileDetailQuery, useNetworkListQuery }  from '@acx-ui/rc/services'
import { Network, NetworkType, NetworkTypeEnum, useTableQuery } from '@acx-ui/rc/utils'
import { TenantLink, useParams }                                from '@acx-ui/react-router-dom'

export default function PortalInstancesTable (){

  const { $t } = useIntl()
  const params = useParams()
  const { data } = useGetPortalProfileDetailQuery({ params })
  const tableQuery = useTableQuery({
    useQuery: useNetworkListQuery,
    defaultPayload: {
      fields: ['name', 'id', 'captiveType', 'nwSubType', 'venues', 'clients'],
      filters: {
        id: data?.networkIds?.length? data?.networkIds : ['none']
      },
      sortField: 'name',
      sortOrder: 'ASC'
    }
  })

  useEffect(()=>{
    if(data){
      tableQuery.setPayload({
        ...tableQuery.payload,
        filters: {
          id: data?.networkIds?.length? data?.networkIds : ['none']
        }
      })
    }
  },[data])

  const columns: TableProps<Network>['columns'] = [
    {
      key: 'NetworkName',
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'name',
      sorter: true,
      render: function (_data, row) {
        return (
          <TenantLink
            to={`/networks/wireless/${row.id}/network-details/aps`}>
            {row.name}</TenantLink>
        )
      }
    },
    {
      key: 'Type',
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'nwSubType',
      render: (data: unknown, row) => <NetworkType
        networkType={data as NetworkTypeEnum}
        row={row}
      />
    },
    {
      key: 'Venues',
      title: $t({ defaultMessage: 'Venues' }),
      dataIndex: ['venues', 'count'],
      render: function (_data, row) {
        return <TenantLink
          to={`/networks/wireless/${row.id}/network-details/venues`}
          children={_data ? _data : 0}
        />
      }
    },
    {
      key: 'clients',
      title: $t({ defaultMessage: 'Number of Clients' }),
      dataIndex: 'clients'
    }
  ]
  return (
    <Loader states={[tableQuery]}>
      <Card title={$t({ defaultMessage: 'Instances ({count})' },
        { count: tableQuery.data?.totalCount })}>
        <Table
          columns={columns}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          dataSource={tableQuery.data?.data}
          rowKey='id'
        />
      </Card>
    </Loader>
  )
}
