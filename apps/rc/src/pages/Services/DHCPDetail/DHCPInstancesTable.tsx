
import React from 'react'

import { Row }     from 'antd'
import { useIntl } from 'react-intl'

import { Table, TableProps, Card } from '@acx-ui/components'
import { DHCPDetailInstances }     from '@acx-ui/rc/utils'


import ProgressBar from './ProgressBar'


export default function DHCPInstancesTable (props: {
  dataSource:DHCPDetailInstances[] | undefined,
  pagination: { current: number; pageSize: number; total: number; },
  onChange: Function,
  style: React.CSSProperties }) {
  const { $t } = useIntl()
  const { dataSource, style } = props
  const columns: TableProps<DHCPDetailInstances>['columns'] = [
    {
      key: 'VenueName',
      title: $t({ defaultMessage: 'Venue Name' }),
      dataIndex: 'venueName',
      width: 10,
      sorter: true
    },
    {
      key: 'APs',
      title: $t({ defaultMessage: 'APs' }),
      dataIndex: 'aps',
      width: 100

    },
    {
      key: 'switches',
      title: $t({ defaultMessage: 'Switches' }),
      dataIndex: 'switches',
      width: 100
    },
    {
      key: 'serviceHealth',
      title: $t({ defaultMessage: 'Service Health' }),
      width: 135,
      dataIndex: 'health',
      render: (data) =>{
        return (<ProgressBar sliceNumber={8} value={Number(data)}/>)
      }
    },
    {
      key: 'osa',
      title: $t({ defaultMessage: '# of successful allocations' }),
      width: 200,
      dataIndex: 'successfulAllocations'
    },
    {
      key: 'ousa',
      title: $t({ defaultMessage: 'of un-successful allocations' }),
      width: 210,
      dataIndex: 'unsuccessfulAllocations'
    },
    {
      key: 'droppedpackets',
      title: $t({ defaultMessage: 'Dropped packets' }),
      width: 160,
      dataIndex: 'droppedpackets'
    },
    {
      key: 'capacity',
      title: $t({ defaultMessage: 'Capacity' }),
      width: 100,
      dataIndex: 'capacity'
    }
  ]

  return (
    <Row style={style}>
      <Card>
        <div style={{ width: '100%' }}>
          <Table
            columns={columns}
            dataSource={dataSource}
            rowKey='id'
          />
        </div>
      </Card>
    </Row>
  )
}

