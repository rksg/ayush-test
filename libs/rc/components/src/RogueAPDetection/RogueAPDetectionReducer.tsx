import {
  RogueAPDetectionActionPayload,
  RogueAPDetectionActionTypes,
  RogueAPDetectionContextType, RogueAPRule
} from '@acx-ui/rc/utils'

export const rogueAPDetectionReducer = (
  state: RogueAPDetectionContextType, action: RogueAPDetectionActionPayload
): RogueAPDetectionContextType => {
  switch (action.type) {
    case RogueAPDetectionActionTypes.POLICYNAME:
      return {
        ...state,
        policyName: action.payload.policyName
      }
    case RogueAPDetectionActionTypes.DESCRIPTION:
      return {
        ...state,
        description: action.payload.description
      }
    case RogueAPDetectionActionTypes.TAGS:
      return {
        ...state,
        tags: action.payload.tags
      }
    case RogueAPDetectionActionTypes.UPDATE_STATE:
      return {
        ...state,
        ...action.payload.state
      }
    case RogueAPDetectionActionTypes.UPDATE_RULE:
      const updateRule = action.payload.rule
      const updateRules = [...state.rules]
      if (updateRule.priority) {
        const updateIdx = updateRules.findIndex(
          rule => rule.priority === updateRule.priority
        )
        updateRules[updateIdx] = updateRule
      }

      return {
        ...state,
        rules: updateRules
      }
    case RogueAPDetectionActionTypes.UPDATE_ENTIRE_RULE:
      return {
        ...state,
        rules: action.payload.rules
      }
    case RogueAPDetectionActionTypes.ADD_RULE:
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
    case RogueAPDetectionActionTypes.DEL_RULE:
      const nRules = state.rules.filter((rule) =>
        action.payload.name.findIndex(delName => delName === rule.name) === -1
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
    case RogueAPDetectionActionTypes.DRAG_AND_DROP:
      const { oldIndex, newIndex } = action.payload
      const dragAndDropRules = [...state.rules]
        .sort((a, b) => a.priority! - b.priority!) as RogueAPRule[]
      [dragAndDropRules[oldIndex], dragAndDropRules[newIndex]] =
        [dragAndDropRules[newIndex], dragAndDropRules[oldIndex]]
      return {
        ...state,
        rules: dragAndDropRules.map((rule, i) => {
          return {
            ...rule,
            priority: i + 1
          }
        })
      }
    case RogueAPDetectionActionTypes.ADD_VENUES:
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
    case RogueAPDetectionActionTypes.REMOVE_VENUES:
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
