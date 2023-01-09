
import { useState, useEffect } from 'react'

import { Switch }                 from 'antd'
import _                          from 'lodash'
import { useIntl, FormattedList } from 'react-intl'
import { useParams }              from 'react-router-dom'

import { Table, TableProps, showActionModal, Loader, Tooltip } from '@acx-ui/components'
import {
  useVenueDHCPPoolsQuery,
  useActivateDHCPPoolMutation,
  useDeactivateDHCPPoolMutation } from '@acx-ui/rc/services'
import { VenueDHCPPoolInst } from '@acx-ui/rc/utils'
import { formatter }         from '@acx-ui/utils'

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
      key: 'id',
      title: $t({ defaultMessage: 'Active' }),
      dataIndex: 'id',
      render: (id, row) => {
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
