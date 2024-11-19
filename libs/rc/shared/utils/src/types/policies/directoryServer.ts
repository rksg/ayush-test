import { DirectoryServerProfileEnum, DirectoryServerDiagnosisCommandEnum } from '../../models'

export interface DirectoryServer {
  id: string
  name: string
  tlsEnabled: boolean
  adminDomainName: string
  adminPassword: string
  domainName: string
  host: string
  port: number
  type: DirectoryServerProfileEnum
  keyAttribute?: string
  searchFilter?: string
}

export interface DirectoryServerViewData {
  id: string
  name: string
  domainName: string
  host: string
  port: number
  type: DirectoryServerProfileEnum
  wifiNetworkIds: string[]
}

export interface DirectoryServerDiagnosisCommand {
  action: DirectoryServerDiagnosisCommandEnum
  tlsEnabled: boolean
  adminDomainName: string
  adminPassword: string
  host: string
  port: number
  type: DirectoryServerProfileEnum
}
