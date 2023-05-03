import {
  MigrationActionPayload,
  MigrationActionTypes,
  MigrationContextType
} from '@acx-ui/rc/utils'

import { migrationReducer } from './MigrationReducer'

describe('MigrationReducer test', () => {
  it('should update the policy name when POLICYNAME action is dispatched', () => {
    const initState = {} as MigrationContextType

    const action = {
      type: MigrationActionTypes.POLICYNAME,
      payload: {
        policyName: 'policyNameId1'
      }
    }

    const updatedState = migrationReducer(initState, action as MigrationActionPayload)

    expect(updatedState).toEqual({
      ...initState,
      policyName: 'policyNameId1'
    })
  })
  it('should update the secondary server when SECONDARYSERVER action is dispatched', () => {
    const initState = {} as MigrationContextType

    const action = {
      type: MigrationActionTypes.SECONDARYSERVER,
      payload: {
        secondaryServer: '2.2.2.2'
      }
    }

    const updatedState = migrationReducer(initState, action as MigrationActionPayload)

    expect(updatedState).toEqual({
      ...initState,
      secondaryServer: '2.2.2.2'
    })
  })
  it('do nothing when undefined action is dispatched', () => {
    const initState = {} as MigrationContextType

    const action = {
      type: 'undefined',
      payload: {
        server: 'server1'
      }
    }

    const updatedState = migrationReducer(initState, action as MigrationActionPayload)

    expect(updatedState).toEqual({
      ...initState
    })
  })
})
