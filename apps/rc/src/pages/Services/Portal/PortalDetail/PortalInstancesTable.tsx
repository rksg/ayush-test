
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
      }
    },
    search: {
      searchTargetFields: ['name'],
      searchString: ''
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
      searchable: true,
      sorter: true,
      fixed: 'left',
      render: function (_, row) {
        return (
          <TenantLink
            to={`/networks/wireless/${row.id}/network-details/overview`}>
            {row.name}</TenantLink>
        )
      }
    },
    {
      key: 'Type',
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'nwSubType',
      sorter: true,
      render: (_, row) => <NetworkType
        networkType={row.nwSubType as NetworkTypeEnum}
        row={row}
      />
    },
    {
      key: 'Venues',
      title: $t({ defaultMessage: 'Venues' }),
      dataIndex: ['venues', 'count'],
      align: 'center',
      sorter: true,
      render: function (_, row) {
        return <TenantLink
          to={`/networks/wireless/${row.id}/network-details/venues`}
          children={row.venues?.count ? row.venues?.count : 0}
        />
      }
    },
    {
      key: 'clients',
      title: $t({ defaultMessage: 'Number of Clients' }),
      align: 'center',
      dataIndex: 'clients',
      sorter: true
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
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter={true}
        />
      </Card>
    </Loader>
  )
}
