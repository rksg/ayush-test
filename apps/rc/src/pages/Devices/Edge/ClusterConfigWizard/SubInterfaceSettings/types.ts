
import {
  ClusterSubInterfaceSettings,
  EdgeSerialNumber,
  NodeSubInterfaces,
  SubInterface
} from '@acx-ui/rc/utils'

export interface SubInterfaceSettingsFormType {
  portSubInterfaces: Record<EdgeSerialNumber, { [portId:string]: SubInterface[] }>
  lagSubInterfaces: Record<EdgeSerialNumber, { [lagId:string]: SubInterface[] }>
}

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
    ports.forEach((port) => {
      const { portId, subInterfaces } = port
      if (!result.portSubInterfaces[serialNumber]) {
        result.portSubInterfaces[serialNumber] = {}
      }
      result.portSubInterfaces[serialNumber][portId] = subInterfaces
    })

    lags.forEach((lag) => {
      const { lagId, subInterfaces } = lag
      if (!result.lagSubInterfaces[serialNumber]) {
        result.lagSubInterfaces[serialNumber] = {}
      }
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
