import { EdgeLag, EdgePort, EdgePortTypeEnum, isSubnetOverlap } from '@acx-ui/rc/utils'

export const INNER_PORT_FORM_ID_PREFIX = 'port_'
export const getInnerPortFormID = (index: number | string) => `${INNER_PORT_FORM_ID_PREFIX}${index}`

export async function lanPortsubnetValidator (
  currentSubnet: { ip: string, subnetMask: string },
  allSubnetWithoutCurrent: { ip: string, subnetMask: string } []
) {
  if(!!!currentSubnet.ip || !!!currentSubnet.subnetMask) {
    return
  }

  for(let item of allSubnetWithoutCurrent) {
    try {
      await isSubnetOverlap(currentSubnet.ip, currentSubnet.subnetMask,
        item.ip, item.subnetMask)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  return Promise.resolve()
}

export const getEnabledCorePortKey = (portsData: EdgePort[], lagData: EdgeLag[]) : {
    key: string | undefined,
    isLag: boolean
  } => {
  const physicalCorePort = portsData.filter(item => item.corePortEnabled && item.enabled)
  const lagCorePort = lagData.filter(item => item.corePortEnabled && item.lagEnabled)
  const corePortKey = physicalCorePort[0]?.interfaceName || lagCorePort[0]?.id

  return {
    key: corePortKey !== undefined ? (corePortKey+'') : corePortKey,
    isLag: physicalCorePort[0]?.interfaceName ? false : lagCorePort[0]?.id !== undefined
  }
}

export const isWANPortExist = (portsData: EdgePort[],
  lagData: EdgeLag[]): boolean => {
  const portWAN = portsData.filter(port =>
    port.enabled && port.portType === EdgePortTypeEnum.WAN
  ).length > 0

  const lagWAN = lagData.filter(lag =>
    lag.lagEnabled && lag.portType === EdgePortTypeEnum.WAN
  ).length > 0
  return portWAN || lagWAN
}