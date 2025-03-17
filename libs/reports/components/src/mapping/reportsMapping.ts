import { defineMessage, MessageDescriptor } from 'react-intl'

import { FilterMode } from '@acx-ui/analytics/components'

export enum ReportType {
  OVERVIEW = 'overview',
  WIRELESS = 'wireless',
  WIRED = 'wired',
  APPLICATION = 'app',
  EDGE_APPLICATION = 'edgeApp',
  CLIENT = 'client',
  ACCESS_POINT = 'ap',
  SWITCH = 'switch',
  WLAN='wlan',
  AIRTIME_UTILIZATION = 'airtimeUtilization',
  AP_DETAIL = 'apDetail',
  SWITCH_DETAIL = 'switchDetail',
  CLIENT_DETAIL = 'clientDetail',
  //adhoc reports
  RSS_TRAFFIC = 'rssTraffic',
  RSS_SESSION = 'rssSession',
  WIRELESS_AIRTIME = 'wirelessAirtime',
  TRAFFIC_APPLICTION = 'trafficApplications'
}

export const reportTypeLabelMapping: Record<ReportType, MessageDescriptor> = {
  [ReportType.OVERVIEW]: defineMessage({ defaultMessage: 'Overview' }),
  [ReportType.APPLICATION]: defineMessage({ defaultMessage: 'Applications' }),
  [ReportType.EDGE_APPLICATION]: defineMessage({ defaultMessage: 'Edge Applications' }),
  [ReportType.CLIENT]: defineMessage({ defaultMessage: 'Clients' }),
  [ReportType.ACCESS_POINT]: defineMessage({ defaultMessage: 'Access Points' }),
  [ReportType.SWITCH]: defineMessage({ defaultMessage: 'Switches' }),
  [ReportType.WIRELESS]: defineMessage({ defaultMessage: 'Wireless' }),
  [ReportType.WIRED]: defineMessage({ defaultMessage: 'Wired' }),
  [ReportType.AP_DETAIL]: defineMessage({ defaultMessage: 'AP Details' }),
  [ReportType.SWITCH_DETAIL]: defineMessage({ defaultMessage: 'Switch Details' }),
  [ReportType.CLIENT_DETAIL]: defineMessage({ defaultMessage: 'Client Details' }),
  [ReportType.WLAN]: defineMessage({ defaultMessage: 'WLANs' }),
  [ReportType.AIRTIME_UTILIZATION]: defineMessage({ defaultMessage: 'Airtime Utilization' }),
  //adhoc reports
  [ReportType.RSS_TRAFFIC]:
  defineMessage({ defaultMessage: 'Wireless : RSS and Traffic by Access Points' }),
  [ReportType.RSS_SESSION]:
  defineMessage({ defaultMessage: 'Wireless : RSS and Session by Access Points' }),
  [ReportType.WIRELESS_AIRTIME]:
  defineMessage({ defaultMessage: 'Wireless : Airtime by Access Points' }),
  [ReportType.TRAFFIC_APPLICTION]:
  defineMessage({ defaultMessage: 'Wireless : Traffic by Applications and Access Points' })
}

export const reportTypeDataStudioMapping: Record<ReportType, string> = {
  [ReportType.OVERVIEW]: 'Overview',
  [ReportType.APPLICATION]: 'Applications',
  [ReportType.EDGE_APPLICATION]: 'Edge Applications',
  [ReportType.CLIENT]: 'Clients',
  [ReportType.ACCESS_POINT]: 'Access Points',
  [ReportType.SWITCH]: 'Switches',
  [ReportType.WIRELESS]: 'Wireless Network',
  [ReportType.WIRED]: 'Wired Network',
  [ReportType.AP_DETAIL]: 'AP Details',
  [ReportType.SWITCH_DETAIL]: 'Switch Details',
  [ReportType.CLIENT_DETAIL]: 'Client Details',
  [ReportType.WLAN]: 'WLAN',
  [ReportType.AIRTIME_UTILIZATION]: 'Airtime Utilization Report',
  //adhoc reports
  [ReportType.RSS_TRAFFIC]: 'Wireless RSS and Traffic',
  [ReportType.RSS_SESSION]: 'Wireless RSS and Session',
  [ReportType.WIRELESS_AIRTIME]: 'Wireless Airtime',
  [ReportType.TRAFFIC_APPLICTION]: 'Wireless Traffic and Application'
}

export const reportTypeMapping: Record<ReportType, FilterMode> = {
  [ReportType.OVERVIEW]: 'none',
  [ReportType.APPLICATION]: 'ap',
  [ReportType.EDGE_APPLICATION]: 'edge',
  [ReportType.CLIENT]: 'ap',
  [ReportType.ACCESS_POINT]: 'ap',
  [ReportType.SWITCH]: 'switch',
  [ReportType.WIRELESS]: 'ap',
  [ReportType.WIRED]: 'switch',
  [ReportType.AP_DETAIL]: 'ap',
  [ReportType.SWITCH_DETAIL]: 'switch',
  [ReportType.CLIENT_DETAIL]: 'ap',
  [ReportType.WLAN]: 'ap',
  [ReportType.AIRTIME_UTILIZATION]: 'ap',
  //adhoc reports
  [ReportType.RSS_TRAFFIC]: 'ap',
  [ReportType.RSS_SESSION]: 'ap',
  [ReportType.WIRELESS_AIRTIME]: 'ap',
  [ReportType.TRAFFIC_APPLICTION]: 'ap'
}

export const bandDisabledReports:ReportType[] = [
  ReportType.APPLICATION,
  ReportType.ACCESS_POINT,
  ReportType.AIRTIME_UTILIZATION
]

export const networkFilterDisabledReports:ReportType[] = [
  ReportType.OVERVIEW
]
