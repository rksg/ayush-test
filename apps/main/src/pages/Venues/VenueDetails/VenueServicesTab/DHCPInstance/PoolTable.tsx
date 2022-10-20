
import React from 'react'

import { Switch }    from 'antd'
import _             from 'lodash'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Table, TableProps, Card, showActionModal } from '@acx-ui/components'
import {
  useVenueDHCPProfileQuery,
  useGetDHCPProfileQuery,
  useVenueActivePoolsQuery,
  useActivateDHCPPoolMutation } from '@acx-ui/rc/services'
import { DHCPPool }   from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'


export default function DHCPInstancesPoolTable (){
  const params = useParams()
  const { $t } = useIntl()


  const { data: venueDHCPProfile } = useVenueDHCPProfileQuery({
    params
  })

  const { data: dhcpProfile } = useGetDHCPProfileQuery({
    params: { ...params, serviceId: venueDHCPProfile?.serviceProfileId }
  })

  const { data: activeList } = useVenueActivePoolsQuery({
    params: { serviceId: venueDHCPProfile?.serviceProfileId, venueId: params.venueId }
  })

  const [activateDHCPPool] = useActivateDHCPPoolMutation()

  const setActivePool = async (dhcppoolId:string)=>{
    await activateDHCPPool({ params: { ...params, dhcppoolId } }).unwrap()
  }


  const tableData = dhcpProfile?.dhcpPools.map( item => {
    const index = _.findIndex(activeList, poolId => poolId === item.id)
    if(index!==-1){
      item.activated = index!==-1
    }
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
      key: 'subnetMask',
      title: $t({ defaultMessage: 'Subnet Mask' }),
      dataIndex: 'subnetMask'
    },
    {
      key: 'leaseTime',
      title: $t({ defaultMessage: 'Lease Time' }),
      dataIndex: 'leaseTimeHours',
      render: (data, rowData)=>{
        return rowData.leaseTimeHours +' ' + $t({ defaultMessage: 'hrs, ' })
        + rowData.leaseTimeMinutes + $t({ defaultMessage: 'mins' })
      }
    },
    {
      key: 'primaryDnsIp',
      title: $t({ defaultMessage: 'DNS IP' }),
      dataIndex: 'primaryDnsIp',
      render: (data, rowData)=>{
        return rowData.primaryDnsIp + ', '
        + rowData.secondaryDnsIp
      }
    },
    {
      key: 'id',
      title: $t({ defaultMessage: 'Active' }),
      dataIndex: 'id',
      render: (data) =>{
        const switchStatus = Boolean(data)
        const switchRef = <Switch checkedChildren={$t({ defaultMessage: 'ON' })}
          unCheckedChildren={$t({ defaultMessage: 'OFF' })}
          defaultChecked={switchStatus ? switchStatus : false}
          onChange={(checked: boolean)=>{
            const activeMsg =
            $t({ defaultMessage: 'Are you sure you want to active this DHCP Pool?' })
            const deactivateMsg =
            $t({ defaultMessage: 'Are you sure you want to deactivate this DHCP Pool?' })
            showActionModal({
              type: 'confirm',
              width: 450,
              title: $t({ defaultMessage: 'Active DHCP Pool' }),
              content: checked ? activeMsg : deactivateMsg,
              okText: $t({ defaultMessage: 'Confirm' }),
              onOk () {
                setActivePool(data as string)
              },
              onCancel () {
                // console.log(switchRef)
              }
            })
          }}/>
        return switchRef
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
