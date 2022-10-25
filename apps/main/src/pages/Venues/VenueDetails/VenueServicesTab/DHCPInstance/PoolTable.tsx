
import React, { useState, useEffect } from 'react'

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


export default function VenuePoolTable ({ setPoolsNumFn }: { setPoolsNumFn: Function } ){
  const params = useParams()
  const { $t } = useIntl()

  const [tableData, setTableData] = useState<DHCPPool[]>()

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
  const setActivePool = async (dhcppoolId:string, activated:boolean)=>{

    await activateDHCPPool({ params: { ...params, dhcppoolId } }).unwrap()

    const updateActive = tableData?.map((item)=>{
      if(item.id===dhcppoolId){
        return {
          ...item,
          activated
        }
      }else{
        return item
      }
    })

    setTableData(updateActive)
  }



  useEffect(() => {
    setPoolsNumFn(dhcpProfile?.dhcpPools.length || 0)
    const mergedData = dhcpProfile?.dhcpPools.map( item => {
      const index = _.findIndex(activeList, poolId => poolId === item.id)
      return {
        ...item,
        activated: index!==-1
      }
    })
    setTableData(mergedData)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeList, dhcpProfile])


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
      render: (id, row) => {
        const switchRef = <Switch
          checked={row.activated}
          onChange={(checked)=>{
            const activeMsg =
            $t({ defaultMessage: 'Are you sure you want to active this DHCP Pool?' })
            const deactivateMsg =
            $t({ defaultMessage: 'Are you sure you want to deactivate this DHCP Pool?' })
            const activeTitle = $t({ defaultMessage: 'Active DHCP Pool' })
            const deactivateTitle = $t({ defaultMessage: 'Deactivate DHCP Pool' })
            showActionModal({
              type: 'confirm',
              width: 450,
              title: checked ? activeTitle : deactivateTitle,
              content: checked ? activeMsg : deactivateMsg,
              okText: $t({ defaultMessage: 'Confirm' }),
              onOk () {
                setActivePool(id as string, checked)
              }
            })

          }}/>
        return switchRef

      }
    }
  ]

  return (
    <Card >
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
