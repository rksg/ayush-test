import { Dispatch, ReactElement, SetStateAction, createContext, useEffect, useState } from 'react'

import {
  ConfigChange as ConfigChangeType,
  CONFIG_CHANGE_DEFAULT_PAGINATION,
  ConfigChangePaginationParams,
  brushPeriod,
  getConfigChangeEntityTypeMapping
}     from '@acx-ui/components'
import { Features, useIsSplitOn }   from '@acx-ui/feature-toggle'
import { DateRange, defaultRanges } from '@acx-ui/utils'

import { SORTER_ABBR } from './services'

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
  sorter: string
  setSorter: Dispatch<SetStateAction<string>>
  resetFilter: () => void
}

export interface PaginationContextType {
  pagination: ConfigChangePaginationParams
  setPagination: Dispatch<SetStateAction<ConfigChangePaginationParams>>
  applyPagination: (params: Partial<ConfigChangePaginationParams>) => void
}

export interface FilterByContextType {
  entityList: { key: string, label: string }[]
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
  const showIntentAI = [
    useIsSplitOn(Features.INTENT_AI_CONFIG_CHANGE_TOGGLE),
    useIsSplitOn(Features.RUCKUS_AI_INTENT_AI_CONFIG_CHANGE_TOGGLE)
  ].some(Boolean)
  const isPaged = showIntentAI

  const [pagination, setPagination] = useState<
    ConfigChangePaginationParams
  >(CONFIG_CHANGE_DEFAULT_PAGINATION)
  const paginationContext = {
    pagination, setPagination,
    applyPagination: (params: Partial<ConfigChangePaginationParams>) => {
      setPagination(preState => ({ ...preState, ...params }))
    }
  }

  const [selected, setSelected] = useState<ConfigChangeType | null >(null)
  // TODO: remove dotSelect when removing INTENT_AI_CONFIG_CHANGE_TOGGLE and RUCKUS_AI_INTENT_AI_CONFIG_CHANGE_TOGGLE
  const [dotSelect, setDotSelect] = useState<number | null>(null)
  const [chartZoom, setChartZoom] = useState<{ start: number, end: number } | undefined>(undefined)
  const [initialZoom, setInitialZoom] = useState<{
    start: number, end: number } | undefined>(undefined)
  const [ sorter, setSorter ] = useState<string>(SORTER_ABBR.DESC)
  const onDotClick = (params: ConfigChangeType) => {
    setSelected(params)
    setDotSelect(params?.id ?? null)
    if(isPaged) {
      const index = sorter === SORTER_ABBR.DESC ? params.id! : pagination.total - params.id! -1
      setPagination(preState => ({
        ...preState,
        current: Math.ceil((index + 1) / preState.pageSize)
      }))
    }
    else  {
      setPagination(preState => ({
        ...preState,
        current: Math.ceil((params.filterId! + 1) / preState.pageSize)
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
    initialZoom, setInitialZoom,
    sorter, setSorter
  }

  const timeRanges = defaultRanges()[props.dateRange]!

  useEffect(() => {
    if (initialZoom !== undefined && chartZoom !== undefined) {
      const startDiff = initialZoom.start - chartZoom.start
      const endDiff = initialZoom.end - chartZoom.end
      if (startDiff !== 0 && startDiff === endDiff) {
        setChartZoom(initialZoom)
      }
    }
  }, [timeRanges])

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

  const entityList = getConfigChangeEntityTypeMapping(showIntentAI)
  const [entityNameSearch, setEntityNameSearch] = useState<string>('')
  const [entityTypeFilter, setEntityTypeFilter] = useState<string[]>([])
  // TODO: remove legendFilter when removing INTENT_AI_CONFIG_CHANGE_TOGGLE and RUCKUS_AI_INTENT_AI_CONFIG_CHANGE_TOGGLE
  const [legendFilter, setLegendFilter] = useState<string[]>(entityList.map(item => item.key))
  const filterByContext = {
    legendFilter,
    applyLegendFilter: (legend: Record<string, boolean>) =>
      setLegendFilter(Object.keys(legend)
        .filter(key => legend[key])
        .map(key => entityList.find(item => item.label === key)!.key)
      ),
    entityList,
    entityNameSearch, setEntityNameSearch,
    entityTypeFilter, setEntityTypeFilter
  }

  useEffect(()=>{
    setSelected(null)
    setDotSelect(null)
    setPagination({ ...pagination,
      current: CONFIG_CHANGE_DEFAULT_PAGINATION.current,
      pageSize: CONFIG_CHANGE_DEFAULT_PAGINATION.pageSize,
      defaultPageSize: CONFIG_CHANGE_DEFAULT_PAGINATION.defaultPageSize
    })
  }, [pagination.total])

  const resetFilter = () => {
    setEntityNameSearch('')
    setEntityTypeFilter([])
    setKpiFilter([])
  }

  const context = {
    ...timeRangeContext,
    ...kpiFilterContext,
    ...filterByContext,
    ...paginationContext,
    ...actionContext,
    resetFilter
  }

  return <ConfigChangeContext.Provider
    value={context}
    children={props.children}
  />
}
