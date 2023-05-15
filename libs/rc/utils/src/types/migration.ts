export interface MigrationContextType {
  file?: Blob,
  venueName: string,
  description: string,
  address?: string
}

export enum MigrationActionTypes {
  UPLOADFILE = 'UPLOADFILE',
  VENUENAME = 'VENUENAME',
  DESCRIPTION = 'DESCRIPTION',
  ADDRESS = 'ADDRESS'
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
    address: string
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

export interface MigrationResultType {
  name?: string,
  description?: string,
  serial: string,
  state: string,
  failure?: string
}

export interface TaskContextType {
  taskId: string,
  createTime: number,
  state: string,
  tenantId: string,
  fileName: string,
  apImportResults: MigrationResultType[]
}

