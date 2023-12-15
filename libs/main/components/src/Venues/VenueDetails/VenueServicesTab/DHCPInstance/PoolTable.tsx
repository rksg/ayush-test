
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
import { IpUtilsService, VenueDHCPPoolInst } from '@acx-ui/rc/utils'
import { hasAccess }                         from '@acx-ui/user'

import { ReadonlySwitch } from './styledComponents'

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
      sorter: true,
      fixed: 'left'
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
      render: function (_, row) {
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
      render: (_, rowData)=>{
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
      render: (_, rowData)=> {
        if(rowData.primaryDnsIp && rowData.secondaryDnsIp){
          // eslint-disable-next-line max-len
          return <FormattedList type='unit' value={[rowData.primaryDnsIp, rowData.secondaryDnsIp]} />
        }
        return rowData.primaryDnsIp|| ''
      }

    },
    {
      key: 'PoolSize',
      title: $t({ defaultMessage: 'Pool Size' }),
      dataIndex: 'startIpAddress',
      render: (_, rowData)=>
        IpUtilsService.countIpRangeSize(rowData.startIpAddress, rowData.endIpAddress)
    },
    {
      key: 'usedIpCount',
      title: $t({ defaultMessage: 'Utilization' }),
      dataIndex: 'usedIpCount',
      render: (__, rowData)=> {
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
      render: (__, row) => {
        if (!hasAccess()) {
          return row.active ? $t({ defaultMessage: 'ON' }) : $t({ defaultMessage: 'OFF' })
        }

        let hasOtherActive = true
        if(row.active===true){
          hasOtherActive = _.some(tableData, o => o.active && o.id !== row.id)
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
                setActivePool(row.id, checked)
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
        settingsId='venue-dhcp-pool-table'
        columns={columns}
        dataSource={tableData}
        rowKey='id'
      />
    </Loader>
  )
}
