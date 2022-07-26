export interface PathNode {
  type: string
  name?: string
}

export interface NetworkPath extends Array<PathNode> {}
