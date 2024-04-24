import { createContext } from 'react'

import { ApSnmpActionPayload, ApSnmpPolicy } from '@acx-ui/rc/utils'

import { SnmpAgentFormReducer } from './SnmpAgentFormReducer'


const SnmpAgentFormContext = createContext<{
  state: ApSnmpPolicy,
  dispatch: React.Dispatch<ApSnmpActionPayload>
}>({
  state: {} as ApSnmpPolicy,
  dispatch: () => {}
})

export const mainReducer = (
  state: ApSnmpPolicy,
  action: ApSnmpActionPayload
): ApSnmpPolicy => {
  return SnmpAgentFormReducer(state, action)
}


export default SnmpAgentFormContext