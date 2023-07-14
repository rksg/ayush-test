import React, { createContext } from 'react'

import { RogueAPDetectionActionPayload, RogueAPDetectionContextType } from '@acx-ui/rc/utils'

import { rogueAPDetectionReducer } from './RogueAPDetectionReducer'

const RogueAPDetectionContext = createContext<{
  state: RogueAPDetectionContextType,
  dispatch: React.Dispatch<RogueAPDetectionActionPayload>
}>({
  state: {} as RogueAPDetectionContextType,
  dispatch: () => {}
})

export const mainReducer = (
  state: RogueAPDetectionContextType,
  action: RogueAPDetectionActionPayload
): RogueAPDetectionContextType => {
  return rogueAPDetectionReducer(state, action)
}

export default RogueAPDetectionContext

// {
//   "venues": [
//   {
//     "id": "f99c033fbe494093839114eb03efacd6",
//     "name": "My-Venue"
//   }
// ],
//   "name": "aaa",
//   "rules": [
//   {
//     "name": "aaaRule",
//     "type": "AdhocRule",
//     "classification": "Malicious",
//     "priority": 1
//   }
// ],
//   "description": ""
// }
