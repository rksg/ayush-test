import { defineMessage, MessageDescriptor } from 'react-intl'

export enum ReportType {
  OVERVIEW = 'overview',
  NETWORK = 'network',
  WIRELESS = 'wireless',
  WIRED = 'wired',
  APPLICATION = 'app',
  CLIENT = 'client',
  ACCESS_POINT = 'ap',
  SWITCH = 'switch',
  AP_DETAIL = 'apDetail',
  SWITCH_DETAIL = 'switchDetail',
  CLIENT_DETAIL = 'clientDetail'
}

export const reportTypeLabelMapping: Record<ReportType, MessageDescriptor> = {
  [ReportType.OVERVIEW]: defineMessage({ defaultMessage: 'Overview' }),
  [ReportType.NETWORK]: defineMessage({ defaultMessage: 'Network' }),
  [ReportType.APPLICATION]: defineMessage({ defaultMessage: 'Applications' }),
  [ReportType.CLIENT]: defineMessage({ defaultMessage: 'Clients' }),
  [ReportType.ACCESS_POINT]: defineMessage({ defaultMessage: 'Access Points' }),
  [ReportType.SWITCH]: defineMessage({ defaultMessage: 'Switches' }),
  [ReportType.WIRELESS]: defineMessage({ defaultMessage: 'Wireless' }),
  [ReportType.WIRED]: defineMessage({ defaultMessage: 'Wired' }),
  [ReportType.AP_DETAIL]: defineMessage({ defaultMessage: 'AP Details' }),
  [ReportType.SWITCH_DETAIL]: defineMessage({ defaultMessage: 'Switch Details' }),
  [ReportType.CLIENT_DETAIL]: defineMessage({ defaultMessage: 'Client Details' })
}

export const reportTypeDataStudioMapping: Record<ReportType, string> = {
  [ReportType.OVERVIEW]: 'Overview',
  [ReportType.NETWORK]: 'Network',
  [ReportType.APPLICATION]: 'Applications',
  [ReportType.CLIENT]: 'Clients',
  [ReportType.ACCESS_POINT]: 'Access Points',
  [ReportType.SWITCH]: 'Switches',
  [ReportType.WIRELESS]: 'Wireless Network',
  [ReportType.WIRED]: 'Wired Network',
  [ReportType.AP_DETAIL]: 'AP Details',
  [ReportType.SWITCH_DETAIL]: 'Switch Details',
  [ReportType.CLIENT_DETAIL]: 'Client Details'
}
