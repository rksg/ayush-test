import {
  DateFilter,
  NodesFilter,
  SSIDFilter,
  NetworkPath
} from '../index'

export type AnalyticsFilter = DateFilter & {
  filter: NodesFilter & SSIDFilter
  mac?: string
}

export type PathFilter = DateFilter & {
  path: NetworkPath
}
