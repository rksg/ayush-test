import {
  SyslogActionTypes,
  SyslogActionPayload,
  SyslogContextType
} from '@acx-ui/rc/utils'

export const syslogReducer = (
  state: SyslogContextType, action: SyslogActionPayload
): SyslogContextType => {
  switch (action.type) {
    case SyslogActionTypes.POLICYNAME:
      return {
        ...state,
        policyName: action.payload.policyName
      }
    case SyslogActionTypes.SERVER:
      return {
        ...state,
        server: action.payload.server
      }
    case SyslogActionTypes.PORT:
      return {
        ...state,
        port: action.payload.port
      }
    case SyslogActionTypes.PROTOCOL:
      return {
        ...state,
        protocol: action.payload.protocol
      }
    case SyslogActionTypes.SECONDARYSERVER:
      return {
        ...state,
        secondaryServer: action.payload.secondaryServer
      }
    case SyslogActionTypes.SECONDARYPORT:
      return {
        ...state,
        secondaryPort: action.payload.secondaryPort
      }
    case SyslogActionTypes.SECONDARYPROTOCOL:
      return {
        ...state,
        secondaryProtocol: action.payload.secondaryProtocol
      }
    case SyslogActionTypes.FACILITY:
      return {
        ...state,
        facility: action.payload.facility
      }
    case SyslogActionTypes.PRIORITY:
      return {
        ...state,
        priority: action.payload.priority
      }
    case SyslogActionTypes.FLOWLEVEL:
      return {
        ...state,
        flowLevel: action.payload.flowLevel
      }
    case SyslogActionTypes.UPDATE_STATE:
      return {
        ...state,
        ...action.payload.state
      }
    case SyslogActionTypes.ADD_VENUES:
      if (!state.venues || state.venues.length === 0) {
        return {
          ...state,
          venues: [...action.payload]
        }
      }
      const venueAddIds = state.venues.map(venue => venue.id)
      const updateVenues = [...state.venues]
      action.payload.map(venue => {
        if (venueAddIds.findIndex(venueExistId => venueExistId === venue.id) === -1) {
          updateVenues.push(venue)
        }
      })
      return {
        ...state,
        venues: updateVenues
      }
    case SyslogActionTypes.REMOVE_VENUES:
      const venueRemoveIds = action.payload.map(venue => venue.id)
      return {
        ...state,
        venues: state.venues.filter(venue =>
          venueRemoveIds.findIndex(removeIds => venue.id === removeIds) === -1
        )
      }
    default:
      return state
  }
}
