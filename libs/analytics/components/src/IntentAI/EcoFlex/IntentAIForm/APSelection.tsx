import { useMemo } from 'react'

import { Form }                                     from 'antd'
import _                                            from 'lodash'
import moment                                       from 'moment-timezone'
import { FormattedMessage, defineMessage, useIntl } from 'react-intl'

import { NetworkHierarchy, System, SystemMap, useSystems }                          from '@acx-ui/analytics/services'
import { defaultNetworkPath, meetVersionRequirements, nodeTypes } from '@acx-ui/analytics/utils'
import { CascaderOption, Loader, StepsForm, useStepFormContext }  from '@acx-ui/components'
import { get }                                                    from '@acx-ui/config'
import { FilterListNode, DateRange, PathNode, NetworkPath }                    from '@acx-ui/utils'

import { getNetworkFilterData }                                                                        from '../../../NetworkFilter'
import { useVenuesHierarchyQuery, Child as HierarchyNodeChild, useNetworkHierarchyQuery, NetworkNode } from '../../../NetworkFilter/services'
import { ClientType as ClientTypeEnum }                                 from '../../../ServiceGuard/types'
import { ClientType }                                                                                  from '../../../ServiceGuard/ServiceGuardForm/FormItems/ClientType'

import { APsSelectionInput }                          from '../../../APsSelectionInput'
import { DeviceRequirementsType, deviceRequirements } from '../../../ServiceGuard/ServiceGuardForm/FormItems/APsSelection/deviceRequirements'

import { isAPListNodes, isNetworkNodes }    from '../../../APsSelectionInput/types'

import type { NetworkNodes, NetworkPaths } from '../../../APsSelectionInput/types'
import type { NamePath }                                        from 'antd/lib/form/interface'
import { Intent } from '../../config'
import { useIntentContext } from '../../IntentContext'

const name = ['preferences','excludedAPs'] as const
const label = defineMessage({ defaultMessage: 'APs Selection' })

function transformSANetworkHierarchy (
  nodes: NetworkNode[], parentPath: PathNode[]
) : CascaderOption[] {
  return nodes && nodes.map(node => {
    const path = [
      ...parentPath, { type: node.type, name: node.mac ?? node.name }
    ] as PathNode[]
    return{
      label: `${node.name} (${nodeTypes(node.type)})` as string,
      value: JSON.stringify(path),
      ...(node.children && {
        children: transformSANetworkHierarchy(node.children, path)
      })
    }
  })
}
function filterRAIHierarchy (nodes: NetworkNode[], path: NetworkPath, unsupportedAPs: string[]) {
  let pathNode
  for (const pathSlice of path) {
    pathNode = _.find(nodes, o => o.name === pathSlice.name && o.type === pathSlice.type)
    nodes = pathNode?.children as NetworkNode []
  }
  const data =  {
    ...pathNode,
    children: pathNode?.children?.map(apGroup => ({
      ...apGroup,
      children: apGroup?.children
        ?.reduce((aps, ap) => {
          const { name, mac } = ap
          if (!unsupportedAPs.includes(mac as string)) aps.push({ type: 'AP', name, mac })
          return aps
        },
        [] as NetworkNode []
        )
    }))
  }
  return data
}
function useSANetworkHierarchy () {
  const filter = useMemo(() => ({
    startDate: moment().subtract(1, 'day').format(),
    endDate: moment().format(),
    range: DateRange.last24Hours
  }), [])
  const { intent: { path, metadata } } = useIntentContext()
  const response = useNetworkHierarchyQuery(
    { ...filter, shouldQueryAp: true, shouldQuerySwitch: false }, {
      skip: !get('IS_MLISA_SA'),
      selectFromResult: ({ data, ...rest }) => { 
        const zoneHierarchy = filterRAIHierarchy(
          data?.children ?? [], path, metadata?.unsupportedAPs ?? []
        )
        return {
          ...rest,
          data: zoneHierarchy as unknown as { 
            name: string, type: string, children: NetworkNode[]
          }
        }
    }
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
  const { form } = useStepFormContext<Intent>()
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
  const { requiredAPFirmware, excludedTargetAPs } = deviceRequirements[clientType || 'virtual-wireless-client']
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

export function APsSelection ({ isDisabled }: { isDisabled: boolean }) {
  const { $t } = useIntl()
  const response = useOptions()
  const { form } = useStepFormContext<Intent>()
  return <Loader
    states={[_.omit(response, ['options'])]}
    style={{ height: 'auto', minHeight: 346 }}
  >
    <Form.Item
      name={name as unknown as NamePath}
      rules={[{
        required: true,
        message: $t({ defaultMessage: 'Select APs to exclude' })
      }]}
      children={<APsSelectionInput
        disabled={isDisabled}
        autoFocus
        placeholder={get('IS_MLISA_SA')
          ? $t({ defaultMessage: 'Select APs to exclude' })
          : $t({ defaultMessage: 'Select <VenuePlural></VenuePlural> / APs to exclude' })}
        options={response.options}
      />}
    />
  </Loader>
}

APsSelection.fieldName = name
APsSelection.label = label
