import { TypedUseMutationResult } from '@reduxjs/toolkit/dist/query/react'
import _                          from 'lodash'

import { ServiceGuardBaseQuery }       from '@acx-ui/store'
import { FilterListNode, NetworkPath } from '@acx-ui/utils'

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
  OPEN_AUTH = 'OPEN_AUTH',
  WISPR_8021X = 'WISPR_8021X',
  WISPR = 'WISPR',
  WEB_AUTHENTICATION = 'WEB_AUTHENTICATION',
  GUEST_ACCESS = 'GUEST_ACCESS'
}

export type APListNodes = [...NetworkPath, FilterListNode]
export type NetworkNodes = NetworkPath
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

export enum ScheduleFrequency {
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly'
}

export type TestTypeWithSchedule = TestType.OnDemand | ScheduleFrequency

export enum Band {
  Band2_4 = '2.4',
  Band5 = '5',
  Band6 = '6',
}

export type Wlan = {
  id: string
  name: string
  associated: boolean
  ready: boolean
  authMethods: AuthenticationMethod[]
}

export type ServiceGuardSpec = {
  id: UUID
  name: string
  type: TestType
  apsCount: number
  userId: string,
  clientType: ClientType
  schedule: Schedule | null
  configs: ServiceGuardConfig[]
  tests: { items: ServiceGuardTest[] }
}

export type Schedule = {
  type: 'service_guard'
  timezone: string
  frequency: ScheduleFrequency | null
  day: number | null
  hour: number | null
  nextExecutionTime?: string // timestamp
}

export type ServiceGuardConfig = {
  id: string
  specId: string
  radio: Band
  authenticationMethod: AuthenticationMethod
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

export type ServiceGuardFormDto = Pick<ServiceGuardSpec, 'clientType' | 'schedule'> & {
  id?: ServiceGuardSpec['id']
  name?: ServiceGuardSpec['name']
  type?: ServiceGuardSpec['type']
  configs: Array<Partial<ServiceGuardConfig>>
  typeWithSchedule?: TestTypeWithSchedule
  isDnsServerCustom: boolean
}

export type WlanAuthSettings = {
  authType?: string
  authentication?: string
  wpaEncryption?: string
  wpaVersion?: string
}

export type ServiceGuardTest = {
  id: number
  createdAt: string // timestamp
  spec: ServiceGuardSpec,
  config: ServiceGuardConfig,
  summary: {
    apsTestedCount: number
    apsPendingCount: number
    apsSuccessCount: number
    apsFailureCount?: number
    apsErrorCount?: number
  } & Record<string, number|string>
  previousTest: ServiceGuardTest
  wlanAuthSettings: WlanAuthSettings
}
export type UserErrors = {
  field: string
  message: string
}

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
export type ServiceGuardTestResults = {
  spec: ServiceGuardSpec
  config: ServiceGuardConfig
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
> = TypedUseMutationResult<Result, { id?: string }, ServiceGuardBaseQuery>
