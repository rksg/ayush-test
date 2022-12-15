
import React         from 'react'
import { useEffect } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Table, TableProps, Card, Loader }            from '@acx-ui/components'
import { useVenuesListQuery, useGetDHCPProfileQuery } from '@acx-ui/rc/services'
import { Venue }                                      from '@acx-ui/rc/utils'
import { useTableQuery }                              from '@acx-ui/rc/utils'
import { TenantLink }                                 from '@acx-ui/react-router-dom'


export default function DHCPInstancesTable (){

  const { $t } = useIntl()

  const params = useParams()
  const { data } = useGetDHCPProfileQuery({ params })

  const tableQuery = useTableQuery({
    useQuery: useVenuesListQuery,
    defaultPayload: {
      fields: ['name', 'id', 'aggregatedApStatus', 'switches'],
      filters: {
        id: data?.venueIds
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
          id: data?.venueIds
        }
      })
    }
  },[data])


  const columns: TableProps<Venue>['columns'] = [
    {
      key: 'VenueName',
      title: $t({ defaultMessage: 'Venue Name' }),
      dataIndex: 'venue',
      sorter: true,
      render: function (_data, row) {
        return (
          <TenantLink
            to={`/venues/${row.id}/venue-details/overview`}>{row.id}</TenantLink>
        )
      }
    },
    {
      key: 'APs',
      title: $t({ defaultMessage: 'APs' }),
      dataIndex: 'aggregatedApStatus',
      render: function (data, row) {
        const count = row.aggregatedApStatus
          ? Object.values(row.aggregatedApStatus)
            .reduce((a, b) => a + b, 0)
          : 0
        return ( <TenantLink
          to={`/venues/${row.id}/venue-details/devices`}
          children={count ? count : 0}
        />
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Switches' }),
      key: 'switches',
      dataIndex: 'switches',
      render: function (data, row) {
        return (
          <TenantLink
            to={`/venues/${row.id}/venue-details/devices`}
            children={data ? data : 0}
          />
        )
      }
    }
  ]

  return (
    <Loader states={[{ isLoading: tableQuery.isLoading||tableQuery.isFetching }]}>
      <Card title={$t({ defaultMessage: 'Instances ({count})' },
        { count: tableQuery.data?.data.length })}>
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

