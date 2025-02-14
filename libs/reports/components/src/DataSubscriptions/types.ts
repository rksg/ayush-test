export type Response <T> = { data: T }

export type AzureStoragePayload = {
  azureConnectionType: string,
  azureAccountName: string,
  azureAccountKey: string,
  azureShareName: string,
  azureCustomerName: string
}

export type FTPStroagePayload = {
  ftpHost: string,
  ftpPort: string,
  ftpUserName: string,
  ftpPassword: string
}

export type SFTPStoragePayload = {
  sftpHost: string,
  sftpPort: string,
  sftpUserName: string,
  sftpPassword: string,
  sftpPrivateKey: string
}

export type StoragePayload = {
  connectionType: 'azure' | 'ftp' | 'sftp',
  id?: string
} & (AzureStoragePayload | FTPStroagePayload | SFTPStoragePayload) & { isEdit: boolean }

export type SubscriptionPayload = {
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
}

export type DataSubscription = Omit<SubscriptionPayload, 'id'> & {
  id: string
  status: boolean,
  updatedAt: string
}

export type PatchDataSubscriptions = {
  dataSubscriptionIds: string[]
  data: Partial<DataSubscription>
}

export enum AuditStatusEnum {
  Success = 'success',
  Failure = 'failure',
  InProgess = 'inProgress',
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
    dataSubscriptionId: string
  }
}

export enum DataSubscriptionFrequencyEnum {
  Daily = 'daily',
}

export interface DataSubscriptionDto {
  id: string
  name: string
  dataSource: string
  columns: string[]
  frequency: DataSubscriptionFrequencyEnum
}
