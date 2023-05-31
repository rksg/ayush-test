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
    case MigrationActionTypes.VENUENAME:
      return {
        ...state,
        venueName: action.payload.venueName
      }
    case MigrationActionTypes.DESCRIPTION:
      return {
        ...state,
        description: action.payload.description
      }
    case MigrationActionTypes.ADDRESS:
      return {
        ...state,
        address: action.payload.address
      }
    case MigrationActionTypes.ERRORMSG:
      return {
        ...state,
        errorMsg: action.payload.errorMsg
      }
    default:
      return state
  }
}
