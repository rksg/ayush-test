import {
  GuestNetworkTypeEnum,
  WlanSecurityEnum
} from '@acx-ui/rc/utils'

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

export enum ApVenueStatusEnumType {
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
export interface NetworkDetailHeader {
  activeVenueCount: number,
  aps: {
    summary?: {
      [ApVenueStatusEnumType.IN_SETUP_PHASE]?: number
      [ApVenueStatusEnumType.OFFLINE]?: number
      [ApVenueStatusEnumType.OPERATIONAL]?: number
      [ApVenueStatusEnumType.REQUIRES_ATTENTION]?: number
      [ApVenueStatusEnumType.TRANSIENT_ISSUE]?: number
    },
    totalApCount: number
  },
  network: {
    name: string
    id: string
  }
}

export interface DashboardOverview {
  summary?: {
    clients?: {
      summary: {
        [prop: string]: number;
      },
      totalCount: number;
    },
    switchClients?: {
      summary: {
        [prop: string]: number;
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
        [prop: string]: number;
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
      totalCount: number;
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
          [ApVenueStatusEnumType.IN_SETUP_PHASE]?: number
          [ApVenueStatusEnumType.OFFLINE]?: number
          [ApVenueStatusEnumType.REQUIRES_ATTENTION]?: number
          [ApVenueStatusEnumType.TRANSIENT_ISSUE]?: number
          [ApVenueStatusEnumType.OPERATIONAL]?: number
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
          [SwitchStatusEnum.OPERATIONAL]?: number,
        },
        totalCount: number
      }
    }>,
    totalCount: number
  };
  venues?: Array<{
    [prop: string]: {
      zipCode?: string,
      country?: string,
      city?: string,
      latitude?: number,
      crtTime?: any,
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
      venueStatus?: ApVenueStatusEnumType
    }
  }>;
}
