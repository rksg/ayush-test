import React, { createContext } from 'react'

import { WifiCallingActionPayload, WifiCallingFormContextType } from '@acx-ui/rc/utils'

import { wifiCallingFormReducer } from './WifiCallingFormReducer'

const WifiCallingFormContext = createContext<{
  state: WifiCallingFormContextType,
  dispatch: React.Dispatch<WifiCallingActionPayload>
}>({
  state: {} as WifiCallingFormContextType,
  dispatch: () => {}
})

export const mainReducer = (
  state: WifiCallingFormContextType,
  action: WifiCallingActionPayload
): WifiCallingFormContextType => {
  return wifiCallingFormReducer(state, action)
}

export default WifiCallingFormContext
