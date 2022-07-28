import { PathNode, NetworkNodeTypeForDisplay } from '@acx-ui/analytics/utils'

export const formattedNodeName = (node: PathNode, sliceValue: string) =>
  ['ap', 'controller', 'switch'].includes(node.type.toLowerCase()) && sliceValue !== node.name
    ? `${sliceValue} (${node.name})`
    : node.name

export const formattedSliceType = (type: string) =>
  NetworkNodeTypeForDisplay[type as keyof typeof NetworkNodeTypeForDisplay] || type

export const formattedPath = (path: PathNode[], sliceValue: string) => path
  .map(node => `${formattedNodeName(node, sliceValue)} (${formattedSliceType(node.type)})`)
  .join('\n> ')

export const impactedArea = (path: PathNode[], sliceValue: string) => {
  const lastNode = path[path.length - 1]
  return lastNode
    ? formattedNodeName(lastNode, sliceValue)
    : sliceValue
}
