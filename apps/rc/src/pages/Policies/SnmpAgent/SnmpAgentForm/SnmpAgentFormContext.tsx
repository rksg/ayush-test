import { createContext } from 'react'

import { ApSnmpActionPayload, ApSnmpPolicy, RbacApSnmpPolicy } from '@acx-ui/rc/utils'

import { SnmpAgentFormReducer } from './SnmpAgentFormReducer'


const SnmpAgentFormContext = createContext<{
  state: ApSnmpPolicy | RbacApSnmpPolicy,
  dispatch: React.Dispatch<ApSnmpActionPayload>
}>({
  state: {} as ApSnmpPolicy | RbacApSnmpPolicy,
  dispatch: () => {}
})

export const mainReducer = (
  state: ApSnmpPolicy | RbacApSnmpPolicy,
  action: ApSnmpActionPayload
): ApSnmpPolicy | RbacApSnmpPolicy => {
  return SnmpAgentFormReducer(state, action)
}


export default SnmpAgentFormContext