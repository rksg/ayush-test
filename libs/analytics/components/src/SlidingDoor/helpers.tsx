import { nodeTypes }         from '@acx-ui/analytics/utils'
import { getIntl, NodeType } from '@acx-ui/utils'

import { Node } from '.'

export const searchTree = (node: Node, searchText: string, path: Node[] = []): Node[] => {
  let results: Node[] = []
  if (
    node?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    node?.mac?.toLowerCase().includes(searchText.toLowerCase())
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
  targetNode: Node | null | undefined,
  path: Node[] = []
): Node | null => {
  if (!targetNode) return null
  if (node.type === targetNode.type && (
    node.type === 'ap' || node.type === 'switch'
      ? node.mac === targetNode.list?.[0]
      : node.name === targetNode.name
  )) {
    return { ...node, path: [...path, node] }
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      const result = findMatchingNode(child, targetNode, [...path, node])
      if (result) {
        return result
      }
    }
  }
  return null
}
export const customCapitalize = (node?: Node | null) => {
  if (!node) return ''
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