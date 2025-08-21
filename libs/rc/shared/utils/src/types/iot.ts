import { defineMessage } from 'react-intl'

export interface IotControllerStatus {
  id: string
  name: string
  inboundAddress: string
  serialNumber?: string
  iotSerialNumber: string
  publicAddress: string
  publicPort: number
  apiToken: string
  tenantId: string
  assocVenueId?: string
  assocVenueCount?: number
  assocApId?: string
  assocApVenueId?: string
  status: IotControllerStatusEnum
}

export interface IotControllerSetting {
  id?: string
  name: string
  inboundAddress: string
  publicAddress?: string
  publicPort?: number
  apiToken?: string
  iotSerialNumber: string
}

export interface IotControllerVenues {
  requestId: string
  venueIds: string[]
}

export interface IotSerialNumberResult {
  requestId: string
  serialNumber: string
}

export interface SerialNumberExistsResult {
  requestId: string
  serialNumber: string
  existed: boolean
}

export interface IotControllerDashboard {
  requestId?: string
  apStatus?: {
    onlineAp: number
    offlineAp: number
    totalAp: number
  },
  pluginsByRadioStatus?: {
    totalRadioCount: number
    radioPlugins: ActivePluginsByRadio[]
  }
}

export interface IotControllerDashboardV2 {
  requestId?: string
  errorMessage?: string
  data : {
    apStatus?: {
      onlineAp: number
      offlineAp: number
      totalAp: number
    },
    pluginsByRadioStatus?: {
      totalRadioCount: number
      radioPlugins: ActivePluginsByRadio[]
    }
  }
  ok?: boolean
}

export enum ApStatusEnum {
  ONLINE = 'onlineAp',
  OFFLINE = 'offlineAp'
}

export type ActivePluginsByRadio = {
  name: string
  displayName: string
  count: number
}

export type ActivePluginsStatus = {
  enabled: boolean
  name: string
  running: boolean
}

export interface ActivePluginsData {
  pluginStatus: ActivePluginsStatus[]
  requestId?: string
}

export interface ActivePluginsDataV2 {
  requestId?: string
  errorMessage?: string
  data: ActivePluginsStatus[]
  ok?: boolean
}

export enum IotApStatusEnum {
  ONLINE = 'online',
  OFFLINE = 'offline',
  UNKNOWN = 'unknown'
}

export enum RcapLicenseUtilizationEnum {
  USED = 'rcapCountRequired',
  AVAILABLE = 'rcapCountAvailable'
}

export interface RcapLicenseUtilizationData {
  [RcapLicenseUtilizationEnum.USED]: number
  [RcapLicenseUtilizationEnum.AVAILABLE]: number
  requestId?: string
}

export interface RcapLicenseUtilizationDataV2 {
  requestId?: string
  errorMessage?: string
  data : {
    [RcapLicenseUtilizationEnum.USED]: number
    [RcapLicenseUtilizationEnum.AVAILABLE]: number
  }
  ok?: boolean
}

export enum IotControllerStatusEnum {
  UNKNOWN = 'UNKNOWN',
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE'
}

export const IotControllerStatusMap = {
  [IotControllerStatusEnum.UNKNOWN]: defineMessage({ defaultMessage: 'Unknown' }),
  [IotControllerStatusEnum.ONLINE]: defineMessage({ defaultMessage: 'Operational' }),
  [IotControllerStatusEnum.OFFLINE]: defineMessage({ defaultMessage: 'Offline' })
}
