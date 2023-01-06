import { defineMessage, MessageDescriptor } from 'react-intl'

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { FilterMode } from '@acx-ui/analytics/components'

export enum ReportType {
  OVERVIEW = 'overview',
  WIRELESS = 'wireless',
  WIRED = 'wired',
  APPLICATION = 'app',
  CLIENT = 'client',
  ACCESS_POINT = 'ap',
  SWITCH = 'switch',
  WLAN='wlan',
  AIRTIME_UTILIZATION = 'airtimeUtilization',
  AP_DETAIL = 'apDetail',
  SWITCH_DETAIL = 'switchDetail',
  CLIENT_DETAIL = 'clientDetail'
}

export const reportTypeLabelMapping: Record<ReportType, MessageDescriptor> = {
  [ReportType.OVERVIEW]: defineMessage({ defaultMessage: 'Overview' }),
  [ReportType.APPLICATION]: defineMessage({ defaultMessage: 'Applications' }),
  [ReportType.CLIENT]: defineMessage({ defaultMessage: 'Clients' }),
  [ReportType.ACCESS_POINT]: defineMessage({ defaultMessage: 'Access Points' }),
  [ReportType.SWITCH]: defineMessage({ defaultMessage: 'Switches' }),
  [ReportType.WIRELESS]: defineMessage({ defaultMessage: 'Wireless' }),
  [ReportType.WIRED]: defineMessage({ defaultMessage: 'Wired' }),
  [ReportType.AP_DETAIL]: defineMessage({ defaultMessage: 'AP Details' }),
  [ReportType.SWITCH_DETAIL]: defineMessage({ defaultMessage: 'Switch Details' }),
  [ReportType.CLIENT_DETAIL]: defineMessage({ defaultMessage: 'Client Details' }),
  [ReportType.WLAN]: defineMessage({ defaultMessage: 'WLANs' }),
  [ReportType.AIRTIME_UTILIZATION]: defineMessage({ defaultMessage: 'Airtime Utilization' })
}

export const reportTypeDataStudioMapping: Record<ReportType, string> = {
  [ReportType.OVERVIEW]: 'Overview',
  [ReportType.APPLICATION]: 'Applications',
  [ReportType.CLIENT]: 'Clients',
  [ReportType.ACCESS_POINT]: 'Access Points',
  [ReportType.SWITCH]: 'Switches',
  [ReportType.WIRELESS]: 'Wireless Network',
  [ReportType.WIRED]: 'Wired Network',
  [ReportType.AP_DETAIL]: 'AP Details',
  [ReportType.SWITCH_DETAIL]: 'Switch Details',
  [ReportType.CLIENT_DETAIL]: 'Client Details',
  [ReportType.WLAN]: 'WLAN',
  [ReportType.AIRTIME_UTILIZATION]: 'Airtime Utilization Report'
}

export const reportTypeModeMapping: Record<ReportType, FilterMode> = {
  [ReportType.OVERVIEW]: 'none',
  [ReportType.APPLICATION]: 'ap',
  [ReportType.CLIENT]: 'ap',
  [ReportType.ACCESS_POINT]: 'ap',
  [ReportType.SWITCH]: 'switch',
  [ReportType.WIRELESS]: 'ap',
  [ReportType.WIRED]: 'switch',
  [ReportType.AP_DETAIL]: 'ap',
  [ReportType.SWITCH_DETAIL]: 'switch',
  [ReportType.CLIENT_DETAIL]: 'ap',
  [ReportType.WLAN]: 'ap',
  [ReportType.AIRTIME_UTILIZATION]: 'ap'
}
