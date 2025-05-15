/* eslint-disable max-len */
import { FormInstance, Space, Typography } from 'antd'
import _, { cloneDeep }                    from 'lodash'
import moment                              from 'moment-timezone'
import { defineMessage }                   from 'react-intl'

import type { CompatibilityNodeError, SingleNodeDetailsField, VipConfigType, VipInterface } from '@acx-ui/rc/components'
import {
  ClusterHaFallbackScheduleTypeEnum,
  ClusterHaLoadDistributionEnum,
  ClusterHighAvailabilityModeEnum,
  ClusterNetworkSettings,
  convertEdgeNetworkIfConfigToApiPayload,
  EdgeClusterStatus,
  EdgePortInfo,
  EdgeLag,
  EdgePort,
  EdgePortTypeEnum,
  EdgeSerialNumber,
  NodeSubInterfaces,
  VirtualIpSetting,
  SubInterface
} from '@acx-ui/rc/utils'

import { defaultHaTimeoutValue }        from '../../EditEdgeCluster/VirtualIp'
import { SubInterfaceSettingsFormType } from '../SubInterfaceSettings/types'

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
 (apiData?: ClusterNetworkSettings):InterfaceSettingsFormType => {
   const portSettings = _.reduce(apiData?.portSettings,
     (result, port) => {
       result[port.serialNumber] = _.groupBy(port.ports, 'interfaceName')
       return result
     }, {} as InterfaceSettingsFormType['portSettings'])

   const virtualIpSettings = apiData?.virtualIpSettings
   const timeout = apiData?.virtualIpSettings?.[0]?.timeoutSeconds ?? defaultHaTimeoutValue
   const vipConfig = virtualIpSettings?.map(item => ({
     vip: item.virtualIp,
     interfaces: item.ports
   })) ?? []

   if(vipConfig.length === 0) vipConfig.push({} as VipConfigType)

   // eslint-disable-next-line max-len
   const fallbackSettings = cloneDeep(apiData?.highAvailabilitySettings?.fallbackSettings) as InterfaceSettingsFormType['fallbackSettings']
   const time = fallbackSettings?.schedule.time
   if(time) {
     fallbackSettings.schedule.time = moment(time, 'HH:mm:ss')
   }

   const portSubInterfaces = {} as InterfaceSettingsFormType['portSubInterfaces']
   const lagSubInterfaces = {} as InterfaceSettingsFormType['lagSubInterfaces']

   apiData?.subInterfaceSettings?.forEach(item => {
     // eslint-disable-next-line max-len
     portSubInterfaces[item.serialNumber] = _.reduce(item.ports ?? [], (result, portSubInterface) => {
       result[portSubInterface.portId] = portSubInterface.subInterfaces
       return result
     }, {} as InterfaceSettingsFormType['portSubInterfaces'][EdgeSerialNumber])
     lagSubInterfaces[item.serialNumber] = _.reduce(item.lags ?? [], (result, lagSubInterface) => {
       result[lagSubInterface.lagId] = lagSubInterface.subInterfaces
       return result
     }, {} as InterfaceSettingsFormType['lagSubInterfaces'][EdgeSerialNumber])
   })


   return {
     portSettings,
     lagSettings: apiData?.lagSettings,
     timeout,
     vipConfig,
     fallbackSettings: fallbackSettings,
     loadDistribution: apiData?.highAvailabilitySettings?.loadDistribution,
     portSubInterfaces,
     lagSubInterfaces,
     multiWanSettings: apiData?.multiWanSettings
   } as InterfaceSettingsFormType
 }

export const getAvailableVipInterfaces = (
  lagdata?: InterfaceSettingsFormType['lagSettings'],
  portData?: InterfaceSettingsFormType['portSettings'],
  subInterfaces?: SubInterfaceSettingsFormType,
  clusterInfo?: EdgeClusterStatus
) => {
  const result = {} as { [key: string]: VipInterface[] }
  const edgeNodeList = clusterInfo?.edgeList ?? []

  for(let edgeNode of edgeNodeList) {
    const allLags = lagdata?.find(item => item.serialNumber === edgeNode.serialNumber)
    const lanLags = allLags
      ?.lags.filter(item => item.portType === EdgePortTypeEnum.LAN)
      .map(item => ({
        interfaceName: `lag${item.id}`,
        ipMode: item.ipMode,
        ip: item.ip ?? '',
        subnet: item.subnet ?? ''
      })) ?? []

    const lagSubInterfaces = subInterfaces?.lagSubInterfaces?.[edgeNode.serialNumber]
      ? Object.entries(subInterfaces.lagSubInterfaces[edgeNode.serialNumber])
        .filter(([lagId]) => allLags?.lags.some(lag => lag.id.toString() === lagId))
        .map(([, subInterfaces]) => subInterfaces)
        .flat()
        .map(subInterface => subInterface as VipInterface) : []

    const lanPorts = portData?.[edgeNode.serialNumber] ?
      Object.values(portData[edgeNode.serialNumber])
        .flat().filter(item => item.portType === EdgePortTypeEnum.LAN)
        .map(item => ({
          interfaceName: item.interfaceName ?? '',
          ipMode: item.ipMode,
          ip: item.ip,
          subnet: item.subnet
        })) : []

    const lagMembers = allLags?.lags
      .flatMap(lag => lag.lagMembers.map(member => member.portId))
    const nonLagPorts = portData?.[edgeNode.serialNumber]
      ? Object.values(portData[edgeNode.serialNumber])
        .flat()
        .filter(item => !lagMembers?.includes(item.id))
      : []
    const nonLagPortSubInterfaces = subInterfaces?.portSubInterfaces?.[edgeNode.serialNumber]
      ? Object.entries(subInterfaces.portSubInterfaces[edgeNode.serialNumber])
        .filter(([portId]) => nonLagPorts.some(port => port.id === portId))
        .map(([, subInterfaces]) => subInterfaces)
        .flat()
        .map(subInterface => subInterface as VipInterface) : []

    result[edgeNode.serialNumber] = [
      ...lanLags,
      ...lanPorts,
      ...lagSubInterfaces,
      ...nonLagPortSubInterfaces
    ].sort((vif1, vif2) => {
      return interfaceNameComparator(vif1.interfaceName, vif2.interfaceName)
    })
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
      return <Space size={10}>
        {Object.keys(errors.portTypes)
          .map((portType) => errors.portTypes[portType].value
            ? <Typography.Text
              key={portType}
              type={errors.portTypes[portType].isError ? 'danger' : undefined}
              children={portType}
            />
            : '').filter(i => !!i)}
      </Space>
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
      return <Space size={10}>
        {Object.keys(errors.portTypes)
          .map((portType) => errors.portTypes[portType].value
            ?<Typography.Text
              key={portType}
              type={errors.portTypes[portType].isError ? 'danger' : undefined}
              children={portType}
            />
            : '').filter(i => !!i)}
      </Space>
    }
  }] as SingleNodeDetailsField<InterfacePortFormCompatibility>[]
}

const getCompatibleCheckResult = (
  countResult: Record<EdgeSerialNumber, CompatibilityNodeError<InterfacePortFormCompatibility>>
): CompatibilityCheckResult => {
  let results = _.values(countResult)
  const targetData = results[0]

  const portsCheck = _.every(results,
    (result) => _.isEqual(result.errors.ports.value, targetData.errors.ports.value))
  const corePortsCheck = _.every(results,
    (result) => _.isEqual(result.errors.corePorts.value, targetData.errors.corePorts.value))

  // append 'isError' data
  results.forEach((givenData) => {
    givenData.errors.ports.isError = !portsCheck
    givenData.errors.corePorts.isError = !corePortsCheck

    // compare the given with target data
    const givenPortTypes = Object.keys(givenData.errors.portTypes)
    givenPortTypes.forEach(pt => {
      // ignore UNCONFIGURED
      if (pt === EdgePortTypeEnum.UNCONFIGURED) return
      const givenPortType = givenData.errors.portTypes[pt]
      const res = _.isEqual(givenPortType?.value, targetData.errors.portTypes[pt]?.value)
      if (!res) {
        givenPortType.isError = true
        // when counting not equal, both side should display in error
        if (targetData.errors.portTypes[pt]) targetData.errors.portTypes[pt].isError = true
      }
    })

    // reverse check to find port type only configure on target data
    const diffPortTypes = _.difference(Object.keys(targetData.errors.portTypes), givenPortTypes)
    if (diffPortTypes.length) {
      diffPortTypes.forEach(diffPortType => {
        // ignore UNCONFIGURED
        if (diffPortType === EdgePortTypeEnum.UNCONFIGURED) return
        targetData.errors.portTypes[diffPortType].isError = true
      })
    }
  })
  const portTypesCheck = _.every(results, (res) => {
    // check no error
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
      // only count on non-lagMember port and enabled port
      // TODO: need more discussion on considering `enabled`
      if (nodeLagMembers?.includes(port.id) /*|| !port.enabled*/) return

      result.errors.ports.value++
      if (port.corePortEnabled && port.portType === EdgePortTypeEnum.LAN) {
        result.errors.corePorts.value++
      }
      if (!result.errors.portTypes[port.portType]) {
        result.errors.portTypes[port.portType] = {
          isError: false, value: 1
        }
      } else {
        result.errors.portTypes[port.portType].value++
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
      // TODO: need more discussion on considering `lagEnabled`
      // only consider the enabled
      // if (!lag.lagEnabled) return

      result.errors.ports.value++
      if (lag.corePortEnabled && lag.portType === EdgePortTypeEnum.LAN) {
        result.errors.corePorts.value++
      }
      if (!result.errors.portTypes[lag.portType]) {
        result.errors.portTypes[lag.portType] = {
          isError: false, value: 1
        }
      } else {
        result.errors.portTypes[lag.portType].value++
      }
    })

    checkResult[serialNumber] = result
  })

  return getCompatibleCheckResult(checkResult)
}

const processLagSettings = (
  data: InterfaceSettingsFormType,
  isEdgeCoreAccessSeparationReady?: boolean
) => {
  const processLagConfig = (lags: EdgeLag[]) => {
    return lags.map(lag => convertEdgeNetworkIfConfigToApiPayload(
      lag,
      isEdgeCoreAccessSeparationReady
    )) as EdgeLag[]
  }

  const lagSettings = []
  for(let item of data.lagSettings) {
    lagSettings.push({
      serialNumber: item.serialNumber,
      lags: processLagConfig(item.lags)
    })
  }
  return lagSettings
}

const processPortSettings = (
  data: InterfaceSettingsFormType,
  isEdgeCoreAccessSeparationReady?: boolean
) => {
  const processPortConfig = (ports: EdgePort[]) => {
    return ports.map(port => convertEdgeNetworkIfConfigToApiPayload(
      port,
      isEdgeCoreAccessSeparationReady
    )) as EdgePort[]
  }

  const portSettings = []
  for(let [k, v] of Object.entries(data.portSettings)) {
    portSettings.push({
      serialNumber: k,
      ports: processPortConfig(Object.values(v).flat())
    })
  }
  return portSettings
}

const processVirtualIpSettings = (data: InterfaceSettingsFormType) => {
  return data.vipConfig.map(item => {
    if(!Boolean(item.interfaces) || Object.keys(item.interfaces).length === 0) return undefined
    return {
      virtualIp: item.vip,
      timeoutSeconds: data.timeout,
      ports: item.interfaces
    }
  }).filter(item => Boolean(item)) as VirtualIpSetting[]
}

const processHighAvailabilitySettings = (data: InterfaceSettingsFormType) => {
  const fallbackSettingsFormData = data.fallbackSettings
  const fallbackSettings = data.fallbackSettings && {
    ...fallbackSettingsFormData,
    schedule: {}
  } as Exclude<ClusterNetworkSettings['highAvailabilitySettings'], undefined>['fallbackSettings']
  if(fallbackSettingsFormData) {
    const { type, time, weekday, intervalHours } = fallbackSettingsFormData.schedule
    switch(type) {
      case ClusterHaFallbackScheduleTypeEnum.DAILY:
        fallbackSettings.schedule = {
          type,
          time: moment(time).format('HH:mm')
        }
        break
      case ClusterHaFallbackScheduleTypeEnum.WEEKLY:
        fallbackSettings.schedule = {
          type,
          weekday,
          time: moment(time).format('HH:mm')
        }
        break
      case ClusterHaFallbackScheduleTypeEnum.INTERVAL:
        fallbackSettings.schedule = {
          type,
          intervalHours
        }
        break
    }
  }

  return {
    fallbackSettings,
    loadDistribution: data.loadDistribution
  }
}

const preProcessSubInterfaceSetting = (settings: SubInterface[]) => {
  return settings.map(subInterface => {
    if(subInterface.id?.startsWith('new_')) {
      delete subInterface.id
    }
    return subInterface
  })
}

const processSubInterfaceSettings = (data: InterfaceSettingsFormType) => {
  const subInterfaceSettings = [] as NodeSubInterfaces[]
  const nodeLagIdsMap = _.reduce(data.lagSettings, (result, lagSetting) => {
    result[lagSetting.serialNumber] = lagSetting?.lags?.map(lag => lag.id) ?? []
    return result
  }, {} as { [serialNumber: string]: number[] })
  Object.entries(data.lagSubInterfaces ?? {}).forEach(([serialNumber, lagSubInterfaces = {}]) => {
    subInterfaceSettings.push({
      serialNumber,
      lags: Object.entries(lagSubInterfaces).filter(([lagId]) =>
        nodeLagIdsMap[serialNumber].includes(Number(lagId)))
        .map(([lagId, subInterfaces]) => ({
          lagId: Number(lagId),
          subInterfaces: preProcessSubInterfaceSetting(subInterfaces)
        }))
    } as NodeSubInterfaces)
  })
  Object.entries(data.portSubInterfaces ?? []).forEach(([serialNumber, portSubInterfaces = {}]) => {
    // eslint-disable-next-line max-len
    const lagSettingsOfCurrentNode = data.lagSettings.find(item => item.serialNumber === serialNumber)?.lags
    // eslint-disable-next-line max-len
    const currentSubInterfaceItem = subInterfaceSettings.find(item => item.serialNumber === serialNumber)
    if(currentSubInterfaceItem) {
      // eslint-disable-next-line max-len
      currentSubInterfaceItem.ports = Object.entries(portSubInterfaces).filter(([portId]) => {
        return !lagSettingsOfCurrentNode?.some(lag => lag.lagMembers.some(member => member.portId === portId))
      }).map(([portId, subInterfaces]) => ({
        portId: portId,
        subInterfaces: preProcessSubInterfaceSetting(subInterfaces)
      }))
    } else {
      subInterfaceSettings.push({
        serialNumber,
        ports: Object.entries(portSubInterfaces).map(([portId, subInterfaces]) => ({
          portId: portId,
          subInterfaces: preProcessSubInterfaceSetting(subInterfaces)
        }))
      } as NodeSubInterfaces)
    }
  })
  return subInterfaceSettings
}

export const transformFromFormToApiData = (
  data: InterfaceSettingsFormType,
  highAvailabilityMode?: ClusterHighAvailabilityModeEnum,
  isEdgeCoreAccessSeparationReady?: boolean
): ClusterNetworkSettings => {
  const highAvailabilitySettings = processHighAvailabilitySettings(data)
  const shouldPatchVip = highAvailabilityMode === ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY
  const shouldPatchHaSetting = highAvailabilitySettings.fallbackSettings &&
    highAvailabilityMode === ClusterHighAvailabilityModeEnum.ACTIVE_ACTIVE

  return {
    lagSettings: processLagSettings(data, isEdgeCoreAccessSeparationReady),
    portSettings: processPortSettings(data, isEdgeCoreAccessSeparationReady),
    ...(shouldPatchVip ? {
      virtualIpSettings: processVirtualIpSettings(data)
    } : {}),
    ...(shouldPatchHaSetting ? {
      highAvailabilitySettings
    } : {}),
    ...(isEdgeCoreAccessSeparationReady ?
      { subInterfaceSettings: processSubInterfaceSettings(data) } :
      {}),
    multiWanSettings: data.multiWanSettings
  }
}

export const dayOfWeek = {
  SUN: defineMessage({ defaultMessage: 'Sunday' }),
  MON: defineMessage({ defaultMessage: 'Monday' }),
  TUE: defineMessage({ defaultMessage: 'Tuesday' }),
  WED: defineMessage({ defaultMessage: 'Wednesday' }),
  THU: defineMessage({ defaultMessage: 'Thursday' }),
  FRI: defineMessage({ defaultMessage: 'Friday' }),
  SAT: defineMessage({ defaultMessage: 'Saturday' })
}

export const loadDistributions = {
  [ClusterHaLoadDistributionEnum.RANDOM]: defineMessage({ defaultMessage: 'Random distribution' }),
  // eslint-disable-next-line max-len
  [ClusterHaLoadDistributionEnum.AP_GROUP]: defineMessage({ defaultMessage: 'Per AP group distribution' })
}

const splitInterfaceName = (ifName: string) => {
  return {
    isLag: ifName.startsWith('lag'),
    ifNameSegments: ifName.replace('port', '').replace('lag', '').split('.').map(Number)
  }
}

export const interfaceNameComparator =
(ifName1: string, ifName2: string): number => {
  const splitPort1 = splitInterfaceName(ifName1)
  const splitPort2 = splitInterfaceName(ifName2)

  if (splitPort1.isLag !== splitPort2.isLag) {
    return splitPort1.isLag ? -1 : 1
  }

  for (let i = 0; i < 2; i++) {
    const segmentA = splitPort1.ifNameSegments[i] || 0
    const segmentB = splitPort2.ifNameSegments[i] || 0

    if (segmentA !== segmentB) {
      return segmentA - segmentB
    }
  }
  return 0
}

// eslint-disable-next-line max-len
export const getAllInterfaceAsPortInfoFromForm = (form: FormInstance): Record<EdgeSerialNumber, EdgePortInfo[]> => {
  // eslint-disable-next-line max-len
  const lagSettings = form.getFieldValue('lagSettings') as InterfaceSettingsFormType['lagSettings'] ?? []
  // eslint-disable-next-line max-len
  const portSettings = form.getFieldValue('portSettings') as InterfaceSettingsFormType['portSettings'] ?? []

  const result =_.reduce(Object.keys(portSettings), (acc, serialNumber) => {
    const currentLagSettings = lagSettings.find(item => item.serialNumber === serialNumber)?.lags
    // eslint-disable-next-line max-len
    const currentLagMembers = currentLagSettings?.flatMap(item => item.lagMembers.map(member => member.portId))
    const currentPortInfo = Object.values(portSettings[serialNumber]).map(item => ({
      serialNumber,
      id: item[0].id,
      portName: item[0].interfaceName,
      ipMode: item[0].ipMode,
      ip: item[0].ip,
      mac: item[0].mac,
      subnet: item[0].subnet,
      portType: item[0].portType,
      isCorePort: item[0].corePortEnabled,
      isLag: false,
      isLagMember: currentLagMembers?.includes(item[0].id) ?? false,
      portEnabled: item[0].enabled
    })) as EdgePortInfo[]
    const currentLagInfo = (currentLagSettings?.map(item => ({
      serialNumber,
      id: item.id + '',
      portName: `Lag${item.id}`,
      ipMode: item.ipMode,
      ip: item.ip,
      mac: '',
      subnet: item.subnet,
      portType: item.portType,
      isCorePort: item.corePortEnabled,
      isLag: true,
      isLagMember: false,
      portEnabled: item.lagEnabled
    })) ?? []) as EdgePortInfo[]
    acc[serialNumber] = [...currentPortInfo, ...currentLagInfo]
    return acc
  }, {} as Record<EdgeSerialNumber, EdgePortInfo[]>)

  return result
}
