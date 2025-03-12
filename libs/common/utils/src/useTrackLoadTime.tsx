import { createContext, useContext, useEffect, useState, useRef } from 'react'

import { SerializedError }     from '@reduxjs/toolkit'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import _                       from 'lodash'
import moment                  from 'moment-timezone'
import { useLocation }         from 'react-router-dom'

const PENDO_TRACK_EVENT_NAME = 'pageloadtime' // 'pageloadtime' 'testPageloadtime'
const COMPONENT_LOAD_TIME_THRESHOLD = 600_000 //10min
const LOAD_TIME = { NORMAL: 1_000, SLOW: 7_000 }

interface QueryState {
  isSuccess: boolean
  isLoading?: boolean
  isFetching?: boolean
  isError?: boolean
  error?: Error | SerializedError | FetchBaseQueryError
}

interface QueryResult {
  originalArgs?: {
    endDate?: string
    startDate?: string
    range?: string
    filterBy?: string
    path?: string
  },
  payload?: {
    filters?: string
    searchString?: string
    groupBy?: string
    groupId?: string
    keyword?: string
    certificateTemplateId?: string
    dpskPoolId?: string
    macRegistrationPoolId?: string
    personalIdentityNetworkId?: string
    propertyId?: string
  }
}

type FlattenedRoute = {
  key: string;
  type: string
  subTab: string;
  isRegex: boolean;
  widgets: string[];
  widgetCount: number
  activeTab: string
}
type FlattenedRoutes = {
  [path: string]: FlattenedRoute
}

type LoadTimes = {
  [key: string]: {
    time: number,
    startTime: number,
    isUnfulfilled: boolean
  }
}

enum LoadTimeStatus {
  NORMAL = 'Normal',
  SLOW = 'Slow',
  UNACCEPTABLE = 'Unacceptable'
}

enum TrackingPages {
  DASHBOARD = 'Dashboard',
  AI = 'AI Analytics',
  WIRELESS_CLIENTS = 'Wireless Clients List',
  WIRED_CLIENTS = 'Wired Clients List',
  IDENTITY = 'Identity Management',
  VENUES_DETAILS = 'Venues Details',
  AP = 'Access Points',
  WIRED = 'Wired',
  NETWORKS = 'Wi-Fi Networks',
  TIMELINE = 'Timeline'
}

enum TrackingPageType {
  DASHBOARD = 'Dashboard',
  TABLE = 'Table'
}

export const widgetsMapping = {
  ORGANIZATION_DROPDOWN: 'VenueFilter',
  ALARMS_WIDGET: 'AlarmWidgetV2',
  INCIDENTS_DASHBOARD: 'IncidentsDashboardv2',
  CLIENT_EXPERIENCE: 'ClientExperience',
  CLIENTS_WIDGET: 'ClientsWidgetV2',
  DEVICES_DASHBOARD_WIDGET: 'DevicesDashboardWidgetV2',
  VENUES_DASHBOARD_WIDGET: 'VenuesDashboardWidgetV2',
  DID_YOU_KNOW: 'DidYouKnowWidget',
  TRAFFIC_BY_VOLUME: 'TrafficByVolumeWidget',
  CONNECTED_CLIENTS_OVER_TIME: 'ConnectedClientsOverTime',
  TOP_WIFI_NETWORKS: 'TopWiFiNetworks',
  TOP_APPS_BY_TRAFFIC: 'TopAppsByTraffic',
  TOP_SWITCHES_BY_POE_USAGE: 'TrafficByVolumeWidget',
  TOP_SWITCHES_BY_TRAFFIC: 'TopSwitchesByTrafficWidget',
  TOP_SWITCHES_BY_ERROR: 'TopSwitchesByErrorWidget',
  TOP_SWITCH_MODELS: 'TopSwitchModelsWidget',
  TOP_5_RUCKUS_EDGES_BY_TRAFFIC: 'TopEdgesByTrafficWidget',
  TOP_5_RUCKUS_EDGES_BY_RESOURCE_UTILIZATION: 'TopEdgesByResourcesWidget',
  MAP: 'ActualMapV2',
  WIRELESS_CLIENTS_TABLE: 'WirelessClientsTable',
  WIRED_CLIENTS_TABLE: 'WiredClientsTable',
  VENUE_ALARM_WIDGET: 'VenueAlarmWidget',
  INCIDENT_BY_SEVERITY: 'IncidentBySeverity',
  INCIDENT_BY_SEVERITY_DONUT_CHART: 'IncidentBySeverityDonutChart',
  VENUE_DEVICES_WIDGET: 'VenueDevicesWidget',
  VENUE_HEALTH_WIDGET: 'VenueHealthWidget',
  FLOOR_PLAN: 'FloorPlan',
  NETWORK_HISTORY: 'NetworkHistory',
  TOP_APPLICATIONS_BY_TRAFFIC: 'TopApplicationsByTraffic',
  TOP_SSIDS_BY_TRAFFIC_WIDGET: 'TopSSIDsByTrafficWidget',
  TOP_SSIDS_BY_CLIENT_WIDGET: 'TopSSIDsByClientWidget',
  SWITCHES_TRAFFIC_BY_VOLUME: 'SwitchesTrafficByVolume',
  TOP_SWITCHES_BY_POE_USAGE_WIDGET: 'TopSwitchesByPoEUsageWidget',
  EVENT_TABLE: 'EventTable',
  AP_TABLE: 'APTable',
  AP_GROUP_TABLE: 'APGroupTable',
  SWITCH_TABLE: 'SwitchTable',
  NETWORK_TABLE: 'NetworkTable',
  IDENTITY_GUOUP_TABLE: 'IdentityGuoupTable',
  IDENTITY_TABLE: 'IdentityTable',
  INCIDENT_BY_SEVERITY_BAR_CHART: 'IncidentBySeverityBarChart',
  INCIDENT_TABLE: 'IncidentTable',
  INTENT_AI_TABLE: 'IntentAITable'
}

export const trackingPageConfig = {
  [TrackingPages.DASHBOARD]: {
    key: 'DASHBOARD',
    type: TrackingPageType.DASHBOARD,
    route: 'dashboard',
    widgets: [
      widgetsMapping.ORGANIZATION_DROPDOWN,
      widgetsMapping.ALARMS_WIDGET,
      widgetsMapping.INCIDENTS_DASHBOARD,
      widgetsMapping.CLIENT_EXPERIENCE,
      widgetsMapping.VENUES_DASHBOARD_WIDGET,
      widgetsMapping.DEVICES_DASHBOARD_WIDGET,
      widgetsMapping.CLIENTS_WIDGET,
      widgetsMapping.DID_YOU_KNOW,
      widgetsMapping.MAP
    ],
    tabs: {
      defaultIndex: 'ap',
      activeIndex: 'dashboard-tab',
      options: {
        ap: [
          widgetsMapping.TRAFFIC_BY_VOLUME,
          widgetsMapping.CONNECTED_CLIENTS_OVER_TIME,
          widgetsMapping.TOP_WIFI_NETWORKS,
          widgetsMapping.TOP_APPS_BY_TRAFFIC
        ],
        switch: [
          widgetsMapping.SWITCHES_TRAFFIC_BY_VOLUME,
          widgetsMapping.TOP_SWITCHES_BY_POE_USAGE_WIDGET,
          widgetsMapping.TOP_SWITCHES_BY_TRAFFIC,
          widgetsMapping.TOP_SWITCHES_BY_ERROR,
          widgetsMapping.TOP_SWITCH_MODELS
        ],
        edge: [
          widgetsMapping.TOP_5_RUCKUS_EDGES_BY_TRAFFIC,
          widgetsMapping.TOP_5_RUCKUS_EDGES_BY_RESOURCE_UTILIZATION
        ]
      }
    }
  },
  [TrackingPages.AI]: {
    key: 'AI',
    children: [{
      key: 'Incidents',
      type: TrackingPageType.TABLE,
      route: 'analytics/incidents',
      widgets: [
        widgetsMapping.INCIDENT_BY_SEVERITY,
        widgetsMapping.INCIDENT_BY_SEVERITY_BAR_CHART,
        widgetsMapping.NETWORK_HISTORY,
        widgetsMapping.INCIDENT_TABLE
      ]
    }, {
      key: 'IntentAI',
      type: TrackingPageType.TABLE,
      route: 'analytics/intentAI',
      widgets: [widgetsMapping.INTENT_AI_TABLE]
    }]
  },
  [TrackingPages.WIRELESS_CLIENTS]: {
    key: 'WIRELESS_CLIENTS',
    children: [{
      key: 'Clients List',
      type: TrackingPageType.TABLE,
      route: 'users/wifi/clients',
      widgets: [widgetsMapping.WIRELESS_CLIENTS_TABLE]
    }]
  },
  [TrackingPages.WIRED_CLIENTS]: {
    key: 'WIRED_CLIENTS',
    type: TrackingPageType.TABLE,
    route: 'users/switch/clients',
    widgets: [widgetsMapping.WIRED_CLIENTS_TABLE]
  },
  [TrackingPages.IDENTITY]: {
    key: 'IDENTITY',
    children: [{
      key: 'Identity Groups',
      type: TrackingPageType.TABLE,
      route: 'users/identity-management/identity-group',
      widgets: [widgetsMapping.IDENTITY_GUOUP_TABLE]
    }, {
      key: 'Identities',
      type: TrackingPageType.TABLE,
      route: 'users/identity-management/identity',
      widgets: [widgetsMapping.IDENTITY_TABLE]
    }]
  },
  [TrackingPages.VENUES_DETAILS]: {
    key: 'VENUES_DETAILS',
    children: [{
      key: 'Overview',
      type: TrackingPageType.DASHBOARD,
      route: '^venues/([^/]+)/venue-details/overview$',
      widgets: [
        widgetsMapping.VENUE_ALARM_WIDGET,
        widgetsMapping.INCIDENT_BY_SEVERITY,
        widgetsMapping.INCIDENT_BY_SEVERITY_DONUT_CHART,
        widgetsMapping.VENUE_DEVICES_WIDGET,
        widgetsMapping.VENUE_HEALTH_WIDGET,
        widgetsMapping.FLOOR_PLAN
      ],
      tabs: {
        defaultIndex: 'ap',
        activeIndex: 'venue-tab',
        options: {
          ap: [
            widgetsMapping.TRAFFIC_BY_VOLUME,
            widgetsMapping.NETWORK_HISTORY,
            widgetsMapping.CONNECTED_CLIENTS_OVER_TIME,
            widgetsMapping.TOP_APPLICATIONS_BY_TRAFFIC,
            widgetsMapping.TOP_SSIDS_BY_TRAFFIC_WIDGET,
            widgetsMapping.TOP_SSIDS_BY_CLIENT_WIDGET
          ],
          switch: [
            widgetsMapping.SWITCHES_TRAFFIC_BY_VOLUME,
            widgetsMapping.TOP_SWITCHES_BY_POE_USAGE_WIDGET,
            widgetsMapping.TOP_SWITCHES_BY_TRAFFIC,
            widgetsMapping.TOP_SWITCHES_BY_ERROR,
            widgetsMapping.TOP_SWITCH_MODELS
          ]
        }
      }
    }]
  },
  [TrackingPages.AP]: {
    key: 'AP',
    children: [{
      key: 'AP List',
      type: TrackingPageType.TABLE,
      route: 'devices/wifi',
      widgets: [widgetsMapping.AP_TABLE]
    }, {
      key: 'AP Group List',
      type: TrackingPageType.TABLE,
      route: 'devices/wifi/apgroups',
      widgets: [widgetsMapping.AP_GROUP_TABLE]
    }]
  },
  [TrackingPages.WIRED]: {
    key: 'WIRED',
    children: [{
      key: 'Switch List',
      type: TrackingPageType.TABLE,
      route: 'devices/switch',
      widgets: [widgetsMapping.SWITCH_TABLE]
    }]
  },
  [TrackingPages.NETWORKS]: {
    key: 'NETWORKS',
    children: [{
      key: 'Network List',
      type: TrackingPageType.TABLE,
      route: 'networks/wireless',
      widgets: [widgetsMapping.NETWORK_TABLE]
    }]
  },
  [TrackingPages.TIMELINE]: {
    key: 'TIMELINE',
    children: [{
      key: 'Events',
      type: TrackingPageType.TABLE,
      route: 'timeline/events',
      widgets: [widgetsMapping.EVENT_TABLE]
    }]
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const flattenRoutes = (routes: Record<string, any>, parentPath = ''): FlattenedRoutes => {
  return Object.values(routes).reduce<FlattenedRoutes>((flatRoutes, values) => {
    const { route, key, type, children, tabs, widgets } = values
    let tabsWidgets = [], tabIndex = ''

    if (children) {
      return {
        ...flatRoutes,
        ...flattenRoutes(children, key)
      }
    }
    if (tabs) {
      tabIndex = localStorage.getItem(tabs.activeIndex) || tabs.defaultIndex
      if (tabs.options[tabIndex]) {
        tabsWidgets = tabs.options[tabIndex]
      }
    }

    const combineWidgets = [...widgets, ...tabsWidgets]
    return {
      ...flatRoutes,
      [route]: {
        key: parentPath || key,
        subTab: parentPath ? key : '',
        type,
        isRegex: route?.startsWith('^'),
        widgets: combineWidgets || [],
        widgetCount: combineWidgets?.length,
        activeTab: tabIndex
      }
    }
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

export const getPageLoadStartTime = (
  pageLoadStart: number, loadTimes: LoadTimes
) => {
  const minStartTime = getMinStartItem(loadTimes)?.startTime
  if (minStartTime < pageLoadStart) return minStartTime
  return pageLoadStart
}

export const LoadTimeContext
  = createContext<LoadTimeContextType>({} as LoadTimeContextType)

export interface LoadTimeContextType {
  updateLoadTime: (name: string, time: number, startTime: number, isUnfulfilled: boolean) => void
  onPageFilterChange: (updatedFilter: unknown, isInit?: boolean) => void
  pageLoadStart: number
  pageCriteria: unknown
  pageDetails: FlattenedRoute
  isPageCriteriaChanged: boolean
  isPageCriteriaInit: boolean
}

export const LoadTimeProvider = ({ children }: {
  page?: TrackingPages, children: React.ReactNode
}) => {
  const isLoadTimeSet = useRef(false)
  const isPageCriteriaInit = useRef(false)
  const [loadTimes, setLoadTimes] = useState<LoadTimes>({})
  const [isPageCriteriaChanged, setIsPageCriteriaChanged] = useState(false)
  const [isPageRouteSupported, setIsPageRouteSupported] = useState(false)

  const [pageDetails, setPageDetails] =useState(null as unknown as FlattenedRoute)
  const [pageLoadStart, setPageLoadStart] = useState(getCurrentTime())
  const [pageCriteria, setPageCriteria] = useState(null as unknown)

  const resetLoadTime = () => {
    setPageLoadStart(getCurrentTime())
    setLoadTimes({})
    isLoadTimeSet.current = false
  }

  const updateLoadTime = (name: string, time: number, startTime: number, isUnfulfilled = false) => {
    setLoadTimes((prev) => ({ ...prev, [name]: { time, startTime, isUnfulfilled } }))
  }

  const onPageFilterChange = (updatedCriteria: unknown, isInit?: boolean) => {
    const hasChanged = !_.isEqual(updatedCriteria, pageCriteria)
    if (isInit && !isPageCriteriaInit.current) {
      setPageCriteria(updatedCriteria)
      isPageCriteriaInit.current = true
    } else if (hasChanged && isLoadTimeSet.current && isPageCriteriaInit.current) {
      setPageCriteria(updatedCriteria)
      setIsPageCriteriaChanged(true)
      resetLoadTime()
    }
  }

  const location = useLocation()
  const flattenRoutesConfig = flattenRoutes(trackingPageConfig)
  const pathname = location.pathname.split('/t/')?.[1] || location.pathname.split('/v/')?.[1]

  useEffect(() => {
    setIsPageRouteSupported(isRouteSupported(flattenRoutesConfig, pathname))
    setPageDetails(getRouteDetails(flattenRoutesConfig, pathname) as FlattenedRoute)
    resetLoadTime()
    isPageCriteriaInit.current = false
  }, [pathname])

  useEffect(() => {
    const pageDetails = getRouteDetails(flattenRoutesConfig, pathname)
    const pageKey = pageDetails?.key
    const pageTitle = TrackingPages[pageKey as keyof typeof TrackingPages]
    const pageWidgetCount = pageDetails?.widgetCount

    const trackedWidget = Object.keys(loadTimes)
    const isLoadTimeUnset = !isLoadTimeSet.current
    const isAllWidgetsTracked = _.isEqual(trackedWidget.sort(), pageDetails?.widgets.sort())

    if (isLoadTimeUnset && pageWidgetCount && isAllWidgetsTracked && isPageRouteSupported) {
      const { pendo } = window
      const totalLoadTime = getCurrentTime() - getPageLoadStartTime(pageLoadStart, loadTimes)
      const localtime = getLocalTime()
      const loadTimeStatus = getLoadTimeStatus(totalLoadTime)
      const trackEventData = {
        time: localtime,
        page_title: pageDetails?.subTab ? `${pageTitle} - ${pageDetails?.subTab}` : pageTitle,
        page_type: pageDetails?.type,
        load_time_ms: totalLoadTime,
        load_time_text: loadTimeStatus,
        components_load_time_ms: formatLoadTimes(loadTimes),
        criteria: pageCriteria ? JSON.stringify(pageCriteria) : '',
        active_tab: pageDetails?.activeTab
      }

      // eslint-disable-next-line no-console, max-len
      // console.log('All components loaded. Page load time:', totalLoadTime, 'ms',
      //   '\n', '** status: ', loadTimeStatus,
      //   '\n', '** event: ', trackEventData)

      setLoadTimes({})
      setIsPageCriteriaChanged(false)
      isLoadTimeSet.current = true

      if (pendo) {
        pendo.track?.(PENDO_TRACK_EVENT_NAME, trackEventData)
        // if (loadTimeStatus === LoadTimeStatus.UNACCEPTABLE) {
        //   pendo.showGuideById?.('zdnqb9J5L32vRHw9CbvBQSsGhyw')
        // }
      }
    }
  }, [loadTimes])

  return (
    <LoadTimeContext.Provider value={{
      updateLoadTime, onPageFilterChange,
      pageDetails, pageLoadStart, pageCriteria,
      isPageCriteriaChanged, isPageCriteriaInit: isPageCriteriaInit.current
    }}>
      {children}
    </LoadTimeContext.Provider>
  )
}

export function useTrackLoadTime ({ itemName, states, isEnabled }: {
  itemName: string,
  isEnabled: boolean,
  states: unknown[]
}) {
  const isStartTimeSet = useRef(false)
  const isEndTimeSet = useRef(false)
  const {
    updateLoadTime, onPageFilterChange,
    pageDetails, pageLoadStart, isPageCriteriaChanged, isPageCriteriaInit
  } = useContext(LoadTimeContext)

  const [startTime, setStartTime] = useState(null as unknown as number)
  const [endTime, setEndTime] = useState(null as unknown as number)
  const [isUnfulfilled, setIsUnfulfilled] = useState(false)
  const [timerEnabled, setTimerEnabled] = useState(true)

  const status = states as QueryState[]
  const isError = Boolean(status?.some(state => state.isError))
  const isAllSuccess = Boolean(status?.every(state => state.isSuccess))
  const isAllFetchSuccess
    = isPageCriteriaChanged && Boolean(status?.every(state => !state.isFetching))

  const pageQuery = (pageDetails?.key === 'DASHBOARD'
    ? (itemName === widgetsMapping.INCIDENTS_DASHBOARD ? states[0] : null)
    : (pageDetails?.widgets[0] === itemName ? states[0] : null)) as QueryResult

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

  useEffect(() => {
    if (!isEnabled) return
    if (pageQuery?.payload) {
      const {
        filters, searchString, groupBy, groupId, keyword,
        certificateTemplateId, dpskPoolId, macRegistrationPoolId,
        personalIdentityNetworkId, propertyId
      } = pageQuery?.payload

      onPageFilterChange?.({
        filters, searchString, groupBy, groupId, keyword,
        certificateTemplateId, dpskPoolId, macRegistrationPoolId,
        personalIdentityNetworkId, propertyId
      }, !isPageCriteriaInit)
    } else if (pageQuery?.originalArgs) {
      const {
        endDate, startDate, range, filterBy, path
      } = pageQuery?.originalArgs

      onPageFilterChange?.({
        endDate, startDate, range, filterBy, path
      } , !isPageCriteriaInit)
    }
  }, [pageQuery?.payload, pageQuery?.originalArgs])

  useEffect(() => {
    if (isPageCriteriaChanged && isEndTimeSet.current && isEnabled) {
      setStartTime(pageLoadStart)
      setEndTime(null as unknown as number)
      setIsUnfulfilled(false)
      isEndTimeSet.current = false
    }
  }, [isPageCriteriaChanged])

  useEffect(() => {
    if (isError && startTime && !isEndTimeSet.current && isEnabled) {
      setEndTime(getCurrentTime())
      setIsUnfulfilled(true)
      setTimerEnabled(false)
      isEndTimeSet.current = true
    }
  }, [isError])

  useEffect(() => {
    const isSuccess = isAllSuccess || isAllFetchSuccess
    if (isSuccess && !isEndTimeSet.current && isEnabled) {
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
