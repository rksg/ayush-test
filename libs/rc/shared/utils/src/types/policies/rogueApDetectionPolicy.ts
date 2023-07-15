import { ApDeviceStatusEnum } from '../../constants'

export interface RogueAPDetectionContextType {
  policyName: string,
  name?: string,
  tags: string[],
  description: string,
  rules: RogueAPRule[],
  venues: RogueVenue[]
}

export interface RogueAPDetailContextType {
  filtersId: string[],
  policyName: string,
  setFiltersId: (filtersId: string[]) => void
  setPolicyName: (policyName: string) => void
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
    description?: string,
    venues: RogueVenue[],
    rules: RogueAPRule[]
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
  activate?: boolean,
  rogueAps?: number
}

export interface EnhancedRoguePolicyType {
  id: string,
  name: string,
  tenantId: string,
  numOfRules: number,
  venueIds: string[]
}

export interface RogueAPRule {
  name: string,
  priority?: number,
  type: RogueRuleType,
  classification: RogueCategory,
  moreInfo?: number | string
}

export interface RogueVenue {
  id: string,
  name: string
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
  MAC_SPOOFING_RULE = 'MacSpoofingRule',
  NULL_SSID_RULE = 'NullSSIDRule',
  RTS_ABUSE_RULE = 'RTSAbuseRule',
  SAME_NETWORK_RULE = 'SameNetworkRule',
  SSID_RULE = 'SsidRule',
  SSID_SPOOFING_RULE = 'SsidSpoofingRule',
  CUSTOM_SNR_RULE = 'CustomSnrRule',
  CUSTOM_SSID_RULE = 'CustomSsidRule',
  CUSTOM_MAC_OUI_RULE = 'CustomMacOuiRule'
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
  DRAG_AND_DROP = 'DRAG_AND_DROP',
  ADD_VENUES = 'ADD_VENUES',
  REMOVE_VENUES = 'REMOVE_VENUES'
}

export enum RogueDeviceCategory {
  Malicious = 'Malicious',
  Ignored = 'Ignored',
  Unclassified = 'Unclassified',
  Known = 'Known'
}

export type RogueAPDetectionActionPayload = {
  type: RogueAPDetectionActionTypes.POLICYNAME,
  payload: {
    policyName: string
  }
} | {
  type: RogueAPDetectionActionTypes.DESCRIPTION,
  payload: {
    description: string
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
    name: string[]
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
} | {
  type: RogueAPDetectionActionTypes.DRAG_AND_DROP,
  payload: {
    oldIndex: number,
    newIndex: number
  }
}

export enum RogueApConstant {
  DefaultProfile = 'Default profile'
}
