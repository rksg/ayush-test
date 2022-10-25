import React from 'react'

import { QosPriorityEnum } from '../constants'

export interface WifiCallingScope {
  id: string,
  networkName: string,
  type: string,
  venues: number,
  activate?: React.ReactElement
  voiceQualityScore?: string
  serviceHealth?: React.ReactElement
}

export interface WifiCallingFormContextType {
  serviceName: string
  tags: string[]
  description?: string
  qosPriority: QosPriorityEnum
  ePDG: EPDG[],
  networkIds: string[]
  networksName: string[],
  epdgs?: EPDG[]
}

export interface EPDG {
  name?: string
  domain: string
  ip: string
}

export enum WifiCallingActionTypes {
  SERVICENAME = 'SERVICENAME',
  DESCRIPTION = 'DESCRIPTION',
  QOSPRIORITY = 'QOSPRIORITY',
  TAGS = 'TAGS',
  ADD_EPDG = 'ADD_EPDG',
  UPDATE_EPDG = 'UPDATE_EPDG',
  DELETE_EPDG = 'DELETE_EPDG',
  UPDATE_ENTIRE_EPDG = 'UPDATE_ENTIRE_EPDG',
  ADD_NETWORK_ID = 'ADD_NETWORK_ID',
  DELETE_NETWORK_ID = 'DELETE_NETWORK_ID',
  UPDATE_STATE = 'UPDATE_STATE'
}

export type WifiCallingActionPayload = {
  type: WifiCallingActionTypes.ADD_EPDG,
  payload: {
    domain: string,
    ip: string
  }
} | {
  type: WifiCallingActionTypes.UPDATE_EPDG,
  payload: {
    domain: string,
    ip: string,
    id: number
  }
} | {
  type: WifiCallingActionTypes.UPDATE_ENTIRE_EPDG,
  payload: {
    domain: string,
    ip: string
  }[]
} | {
  type: WifiCallingActionTypes.DELETE_EPDG,
  payload: {
    id: number
  }
} | {
  type: WifiCallingActionTypes.SERVICENAME,
  payload: {
    serviceName: string
  }
} | {
  type: WifiCallingActionTypes.DESCRIPTION,
  payload: {
    description: string
  }
} | {
  type: WifiCallingActionTypes.QOSPRIORITY,
  payload: {
    qosPriority: QosPriorityEnum
  }
} | {
  type: WifiCallingActionTypes.TAGS,
  payload: {
    tags: string[]
  }
} | {
  type: WifiCallingActionTypes.ADD_NETWORK_ID,
  payload: {
    networkIds: string[],
    networksName: string[]
  }
} | {
  type: WifiCallingActionTypes.DELETE_NETWORK_ID,
  payload: {
    networkIds: string[]
  }
} | {
  type: WifiCallingActionTypes.UPDATE_STATE,
  payload: {
    state: WifiCallingFormContextType
  }
}
