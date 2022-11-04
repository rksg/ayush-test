import { ApDeviceStatusEnum } from '../constants'

export interface RogueAPDetectionContextType {
  policyName: string,
  tags: string[],
  description: string,
  rules: RogueAPRule[],
  venues: RogueVenue[]
}

export interface RogueAPDetailContextType {
  filtersId: string[],
  setFiltersId: (filtersId: string[]) => void
}

export interface RogueOldApResponseType {
  rogueMac: string,
  ssid: string,
  numberOfDetectingAps: number,
  locatable: boolean,
  lastUpdTime: string,
  detectingAps: {
    apMac: string,
    apName: string
  }[],
  closestAp: {
    apName: string,
    apSerialNumber: string,
    snr: number
  },
  closestAp_apName?: string,
  closestAp_snr?: number,
  category: string,
  classificationRuleName: string,
  classificationPolicyName: string,
  channel: number,
  band: string,
  model: string
}

export interface RogueAPDetectionTempType {
    id: string,
    name: string,
    venues: RogueVenue[],
    rules: number
}

export interface VenueRoguePolicyType {
  id: string,
  name: string,
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
  activate?: boolean
}

export interface RogueAPRule {
  name: string,
  priority?: number,
  type: RogueRuleType,
  classification: RogueCategory
}

export interface RogueVenue {
  id: string,
  name: string
}

export interface RogueVenueData {
  id: string,
  venue: string,
  aps: number,
  switches: number,
  rogueDetection: string,
  activate: React.ReactElement
}

export enum RogueCategory {
  MALICIOUS = 'Malicious',
  IGNORED = 'Ignored',
  KNOWN = 'Known',
  UNCLASSIFIED = 'Unclassified'
}

export enum RogueRuleType {
  AD_HOC_RULE = 'AdhocRule',
  CTS_ABUSE_RULE = 'CTSAbuseRule',
  DEAUTH_FLOOD_RULE = 'DeauthFloodRule',
  DISASSOC_FLOOD_RULE = 'DisassocFloodRule',
  EXCESSIVE_POWER_RULE = 'ExcessivePowerRule',
  LOW_SNR_RULE = 'LowsnrRule',
  MAC_OUI_RULE = 'MacouiRule',
  MAC_SPOOFING_RULE = 'MacspoofingRule',
  NULL_SSID_RULE = 'NullSSIDRule',
  RTS_ABUSE_RULE = 'RTSAbuseRule',
  SAME_NETWORK_RULE = 'SameNetworkRule',
  SSID_RULE = 'SsidRule',
  SSID_SPOOFING_RULE = 'SsidSpoofingRule'
}

export enum RogueAPDetectionActionTypes {
  POLICYNAME = 'POLICYNAME',
  DESCRIPTION = 'DESCRIPTION',
  TAGS = 'TAGS',
  UPDATE_STATE = 'UPDATE_STATE',
  ADD_RULE = 'ADD_RULE',
  UPDATE_RULE = 'UPDATE_RULE',
  UPDATE_ENTIRE_RULE = 'UPDATE_ENTIRE_RULE',
  DEL_RULE = 'DEL_RULE',
  MOVE_UP = 'MOVE_UP',
  MOVE_DOWN = 'MOVE_DOWN',
  ADD_VENUES = 'ADD_VENUES',
  REMOVE_VENUES = 'REMOVE_VENUES'
}

export type RogueAPDetectionActionPayload = {
  type: RogueAPDetectionActionTypes.POLICYNAME,
  payload: {
    policyName: string
  }
} | {
  type: RogueAPDetectionActionTypes.TAGS,
  payload: {
    tags: string[]
  }
} | {
  type: RogueAPDetectionActionTypes.UPDATE_STATE,
  payload: {
    state: RogueAPDetectionContextType
  }
} | {
  type: RogueAPDetectionActionTypes.ADD_RULE,
  payload: {
    rule: RogueAPRule
  }
} | {
  type: RogueAPDetectionActionTypes.UPDATE_RULE,
  payload: {
    rule: RogueAPRule
  }
} | {
  type: RogueAPDetectionActionTypes.UPDATE_ENTIRE_RULE,
  payload: {
    rules: RogueAPRule[]
  }
} | {
  type: RogueAPDetectionActionTypes.DEL_RULE,
  payload: {
    name: string
  }
} | {
  type: RogueAPDetectionActionTypes.MOVE_UP,
  payload: {
    name: string,
    priority?: number
  }
} | {
  type: RogueAPDetectionActionTypes.MOVE_DOWN,
  payload: {
    name: string,
    priority?: number
  }
} | {
  type: RogueAPDetectionActionTypes.ADD_VENUES,
  payload: {
    name: string,
    id: string
  }[]
} | {
  type: RogueAPDetectionActionTypes.REMOVE_VENUES,
  payload: {
    name: string,
    id: string
  }[]
}
