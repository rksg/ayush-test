import { ReactElement, createContext, useState } from 'react'

import { brushPeriod }              from '@acx-ui/components'
import { DateRange, defaultRanges } from '@acx-ui/utils'

export interface KPIFilterContextType {
  kpiFilter: string[],
  setKpiFilter: (key: string) => void
  applyKpiFilter: (keys: string[]) => void
}

export const KPIFilterContext = createContext<KPIFilterContextType>({} as KPIFilterContextType)
export function KPIFilterProvider (props: {
  children: ReactElement
}){
  const [kpiFilter, setKpiFilter] = useState<string[]>([])
  const context = {
    kpiFilter,
    setKpiFilter: (key: string) => setKpiFilter(kpiFilter.includes(key)
      ? kpiFilter.filter((kpiKey) => kpiKey !== key)
      : [...new Set([ ...kpiFilter, key ])]),
    applyKpiFilter: (keys: string[]) => setKpiFilter(keys)
  }
  return <KPIFilterContext.Provider value={context} children={props.children} />
}

export interface ConfigChangeContextType {
  dateRange: DateRange,
  setDateRange: (dateRange: DateRange) => void,
  timeRanges: moment.Moment[],
  kpiTimeRanges: number[][],
  setKpiTimeRanges: (kpiTimeRanges: number[][]) => void
}

export const ConfigChangeContext =
  createContext<ConfigChangeContextType>({} as ConfigChangeContextType)

export function ConfigChangeProvider (props: {
  children: ReactElement
} & Pick<ConfigChangeContextType, 'dateRange' | 'setDateRange'>) {
  const timeRanges = defaultRanges()[props.dateRange]!
  const [kpiTimeRanges, setKpiTimeRanges] = useState<number[][]>([
    [timeRanges[0].valueOf(), timeRanges[0].clone().add(brushPeriod, 'ms').valueOf()],
    [timeRanges[1].clone().subtract(brushPeriod, 'ms').valueOf(), timeRanges[1].valueOf()]
  ])

  const context = {
    dateRange: props.dateRange,
    timeRanges,
    setDateRange: props.setDateRange,
    kpiTimeRanges,
    setKpiTimeRanges
  }

  return <ConfigChangeContext.Provider
    value={context}
    children={<KPIFilterProvider children={props.children} />}
  />
}
