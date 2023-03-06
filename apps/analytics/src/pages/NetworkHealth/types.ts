import { TypedUseMutationResult } from '@reduxjs/toolkit/dist/query/react'
import _                          from 'lodash'

import { NetworkHealthBaseQuery } from '@acx-ui/analytics/services'
import { APListNode, PathNode }   from '@acx-ui/utils'

type UUID = string

export type TestStage = 'auth'
  | 'assoc'
  | 'eap'
  | 'radius'
  | 'dhcp'
  | 'userAuth'
  | 'dns'
  | 'ping'
  | 'traceroute'
  | 'speedTest'

export enum AuthenticationMethod {
  WPA2_PERSONAL = 'WPA2_PERSONAL',
  WPA3_PERSONAL = 'WPA3_PERSONAL',
  WPA2_WPA3_PERSONAL = 'WPA2_WPA3_PERSONAL',
  WPA2_ENTERPRISE = 'WPA2_ENTERPRISE',
  OPEN_AUTH = 'OPEN_AUTH'
}

export type APListNodes = [...PathNode[], APListNode]
export type NetworkNodes = PathNode[]
export type NetworkPaths = Array<APListNodes| NetworkNodes>

export function isAPListNodes (path: APListNodes | NetworkNodes): path is APListNodes {
  const last = path[path.length - 1]
  return _.has(last, 'list')
}

export function isNetworkNodes (path: APListNodes | NetworkNodes): path is NetworkNodes {
  const last = path[path.length - 1]
  return !_.has(last, 'list')
}

export enum ClientType {
  VirtualClient = 'virtual-client',
  VirtualWirelessClient = 'virtual-wireless-client'
}

export enum TestType {
  OnDemand = 'on-demand',
  Scheduled = 'scheduled'
}

export enum Band {
  Band2_4 = '2.4',
  Band5 = '5',
  Band6 = '6',
}

type Schedule = {
  nextExecutionTime: string // timestamp
}

export type NetworkHealthSpec = {
  id: UUID
  name: string
  type: TestType
  apsCount: number
  userId: string,
  clientType: ClientType
  configs: NetworkHealthConfig[]
  tests: { items: NetworkHealthTest[] }
  schedule: Schedule | null
}

export type NetworkHealthConfig = {
  id: string
  specId: string
  radio: Band
  authenticationMethod: string
  wlanName: string
  networkPaths: { networkNodes: NetworkPaths }
  wlanUsername?: string
  wlanPassword?: string
  pingAddress?: string
  dnsServer?: string
  tracerouteAddress?: string
  speedTestEnabled?: boolean
  updatedAt: string // timestamp
  createdAt: string // timestamp
}

export type WlanAuthSettings = {
  authType?: string
  authentication?: string
  wpaEncryption?: string
  wpaVersion?: string
}

export type NetworkHealthTest = {
  id: number
  createdAt: string // timestamp
  spec: NetworkHealthSpec,
  config: NetworkHealthConfig,
  summary: {
    apsTestedCount: number
    apsPendingCount: number
    apsSuccessCount: number
    apsFailureCount?: number
    apsErrorCount?: number
  } & Record<string, number|string>
  previousTest: NetworkHealthTest
  wlanAuthSettings: WlanAuthSettings
}
export type UserErrors = {
  field: string
  message: string
}

export type NetworkHealthFormDto = {
  id?: NetworkHealthSpec['id']
  isDnsServerCustom: boolean
} & Pick<NetworkHealthSpec, 'name' | 'type' | 'clientType'>
  & Pick<NetworkHealthConfig, 'radio'
    | 'wlanName'
    | 'authenticationMethod'
    | 'wlanPassword'
    | 'wlanUsername'
    | 'speedTestEnabled'
    | 'dnsServer'
    | 'pingAddress'
    | 'tracerouteAddress'
    | 'networkPaths'
  >

export type MutationUserError = {
  field: string
  message: string
}

export type MutationResult <Result> = {
  userErrors: MutationUserError[]
} & Result

export type TestResultByAP = {
    apName:string
    apMac:string
    auth: string
    assoc: string
    eap: string
    radius: string
    dhcp: string
    userAuth: string
    dns: string
    ping: string
    traceroute: string
    speedTest: string
    pingReceive: string | null
    pingTotal: string | null
    avgPingTime: string | null
    error: string
    speedTestFailure: string
    speedTestServer: string | null
    download: string | null
    upload: string | null
    tracerouteLog: string | null
    state: string
    stationAp: { name : string, mac : string, snr : number }
    clients : { failure : ClientFailure } []
}

export type ClientFailure = {
    failedMsgId: string | null
    messageIds: string | null
    ssid: string | null
    radio: string | null
    reason: string | null
    failureType: string | null
}
export type NetworkHealthTestResults = {
  spec: NetworkHealthSpec
  config: NetworkHealthConfig
  wlanAuthSettings: WlanAuthSettings
  aps: { items : TestResultByAP[], total : number }
}
export type Pagination = {
  page: number,
  pageSize: number,
  defaultPageSize: number,
  total: number
}
export type MutationResponse <
  Result extends { userErrors?: MutationUserError[] } = { userErrors?: MutationUserError[] }
> = TypedUseMutationResult<Result, { id?: string }, NetworkHealthBaseQuery>
