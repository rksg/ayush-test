/* eslint-disable max-len */
import { FormInstance, Space, Tooltip, Typography }                                                      from 'antd'
import { cloneDeep, difference, every, find, flatten, get, groupBy, isEqual, mergeWith, reduce, values } from 'lodash'
import moment                                                                                            from 'moment-timezone'
import { defineMessage, useIntl }                                                                        from 'react-intl'

import { defaultRichTextFormatValues }                                                 from '@acx-ui/components'
import { CompatibilityNodeError, SingleNodeDetailsField, VipConfigType, VipInterface } from '@acx-ui/rc/components'
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
  SubInterface,
  EdgeStatus,
  isEdgeMatchedRequiredFirmware,
  doEdgeNetworkInterfacesDryRun,
  getMergedLagTableDataFromLagForm,
  convertInterfaceDataToEdgePortInfo
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import { defaultHaTimeoutValue } from '../EditEdgeCluster/VirtualIp'

import { StyledCompatibilityWarningTriangleIcon }                                              from './InterfaceSettings/styledComponents'
import { CompatibilityCheckResult, InterfacePortFormCompatibility, InterfaceSettingsFormType } from './InterfaceSettings/types'
import { SubInterfaceSettingsFormType }                                                        from './SubInterfaceSettings/types'

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
   const portSettings = reduce(apiData?.portSettings,
     (result, port) => {
       result[port.serialNumber] = groupBy(port.ports, 'interfaceName')
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
     portSubInterfaces[item.serialNumber] = reduce(item.ports ?? [], (result, portSubInterface) => {
       result[portSubInterface.portId] = portSubInterface.subInterfaces
       return result
     }, {} as InterfaceSettingsFormType['portSubInterfaces'][EdgeSerialNumber])
     lagSubInterfaces[item.serialNumber] = reduce(item.lags ?? [], (result, lagSubInterface) => {
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
  lagData: InterfaceSettingsFormType['lagSettings'] | undefined,
  portData: InterfaceSettingsFormType['portSettings'] | undefined,
  subInterfaces: SubInterfaceSettingsFormType | undefined,
  clusterInfo: EdgeClusterStatus | undefined,
  isEdgeCoreAccessSeparationReady: boolean
) => {
  const result = {} as { [key: string]: VipInterface[] }
  const edgeNodeList = clusterInfo?.edgeList ?? []

  for(let edgeNode of edgeNodeList) {
    const allLags = lagData?.find(item => item.serialNumber === edgeNode.serialNumber)
    const allPorts = portData?.[edgeNode.serialNumber] ? Object.values(portData[edgeNode.serialNumber]).flat() : []
    const allLagSubInterfaces = subInterfaces?.lagSubInterfaces?.[edgeNode.serialNumber] ? Object.values(subInterfaces?.lagSubInterfaces?.[edgeNode.serialNumber]).flat() : []
    const allPortSubInterfaces = subInterfaces?.portSubInterfaces?.[edgeNode.serialNumber] ? Object.values(subInterfaces?.portSubInterfaces?.[edgeNode.serialNumber]).flat() : []
    const allSubInterfaces = allLagSubInterfaces.concat(allPortSubInterfaces)

    const {
      lags: resolvedLags,
      ports: resolvedPorts,
      subInterfaces: resolvedSubInterfaces
    } = doEdgeNetworkInterfacesDryRun(allLags?.lags, allPorts, allSubInterfaces, isEdgeCoreAccessSeparationReady)

    const lanLags = resolvedLags.filter(item => item.portType === EdgePortTypeEnum.LAN)
      .map(item => ({
        interfaceName: `lag${item.id}`,
        ipMode: item.ipMode,
        ip: item.ip ?? '',
        subnet: item.subnet ?? ''
      })) ?? []

    const lanPorts = resolvedPorts
      .filter(item => item.portType === EdgePortTypeEnum.LAN)
      .map(item => ({
        interfaceName: item.interfaceName ?? '',
        ipMode: item.ipMode,
        ip: item.ip,
        subnet: item.subnet
      }))

    result[edgeNode.serialNumber] = [
      ...lanLags,
      ...lanPorts,
      ...resolvedSubInterfaces as VipInterface[]
    ].sort((vif1, vif2) => {
      return interfaceNameComparator(vif1.interfaceName, vif2.interfaceName)
    })
  }

  return result
}


export const getPortFormCompatibilityFields = (isEdgeCoreAccessSeparationReady: boolean) => {
  return [{
    key: 'ports',
    title: 'Number of Ports',
    render: (errors:CompatibilityNodeError<InterfacePortFormCompatibility>['errors']) =>
      <Typography.Text
        type={errors.ports.isError ? 'danger' : undefined}
        children={errors.ports.value} />
  }, ...(
    isEdgeCoreAccessSeparationReady ? [] : [{
      key: 'corePorts',
      title: 'Number of Core Ports',
      render: (errors:CompatibilityNodeError<InterfacePortFormCompatibility>['errors']) =>
        <Typography.Text
          type={errors.corePorts.isError ? 'danger' : undefined}
          children={errors.corePorts.value} />
    }]
  ), {
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

export const getLagFormCompatibilityFields = (isEdgeCoreAccessSeparationReady: boolean) => {
  return [{
    key: 'lags',
    title: 'Number of LAGs',
    render: (errors:CompatibilityNodeError<InterfacePortFormCompatibility>['errors']) =>
      <Typography.Text
        type={errors.ports.isError ? 'danger' : undefined}
        children={errors.ports.value} />
  }, ...(
    isEdgeCoreAccessSeparationReady ? [] : [{
      key: 'corePorts',
      title: 'Number of Core Ports',
      render: (errors:
      CompatibilityNodeError<InterfacePortFormCompatibility>['errors']) =>
        <Typography.Text
          type={errors.corePorts.isError ? 'danger' : undefined}
          children={errors.corePorts.value} />
    }]
  ), {
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
  countResult: Record<EdgeSerialNumber, CompatibilityNodeError<InterfacePortFormCompatibility>>,
  isEdgeCoreAccessSeparationReady?: boolean
): CompatibilityCheckResult => {
  let results = values(countResult)
  const targetData = results[0]

  const portsCheck = every(results,
    (result) => isEqual(result.errors.ports.value, targetData.errors.ports.value))
  // ignore core ports check when edge core access FF is on
  const corePortsCheck = isEdgeCoreAccessSeparationReady ? true : every(results,
    (result) => isEqual(result.errors.corePorts.value, targetData.errors.corePorts.value))

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
      const res = isEqual(givenPortType?.value, targetData.errors.portTypes[pt]?.value)
      if (!res) {
        givenPortType.isError = true
        // when counting not equal, both side should display in error
        if (targetData.errors.portTypes[pt]) targetData.errors.portTypes[pt].isError = true
      }
    })

    // reverse check to find port type only configure on target data
    const diffPortTypes = difference(Object.keys(targetData.errors.portTypes), givenPortTypes)
    if (diffPortTypes.length) {
      diffPortTypes.forEach(diffPortType => {
        // ignore UNCONFIGURED
        if (diffPortType === EdgePortTypeEnum.UNCONFIGURED) return
        targetData.errors.portTypes[diffPortType].isError = true
      })
    }
  })
  const portTypesCheck = every(results, (res) => {
    // check no error
    return values(res.errors.portTypes).some(i => i.isError) === false
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
  nodeList: EdgeClusterStatus['edgeList'],
  isEdgeCoreAccessSeparationReady: boolean
): CompatibilityCheckResult => {
  // eslint-disable-next-line max-len
  const checkResult: Record<EdgeSerialNumber, CompatibilityNodeError<InterfacePortFormCompatibility>> = {}

  nodeList?.forEach((node) => {
    const { name: nodeName, serialNumber } = node
    const portsData = get(portSettings, serialNumber)
    const lagData = find(lagSettings, { serialNumber })
    const result = cloneDeep(initialNodeCompatibleResult)
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

  return getCompatibleCheckResult(checkResult, isEdgeCoreAccessSeparationReady)
}

export const lagSettingsCompatibleCheck = (
  lagSettings: InterfaceSettingsFormType['lagSettings'],
  nodeList: EdgeClusterStatus['edgeList'],
  isEdgeCoreAccessSeparationReady: boolean
): CompatibilityCheckResult => {
  // eslint-disable-next-line max-len
  const checkResult: Record<EdgeSerialNumber, CompatibilityNodeError<InterfacePortFormCompatibility>> = {}

  nodeList?.forEach((node) => {
    const { name: nodeName, serialNumber } = node
    const lags = find(lagSettings, { serialNumber })
    const lagsData = lags?.lags
    const result = cloneDeep(initialNodeCompatibleResult)
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

  return getCompatibleCheckResult(checkResult, isEdgeCoreAccessSeparationReady)
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
  const nodeLagIdsMap = reduce(data.lagSettings, (result, lagSetting) => {
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
  const nodePortIdsMap = reduce(Object.entries(data.portSettings), (result, [serialNumber, portSetting]) => {
    result[serialNumber] = Object.values(portSetting).map(item => item[0].id)
    return result
  }, {} as { [serialNumber: string]: string[] })
  Object.entries(nodePortIdsMap).forEach(([serialNumber, portIds]) => {
    const lagMemberIdsOfCurrentNode = data.lagSettings.find(item => item.serialNumber === serialNumber)?.lags
      ?.flatMap(lag => lag.lagMembers.map(member => member.portId))
    const currentNodePortSubInterfaces = data.portSubInterfaces?.[serialNumber] ?? {}
    const currentSubInterfaceItem = subInterfaceSettings.find(item => item.serialNumber === serialNumber)
    if(currentSubInterfaceItem) {
      currentSubInterfaceItem.ports = portIds.map(portId => ({
        portId,
        subInterfaces: !lagMemberIdsOfCurrentNode?.includes(portId) ?
          preProcessSubInterfaceSetting(currentNodePortSubInterfaces[portId] ?? []) :
          []
      }))
    } else {
      subInterfaceSettings.push({
        serialNumber,
        ports: portIds.map(portId => ({
          portId,
          subInterfaces: !lagMemberIdsOfCurrentNode?.includes(portId) ?
            preProcessSubInterfaceSetting(currentNodePortSubInterfaces[portId] ?? []) :
            []
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

// transform all physical port / LAG interface data as EdgePortInfo from form instance
export const getAllInterfaceAsPortInfoFromForm = (form: FormInstance): Record<EdgeSerialNumber, EdgePortInfo[]> => {
  const lagSettings = form.getFieldValue('lagSettings') as InterfaceSettingsFormType['lagSettings'] ?? []
  const portSettings = form.getFieldValue('portSettings') as InterfaceSettingsFormType['portSettings'] ?? []

  const result = reduce(Object.keys(portSettings), (acc, serialNumber) => {
    const currentLagSettings = lagSettings.find(item => item.serialNumber === serialNumber)?.lags ?? []
    const currentPortSettings = Object.values(portSettings[serialNumber]).flat()

    const {
      ports: currentPortInfo,
      lags: currentLagInfo
    } = convertInterfaceDataToEdgePortInfo(serialNumber, currentLagSettings, currentPortSettings)

    acc[serialNumber] = [...currentPortInfo, ...currentLagInfo]
    return acc
  }, {} as Record<EdgeSerialNumber, EdgePortInfo[]>)

  return result
}

export const getAllPhysicalInterfaceData = (
  portSettings: InterfaceSettingsFormType['portSettings'],
  lagSettings: InterfaceSettingsFormType['lagSettings']
): { ports: Record<EdgeSerialNumber, EdgePort[]>, lags: Record<EdgeSerialNumber, EdgeLag[]> } => {

  const allPortsData = reduce(portSettings, (result, values, key) => {
    result[key] = flatten(Object.values(values))
    return result
  }, {} as Record<EdgeSerialNumber, EdgePort[]>)

  const allLagsData = reduce(lagSettings, (result, values) => {
    result[values.serialNumber] = values.lags
    return result
  }, {} as Record<EdgeSerialNumber, EdgeLag[]>)

  return {
    ports: allPortsData,
    lags: allLagsData
  }
}


export const getAllSubInterfaceData = (
  portSubInterfaces: SubInterfaceSettingsFormType['portSubInterfaces'],
  lagSubInterfaces: SubInterfaceSettingsFormType['lagSubInterfaces']
): Record<EdgeSerialNumber, SubInterface[]> => {

  const allPortsData = reduce(portSubInterfaces, (result, values, key) => {
    result[key] = flatten(Object.values(values))
    return result
  }, {} as Record<EdgeSerialNumber, SubInterface[]>)

  const allLagsData = reduce(lagSubInterfaces, (result, values, key) => {
    result[key] = flatten(Object.values(values))
    return result
  }, {} as Record<EdgeSerialNumber, SubInterface[]>)

  const allSubInterfaces = mergeWith(allPortsData, allLagsData, (a, b) => {
    return a.concat(b)
  })

  return allSubInterfaces
}

// get physical port & LAG data from form instance
export const getAllPhysicalInterfaceFormData = (form: FormInstance): {
  ports: Record<EdgeSerialNumber, EdgePort[]>,
  lags: Record<EdgeSerialNumber, EdgeLag[]>
} => {
  const nodesPortData = form.getFieldValue('portSettings') as InterfaceSettingsFormType['portSettings']
  const nodesLagData = form.getFieldValue('lagSettings') as InterfaceSettingsFormType['lagSettings']

  return getAllPhysicalInterfaceData(nodesPortData, nodesLagData)
}

export const DualWanStepTitle = (props: {
  requiredFw: string | undefined,
  edgeList: EdgeStatus[] | undefined
}) => {
  const { $t } = useIntl()
  const { requiredFw, edgeList } = props
  const isLower = requiredFw && edgeList && !isEdgeMatchedRequiredFirmware(requiredFw, edgeList)

  return <>{$t({ defaultMessage: 'Dual WAN' })}
    {isLower && <Tooltip
      title={$t({ defaultMessage: `Dual WAN feature requires your RUCKUS Edge cluster
          running firmware version <b>{requiredFw}</b> or higher. You may upgrade your
          <venueSingular></venueSingular> firmware from {targetLink}` },
      {
        ...defaultRichTextFormatValues,
        requiredFw,
        targetLink: <TenantLink to='/administration/fwVersionMgmt/edgeFirmware'>
          {$t({ defaultMessage: 'Administration > Version Management > RUCKUS Edge Firmware' })}
        </TenantLink>
      })
      }>
      <StyledCompatibilityWarningTriangleIcon />
    </Tooltip>
    }
  </>
}

export const getDryRunResultWithCurrentLagFormData = (
  formRef: FormInstance<InterfaceSettingsFormType>,
  edgeId: EdgeSerialNumber,
  lag: EdgeLag,
  isEdgeCoreAccessSeparationReady: boolean
) => {
  const networkSettingsFormData = formRef.getFieldsValue(true) as InterfaceSettingsFormType

  const { ports: allPorts, lags: allLags } = getAllPhysicalInterfaceData(networkSettingsFormData.portSettings, networkSettingsFormData.lagSettings)
  const portSubInterfaces = networkSettingsFormData.portSubInterfaces
  const lagSubInterfaces = networkSettingsFormData.lagSubInterfaces
  const allSubInterfaces = getAllSubInterfaceData(portSubInterfaces, lagSubInterfaces)

  const existingPorts = allPorts[edgeId]
  const existingLags = allLags[edgeId]
  const existingSubInterfaces = allSubInterfaces[edgeId]

  if(!existingPorts || !existingLags || !existingSubInterfaces) {
    return {
      ports: existingPorts,
      lags: existingLags,
      subInterfaces: existingSubInterfaces
    }
  }

  // merge lag into existingLag
  const updatedLagList = getMergedLagTableDataFromLagForm(existingLags, lag)
  return doEdgeNetworkInterfacesDryRun(updatedLagList, existingPorts, existingSubInterfaces, isEdgeCoreAccessSeparationReady)
}