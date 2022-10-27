import React, { createContext } from 'react'

import { RougeAPDetectionActionPayload, RougeAPDetectionContextType } from '@acx-ui/rc/utils'

import { rougeAPDetectionReducer } from './RougeAPDetectionReducer'

const RougeAPDetectionContext = createContext<{
  state: RougeAPDetectionContextType,
  dispatch: React.Dispatch<RougeAPDetectionActionPayload>
}>({
  state: {} as RougeAPDetectionContextType,
  dispatch: () => {}
})

export const mainReducer = (
  state: RougeAPDetectionContextType,
  action: RougeAPDetectionActionPayload
): RougeAPDetectionContextType => {
  return rougeAPDetectionReducer(state, action)
}

export default RougeAPDetectionContext

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
