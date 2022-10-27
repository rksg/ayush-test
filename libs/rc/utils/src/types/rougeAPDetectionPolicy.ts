
export interface RougeAPDetectionContextType {
  policyName: string,
  tags: string[],
  description: string,
  rules: RougeAPRule[],
  venues: RougeVenue[]
}

export interface RougeAPDetectionRuleTempType {
  id: string,
  name: string,
  rules: RougeAPRule[]
}

export interface RougeAPDetectionTempType {
  totalCount: 1,
  page: 1,
  data: {
    id: string,
    name: string,
    activeVenues: RougeVenue[],
    numOfRules: number
  }[]
}

export interface RougeAPRule {
  name: string,
  priority?: number,
  type: RougeRuleType,
  classification: RougeCategory
}

export interface RougeVenue {
  id: string,
  name: string
}

export interface RougeVenueData {
  id: string,
  venue: string,
  aps: number,
  switches: number,
  rougeDetection: string,
  activate: React.ReactElement
}

export enum RougeCategory {
  MALICIOUS = 'Malicious',
  IGNORED = 'Ignored',
  KNOWN = 'Known',
  UNCLASSIFIED = 'Unclassified'
}

export enum RougeRuleType {
  AD_HOC_RULE = 'AdhocRule',
  CTS_ABUSE_RULE = 'CtsabuseRule',
  DEAUTH_FLOOD_RULE = 'DeauthfloodRule',
  DISASSOC_FLOOD_RULE = 'DisassocfloodRule',
  EXCESSIVE_POWER_RULE = 'ExcessivepowerRule',
  LOW_SNR_RULE = 'LowsnrRule',
  MAC_OUI_RULE = 'MacouiRule',
  MAC_SPOOFING_RULE = 'MacspoofingRule',
  NULL_SSID_RULE = 'NullssidRule',
  RTS_ABUSE_RULE = 'RtsabuseRule',
  SAME_NETWORK_RULE = 'SamenetworkRule',
  SSID_RULE = 'SsidRule',
  SSID_SPOOFING_RULE = 'SsidspoofingRule'
}

export enum RougeAPDetectionActionTypes {
  POLICYNAME = 'POLICYNAME',
  DESCRIPTION = 'DESCRIPTION',
  TAGS = 'TAGS',
  UPDATE_STATE = 'UPDATE_STATE',
  ADD_RULE = 'ADD_RULE',
  UPDATE_RULE = 'UPDATE_RULE',
  DEL_RULE = 'DEL_RULE',
  MOVE_UP = 'MOVE_UP',
  MOVE_DOWN = 'MOVE_DOWN',
  ADD_VENUES = 'ADD_VENUES',
  REMOVE_VENUES = 'REMOVE_VENUES'
}

export type RougeAPDetectionActionPayload = {
  type: RougeAPDetectionActionTypes.POLICYNAME,
  payload: {
    policyName: string
  }
} | {
  type: RougeAPDetectionActionTypes.TAGS,
  payload: {
    tags: string[]
  }
} | {
  type: RougeAPDetectionActionTypes.UPDATE_STATE,
  payload: {
    state: RougeAPDetectionContextType
  }
} | {
  type: RougeAPDetectionActionTypes.ADD_RULE,
  payload: {
    rule: RougeAPRule
  }
} | {
  type: RougeAPDetectionActionTypes.UPDATE_RULE,
  payload: {
    rule: RougeAPRule
  }
} | {
  type: RougeAPDetectionActionTypes.DEL_RULE,
  payload: {
    name: string
  }
} | {
  type: RougeAPDetectionActionTypes.MOVE_UP,
  payload: {
    name: string,
    priority?: number
  }
} | {
  type: RougeAPDetectionActionTypes.MOVE_DOWN,
  payload: {
    name: string,
    priority?: number
  }
} | {
  type: RougeAPDetectionActionTypes.ADD_VENUES,
  payload: {
    name: string,
    id: string
  }[]
} | {
  type: RougeAPDetectionActionTypes.REMOVE_VENUES,
  payload: {
    name: string,
    id: string
  }[]
}
