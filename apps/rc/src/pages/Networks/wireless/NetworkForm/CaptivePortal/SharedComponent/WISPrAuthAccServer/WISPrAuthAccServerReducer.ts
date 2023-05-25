import { createContext, useReducer } from 'react'
import { type Dispatch }             from 'react'

import { Form } from 'antd'

export enum WISPrAuthAccServerAction {
    BypassCNAAndAuthChecked,
    OnlyAuthChecked,
    AllAcceptChecked
}

export interface WISPrAuthAccServerState {
    action: WISPrAuthAccServerAction,
    currentValue: {
        BypassCNA: boolean,
        Auth?: string,
        AllAccept: boolean
    },
    isDisabled: {
        BypassCNA: boolean,
        Auth: boolean,
        AllAccept: boolean
      }
}

export const statesCollection = {
  useBypassCNAAndAuth: {
    action: WISPrAuthAccServerAction.BypassCNAAndAuthChecked,
    currentValue: {
      BypassCNA: true,
      Auth: '',
      AllAccept: false
    },
    isDisabled: {
      BypassCNA: false,
      Auth: false,
      AllAccept: true
    }
  },
  useOnlyAuth: {
    action: WISPrAuthAccServerAction.OnlyAuthChecked,
    currentValue: {
      BypassCNA: false,
      AllAccept: false
    },
    isDisabled: {
      BypassCNA: false,
      Auth: false,
      AllAccept: false
    }
  },
  useAllAccept: {
    action: WISPrAuthAccServerAction.AllAcceptChecked,
    currentValue: {
      BypassCNA: false,
      Auth: '',
      AllAccept: true
    },
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

export const useWISPrAuthAccCustomHook = () => {

  const form = Form.useFormInstance()

  // eslint-disable-next-line
  const actionRunner = (currentState: WISPrAuthAccServerState, incomingState: WISPrAuthAccServerState) => {
    if (incomingState.action === WISPrAuthAccServerAction.AllAcceptChecked) {
      form.setFieldValue(['authRadiusId'], '')
      form.setFieldValue(['authRadius'], [])
      form.setFieldValue(['wlan','bypassCPUsingMacAddressAuthentication'], false)
    }
    return incomingState
  }

  return useReducer(actionRunner, statesCollection.useBypassCNAAndAuth)
}

