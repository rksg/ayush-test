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

export type NetworkHealthSpec = {
  id: UUID
  name: string
  type: TestType
  apsCount: number
  userId: string,
  clientType: ClientType
  schedule: Schedule | null
  configs: NetworkHealthConfig[]
  tests: { items: NetworkHealthTest[] }
}

export type Schedule = {
  type: 'service_guard'
  timezone: string
  frequency: ScheduleFrequency | null
  day: number | null
  hour: number | null
  nextExecutionTime?: string // timestamp
}

export type NetworkHealthConfig = {
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

export type NetworkHealthFormDto = Pick<NetworkHealthSpec, 'clientType' | 'schedule'> & {
  id?: NetworkHealthSpec['id']
  name?: NetworkHealthSpec['name']
  type?: NetworkHealthSpec['type']
  configs: Array<Partial<NetworkHealthConfig>>
  typeWithSchedule?: TestTypeWithSchedule
  isDnsServerCustom: boolean
}

type WlanAuthSettings = {
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

export type MutationUserError = {
  field: string
  message: string
}

export type MutationResult <Result> = {
  userErrors: MutationUserError[]
} & Result

export type MutationResponse <
  Result extends { userErrors?: MutationUserError[] } = { userErrors?: MutationUserError[] }
> = TypedUseMutationResult<Result, { id?: string }, NetworkHealthBaseQuery>
