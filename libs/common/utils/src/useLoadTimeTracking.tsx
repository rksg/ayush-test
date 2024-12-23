import { createContext, useContext, useEffect, useState, useRef } from 'react'


import { SerializedError }     from '@reduxjs/toolkit'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import _                       from 'lodash'
import moment                  from 'moment-timezone'

// export const TRACKING_INTERVAL = 1800_000
// export const TIME_THRESHOLD_OF_PAGE = 1800_000
export const TIME_THRESHOLD_OF_COMPONENT = 10_000 //300_000

interface QueryState {
  isSuccess: boolean;
  isLoading?: boolean;
  isFetching?: boolean;
  error?: Error | SerializedError | FetchBaseQueryError;
}

type LoadTimes = {
  [key: string]: {
    time: number,
    isUnfulfilled: boolean
  }
}

type DateFilter = {
  range: string,
  startDate: string,
  endDate: string
}

enum LoadTimeStatus {
  NORMAL = 'Normal',
  SLOW = 'Slow',
  UNACCEPTABLE = 'Unacceptable'
}

export enum TrackingPages {
  DASHBOARD = 'Dashboard',
  WIRELESS_CLIENTS = 'Wireless Clients List',
  WIRED_CLIENTS = 'Wired Clients List',
  VENUE_DASHBOARD = 'Venue Dashboard',
  EVENTS = 'Events'
}

export const trackingItems = {
  [TrackingPages.DASHBOARD]: {
    ORGANIZATION_DROPDOWN: '',
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
  [TrackingPages.VENUE_DASHBOARD]: {
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
  },
  [TrackingPages.EVENTS]: {
    EventTable: 'EventTable'
  }
}

const getLoadTimeStatus = (time: number): string => {
  if (time < 1000) return LoadTimeStatus.NORMAL
  if (time <= 7000) return LoadTimeStatus.SLOW
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

export const getTrackingItemsCount = (page: TrackingPages, hasFilters?: boolean) => {
  const getItemsForPage = <T extends TrackingPages>(pageKey: T) => {
    const activeTab = page === TrackingPages.DASHBOARD
      ? (localStorage.getItem('dashboard-tab') || 'ap')
      : (page === TrackingPages.VENUE_DASHBOARD ? (localStorage.getItem('venue-tab') || 'ap') : '')
    const pageItems = trackingItems[pageKey]

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
    case TrackingPages.VENUE_DASHBOARD:
    case TrackingPages.EVENTS:
      const items = getItemsForPage(page)
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
  recordLoadTime: (name: string, time: number, isUnfulfilled: boolean) => void
  onChangeFilter: (filter: any) => void //(filter: DateFilter) => void
  currentFilters?: DateFilter
  pageLoadStart: number
  isFilterChanged?: boolean
}

export const LoadTimeProvider = ({ page, children, filters }: {
  page: TrackingPages, children: React.ReactNode, filters?: DateFilter
}) => {
  const isLoadTimeSet = useRef(false)
  const [pageLoadStart, setPageLoadStart] = useState(getCurrentTime())
  const [loadTimes, setLoadTimes] = useState<LoadTimes>({})
  const [currentFilters, setCurrentFilters] = useState({} as unknown as DateFilter)
  const [isFilterChanged, setIsFilterChanged] = useState(false)

  const recordLoadTime = (name: string, time: number, isUnfulfilled = false) => {
    setLoadTimes((prev) => ({ ...prev, [name]: { time, isUnfulfilled } }))
  }

  const onChangeFilter = (updatedFilter: DateFilter) => {
    // && !_.isEmpty(filters)
    const hasFiltersChanged
      = (!_.isEmpty((updatedFilter as any)?.filterValues)
      || !_.isEmpty((updatedFilter as any)?.searchValue)
      ) && !_.isEqual(updatedFilter, filters)

    console.log(hasFiltersChanged, isLoadTimeSet.current, updatedFilter, currentFilters, filters)
    if (hasFiltersChanged && isLoadTimeSet.current) {
      // eslint-disable-next-line no-console
      console.log('======== filter changes & reset load time ========', getCurrentTime())
      setPageLoadStart(getCurrentTime())
      setCurrentFilters(updatedFilter)
      isLoadTimeSet.current = false
      setLoadTimes({})
      setIsFilterChanged(true)
    }
  }

  useEffect(() => {
    setCurrentFilters({} as unknown as DateFilter)
    setLoadTimes({})
  }, [])

  useEffect(() => {
    // eslint-disable-next-line no-console, max-len
    console.log('loadTimes: ', loadTimes, page, getTrackingItemsCount(page), filters, currentFilters)
    const trackingItemsCount = getTrackingItemsCount(page)
    const trackedCount = Object.keys(loadTimes).length
    const isLoadTimeUnset = !isLoadTimeSet.current
    const isAllItemTracked = trackedCount === trackingItemsCount

    console.log(isLoadTimeUnset , trackedCount, trackingItemsCount , isAllItemTracked)
    if (isLoadTimeUnset && trackingItemsCount && isAllItemTracked) {
      const { pendo } = window
      const totalLoadTime = getCurrentTime() - pageLoadStart
      const localtime = getLocalTime()
      const loadTimeStatus = getLoadTimeStatus(totalLoadTime)
      const trackEventData = {
        time: localtime,
        page_title: page,
        load_time_ms: totalLoadTime,
        load_time_text: getLoadTimeStatus(totalLoadTime),
        components_load_time_ms: formatLoadTimes(loadTimes),
        filters: currentFilters?.range ? currentFilters : filters ////
      }

      // eslint-disable-next-line no-console
      console.log('All components loaded. Page load time:',
        totalLoadTime, 'ms', loadTimeStatus)
      // eslint-disable-next-line no-console
      console.log('*** ', trackEventData)

      isLoadTimeSet.current = true
      setLoadTimes({})
      setIsFilterChanged(false)

      if (pendo) {
        // console.log('*** ', pendo)
        // pendo.track('testPageloadtime', trackEventData)
      }
    }
  }, [loadTimes])

  return (
    <LoadTimeContext.Provider value={{ recordLoadTime, onChangeFilter, pageLoadStart, isFilterChanged }}>
      {children}
    </LoadTimeContext.Provider>
  )
}

export function useLoadTimeTracking ({ itemName, states }: {
  itemName: string,
  states?: QueryState[]
}) {
  const isStartTimeSet = useRef(false)
  const isEndTimeSet = useRef(false)
  // const isFilterChanged = useRef(false)
  const { recordLoadTime, isFilterChanged, pageLoadStart } = useContext(LoadTimeContext)

  const [startTime, setStartTime] = useState(null as unknown as number)
  const [endTime, setEndTime] = useState(null as unknown as number)
  const [isUnfulfilled, setIsUnfulfilled] = useState(false)

  const isLoadTimeTrackingEnabled = !!recordLoadTime
  const isLoading = Boolean(states?.some(state => state.isLoading))
  const isSuccess = Boolean(states?.every(state => state.isSuccess))
  const isFetching = isFilterChanged && Boolean(states?.some(state => state.isFetching))
  const isRefetchSuccess = isFilterChanged && Boolean(states?.every(state => !state.isFetching))

  useEffect(() => {
    const isStartTimeUnset = !isStartTimeSet.current
    // eslint-disable-next-line no-console
    console.log('***')
    if (isStartTimeUnset && isLoadTimeTrackingEnabled) {
      const start = getCurrentTime()
      setStartTime(start)
      isStartTimeSet.current = true
    }
  }, [])

  useEffect(() => {
    if (isFilterChanged && isEndTimeSet.current && isLoadTimeTrackingEnabled) {
      setStartTime(pageLoadStart)
      setEndTime(null as unknown as number)
      setIsUnfulfilled(false)
      isEndTimeSet.current = false
    }
  }, [isFilterChanged])

  useEffect(() => {
    const currentTime = getCurrentTime()
    const start = isFetching ? pageLoadStart : startTime
    const loadDuration = currentTime - start
    const isEndTimeUnset = !isEndTimeSet.current
    const hasReachedThreshold = loadDuration > TIME_THRESHOLD_OF_COMPONENT
    // eslint-disable-next-line max-len
    const shouldSetEndTime = startTime && isEndTimeUnset && hasReachedThreshold && isLoadTimeTrackingEnabled
    // eslint-disable-next-line no-console
    // console.log(canSetEndTime, startTime , isEndTimeUnset , hasReachedThreshold , isLoadTimeTrackingEnabled)
    // eslint-disable-next-line no-console
    console.log('***isLoading: ', itemName, hasReachedThreshold, loadDuration,
      ' shouldSetEndTime: ', shouldSetEndTime,
      ' isLoading: ',isLoading, ' ,isFetching:', isFetching, ',isSuccess: ', isSuccess, ',isRefetchSuccess: ', isRefetchSuccess)

    if (shouldSetEndTime) {
      setEndTime(currentTime)
      setIsUnfulfilled(true)
      isEndTimeSet.current = true
    }
  }, [isLoading, isFetching])

  useEffect(() => {
    const isEndTimeUnset = !isEndTimeSet.current
    const success = isSuccess || isRefetchSuccess
    if (isEndTimeUnset && success && isLoadTimeTrackingEnabled) {
      const end = getCurrentTime()
      setEndTime(end)
      isEndTimeSet.current = true
    }
  }, [isSuccess, isRefetchSuccess])

  useEffect(() => {
    if (startTime && endTime && isLoadTimeTrackingEnabled) {
      const loadDuration = endTime - startTime
      recordLoadTime(itemName, loadDuration, isUnfulfilled)
    }
  }, [startTime, endTime, itemName])

}
