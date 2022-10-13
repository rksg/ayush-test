
import React from 'react'

import { Typography, Switch } from 'antd'
import { useIntl }            from 'react-intl'

import { Table, TableProps, Card } from '@acx-ui/components'
import { TenantLink }              from '@acx-ui/react-router-dom'


export default function DHCPInstancesTable (
  props:Partial<TableProps<DHCPPool>>){

  const { $t } = useIntl()
  const { dataSource } = props
  const columns: TableProps<DHCPPool>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Pool Name' }),
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
      title: $t({ defaultMessage: 'Address Pool' }),
      dataIndex: 'aps',
      width: 100
    },
    {
      key: 'subnet',
      title: $t({ defaultMessage: 'Subnet Mask' }),
      dataIndex: 'subnet',
      width: 100
    },
    {
      key: 'leaseTime',
      title: $t({ defaultMessage: 'Lease Time' }),
      width: 135,
      dataIndex: 'leaseTime'
    },
    {
      key: 'DNS IP',
      title: $t({ defaultMessage: 'DNS IP' }),
      width: 200,
      dataIndex: 'successfulAllocations'
    },
    {
      key: 'utilization',
      title: $t({ defaultMessage: 'Utilization' }),
      width: 220,
      dataIndex: 'unsuccessfulAllocations'
    },
    {
      key: 'Active',
      title: $t({ defaultMessage: 'Dropped Packets' }),
      width: 160,
      dataIndex: 'droppedPackets',
      render: (data) =>{
        return <Switch checkedChildren={$t({ defaultMessage: 'ON' })}
          unCheckedChildren={$t({ defaultMessage: 'OFF' })}
          defaultChecked={true} />
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
