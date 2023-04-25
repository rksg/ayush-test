import React, { createContext } from 'react'

import { SyslogActionPayload, SyslogContextType } from '@acx-ui/rc/utils'

import { migrationReducer } from './MigrationReducer'

const MigrationContext = createContext<{
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
  return migrationReducer(state, action)
}

export default MigrationContext
