import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, Table, TableProps }                   from '@acx-ui/components'
import { EdgeServiceStatusLight }                      from '@acx-ui/rc/components'
import { useGetEdgeListQuery }                         from '@acx-ui/rc/services'
import { EdgeAlarmSummary, EdgeStatus, useTableQuery } from '@acx-ui/rc/utils'
import { TenantLink }                                  from '@acx-ui/react-router-dom'

interface EdgeTableProps {
  edgeIds: string[]
  edgeAlarmSummary: EdgeAlarmSummary[]
}

export const EdgeTable = (props: EdgeTableProps) => {

  const { $t } = useIntl()
  const [isDataReady,setIsDataReady] = useState(false)
  const defaultEdgePayload = {
    fields: [
      'serialNumber',
      'name',
      'venueId',
      'venueName'
    ],
    filters: { serialNumber: props.edgeIds }
  }
  const tableQuery = useTableQuery({
    useQuery: useGetEdgeListQuery,
    defaultPayload: defaultEdgePayload,
    option: {
      skip: !isDataReady || props.edgeIds.length === 0
    }
  })

  useEffect(() => {
    tableQuery.setPayload({
      ...tableQuery.payload,
      filters: { serialNumber: props.edgeIds }
    })
  }, [props.edgeIds])

  useEffect(() => {
    if(tableQuery?.payload?.filters?.serialNumber.length > 0) {
      setIsDataReady(true)
    }
  }, [tableQuery.payload.filters])

  const columns: TableProps<EdgeStatus>['columns'] = [
    {
      title: $t({ defaultMessage: 'SmartEdge' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: function (_, row) {
        return (
          <TenantLink to={`/devices/edge/${row.serialNumber}/details/overview`}>
            {row.name}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Venue' }),
      key: 'venueName',
      dataIndex: 'venueName',
      sorter: true,
      render: (_, row) => (
        <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>
          {row.venueName}
        </TenantLink>
      )
    },
    {
      title: $t({ defaultMessage: 'Service Health' }),
      key: 'health',
      dataIndex: 'health',
      render: (data, row) => {
        if(!props.edgeAlarmSummary) return '--'
        const targetAlarmSummary = props.edgeAlarmSummary?.find(
          item => item.edgeId.toLocaleLowerCase() === row.serialNumber?.toLocaleLowerCase()
        )
        return <EdgeServiceStatusLight data={targetAlarmSummary ? [targetAlarmSummary] : []} />
      }
    }
  ]

  return (
    <Loader states={[tableQuery]}>
      <Table
        rowKey='serialNumber'
        columns={columns}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
      />
    </Loader>
  )
}
