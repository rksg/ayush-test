import { Typography } from 'antd'
import _              from 'lodash'

import { CompatibilityNodeError, SingleNodeDetailsField } from '@acx-ui/rc/components'
import {
  ClusterSubInterfaceSettings,
  EdgeClusterStatus,
  EdgeIpModeEnum,
  EdgeNodesPortsInfo,
  EdgePortInfo,
  EdgeSerialNumber,
  NodeSubInterfaces,
  SubInterface
} from '@acx-ui/rc/utils'

import {
  CompatibilityCheckResult,
  SubInterfaceCompatibility,
  SubInterfaceSettingsFormType
} from './types'

export const transformFromApiToFormData = (
  apiData?: ClusterSubInterfaceSettings
): SubInterfaceSettingsFormType => {
  const result: SubInterfaceSettingsFormType = {
    portSubInterfaces: {},
    lagSubInterfaces: {}
  }

  if (!apiData) {
    return result
  }

  apiData.nodes.forEach((node) => {
    const { serialNumber, ports, lags } = node
    result.portSubInterfaces[serialNumber] = {}
    result.lagSubInterfaces[serialNumber] = {}

    ports.forEach((port) => {
      const { portId, subInterfaces } = port
      result.portSubInterfaces[serialNumber][portId] = subInterfaces
    })

    lags.forEach((lag) => {
      const { lagId, subInterfaces } = lag
      result.lagSubInterfaces[serialNumber][lagId] = subInterfaces
    })
  })

  return result
}

export const transformFromFormDataToApi = (
  formData: SubInterfaceSettingsFormType
): ClusterSubInterfaceSettings => {
  const result: ClusterSubInterfaceSettings = {
    nodes: []
  }

  for (const serialNumber in formData.portSubInterfaces) {
    const node: NodeSubInterfaces = {
      serialNumber,
      ports: [],
      lags: []
    }

    for (const portId in formData.portSubInterfaces[serialNumber]) {
      const subInterfaces = formData.portSubInterfaces[serialNumber][portId]
      subInterfaces.forEach((subInterface: SubInterface) => {
        if (subInterface.id?.startsWith('new_')) {
          delete subInterface.id
        }
      })
      node.ports.push({
        portId,
        subInterfaces
      })
    }

    for (const lagId in formData.lagSubInterfaces[serialNumber]) {
      const subInterfaces = formData.lagSubInterfaces[serialNumber][lagId]
      subInterfaces.forEach((subInterface: SubInterface) => {
        if (subInterface.id?.startsWith('new_')) {
          delete subInterface.id
        }
      })
      node.lags.push({
        lagId: Number(lagId),
        subInterfaces
      })
    }

    result.nodes.push(node)
  }

  return result
}

const getSubnetInfo = (
  { id, ip, subnet, ipMode }: { id?: string, ip?: string, subnet?: string, ipMode: EdgeIpModeEnum }
): { id?: string, ipMode: EdgeIpModeEnum, ip: string, subnetMask: string } | undefined => {
  if (ipMode === EdgeIpModeEnum.DHCP || !ip || !subnet) {
    return undefined
  }

  const [ipWithoutMask] = ip.split('/')
  return { id: id, ipMode, ip: ipWithoutMask, subnetMask: subnet }
}

export const extractSubnetFromEdgePortInfo = (portInfo: EdgePortInfo) => {
  return portInfo.isLagMember ? undefined : getSubnetInfo(portInfo)
}

export const extractSubnetFromSubInterface = (subInterface: SubInterface) => {
  return getSubnetInfo(subInterface)
}

export const getSubInterfaceCompatibilityFields = () => {
  return [{
    key: 'subInterfaces',
    title: 'Number of sub-interfaces',
    render: (errors: CompatibilityNodeError<SubInterfaceCompatibility>['errors']) =>
      <Typography.Text
        type={errors.totalSubInterfaceCount.isError ? 'danger' : undefined}
        children={errors.totalSubInterfaceCount.value} />
  }] as SingleNodeDetailsField<SubInterfaceCompatibility>[]
}

export const getInterfaceNameMap = (
  portsStatus: EdgeNodesPortsInfo,
  lagsStatus: EdgeNodesPortsInfo
) => {
  const allPortsAndLags = Object.entries(portsStatus).reduce((acc, [serial, ports]) => {
    acc[serial] = [...(acc[serial] || []), ...ports]
    return acc
  }, { ...lagsStatus })

  let resultMap: { [id: string]: string } = {}
  _.flatMap(allPortsAndLags).forEach((portInfo) => {
    if (portInfo.isLagMember !== true) {
      resultMap[portInfo.id] = portInfo.portName
    }
  })
  return resultMap
}

const initialNodeCompatibleResult = {
  nodeId: '',
  errors: {
    totalSubInterfaceCount: { value: 0 },
    portSubInterfaceVlans: {},
    lagSubInterfaceVlans: {}
  }
} as CompatibilityNodeError<SubInterfaceCompatibility>

export const subInterfaceCompatibleCheck = (
  portSubInterfaces: SubInterfaceSettingsFormType['portSubInterfaces'],
  lagSubInterfaces: SubInterfaceSettingsFormType['lagSubInterfaces'],
  nodeList: EdgeClusterStatus['edgeList'],
  portsStatus?: EdgeNodesPortsInfo,
  lagsStatus?: EdgeNodesPortsInfo
): CompatibilityCheckResult => {
  const checkResult: Record<
    EdgeSerialNumber,
    CompatibilityNodeError<SubInterfaceCompatibility>
  > = {}

  const nameMap = getInterfaceNameMap(portsStatus || {}, lagsStatus || {})
  nodeList?.forEach((node) => {
    const result = _.cloneDeep(initialNodeCompatibleResult)

    const { name: nodeName, serialNumber } = node
    result.nodeId = serialNumber
    result.nodeName = nodeName

    const nodePortSubInterfaces = portSubInterfaces[serialNumber]
    const nodeLagSubInterfaces = lagSubInterfaces[serialNumber]

    const totalPortSubInterfaces = _.flatMap(nodePortSubInterfaces).length
    const totalLagSubInterfaces = _.flatMap(nodeLagSubInterfaces).length
    result.errors.totalSubInterfaceCount.value = totalPortSubInterfaces + totalLagSubInterfaces

    Object.entries(nodePortSubInterfaces)
      .filter(([portId]) => nameMap[portId])
      .filter(Boolean)
      .forEach(([portId, subInterfaces]) => {
        const vlanIds = subInterfaces
          .map(subInterface => subInterface.vlan)
          .sort((a, b) => a - b)
        result.errors.portSubInterfaceVlans[nameMap[portId] || ''] = {
          vlanIds: { value: vlanIds }
        }
      })
    Object.entries(nodeLagSubInterfaces)
      .filter(([lagId]) => nameMap[lagId])
      .filter(Boolean)
      .forEach(([lagId, subInterfaces]) => {
        const vlanIds = subInterfaces
          .map(subInterface => subInterface.vlan)
          .sort((a, b) => a - b)
        result.errors.lagSubInterfaceVlans[nameMap[lagId] || ''] = {
          vlanIds: { value: vlanIds }
        }
      })

    checkResult[serialNumber] = result
  })

  const subInterfaceCounts = new Set(Object.values(checkResult)
    .map(({ errors }) => errors.totalSubInterfaceCount.value))
  const isSubInterfaceCountConsistent = subInterfaceCounts.size === 1
  if (!isSubInterfaceCountConsistent) {
    Object.values(checkResult).forEach((result) => {
      result.errors.totalSubInterfaceCount.isError = true
    })
  }

  return {
    results: Object.values(checkResult),
    isError: !isSubInterfaceCountConsistent
  }
}
