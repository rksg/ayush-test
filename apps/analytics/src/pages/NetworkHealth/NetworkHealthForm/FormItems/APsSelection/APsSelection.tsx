import { useMemo } from 'react'

import { Form }                                     from 'antd'
import { DefaultOptionType }                        from 'antd/lib/cascader'
import _                                            from 'lodash'
import moment                                       from 'moment-timezone'
import { FormattedMessage, defineMessage, useIntl } from 'react-intl'

import { getNetworkFilterData, useNetworkFilterQuery } from '@acx-ui/analytics/components'
import { Loader, StepsFormNew }                        from '@acx-ui/components'
import { APListNode, DateRange }                       from '@acx-ui/utils'

import * as contents                     from '../../../contents'
import { isAPListNodes, isNetworkNodes } from '../../../types'

import { APsSelectionInput } from './APsSelectionInput'

import type { NetworkNodes, NetworkPaths } from '../../../types'
import type { NamePath }                   from 'antd/lib/form/interface'

const name = ['networkPaths', 'networkNodes'] as const
const label = defineMessage({ defaultMessage: 'APs Selection' })

function useNetworkHierarchy () {
  const filter = useMemo(() => ({
    startDate: moment().subtract(1, 'day').format(),
    endDate: moment().format(),
    range: DateRange.last24Hours
  }), [])

  return useNetworkFilterQuery(filter)
}

export function APsSelection () {
  const { $t } = useIntl()
  const response = useNetworkHierarchy()
  const options = getNetworkFilterData(response.data ?? [], {}, 'ap')

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
        options={options as DefaultOptionType[]}
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
        count: (path.at(-1)! as APListNode).list.length,
        name: hierarchyName(path.slice(0, -1) as NetworkNodes)
      }))

    const list = nodes
      .concat(aps)
      .map(item => <FormattedMessage
        key={item.name}
        defaultMessage='<li>{name} — {count} {count, plural, one {AP} other {APs}}</li>'
        values={{ ...contents.formatValues, ...item }}
      />)

    return <ul>{list}</ul>
  }

  return <Loader states={[response]} style={{ height: 'auto' }}>
    <Form.Item
      name={name as unknown as NamePath}
      label={$t(label)}
      children={<StepsFormNew.FieldSummary convert={convert} />}
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
