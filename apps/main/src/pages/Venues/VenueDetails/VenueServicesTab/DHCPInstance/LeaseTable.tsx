
import React, { useEffect } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Table, TableProps, Card }  from '@acx-ui/components'
import { useVenuesLeasesListQuery } from '@acx-ui/rc/services'
import { DHCPLeases }               from '@acx-ui/rc/utils'


export default function VenueLeaseTable (props: { setLeaseNumFn: Function, style: object } ){
  const params = useParams()
  const { $t } = useIntl()

  const { data: leasesList } = useVenuesLeasesListQuery({
    params: { venueId: params.venueId }
  })

  useEffect(() => {
    props.setLeaseNumFn(leasesList?.length || 0)
  },[leasesList, props])

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
    <div style={props.style}>
      <Card>
        <div style={{ width: '100%' }}>
          <Table
            columns={columns}
            dataSource={leasesList}
            rowKey='hostName'
          />
        </div>
      </Card>
    </div>
  )
}
