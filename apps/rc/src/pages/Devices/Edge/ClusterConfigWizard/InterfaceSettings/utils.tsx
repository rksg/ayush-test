import { Space, Typography } from 'antd'
import _, { cloneDeep }      from 'lodash'
import moment                from 'moment-timezone'
import { defineMessage }     from 'react-intl'

import type { CompatibilityNodeError, SingleNodeDetailsField, VipConfigType } from '@acx-ui/rc/components'
import {
  ClusterHaFallbackScheduleTypeEnum,
  ClusterHaLoadDistributionEnum,
  ClusterNetworkSettings,
  EdgeClusterStatus,
  EdgePortInfo,
  EdgePortTypeEnum,
  EdgeSerialNumber,
  VirtualIpSetting
} from '@acx-ui/rc/utils'

import { defaultHaTimeoutValue } from '../../EditEdgeCluster/VirtualIp'

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

   return {
     portSettings,
     lagSettings: apiData?.lagSettings,
     timeout,
     vipConfig,
     fallbackSettings: fallbackSettings,
     loadDistribution: apiData?.highAvailabilitySettings?.loadDistribution
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
      if (port.corePortEnabled) result.errors.corePorts.value++
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
      if (lag.corePortEnabled) result.errors.corePorts.value++
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
    if(!Boolean(item.interfaces) || Object.keys(item.interfaces).length === 0) return undefined
    return {
      virtualIp: item.vip,
      timeoutSeconds: data.timeout,
      ports: item.interfaces
    }
  }).filter(item => Boolean(item)) as VirtualIpSetting[]
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
    lagSettings: data.lagSettings,
    portSettings,
    virtualIpSettings,
    ...(fallbackSettings ? {
      highAvailabilitySettings: {
        fallbackSettings,
        loadDistribution: data.loadDistribution
      }
    } : {})
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
  return ifName.replace('port', '').split('.').map(Number)
}

export const interfaceNameComparator =
(port1: EdgePortInfo, port2: EdgePortInfo): number => {
  const splitPort1 = splitInterfaceName(port1.portName)
  const splitPort2 = splitInterfaceName(port2.portName)

  for (let i = 0; i < 2; i++) {
    const segmentA = splitPort1[i] || 0
    const segmentB = splitPort2[i] || 0

    if (segmentA !== segmentB) {
      return segmentA - segmentB
    }
  }
  return 0
}
