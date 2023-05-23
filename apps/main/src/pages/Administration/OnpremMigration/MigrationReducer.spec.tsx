import {
  MigrationActionPayload,
  MigrationActionTypes,
  MigrationContextType
} from '@acx-ui/rc/utils'

import { migrationReducer } from './MigrationReducer'

describe('MigrationReducer test', () => {
  it('should update the name when VENUENAME action is dispatched', () => {
    const initState = {} as MigrationContextType

    const action = {
      type: MigrationActionTypes.VENUENAME,
      payload: {
        venueName: 'nameId1'
      }
    }

    const updatedState = migrationReducer(initState, action as MigrationActionPayload)

    expect(updatedState).toEqual({
      ...initState,
      venueName: 'nameId1'
    })
  })
  it('should update the description when DESCRIPTION action is dispatched', () => {
    const initState = {} as MigrationContextType

    const action = {
      type: MigrationActionTypes.DESCRIPTION,
      payload: {
        description: '2.2.2.2'
      }
    }

    const updatedState = migrationReducer(initState, action as MigrationActionPayload)

    expect(updatedState).toEqual({
      ...initState,
      description: '2.2.2.2'
    })
  })
  it('should update the address when ADDRESS action is dispatched', () => {
    const initState = {} as MigrationContextType

    const action = {
      type: MigrationActionTypes.ADDRESS,
      payload: {
        address: '2.2.2.2'
      }
    }

    const updatedState = migrationReducer(initState, action as MigrationActionPayload)

    expect(updatedState).toEqual({
      ...initState,
      address: '2.2.2.2'
    })
  })

  it('do nothing when undefined action is dispatched', () => {
    const initState = {} as MigrationContextType

    const action = {
      type: 'undefined',
      payload: {
        address: 'address'
      }
    }

    const updatedState = migrationReducer(initState, action as MigrationActionPayload)

    expect(updatedState).toEqual({
      ...initState
    })
  })
})
