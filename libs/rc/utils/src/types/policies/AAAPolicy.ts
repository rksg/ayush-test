import { Network } from '..'

export interface AAAPolicyType{
  id?: string,
  profileName: string,
  tags?: string[],
  radiusServer?: AAARadiusServer,
  tacacsServer?: AAATacacsServer,
  networkIds?: string[]
}
export interface AAARadiusServer{
  serverAddress: string,
  authPort: number,
  acctPort: number,
  sharedSecret: string,
  isCloudpath: boolean
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
