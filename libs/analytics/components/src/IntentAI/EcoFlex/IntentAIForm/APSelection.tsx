import { useMemo } from 'react'

import { Form }                   from 'antd'
import _                          from 'lodash'
import moment                     from 'moment-timezone'
import { defineMessage, useIntl } from 'react-intl'

import { defaultNetworkPath, nodeTypes }                                       from '@acx-ui/analytics/utils'
import { CascaderOption, Loader }                                              from '@acx-ui/components'
import { get }                                                                 from '@acx-ui/config'
import {  DateRange, PathNode, NetworkPath, NetworkNode, NodeFilter, getIntl } from '@acx-ui/utils'

import { APsSelectionInput }                                                    from '../../../APsSelectionInput'
import { getNetworkFilterData }                                                 from '../../../NetworkFilter'
import { useVenuesHierarchyQuery, useNetworkHierarchyQuery, Child, ApOrSwitch } from '../../../NetworkFilter/services'
import { useIntentContext }                                                     from '../../IntentContext'

import type { NamePath } from 'antd/lib/form/interface'

const name = ['preferences','excludedAPs'] as const
const label = defineMessage({ defaultMessage: 'APs Selection' })

export function transformSANetworkHierarchy (
  nodes: NetworkNode[], parentPath: PathNode[]
) : CascaderOption[] {
  return nodes && nodes.map(node => {
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
function filterRAIHierarchy (nodes: NetworkNode[], path: NetworkPath, unsupportedAPs: string[]) {
  let pathNode
  for (const pathSlice of path) {
    pathNode = _.find(nodes, o => o.name === pathSlice.name && o.type === pathSlice.type)
    nodes = pathNode?.children as NetworkNode []
  }
  const data = {
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
  const { intent: { sliceId, metadata } } = useIntentContext()
  const response = useVenuesHierarchyQuery(filter, {
    skip: !!get('IS_MLISA_SA'),
    selectFromResult: ({ data, ...rest }) => {
      let filteredAPs = [] as ApOrSwitch[] | undefined
      const venueHierarchy = data?.filter(({ id }) => id === sliceId)
        .map((venue: Child) => {
          const { aps } = venue
          filteredAPs = aps?.filter(
            ({ mac }: { mac: string }) => !metadata.unsupportedAPs?.includes(mac)
          )
          return { ...venue, aps: filteredAPs }
        })

      return {
        ...rest,
        data: filteredAPs?.length ? venueHierarchy as unknown as Child[] : []
      }
    }
  })

  return {
    ...response,
    options: getNetworkFilterData(response.data, {}, false)
  }
}

function useOptions () {
  const R1Options = useR1NetworkHierarchy()
  const SAOptions = useSANetworkHierarchy()
  return get('IS_MLISA_SA') ? SAOptions : R1Options
}

export const validateSelectingAllAPs = (
  selectedValue: NodeFilter[],
  apDataResponse: { data: unknown }
) => {
  const { $t } = getIntl()
  if (!selectedValue.length) return Promise.resolve()
  let isSelectAllAPs = false
  if (get('IS_MLISA_SA')) {
    const data = apDataResponse.data as unknown as {
        name: string, type: string, children: NetworkNode[]
      }
    const totalApGroups = data?.children?.length ?? 0
    isSelectAllAPs = totalApGroups > 0
        && selectedValue.length === totalApGroups
        && selectedValue.every(group => group.length === 1)
  } else {
    // When selecting all APs in a zone in R1, the component will return [[{ type: 'zone', name: 'zone1' }]]
    isSelectAllAPs = selectedValue.length === 1 && selectedValue.every(
      group => group.length === 1 && group[0].type === 'zone')
  }
  return isSelectAllAPs
    ? Promise.reject($t({ defaultMessage: 'Cannot exclude all APs.' }))
    : Promise.resolve()
}

export function APsSelection ({ isDisabled }: { isDisabled: boolean }) {
  const { $t } = useIntl()
  const response = useOptions()
  const raiMsg = defineMessage({ defaultMessage: 'Please select AP Groups / APs to exclude' })
  const r1Msg = defineMessage({ defaultMessage: 'Please select APs to exclude' })
  return <Loader
    states={[_.omit(response, ['options'])]}
    style={{ height: 'auto', minHeight: 200 }}
  >
    <Form.Item
      name={name as unknown as NamePath}
      rules={[{
        required: !isDisabled,
        message: get('IS_MLISA_SA') ? $t(raiMsg) : $t(r1Msg)
      }, {
        validator: (_, value) => validateSelectingAllAPs(value, response)
      }]}
      children={<APsSelectionInput
        disabled={isDisabled}
        placeholder={get('IS_MLISA_SA') ? $t(raiMsg) : $t(r1Msg)}
        options={response.options?.map(o => ({ ...o, disabled: isDisabled }))}
      />}
    />
  </Loader>
}

APsSelection.fieldName = name
APsSelection.label = label
