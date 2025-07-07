import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, Table, TableProps }  from '@acx-ui/components'
import { useGetEdgeClusterListQuery } from '@acx-ui/rc/services'
import { EdgeClusterStatus }          from '@acx-ui/rc/utils'
import { TenantLink }                 from '@acx-ui/react-router-dom'
import { useTableQuery }              from '@acx-ui/utils'

interface EdgeClusterTableProps {
  edgeClusterIds: string[]
}

export const EdgeClusterTable = (props: EdgeClusterTableProps) => {

  const { $t } = useIntl()
  const [isPayloadReady,setIsPayloadReady] = useState(false)
  const defaultQueryPayload = {
    fields: [
      'id',
      'clusterId',
      'name',
      'venueId',
      'venueName'
    ],
    filters: { clusterId: props.edgeClusterIds }
  }
  const tableQuery = useTableQuery({
    useQuery: useGetEdgeClusterListQuery,
    defaultPayload: defaultQueryPayload,
    option: {
      skip: !isPayloadReady || props.edgeClusterIds.length === 0
    }
  })

  useEffect(() => {
    tableQuery.setPayload({
      ...tableQuery.payload,
      filters: { clusterId: props.edgeClusterIds }
    })
  }, [props.edgeClusterIds])

  useEffect(() => {
    if(tableQuery?.payload?.filters?.clusterId.length > 0) {
      setIsPayloadReady(true)
    }
  }, [tableQuery.payload.filters])

  const columns: TableProps<EdgeClusterStatus>['columns'] = [
    {
      title: $t({ defaultMessage: 'Cluster' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: (_, row) => row.name
    },
    {
      title: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }),
      key: 'venueName',
      dataIndex: 'venueName',
      sorter: true,
      render: function (_, row) {
        return (
          <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>
            {row.venueName}
          </TenantLink>
        )
      }
    }
  ]

  return (
    <Loader states={[tableQuery]}>
      <Table
        rowKey='clusterId'
        columns={columns}
        dataSource={tableQuery.data?.data}
        onChange={tableQuery.handleTableChange}
      />
    </Loader>
  )
}
