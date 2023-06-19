
import { useEffect } from 'react'

import { Progress } from 'antd'
import { useIntl }  from 'react-intl'

import { Loader, Table, TableProps }                from '@acx-ui/components'
import { useGetDhcpPoolStatsQuery }                 from '@acx-ui/rc/services'
import { DhcpPoolStats, TableQuery, useTableQuery } from '@acx-ui/rc/utils'
import { RequestPayload }                           from '@acx-ui/types'

interface EdgeDhcpPoolTableProps {
  edgeId?: string
  tableQuery?: TableQuery<DhcpPoolStats, RequestPayload<unknown>, unknown>
}

export const EdgeDhcpPoolTable = (props: EdgeDhcpPoolTableProps) => {

  const { $t } = useIntl()

  const getDhcpPoolStatsPayload = {
    filters: { edgeIds: [props.edgeId] },
    sortField: 'name',
    sortOrder: 'ASC'
  }
  const localQuery = useTableQuery<DhcpPoolStats, RequestPayload<unknown>, unknown>({
    useQuery: useGetDhcpPoolStatsQuery,
    defaultPayload: getDhcpPoolStatsPayload,
    option: { skip: !!!props.edgeId }
  })
  const tableQuery = props.tableQuery || localQuery

  useEffect(() => {
    if(props.edgeId) {
      localQuery.setPayload({
        ...localQuery.payload,
        filters: { edgeIds: [props.edgeId] }
      })
    }
  }, [props.edgeId])


  const columns: TableProps<DhcpPoolStats>['columns'] = [
    {
      title: $t({ defaultMessage: 'Pool' }),
      key: 'poolName',
      dataIndex: 'poolName',
      sorter: true,
      defaultSortOrder: 'ascend'
    },
    {
      title: $t({ defaultMessage: 'Subnet Mask' }),
      key: 'subnetMask',
      dataIndex: 'subnetMask'
    },
    {
      title: $t({ defaultMessage: 'Pool Range' }),
      key: 'poolRange',
      dataIndex: 'poolRange'
    },
    {
      title: $t({ defaultMessage: 'Gateway' }),
      key: 'gateway',
      dataIndex: 'gateway'
    },
    {
      title: $t({ defaultMessage: 'Utilization' }),
      key: 'utilization',
      dataIndex: 'utilization',
      render () {
        return <Progress
          style={{ width: 100 }}
          strokeLinecap='butt'
          strokeColor='var(--acx-semantics-green-50)'
          percent={0}
          showInfo={false}
          strokeWidth={20}
        />
      }
    }
    // TODO Activate TBD
    // {
    //   title: $t({ defaultMessage: 'Activate' }),
    //   key: 'activate',
    //   dataIndex: 'activate',
    //   render (data, row) {
    //     return <Switch defaultChecked={row.activate} />
    //   }
    // }
  ]

  return (
    <Loader states={[tableQuery]}>
      <Table
        settingsId='edge-dhcp-pools-table'
        columns={columns}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
      />
    </Loader>
  )
}
