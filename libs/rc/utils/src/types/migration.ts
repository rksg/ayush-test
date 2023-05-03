export interface MigrationContextType {
  file?: Blob,
  policyName: string,
  server: string,
  secondaryServer?: string
}

export enum MigrationActionTypes {
  UPLOADFILE = 'UPLOADFILE',
  POLICYNAME = 'POLICYNAME',
  SERVER = 'SERVER',
  SECONDARYSERVER = 'SECONDARYSERVER'
}

export type MigrationActionPayload = {
  type: MigrationActionTypes.UPLOADFILE,
  payload: {
    file: Blob
  }
} | {
  type: MigrationActionTypes.POLICYNAME,
  payload: {
    policyName: string
  }
} | {
  type: MigrationActionTypes.SERVER,
  payload: {
    server: string
  }
} | {
  type: MigrationActionTypes.SECONDARYSERVER,
  payload: {
    secondaryServer: string
  }
}
