import { GuestNetworkTypeEnum, WlanSecurityEnum } from '@acx-ui/rc/utils'

export interface CommonResult {
  requestId: string
  response?:{}
}
export interface Network {
  id: string
  name: string
  description: string
  nwSubType: string
  ssid: string
  vlan: number
  aps: number
  clients: number
  venues: { count: number, names: string[] }
  captiveType: GuestNetworkTypeEnum
  deepNetwork?: {
    wlan: {
      wlanSecurity: WlanSecurityEnum
    }
  }
  vlanPool?: { name: string }
  // cog ??
}

export interface NetworkDetail {
  type: string
  tenantId: string
  name: string
  venues: { venueId: string, id: string }[]
  id: string
}

export interface Venue {
  id: string
  name: string
  description: string
  status: string
  city: string
  country: string
  latitude: string
  longitude: string
  mesh: { enabled: boolean }
  aggregatedApStatus: { [statusKey: string]: number }
  networks: {
    count: number
    names: string[]
    vlans: number[]
  }
  // aps ??
  // switches ??
  // switchClients ??
  // radios ??
  // scheduling ??
  activated: { isActivated: boolean }
}

export interface AlarmBase {
  startTime: string
  severity: string
  message: string
  id: string
  serialNumber: string
  entityType: string
  entityId: string
  sourceType: string
}

export interface AlarmMeta {
  id: AlarmBase['id']
  venueName: string
  apName: string
  switchName: string
}

export type Alarm = AlarmBase & AlarmMeta
export interface UserSettings { 
  [key: string]: string 
}

export interface Dashboard {
  summary: {
    alarms: {
      totalCount: number
      summary? : {
        clear: number
      }
    }
  }
}