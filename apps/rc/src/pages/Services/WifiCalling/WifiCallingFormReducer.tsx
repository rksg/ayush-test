import { WifiCallingActionPayload, WifiCallingActionTypes, WifiCallingFormContextType } from '@acx-ui/rc/utils'

export const wifiCallingFormReducer = (
  state: WifiCallingFormContextType, action: WifiCallingActionPayload
): WifiCallingFormContextType => {
  switch (action.type) {
    case WifiCallingActionTypes.SERVICENAME:
      return {
        ...state,
        serviceName: action.payload.serviceName
      }
    case WifiCallingActionTypes.DESCRIPTION:
      return {
        ...state,
        description: action.payload.description
      }
    case WifiCallingActionTypes.QOSPRIORITY:
      return {
        ...state,
        qosPriority: action.payload.qosPriority
      }
    case WifiCallingActionTypes.TAGS:
      return {
        ...state,
        tags: action.payload.tags
      }
    case WifiCallingActionTypes.UPDATE_ENTIRE_EPDG:
      return {
        ...state,
        ePDG: action.payload
      }
    case WifiCallingActionTypes.ADD_EPDG:
      if (!state.ePDG) {
        return {
          ...state,
          ePDG: [
            {
              domain: action.payload.domain,
              ip: action.payload.ip
            }
          ]
        }
      }
      return {
        ...state,
        ePDG: [
          ...state.ePDG,
          {
            domain: action.payload.domain,
            ip: action.payload.ip
          }
        ]
      }
    case WifiCallingActionTypes.UPDATE_EPDG:
      return {
        ...state,
        ePDG: state.ePDG.map((value, index) => {
          if (index === action.payload.id) {
            return {
              domain: action.payload.domain,
              ip: action.payload.ip
            }
          }
          return value
        })
      }
    case WifiCallingActionTypes.DELETE_EPDG:
      state.ePDG.splice(action.payload.id, 1)
      return {
        ...state,
        ePDG: [
          ...state.ePDG
        ]
      }
    case WifiCallingActionTypes.ADD_NETWORK_ID:
      action.payload.networkIds.map((networkId, networkIndex) => {
        if (!state.networkIds.includes(networkId)) {
          state.networkIds.push(networkId)
          state.networksName.push(action.payload.networksName[networkIndex])
        }
      })
      return {
        ...state
      }
    case WifiCallingActionTypes.DELETE_NETWORK_ID:
      action.payload.networkIds.map((networkId) => {
        const delIndex = state.networkIds.indexOf(networkId)
        if (delIndex !== -1) {
          state.networkIds.splice(delIndex, 1)
          state.networksName.splice(delIndex, 1)
        }
      })
      return {
        ...state
      }
    case WifiCallingActionTypes.UPDATE_STATE:
      return {
        ...state,
        ...action.payload.state
      }
  }
}
