import { createContext, useContext, useEffect, useState, useRef } from 'react'

import { SerializedError }     from '@reduxjs/toolkit'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { FilterValue }         from 'antd/lib/table/interface'
import _                       from 'lodash'
import moment                  from 'moment-timezone'
import { useLocation }         from 'react-router-dom'

import { AnalyticsFilter } from './types/analyticsFilter'

const PENDO_TRACK_EVENT_NAME = 'testPageloadtime' // 'pageloadtime'
const COMPONENT_LOAD_TIME_THRESHOLD = 300_000
const LOAD_TIME = { NORMAL: 1_000, SLOW: 7_000 }

interface QueryState {
  isSuccess: boolean
  isLoading?: boolean
  isFetching?: boolean
  isError?: boolean
  error?: Error | SerializedError | FetchBaseQueryError
}

type LoadTimes = {
  [key: string]: {
    time: number,
    startTime: number,
    isUnfulfilled: boolean
  }
}

type TableFilter = {
  filterValues?: Record<string, FilterValue|null>|unknown
  searchValue?: string|unknown
  groupByValue?: string | undefined
  groupId?: string
  keyword?: string
}

type Filters = Partial<TableFilter> & Partial<AnalyticsFilter>

type RouteConfig = { [key: string]: string | RouteConfig }
type FlattenedRoute = {
  key: string;
  subTab: string;
  isRegex: boolean;
}
type FlattenedRoutes = { [path: string]: FlattenedRoute }

enum LoadTimeStatus {
  NORMAL = 'Normal',
  SLOW = 'Slow',
  UNACCEPTABLE = 'Unacceptable'
}

export enum TrackingPages {
  DASHBOARD = 'Dashboard',
  WIRELESS_CLIENTS = 'Wireless Clients List',
  WIRED_CLIENTS = 'Wired Clients List',
  VENUES = 'Venues',
  TIMELINE = 'Timeline',
  // TODO: P2 pages
  AP = 'Access Points',
  NETWORKS = 'Wi-Fi Networks',
  IDENTITY = 'Identity Management',
  AI = 'AI Analytics'
}

export const pageRoutes = {
  DASHBOARD: 'dashboard',
  WIRELESS_CLIENTS: {
    CLIENTS: 'users/wifi/clients'
  },
  WIRED_CLIENTS: 'users/switch/clients',
  VENUES: {
    OVERVIEW: '^venues/([^/]+)/venue-details/overview$',
    TEST: '^venues/([^/]+)/venue-details/test$'
  },
  TIMELINE: {
    EVENTS: 'timeline/events'
  },
  // TODO: P2 pages
  AP: {
    LIST: 'devices/wifi',
    GROUP_LIST: 'devices/wifi/apgroups'
  },
  NETWORKS: {
    LIST: 'networks/wireless'
  },
  IDENTITY: {
    GROUP_LIST: 'users/identity-management/identity-group',
    LIST: 'users/identity-management/identity'
  },
  AI: {
    INCIDENTS: 'analytics/incidents',
    INTENT_AI: 'analytics/intentAI'
  }
}

export const pageWidgets = {
  [TrackingPages.DASHBOARD]: {
    ORGANIZATION_DROPDOWN: 'VenueFilter',
    ALARMS: 'AlarmWidgetV2',
    INCIDENTS: 'IncidentsDashboardv2',
    CLIENT_EXPERIENCE: 'ClientExperience',
    DID_YOU_KNOW: 'DidYouKnowWidget',
    VENUES: 'Venues',
    DEVICES: 'Devices',
    CLIENTS: 'Clients',
    AP_TABS: {
      TRAFFIC_BY_VOLUME: 'TrafficByVolumeWidget',
      CONNECTED_CLIENTS_OVER_TIME: 'ConnectedClientsOverTime',
      TOP_WIFI_NETWORKS: 'TopWiFiNetworks',
      TOP_APPLICATIONS_BY_TRAFFIC: 'TopAppsByTraffic'
    },
    SWITCH_TABS: {
      TRAFFIC_BY_VOLUME: 'TrafficByVolumeWidget',
      TOP_SWITCHES_BY_POE_USAGE: 'TrafficByVolumeWidget',
      TOP_SWITCHES_BY_TRAFFIC: 'TopSwitchesByTrafficWidget',
      TOP_SWITCHES_BY_ERROR: 'TopSwitchesByErrorWidget',
      TOP_SWITCH_MODELS: 'TopSwitchModelsWidget'
    },
    EDGE_TABS: {
      TOP_5_RUCKUS_EDGES_BY_TRAFFIC: 'TopEdgesByTrafficWidget',
      TOP_5_RUCKUS_EDGES_BY_RESOURCE_UTILIZATION: 'TopEdgesByResourcesWidget'
    },
    MAP: 'ActualMapV2'
  },
  [TrackingPages.WIRELESS_CLIENTS]: {
    CLIENTS: {
      WIRELESS_CLIENTS_TABLE: 'WirelessClientsTable'
    }
  },
  [TrackingPages.WIRED_CLIENTS]: {
    WIRED_CLIENTS_TABLE: 'WiredClientsTable'
  },
  [TrackingPages.VENUES]: {
    OVERVIEW: {
      VenueAlarmWidget: 'VenueAlarmWidget',
      IncidentBySeverity: 'IncidentBySeverity',
      VenueDevicesWidget: 'VenueDevicesWidget',
      VenueHealthWidget: 'VenueHealthWidget',
      FloorPlan: 'FloorPlan',
      AP_TABS: {
        TRAFFIC_BY_VOLUME: 'TrafficByVolumeWidget',
        NetworkHistory: 'NetworkHistory',
        CONNECTED_CLIENTS_OVER_TIME: 'ConnectedClientsOverTime',
        TopApplicationsByTraffic: 'TopApplicationsByTraffic',
        TopSSIDsByTrafficWidget: 'TopSSIDsByTrafficWidget',
        TopSSIDsByClientWidget: 'TopSSIDsByClientWidget'
      },
      SWITCH_TABS: {
        SwitchesTrafficByVolume: 'SwitchesTrafficByVolume',
        TopSwitchesByPoEUsageWidget: 'TopSwitchesByPoEUsageWidget',
        TOP_SWITCHES_BY_TRAFFIC: 'TopSwitchesByTrafficWidget',
        TOP_SWITCHES_BY_ERROR: 'TopSwitchesByErrorWidget',
        TOP_SWITCH_MODELS: 'TopSwitchModelsWidget'
      }
    }
  },
  [TrackingPages.TIMELINE]: {
    EVENTS: {
      EventTable: 'EventTable'
    }
  },
  //  TODO: P2 pages
  [TrackingPages.AP]: {
    LIST: {
      LIST: 'APTable'
    },
    GROUP_LIST: {
      GROUP_LIST: 'APGroupTable'
    }
  },
  [TrackingPages.NETWORKS]: {
    LIST: {
      NetworkTable: 'NetworkTable'
    }
  },
  [TrackingPages.IDENTITY]: {
    GROUP_LIST: {
      IdentityGuoupTable: 'IdentityGuoupTable'
    },
    LIST: {
      IdentityTable: 'IdentityTable'
    }
  },
  [TrackingPages.AI]: {
    INCIDENTS: {
      //TODO
      IncidentBySeverity: 'IncidentBySeverity',
      IncidentBySeverityBarChart: 'IncidentBySeverityBarChart',
      NetworkHistory: 'NetworkHistory',
      IncidentTable: 'IncidentTable'
    },
    INTENT_AI: {
      IntentAITable: 'IntentAITable'
    }
  }
}

export const getLoadTimeStatus = (time: number): string => {
  if (time < LOAD_TIME.NORMAL) return LoadTimeStatus.NORMAL
  if (time <= LOAD_TIME.SLOW) return LoadTimeStatus.SLOW
  return LoadTimeStatus.UNACCEPTABLE
}

const isRouteMatched = (
  routeKey: string, routeInfo: FlattenedRoute, currentPath: string
) => {
  if (routeInfo.isRegex) {
    const regex = new RegExp(routeKey)
    return regex.test(currentPath)
  }
  return currentPath === routeKey
}

const isRouteSupported = (routes: FlattenedRoutes, currentPath: string) => {
  for (const [routeKey, routeInfo] of Object.entries(routes)) {
    if (isRouteMatched(routeKey, routeInfo, currentPath)) {
      return true
    }
  }
  return false
}

const getRouteDetails = (routes: FlattenedRoutes, currentPath: string) => {
  for (const [routeKey, routeInfo] of Object.entries(routes)) {
    if (isRouteMatched(routeKey, routeInfo, currentPath)) {
      return routeInfo
    }
  }
  return null
}

const flattenRoutes = ( routes: RouteConfig, parentPath = '' ) => {
  const processNestedRoutes = (key: string, value: RouteConfig): FlattenedRoutes => {
    const nestedPath = parentPath ? `${parentPath}.${key}` : key
    return flattenRoutes(value, nestedPath)
  }

  return Object.entries(routes).reduce<FlattenedRoutes>((flatRoutes, [key, value]) => {
    if (typeof value === 'object') {
      const nestedRoutes = processNestedRoutes(key, value)
      return { ...flatRoutes, ...nestedRoutes }
    }

    const fullPath = value as string
    flatRoutes[fullPath] = {
      key: parentPath || key,
      subTab: parentPath ? key : '',
      isRegex: fullPath.startsWith('^')
    }

    return flatRoutes
  }, {})
}

const formatLoadTimes = (loadTimes: LoadTimes): string => {
  const result: string[] = []
  for (const [key, { time, isUnfulfilled }] of Object.entries(loadTimes)) {
    result.push(`${key}: ${time}${isUnfulfilled ? ' **' : ''}`)
  }
  return result.length ? result.join(', ') : ''
}

const getCurrentTime = () => Date.now()
const getLocalTime = () => {
  const localTimezone = moment.tz.guess()
  return moment().tz(localTimezone).format('YYYY-MM-DD HH:mm:ss')
}

const getMinStartItem = (loadTimes: LoadTimes) => {
  let minItem = null as unknown as {
    time: number,
    startTime: number,
    isUnfulfilled: boolean
  }
  for (const [, value] of Object.entries(loadTimes)) {
    if (minItem === null || value.startTime < minItem.startTime) {
      minItem = value
    }
  }
  return minItem
}

export const getPageLoadStartTime = (pageLoadStart: number, loadTimes: LoadTimes) => {
  const minStartTime = getMinStartItem(loadTimes)?.startTime
  if (minStartTime < pageLoadStart) return minStartTime
  return pageLoadStart
}

export const getPageType = (page: TrackingPages, subTab?: string) => {
  switch (page) {
    case TrackingPages.DASHBOARD:
      return 'Dashboard'
    case TrackingPages.VENUES:
      if (subTab === 'OVERVIEW') return 'Dashboard'
      return ''
    case TrackingPages.WIRELESS_CLIENTS:
    case TrackingPages.WIRED_CLIENTS:
    case TrackingPages.TIMELINE:
    case TrackingPages.AP:
    // case TrackingPages.IDENTITY:
      return 'Table'
    default:
      return ''
  }
}

const getPageActiveTab = (page: TrackingPages) => {
  if (page === TrackingPages.DASHBOARD) {
    return localStorage.getItem('dashboard-tab') || 'ap'
  } else if (page === TrackingPages.VENUES) {
    return localStorage.getItem('venue-tab') || 'ap'
  }
  return ''
}

const getPageWidgetsByTab = (pageKey: keyof typeof pageWidgets, subTab?: string) => {
  const pageItems = pageWidgets[pageKey]
  if (!subTab) {
    return pageItems
  }
  if (subTab in pageItems) {
    return pageItems[subTab as keyof typeof pageItems]
  }
  return {}
}

const getPageWidgets = <T extends TrackingPages>(pageKey: T, subTab?: string) => {
  const activeTab = getPageActiveTab(pageKey)
  const pageItems = getPageWidgetsByTab(pageKey, subTab)

  return Object.keys(pageItems).reduce((result, key) => {
    const itemKey = key as keyof typeof pageItems
    if (key.includes('TABS')) {
      if (key.includes(activeTab.toUpperCase())) {
        const tabItems = pageItems[itemKey]
        return {
          ...result,
          ...(typeof tabItems === 'object' ? tabItems : {})
        }
      }
    } else {
      return {
        ...result, [key]: pageItems[itemKey]
      }
    }
    return result
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }, {} as Record<string, any>)
}

export const getPageWidgetCount = (
  page: TrackingPages, subTab?: string, isPageRouteSupported?: boolean
) => {
  if (isPageRouteSupported) {
    const items = getPageWidgets(page, subTab)
    return Object.keys(items).length
  }
  return 0
}

export const LoadTimeContext
  = createContext<LoadTimeContextType>({} as LoadTimeContextType)

export interface LoadTimeContextType {
  updateLoadTime: (name: string, time: number, startTime: number, isUnfulfilled: boolean) => void
  onPageFilterChange: (updatedFilter: Filters, isInit?: boolean) => void
  pageLoadStart: number
  pageFilters: Filters
  isFiltersChanged: boolean
  isPageFilterInit: boolean
}

export const LoadTimeProvider = ({ children }: {
  page?: TrackingPages, children: React.ReactNode
}) => {
  const isLoadTimeSet = useRef(false)
  const isPageFilterInit = useRef(false)
  const [loadTimes, setLoadTimes] = useState<LoadTimes>({})
  const [isFiltersChanged, setisFiltersChanged] = useState(false)
  const [isPageRouteSupported, setIsPageRouteSupported] = useState(false)

  const [pageLoadStart, setPageLoadStart] = useState(getCurrentTime())
  const [pageFilters, setPageFilters] = useState(null as unknown as Filters)

  const resetLoadTime = () => {
    setPageLoadStart(getCurrentTime())
    setLoadTimes({})
    isLoadTimeSet.current = false
  }

  const updateLoadTime = (name: string, time: number, startTime: number, isUnfulfilled = false) => {
    setLoadTimes((prev) => ({ ...prev, [name]: { time, startTime, isUnfulfilled } }))
  }

  const onPageFilterChange = (updatedFilters: Filters, isInit?: boolean) => {
    const hasChanged = (
      (updatedFilters?.filterValues || updatedFilters?.searchValue || updatedFilters?.range) &&
      !_.isEqual(updatedFilters, pageFilters)
    )

    if (isInit && !isPageFilterInit.current) {
      setPageFilters(updatedFilters)
      isPageFilterInit.current = true
    } else if (hasChanged && isLoadTimeSet.current && isPageFilterInit.current) {
      setPageFilters(updatedFilters)
      setisFiltersChanged(true)
      resetLoadTime()
    }
  }

  const location = useLocation()
  const flatRoutes = flattenRoutes(pageRoutes)
  const pathname = location.pathname.split('/t/')?.[1] || location.pathname.split('/v/')?.[1]

  useEffect(() => {
    const isSupport = isRouteSupported(flatRoutes, pathname)
    setIsPageRouteSupported(isSupport)
    resetLoadTime()
    isPageFilterInit.current = false
  }, [pathname])

  useEffect(() => {
    const routeInfo = getRouteDetails(flatRoutes, pathname)
    const pageKey = routeInfo?.key
    const page = TrackingPages[pageKey as keyof typeof TrackingPages]

    const pageWidgetCount
      = getPageWidgetCount(page, routeInfo?.subTab, isPageRouteSupported)
    const trackedCount = Object.keys(loadTimes).length
    const isLoadTimeUnset = !isLoadTimeSet.current
    const isAllWidgetsTracked = trackedCount === pageWidgetCount

    // eslint-disable-next-line no-console
    console.log(isLoadTimeUnset, pageWidgetCount, isAllWidgetsTracked, isPageRouteSupported)
    if (isLoadTimeUnset && pageWidgetCount && isAllWidgetsTracked && isPageRouteSupported) {
      const { pendo } = window
      const totalLoadTime = getCurrentTime() - getPageLoadStartTime(pageLoadStart, loadTimes)
      const localtime = getLocalTime()
      const loadTimeStatus = getLoadTimeStatus(totalLoadTime)
      const trackEventData = {
        time: localtime,
        page_title: routeInfo?.subTab ? `${page} - ${routeInfo?.subTab?.toLowerCase()}` : page,
        page_type: getPageType(page, routeInfo?.subTab),
        load_time_ms: totalLoadTime,
        load_time_text: getLoadTimeStatus(totalLoadTime),
        components_load_time_ms: formatLoadTimes(loadTimes),
        filters: pageFilters ? JSON.stringify(pageFilters) : '',
        active_tab: getPageActiveTab(page)
      }

      // eslint-disable-next-line no-console, max-len
      console.log('All components loaded. Page load time:', totalLoadTime, 'ms',
        '\n', '** status: ', loadTimeStatus,
        '\n', '** event: ', trackEventData)

      setLoadTimes({})
      setisFiltersChanged(false)
      isLoadTimeSet.current = true

      if (pendo) {
        // eslint-disable-next-line no-console
        console.log('*** ', pendo)
        pendo.track?.(PENDO_TRACK_EVENT_NAME, trackEventData)
      }
    }
  }, [loadTimes])

  return (
    <LoadTimeContext.Provider value={{
      updateLoadTime, onPageFilterChange,
      pageLoadStart, pageFilters, isFiltersChanged, isPageFilterInit: isPageFilterInit.current
    }}>
      {children}
    </LoadTimeContext.Provider>
  )
}

export function useLoadTimeTracking ({ itemName, states, isEnabled }: {
  itemName: string,
  isEnabled: boolean,
  states: unknown[],
  pageRangeFilter?: {
    startDate?: string
    endDate?: string
    range?: string
  }
}) {
  const isStartTimeSet = useRef(false)
  const isEndTimeSet = useRef(false)
  const {
    updateLoadTime, onPageFilterChange, pageLoadStart, isFiltersChanged, isPageFilterInit
  } = useContext(LoadTimeContext)

  const [startTime, setStartTime] = useState(null as unknown as number)
  const [endTime, setEndTime] = useState(null as unknown as number)
  const [isUnfulfilled, setIsUnfulfilled] = useState(false)
  const [timerEnabled, setTimerEnabled] = useState(true)

  const status = states as QueryState[]
  const isError = Boolean(status?.some(state => state.isError))
  const isAllSuccess = Boolean(status?.every(state => state.isSuccess))
  const isAllFetchSuccess = isFiltersChanged && Boolean(status?.every(state => !state.isFetching))

  const pageQuery = (states?.length === 1 ? states[0] : null) as {
    payload?: {
      filters?: unknown
      searchString?: string
      groupId?: string
      keyword?: string
    }
  }

  const handleReachThreshold = () => {
    if (!isEndTimeSet.current && isEnabled) {
      setEndTime(getCurrentTime())
      setIsUnfulfilled(true)
      isEndTimeSet.current = true
    }
  }

  useEffect(() => {
    if (!isStartTimeSet.current && isEnabled) {
      setStartTime(getCurrentTime())
      isStartTimeSet.current = true
    }
  }, [])

  useEffect(() => {
    if (!isEnabled) return

    const timer = setTimeout(() => {
      handleReachThreshold()
    }, COMPONENT_LOAD_TIME_THRESHOLD)

    if (!timerEnabled) {
      clearTimeout(timer)
    }
    return () => clearTimeout(timer)

  }, [timerEnabled])

  // console.log(pageQuery?.payload)

  useEffect(() => {
    if (pageQuery?.payload && isPageFilterInit && isEnabled) {
      const { filters, searchString, groupId, keyword } = pageQuery.payload
      onPageFilterChange?.({
        filterValues: filters ?? {},
        searchValue: searchString ?? '',
        groupId: groupId ?? '',
        keyword: keyword ?? ''
        // ...( filters ? { filterValues: filters } : {} ),
        // ...( searchString ? { searchValue: searchString } : {}),
        // ...( groupId ? { groupId } : {} ),
        // ...( keyword ? { keyword } : {} ),
        // TODO
        // groupByValue: pageQuery?.payload?.groupId
      }, !isPageFilterInit)
    }
  }, [
    pageQuery?.payload?.filters, pageQuery?.payload?.searchString,
    pageQuery?.payload?.groupId, pageQuery?.payload?.keyword
  ])

  useEffect(() => {
    if (isFiltersChanged && isEndTimeSet.current && isEnabled) {
      setStartTime(pageLoadStart)
      setEndTime(null as unknown as number)
      setIsUnfulfilled(false)
      isEndTimeSet.current = false
    }
  }, [isFiltersChanged])

  useEffect(() => {
    if (startTime && !isEndTimeSet.current && isEnabled) {
      setEndTime(getCurrentTime())
      setIsUnfulfilled(true)
      setTimerEnabled(false)
      isEndTimeSet.current = true
    }
  }, [isError])

  useEffect(() => {
    const isSuccess = isAllSuccess || isAllFetchSuccess
    if (!isEndTimeSet.current && isSuccess && isEnabled) {
      setEndTime(getCurrentTime())
      setTimerEnabled(false)
      isEndTimeSet.current = true
    }
  }, [isAllSuccess, isAllFetchSuccess])

  useEffect(() => {
    if (startTime && endTime && isEnabled) {
      const loadDuration = endTime - startTime
      updateLoadTime?.(itemName, loadDuration, startTime, isUnfulfilled)
    }
  }, [startTime, endTime, itemName])

}
