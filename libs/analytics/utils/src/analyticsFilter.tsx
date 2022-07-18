import React, { ReactNode, useContext } from 'react'

import { useDateFilter } from '@acx-ui/utils'

import { NetworkPath } from './constants'

interface AnalyticsFilterProps {
  path: Readonly<NetworkPath>
}

export const defaultAnalyticsFilter = {
  path: [{ type: 'network', name: 'Network' }] as NetworkPath
} as const

const AnalyticsFilterContext = React.createContext<AnalyticsFilterProps>(defaultAnalyticsFilter)

export type AnalyticsFilter = ReturnType<typeof useAnalyticsFilter>

export function useAnalyticsFilter () {
  const { ...filters } = useContext(AnalyticsFilterContext)
  const { startDate, endDate } = useDateFilter()
  return {
    ...filters,
    startDate,
    endDate
  } as const
}

export function AnalyticsFilterProvider (props: { children: ReactNode }) {
  // TODO:
  // Expose methods to change global filters
  return <AnalyticsFilterContext.Provider {...props} value={defaultAnalyticsFilter} />
}

