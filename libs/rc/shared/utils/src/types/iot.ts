export interface IotControllerStatus {
  id: string
  name: string
  inboundAddress: string
  serialNumber: string
  publicAddress: string
  publicPort: number
  apiToken: string
  tenantId: string
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

export enum IotApStatusEnum {
  ONLINE = 'online',
  OFFLINE = 'offline',
  UNKNOWN = 'unknown'
}

export enum RcapLicenseUtilizationEnum {
  USED = 'used',
  AVAILABLE = 'available'
}

