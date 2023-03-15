import { defineMessage, MessageDescriptor } from 'react-intl'

import { ApDeviceStatusEnum } from '../../constants'
import { FacilityEnum }       from '../../models/FacilityEnum'
import { FlowLevelEnum }      from '../../models/FlowLevelEnum'
import { PriorityEnum }       from '../../models/PriorityEnum'
import { ProtocolEnum }       from '../../models/ProtocolEnum'

export const facilityLabelMapping: Record<FacilityEnum, MessageDescriptor> = {
  [FacilityEnum.KEEP_ORIGINAL]: defineMessage({ defaultMessage: 'Keep Original' }),
  [FacilityEnum.LOCAL0]: defineMessage({ defaultMessage: '0' }),
  [FacilityEnum.LOCAL1]: defineMessage({ defaultMessage: '1' }),
  [FacilityEnum.LOCAL2]: defineMessage({ defaultMessage: '2' }),
  [FacilityEnum.LOCAL3]: defineMessage({ defaultMessage: '3' }),
  [FacilityEnum.LOCAL4]: defineMessage({ defaultMessage: '4' }),
  [FacilityEnum.LOCAL5]: defineMessage({ defaultMessage: '5' }),
  [FacilityEnum.LOCAL6]: defineMessage({ defaultMessage: '6' }),
  [FacilityEnum.LOCAL7]: defineMessage({ defaultMessage: '7' })
}

export const flowLevelLabelMapping: Record<FlowLevelEnum, MessageDescriptor> = {
  [FlowLevelEnum.GENERAL_LOGS]: defineMessage({ defaultMessage: 'General Logs' }),
  [FlowLevelEnum.CLIENT_FLOW]: defineMessage({ defaultMessage: 'Client Flow' }),
  [FlowLevelEnum.ALL]: defineMessage({ defaultMessage: 'All Logs' })
}

export interface SyslogPolicyListType {
  id: string,
  name: string,
  venueIds?: string[],
  facility: FacilityEnum,
  flowLevel: FlowLevelEnum,
  primaryServer?: string,
  secondaryServer?: string
}

export interface SyslogPolicyType {
  policyName: string,
  name: string,
  id?: string,
  server: string,
  port: number,
  facility?: FacilityEnum,
  priority?: PriorityEnum,
  protocol?: ProtocolEnum,
  flowLevel?: FlowLevelEnum,
  secondaryServer?: string,
  secondaryPort?: number,
  secondaryProtocol?: ProtocolEnum,
  venueIds: string[]
}

export interface Server {
  server?: string,
  port?: number,
  protocol?: ProtocolEnum,
}

export interface Venue {
  id: string,
  name: string
}

export interface SyslogPolicyDetailType {
  policyName?: string,
  name: string,
  id?: string,
  primary: Server,
  secondary: Server,
  facility?: FacilityEnum,
  priority?: PriorityEnum,
  flowLevel?: FlowLevelEnum,
  venues: Venue[]
}

export interface SyslogContextType {
  policyName: string,
  server: string,
  port: number,
  protocol: ProtocolEnum,
  secondaryServer?: string,
  secondaryPort?: number,
  secondaryProtocol?: ProtocolEnum,
  facility: FacilityEnum,
  priority: PriorityEnum,
  flowLevel: FlowLevelEnum,
  venues: SyslogVenue[]
}

export interface SyslogVenue {
  id: string,
  name: string
}

export interface SyslogDetailContextType {
  filtersId: string[],
  policyName: string,
  setFiltersId: (filtersId: string[]) => void
  setPolicyName: (policyName: string) => void
}

export interface VenueSyslogSettingType {
  enabled: boolean,
  serviceProfileId: string
}

export interface VenueSyslogPolicyType {
  id?: string,
  name?: string,
  city?: string,
  country?: string,
  switches?: number,
  aggregatedApStatus?: Record<ApDeviceStatusEnum, number>,
  status?: string
  rogueDetection?: {
    policyId: string,
    policyName: string,
    enabled: boolean
  },
  syslogServer?: {
    policyId: string,
    policyName: string,
    enabled: boolean
  },
  activate?: boolean,
  rogueAps?: number
}

export enum SyslogActionTypes {
  POLICYNAME = 'POLICYNAME',
  SERVER = 'SERVER',
  PORT = 'PORT',
  PROTOCOL = 'PROTOCOL',
  SECONDARYSERVER = 'SECONDARYSERVER',
  SECONDARYPORT = 'SECONDARYPORT',
  SECONDARYPROTOCOL = 'SECONDARYPROTOCOL',
  FACILITY = 'FACILITY',
  PRIORITY = 'PRIORITY',
  FLOWLEVEL = 'FLOWLEVEL',
  UPDATE_STATE = 'UPDATE_STATE',
  ADD_VENUES = 'ADD_VENUES',
  REMOVE_VENUES = 'REMOVE_VENUES'
}

export type SyslogActionPayload = {
  type: SyslogActionTypes.POLICYNAME,
  payload: {
    policyName: string
  }
} | {
  type: SyslogActionTypes.SERVER,
  payload: {
    server: string
  }
} | {
  type: SyslogActionTypes.PORT,
  payload: {
    port: number
  }
} | {
  type: SyslogActionTypes.PROTOCOL,
  payload: {
    protocol: ProtocolEnum
  }
} | {
  type: SyslogActionTypes.SECONDARYSERVER,
  payload: {
    secondaryServer: string
  }
} | {
  type: SyslogActionTypes.SECONDARYPORT,
  payload: {
    secondaryPort: number
  }
} | {
  type: SyslogActionTypes.SECONDARYPROTOCOL,
  payload: {
    secondaryProtocol: ProtocolEnum
  }
} | {
  type: SyslogActionTypes.FACILITY,
  payload: {
    facility: FacilityEnum
  }
} | {
  type: SyslogActionTypes.PRIORITY,
  payload: {
    priority: PriorityEnum
  }
} | {
  type: SyslogActionTypes.FLOWLEVEL,
  payload: {
    flowLevel: FlowLevelEnum
  }
} | {
  type: SyslogActionTypes.UPDATE_STATE,
  payload: {
    state: SyslogContextType
  }
} | {
  type: SyslogActionTypes.ADD_VENUES,
  payload: SyslogVenue[]
} | {
  type: SyslogActionTypes.REMOVE_VENUES,
  payload: SyslogVenue[]
}

export enum SyslogConstant {
  DefaultProfile = 'Default profile'
}
