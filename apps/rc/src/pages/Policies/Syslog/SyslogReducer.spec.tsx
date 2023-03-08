import {
  SyslogActionPayload,
  SyslogActionTypes,
  SyslogContextType,
  SyslogVenue
} from '@acx-ui/rc/utils'

import { syslogReducer } from './SyslogReducer'

describe('SyslogReducer test', () => {
  it('should update the policy name when POLICYNAME action is dispatched', () => {
    const initState = {} as SyslogContextType

    const action = {
      type: SyslogActionTypes.POLICYNAME,
      payload: {
        policyName: 'policyNameId1'
      }
    }

    const updatedState = syslogReducer(initState, action as SyslogActionPayload)

    expect(updatedState).toEqual({
      ...initState,
      policyName: 'policyNameId1'
    })
  })
  it('should update the server when SERVER action is dispatched', () => {
    const initState = {} as SyslogContextType

    const action = {
      type: SyslogActionTypes.SERVER,
      payload: {
        server: '1.1.1.1'
      }
    }

    const updatedState = syslogReducer(initState, action as SyslogActionPayload)

    expect(updatedState).toEqual({
      ...initState,
      server: '1.1.1.1'
    })
  })
  it('should update the port when PORT action is dispatched', () => {
    const initState = {} as SyslogContextType

    const action = {
      type: SyslogActionTypes.PORT,
      payload: {
        port: 514
      }
    }

    const updatedState = syslogReducer(initState, action as SyslogActionPayload)

    expect(updatedState).toEqual({
      ...initState,
      port: 514
    })
  })
  it('should update the protocol when PROTOCOL action is dispatched', () => {
    const initState = {} as SyslogContextType

    const action = {
      type: SyslogActionTypes.PROTOCOL,
      payload: {
        protocol: 'TCP'
      }
    }

    const updatedState = syslogReducer(initState, action as SyslogActionPayload)

    expect(updatedState).toEqual({
      ...initState,
      protocol: 'TCP'
    })
  })
  it('should update the secondary server when SECONDARYSERVER action is dispatched', () => {
    const initState = {} as SyslogContextType

    const action = {
      type: SyslogActionTypes.SECONDARYSERVER,
      payload: {
        secondaryServer: '2.2.2.2'
      }
    }

    const updatedState = syslogReducer(initState, action as SyslogActionPayload)

    expect(updatedState).toEqual({
      ...initState,
      secondaryServer: '2.2.2.2'
    })
  })
  it('should update the secondary port when SECONDARYPORT action is dispatched', () => {
    const initState = {} as SyslogContextType

    const action = {
      type: SyslogActionTypes.SECONDARYPORT,
      payload: {
        secondaryPort: 1514
      }
    }

    const updatedState = syslogReducer(initState, action as SyslogActionPayload)

    expect(updatedState).toEqual({
      ...initState,
      secondaryPort: 1514
    })
  })
  it('should update the secondary protocol when SECONDARYPROTOCOL action is dispatched', () => {
    const initState = {} as SyslogContextType

    const action = {
      type: SyslogActionTypes.SECONDARYPROTOCOL,
      payload: {
        secondaryProtocol: 'TCP'
      }
    }

    const updatedState = syslogReducer(initState, action as SyslogActionPayload)

    expect(updatedState).toEqual({
      ...initState,
      secondaryProtocol: 'TCP'
    })
  })
  it('should update the facility when FACILITY action is dispatched', () => {
    const initState = {} as SyslogContextType

    const action = {
      type: SyslogActionTypes.FACILITY,
      payload: {
        facility: 'KEEP_ORIGINAL'
      }
    }

    const updatedState = syslogReducer(initState, action as SyslogActionPayload)

    expect(updatedState).toEqual({
      ...initState,
      facility: 'KEEP_ORIGINAL'
    })
  })
  it('should update the priority when PRIORITY action is dispatched', () => {
    const initState = {} as SyslogContextType

    const action = {
      type: SyslogActionTypes.PRIORITY,
      payload: {
        priority: 'INFO'
      }
    }

    const updatedState = syslogReducer(initState, action as SyslogActionPayload)

    expect(updatedState).toEqual({
      ...initState,
      priority: 'INFO'
    })
  })
  it('should update the flowLevel when FLOWLEVEL action is dispatched', () => {
    const initState = {} as SyslogContextType

    const action = {
      type: SyslogActionTypes.FLOWLEVEL,
      payload: {
        flowLevel: 'ALL'
      }
    }

    const updatedState = syslogReducer(initState, action as SyslogActionPayload)

    expect(updatedState).toEqual({
      ...initState,
      flowLevel: 'ALL'
    })
  })
  it('should update the venue when VENUE related action is dispatched', () => {
    const initState = {} as SyslogContextType

    const action = {
      type: SyslogActionTypes.ADD_VENUES,
      payload: [{
        name: 'venueName1',
        id: 'venueId1'
      }]
    }

    const updatedState = syslogReducer(initState, action as SyslogActionPayload)

    expect(updatedState).toEqual({
      ...initState,
      venues: [{
        name: 'venueName1',
        id: 'venueId1'
      }]
    })

    const addAction = {
      type: SyslogActionTypes.ADD_VENUES,
      payload: [{
        name: 'venueName2',
        id: 'venueId2'
      }, {
        name: 'venueName3',
        id: 'venueId3'
      }]
    }

    // eslint-disable-next-line max-len
    const updatedAddVenueState = syslogReducer(updatedState, addAction as SyslogActionPayload)

    expect(updatedAddVenueState).toEqual({
      ...updatedState,
      venues: [{
        name: 'venueName1',
        id: 'venueId1'
      },{
        name: 'venueName2',
        id: 'venueId2'
      }, {
        name: 'venueName3',
        id: 'venueId3'
      }]
    })

    const removeAction = {
      type: SyslogActionTypes.REMOVE_VENUES,
      payload: [{
        name: 'venueName2',
        id: 'venueId2'
      }, {
        name: 'venueName3',
        id: 'venueId3'
      }]
    }

    // eslint-disable-next-line max-len
    const updatedRemoveVenueState = syslogReducer(updatedAddVenueState, removeAction as SyslogActionPayload)

    expect(updatedRemoveVenueState).toEqual({
      venues: [{
        name: 'venueName1',
        id: 'venueId1'
      }]
    })
  })

  it('do nothing when undefined action is dispatched', () => {
    const initState = {} as SyslogContextType

    const action = {
      type: 'undefined',
      payload: {
        server: 'server1'
      }
    }

    const updatedState = syslogReducer(initState, action as SyslogActionPayload)

    expect(updatedState).toEqual({
      ...initState
    })
  })
  it('when UPDATE_STATE action is dispatched', () => {
    const initState = {
      policyName: '',
      server: '1.1.1.1',
      port: 514,
      protocol: 'TCP',
      secondaryServer: '2.2.2.2',
      secondaryPort: 1514,
      secondaryProtocol: 'UDP',
      facility: 'KEEP_ORIGINAL',
      priority: 'ERROR',
      flowLevel: 'ALL',
      venues: [{
        id: '4ca20c8311024ac5956d366f15d96e03',
        name: 'test-venue2'
      }] as SyslogVenue[]
    } as SyslogContextType

    const action = {
      type: SyslogActionTypes.UPDATE_STATE,
      payload: {
        state: {
          policyName: '',
          server: '1.1.1.1',
          port: 514,
          protocol: 'TCP',
          secondaryServer: '2.2.2.2',
          secondaryPort: 1514,
          secondaryProtocol: 'UDP',
          facility: 'KEEP_ORIGINAL',
          priority: 'ERROR',
          flowLevel: 'ALL'
        }
      }
    }

    const updatedState = syslogReducer(initState, action as SyslogActionPayload)

    expect(updatedState).toEqual({
      ...initState
    })
  })
})
