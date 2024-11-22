import { Dispatch, ReactElement, SetStateAction, createContext, useState } from 'react'

import {
  ConfigChange as ConfigChangeType,
  CONFIG_CHANGE_DEFAULT_PAGINATION,
  ConfigChangePaginationParams,
  brushPeriod,
  getConfigChangeEntityTypeMapping
}     from '@acx-ui/components'
import { get }                      from '@acx-ui/config'
import { Features, useIsSplitOn }   from '@acx-ui/feature-toggle'
import { DateRange, defaultRanges } from '@acx-ui/utils'

export interface ActionContextType {
  selected: ConfigChangeType | null
  setSelected: Dispatch<SetStateAction<ConfigChangeType | null>>
  dotSelect: number | null
  setDotSelect: Dispatch<SetStateAction<number | null>>
  onDotClick: (param: ConfigChangeType) => void
  onRowClick: (param: ConfigChangeType) => void
  chartZoom: { start: number, end: number } | undefined
  setChartZoom: Dispatch<SetStateAction<{ start: number, end: number } | undefined>>
  initialZoom: { start: number, end: number } | undefined
  setInitialZoom: Dispatch<SetStateAction<{ start: number, end: number } | undefined>>
}

export interface PaginationContextType {
  pagination: ConfigChangePaginationParams
  setPagination: Dispatch<SetStateAction<ConfigChangePaginationParams>>
  applyPagination: (params: Partial<ConfigChangePaginationParams>) => void
}

export interface FilterByContextType {
  entityTypeFilter: string[]
  setEntityTypeFilter: (list: string[]) => void
  legendFilter: string[]
  applyLegendFilter: (legend: Record<string, boolean>) => void
  entityNameSearch: string
  setEntityNameSearch: (name: string) => void
}

export interface KPIFilterContextType {
  kpiFilter: string[],
  setKpiFilter: (key: string) => void
  applyKpiFilter: (keys: string[]) => void
}

export interface TimeRangeContextType {
  dateRange: DateRange,
  timeRanges: moment.Moment[],
  kpiTimeRanges: number[][],
  setKpiTimeRanges: (kpiTimeRanges: number[][]) => void
}

export interface ConfigChangeContextType extends
  TimeRangeContextType, KPIFilterContextType, FilterByContextType, PaginationContextType,
  ActionContextType {}

export const ConfigChangeContext =
  createContext<ConfigChangeContextType>({} as ConfigChangeContextType)
export function ConfigChangeProvider (props: {
  children: ReactElement
} & Pick<ConfigChangeContextType, 'dateRange'>) {

  const isMLISA = get('IS_MLISA_SA')
  const isPagedConfigChange = useIsSplitOn(Features.CONFIG_CHANGE_PAGINATION)
  const isPaged = Boolean(isMLISA || isPagedConfigChange)

  const timeRanges = defaultRanges()[props.dateRange]!
  const [kpiTimeRanges, setKpiTimeRanges] = useState<number[][]>([
    [timeRanges[0].valueOf(), timeRanges[0].clone().add(brushPeriod, 'ms').valueOf()],
    [timeRanges[1].clone().subtract(brushPeriod, 'ms').valueOf(), timeRanges[1].valueOf()]
  ])
  const timeRangeContext = {
    dateRange: props.dateRange,
    timeRanges,
    kpiTimeRanges,
    setKpiTimeRanges
  }

  const [kpiFilter, setKpiFilter] = useState<string[]>([])
  const kpiFilterContext = {
    kpiFilter,
    setKpiFilter: (key: string) => setKpiFilter(kpiFilter.includes(key)
      ? kpiFilter.filter((kpiKey) => kpiKey !== key)
      : [...new Set([ ...kpiFilter, key ])]),
    applyKpiFilter: (keys: string[]) => setKpiFilter(keys)
  }

  const legendList = getConfigChangeEntityTypeMapping()
  const [entityNameSearch, setEntityNameSearch] = useState<string>('')
  const [entityTypeFilter, setEntityTypeFilter] = useState<string[]>([])
  const [legendFilter, setLegendFilter] = useState<string[]>(legendList.map(item => item.key))
  const filterByContext = {
    legendFilter,
    applyLegendFilter: (legend: Record<string, boolean>) => {
      setLegendFilter(Object.keys(legend)
        .filter(key => legend[key])
        .map(key => legendList.find(item => item.label === key)!.key)
      )
    },
    entityNameSearch, setEntityNameSearch,
    entityTypeFilter, setEntityTypeFilter
  }

  const [pagination, setPagination] = useState<
    ConfigChangePaginationParams
  >(CONFIG_CHANGE_DEFAULT_PAGINATION)
  const paginationContext = {
    pagination, setPagination,
    applyPagination: (params: Partial<ConfigChangePaginationParams>) => {
      setPagination({ ...pagination, ...params })
    }
  }

  const [selected, setSelected] = useState<ConfigChangeType | null >(null)
  const [dotSelect, setDotSelect] = useState<number | null>(null)
  const [chartZoom, setChartZoom] = useState<{ start: number, end: number } | undefined>(undefined)
  const [initialZoom, setInitialZoom] = useState<{
    start: number, end: number } | undefined>(undefined)
  const onDotClick = (params: ConfigChangeType) => {
    setSelected(params)
    setDotSelect(selected?.id ?? null)

    if(isPaged) {
      setPagination(prevPagination => {
        return {
          ...prevPagination,
          current: Math.ceil((params.id! + 1) / prevPagination.pageSize)
        }
      })
    }
    else  {
      setPagination((prevPagination) => ({
        ...prevPagination,
        current: Math.ceil((params.filterId! + 1) / prevPagination.pageSize)
      }))
    }
  }
  const onRowClick = (params: ConfigChangeType) => {
    setSelected(params)
    setChartZoom(initialZoom)
  }
  const actionContext = {
    selected, setSelected,
    dotSelect, setDotSelect,
    onDotClick, onRowClick,
    chartZoom, setChartZoom,
    initialZoom, setInitialZoom
  }

  const context = {
    ...timeRangeContext,
    ...kpiFilterContext,
    ...filterByContext,
    ...paginationContext,
    ...actionContext
  }

  return <ConfigChangeContext.Provider
    value={context}
    children={props.children}
  />
}
