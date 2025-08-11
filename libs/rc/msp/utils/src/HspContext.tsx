import React, { createContext } from 'react'

export interface HspContextType {
    isHsp: boolean
  }

export type HspActionPayload = {
    type: HspActionTypes.IS_HSP,
    payload: {
      isHsp: boolean
    }
  }

export enum HspActionTypes {
    IS_HSP = 'IS_HSP'
}
const HspContext = createContext<{
  state: HspContextType,
  dispatch: React.Dispatch<HspActionPayload>
}>({
  state: {} as HspContextType,
  dispatch: () => {}
})

export default HspContext
