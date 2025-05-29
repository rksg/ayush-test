/* eslint-disable max-len */
import { getIntl, validationMessages } from '@acx-ui/utils'

import { IpUtilsService } from '../../ipUtilsService'
import { EdgeIpModeEnum } from '../../models/EdgeEnum'
import {
  EdgeLag,
  EdgeNatPool,
  EdgePort,
  EdgeStatus } from '../../types'
import { convertIpToLong, countIpSize, isSubnetOverlap, networkWifiIpRegExp, subnetMaskIpRegExp } from '../../validator'

import {
  physicalSmartEdgeSerialRegex,
  vSmartEdgeSerialRegex,
  MAX_EDGE_NAT_POOL_TOTAL_SIZE,
  MAX_EDGE_DUAL_WAN_PORT
}                   from './constants'
import {
  isAllPortsLagMember,
  getPhysicalPortGatewayCount,
  getLagGatewayCount,
  getEdgeWanInterfaces,
  hasCoreLag,
  hasCorePhysicalPort
} from './edgeUtils'

const Netmask = require('netmask').Netmask

export const edgeSerialNumberValidator = async (value: string) => {
  const { $t } = getIntl()
  if (!new RegExp(`^(${vSmartEdgeSerialRegex}|${physicalSmartEdgeSerialRegex})$`,'i').test(value)) {
    return Promise.reject($t(validationMessages.invalid))
  }
  return Promise.resolve()
}

export async function edgePortIpValidator (ip: string, subnetMask: string) {
  const { $t } = getIntl()

  try {
    await networkWifiIpRegExp(ip)
  } catch (error) {
    return Promise.reject(error)
  }

  if (await isSubnetAvailable(subnetMask) && IpUtilsService.isBroadcastAddress(ip, subnetMask)) {
    return Promise.reject($t(validationMessages.switchBroadcastAddressInvalid))
  } else {
    // If the subnet is unavailable, either because it's empty or invalid, there's no need to validate broadcast IP further
    return Promise.resolve()
  }
}


export async function interfaceSubnetValidator (
  current: { ipMode: EdgeIpModeEnum, ip: string, subnetMask: string },
  allWithoutCurrent: { ip: string, subnetMask: string } []
) {
  if (current.ipMode !== EdgeIpModeEnum.STATIC) {
    return Promise.resolve()
  }

  // eslint-disable-next-line max-len
  return lanPortSubnetValidator(current, allWithoutCurrent)
}

export async function lanPortSubnetValidator (
  currentSubnet: { ip: string, subnetMask: string },
  allSubnetWithoutCurrent: { ip: string, subnetMask: string } []
) {
  if(!!!currentSubnet.ip || !!!currentSubnet.subnetMask) {
    return Promise.resolve()
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

const rangesOverlap = (range1: Omit<EdgeNatPool, 'id'>, range2: Omit<EdgeNatPool, 'id'>) => {
  const start1 = convertIpToLong(range1.startIpAddress)
  const end1 = convertIpToLong(range1.endIpAddress)
  const start2 = convertIpToLong(range2.startIpAddress)
  const end2 = convertIpToLong(range2.endIpAddress)

  return start1 <= end2 && start2 <= end1
}

export const poolRangeOverlapValidator = async (pools:
  { startIpAddress: string, endIpAddress: string }[] | undefined
) => {
  if (!pools?.length) {
    return Promise.resolve()
  }

  const { $t } = getIntl()

  // loop to check if range overlap
  for (let i=0; i < pools.length; i++) {
    if (!pools[i]) continue

    for (let j=i+1; j < pools.length; j++) {
      if (i === pools.length - 1) break

      // check overlap
      if (rangesOverlap(pools[i], pools[j])) {
        // eslint-disable-next-line max-len
        return Promise.reject($t({ defaultMessage: 'The selected NAT pool overlaps with other NAT pools' }))
      }
    }
  }

  return Promise.resolve()
}

export const natPoolSizeValidator = async (pools:
  Omit<EdgeNatPool, 'id'>[] | undefined
) => {
  if (!pools?.length) {
    return Promise.resolve()
  }

  const { $t } = getIntl()

  // total range cannot exceed 128 per node : MAX_EDGE_NAT_POOL_TOTAL_SIZE
  const totalRange = pools?.reduce((acc: number, item) => {
    if (!item?.startIpAddress || !item?.endIpAddress) {
      return acc
    }
    const range = countIpSize(item.startIpAddress, item.endIpAddress)
    return acc += range
  }, 0) ?? 0

  return totalRange <= MAX_EDGE_NAT_POOL_TOTAL_SIZE ? Promise.resolve() : Promise.reject($t({ defaultMessage: 'NAT IP address range exceeds maximum size {maxSize}' }, { maxSize: MAX_EDGE_NAT_POOL_TOTAL_SIZE }))
}

export const validateSubnetIsConsistent = (
  allIps: { ip?: string, subnet?: string }[],
  value?: string
) => {
  if(!allIps || allIps.length < 2 || !value) return Promise.resolve()
  const { $t } = getIntl()
  for(let i=0; i<allIps.length; i++) {
    for(let j=i+1; j<allIps.length; j++) {
      if(i === allIps.length - 1) break
      const first = new Netmask(`${allIps[i].ip}/${allIps[i].subnet}`)
      const second = new Netmask(`${allIps[j].ip}/${allIps[j].subnet}`)
      if(first.first !== second.first || first.last !== second.last) {
        return Promise.reject($t({ defaultMessage: 'Use IP addresses in the same subnet for cluster interface on all the edges in this cluster.' }))
      }
    }
  }
  return Promise.resolve()
}

export const validateConfiguredSubnetIsConsistent = (
  allIps: { ip?: string, subnet?: string }[],
  value?: string
) => {
  const configuredIps = allIps.filter(ip => Boolean(ip.ip) && Boolean(ip.subnet))
  return validateSubnetIsConsistent(configuredIps, value)
}

export const validateUniqueIp = (ips: string[], value?: string) => {
  if(!Boolean(value)) return Promise.resolve()
  const { $t } = getIntl()
  const configuredIps = ips.filter(ip => Boolean(ip))
  if(configuredIps.every(isUnique)) {
    return Promise.resolve()
  }
  return Promise.reject($t({ defaultMessage: 'IP address cannot be the same as other nodes.' }))
}

export const validateClusterInterface = (interfaceNames: string[]) => {
  if((interfaceNames?.length ?? 0) <= 1) return Promise.resolve()
  const { $t } = getIntl()
  for(let i=0; i<interfaceNames.length; i++){
    for(let j=i+1; j<interfaceNames.length; j++) {
      if (interfaceNames[i].charAt(0) !== interfaceNames[j].charAt(0)) {
        return Promise.reject(
          $t({ defaultMessage: `Make sure you select the same interface type
          (physical port or LAG) as that of another node in this cluster.` })
        )
      }
    }
  }
  return Promise.resolve()
}

export const validateEdgeAllPortsEmptyLag = (portsData: EdgePort[], lagData: EdgeLag[]) => {
  const { $t } = getIntl()

  const allPortsLagMember = isAllPortsLagMember(portsData, lagData)
  const lagWithGateway = getLagGatewayCount(lagData)

  if (allPortsLagMember && lagWithGateway === 0) {
    // eslint-disable-next-line max-len
    return Promise.reject($t({ defaultMessage: 'At least one LAG must be enabled and configured to WAN or core port to form a cluster.' }))
  } else {
    return Promise.resolve()
  }
}

// eslint-disable-next-line max-len
export const validateEdgeGateway = (portsData: EdgePort[], lagData: EdgeLag[], isDualWanEnabled: boolean) => {
  const { $t } = getIntl()

  const hasPhysicalCorePort = hasCorePhysicalPort(portsData)
  const hasCoreLagPort = hasCoreLag(lagData)
  const hasCorePort = hasPhysicalCorePort || hasCoreLagPort

  const portWithGateway = getPhysicalPortGatewayCount(portsData)
  const lagWithGateway = getLagGatewayCount(lagData)
  const totalGateway = portWithGateway + lagWithGateway

  if (totalGateway === 0) {
    // eslint-disable-next-line max-len
    return Promise.reject($t({ defaultMessage: 'At least one port must be enabled and configured to WAN or core port to form a cluster.' }))
  } else if ((hasCorePort || !isDualWanEnabled) && totalGateway > 1) {
    return Promise.reject($t({ defaultMessage: 'Please configure exactly one gateway.' }))
  } else if (!hasCorePort && isDualWanEnabled && totalGateway > MAX_EDGE_DUAL_WAN_PORT) {
    // eslint-disable-next-line max-len
    return Promise.reject($t({ defaultMessage: 'Please configure no more than {maxWanPortCount} gateways.' }, {
      maxWanPortCount: MAX_EDGE_DUAL_WAN_PORT
    }))
  } else {
    return Promise.resolve()
  }
}

// portsData: all ports in a cluster
// lagData: all lags in a cluster
// eslint-disable-next-line max-len
export const validateEdgeClusterLevelGateway = (portsData: EdgePort[], lagData: EdgeLag[], edgeNodes: EdgeStatus[], isDualWanEnabled: boolean) => {
  const { $t } = getIntl()
  const nodeCount = edgeNodes.length

  const hasPhysicalCorePort = hasCorePhysicalPort(portsData)
  const hasCoreLagPort = hasCoreLag(lagData)
  const hasCorePort = hasPhysicalCorePort || hasCoreLagPort

  const portWithGateway = getPhysicalPortGatewayCount(portsData)
  const lagWithGateway = getLagGatewayCount(lagData)
  const totalGateway = portWithGateway + lagWithGateway

  if (totalGateway < nodeCount) {
    // eslint-disable-next-line max-len
    return Promise.reject($t({ defaultMessage: 'Each Edge at least one port must be enabled and configured to WAN or core port to form a cluster.' }))

  } else if ((hasCorePort || !isDualWanEnabled) && totalGateway > nodeCount) {
    // eslint-disable-next-line max-len
    return Promise.reject($t({ defaultMessage: 'Please configure exactly one gateway on each Edge.' }))

  } else if (!hasCorePort && isDualWanEnabled && totalGateway > MAX_EDGE_DUAL_WAN_PORT) {
    // eslint-disable-next-line max-len
    return Promise.reject($t({ defaultMessage: 'Please configure no more than {maxWanPortCount} gateways on each Edge.' }, {
      maxWanPortCount: MAX_EDGE_DUAL_WAN_PORT
    }))

  } else {
    return Promise.resolve()
  }
}

export const validateGatewayInSubnet = (ip?: string, mask?: string, gateway?: string) => {
  const { $t } = getIntl()

  if (!ip || !mask || !gateway) {
    return Promise.resolve()
  }

  if (!IpUtilsService.validateInTheSameSubnet(ip, mask, gateway)) {
    return Promise.reject($t({
      defaultMessage: 'Gateway must be in the same subnet as the IP address.'
    }))
  }

  return Promise.resolve()
}

export const edgeWanSyncIpModeValidator = async (ports: EdgePort[], lags: EdgeLag[]) => {
  const { $t } = getIntl()

  const wanInterfaces = getEdgeWanInterfaces(ports, lags)
  if (!wanInterfaces.length) return Promise.resolve()

  const ipMode = wanInterfaces[0].ipMode
  return wanInterfaces.every(networkInterface => networkInterface.ipMode === ipMode)
    ? Promise.resolve()
    : Promise.reject($t({ defaultMessage: 'IP modes must be consistent across all WAN interfaces.' }))
}

async function isSubnetAvailable (subnetMask: string) {
  if (!subnetMask) {
    return false
  }

  try {
    await subnetMaskIpRegExp(subnetMask)
    return true
  } catch {
    return false
  }
}

const isUnique = (value: string, index: number, array: string[]) => {
  return array.indexOf(value) === array.lastIndexOf(value)
}