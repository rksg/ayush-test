
import React from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Table, TableProps }        from '@acx-ui/components'
import { useVenuesLeasesListQuery } from '@acx-ui/rc/services'
import {
  DHCPLeases,
  DHCPLeasesStatusEnum
} from '@acx-ui/rc/utils'

export default function VenueLeaseTable (){
  const params = useParams()
  const { $t } = useIntl()

  const { data: leasesList } = useVenuesLeasesListQuery({ params })

  const columns: TableProps<DHCPLeases>['columns'] = [
    {
      key: 'hostName',
      searchable: true,
      title: $t({ defaultMessage: 'Hostname' }),
      dataIndex: 'hostname',
      sorter: true,
      fixed: 'left'
    },
    {
      key: 'IPAddress',
      searchable: true,
      title: $t({ defaultMessage: 'IP Address' }),
      dataIndex: 'ipAddress'
    },
    {
      key: 'DHCPPool',
      title: $t({ defaultMessage: 'DHCP Pool' }),
      dataIndex: 'dhcpPoolName'
      // filterable: true, // TODO: change to search or provide static list
    },
    {
      key: 'MACAddress',
      searchable: true,
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'macAddress'
    },
    {
      key: 'Status',
      title: $t({ defaultMessage: 'Status' }),
      searchable: true,
      // filterable: true, // TODO: change to search or provide static list
      dataIndex: 'status',
      render: (_, { status })=> status === DHCPLeasesStatusEnum.ONLINE ?
        $t({ defaultMessage: 'Online' })
        :
        $t({ defaultMessage: 'Offline' })
    },
    {
      key: 'LeaseExpires',
      title: $t({ defaultMessage: 'Lease Expires In...' }),
      dataIndex: 'leaseExpiration'
    }
  ]

  return (
    <Table
      settingsId='venue-dhcp-lease-table'
      columns={columns}
      dataSource={leasesList}
      rowKey='macAddress'
    />

  )
}
