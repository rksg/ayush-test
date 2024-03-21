import { Typography } from 'antd'
import _              from 'lodash'

import type { CompatibilityNodeError, SingleNodeDetailsField } from '@acx-ui/rc/components'
import {
  ClusterNetworkSettings,
  EdgeClusterStatus,
  EdgePortInfo,
  EdgePortTypeEnum,
  EdgeSerialNumber,
  VirtualIpSetting
} from '@acx-ui/rc/utils'

import {
  VirtualIpConfigFormType,
  VirtualIpFormType,
  defaultHaTimeoutValue
} from '../../EditEdgeCluster/VirtualIp'

import { CompatibilityCheckResult, InterfacePortFormCompatibility, InterfaceSettingsFormType } from './types'

const initialNodeCompatibleResult = {
  nodeId: '',
  errors: {
    ports: { value: 0 },
    corePorts: { value: 0 },
    portTypes: {}
  }
} as CompatibilityNodeError<InterfacePortFormCompatibility>

export const transformFromApiToFormData =
 (apiData?: ClusterNetworkSettings, clusterInfo?: EdgeClusterStatus):InterfaceSettingsFormType => {
   const portSettings = _.reduce(apiData?.portSettings,
     (result, port) => {
       result[port.serialNumber] = _.groupBy(port.ports, 'interfaceName')
       return result
     }, {} as InterfaceSettingsFormType['portSettings'])

   const virtualIpSettings = apiData?.virtualIpSettings
   const timeout = apiData?.virtualIpSettings?.[0]?.timeoutSeconds ?? defaultHaTimeoutValue
   const editVipConfig = [] as VirtualIpFormType['vipConfig']
   const lanInterfaces = getLanInterfaces(apiData?.lagSettings, portSettings, clusterInfo)
   if(virtualIpSettings && lanInterfaces) {
     for(let i=0; i<virtualIpSettings.length; i++) {
       const currentConfig = virtualIpSettings[i]
       const interfaces = {} as { [key: string]: EdgePortInfo }
       for(let config of currentConfig.ports) {
         const tmp = lanInterfaces?.[config.serialNumber].find(item =>
           item.portName === config.portName)
         interfaces[config.serialNumber] = tmp || {} as EdgePortInfo
       }
       editVipConfig.push({
         vip: currentConfig.virtualIp,
         interfaces
       })
     }
   }

   // initialized empty data
   if(editVipConfig.length === 0) editVipConfig.push({} as VirtualIpConfigFormType)

   return {
     portSettings,
     lagSettings: apiData?.lagSettings,
     timeout,
     vipConfig: editVipConfig
   } as InterfaceSettingsFormType
 }

export const getLanInterfaces = (
  lagdata?: InterfaceSettingsFormType['lagSettings'],
  portData?: InterfaceSettingsFormType['portSettings'],
  clusterInfo?: EdgeClusterStatus
) => {
  const result = {} as { [key: string]: EdgePortInfo[] }
  const edgeNodeList = clusterInfo?.edgeList ?? []

  for(let edgeNode of edgeNodeList) {
    const lanLags = lagdata?.find(item => item.serialNumber === edgeNode.serialNumber)
      ?.lags.filter(item => item.portType === EdgePortTypeEnum.LAN)
      .map(item => ({
        id: `${item.id}`,
        serialNumber: edgeNode.serialNumber,
        portName: `lag${item.id}`,
        ipMode: item.ipMode,
        ip: item.ip ?? '',
        subnet: item.subnet ?? '',
        mac: '',
        portType: item.portType,
        isCorePort: item.corePortEnabled,
        isLagMember: false,
        isLag: true,
        portEnabled: item.lagEnabled
      })) ?? []

    const lanPorts = portData?.[edgeNode.serialNumber] ?
      Object.values(portData[edgeNode.serialNumber])
        .flat().filter(item => item.portType === EdgePortTypeEnum.LAN)
        .map(item => ({
          id: item.id,
          serialNumber: edgeNode.serialNumber,
          portName: item.interfaceName ?? '',
          ipMode: item.ipMode,
          ip: item.ip,
          subnet: item.subnet,
          mac: item.mac,
          portType: item.portType,
          isCorePort: item.corePortEnabled,
          isLagMember: false,
          isLag: false,
          portEnabled: item.enabled
        })) : []

    result[edgeNode.serialNumber] = [
      ...lanLags,
      ...lanPorts
    ]
  }

  return result
}


export const getPortFormCompatibilityFields = () => {
  return [{
    key: 'ports',
    title: 'Number of Ports',
    render: (errors:CompatibilityNodeError<InterfacePortFormCompatibility>['errors']) =>
      <Typography.Text
        type={errors.ports.isError ? 'danger' : undefined}
        children={errors.ports.value} />
  }, {
    key: 'corePorts',
    title: 'Number of Core Ports',
    render: (errors:CompatibilityNodeError<InterfacePortFormCompatibility>['errors']) =>
      <Typography.Text
        type={errors.corePorts.isError ? 'danger' : undefined}
        children={errors.corePorts.value} />
  }, {
    key: 'portTypes',
    title: 'Port Types',
    render: (errors:
      CompatibilityNodeError<InterfacePortFormCompatibility>['errors']) => {
      return Object.keys(errors.portTypes)
        .map((portType) => errors.portTypes[portType].value
          ? <Typography.Text
            type={errors.portTypes[portType].isError ? 'danger' : undefined}
            children={portType}
          />
          : '')
    }
  }] as SingleNodeDetailsField<InterfacePortFormCompatibility>[]
}

export const getLagFormCompatibilityFields = () => {
  return [{
    key: 'lags',
    title: 'Number of LAGs',
    render: (errors:CompatibilityNodeError<InterfacePortFormCompatibility>['errors']) =>
      <Typography.Text
        type={errors.ports.isError ? 'danger' : undefined}
        children={errors.ports.value} />
  }, {
    key: 'corePorts',
    title: 'Number of Core Ports',
    render: (errors:
      CompatibilityNodeError<InterfacePortFormCompatibility>['errors']) =>
      <Typography.Text
        type={errors.corePorts.isError ? 'danger' : undefined}
        children={errors.corePorts.value} />
  }, {
    key: 'portTypes',
    title: 'Port Types',
    render: (errors:
      CompatibilityNodeError<InterfacePortFormCompatibility>['errors']) => {
      return Object.keys(errors.portTypes)
        .map((portType) => <Typography.Text
          type={errors.portTypes[portType].isError ? 'danger' : undefined}
          children={portType}
        />)
    }
  }] as SingleNodeDetailsField<InterfacePortFormCompatibility>[]
}

const getCompatibleCheckResult = (
  countResult: Record<EdgeSerialNumber, CompatibilityNodeError<InterfacePortFormCompatibility>>
): CompatibilityCheckResult => {
  let results = _.values(countResult)
  const portsCheck = _.every(results,
    (result) => _.isEqual(result.errors.ports.value, results[0].errors.ports.value))
  const corePortsCheck = _.every(results,
    (result) => _.isEqual(result.errors.corePorts.value, results[0].errors.corePorts.value))

  // append 'isError' data
  results.forEach((r) => {
    r.errors.ports.isError = !portsCheck
    r.errors.corePorts.isError = !corePortsCheck

    Object.keys(r.errors.portTypes).forEach(pt => {
      const portTypeData = r.errors.portTypes[pt]
      if (!portTypeData) r.errors.portTypes[pt] = { value: 0 }

      const res = _.isEqual(portTypeData?.value, results[0].errors.portTypes[pt]?.value)
      if (!res) r.errors.portTypes[pt].isError = true
    })
  })
  const portTypesCheck = _.every(results, (res) => {
    // cehck no error
    return _.values(res.errors.portTypes).some(i => i.isError) === false
  })

  return {
    results,
    isError: !(portsCheck && corePortsCheck && portTypesCheck),
    ports: portsCheck,
    corePorts: corePortsCheck,
    portTypes: portTypesCheck
  } as CompatibilityCheckResult
}

export const interfaceCompatibilityCheck = (
  portSettings: InterfaceSettingsFormType['portSettings'],
  lagSettings: InterfaceSettingsFormType['lagSettings'],
  nodeList: EdgeClusterStatus['edgeList']
): CompatibilityCheckResult => {
  // eslint-disable-next-line max-len
  const checkResult: Record<EdgeSerialNumber, CompatibilityNodeError<InterfacePortFormCompatibility>> = {}

  nodeList?.forEach((node) => {
    const { name: nodeName, serialNumber } = node
    const portsData = _.get(portSettings, serialNumber)
    const lagData = _.find(lagSettings, { serialNumber })
    const result = _.cloneDeep(initialNodeCompatibleResult)
    // append node info
    result.nodeId = serialNumber
    result.nodeName = nodeName

    // no port exist
    if (!portsData) {
      checkResult[serialNumber] = result
      return
    }

    const nodeLagMembers = lagData?.lags.flatMap(lag => {
      return lag.lagMembers.flatMap(member => member.portId)
    })

    // do counting
    Object.values(portsData).flat().forEach(port => {
      // only count on non-lagMember port
      if (nodeLagMembers?.includes(port.id)) return

      result.errors.ports.value++
      if (port.corePortEnabled) result.errors.corePorts.value++
      if (!result.errors.portTypes[port.portType]) {
        result.errors.portTypes[port.portType] = {
          isError: false, value: 1
        }
      } else {
        // eslint-disable-next-line max-len
        result.errors.portTypes[port.portType].value = result.errors.portTypes[port.portType].value++
      }
    })

    checkResult[serialNumber] = result
  })

  return getCompatibleCheckResult(checkResult)
}

export const lagSettingsCompatibleCheck = (
  lagSettings: InterfaceSettingsFormType['lagSettings'],
  nodeList: EdgeClusterStatus['edgeList']
): CompatibilityCheckResult => {
  // eslint-disable-next-line max-len
  const checkResult: Record<EdgeSerialNumber, CompatibilityNodeError<InterfacePortFormCompatibility>> = {}

  nodeList?.forEach((node) => {
    const { name: nodeName, serialNumber } = node
    const lags = _.find(lagSettings, { serialNumber })
    const lagsData = lags?.lags
    const result = _.cloneDeep(initialNodeCompatibleResult)
    // append node info
    result.nodeId = serialNumber
    result.nodeName = nodeName

    // do counting
    lagsData?.forEach(lag => {
      result.errors.ports.value++
      if (lag.corePortEnabled) result.errors.corePorts.value++
      if (!result.errors.portTypes[lag.portType]) {
        result.errors.portTypes[lag.portType] = {
          isError: false, value: 1
        }
      } else {
        // eslint-disable-next-line max-len
        result.errors.portTypes[lag.portType].value = result.errors.portTypes[lag.portType].value++
      }
    })

    checkResult[serialNumber] = result
  })

  return getCompatibleCheckResult(checkResult)
}

export const transformFromFormToApiData =
(data: InterfaceSettingsFormType): ClusterNetworkSettings => {
  const portSettings = []
  for(let [k, v] of Object.entries(data.portSettings)) {
    portSettings.push({
      serialNumber: k,
      ports: Object.values(v).flat()
    })
  }
  const virtualIpSettings = data.vipConfig.map(item => {
    if(!Boolean(item.interfaces)) return undefined
    const ports = Object.entries(item.interfaces).map(([, v2]) => {
      return {
        serialNumber: v2.serialNumber,
        portName: v2.portName
      }
    })
    return {
      virtualIp: item.vip,
      timeoutSeconds: data.timeout,
      ports
    }
  }).filter(item => Boolean(item)) as VirtualIpSetting[]
  return {
    lagSettings: data.lagSettings,
    portSettings,
    virtualIpSettings
  }
}
