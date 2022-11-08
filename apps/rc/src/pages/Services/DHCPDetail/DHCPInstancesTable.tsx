
import React from 'react'

import { useIntl, FormattedMessage } from 'react-intl'

import { Table, TableProps, Card, ProgressBar } from '@acx-ui/components'
import { DHCPDetailInstances }                  from '@acx-ui/rc/utils'
import { TenantLink }                           from '@acx-ui/react-router-dom'


export default function DHCPInstancesTable (
  props:Partial<TableProps<DHCPDetailInstances>>){

  const { $t } = useIntl()
  const { dataSource } = props
  const columns: TableProps<DHCPDetailInstances>['columns'] = [
    {
      key: 'VenueName',
      title: $t({ defaultMessage: 'Venue Name' }),
      dataIndex: 'venue',
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
      dataIndex: 'aps'

    },
    {
      key: 'switches',
      title: $t({ defaultMessage: 'Switches' }),
      dataIndex: 'switches'
    },
    {
      key: 'serviceHealth',
      title: $t({ defaultMessage: 'Service Health' }),
      dataIndex: 'health',
      render: (data) => <ProgressBar percent={Number(data)}/>
    },
    {
      key: 'osa',
      title: $t({ defaultMessage: '# of Successful Allocations' }),
      dataIndex: 'successfulAllocations'
    },
    {
      key: 'ousa',
      title: $t({ defaultMessage: '# of Un-successful Allocations' }),
      dataIndex: 'unsuccessfulAllocations'
    },
    {
      key: 'droppedpackets',
      title: $t({ defaultMessage: 'Dropped Packets' }),
      dataIndex: 'droppedPackets',
      render: data => <FormattedMessage defaultMessage='{number}%' values={{ number: data }} />
    },
    {
      key: 'capacity',
      title: $t({ defaultMessage: 'Capacity' }),
      dataIndex: 'capacity',
      render: data => <FormattedMessage defaultMessage='{number}%' values={{ number: data }} />
    }
  ]

  return (
    <Card
      title={$t({ defaultMessage: 'Instances ({count})' }, { count: dataSource?.length })}>
      <div style={{ width: '100%' }}>
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

