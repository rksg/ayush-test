import React, { ReactNode, useContext } from 'react'

import { Buffer } from 'buffer'

import { useSearchParams } from 'react-router-dom'

import { useLocation }                                                                from '@acx-ui/react-router-dom'
import { DateFilterContext, getDateRangeFilter, DateFilter, pathFilter, NetworkPath } from '@acx-ui/utils'

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
  setNetworkPath: () => {}, // abstract, comsumer should wrap provider
  getNetworkFilter: () => ({ path: defaultNetworkPath })
} as const

export const AnalyticsFilterContext = React.createContext<AnalyticsFilterProps>(
  defaultAnalyticsFilter
)
export type AnalyticsFilter = DateFilter & { path: NetworkPath } & { filter? : pathFilter }

function getFilterObj (path : NetworkPath) {
  const pathLength = path.length
  switch(pathLength){
    case 0:
    case 1:
      return { networkNodes: [], switchNodes: [] }
    case 2:
      return {
        networkNodes: [path.slice(1)].map(([node]) => [{ type: 'zone', name: node.name }]),
        switchNodes: [path.slice(1)].map(([node]) => [{ type: 'switchGroup', name: node.name }])
      }
    default:
      if(path[1].type === 'zone')
        return {
          networkNodes: [path.slice(1)]
        }
      if(path[1].type === 'switchGroup')
        return {
          switchNodes: [path.slice(1)]
        }
      return { networkNodes: [], switchNodes: [] }
  }
}

export function useAnalyticsFilter () {
  const { getNetworkFilter, setNetworkPath } = useContext(AnalyticsFilterContext)
  const { path, raw } = getNetworkFilter()
  const { dateFilter } = useContext(DateFilterContext)
  const { range, startDate, endDate } = dateFilter

  return {
    filters: {
      path: defaultNetworkPath,
      ...getDateRangeFilter(range, startDate, endDate),
      filter: getFilterObj(path) as pathFilter
    } as const,
    setNetworkPath,
    raw
  }
}

export function AnalyticsFilterProvider (props: { children: ReactNode }) {
  const [search, setSearch] = useSearchParams()
  const { pathname } = useLocation()
  const sublocation = pathname.substring(pathname.lastIndexOf('/') + 1)
  const getNetworkFilter = () => {
    let networkFilter = search.has('analyticsNetworkFilter')
      ? JSON.parse(
        Buffer.from(search.get('analyticsNetworkFilter') as string, 'base64').toString('ascii')
      )
      : { path: [], raw: [] }
    const { path } = networkFilter
    if(sublocation === 'health' &&
    path.length &&
    path.length > 1 &&
    path[1]?.type === 'switchGroup'){
      networkFilter = { path: defaultNetworkPath, raw: [] }
    }
    return networkFilter
  }
  const setNetworkPath = (path: NetworkPath, raw: object) => {
    search.set(
      'analyticsNetworkFilter',
      Buffer.from(JSON.stringify({ path, raw })).toString('base64')
    )
    setSearch(search, { replace: true })
  }
  const { path } = getNetworkFilter()

  const providerValue = {
    path: path.length ? path : defaultNetworkPath,
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
