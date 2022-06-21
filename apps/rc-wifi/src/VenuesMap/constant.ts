enum DeviceStatusSeverityEnum {
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

export type ApVenueStatusEnumType = DeviceStatusSeverityEnum
export const ApVenueStatusEnum = { ...DeviceStatusSeverityEnum }

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
          [ApVenueStatusEnum.IN_SETUP_PHASE]?: number,
          [ApVenueStatusEnum.OFFLINE]?: number,
          [ApVenueStatusEnum.REQUIRES_ATTENTION]?: number,
          [ApVenueStatusEnum.TRANSIENT_ISSUE]?: number,
          [ApVenueStatusEnum.OPERATIONAL]?: number,
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
