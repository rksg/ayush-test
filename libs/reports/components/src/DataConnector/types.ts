import { MessageDescriptor } from 'react-intl'

export type Response <T> = { data: T }

export type DataQuotaUsage = {
    used: number
    allowed: number
}

export enum AzureConnectionType {
  Blob = 'azureBlob',
  Files = 'azureFiles'
}

export type AzureStoragePayload = {
  azureConnectionType: AzureConnectionType,
  azureAccountName: string,
  azureAccountKey: string,
  azureShareName: string,
  azureContainerName: string
}

type FTPStoragePayload = {
  ftpHost: string,
  ftpPort: string,
  ftpUserName: string,
  ftpPassword: string
}

type SFTPStoragePayload = {
  sftpHost: string,
  sftpPort: string,
  sftpUserName: string,
  sftpPassword: string,
  sftpPrivateKey: string
}

export enum ConnectionType {
  Azure = 'azure',
  FTP = 'ftp',
  SFTP = 'sftp'
}

export type StoragePayload = {
  connectionType: ConnectionType,
  id?: string
} & (AzureStoragePayload | FTPStoragePayload | SFTPStoragePayload) & { isEdit: boolean }

export type ConnectorPayload = {
  name: string,
  dataSource: string,
  columns: string[],
  frequency: string,
  userName: string,
  tenantId: string,
  id?: string
  userId: string,
  isEdit: boolean
}

export type StorageData = {
  config: StoragePayload,
  id: string
  isConnected: boolean
  error?: string
}

type DataSource = { name: MessageDescriptor; value: string }
export type DataSources = {
  dataSource: DataSource,
  cols: string[]
} []

export type DataSourceResult = {
  dataSource: string,
  columns: string[]
}
export type DataConnector = Omit<ConnectorPayload, 'id'> & {
  id: string
  status: boolean,
  updatedAt: string
}

export type PatchDataConnector = {
  ids: string[]
  data: Partial<DataConnector>
}

export enum AuditStatusEnum {
  Success = 'success',
  Failure = 'failure',
  InProgress = 'inProgress',
  Scheduled = 'scheduled'
}

export interface AuditDto {
  id: string;
  status: AuditStatusEnum;
  error?: string;
  size: number;
  start: string;
  end: string;
  updatedAt?: string;
}

export interface GetAuditsPayload {
  page: number
  pageSize: number
  filters: {
    dataConnectorId: string
  }
}

export enum Frequency {
  Daily = 'daily'
}

export interface DataConnectorDto {
  id: string
  name: string
  dataSource: string
  columns: string[]
  frequency: Frequency
}
