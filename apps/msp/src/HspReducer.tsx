import { HspActionPayload, HspActionTypes, HspContextType } from './HspContext'

export const hspReducer = (
  state: HspContextType, action: HspActionPayload
): HspContextType => {
  switch (action.type) {
    case HspActionTypes.IS_HSP:
      return {
        ...state,
        isHsp: action.payload.isHsp
      }
    default:
      return state
  }
}
