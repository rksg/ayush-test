import { Typography } from 'antd'
import _              from 'lodash'

import type { CompatibilityNodeError, SingleNodeDetailsField } from '@acx-ui/rc/components'
import { ClusterNetworkSettings, EdgeSerialNumber }            from '@acx-ui/rc/utils'

import { InterfacePortFormCompatibility, InterfaceSettingsFormType } from './types'

export const transformFromApiToFormData =
 (apiData?: ClusterNetworkSettings):InterfaceSettingsFormType => {
   return {
     portSettings: _.reduce(apiData?.portSettings,
       (result, port) => {
         result[port.serialNumber] = _.groupBy(port.ports, 'interfaceName')
         return result
       }, {} as InterfaceSettingsFormType['portSettings']),
     lagSettings: _.reduce(apiData?.lagSettings,
       (result, lag) => {
         result[lag.serialNumber] = lag.lags
         return result
       }, {} as InterfaceSettingsFormType['lagSettings']),
     virtualIpSettings: apiData?.virtualIpSettings ?? []
   } as InterfaceSettingsFormType
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
        type={errors.ports.isError ? 'danger' : 'success'}
        children={errors.ports.value} />
  }, {
    key: 'corePorts',
    title: 'Number of Core Ports',
    render: (errors:
      CompatibilityNodeError<InterfacePortFormCompatibility>['errors']) =>
      <Typography.Text
        type={errors.ports.isError ? 'danger' : 'success'}
        children={errors.corePorts.value} />
  }, {
    key: 'portTypes',
    title: 'Port Types',
    render: (errors:
      CompatibilityNodeError<InterfacePortFormCompatibility>['errors']) => {
      return Object.keys(errors.portTypes)
        .map((portType) => <Typography.Text
          type={errors.portTypes[portType].isError ? 'danger' : 'success'}
          children={portType}
        />)
    }
  }] as SingleNodeDetailsField<InterfacePortFormCompatibility>[]
}

export const interfaceCompatibilityCheck = (portSettings: InterfaceSettingsFormType) => {
  // eslint-disable-next-line max-len
  const checkResult: Record<EdgeSerialNumber, CompatibilityNodeError<InterfacePortFormCompatibility>> = {}

  Object.entries(portSettings).forEach(([serialNumber, portsData]) => {
    let result = {
      nodeId: '',
      errors: {
        ports: { value: 0 },
        corePorts: { value: 0 },
        portTypes: {}
      }
    } as CompatibilityNodeError<InterfacePortFormCompatibility>

    // do counting
    _.values(portsData).flat().forEach(port => {
      result.nodeId = serialNumber
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

  let results = _.values(checkResult)
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
  }
}