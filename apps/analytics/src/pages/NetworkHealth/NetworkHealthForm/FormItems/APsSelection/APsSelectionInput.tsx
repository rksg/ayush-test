import _ from 'lodash'

import { normalizeNodeType }         from '@acx-ui/analytics/utils'
import { FlattenCascader }           from '@acx-ui/components'
import { defaultNetworkPath }        from '@acx-ui/utils'
import type { APListNode, PathNode } from '@acx-ui/utils'

import { isAPListNodes, isNetworkNodes } from '../../../types'

import type { APListNodes, NetworkNodes, NetworkPaths } from '../../../types'
import type { CascaderProps }                           from 'antd'
import type { DefaultOptionType }                       from 'antd/lib/cascader'

const root = defaultNetworkPath[0]
const ap = (mac: string) => ({ type: 'AP', name: mac })

type APsSelectionInputProps = Omit<
  CascaderProps<DefaultOptionType>,
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
    showSearch={search}
    expandTrigger='hover'
    onChange={(value) => onChange?.(extractNetworkPaths(value as string[][]))}
  />
}

function join (nodes: JSX.Element[], joiner: string | JSX.Element) {
  return nodes.reduce((prev, curr) => <>{prev}{joiner}{curr}</>)
}

const search: APsSelectionInputProps['showSearch'] = {
  filter: (keyword: string, options: DefaultOptionType[]): boolean => {
    const item = options.at(-1)!
    const path = JSON.parse(String(item.value)).slice(1) as NetworkNodes
    return path
      .map(node => node.name)
      .concat(item.displayLabel)
      .map(name => name.toLowerCase())
      .some(name => name.includes(keyword.toLowerCase()))
  },
  render: (keyword: string, options: DefaultOptionType[]) => {
    const item = options.at(-1)!
    const nodes = JSON.parse(String(item.value))
      // remove last node as its name is MAC address
      .slice(1, -1) as NetworkNodes

    const chunks = nodes
      .map(node => <span>{node.name}</span>)
      .concat(<span>{item.displayLabel}</span>)

    return join(chunks, ' > ')
  }
}

function extractNetworkPaths (values: string[][]) {
  const paths = values.map(value => JSON.parse(value.at(-1)!).slice(1) as NetworkNodes)

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
    .map(([node, aps]) => ({ node: node as PathNode, aps: aps as APListNode }))
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
  const allOptions = extractOptionsValue({ children: options } as DefaultOptionType)

  return values
    // exclude orphan nodes
    .filter(value => allOptions.some(option => _.isEqual(value, option)))
}

function extractOptionsValue (
  node: DefaultOptionType,
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
