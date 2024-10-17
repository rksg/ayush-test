import _                          from 'lodash'

import { FilterListNode, NetworkPath } from '@acx-ui/utils'

export type APListNodes = [...NetworkPath, FilterListNode]
export type NetworkNodes = NetworkPath
export type NetworkPaths = Array<APListNodes| NetworkNodes>

export function isAPListNodes (path: APListNodes | NetworkNodes): path is APListNodes {
  const last = path[path.length - 1]
  return _.has(last, 'list')
}

export function isNetworkNodes (path: APListNodes | NetworkNodes): path is NetworkNodes {
  const last = path[path.length - 1]
  return !_.has(last, 'list')
}
