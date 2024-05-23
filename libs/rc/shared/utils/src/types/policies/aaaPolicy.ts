import { RadiusServer } from '../../models/RadiusServer'
export interface AAAPolicyType{
  id?: string,
  name: string,
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
export interface AAAViewModalType {
  id?: string,
  name: string,
  primary: string, // Primary server IP:Port
  secondary?: string, // Secondary server IP:Port
  type: 'ACCOUNTING' | 'AUTHENTICATION',
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
export interface AAARbacViewModalType {
  id?: string,
  name: string,
  primary: string, // Primary server IP:Port
  secondary?: string, // Secondary server IP:Port
  type: 'ACCOUNTING' | 'AUTHENTICATION',
  wifiNetworkIds?: string[]
}
