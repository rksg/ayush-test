
import React from 'react'

import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { Table, TableProps, Card, ProgressBar } from '@acx-ui/components'
import { PortalDetailInstances }                from '@acx-ui/rc/utils'
import { TenantLink }                           from '@acx-ui/react-router-dom'


export default function PortalInstancesTable (
  props:Partial<TableProps<PortalDetailInstances>>){

  const { $t } = useIntl()
  const { dataSource } = props
  const columns: TableProps<PortalDetailInstances>['columns'] = [
    {
      key: 'NetworkName',
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'network',
      width: 200,
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
      width: 100,
      render: function (_data, row) {
        return row.network.captiveType
      }

    },
    {
      key: 'Venues',
      title: $t({ defaultMessage: 'Venues' }),
      dataIndex: 'venues',
      width: 50
    },
    {
      key: 'serviceHealth',
      title: $t({ defaultMessage: 'Service Health' }),
      width: 135,
      dataIndex: 'health',
      render: (data) => <ProgressBar percent={data as number}/>
    },
    {
      key: 'abrate',
      title: $t({ defaultMessage: 'Abandonment rate' }),
      width: 180,
      dataIndex: 'abandonmentRate',
      render: (data) =>{
        return data+'%'
      }
    },
    {
      key: 'clients',
      title: $t({ defaultMessage: 'Number of clients' }),
      width: 160,
      dataIndex: 'clients',
      render: (data) =>{
        return data+'%'
      }
    },
    {
      key: 'clientsPortal',
      title: $t({ defaultMessage: 'Clients per portal type' }),
      width: 200,
      dataIndex: 'clientsPortal',
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
