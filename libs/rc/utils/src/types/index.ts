import {
  ServiceAdminState,
  ServiceStatus,
  ServiceTechnology,
  ServiceType,
  ApDeviceStatusEnum,
  GuestNetworkTypeEnum,
  WlanSecurityEnum
} from '../constants'

import {
  NetworkVenue
} from './network'

export * from './ap'
export * from './venue'
export * from './network'
export * from './user'

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

export interface Venue {
  id: string
  venueId: string
  name: string
  description: string
  status: string
  city: string
  country: string
  latitude: string
  longitude: string
  mesh: { enabled: boolean }
  aggregatedApStatus: Partial<Record<ApDeviceStatusEnum, number>>
  networks: {
    count: number
    names: string[]
    vlans: number[]
  }
  wlan: {
    wlanSecurity: string
  }
  allApDisabled: boolean
  // aps ??
  // switches ??
  // switchClients ??
  // radios ??
  // scheduling ??
  activated: { isActivated: boolean, isDisabled?: boolean }
  deepVenue?: NetworkVenue
  disabledActivation: boolean
}

export interface AlarmBase {
  startTime: number
  severity: string
  message: string
  id: string
  serialNumber: string
  entityType: string
  entityId: string
  sourceType: string,
  switchMacAddress: string
}

export interface AlarmMeta {
  id: AlarmBase['id']
  venueName: string
  apName: string
  switchName: string,
  isSwitchExists: boolean
}

export type Alarm = AlarmBase & AlarmMeta

export enum EventSeverityEnum {
  CRITICAL = 'Critical',
  MAJOR = 'Major',
  MINOR = 'Minor',
  WARNING = 'Warning',
  INFORMATIONAL = 'Info'
}

export enum EventTypeEnum {
  AP = 'AP',
  CLIENT = 'CLIENT',
  SWITCH = 'SWITCH',
  NETWORK = 'NETWORK',
  NOTIFICATION = 'Notification',
  DP = 'DP'
}

export enum AlaramSeverity {
  CRITICAL = 'critical',
  MAJOR = 'major',
  MINOR = 'minor',
  WARNING = 'warning',
  INDETERMINATE = 'indeterminate',
  INFORMATIONAL = 'info',
  CLEAR = 'clear'
}

export enum ApVenueStatusEnum {
  IN_SETUP_PHASE = '1_InSetupPhase',
  OFFLINE = '1_InSetupPhase_Offline',
  OPERATIONAL = '2_Operational',
  REQUIRES_ATTENTION = '3_RequiresAttention',
  TRANSIENT_ISSUE = '4_TransientIssue'
}

export enum SwitchStatusEnum {
  NEVER_CONTACTED_CLOUD = 'PREPROVISIONED',
  INITIALIZING = 'INITIALIZING',
  APPLYING_FIRMWARE = 'APPLYINGFIRMWARE',
  OPERATIONAL = 'ONLINE',
  DISCONNECTED = 'OFFLINE',
  STACK_MEMBER_NEVER_CONTACTED = 'STACK_MEMBER_PREPROVISIONED'
}

export type ChartData = {
  category: string
  series: Array<{ name: string, value: number }>
}

export interface NetworkDetailHeader {
  activeVenueCount: number,
  aps: {
    summary?: {
      [ApVenueStatusEnum.IN_SETUP_PHASE]?: number
      [ApVenueStatusEnum.OFFLINE]?: number
      [ApVenueStatusEnum.OPERATIONAL]?: number
      [ApVenueStatusEnum.REQUIRES_ATTENTION]?: number
      [ApVenueStatusEnum.TRANSIENT_ISSUE]?: number
    },
    totalApCount: number
  },
  network: {
    name: string
    id: string
  }
}

export interface Dashboard {
  summary?: {
    clients?: {
      summary: {
        [prop: string]: number;
      },
      clientDto: Array<{
        [prop: string]: string
      }>,
      totalCount: number;
    },
    switchClients?: {
      summary: {
        [prop: string]: string;
      },
      totalCount: number;
    },
    aps?: {
      summary: {
        [prop: string]: number;
      },
      totalCount: number;
    },
    switches?: {
      summary: {
        [prop: string]: string;
      },
      totalCount: number;
    },
    dps?: {
      summary: {
        [prop: string]: number;
      },
      totalCount: number;
    },
    venues?: {
      summary: {
        [prop: string]: number;
      },
      totalCount: number;
    }
    alarms?: {
      summary: {
        [prop: string]: number;
      },
      totalCount: number
    },
  };
  incidents?: {
    P1: number,
    P2: number,
    P3: number,
    P4: number
  };
  aps?: {
    apsStatus: Array<{
      [prop: string]: {
        apStatus: {
          [ key in ApVenueStatusEnum]?: number
        },
        totalCount: number
      }
    }>,
    totalCount: number
  };
  switches?: {
    switchesStatus: Array<{
      [prop: string]: {
        switchStatus: {
          [ key in SwitchStatusEnum]?: number
        },
        totalCount: number
      }
    }> | undefined,
    totalCount: number
  };
  venues?: Array<{
    [prop: string]: {
      zipCode?: string,
      country?: string,
      city?: string,
      latitude?: number,
      crtTime?: string,
      description?: string,
      type?: string,
      lastUpdTime?: string,
      tags?: string,
      name?: string,
      tenantId?: string,
      street1?: string,
      street2?: string,
      state?: string,
      id?: string,
      longitude?: number,
      timeZone?: string,
      venueStatus?: ApVenueStatusEnum
    }
  }>;
}


interface RadiusService {
  ip: string
  port: number
  sharedSecret: string
}

export interface CloudpathServer {
  id: string
  name: string
  deploymentType: 'Cloud' | 'OnPremise'
  deployedInVenueId?: string
  deployedInVenueName?: string
  authRadius: {
    id: string
    primary: RadiusService
  }
  accountingRadiu?: {
    id: string
    primary: RadiusService
  }
}

export interface Service {
  id: string
  name: string
  type: ServiceType
  status: ServiceStatus
  adminState: ServiceAdminState
  technology: ServiceTechnology
  scope: number
  health: string
  tags: string[]
}
