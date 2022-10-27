import {
  RougeAPDetectionActionPayload,
  RougeAPDetectionActionTypes,
  RougeAPDetectionContextType
} from '@acx-ui/rc/utils'

export const rougeAPDetectionReducer = (
  state: RougeAPDetectionContextType, action: RougeAPDetectionActionPayload
): RougeAPDetectionContextType => {
  switch (action.type) {
    case RougeAPDetectionActionTypes.POLICYNAME:
      return {
        ...state,
        policyName: action.payload.policyName
      }
    case RougeAPDetectionActionTypes.TAGS:
      return {
        ...state,
        tags: action.payload.tags
      }
    case RougeAPDetectionActionTypes.UPDATE_STATE:
      return {
        ...state,
        ...action.payload.state
      }
    case RougeAPDetectionActionTypes.UPDATE_RULE:
      const updateRule = action.payload.rule
      if (updateRule.priority) {
        state.rules[updateRule.priority - 1] = updateRule
      }
      return {
        ...state
      }
    case RougeAPDetectionActionTypes.ADD_RULE:
      if (!state.rules) {
        return {
          ...state,
          rules: [{
            ...action.payload.rule,
            priority: 1
          }]
        }
      }
      return {
        ...state,
        rules: [...state.rules, {
          ...action.payload.rule,
          priority: state.rules.length + 1
        }]
      }
    case RougeAPDetectionActionTypes.DEL_RULE:
      const nRules = state.rules.filter((rule) =>
        rule.name !== action.payload.name
      ).map((rule, i) => {
        return {
          ...rule,
          priority: i + 1
        }
      })
      return {
        ...state,
        rules: nRules
      }
    case RougeAPDetectionActionTypes.MOVE_UP:
      const moveUpIdx = state.rules.findIndex((rule) =>
        rule.name === action.payload.name && rule.priority === action.payload.priority
      )
      if (moveUpIdx - 1 > -1
        && moveUpIdx + 1 === state.rules[moveUpIdx].priority) {
        [state.rules[moveUpIdx], state.rules[moveUpIdx - 1]] = [
          state.rules[moveUpIdx - 1], state.rules[moveUpIdx]
        ]
      }
      return {
        ...state,
        rules: state.rules.map((rule, i) => {
          return {
            ...rule,
            priority: i + 1
          }
        })
      }
    case RougeAPDetectionActionTypes.MOVE_DOWN:
      const moveDownIdx = state.rules.findIndex((rule) =>
        rule.name === action.payload.name && rule.priority === action.payload.priority
      )
      if (moveDownIdx + 1 < state.rules.length
        && moveDownIdx + 1 === state.rules[moveDownIdx].priority) {
        [state.rules[moveDownIdx], state.rules[moveDownIdx + 1]] = [
          state.rules[moveDownIdx + 1], state.rules[moveDownIdx]
        ]
      }
      return {
        ...state,
        rules: state.rules.map((rule, i) => {
          return {
            ...rule,
            priority: i + 1
          }
        })
      }
    case RougeAPDetectionActionTypes.ADD_VENUES:
      if (!state.venues || state.venues.length === 0) {
        return {
          ...state,
          venues: [...action.payload]
        }
      }
      const venueAddIds = state.venues.map(venue => venue.id)
      action.payload.map(venue => {
        if (venueAddIds.findIndex(venueExistId => venueExistId === venue.id) === -1) {
          state.venues.push(venue)
        }
      })
      return {
        ...state
      }
    case RougeAPDetectionActionTypes.REMOVE_VENUES:
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
