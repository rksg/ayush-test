import { useMemo } from 'react'

import { Form }                                     from 'antd'
import _, { omit }                                  from 'lodash'
import moment                                       from 'moment-timezone'
import { FormattedMessage, defineMessage, useIntl } from 'react-intl'

import { System, useSystems }                                     from '@acx-ui/analytics/services'
import { defaultNetworkPath, meetVersionRequirements, nodeTypes } from '@acx-ui/analytics/utils'
import { CascaderOption, Loader, StepsForm, useStepFormContext }  from '@acx-ui/components'
import { get }                                                    from '@acx-ui/config'
import { FilterListNode, DateRange, PathNode }                    from '@acx-ui/utils'

import { getNetworkFilterData }                                                                            from '../../../../NetworkFilter'
import { useRecentNetworkFilterQuery, Child as HierarchyNodeChild, useNetworkHierarchyQuery, NetworkNode } from '../../../../NetworkFilter/services'
import { isAPListNodes, isNetworkNodes, ClientType as ClientTypeEnum }                                     from '../../../types'
import { ClientType }                                                                                      from '../ClientType'

import { APsSelectionInput }  from './APsSelectionInput'
import { deviceRequirements } from './deviceRequirements'

import type { ServiceGuardFormDto, NetworkNodes, NetworkPaths } from '../../../types'
import type { NamePath }                                        from 'antd/lib/form/interface'

const name = ['configs', 0, 'networkPaths', 'networkNodes'] as const
const label = defineMessage({ defaultMessage: 'APs Selection' })

function transformSANetworkHierarchy (
  nodes: NetworkNode[], parentPath: PathNode[] , systems: System[]
) : CascaderOption[] {
  return nodes.map(node => {
    const formattedNode = (node.type as string === 'ap')
      ? { type: 'AP', name: node.mac }
      : (node.type === 'system')
        ? { type: node.type, name: systems.find(sys => sys.deviceName === node.name)?.deviceId }
        : { type: node.type, name: node.name }
    const path = [...parentPath, formattedNode] as PathNode[]
    return ({
      label: `${node.name} (${nodeTypes(node.type)})`,
      value: JSON.stringify(path),
      ...(node.children && {
        children: transformSANetworkHierarchy(node.children, path, systems)
      })
    })
  })
}

function useSANetworkHierarchy () {
  const filter = useMemo(() => ({
    startDate: moment().subtract(1, 'day').format(),
    endDate: moment().format(),
    range: DateRange.last24Hours
  }), [])
  const response = useNetworkHierarchyQuery(
    { ...filter, shouldQuerySwitch: false }, { skip: !get('IS_MLISA_SA') })
  const systems = useSystems()
  // todo: need to filter aps based on device requirements
  return {
    ...response,
    options: transformSANetworkHierarchy(
      response.data?.children ?? [], defaultNetworkPath, systems.data?.networkNodes ?? [])
  }
}

function useR1NetworkHierarchy () {
  const filter = useMemo(() => ({
    startDate: moment().subtract(1, 'day').format(),
    endDate: moment().format(),
    range: DateRange.last24Hours
  }), [])
  const { form } = useStepFormContext<ServiceGuardFormDto>()
  const response = useRecentNetworkFilterQuery(filter, { skip: !!get('IS_MLISA_SA') })
  return { ...response, options: getNetworkFilterData(
    filterAPwithDeviceRequirements(response.data ?? [], form.getFieldValue(ClientType.fieldName)),
    {}, 'ap', false
  ) }
}

function useOptions () {
  const R1Options = useR1NetworkHierarchy()
  const SAOptions = useSANetworkHierarchy()
  return get('IS_MLISA_SA') ? SAOptions : R1Options
}

function filterAPwithDeviceRequirements (data: HierarchyNodeChild[], clientType: ClientTypeEnum ) {
  const { requiredAPFirmware, excludedTargetAPs } = deviceRequirements[clientType]
  return data.map(({ aps, ...rest }) => ({
    ...rest,
    aps: aps?.filter(ap => ap.serial)
      .filter(ap => {
        if (excludedTargetAPs.find(a =>
          _.get(a, 'model') === ap.model &&
            !meetVersionRequirements(_.get(a, 'requiredAPFirmware'), ap.firmware)
        )) return false
        return meetVersionRequirements(requiredAPFirmware, ap.firmware)
      })
  }))
}

export function APsSelection () {
  const { $t } = useIntl()
  const response = useOptions()

  return <Loader states={[omit(response, ['options'])]} style={{ height: 'auto', minHeight: 346 }}>
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
          : $t({ defaultMessage: 'Select Venues / APs to test' })}
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
  const systems = useSystems()
  const convert = (value: unknown) => {
    const paths = (value as NetworkPaths).map(path =>
      path.map(node => node.type === 'system'
        ? { ...node,
          name: (systems.data?.networkNodes ?? [])
            .find(sys => sys.deviceId === node.name)?.deviceName
        } : node)) as NetworkPaths

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
        key={item!.name}
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
        count: getSAAPCount(hierarchies) //.children?.length || 0
      }
    }
    const [ target, ...rest ] = subPath
    const current = hierarchies.children?.find(
      (node: NetworkNode) => node.name === target.name && node.type === target.type)
    return current ? getSAHierarchyCount(path, rest, current) : null
  }

  function getSAAPCount (hierarchies: NetworkNode) : number {
    if(hierarchies.type as string === 'ap') return 1
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
    const matched = hierarchies
      .find(item => item.path.slice(1).some((node, i) => _.isEqual(path[i], node)))

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
