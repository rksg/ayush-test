import _             from 'lodash'
import { useParams } from 'react-router-dom'

import { useGetDHCPProfileQuery, useVenueDHCPProfileQuery, useApListQuery } from '@acx-ui/rc/services'
import { DHCPConfigTypeMessages }                                           from '@acx-ui/rc/utils'
import {  DHCPProfileAps }                                                  from '@acx-ui/rc/utils'

export default function useDHCPInfo () {

  const params = useParams()

  const data = useVenueDHCPProfileQuery({
    params
  })
  const { data: apList } = useApListQuery({ params })
  const apListGroupSN = _.keyBy(apList?.data, 'serialNumber')
  const { data: dhcpProfile } = useGetDHCPProfileQuery({
    params: { ...params, serviceId: data?.data?.serviceProfileId||'' }
  }, { skip: !data.data?.serviceProfileId })

  let primaryServerSN='', backupServerSN='', gatewayList:DHCPProfileAps[]=[]
  if(data?.data?.dhcpServiceAps){
    primaryServerSN = data?.data?.dhcpServiceAps[
      _.findIndex(data?.data?.dhcpServiceAps, { role: 'PrimaryServer' })].serialNumber
    backupServerSN = data?.data?.dhcpServiceAps[
      _.findIndex(data?.data?.dhcpServiceAps, { role: 'BackupServer' })].serialNumber
    gatewayList = _.groupBy(data?.data?.dhcpServiceAps, 'role').NatGateway || []
  }


  const displayData = {
    id: dhcpProfile?.id,
    name: dhcpProfile?.serviceName,
    status: data?.data?.enabled === true,
    configurationType: dhcpProfile ? DHCPConfigTypeMessages[dhcpProfile.dhcpMode]:null,
    poolsNum: dhcpProfile? dhcpProfile?.dhcpPools.length : 0,
    primaryDHCP: {
      name: primaryServerSN && apList ? apListGroupSN[primaryServerSN].name:'',
      serialNumber: primaryServerSN
    },
    secondaryDHCP: {
      name: backupServerSN && apList ? apListGroupSN[backupServerSN].name:'',
      serialNumber: backupServerSN
    },
    gateway: (!_.isEmpty(apListGroupSN) && gatewayList.length>0) ? gatewayList.map(( gateway )=>{
      return {
        name: apListGroupSN[gateway.serialNumber]?.name,
        serialNumber: apListGroupSN[gateway.serialNumber]?.serialNumber
      }
    }) : []
  }
  return displayData
}
