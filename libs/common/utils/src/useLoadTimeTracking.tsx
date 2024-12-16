import { createContext, useContext, useEffect, useState, useRef } from 'react'

import moment from 'moment-timezone'

export const TRACKING_INTERVAL = 1800_000
export const TIME_THRESHOLD_OF_PAGE = 1800_000
export const TIME_THRESHOLD_OF_COMPONENT = 300_000

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
    FloorPlan: 'FloorPlan',
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

const evaluateLoadTime = (time: number): string => {
  if (time < 1000) return 'Normal'
  if (time <= 7000) return 'Slow'
  return 'Unacceptable'
}

const formatLoadTimes = (loadTimes: { [key: string]: string }): string => {
  const result: string[] = []
  for (const [a, b] of Object.entries(loadTimes)) {
    result.push(`${a}: ${b}`)
  }

  return result.length ? result.join(', ') : ''
}

export const getTrackingItemsCount = (page: TrackingPages) => {
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
      return Object.keys(items).length
    default:
      return 0
  }
}

export const LoadTimeContext
  = createContext<LoadTimeContextType>({} as LoadTimeContextType)

export interface LoadTimeContextType {
  recordLoadTime: (name: string, time: string) => void
}

export const LoadTimeProvider = (
  { page, children }: { page: TrackingPages, children: React.ReactNode }
) => {
  const [loadTimes, setLoadTimes] = useState<{ [key: string]: string }>({})
  const [pageLoadStart] = useState(performance.now())

  const recordLoadTime = (name: string, time: string) => {
    setLoadTimes((prev) => ({ ...prev, [name]: time }))
  }

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('loadTimes: ', loadTimes, page, getTrackingItemsCount(page))

    const trackingCount = getTrackingItemsCount(page)
    if (trackingCount && Object.keys(loadTimes).length === trackingCount) {
      const { pendo } = window
      const totalTime = performance.now() - pageLoadStart
      // eslint-disable-next-line no-console
      console.log('All components loaded. Page load time:',
        totalTime, 'ms', evaluateLoadTime(totalTime))

      const localTimezone = moment.tz.guess()
      const localtime = moment().tz(localTimezone).format('YYYY-MM-DD HH:mm:ss')

      // eslint-disable-next-line no-console
      console.log('*** ', localtime, {
        time: localtime,
        page_title: page,
        load_time_ms: totalTime.toFixed(2),
        load_time_text: evaluateLoadTime(totalTime),
        components_load_time_ms: formatLoadTimes(loadTimes)
      })

      if (pendo) {
        // console.log('*** ', pendo)
        // pendo.track('testPageloadtime', {
        //   time: localtime,
        //   page_title: page,
        //   load_time_ms: totalTime.toFixed(2),
        //   load_time_text: evaluateLoadTime(totalTime),
        //   components_load_time_ms: formatLoadTimes(loadTimes)
        // })
        // pendo.track('pageloadtime', null as any)
      }
    }
  }, [loadTimes])

  return (
    <LoadTimeContext.Provider value={{ recordLoadTime }}>
      {children}
    </LoadTimeContext.Provider>
  )
}

export function useLoadTimeTracking ({
  itemName, isSuccess
}: {
  itemName: string,
  isSuccess: boolean,
  // context?: React.Context<LoadTimeContextType>,
  // shouldTrack: boolean = true
}) {
  const { recordLoadTime } = useContext(LoadTimeContext)
  const [startTime, setStartTime] = useState(null as unknown as number)
  const [endTime, setEndTime] = useState(null as unknown as number)
  const isStartTimeSet = useRef(false)

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('***')
    if (!isStartTimeSet.current && recordLoadTime) {
      const start = performance.now()
      setStartTime(start)
      isStartTimeSet.current = true
    }
  }, [])

  useEffect(() => {
    if (isSuccess && recordLoadTime) {
      const end = performance.now()
      setEndTime(end)
    }
  }, [isSuccess])

  useEffect(() => {
    if (startTime && endTime && recordLoadTime) {
      const totalTime = endTime - startTime
      recordLoadTime(itemName, totalTime.toFixed(2))
    }
  }, [startTime, endTime, itemName])

  // return { startTime, endTime }
}
