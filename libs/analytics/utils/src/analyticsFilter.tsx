import React, { ReactNode, useContext } from 'react'

import { Buffer } from 'buffer'

import { useSearchParams } from 'react-router-dom'

import { useLocation }                                                                          from '@acx-ui/react-router-dom'
import { DateFilterContext, getDateRangeFilter, DateFilter, pathFilter, NetworkPath, NodeType } from '@acx-ui/utils'

interface AnalyticsFilterProps {
  path: NetworkPath
  raw?: object
  setNetworkPath: CallableFunction
  getNetworkFilter: CallableFunction
}
export const defaultNetworkPath: NetworkPath = [{ type: 'network', name: 'Network' }]

export const defaultAnalyticsFilter = {
  path: defaultNetworkPath,
  raw: [],
  setNetworkPath: () => {}, // abstract, consumer should wrap provider
  getNetworkFilter: () => ({ networkFilter: { path: defaultNetworkPath }, raw: [] })
} as const

export const AnalyticsFilterContext = React.createContext<AnalyticsFilterProps>(
  defaultAnalyticsFilter
)
export type AnalyticsFilter = DateFilter & { path: NetworkPath } & { filter? : pathFilter }

export function useAnalyticsFilter () {
  const { getNetworkFilter, setNetworkPath } = useContext(AnalyticsFilterContext)
  const { networkFilter, raw } = getNetworkFilter()
  const { dateFilter } = useContext(DateFilterContext)
  const { range, startDate, endDate } = dateFilter
  return {
    filters: {
      ...getDateRangeFilter(range, startDate, endDate),
      ...networkFilter
    } as AnalyticsFilter,
    setNetworkPath,
    getNetworkFilter,
    raw
  }
}

export function AnalyticsFilterProvider (props: { children: ReactNode }) {
  const [search, setSearch] = useSearchParams()
  const { pathname } = useLocation()
  const isHealthPage = pathname.includes('/analytics/health')
  const getNetworkFilter = () => {
    let networkFilter = search.has('analyticsNetworkFilter')
      ? JSON.parse(
        Buffer.from(search.get('analyticsNetworkFilter') as string, 'base64').toString('ascii')
      )
      : { path: defaultNetworkPath, raw: [] }
    const { path: currentPath, raw: rawVal } = networkFilter
    let path, filter, raw
    if (isHealthPage) {
      if (currentPath.some(({ type }: { type: NodeType }) => type === 'switchGroup')) {
        path = defaultNetworkPath
        raw = []
      } else {
        path = currentPath
        raw = rawVal
      }
    } else { // incident page, ...
      if (currentPath.length === 2) { // venues
        filter = {
          networkNodes: [currentPath.slice(1)]
            .map(([node]) => [{ type: 'zone', name: node.name }]),
          switchNodes: [currentPath.slice(1)]
            .map(([node]) => [{ type: 'switchGroup', name: node.name }])
        } as pathFilter
        path = defaultNetworkPath
      } else {
        path = currentPath
      }
      raw = rawVal
    }
    return { networkFilter: { filter, path }, raw }
  }
  const setNetworkPath = (path: NetworkPath, raw: object) => {
    search.set(
      'analyticsNetworkFilter',
      Buffer.from(JSON.stringify({ path, raw })).toString('base64')
    )
    setSearch(search, { replace: true })
  }
  const { networkFilter: { path } } = getNetworkFilter()
  const providerValue = {
    path: path,
    setNetworkPath,
    getNetworkFilter
  }
  return (
    <AnalyticsFilterContext.Provider
      {...props}
      value={providerValue}
    />
  )
}
