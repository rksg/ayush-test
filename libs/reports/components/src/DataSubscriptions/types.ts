export type Response <T> = { data: T }

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
