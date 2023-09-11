import {
  DateFilter,
  NodesFilter,
  SSIDFilter
} from '../index'

export type AnalyticsFilter = DateFilter & { filter : NodesFilter & SSIDFilter } & { mac?: string }