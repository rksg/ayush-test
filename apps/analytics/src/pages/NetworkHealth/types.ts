import { TypedUseMutationResult } from '@reduxjs/toolkit/dist/query/react'

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

export type NetworkHealthSpec = {
  id: UUID
  name: string
  type: TestType
  clientType: ClientType
  configs: NetworkHealthConfig[]
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
    // TODO:
    // Take `networkPaths` from `NetworkHealthConfig` when APsSelection input available
    // | 'networkPaths'
  >
  // TODO:
  // Temporary handling unable APsSelection widget available
  & { networkPaths: { networkNodes: string } }

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
