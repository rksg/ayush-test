
import { ClusterSubInterfaceSettings, EdgeSerialNumber, NodeSubInterfaces, SubInterface } from '@acx-ui/rc/utils'

export interface SubInterfaceSettingsFormType {
  portSubInterfaces: Record<EdgeSerialNumber, { [portId:string]: SubInterface[] }>
  lagSubInterfaces: Record<EdgeSerialNumber, { [lagId:string]: SubInterface[] }>
}

export const transformFromApiToFormData = (
  apiData?: ClusterSubInterfaceSettings
): SubInterfaceSettingsFormType => {
  // Initialize the resulting form data structure
  const result: SubInterfaceSettingsFormType = {
    portSubInterfaces: {},
    lagSubInterfaces: {}
  }

  // Return early if apiData is undefined
  if (!apiData) {
    return result
  }

  // Iterate through each node in the apiData
  apiData.nodes.forEach((node) => {
    const { serialNumber, ports, lags } = node

    // Process ports
    ports.forEach((port) => {
      const { portId, subInterfaces } = port

      // If the serial number doesn't exist in portSubInterfaces, initialize it
      if (!result.portSubInterfaces[serialNumber]) {
        result.portSubInterfaces[serialNumber] = {}
      }

      // Assign the subInterfaces to the respective portId
      result.portSubInterfaces[serialNumber][portId] = subInterfaces
    })

    // Process lags
    lags.forEach((lag) => {
      const { lagId, subInterfaces } = lag

      // If the serial number doesn't exist in lagSubInterfaces, initialize it
      if (!result.lagSubInterfaces[serialNumber]) {
        result.lagSubInterfaces[serialNumber] = {}
      }

      // Assign the subInterfaces to the respective lagId
      result.lagSubInterfaces[serialNumber][lagId] = subInterfaces
    })
  })

  return result
}

export const transformFromFormDataToApi = (
  formData: SubInterfaceSettingsFormType
): ClusterSubInterfaceSettings => {
  // Initialize the resulting api data structure
  const result: ClusterSubInterfaceSettings = {
    nodes: []
  }

  // Iterate through each serial number in the formData
  for (const serialNumber in formData.portSubInterfaces) {
    // Initialize the node
    const node: NodeSubInterfaces = {
      serialNumber,
      ports: [],
      lags: []
    }

    // Process ports
    for (const portId in formData.portSubInterfaces[serialNumber]) {
      const subInterfaces = formData.portSubInterfaces[serialNumber][portId]

      subInterfaces.forEach((subInterface: SubInterface) => {
        if (subInterface.id?.startsWith('new_')) {
          delete subInterface.id  // Remove the 'id' field
        }
      })

      // Assign the subInterfaces to the respective portId
      node.ports.push({
        portId,
        subInterfaces
      })
    }

    // Process lags
    for (const lagId in formData.lagSubInterfaces[serialNumber]) {
      const subInterfaces = formData.lagSubInterfaces[serialNumber][lagId]

      subInterfaces.forEach((subInterface: SubInterface) => {
        if (subInterface.id?.startsWith('new_')) {
          delete subInterface.id  // Remove the 'id' field
        }
      })

      // Assign the subInterfaces to the respective lagId
      node.lags.push({
        lagId: Number(lagId),
        subInterfaces
      })
    }

    // Add the node to the result
    result.nodes.push(node)
  }

  return result
}
