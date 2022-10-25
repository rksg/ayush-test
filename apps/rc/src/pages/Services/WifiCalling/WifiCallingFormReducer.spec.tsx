import {
  QosPriorityEnum,
  WifiCallingActionPayload,
  WifiCallingActionTypes,
  WifiCallingFormContextType
} from '@acx-ui/rc/utils'

import { wifiCallingFormReducer } from './WifiCallingFormReducer'

describe('WifiCallingFormReducer test', () => {
  it('should update the serviceName data when SERVICENAME action is dispatched', () => {
    const initState = {} as WifiCallingFormContextType

    const action = {
      type: WifiCallingActionTypes.SERVICENAME,
      payload: {
        serviceName: 'wifiCallingServiceId1'
      }
    }

    const updatedState = wifiCallingFormReducer(initState, action as WifiCallingActionPayload)

    expect(updatedState).toEqual({
      ...initState,
      serviceName: 'wifiCallingServiceId1'
    })
  })

  it('should update the description data when DESCRIPTION action is dispatched', () => {
    const initState = {} as WifiCallingFormContextType

    const action = {
      type: WifiCallingActionTypes.DESCRIPTION,
      payload: {
        description: 'description1'
      }
    }

    const updatedState = wifiCallingFormReducer(initState, action as WifiCallingActionPayload)

    expect(updatedState).toEqual({
      ...initState,
      description: 'description1'
    })
  })

  it('should update the qosPriority data when QOSPRIORITY action is dispatched', () => {
    const initState = {} as WifiCallingFormContextType

    const action = {
      type: WifiCallingActionTypes.QOSPRIORITY,
      payload: {
        qosPriority: QosPriorityEnum.WIFICALLING_PRI_VOICE
      }
    }

    const updatedState = wifiCallingFormReducer(initState, action as WifiCallingActionPayload)

    expect(updatedState).toEqual({
      ...initState,
      qosPriority: 'WIFICALLING_PRI_VOICE'
    })
  })

  it('should update the tags data when TAGS action is dispatched', () => {
    const initState = {} as WifiCallingFormContextType

    const action = {
      type: WifiCallingActionTypes.TAGS,
      payload: {
        tags: ['tag1', 'tag2', 'tag3']
      }
    }

    const updatedState = wifiCallingFormReducer(initState, action as WifiCallingActionPayload)

    expect(updatedState).toEqual({
      ...initState,
      tags: ['tag1', 'tag2', 'tag3']
    })
  })

  it('should modify the ePDG data when EPDG action is dispatched', () => {
    const initState = {} as WifiCallingFormContextType

    const action_add = {
      type: WifiCallingActionTypes.ADD_EPDG,
      payload: {
        domain: 'add.domain.com',
        ip: '10.10.10.10'
      }
    }

    const updatedState_add = wifiCallingFormReducer(
      initState, action_add as WifiCallingActionPayload)

    expect(updatedState_add).toEqual({
      ...initState,
      ePDG: [{ domain: 'add.domain.com', ip: '10.10.10.10' }]
    })

    const action_update = {
      type: WifiCallingActionTypes.UPDATE_EPDG,
      payload: {
        id: 0,
        domain: 'update.domain.com',
        ip: '10.10.10.10'
      }
    }

    const updatedState_update = wifiCallingFormReducer(
      updatedState_add, action_update as WifiCallingActionPayload)

    expect(updatedState_update).toEqual({
      ...updatedState_add,
      ePDG: [{ domain: 'update.domain.com', ip: '10.10.10.10' }]
    })

    const action_add_again = {
      type: WifiCallingActionTypes.ADD_EPDG,
      payload: {
        domain: 'add.again.domain.com',
        ip: '10.10.10.10'
      }
    }

    const updatedState_add_again = wifiCallingFormReducer(
      updatedState_update, action_add_again as WifiCallingActionPayload)

    expect(updatedState_add_again).toEqual({
      ...updatedState_update,
      ePDG: [
        { domain: 'update.domain.com', ip: '10.10.10.10' },
        { domain: 'add.again.domain.com', ip: '10.10.10.10' }
      ]
    })


    const action_delete = {
      type: WifiCallingActionTypes.DELETE_EPDG,
      payload: {
        id: 0
      }
    }

    const updatedState_delete = wifiCallingFormReducer(
      updatedState_add_again, action_delete as WifiCallingActionPayload)

    expect(updatedState_delete).toEqual({
      ...updatedState_add_again,
      ePDG: [{ domain: 'add.again.domain.com', ip: '10.10.10.10' }]
    })

    const action_update_entire_epdg = {
      type: WifiCallingActionTypes.UPDATE_ENTIRE_EPDG,
      payload: [{ domain: 'update.entire.epdg.domain.com', ip: '10.10.10.10' }]
    }

    const updatedState_entire_epdg = wifiCallingFormReducer(
      updatedState_delete, action_update_entire_epdg as WifiCallingActionPayload)

    expect(updatedState_entire_epdg).toEqual({
      ...updatedState_entire_epdg,
      ePDG: [{ domain: 'update.entire.epdg.domain.com', ip: '10.10.10.10' }]
    })

    const action_update_wrong_epdg = {
      type: WifiCallingActionTypes.UPDATE_EPDG,
      payload: [{ domain: 'update.entire.epdg.domain.com', ip: '10.10.10.10', id: 999 }]
    }

    const wrong_epdg = wifiCallingFormReducer(
      updatedState_entire_epdg, action_update_wrong_epdg as WifiCallingActionPayload)

    expect(wrong_epdg).toEqual({
      ...updatedState_entire_epdg,
      ePDG: [{ domain: 'update.entire.epdg.domain.com', ip: '10.10.10.10' }]
    })

  })

  it('should update the network data when NETWORK ID action is dispatched', () => {
    const initState = {
      serviceName: '',
      description: '--',
      qosPriority: QosPriorityEnum.WIFICALLING_PRI_VOICE,
      tags: [],
      ePDG: [],
      networkIds: [],
      networksName: []
    } as WifiCallingFormContextType

    const action = {
      type: WifiCallingActionTypes.ADD_NETWORK_ID,
      payload: {
        networkIds: ['nw1', 'nw2', 'nw3'],
        networksName: ['nw1name', 'nw2name', 'nw3name']
      }
    }

    const updatedState = wifiCallingFormReducer(initState, action as WifiCallingActionPayload)

    expect(updatedState).toEqual({
      ...initState,
      networkIds: ['nw1', 'nw2', 'nw3'],
      networksName: ['nw1name', 'nw2name', 'nw3name']
    })

    const action_delete = {
      type: WifiCallingActionTypes.DELETE_NETWORK_ID,
      payload: {
        networkIds: ['nw1']
      }
    }

    const updatedState_delete = wifiCallingFormReducer(
      initState,
      action_delete as WifiCallingActionPayload
    )

    expect(updatedState_delete).toEqual({
      ...updatedState,
      networkIds: ['nw2', 'nw3'],
      networksName: ['nw2name', 'nw3name']
    })

    const action_entire_update = {
      type: WifiCallingActionTypes.UPDATE_STATE,
      payload: {
        state: {
          ...initState,
          networkIds: ['nw1'],
          networksName: ['nw1name']
        }
      }
    }

    const updatedState_entire_update = wifiCallingFormReducer(
      updatedState_delete,
      action_entire_update as WifiCallingActionPayload
    )

    expect(updatedState_entire_update).toEqual({
      ...updatedState_delete,
      networkIds: ['nw1'],
      networksName: ['nw1name']
    })
  })
})
