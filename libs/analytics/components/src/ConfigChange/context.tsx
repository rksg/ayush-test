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
  setInitialZoom: Dispatch<SetStateAction<{ start: number, end: number } | undefined>>,
  sorter: string
  setSorter: Dispatch<SetStateAction<string>>,
  reset: () => void
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

  const showIntentAI = [
    useIsSplitOn(Features.INTENT_AI_CONFIG_CHANGE_TOGGLE),
    useIsSplitOn(Features.RUCKUS_AI_INTENT_AI_CONFIG_CHANGE_TOGGLE)
  ].some(Boolean)

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
  // TODO: remove dotSelect when removing Features.CONFIG_CHANGE_PAGINATION
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
      setPagination({
        ...pagination,
        current: Math.ceil((index + 1) / pagination.pageSize)
      })
    }
    else  {
      setPagination({
        ...pagination,
        current: Math.ceil((params.filterId! + 1) / pagination.pageSize)
      })
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

  const reset = () => {
    setSelected(null)
    setDotSelect(null)
    setPagination(CONFIG_CHANGE_DEFAULT_PAGINATION)
  }

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

  const legendList = getConfigChangeEntityTypeMapping(showIntentAI)
  const [entityNameSearch, setEntityNameSearch] = useState<string>('')
  const [entityTypeFilter, setEntityTypeFilter] = useState<string[]>([])
  const [legendFilter, setLegendFilter] = useState<string[]>(legendList.map(item => item.key))
  const filterByContext = {
    legendFilter,
    applyLegendFilter: (legend: Record<string, boolean>) => {
      isPaged && reset()
      setLegendFilter(Object.keys(legend)
        .filter(key => legend[key])
        .map(key => legendList.find(item => item.label === key)!.key)
      )
    },
    entityNameSearch, setEntityNameSearch,
    entityTypeFilter, setEntityTypeFilter
  }

  const context = {
    ...timeRangeContext,
    ...kpiFilterContext,
    ...filterByContext,
    ...paginationContext,
    ...actionContext,
    reset
  }

  return <ConfigChangeContext.Provider
    value={context}
    children={props.children}
  />
}
