
import React from 'react'

import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { Table, TableProps, Card } from '@acx-ui/components'
import { DHCPDetailInstances }     from '@acx-ui/rc/utils'
import { TenantLink }              from '@acx-ui/react-router-dom'

import HealthBar from './HealthBar'


export default function DHCPInstancesTable (
  props:Partial<TableProps<DHCPDetailInstances>>){

  const { $t } = useIntl()
  const { dataSource } = props
  const columns: TableProps<DHCPDetailInstances>['columns'] = [
    {
      key: 'VenueName',
      title: $t({ defaultMessage: 'Venue Name' }),
      dataIndex: 'venue',
      width: 10,
      sorter: true,
      render: function (_data, row) {
        return (
          <TenantLink
            to={`/venues/${row.venue.id}/venue-details/overview`}>{row.venue.name}</TenantLink>
        )
      }
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
      render: (data) => <HealthBar value={Number(data)}/>
    },
    {
      key: 'osa',
      title: $t({ defaultMessage: '# of successful allocations' }),
      width: 200,
      dataIndex: 'successfulAllocations'
    },
    {
      key: 'ousa',
      title: $t({ defaultMessage: '# of un-successful allocations' }),
      width: 220,
      dataIndex: 'unsuccessfulAllocations'
    },
    {
      key: 'droppedpackets',
      title: $t({ defaultMessage: 'Dropped Packets' }),
      width: 160,
      dataIndex: 'droppedPackets',
      render: (data) =>{
        return data+'%'
      }
    },
    {
      key: 'capacity',
      title: $t({ defaultMessage: 'Capacity' }),
      width: 100,
      dataIndex: 'capacity',
      render: (data) =>{
        return data+'%'
      }
    }
  ]

  return (
    <Card>
      <div style={{ width: '100%' }}>
        <Typography.Title level={3}>
          {$t({ defaultMessage: 'Instances' })+` (${dataSource?.length})`}
        </Typography.Title>
        <div >
          <Table
            columns={columns}
            dataSource={dataSource}
            rowKey='id'
          />
        </div>
      </div>
    </Card>
  )
}

