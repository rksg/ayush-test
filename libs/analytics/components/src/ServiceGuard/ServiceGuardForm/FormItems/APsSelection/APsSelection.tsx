import { useMemo } from 'react'

import { Form }                                     from 'antd'
import _                                            from 'lodash'
import moment                                       from 'moment-timezone'
import { FormattedMessage, defineMessage, useIntl } from 'react-intl'

import { getNetworkFilterData, useRecentNetworkFilterQuery, HierarchyNodeChild } from '@acx-ui/analytics/components'
import { meetVersionRequirements }                                               from '@acx-ui/analytics/utils'
import { Loader, StepsForm, useStepFormContext }                                 from '@acx-ui/components'
import { FilterListNode, DateRange }                                             from '@acx-ui/utils'

import { isAPListNodes, isNetworkNodes, ClientType as ClientTypeEnum } from '../../../types'
import { ClientType }                                                  from '../ClientType'

import { APsSelectionInput }  from './APsSelectionInput'
import { deviceRequirements } from './deviceRequirements'

import type { ServiceGuardFormDto, NetworkNodes, NetworkPaths } from '../../../types'
import type { NamePath }                                        from 'antd/lib/form/interface'

const name = ['configs', 0, 'networkPaths', 'networkNodes'] as const
const label = defineMessage({ defaultMessage: 'APs Selection' })

function useNetworkHierarchy () {
  const filter = useMemo(() => ({
    startDate: moment().subtract(1, 'day').format(),
    endDate: moment().format(),
    range: DateRange.last24Hours
  }), [])

  return useRecentNetworkFilterQuery(filter)
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
  const { form } = useStepFormContext<ServiceGuardFormDto>()
  const response = useNetworkHierarchy()
  const options = getNetworkFilterData(
    filterAPwithDeviceRequirements(response.data ?? [], form.getFieldValue(ClientType.fieldName)),
    {}, 'ap', false
  )

  return <Loader states={[response]} style={{ height: 'auto', minHeight: 346 }}>
    <Form.Item
      name={name as unknown as NamePath}
      rules={[{
        required: true,
        message: $t({ defaultMessage: 'Please select APs to test' })
      }]}
      children={<APsSelectionInput
        autoFocus
        placeholder={$t({ defaultMessage: 'Select Venues / APs to test' })}
        options={options}
      />}
    />
  </Loader>
}

APsSelection.fieldName = name
APsSelection.label = label

APsSelection.FieldSummary = function APsSelectionFieldSummary () {
  const { $t } = useIntl()
  const response = useNetworkHierarchy()
  const convert = (value: unknown) => {
    const paths = value as NetworkPaths

    const nodes = paths
      .filter(isNetworkNodes)
      .map(path => getHierarchyCount(path, response.data!))

    const aps = paths
      .filter(isAPListNodes)
      .map((path) => ({
        count: (path.at(-1)! as FilterListNode).list.length,
        name: hierarchyName(path.slice(0, -1) as NetworkNodes)
      }))

    const list = nodes
      .concat(aps)
      .map(item => <FormattedMessage
        key={item.name}
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

  function getHierarchyCount (
    path: NetworkNodes,
    hierarchies: Exclude<typeof response.data, undefined>
  ) {
    const matched = hierarchies
      .find(item => item.path.slice(1).some((node, i) => _.isEqual(path[i], node)))

    return {
      name: hierarchyName(path),
      count: matched!.aps!.length
    }
  }
}

function hierarchyName (nodes: NetworkNodes) {
  return nodes.map(node => node.name).join(' > ')
}
