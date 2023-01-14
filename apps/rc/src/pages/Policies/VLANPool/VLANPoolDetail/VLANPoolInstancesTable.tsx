import { useEffect } from 'react'

import { useIntl } from 'react-intl'

import { Table, TableProps, Card, Loader }                                   from '@acx-ui/components'
import { useVLANPoolNetworkInstancesQuery, useGetVLANPoolPolicyDetailQuery } from '@acx-ui/rc/services'
import { VLANPoolDetailInstances, useTableQuery }                            from '@acx-ui/rc/utils'
import { TenantLink, useParams }                                             from '@acx-ui/react-router-dom'

export default function VLANPoolInstancesTable (){

  const { $t } = useIntl()
  const params = useParams()
  const { data } = useGetVLANPoolPolicyDetailQuery({ params })
  const tableQuery = useTableQuery({
    useQuery: useVLANPoolNetworkInstancesQuery,
    defaultPayload: {
      fields: ['name', 'id', 'aps', 'scope'],
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
  const columns: TableProps<VLANPoolDetailInstances>['columns'] = [
    {
      key: 'NetworkName',
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'name',
      sorter: true,
      render: function (_data, row) {
        return (
          <TenantLink
            to={`/networks/${row.id}/network-details/aps`}>
            {row.name}</TenantLink>
        )
      }
    },
    {
      key: 'APs',
      title: $t({ defaultMessage: 'APs' }),
      dataIndex: 'aps'
    },
    {
      key: 'DeploymentScope',
      title: $t({ defaultMessage: 'Deployment Scope' }),
      dataIndex: 'scope'
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
