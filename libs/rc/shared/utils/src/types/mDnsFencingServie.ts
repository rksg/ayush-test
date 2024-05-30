
export type MdnsFencingWirelessRule = {
  fencingRange: string//'SAME_AP' | 'ONE_HOP_AP'
}

export type MdnsFencingWiredRule = {
  name: string,
  fencingRange: string, //'SAME_AP' | 'ONE_HOP_AP',
  closestApMac: string,
  deviceMacAddresses: string[]
}

export type MdnsFencingService = {
  service: string,
  customServiceName?: string,
  description: string,
  wirelessEnabled: boolean,
  wirelessRule?: MdnsFencingWirelessRule,
  wiredEnabled: boolean,
  wiredRules?: MdnsFencingWiredRule[],
  customMappingEnabled: boolean,
  customStrings?: string[],
  rowId?: string
}

export type VenueMdnsFencingPolicy = {
  enabled: boolean,
  services?: MdnsFencingService[] // for old API
  rules?: MdnsFencingService[] // for rbac API
}

export enum MdnsFencingActionType {
  SERVICE = 'SERVICE',
  CUSTOM_SERVICE_NAME = 'CUSTOM_SERVICE_NAME',
  DESCRIPTION = 'DESCRIPTION',
  WIRELESS_ENABLED = 'WIRELESS_ENABLED',
  WIRELESS_RULE = 'WIRELESS_RULE',
  WIRED_ENABLED = 'WIRED_ENABLED',
  ADD_WIREED_RULE = 'ADD_WIREED_RULE',
  UPDATE_WIREED_RULE = 'UPDATE_WIREED_RULE',
  DELETE_WIREED_RULE = 'DELETE_WIREED_RULE',
  CUSTOM_MAPPING_ENABLED = 'CUSTOM_MAPPING_ENABLED',
  ADD_CUSTOM_STRING = 'ADD_CUSTOM_STRING',
  UPDATE_CUSTOM_STRING = 'UPDATE_SCUSTOM_STRING',
  DELETE_CUSTOM_STRING = 'DELETE_CUSTOM_STRING',
  UPDATE_STATE = 'UPDATE_STATE'
}

export type MdnsFencingActionPayload = {
  type: MdnsFencingActionType.SERVICE,
  payload: {
    service: string
  }
} | {
  type: MdnsFencingActionType.CUSTOM_SERVICE_NAME,
  payload: {
    customServiceName: string
  }
} | {
  type: MdnsFencingActionType.DESCRIPTION,
  payload: {
    description: string
  }
} | {
  type: MdnsFencingActionType.WIRELESS_ENABLED,
  payload: {
    wirelessEnabled: boolean
  }
} | {
  type: MdnsFencingActionType.WIRELESS_RULE,
  payload: MdnsFencingWirelessRule
} | {
  type: MdnsFencingActionType.WIRED_ENABLED,
  payload: {
    wiredEnabled: boolean
  }
} | {
  type: MdnsFencingActionType.ADD_WIREED_RULE,
  payload: MdnsFencingWiredRule
} | {
  type: MdnsFencingActionType.UPDATE_WIREED_RULE,
  payload: MdnsFencingWiredRule
} | {
  type: MdnsFencingActionType.DELETE_WIREED_RULE,
  payload: MdnsFencingWiredRule[]
} | {
  type: MdnsFencingActionType.CUSTOM_MAPPING_ENABLED,
  payload: {
    customMappingEnabled: boolean
  }
} | {
  type: MdnsFencingActionType.ADD_CUSTOM_STRING,
  payload: string
} | {
  type: MdnsFencingActionType.UPDATE_CUSTOM_STRING,
  payload: string
} | {
  type: MdnsFencingActionType.DELETE_CUSTOM_STRING,
  payload: string[]
} | {
  type: MdnsFencingActionType.UPDATE_STATE,
  payload: {
    state: MdnsFencingService
  }
}