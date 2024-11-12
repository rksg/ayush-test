import { nodeTypes }         from '@acx-ui/analytics/utils'
import { getIntl, NodeType } from '@acx-ui/utils'

import { Node } from '.'

export const searchTree = (node: Node, searchText: string, path: Node[] = []): Node[] => {
  let results: Node[] = []
  try {
    if (
      node?.name?.toLowerCase().match(searchText) ||
      node?.mac?.toLowerCase().match(searchText)
    ) {
      results.push({ ...node, path: [...path, node] })
    }
  } catch (e) {
    // ignore invalid regex error
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
  targetNode: Node,
  targetPath: Node[],
  currentPath: Node[] = []
): Node | null => {

  const isTargetTypeMatch = node.type?.toLowerCase() === targetNode.type?.toLowerCase()
  const isTargetNameMatch = (node.type === 'ap' || node.type === 'switch') ?
    (node.mac === targetNode.name) : (node.name === targetNode.name)
  const isPathMatch = currentPath.length === (targetPath.length -1) &&
                      currentPath.every((n, i) => n.name === targetPath[i].name)
  if (isTargetTypeMatch && isTargetNameMatch && isPathMatch) {
    return { ...node, path: [...currentPath, node] }
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      const result = findMatchingNode(child, targetNode, targetPath, [...currentPath, node])
      if (result) {
        return result
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
  } else if (type ==='ap') {
    return capitalizeFirstLetter(`${name} (${node.mac}) (${nodeTypes('ap')})`)
  } else if (type === 'switch') {
    return capitalizeFirstLetter(`${name} (${node.mac}) (${nodeTypes('switch')})`)
  } else {
    return capitalizeFirstLetter(`${name} (${nodeTypes(type as NodeType)})`)
  }
}
const capitalizeFirstLetter = (str : string) => {
  return str?.charAt?.(0)?.toUpperCase() + str?.slice(1)
}
