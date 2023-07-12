import _                   from 'lodash'
import { SingleValueType } from 'rc-cascader/lib/Cascader'

import { normalizeNodeType, defaultNetworkPath }  from '@acx-ui/analytics/utils'
import { FlattenCascader }                        from '@acx-ui/components'
import type { BaseCascaderProps, CascaderOption } from '@acx-ui/components'
import type { FilterListNode, PathNode }          from '@acx-ui/utils'

import { isAPListNodes, isNetworkNodes } from '../../../types'


import type { APListNodes, NetworkNodes, NetworkPaths } from '../../../types'

const root = defaultNetworkPath[0]
const ap = (mac: string) => ({ type: 'AP', name: mac })

type APsSelectionInputProps = Omit<
  BaseCascaderProps,
  'value' | 'onChange'
> & {
  value?: NetworkPaths
  onChange?: (value: NetworkPaths) => void
}

export function APsSelectionInput ({ value, onChange, ...props }: APsSelectionInputProps) {
  return <FlattenCascader
    {...props}
    multiple
    value={networkPathsToValue(props.options, value)}
    onChange={(values: SingleValueType | SingleValueType[]) =>
      onChange?.(extractNetworkPaths(values))
    }
  />
}

function extractNetworkPaths (values: SingleValueType | SingleValueType[]) {
  const paths = values.map(value => JSON.parse((value as string).at(-1)!).slice(1) as NetworkNodes)

  const aps: NetworkPaths = _(paths)
    .filter(path => normalizeNodeType(path.at(-1)!.type) === 'AP')
    .groupBy(([node]) => node.name)
    .map(paths => ([paths[0][0], {
      type: 'apMac',
      list: paths.map(path => path.at(-1)!.name)
    }]) as APListNodes)
    .value()
  const nodes: NetworkPaths = paths
    .filter(path => normalizeNodeType(path.at(-1)!.type) !== 'AP')

  return nodes.concat(aps)
}

function networkPathsToValue (
  options: APsSelectionInputProps['options'],
  value: APsSelectionInputProps['value']
): string[][] {
  if (!value) return []

  const aps = value.filter(isAPListNodes)
    .map(([node, aps]) => ({ node: node as PathNode, aps: aps as FilterListNode }))
    // explode APs list into AP paths
    .flatMap(({ node, aps }) => aps.list.map((mac) => [node, ap(mac)]))
    // explode paths into value
    .map(path => {
      const value = path.map((_, i) => JSON.stringify([root, ...path.slice(0, i + 1)]))
      return [
        ...value.slice(0, -1),
        `aps${path[0].name}`, // inject to match return type of `getFilterData`
        ...value.slice(-1)
      ]
    })

  const nodes = value.filter(isNetworkNodes)
    .map(path => path.map((_, i) => JSON.stringify([root, ...path.slice(0, i + 1)])))

  const values = nodes.concat(aps)
  const allOptions = extractOptionsValue({ children: options } as CascaderOption)

  return values
    // exclude orphan nodes
    .filter(value => allOptions.some(option => _.isEqual(value, option)))
}

function extractOptionsValue (
  node: CascaderOption,
  values: string[][] = []
) {
  if (!node.children?.length) return values
  const last = values.at(-1) ?? []
  for (const child of node.children) {
    values = [...values, [...last, String(child.value)]]
    values = extractOptionsValue(child, values)
  }
  return values
}
