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
  primary?: RadiusServer,
  secondary?: RadiusServer,
  type?: 'ACCOUNTING' | 'AUTHENTICATION'
}
export enum AAAPurposeEnum{
  ALL = 'All (Default)',
  AUTHENTICATION = 'Authentication',
  AUTHORIZATION = 'Authorization',
  ACCOUNTING = 'Accounting'
}
