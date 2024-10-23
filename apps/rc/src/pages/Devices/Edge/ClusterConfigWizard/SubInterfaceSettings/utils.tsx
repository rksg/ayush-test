import {
  EdgeIpModeEnum,
  EdgePortInfo,
  SubInterface
} from '@acx-ui/rc/utils'

const getSubnetInfo = (
  { id, ip, subnet, ipMode }: { id?: string, ip?: string, subnet?: string, ipMode: EdgeIpModeEnum }
): { id?: string, ip: string, subnetMask: string } | undefined => {
  if (ipMode === EdgeIpModeEnum.DHCP || !ip || !subnet) {
    return undefined
  }

  const [ipWithoutMask] = ip.split('/')
  return { id: id, ip: ipWithoutMask, subnetMask: subnet }
}

export const extractSubnetFromEdgePortInfo = (portInfo: EdgePortInfo) => {
  return portInfo.isLagMember ? undefined : getSubnetInfo(portInfo)
}

export const extractSubnetFromSubInterface = (subInterface: SubInterface) => {
  return getSubnetInfo(subInterface)
}
