
import { useState, useEffect } from 'react'

import { Switch }                 from 'antd'
import _                          from 'lodash'
import { useIntl, FormattedList } from 'react-intl'
import { useParams }              from 'react-router-dom'

import { Table, TableProps, showActionModal, Loader, Tooltip, UsageRate } from '@acx-ui/components'
import { Features, useIsSplitOn }                                         from '@acx-ui/feature-toggle'
import { formatter }                                                      from '@acx-ui/formatter'
import {
  useVenueDHCPPoolsQuery,
  useActivateDHCPPoolMutation,
  useDeactivateDHCPPoolMutation,
  useGetVenueTemplateDhcpPoolsQuery,
  useActivateVenueTemplateDhcpPoolMutation,
  useDeactivateVenueTemplateDhcpPoolMutation
} from '@acx-ui/rc/services'
import { DHCPSaveData, DHCPUrls, IpUtilsService, VenueDHCPPoolInst, VenueDHCPProfile, useConfigTemplate, useConfigTemplateMutationFnSwitcher, useConfigTemplateQueryFnSwitcher } from '@acx-ui/rc/utils'
import { WifiScopes }                                                                                                                                                            from '@acx-ui/types'
import { hasPermission }                                                                                                                                                         from '@acx-ui/user'
import { getOpsApi }                                                                                                                                                             from '@acx-ui/utils'

import { ReadonlySwitch } from './styledComponents'

interface VenuePoolTableProps {
  venueDHCPProfile?: VenueDHCPProfile,
  dhcpProfile?: DHCPSaveData,
  isFetching?: boolean }

export default function VenuePoolTable (
  { venueDHCPProfile, dhcpProfile, isFetching }: VenuePoolTableProps){
  const params = useParams()
  const { $t } = useIntl()
  const { isTemplate } = useConfigTemplate()
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const enableTemplateRbac = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const resolvedEnableRbac = isTemplate ? enableTemplateRbac : enableRbac
  const [tableData, setTableData] = useState<VenueDHCPPoolInst[]>()

  // eslint-disable-next-line max-len
  const venueDHCPPools = useConfigTemplateQueryFnSwitcher<VenueDHCPPoolInst[]>({
    useQueryFn: useVenueDHCPPoolsQuery,
    useTemplateQueryFn: useGetVenueTemplateDhcpPoolsQuery,
    skip: isFetching,
    payload: { venueDHCPProfile, dhcpProfile },
    enableRbac
  })

  const [activateDHCPPool] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useActivateDHCPPoolMutation,
    useTemplateMutationFn: useActivateVenueTemplateDhcpPoolMutation
  })
  const [deactivateDHCPPool] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useDeactivateDHCPPoolMutation,
    useTemplateMutationFn: useDeactivateVenueTemplateDhcpPoolMutation
  })

  const setActivePool = async (dhcppoolId: string, dhcpPoolName: string, active: boolean)=>{
    const { id, serviceProfileId, enabled, ...rest } = venueDHCPProfile || {}
    if(active){
      const payload = venueDHCPProfile ? {
        ...rest,
        activeDhcpPoolNames: [...(venueDHCPProfile?.activeDhcpPoolNames ?? []), dhcpPoolName] } : {}
      await activateDHCPPool({
        params: { ...params, dhcppoolId, serviceId: serviceProfileId },
        payload, enableRbac: resolvedEnableRbac }).unwrap()
    } else {
      const payload = venueDHCPProfile ? {
        ...rest,
        activeDhcpPoolNames: venueDHCPProfile?.activeDhcpPoolNames?.filter((name)=>
          name!==dhcpPoolName) } : {}
      await deactivateDHCPPool({
        params: { ...params, dhcppoolId, serviceId: serviceProfileId },
        payload, enableRbac: resolvedEnableRbac }).unwrap()
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
  }, [venueDHCPPools.data, isFetching])

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
        if (!hasPermission({
          scopes: [WifiScopes.UPDATE],
          rbacOpsIds: [getOpsApi(DHCPUrls.bindVenueDhcpProfile)]
        })) {
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
                setActivePool(row.id, row.name, checked)
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
      isFetching: venueDHCPPools.isFetching || isFetching
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
