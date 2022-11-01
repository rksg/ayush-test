
import React from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Table, TableProps }        from '@acx-ui/components'
import { useVenuesLeasesListQuery } from '@acx-ui/rc/services'
import { DHCPLeases }               from '@acx-ui/rc/utils'


export default function VenueLeaseTable (){
  const params = useParams()
  const { $t } = useIntl()

  const { data: leasesList } = useVenuesLeasesListQuery({
    params: { venueId: params.venueId }
  })


  const columns: TableProps<DHCPLeases>['columns'] = [
    {
      key: 'hostName',
      searchable: true,
      title: $t({ defaultMessage: 'Hostname' }),
      dataIndex: 'hostName',
      sorter: true
    },
    {
      key: 'IPAddress',
      title: $t({ defaultMessage: 'IP Address' }),
      dataIndex: 'ipAddress'
    },
    {
      key: 'DHCPPool',
      title: $t({ defaultMessage: 'DHCP Pool' }),
      dataIndex: 'dhcpPoolName',
      filterable: true
    },
    {
      key: 'MACAddress',
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'macAddress'
    },
    {
      key: 'Status',
      title: $t({ defaultMessage: 'Status' }),
      filterable: true,
      dataIndex: 'status'
    },
    {
      key: 'LeaseExpires',
      title: $t({ defaultMessage: 'Lease expires in..' }),
      dataIndex: 'leaseExpiration'
    }
  ]

  return (
    <Table
      columns={columns}
      dataSource={leasesList}
      rowKey='macAddress'
    />

  )
}
