import { Address } from './venue'

export interface MigrationContextType {
  file?: Blob,
  venueName: string,
  description: string,
  address?: Address,
  errorMsg?: string
}

export enum MigrationActionTypes {
  UPLOADFILE = 'UPLOADFILE',
  VENUENAME = 'VENUENAME',
  DESCRIPTION = 'DESCRIPTION',
  ADDRESS = 'ADDRESS',
  ERRORMSG = 'ERRORMSG'
}

export type MigrationActionPayload = {
  type: MigrationActionTypes.UPLOADFILE,
  payload: {
    file: Blob
  }
} | {
  type: MigrationActionTypes.VENUENAME,
  payload: {
    venueName: string
  }
} | {
  type: MigrationActionTypes.DESCRIPTION,
  payload: {
    description: string
  }
} | {
  type: MigrationActionTypes.ADDRESS,
  payload: {
    address: Address
  }
} | {
  type: MigrationActionTypes.ERRORMSG,
  payload: {
    errorMsg: string
  }
}

export interface MigrateState {
  id?: string;
  name: string;
  state?: string;
  startTime?: string;
  endTime?: string;
  summary?: string;
}

export interface ValidationState {
  name: string;
  description?: string;
  serialNumber: string;
  status?: string;
  failure?: string;
}

export interface ErrorType {
  details: string[];
  errorMessage: string;
  requestId: string;
  status: number;
}

export interface ValidationErrorType {
  data: ErrorType;
  status: number;
}

export interface MigrationResultType {
  serial: string,
  apName?: string,
  apMac?: string,
  model? : string,
  description?: string,
  state: string,
  validationErrors?: string
}

export interface TaskContextType {
  taskId: string,
  createTime: number,
  completedTime?: number,
  state: string,
  errorMessage?: string,
  tenantId: string,
  fileName: string,
  venueName?: string,
  description?: string,
  countryCode?: string,
  error?: ValidationErrorType
  apImportResults: MigrationResultType[]
}

export interface MigrationTaskType {
  taskId: string,
  createTime: number,
  completedTime?: number,
  state: string,
  tenantId: string,
  fileName: string,
  venueName?: string,
  description?: string,
  error?: ValidationErrorType
  apImportResultList: MigrationResultType[]
}

export interface ZdConfigurationType {
  data?: { migrationTaskList: MigrationTaskType[] }[]
}
