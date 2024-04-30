import React, { createContext } from 'react'

import { SyslogActionPayload, SyslogContextType } from '@acx-ui/rc/utils'

import { syslogReducer } from './SyslogReducer'

const SyslogContext = createContext<{
  state: SyslogContextType,
  dispatch: React.Dispatch<SyslogActionPayload>
}>({
  state: {} as SyslogContextType,
  dispatch: () => {}
})

export const mainReducer = (
  state: SyslogContextType,
  action: SyslogActionPayload
): SyslogContextType => {
  return syslogReducer(state, action)
}

export default SyslogContext
