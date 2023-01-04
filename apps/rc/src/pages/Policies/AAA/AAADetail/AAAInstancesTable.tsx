
import { useEffect } from 'react'

import { useIntl } from 'react-intl'

import { Table, TableProps, Card, Loader }                          from '@acx-ui/components'
import { useAaaNetworkInstancesQuery, useGetAAAProfileDetailQuery } from '@acx-ui/rc/services'
import { AAADetailInstances, useTableQuery }                        from '@acx-ui/rc/utils'
import { TenantLink, useParams }                                    from '@acx-ui/react-router-dom'

export default function AAAInstancesTable (){

  const { $t } = useIntl()
  const params = useParams()
  const { data } = useGetAAAProfileDetailQuery({ params })
  const tableQuery = useTableQuery({
    useQuery: useAaaNetworkInstancesQuery,
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
  const columns: TableProps<AAADetailInstances>['columns'] = [
    {
      key: 'NetworkName',
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'network',
      sorter: true,
      render: function (_data, row) {
        return (
          <TenantLink
            to={`/networks/${row.network.id}/network-details/aps`}>
            {row.network.name}</TenantLink>
        )
      }
    },
    {
      key: 'Type',
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'type',
      render: function (_data, row) {
        return row.network.captiveType
      }
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
