import React, { createContext } from 'react'

import { MigrationActionPayload, MigrationContextType } from '@acx-ui/rc/utils'

import { migrationReducer } from './MigrationReducer'

const MigrationContext = createContext<{
  state: MigrationContextType,
  dispatch: React.Dispatch<MigrationActionPayload>
}>({
  state: {} as MigrationContextType,
  dispatch: () => {}
})

export const mainReducer = (
  state: MigrationContextType,
  action: MigrationActionPayload
): MigrationContextType => {
  return migrationReducer(state, action)
}

export default MigrationContext
