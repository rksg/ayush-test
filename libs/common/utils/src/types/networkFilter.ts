// path stored in URL (for now) and used for single path in api, like thresholds
export type NodeType = 'network'
  | 'apGroupName'
  | 'apGroup'
  | 'zoneName'
  | 'zone'
  | 'switchGroup'
  | 'apMac'
  | 'ap'
  | 'AP'
  | 'switch'
export type PathNode = {
  type: NodeType
  name: string
}
export type NetworkPath = PathNode[]

// filter sent to data api (xNodes + SSIDs)
type FilterNameNode = {
  type: 'zone' | 'switchGroup'
  name: string
}
export type FilterListNode = {
  type: 'apMac' | 'switch'
  list: string[]
}
export type NodeFilter = (FilterNameNode | FilterListNode)[]
export type NodesFilter = {
  networkNodes?: NodeFilter[],
  switchNodes?: NodeFilter[]
}
export type SSIDFilter = {
  ssids? : string[]
}
