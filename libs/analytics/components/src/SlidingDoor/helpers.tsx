import { defaultNetworkPath, nodeTypes } from '@acx-ui/analytics/utils'
import { getIntl, NodeType }             from '@acx-ui/utils'

import { Node } from '.'

export const searchTree = (node: Node, searchText: string, path: Node[] = []): Node[] => {
  let results: Node[] = []
  if (
    node?.name?.toLowerCase().match(searchText) ||
    node?.mac?.toLowerCase().match(searchText)
  ) {
    results.push({ ...node, path: [...path, node] })
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      results = results.concat(searchTree(child, searchText, [...path, node]))
    }
  }
  return results
}
export const findMatchingNode = (
  node: Node,
  targetPath: Node[],
  currentPath: Node[] = defaultNetworkPath
): Node | null => {
  if (targetPath.length > 1 && Array.isArray(node.children)) {
    const { type, name } = targetPath[currentPath.length]
    for (const child of node.children) {
      if (
        child.type?.toLowerCase() === type?.toLowerCase() &&
        (child.type === 'ap' || child.type === 'switch' ? child.mac : child.name) === name
      ) {
        return currentPath.length === targetPath.length - 1
          ? { ...child, path: [...currentPath, child] }
          : findMatchingNode(child, targetPath, [...currentPath, child])
      }
    }
  }
  return null
}
export const customCapitalize = (node: Node) => {
  let { type, name } = node
  if (type === 'network') {
    const { $t } = getIntl()
    return $t({ defaultMessage: 'Entire Organization' })
  } else {
    return capitalizeFirstLetter(`${name} (${nodeTypes(type as NodeType)})`)
  }
}
const capitalizeFirstLetter = (str : string) => {
  return str?.charAt?.(0)?.toUpperCase() + str?.slice(1)
}