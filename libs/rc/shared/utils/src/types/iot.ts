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
  assocVenueId?: string[]
  assocVenueCount?: number
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

export interface IotSerialNumberResult {
  requestId: string
  serialNumber: string
}

export interface IotControllerDashboard {
  summary?: {
    aps?: {
      summary: {
        [prop: string]: number;
      },
      totalCount: number;
    },
    rcapLicenseUtilization?: {
      summary: {
        [prop: string]: number;
      },
      totalCount: number;
    },
    associatedVenues?: {
      summary: {
        [prop: string]: number;
      },
      totalCount: number;
    },
    activePluginsByRadio?: ActivePluginsByRadio[]
  }
}

export type ActivePluginsByRadio = {
  name: string
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

export enum IotControllerStatusEnum {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE'
}

export const IotControllerStatusMap = {
  [IotControllerStatusEnum.ONLINE]: defineMessage({ defaultMessage: 'Operational' }),
  [IotControllerStatusEnum.OFFLINE]: defineMessage({ defaultMessage: 'Offline' })
}
