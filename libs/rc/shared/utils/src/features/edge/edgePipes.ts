/* eslint-disable max-len */
import { cloneDeep, findIndex } from 'lodash'

import { EdgeLag, EdgePort, SubInterface, EdgeSubInterface } from '../../types'

import { convertEdgeNetworkIfConfigToApiPayload, edgePhysicalPortInitialConfigs } from './edgeUtils'

export const isSubInterfaceLagMember = (subInterface: SubInterface, lagMemberInterfaceNames: string[]) => {
  const interfaceName = subInterface.interfaceName?.split('.')[0]
  if(!interfaceName) {
    return false
  }

  return lagMemberInterfaceNames.includes(interfaceName)
}

/**
 * Do a dry run on the network interfaces based on the given LAGs data,
 * It will,
 * - reset the port to initial config
 * - remove the lag member interface sub interface
 * - reset ip / subnet to empty when ip mode is DHCP
 * - reset ip mode to STATIC when port type is LAN and corePortEnabled is false
 * - reset ip mode to DHCP when port type is UNCONFIGURED
 * - disable NAT if port type is not WAN and clear NAT pools if NAT is disabled
 * ...etc.
 * @param lags the LAGs data
 * @param ports the port data
 * @param subInterfaces the sub interface data
 * @returns an object with the dry run result
 */
export const doEdgeNetworkInterfacesDryRun = (
  lags: EdgeLag[] | undefined, ports: EdgePort[], subInterfaces: SubInterface[] | undefined,
  isEdgeCoreAccessSeparationReady: boolean
): {
  lags: EdgeLag[],
  ports: EdgePort[],
  subInterfaces: SubInterface[]
} => {
  const dryRunLags = lags ? cloneDeep(lags) : []
  const dryRunPorts = cloneDeep(ports)
  let dryRunSubInterfaces = subInterfaces ? cloneDeep(subInterfaces) : []

  dryRunLags.forEach((lag, idx) => {
    lag.lagMembers?.forEach(member => {
      const targetPortIdx = findIndex(dryRunPorts, { id: member.portId })
      if(targetPortIdx !== -1) {
        // reset lag member port
        dryRunPorts[targetPortIdx] = { ...dryRunPorts[targetPortIdx], ...edgePhysicalPortInitialConfigs }

        // remove lag member interface sub interface
        dryRunSubInterfaces = dryRunSubInterfaces.filter(subInterface =>
          subInterface.interfaceName?.split('.')[0] !== dryRunPorts[targetPortIdx].interfaceName)
      }
    })

    dryRunLags[idx] = convertEdgeNetworkIfConfigToApiPayload(lag, isEdgeCoreAccessSeparationReady) as EdgeLag
  })

  dryRunPorts.forEach((port, idx) => {
    dryRunPorts[idx] = convertEdgeNetworkIfConfigToApiPayload(port, isEdgeCoreAccessSeparationReady) as EdgePort
  })

  dryRunSubInterfaces.forEach((subInterface, idx) => {
    dryRunSubInterfaces[idx] = convertEdgeNetworkIfConfigToApiPayload(subInterface as EdgeSubInterface, isEdgeCoreAccessSeparationReady) as SubInterface
  })

  return {
    lags: dryRunLags,
    ports: dryRunPorts,
    subInterfaces: dryRunSubInterfaces
  }
}