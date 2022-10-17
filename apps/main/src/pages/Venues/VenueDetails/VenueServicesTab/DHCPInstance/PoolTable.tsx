
import React from 'react'

import { Switch }    from 'antd'
import _             from 'lodash'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Table, TableProps, Card }                                                    from '@acx-ui/components'
import { useVenueDHCPProfileQuery, useGetDHCPProfileQuery, useVenueActivePoolsQuery } from '@acx-ui/rc/services'
import { DHCPPool }                                                                   from '@acx-ui/rc/utils'
import { TenantLink }                                                                 from '@acx-ui/react-router-dom'




export default function DHCPInstancesPoolTable (){
  const params = useParams()
  const { $t } = useIntl()


  const { data: venueDHCPProfile } = useVenueDHCPProfileQuery({
    params: { venueId: params.venueId }
  })

  const { data: dhcpProfile } = useGetDHCPProfileQuery({
    params: { serviceId: venueDHCPProfile?.serviceProfileId }
  })

  const { data: activeList } = useVenueActivePoolsQuery({
    params: { serviceId: venueDHCPProfile?.serviceProfileId }
  })

  const tableData = dhcpProfile?.dhcpPools.map( item => {
    const index = _.findIndex(activeList, poolId => poolId === item.id)
    item.activated = index!==-1
    return item
  })



  const columns: TableProps<DHCPPool>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Pool Name' }),
      dataIndex: 'venue',
      sorter: true,
      render: function (_data, row) {
        return (
          <TenantLink
            to={`/venues/${row.id}/venue-details/overview`}>{row.name}</TenantLink>
        )
      }
    },
    {
      key: 'APs',
      title: $t({ defaultMessage: 'Address Pool' }),
      dataIndex: 'aps'
    },
    {
      key: 'subnet',
      title: $t({ defaultMessage: 'Subnet Mask' }),
      dataIndex: 'subnet'
    },
    {
      key: 'leaseTime',
      title: $t({ defaultMessage: 'Lease Time' }),
      dataIndex: 'leaseTime'
    },
    {
      key: 'DNS IP',
      title: $t({ defaultMessage: 'DNS IP' }),
      dataIndex: 'successfulAllocations'
    },
    {
      key: 'utilization',
      title: $t({ defaultMessage: 'Utilization' }),
      dataIndex: 'unsuccessfulAllocations'
    },
    {
      key: 'Active',
      title: $t({ defaultMessage: 'Active' }),
      dataIndex: 'activated',
      render: (data) =>{
        const switchStatus = Boolean(data)
        return <Switch checkedChildren={$t({ defaultMessage: 'ON' })}
          unCheckedChildren={$t({ defaultMessage: 'OFF' })}
          defaultChecked={switchStatus ? switchStatus : false} />
      }
    }
  ]

  return (
    <Card>
      <div style={{ width: '100%' }}>
        <Table
          columns={columns}
          dataSource={tableData}
          rowKey='id'
        />
      </div>
    </Card>
  )
}
