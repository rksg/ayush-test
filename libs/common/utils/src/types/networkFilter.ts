export type NodeType = 'network'
  | 'apGroupName'
  | 'apGroup'
  | 'zoneName'
  | 'zone'
  | 'switchGroup'
  | 'switch'
  | 'apMac'
  | 'ap'
  | 'AP'

export interface PathNode {
  type: NodeType
  name: string
}

export interface NetworkPath extends Array<PathNode> {}

export type NetworkNode = {
  type: Omit<NodeType,'network'>
  name: string
}
export type NetworkNodePath = NetworkNode[] | []

export type pathFilter = {
  networkNodes? : NetworkPath[],
  switchNodes? : NetworkPath[]
}
