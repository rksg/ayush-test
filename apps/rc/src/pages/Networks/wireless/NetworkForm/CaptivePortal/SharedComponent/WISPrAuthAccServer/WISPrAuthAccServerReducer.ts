import { createContext } from 'react'
import { type Dispatch } from 'react'

export enum WISPrAuthAccServerAction {
    BypassCNAAndAuthChecked,
    OnlyAuthChecked,
    AllAcceptChecked
}

export interface WISPrAuthAccServerState {
    action: WISPrAuthAccServerAction,
    isDisabled: {
        BypassCNA: boolean,
        Auth: boolean,
        AllAccept: boolean
      }
}

export const statesCollection = {
  useBypassCNAAndAuth: {
    action: WISPrAuthAccServerAction.BypassCNAAndAuthChecked,
    isDisabled: {
      BypassCNA: false,
      Auth: false,
      AllAccept: true
    }
  },
  useOnlyAuth: {
    action: WISPrAuthAccServerAction.OnlyAuthChecked,
    isDisabled: {
      BypassCNA: false,
      Auth: false,
      AllAccept: false
    }
  },
  useAllAccept: {
    action: WISPrAuthAccServerAction.AllAcceptChecked,
    isDisabled: {
      BypassCNA: true,
      Auth: true,
      AllAccept: false
    }
  }
}

interface WISPrAuthAccServerContextStore {
  state: WISPrAuthAccServerState
  dispatch: Dispatch<WISPrAuthAccServerState>
}

export const WISPrAuthAccContext = createContext({} as WISPrAuthAccServerContextStore)