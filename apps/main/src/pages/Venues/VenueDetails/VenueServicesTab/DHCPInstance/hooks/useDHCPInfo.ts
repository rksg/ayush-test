import _             from 'lodash'
import { useParams } from 'react-router-dom'

import { useGetDHCPProfileQuery, useVenueDHCPProfileQuery, useApListQuery } from '@acx-ui/rc/services'
import { DHCPConfigTypeMessages }                                           from '@acx-ui/rc/utils'

export default function useDHCPInfo () {

  const params = useParams()

  const { data: venueDHCPProfile } = useVenueDHCPProfileQuery({
    params
  })
  const { data: apList } = useApListQuery({ params })
  const apListGroupSN = _.keyBy(apList?.data, 'serialNumber')
  const { data: dhcpProfile } = useGetDHCPProfileQuery({
    params: { ...params, serviceId: venueDHCPProfile?.serviceProfileId }
  })

  const primaryServerSN = venueDHCPProfile?.dhcpServiceAps[
    _.findIndex(venueDHCPProfile?.dhcpServiceAps, { role: 'PrimaryServer' })].serialNumber
  const backupServerSN = venueDHCPProfile?.dhcpServiceAps[
    _.findIndex(venueDHCPProfile?.dhcpServiceAps, { role: 'BackupServer' })].serialNumber
  const gatewayList = _.groupBy(venueDHCPProfile?.dhcpServiceAps, 'role').NatGateway || []

  const displayData = {
    id: dhcpProfile?.id,
    name: dhcpProfile?.serviceName,
    status: venueDHCPProfile?.enabled === true,
    configurationType: dhcpProfile ? DHCPConfigTypeMessages[dhcpProfile.dhcpMode]:'',
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
