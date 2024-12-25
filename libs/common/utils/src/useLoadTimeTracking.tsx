import { createContext, useContext, useEffect, useState, useRef } from 'react'

import { SerializedError }     from '@reduxjs/toolkit'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { FilterValue }         from 'antd/lib/table/interface'
import _                       from 'lodash'
import moment                  from 'moment-timezone'

import { AnalyticsFilter } from './types/analyticsFilter'

const PENDO_TRACK_EVENT_NAME = 'testPageloadtime'
const TIME_THRESHOLD_OF_COMPONENT = 10_000 //300_000
const LOAD_TIME = {
  NORMAL: 1_000,
  SLOW: 7_000
}

interface QueryState {
  isSuccess: boolean;
  isLoading?: boolean;
  isFetching?: boolean;
  error?: Error | SerializedError | FetchBaseQueryError;
  payload?: {
    filters?: unknown
    searchString?: string
  }
}

type LoadTimes = {
  [key: string]: {
    time: number,
    isUnfulfilled: boolean
  }
}

type TableFilter = {
  filterValues?: Record<string, FilterValue|null>|unknown,
  searchValue?: string|unknown,
  groupByValue?: string | undefined
}

type Filters = Partial<TableFilter> & Partial<AnalyticsFilter>

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
  TIMELINE = 'Timeline'
}

export const trackingItems = {
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
    WirelessClientsTable: 'WirelessClientsTable'
  },
  [TrackingPages.WIRED_CLIENTS]: {
    WiredClientsTable: 'WiredClientsTable'
  },
  [TrackingPages.VENUES]: {
    OVERVIEW: {
      VenueAlarmWidget: 'VenueAlarmWidget',
      IncidentBySeverity: 'IncidentBySeverity',
      VenueDevicesWidget: 'VenueDevicesWidget',
      VenueHealthWidget: 'VenueHealthWidget',
      FloorPlan: 'FloorPlan', ////TODO:should check
      AP_TABS: {
        TrafficByVolumeWidget: 'TrafficByVolumeWidget',
        NetworkHistory: 'NetworkHistory',
        ConnectedClientsOverTime: 'ConnectedClientsOverTime',
        TopApplicationsByTraffic: 'TopApplicationsByTraffic',
        TopSSIDsByTrafficWidget: 'TopSSIDsByTrafficWidget',
        TopSSIDsByClientWidget: 'TopSSIDsByClientWidget'
      },
      SWITCH_TABS: {
        SwitchesTrafficByVolume: 'SwitchesTrafficByVolume',
        TopSwitchesByPoEUsageWidget: 'TopSwitchesByPoEUsageWidget',
        TopSwitchesByTrafficWidget: 'TopSwitchesByTrafficWidget',
        TopSwitchesByErrorWidget: 'TopSwitchesByErrorWidget',
        TopSwitchModelsWidget: 'TopSwitchModelsWidget'
      }
    }
  },
  [TrackingPages.TIMELINE]: {
    EVENT: {
      EventTable: 'EventTable'
    }
  }
}

const getLoadTimeStatus = (time: number): string => {
  if (time < LOAD_TIME.NORMAL) return LoadTimeStatus.NORMAL
  if (time <= LOAD_TIME.SLOW) return LoadTimeStatus.SLOW
  return LoadTimeStatus.UNACCEPTABLE
}

const formatLoadTimes = (loadTimes: LoadTimes): string => {
  const result: string[] = []
  for (const [key, { time, isUnfulfilled }] of Object.entries(loadTimes)) {
    result.push(`${key}: ${time}${isUnfulfilled ? ' **' : ''}`)
  }
  return result.length ? result.join(', ') : ''
}

const getCurrentTime = () => {
  return Date.now() // performance.now()
}
const getLocalTime = () => {
  const localTimezone = moment.tz.guess()
  return moment().tz(localTimezone).format('YYYY-MM-DD HH:mm:ss')
}

const getPageType = (page: TrackingPages, subTab?: string) => {
  switch (page) {
    case TrackingPages.DASHBOARD:
      return 'Dashboard'
    case TrackingPages.VENUES:
      if (subTab === 'Overview') return 'Dashboard'
      return ''
    case TrackingPages.WIRELESS_CLIENTS:
    case TrackingPages.WIRED_CLIENTS:
    case TrackingPages.TIMELINE:
      return 'Table'
    default:
      return ''
  }
}

const getTrackingItemsCount = (
  page: TrackingPages, subTab?: string, hasFilters?: boolean
) => {
  const getItemsForPage = <T extends TrackingPages>(pageKey: T, subTab?: string) => {
    const activeTab = page === TrackingPages.DASHBOARD
      ? (localStorage.getItem('dashboard-tab') || 'ap')
      : (page === TrackingPages.VENUES ? (localStorage.getItem('venue-tab') || 'ap') : '')

    const getPageItems = () => {
      const pageItems = trackingItems[pageKey]
      if (!subTab) {
        return pageItems
      }
      if (subTab in pageItems) {
        return pageItems[subTab as keyof typeof pageItems]
      }
      return {}
    }

    const pageItems = getPageItems()

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
          ...result,
          [key]: pageItems[itemKey]
        }
      }
      return result
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, {} as Record<string, any>)
  }

  switch (page) {
    case TrackingPages.DASHBOARD:
    case TrackingPages.WIRELESS_CLIENTS:
    case TrackingPages.WIRED_CLIENTS:
    case TrackingPages.VENUES:
    case TrackingPages.TIMELINE:
      const items = getItemsForPage(page, subTab)
      const filteredItems = Object.keys(items).filter(key => {
        const item = items[key]
        return hasFilters ? item.hasFilter === true : true
      })
      return filteredItems.length
    default:
      return 0
  }
}

export const LoadTimeContext
  = createContext<LoadTimeContextType>({} as LoadTimeContextType)

export interface LoadTimeContextType {
  updateLoadTime: (name: string, time: number, isUnfulfilled: boolean) => void
  onPageFilterChange: (updatedFilter: Filters, isInit?: boolean) => void
  setSubTab: (name: string) => void
  pageLoadStart: number
  isFiltersChanged?: boolean
}

export const LoadTimeProvider = ({ page, children }: {
  page: TrackingPages, children: React.ReactNode, filters?: Filters
}) => {
  const isLoadTimeSet = useRef(false)
  const [subTab, setSubTab] = useState('')
  const [loadTimes, setLoadTimes] = useState<LoadTimes>({})
  const [isFiltersChanged, setisFiltersChanged] = useState(false)
  const [pageLoadStart, setPageLoadStart] = useState(getCurrentTime())
  const [pageFilters, setPageFilters] = useState({} as unknown as Filters)

  const updateLoadTime = (name: string, time: number, isUnfulfilled = false) => {
    setLoadTimes((prev) => ({ ...prev, [name]: { time, isUnfulfilled } }))
  }

  const onPageFilterChange = (updatedFilters: Filters, isInit?: boolean) => {
    const hasChanged = (
      (updatedFilters?.filterValues || updatedFilters?.searchValue || updatedFilters?.range) &&
      !_.isEqual(updatedFilters, pageFilters)
    )

    // eslint-disable-next-line no-console
    console.log('## onPageFilterChange:', isInit, hasChanged, isLoadTimeSet.current)
    if (isInit) {
      setPageFilters(updatedFilters)
    } else if (hasChanged && isLoadTimeSet.current) {
      // eslint-disable-next-line no-console, max-len
      console.log('=== filter changes & reset load time ===',
        getCurrentTime(), updatedFilters, pageFilters
      )
      setPageLoadStart(getCurrentTime())
      setPageFilters(updatedFilters)

      isLoadTimeSet.current = false
      setLoadTimes({})
      setisFiltersChanged(true)
    }
  }

  useEffect(() => {
    const trackingItemsCount = getTrackingItemsCount(page, subTab?.toUpperCase())
    const trackedCount = Object.keys(loadTimes).length
    const isLoadTimeUnset = !isLoadTimeSet.current
    const isAllItemTracked = trackedCount === trackingItemsCount

    // eslint-disable-next-line no-console
    console.log(isLoadTimeUnset , trackedCount, trackingItemsCount , isAllItemTracked)
    if (isLoadTimeUnset && trackingItemsCount && isAllItemTracked) {
      const { pendo } = window
      const totalLoadTime = getCurrentTime() - pageLoadStart
      const localtime = getLocalTime()
      const loadTimeStatus = getLoadTimeStatus(totalLoadTime)
      const trackEventData = {
        time: localtime,
        page_title: subTab ? `${page}-${subTab}` : page,
        page_type: getPageType(page),
        load_time_ms: totalLoadTime,
        load_time_text: getLoadTimeStatus(totalLoadTime),
        components_load_time_ms: formatLoadTimes(loadTimes),
        filters: pageFilters
      }

      // eslint-disable-next-line no-console
      console.log('All components loaded. Page load time:',
        totalLoadTime, 'ms', loadTimeStatus)
      // eslint-disable-next-line no-console
      console.log('*** ', trackEventData)

      setLoadTimes({})
      setisFiltersChanged(false)
      isLoadTimeSet.current = true

      if (pendo) {
        // eslint-disable-next-line no-console
        console.log('*** ', pendo)
        pendo.track(PENDO_TRACK_EVENT_NAME, trackEventData)
      }
    }
  }, [loadTimes])

  return (
    <LoadTimeContext.Provider value={{
      updateLoadTime, onPageFilterChange, setSubTab, pageLoadStart, isFiltersChanged
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
    updateLoadTime, onPageFilterChange, pageLoadStart, isFiltersChanged
  } = useContext(LoadTimeContext)

  const [startTime, setStartTime] = useState(null as unknown as number)
  const [endTime, setEndTime] = useState(null as unknown as number)
  const [isUnfulfilled, setIsUnfulfilled] = useState(false)

  const isMonitoringEnabled = !!updateLoadTime && isEnabled
  const status = states as QueryState[] ///
  const isLoading = Boolean(status?.some(state => state.isLoading))
  const isFetching = isFiltersChanged && Boolean(status?.some(state => state.isFetching))
  const isAllSuccess = Boolean(status?.every(state => state.isSuccess))
  const isAllFetchSuccess = isFiltersChanged && Boolean(status?.every(state => !state.isFetching))

  const pageQuery = (states?.length === 1 ? states[0] : null) as {
    payload?: {
      filters?: unknown
      searchString?: string
    }
  }

  useEffect(() => {
    if (!isStartTimeSet.current && isMonitoringEnabled) {
      setStartTime(getCurrentTime())
      isStartTimeSet.current = true
    }
    if (pageQuery?.payload && isMonitoringEnabled) {
      onPageFilterChange?.({
        filterValues: pageQuery?.payload?.filters,
        searchValue: pageQuery?.payload?.searchString ?? ''
      }, true)
    }
  }, [])

  useEffect(() => {
    if (pageQuery?.payload) {
      onPageFilterChange?.({
        filterValues: pageQuery.payload.filters,
        searchValue: pageQuery.payload.searchString ?? ''
      })
    }
  }, [pageQuery?.payload?.filters, pageQuery?.payload?.searchString])

  useEffect(() => {
    if (isFiltersChanged && isEndTimeSet.current && isMonitoringEnabled) {
      setStartTime(pageLoadStart)
      setEndTime(null as unknown as number)
      setIsUnfulfilled(false)
      isEndTimeSet.current = false
    }
  }, [isFiltersChanged])

  useEffect(() => {
    const currentTime = getCurrentTime()
    const start = isFetching ? pageLoadStart : startTime
    const loadDuration = currentTime - start
    const hasReachedThreshold = loadDuration > TIME_THRESHOLD_OF_COMPONENT
    const shouldSetEndTime = startTime && !isEndTimeSet.current && hasReachedThreshold

    if (shouldSetEndTime && isMonitoringEnabled) {
      setEndTime(currentTime)
      setIsUnfulfilled(true)
      isEndTimeSet.current = true
    }
  }, [isLoading, isFetching])

  useEffect(() => {
    const isSuccess = isAllSuccess || isAllFetchSuccess
    if (!isEndTimeSet.current && isSuccess && isMonitoringEnabled) {
      setEndTime(getCurrentTime())
      isEndTimeSet.current = true
    }
  }, [isAllSuccess, isAllFetchSuccess])

  useEffect(() => {
    if (startTime && endTime && isMonitoringEnabled) {
      const loadDuration = endTime - startTime
      updateLoadTime(itemName, loadDuration, isUnfulfilled)
    }
  }, [startTime, endTime, itemName])

}
