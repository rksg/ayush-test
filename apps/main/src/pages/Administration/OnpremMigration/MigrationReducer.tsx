import {
  MigrationActionTypes,
  MigrationActionPayload,
  MigrationContextType
} from '@acx-ui/rc/utils'

export const migrationReducer = (
  state: MigrationContextType, action: MigrationActionPayload
): MigrationContextType => {
  switch (action.type) {
    case MigrationActionTypes.UPLOADFILE:
      return {
        ...state,
        file: action.payload.file
      }
    case MigrationActionTypes.POLICYNAME:
      return {
        ...state,
        policyName: action.payload.policyName
      }
    case MigrationActionTypes.SERVER:
      return {
        ...state,
        server: action.payload.server
      }
    case MigrationActionTypes.SECONDARYSERVER:
      return {
        ...state,
        secondaryServer: action.payload.secondaryServer
      }
    default:
      return state
  }
}
