import { useMemo } from 'react'

import { Form }                                     from 'antd'
import _                                            from 'lodash'
import moment                                       from 'moment-timezone'
import { FormattedMessage, defineMessage, useIntl } from 'react-intl'

import { System, SystemMap, useSystems }                          from '@acx-ui/analytics/services'
import { defaultNetworkPath, meetVersionRequirements, nodeTypes } from '@acx-ui/analytics/utils'
import { CascaderOption, Loader, StepsForm, useStepFormContext }  from '@acx-ui/components'
import { get }                                                    from '@acx-ui/config'
import { FilterListNode, DateRange, PathNode, NetworkNode }       from '@acx-ui/utils'

import { APsSelectionInput }                                                              from '../../../../APsSelectionInput'
import { isAPListNodes, isNetworkNodes }                                                  from '../../../../APsSelectionInput/types'
import { getNetworkFilterData }                                                           from '../../../../NetworkFilter'
import { useVenuesHierarchyQuery, Child as HierarchyNodeChild, useNetworkHierarchyQuery } from '../../../../NetworkFilter/services'
import { ClientType as ClientTypeEnum }                                                   from '../../../types'
import { ClientType }                                                                     from '../ClientType'


import { DeviceRequirementsType, deviceRequirements } from './deviceRequirements'

import type { ServiceGuardFormDto, NetworkNodes, NetworkPaths } from '../../../types'
import type { NamePath }                                        from 'antd/lib/form/interface'

const name = ['configs', 0, 'networkPaths', 'networkNodes'] as const
const label = defineMessage({ defaultMessage: 'APs Selection' })

function checkSystem (
  node: NetworkNode,
  systemMap: SystemMap,
  requirements: DeviceRequirementsType
) {
  const matchedSystems = systemMap[node.name]
  const checkRequirement = (system: System) =>
    (system.onboarded || !_.isEmpty(node.children)) &&
    meetVersionRequirements(requirements.requiredSZVersion, system.controllerVersion)
  return (matchedSystems.length > 0 && matchedSystems.some(system => checkRequirement(system)))
    ? { type: node.type, name: node.name } : false
}

function checkAP (
  node: NetworkNode,
  requirements: DeviceRequirementsType
) {
  if (!(/^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/.test(node.mac!))) return false
  if (requirements.excludedTargetAPs.find(a => a.model === node.model &&
      !meetVersionRequirements(a.requiredAPFirmware, node.firmware))) return false
  return meetVersionRequirements(requirements.requiredAPFirmware, node.firmware)
    ? { type: 'AP', name: node.name, mac: node.mac } : false
}

export function transformSANetworkHierarchy (
  nodes: NetworkNode[], parentPath: PathNode[]
) : CascaderOption[] {
  return nodes.map(node => {
    const path = [
      ...parentPath, { type: node.type, name: node.mac ?? node.name }
    ] as PathNode[]
    let label
    if (node.type === 'AP') {
      label = `${node.name} (${node.mac}) (${nodeTypes(node.type)})`
    } else {
      label = `${node.name} (${nodeTypes(node.type)})`
    }
    return{
      label: label,
      value: JSON.stringify(path),
      ...(node.children && {
        children: transformSANetworkHierarchy(node.children, path)
      })
    }
  })
}

function filterSANetworkHierarchy (
  nodes: NetworkNode[], systemMap: SystemMap, requirements: DeviceRequirementsType
) {
  return _.sortBy(nodes.reduce((agg, node) => {
    const formattedNode = (node.type as string === 'ap')
      ? checkAP(node, requirements)
      : (node.type === 'system')
        ? checkSystem(node, systemMap, requirements)
        : { type: node.type, name: node.name }
    formattedNode && agg.push({
      ...formattedNode,
      ...(node.children && {
        children: filterSANetworkHierarchy(node.children, systemMap, requirements)
      })
    } as NetworkNode)
    return agg
  }, [] as NetworkNode[]), node => node.name!.toString().toLocaleLowerCase())
}

function useSANetworkHierarchy () {
  const filter = useMemo(() => ({
    startDate: moment().subtract(1, 'day').format(),
    endDate: moment().format(),
    range: DateRange.last24Hours
  }), [])
  const { form } = useStepFormContext<ServiceGuardFormDto>()
  const systems = useSystems()
  const response = useNetworkHierarchyQuery(
    { ...filter, shouldQueryAp: true, shouldQuerySwitch: false }, {
      skip: !get('IS_MLISA_SA') || !systems.data,
      selectFromResult: ({ data, ...rest }) => ({
        ...rest,
        data: { ...defaultNetworkPath[0], children: filterSANetworkHierarchy(
          data?.children ?? [],
          systems.data!,
          deviceRequirements[
            form.getFieldValue(ClientType.fieldName) as keyof typeof deviceRequirements
          ] as DeviceRequirementsType)
        }
      })
    })

  return {
    ...response,
    options: transformSANetworkHierarchy(response.data?.children, defaultNetworkPath)
  }
}

function useR1NetworkHierarchy () {
  const filter = useMemo(() => ({
    shouldQueryAp: true,
    startDate: moment().subtract(1, 'day').format(),
    endDate: moment().format(),
    range: DateRange.last24Hours
  }), [])
  const { form } = useStepFormContext<ServiceGuardFormDto>()
  const response = useVenuesHierarchyQuery(filter, { skip: !!get('IS_MLISA_SA') })
  return { ...response, options: getNetworkFilterData(
    filterAPwithDeviceRequirements(response.data ?? [], form.getFieldValue(ClientType.fieldName)),
    {}, false
  ) }
}

function useOptions () {
  const R1Options = useR1NetworkHierarchy()
  const SAOptions = useSANetworkHierarchy()
  return get('IS_MLISA_SA') ? SAOptions : R1Options
}

function filterAPwithDeviceRequirements (data: HierarchyNodeChild[], clientType: ClientTypeEnum ) {
  const { requiredAPFirmware, excludedTargetAPs } = deviceRequirements[clientType]
  return data.reduce((venues, { aps, ...rest }) => {
    const validAPs = aps!.filter(ap => {
      if (!ap.serial) return false
      if (excludedTargetAPs.find(a =>
        _.get(a, 'model') === ap.model &&
          !meetVersionRequirements(_.get(a, 'requiredAPFirmware'), ap.firmware)
      )) return false
      return meetVersionRequirements(requiredAPFirmware, ap.firmware)
    })
    validAPs.length && venues.push({ ...rest, aps: validAPs })
    return venues
  }, [] as HierarchyNodeChild[])
}

export function APsSelection () {
  const { $t } = useIntl()
  const response = useOptions()

  return <Loader
    states={[_.omit(response, ['options'])]}
    style={{ height: 'auto', minHeight: 346 }}
  >
    <Form.Item
      name={name as unknown as NamePath}
      rules={[{
        required: true,
        message: $t({ defaultMessage: 'Please select APs to test' })
      }]}
      children={<APsSelectionInput
        autoFocus
        placeholder={get('IS_MLISA_SA')
          ? $t({ defaultMessage: 'Select APs to test' })
          : $t({ defaultMessage: 'Select <VenuePlural></VenuePlural> / APs to test' })}
        options={response.options}
      />}
    />
  </Loader>
}

APsSelection.fieldName = name
APsSelection.label = label

APsSelection.FieldSummary = function APsSelectionFieldSummary () {
  const { $t } = useIntl()
  const response = useOptions()
  const convert = (value: unknown) => {
    const paths = value as NetworkPaths
    const nodes = paths
      .filter(isNetworkNodes)
      .map(path => get('IS_MLISA_SA')
        ? getSAHierarchyCount(path, path, response.data! as NetworkNode)
        : getHierarchyCount(path, response.data! as HierarchyNodeChild[]))

    const aps = paths
      .filter(isAPListNodes)
      .map((path) => ({
        count: (path.at(-1)! as FilterListNode).list.length,
        name: hierarchyName(path.slice(0, -1) as NetworkNodes, !!get('IS_MLISA_SA'))
      }))

    const list = nodes.filter(Boolean)
      .concat(aps)
      .map(item => <FormattedMessage
        key={`${item!.name}-${item!.count}`}
        defaultMessage='{name} — {count} {count, plural, one {AP} other {APs}}{br}'
        description='Translation strings - AP, APs'
        values={{ ...item, br: <br/> }}
      />)

    return list
  }

  return <Loader states={[response]} style={{ height: 'auto' }}>
    <Form.Item
      name={name as unknown as NamePath}
      label={$t(label)}
      children={<StepsForm.FieldSummary convert={convert} />}
    />
  </Loader>

  function getSAHierarchyCount (
    path: NetworkNodes,
    subPath: NetworkNodes,
    hierarchies: NetworkNode
  ): { name: string, count: number } | null {
    if(subPath.length === 0) {
      return {
        name: hierarchyName(path, true),
        count: getSAAPCount(hierarchies)
      }
    }
    const [ target, ...rest ] = subPath
    const current = hierarchies.children?.find(
      (node: NetworkNode) => node.name === target.name && node.type === target.type)
    return current ? getSAHierarchyCount(path, rest, current) : null
  }

  function getSAAPCount (hierarchies: NetworkNode) : number {
    if(hierarchies.type === 'AP') return 1
    if(hierarchies.children && hierarchies.children.length > 0) {
      return hierarchies.children.map(getSAAPCount).reduce((sum, count) => {
        sum = sum + count
        return sum
      }, 0)
    }
    return 0
  }

  function getHierarchyCount (
    path: NetworkNodes,
    hierarchies: HierarchyNodeChild[]
  ) {
    const matched = hierarchies.find(({ name }) => path.some(p => name === p.name)) // TODO should be using ID as renaming venues breaks edit
    return {
      name: hierarchyName(path),
      count: matched!.aps!.length
    }
  }
}

function hierarchyName (nodes: NetworkNodes, withNodeType: boolean = false) {
  return nodes.map(node =>
    withNodeType ? `${node.name} (${nodeTypes(node.type)})` :`${node.name}`).join(' > ')
}
