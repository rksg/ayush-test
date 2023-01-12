import { Network } from '..'
import { Radius }  from '../../models/Radius'
export interface AAAPolicyType{
  id?: string,
  profileName: string,
  tags?: string[],
  radius?: Radius,
  profileType?: string,
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
  name: string
}
export enum AAAPurposeEnum{
  ALL = 'All (Default)',
  AUTHENTICATION = 'Authentication',
  AUTHORIZATION = 'Authorization',
  ACCOUNTING = 'Accounting'
}
export interface AAADetailInstances{
  id?: string,
  network: Network
}
