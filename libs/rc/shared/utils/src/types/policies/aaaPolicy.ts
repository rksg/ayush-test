import { RadiusServer } from '../../models/RadiusServer'
export interface AAAPolicyType{
  id?: string,
  name: string,
  tags?: string[],
  primary?: RadiusServer,
  secondary?: RadiusServer,
  type?: 'ACCOUNTING' | 'AUTHENTICATION',
  networkIds?: string[]
}

export interface AAATacacsServer{
  serverAddress: string,
  tacacsPort: number,
  sharedSecret: string,
  purpose: AAAPurposeEnum
}
export interface AAATempType {
  id?: string,
  name: string,
  type?: 'ACCOUNTING' | 'AUTHENTICATION',
  primary?: RadiusServer,
  secondary?: RadiusServer
}
export interface AAAViewModalType {
  id?: string,
  name: string,
  primary?: RadiusServer,
  secondary?: RadiusServer,
  type?: 'ACCOUNTING' | 'AUTHENTICATION',
  networkIds?: string[]
}
export enum AAAPurposeEnum{
  ALL = 'All (Default)',
  AUTHENTICATION = 'Authentication RADIUS Server',
  AUTHORIZATION = 'Authorization',
  ACCOUNTING = 'Accounting RADIUS Server'
}
export interface AAAPolicyNetwork {
  networkId: string,
  networkName: string,
  networkType: string,
  guestNetworkType?: string
}
