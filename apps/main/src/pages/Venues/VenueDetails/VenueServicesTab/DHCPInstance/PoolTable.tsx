
import { useState, useEffect } from 'react'

import { Switch }                 from 'antd'
import _                          from 'lodash'
import { useIntl, FormattedList } from 'react-intl'
import { useParams }              from 'react-router-dom'

import { Table, TableProps, showActionModal, Loader, Tooltip, UsageRate } from '@acx-ui/components'
import { formatter }                                                      from '@acx-ui/formatter'
import {
  useVenueDHCPPoolsQuery,
  useActivateDHCPPoolMutation,
  useDeactivateDHCPPoolMutation } from '@acx-ui/rc/services'
import { VenueDHCPPoolInst } from '@acx-ui/rc/utils'
import { hasAccess }         from '@acx-ui/user'

import { ReadonlySwitch } from './styledComponents'

export const countIpRangeSize = (startIpAddress: string, endIpAddress: string): number =>{
  const convertIpToLong = (ipAddress: string): number => {
    const ipArray = ipAddress.split('.').map(ip => parseInt(ip, 10))
    return ipArray[0] * 16777216 + ipArray[1] * 65536 + ipArray[2] * 256 + ipArray[3]
  }

  const startLong = convertIpToLong(startIpAddress)
  const endLong = convertIpToLong(endIpAddress)

  return endLong - startLong + 1
}
export default function VenuePoolTable (){
  const params = useParams()
  const { $t } = useIntl()

  const [tableData, setTableData] = useState<VenueDHCPPoolInst[]>()


  const venueDHCPPools = useVenueDHCPPoolsQuery({
    params
  })


  const [activateDHCPPool] = useActivateDHCPPoolMutation()
  const [deactivateDHCPPool] = useDeactivateDHCPPoolMutation()


  const setActivePool = async (dhcppoolId:string, active:boolean)=>{

    if(active){
      await activateDHCPPool({ params: { ...params, dhcppoolId } }).unwrap()
    }else{
      await deactivateDHCPPool({ params: { ...params, dhcppoolId } }).unwrap()
    }
    const updateActive = tableData?.map((item)=>{
      if(item.id===dhcppoolId){
        return {
          ...item,
          active
        }
      }else{
        return item
      }
    })

    setTableData(updateActive)
  }


  useEffect(() => {
    if(venueDHCPPools.data){
      setTableData(venueDHCPPools.data)
    }
  }, [venueDHCPPools.data])

  const columns: TableProps<VenueDHCPPoolInst>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Pool Name' }),
      dataIndex: 'name',
      sorter: true
    },
    {
      key: 'vlanId',
      title: $t({ defaultMessage: 'VLAN ID' }),
      dataIndex: 'vlanId',
      sorter: true
    },
    {
      key: 'startIpAddress',
      title: $t({ defaultMessage: 'Address Pool' }),
      dataIndex: 'startIpAddress',
      render: function (_data, row) {
        return $t({ defaultMessage: '{start} - {end}' },
          { start: row.startIpAddress, end: row.endIpAddress })
      }
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
        const MINUTE = 1000 * 60
        const HOUR = MINUTE * 60
        return formatter('longDurationFormat')
        (((rowData.leaseTimeHours || 0) * HOUR) + ((rowData.leaseTimeMinutes || 0) * MINUTE))
      }
    },
    {
      key: 'primaryDnsIp',
      title: $t({ defaultMessage: 'DNS IP' }),
      dataIndex: 'primaryDnsIp',
      render: (data, rowData)=>
        (rowData.primaryDnsIp && rowData.secondaryDnsIp) ?
          <FormattedList type='unit' value={[rowData.primaryDnsIp, rowData.secondaryDnsIp]} />:''
    },
    {
      key: 'PoolSize',
      title: $t({ defaultMessage: 'Pool Size' }),
      dataIndex: 'startIpAddress',
      render: (_data, rowData)=> countIpRangeSize(rowData.startIpAddress, rowData.endIpAddress)
    },
    {
      key: 'usedIpCount',
      title: $t({ defaultMessage: 'Utilization' }),
      dataIndex: 'usedIpCount',
      render: (data, rowData)=> {
        if(_.isUndefined(rowData.usedIpCount) || _.isUndefined(rowData.totalIpCount)){
          return ''
        }
        return <UsageRate percent={(rowData.usedIpCount/rowData.totalIpCount)*100}/>
      }
    },
    {
      key: 'id',
      title: $t({ defaultMessage: 'Active' }),
      dataIndex: 'id',
      render: (id, row) => {
        if (!hasAccess()) {
          return row.active ? $t({ defaultMessage: 'ON' }) : $t({ defaultMessage: 'OFF' })
        }

        let hasOtherActive = true
        if(row.active===true){
          hasOtherActive = _.some(tableData, o => o.active && o.id !== id)
        }
        if(!hasOtherActive){
          return <Tooltip placement='topLeft'
            title={$t({ defaultMessage: 'At least one pool must be active' })}
            arrowPointAtCenter><ReadonlySwitch checked/></Tooltip>
        }

        const switchRef = <Switch
          checked={row.active}
          onChange={(checked)=>{
            const activeMsg =
            $t({ defaultMessage: 'Are you sure you want to activate this DHCP Pool?' })
            const deactivateMsg =
            $t({ defaultMessage: 'Are you sure you want to deactivate this DHCP Pool?' })
            const activeTitle = $t({ defaultMessage: 'Activate DHCP Pool' })
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
    <Loader states={[{
      isLoading: venueDHCPPools.isLoading,
      isFetching: venueDHCPPools.isFetching
    }]}>
      <Table
        columns={columns}
        dataSource={tableData}
        rowKey='id'
      />
    </Loader>
  )
}
