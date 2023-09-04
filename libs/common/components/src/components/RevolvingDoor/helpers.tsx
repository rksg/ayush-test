import { capitalize } from 'lodash'

import { Node } from './'

export const searchTree = (node: Node, searchText: string, path: Node[] = []): Node[] => {
  let results: Node[] = []
  if (node?.name?.toLowerCase().includes(searchText.toLowerCase())) {
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
  if (targetNode && node.name === targetNode.name && node.type === targetNode.type) {
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
export const customCapitalize = (node?: Node | null ) => {
  if (!node) return ''

  const { type, name } = node

  if (type && type.toLowerCase() !== 'network') {
    return capitalize(`${type}(${name})`)
  } else {
    return capitalize(name)
  }
}